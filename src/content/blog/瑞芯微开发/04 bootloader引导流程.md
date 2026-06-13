---
description: "一、RK芯片通用引导流程 对于RK芯片的引导流程，我们可以参考以下这张图： !imghttps://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122126953.jpeg 根据两种Boot Flow，我们可以一次梳理两种不同的引导流程： B"
cover: /img/cover/2.webp

title: bootloader引导流程
date: 2023-09-10 17:17:03
categories:
  - 瑞芯微开发
link: 瑞芯微开发/04 bootloader引导流程
---

# 一、RK芯片通用引导流程

对于RK芯片的引导流程，我们可以参考以下这张图：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122126953.jpeg)

根据两种`Boot Flow`，我们可以一次梳理两种不同的引导流程：

```
Boot Code -> idbloader.img(miniloader) -> uboot.img -> boot.img -> rootfs.img
Boot Code -> idbloader.img(TPL/SPL) -> uboot.itb -> boot.img -> rootfs.img
```

对于`idbloader.img`，我们会发现有相似的地方：

```
ddr.bin <-> u-boot-tpl.bin
rkxx_miniloader_vx.xx.bin <-> u-boot-spl.bin
```

此时我们会问，为什么会有两套引导流程？

事实上`idbloader.img(miniloader)`这套引导方案是RK定制的，它们并没有开源的，RK发布的是二进制文件，它们都存放于`rkbin`目录下，例如`RK356x`：

![image-20230912213741344](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122137381.png)

注意上图中红方框处：rk3588_spl_v1.11.bin`实际上指的是`rkxx_miniloader_vx.xx.bin`！

# 二、RK356x引导流程

下面通过`RK356x`的启动日志进行简要分析！

## 2.1 ddr.bin运行

`RK3588`上电后，我们看到的第一阶段日志是关于DDR的，这主要是对DDR进行初始化，我们看到使用的是`LPDDR4`，频率逐步从`528MHz `切换到`2112MHz`，并且进行一些读写训练操作

~~~shell
DDR Version V1.08 20220617
LPDDR4X, 2112MHz
channel[0] BW=16 Col=10 Bk=8 CS0 Row=16 CS=1 Die BW=16 Size=1024MB
channel[1] BW=16 Col=10 Bk=8 CS0 Row=16 CS=1 Die BW=16 Size=1024MB
channel[2] BW=16 Col=10 Bk=8 CS0 Row=16 CS=1 Die BW=16 Size=1024MB
channel[3] BW=16 Col=10 Bk=8 CS0 Row=16 CS=1 Die BW=16 Size=1024MB
Manufacturer ID:0x1 Samsung
CH0 RX Vref:33.7%, TX Vref:21.8%,0.0%
CH1 RX Vref:32.7%, TX Vref:18.8%,0.0%
CH2 RX Vref:30.7%, TX Vref:17.8%,0.0%
CH3 RX Vref:34.7%, TX Vref:18.8%,0.0%
change to F1: 528MHz
change to F2: 1068MHz
change to F3: 1560MHz
change to F0: 2112MHz
out
~~~

## 2.2 spl.bin运行

​	接下来我们会看到SPL的板级初始化，紧接着逐步从`MMC2`（`SD`卡）、`MMC1`（`eMMC`）寻找`U-boot.img`（包括`atf-1`、`uboot`、`fdt`、`atf-2`、`atf-3`、`atf-4`、`atf-5`、`optee`），通过`atf-1`来运行`uboot`：

~~~
U-Boot SPL board init
U-Boot SPL 2017.09-orangepi (Apr 21 2023 - 10:35:39)
Trying to boot from MMC1
Trying fit image at 0x4000 sector
## Verified-boot: 0
## Checking atf-1 0x00040000 ... sha256(806278dba1...) + OK
## Checking uboot 0x00200000 ... sha256(a14cd96f5d...) + OK
## Checking fdt 0x00349350 ... sha256(cf0060a3cf...) + OK
## Checking atf-2 0x000f0000 ... sha256(c00c7fd75b...) + OK
## Checking atf-3 0xff100000 ... sha256(71c3a5841b...) + OK
## Checking atf-4 0xff001000 ... sha256(2301cf73be...) + OK
Jumping to U-Boot(0x00200000) via ARM Trusted Firmware(0x00040000)
Total: 209.584 ms
~~~

注意`atf-*`与`optee`这些是 `ARM trust` 固件，属于另外一个领域，有兴趣可以参考以下文章：

> https://blog.csdn.net/Neutionwei/article/details/111395775
> https://blog.csdn.net/Neutionwei/article/det

## 2.3 atf运行

运行`BL31`，初始化与运行`BL32`：

~~~

INFO:    Preloader serial: 2
NOTICE:  BL31: v2.3():v2.3-405-gb52c2eadd:derrick.huang
NOTICE:  BL31: Built : 11:23:47, Aug 15 2022
INFO:    spec: 0x13
INFO:    ext 32k is valid
INFO:    GICv3 without legacy support detected.
INFO:    ARM GICv3 driver initialized in EL3
INFO:    system boots from cpu-hwid-0
INFO:    idle_st=0x21fff, pd_st=0x11fff9, repair_st=0xfff70001
INFO:    dfs DDR fsp_params[0].freq_mhz= 2112MHz
INFO:    dfs DDR fsp_params[1].freq_mhz= 528MHz
INFO:    dfs DDR fsp_params[2].freq_mhz= 1068MHz
INFO:    dfs DDR fsp_params[3].freq_mhz= 1560MHz
INFO:    BL31: Initialising Exception Handling Framework
INFO:    BL31: Initializing runtime services
WARNING: No OPTEE provided by BL2 boot loader, Booting device without OPTEE initialization. SMC`s destined for OPTEE will return SMC_UNK
ERROR:   Error initializing runtime service opteed_fast
INFO:    BL31: Preparing for EL3 exit to normal world
INFO:    Entry point address = 0x200000
INFO:    SPSR = 0x3c9
~~~

