---
title: uuid问题的解决
date: 2023-10-19 20:47:53
categories:
  - 瑞芯微开发
link: 瑞芯微/17 uuid问题的解决
---

先说一下目前的问题，由于目前文件系统的挂载采用的都是uuid的形式，所以这就导致了不论是TF卡启动还是EMMC启动都会启动emmc分区的，除非将emmc分区中的内容擦除掉，但这明显是不对的，为什么不能一起用，所以我在uboot的代码中添加了以下代码

u-boot/arch/arm/mach-rockchip/boot_rkimg.c

~~~C
                if(!strcmp(boot_media, "emmc"))
                        snprintf(boot_options, sizeof(boot_options),"%s root=/dev/mmcblk0p6",boot_options);
        
                else if(!strcmp(boot_media, "sd"))
                        snprintf(boot_options, sizeof(boot_options),"%s root=/dev/mmcblk1p6",boot_options);
~~~

![image-20231107132358783](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311071323891.png)

添加了之后就可以进行判断了，然后要修改内核设备树，在内核设备树中指定了uuid，3588和3568对应的设备树文件如下所示：
~~~
arch/arm64/boot/dts/rockchip/rk3588-linux.dtsi
arch/arm64/boot/dts/rockchip/rk3568-linux.dtsi
~~~

修改chose节点，现在的内容如下所示：
~~~
        chosen: chosen {
                bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 root=PARTUUID=614e0000-0000 rw rootwait";
        };
~~~

现在去掉其中的root相关的内容，修改完成如下所示：
~~~
        chosen: chosen {
                bootargs = "earlycon=uart8250,mmio32,0xfeb50000 console=ttyFIQ0 irqchip.gicv3_pseudo_nmi=0 rw rootwait";
        };
~~~