> 

## 2.4 uboot运行

### 2.4.1 设备环境初始化

从`atf`切换到`uboot`之后，`uboot`依次执行以下操作：

1. 打印一些必要的信息：板型、串口、内存、系统内存初始化、代码重定位情况；
2. 获取`MMC`存储器信息，打印当前启动的存储器（`atags`）；
3. 获取存储器分区情况并加载内核设备树；
4. 初始化`I2C0`、初始化`PMIC`电源芯片、相关芯片供电电压与`IO`电源域；
5. 初始化`DRM`框架以及显示器接口（`HDMI`）;
6. 初始化时钟树。

~~~
U-Boot 2017.09-orangepi (Apr 21 2023 - 10:35:39 +0800)

Model: Orange Pi 5B
PreSerial: 2, raw, 0xfeb50000
DRAM:  3.7 GiB
Sysmem: init
Relocation Offset: eda2d000
Relocation fdt: eb9f9008 - eb9fecb8
CR: M/C/I
Using default environment

mmc@fe2c0000: 0, mmc@fe2e0000: 1
Bootdev(atags): mmc 0
MMC0: Legacy, 52Mhz
PartType: EFI
DM: v2
boot mode: None
Model: Orange Pi 5B
CLK: (sync kernel. arm: enter 1008000 KHz, init 1008000 KHz, kernel 0N/A)
  b0pll 24000 KHz
  b1pll 24000 KHz
  lpll 24000 KHz
  v0pll 24000 KHz
  aupll 24000 KHz
  cpll 1500000 KHz
  gpll 1188000 KHz
  npll 24000 KHz
  ppll 1100000 KHz
  aclk_center_root 702000 KHz
  pclk_center_root 100000 KHz
  hclk_center_root 396000 KHz
  aclk_center_low_root 500000 KHz
  aclk_top_root 750000 KHz
  pclk_top_root 100000 KHz
  aclk_low_top_root 396000 KHz
Net:   No ethernet found.

~~~

### 2.4.2 内核的加载

~~~
switch to partitions #0, OK
mmc0 is current device
mmc@fe2c0000: 0 (SD)
mmc@fe2e0000: 1
switch to partitions #0, OK
mmc0 is current device
Scanning mmc 0:1...
Found U-Boot script /boot.scr
reading /boot.scr
3411 bytes read in 4 ms (832 KiB/s)
## Executing script at 00500000
Boot script loaded from mmc 0
reading /orangepiEnv.txt
222 bytes read in 3 ms (72.3 KiB/s)
reading /uInitrd
18641659 bytes read in 1844 ms (9.6 MiB/s)
reading /Image
34736640 bytes read in 3049 ms (10.9 MiB/s)
reading /dtb/rockchip/rk3588s-orangepi-5b.dtb
233728 bytes read in 24 ms (9.3 MiB/s)
reading /dtb/rockchip/overlay/rk3588-fixup.scr
2756 bytes read in 6 ms (448.2 KiB/s)
Applying kernel provided DT fixup script (rk3588-fixup.scr)
## Executing script at 09000000
Fdt Ramdisk skip relocation
## Loading init Ramdisk from Legacy Image at 0a200000 ...
   Image Name:   uInitrd
   Image Type:   AArch64 Linux RAMDisk Image (gzip compressed)
   Data Size:    18641595 Bytes = 17.8 MiB
   Load Address: 00000000
   Entry Point:  00000000
   Verifying Checksum ... OK
## Flattened Device Tree blob at 0x0a100000
   Booting using the fdt blob at 0x0a100000
   reserving fdt memory region: addr=a100000 size=9f000
  'reserved-memory' ramoops@110000: addr=110000 size=f0000
   Using Device Tree in place at 000000000a100000, end 000000000a1a1fff
Adding bank: 0x00200000 - 0xf0000000 (size: 0xefe00000)
Total: 5283.754 ms

Starting kernel ...
~~~

从`Starting kernel ...`开始，`uboot`的生命周期结束，之后产生的打印是由内核产生的！

值得注意的是，加载`Flat Device Tree`设备树之后，日志还打印了相关映像加载情况，这部分非常有用，我们以后再深入分析！

# 三、BootRom阶段做了什么？

`BootRom`固件是Rockchip原厂芯片出厂时烧录到内部存储器的，目的是从各个外部存储媒介中加载`miniloader`(`tpl` + `spl`)！

以下是摘自《Rockchip RK3568 TRM Part1 V1.1-20210301》，它很清晰地说明了BootRom阶段做了什么事情：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122155809.png)

我们按照正常引导走一遍：

1. 从`0x0000FFFF`地址读取第一条指令运行；
2. 逐一检查与校验`Nor Flash`、`Nand Flash`、`eMMC`、`SD/MMC`中的`ID BLOCK`（RK 固件定义在第 `64` 扇区）；
3. 假如我们的固件存放于`eMMC`，那么校验`ID BLOCK`成功后就读取`DDR`初始化代码到`SYSTEM_SRAM`；
4. 紧接着运行刚刚读取的代码来初始化`DDR`；
5. 初始化`DDR`后`DDR`就可以工作了，把引导代码加载到`DDR`并调到`DDR`继续运行。

如果各个存储器都没有找到`ID BLOCK`，那么会执行以下操作：

1. 等待请求`DDR`程序（即在`RKDevTool`工具可以看到处于`Maskrom`模式）：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122156818.png)

# 四、RK固件在存储器中是如何分布的？

如下图，其中 RK356x和rk3588 是没有使用 `trust`分区，这个要注意：	

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309122156681.png)

另外要注意的是从`loader2`分区开始所有的分区大小与起始地址是由`parameter.txt`文件进行描述，具体参考：

> https://blog.csdn.net/Neutionwei/article/details/122911086