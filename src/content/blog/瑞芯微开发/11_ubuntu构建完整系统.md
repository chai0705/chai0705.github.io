---
description: "脚本整理 shell export BOARD_NAME\"Orange Pi 5\"                                                                               export BOARD_MAKER\"Xulong\""
cover: /img/cover/4.webp

title: ubuntu完整构建
date: 2024-05-15 17:17:03
categories:
  - 瑞芯微开发
---

# 脚本整理

```shell
export BOARD_NAME="Orange Pi 5"                                                                              
export BOARD_MAKER="Xulong"                                                                                  
export UBOOT_PACKAGE="u-boot-orangepi-rk3588"                                                                
export UBOOT_RULES_TARGET="orangepi_5"                                                                       
export UBOOT_RULES_TARGET_EXTRA="orangepi_5_sata"      
```



![image-20240509205731107](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822471.png)

~~~shell
topeet@topeet:~/Linux/ubuntu-rockchip/config/kernels$ cat rockchip-5.10.conf 
KERNEL_REPO=https://github.com/Joshua-Riek/linux-rockchip.git
KERNEL_BRANCH=linux-5.10-gen-rkr6
KERNEL_VERSION=5.10.160
KERNEL_CLONE_DIR=linux-rockchip
KERNEL_DEFCONFIG=rockchip_linux_defconfig
DPKG_BUILDPACKAGE=y
topeet@topeet:~/Linux/ubuntu-rockchip/config/kernels$ 
~~~

build.sh分析的差不多了，主要就是执行了下面的这四个脚本：
![image-20240509210304254](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822066.png)

当然这些脚本里面肯定是用到了相应的环境变量的，这一点毋庸置疑。从上往下慢慢来，先来分析build-kernel.sh。

## build-kernel.sh

source ../config/kernels/"${KERNEL_TARGET}.conf"

~~~shell
KERNEL_REPO=https://github.com/Joshua-Riek/linux-rockchip.git
KERNEL_BRANCH=linux-5.10-gen-rkr6
KERNEL_VERSION=5.10.160
KERNEL_CLONE_DIR=linux-rockchip
KERNEL_DEFCONFIG=rockchip_linux_defconfig
DPKG_BUILDPACKAGE=y

~~~

>  git clone --progress -b "${KERNEL_BRANCH}" "${KERNEL_REPO}" "${KERNEL_CLONE_DIR}" --depth=2

~~~shell
export ftp_proxy=http://127.0.0.1:8889/
export https_proxy=http://127.0.0.1:8889/
export FTP_PROXY=http://127.0.0.1:8889/
export HTTPS_PROXY=http://127.0.0.1:8889/
export HTTP_PROXY=http://127.0.0.1:8889/
export http_proxy=http://127.0.0.1:8889/

 git clone --progress -b linux-5.10-gen-rkr6 https://github.com/Joshua-Riek/linux-rockchip.git linux-rockchip --depth=2
~~~

![image-20240509210716946](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822488.png)

~~~shell
cd linux-rockchip
git checkout linux-5.10-gen-rkr6
~~~

![image-20240509210951189](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822548.png)

~~~shell
# 构建二进制软件包
sudo dpkg-buildpackage -a "$(cat debian/arch)" -d -b -nc -uc
~~~



~~~shell
# 设置默认配置文件
make rockchip_linux_defconfig CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm64 

# 设置内核编译数字
    echo "1" > .version
    touch .scmversion

# 编译内核到一个deb包当中
sudo make bindeb-pkg \
    KBUILD_IMAGE="arch/arm64/boot/Image" \
    KDEB_PKGVERSION="$(make kernelversion)-rockchip-1" \
    KERNELRELEASE="$(make kernelversion)-rockchip" \
    CROSS_COMPILE=aarch64-linux-gnu- \
    ARCH=arm64 \
    -j "$(nproc)"
~~~

![image-20240509213751095](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822409.png)

​	编译完成是这俩重要的deb文件,一个是用来存放内核头，一个是用来存放镜像例如设备树、内核、驱动文件等。具体的使用以后再说，然后开始看uboot的编译。

## build-u-boot.sh

UBOOT_PACKAGE是在board里面配置的时候设置的，具体如下所示：
![image-20240509215108602](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822437.png)

我这里就继续以香橙派为例进行说明：

![](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822658.png)

![image-20240509215244172](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405092152376.png)

具体就是upstream 文件的内容，具体如下所示：

~~~shell
GIT=https://github.com/orangepi-xunlong/u-boot-orangepi.git
COMMIT=7f7ff61a8b79fdb4f2d51dfb8aa643b8bc3ada0c
BRANCH=v2017.09-rk3588
VERSION=2017.09+20240401.git7f7ff61a
~~~

最终的整合命令为:

~~~shell
git clone --single-branch --progress -b v2017.09-rk3588 https://github.com/orangepi-xunlong/u-boot-orangepi.git u-boot-orangepi-rk3588
git -C u-boot-orangepi-rk3588 checkout 7f7ff61a8b79fdb4f2d51dfb8aa643b8bc3ada0c
cp -r ubuntu-rockchip/packages/u-boot-orangepi-rk3588/debian u-boot-orangepi-rk3588
~~~

![image-20240509215535488](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822916.png)

​	果然每家都有每家的uboot，算是又强了一点点，这个地方我直接用我家的uboot应该也是可以的，当然我家的uboot是基本没改过的，就也还行吧。

~~~shell
rules=orangepi_5,package-orangepi_5

# 前处理，就是打了一些补丁
dpkg-source --before-build .

#  编译uboot，这里不是这么简单
dpkg-buildpackage -a "$(cat debian/arch)" -d -b -nc -uc --rules-target="${rules}"
dpkg-source --after-build .

rm -f ../*.buildinfo ../*.changes
~~~

![image-20240509220655758](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202405100822890.png)

​	可以看到最后生成了uboot的deb包。

## build-rootfs.sh

​	设置几个相关环境变量

~~~shell
export RELASE_NAME="Ubuntu 22.04 LTS (Jammy Jellyfish)"
export RELASE_VERSION="22.04"
if [ -z "${KERNEL_TARGET}" ]; then
    export KERNEL_TARGET="rockchip-5.10"
fi
~~~



~~~shell
git clone https://github.com/Joshua-Riek/ubuntu-live-build.git

cd ubuntu-live-build
bash ./docker/build-livecd-rootfs.sh
bash ./build.sh "--desktop" "--jammy"
mv "./build/ubuntu-${RELASE_VERSION}-preinstalled-${PROJECT}-arm64.rootfs.tar.xz" ../
~~~



## config-image.sh

​	导入两个文件的环境变量

~~~shell
# shellcheck shell=bash

export BOARD_NAME="Orange Pi 5B"
export BOARD_MAKER="Xulong"
export UBOOT_PACKAGE="u-boot-orangepi-rk3588"
export UBOOT_RULES_TARGET="orangepi_5b"

function config_image_hook__orangepi-5b() {
    local rootfs="$1"
    local overlay="$2"

    # Install panfork
    chroot "${rootfs}" add-apt-repository -y ppa:jjriek/panfork-mesa
    chroot "${rootfs}" apt-get update
    chroot "${rootfs}" apt-get -y install mali-g610-firmware
    chroot "${rootfs}" apt-get -y dist-upgrade

    # Enable bluetooth for AP6275P
    mkdir -p "${rootfs}/usr/lib/scripts"
    cp "${overlay}/usr/lib/systemd/system/ap6275p-bluetooth.service" "${rootfs}/usr/lib/systemd/system/ap6275p-bluetooth.service"
    cp "${overlay}/usr/lib/scripts/ap6275p-bluetooth.sh" "${rootfs}/usr/lib/scripts/ap6275p-bluetooth.sh"
    cp "${overlay}/usr/bin/brcm_patchram_plus" "${rootfs}/usr/bin/brcm_patchram_plus"
    chroot "${rootfs}" systemctl enable ap6275p-bluetooth

    # Enable USB 2.0 port
    cp "${overlay}/usr/lib/systemd/system/enable-usb2.service" "${rootfs}/usr/lib/systemd/system/enable-usb2.service"
    chroot "${rootfs}" systemctl --no-reload enable enable-usb2

    # Install wiring orangepi package 
    chroot "${rootfs}" apt-get -y install wiringpi-opi libwiringpi2-opi libwiringpi-opi-dev
    echo "BOARD=orangepi5" > "${rootfs}/etc/orangepi-release"

    return 0
}
~~~



~~~shell
export RELASE_NAME="Ubuntu 22.04 LTS (Jammy Jellyfish)"
export RELASE_VERSION="22.04"
if [ -z "${KERNEL_TARGET}" ]; then
    export KERNEL_TARGET="rockchip-5.10"
fi
~~~





`update-initramfs -u`命令用于更新Linux系统的初始化内存文件系统（initramfs）。

initramfs是一个临时的文件系统，位于Linux启动过程的早期阶段。它包含了用于引导系统的必要文件、驱动程序和工具。initramfs在系统引导时被加载到内存中，并在完成引导过程之前提供必要的资源。

`update-initramfs -u`命令的作用是重新生成和更新initramfs文件。它会根据当前系统配置和安装的软件包，重新打包和生成initramfs文件，以确保其与当前系统环境保持同步。

在更新initramfs时，该命令会扫描系统上已安装的内核和相关的驱动程序，将其添加到initramfs文件中，以便在引导过程中正确加载所需的模块和驱动程序。

通常，在更新内核或修改了与引导相关的配置文件后，需要运行`update-initramfs -u`命令来确保initramfs文件与系统的变更保持同步。这样可以确保系统能够正确引导，并正确加载所需的模块和驱动程序。



~~~shell
cd ${chroot_dir} && tar -cpf "../ubuntu-${RELASE_VERSION}-preinstalled-${PROJECT}-arm64-${BOARD}.rootfs.tar" . && cd .. && rm -rf ${chroot_dir}
../scripts/build-image.sh "ubuntu-${RELASE_VERSION}-preinstalled-${PROJECT}-arm64-${BOARD}.rootfs.tar"
~~~



~~~shell
if [ -z "${img##*server*}" ]; then
    # Setup partition table
    dd if=/dev/zero of="${disk}" count=4096 bs=512
    parted --script "${disk}" \
    mklabel gpt \
    mkpart primary fat32 16MiB 20MiB \
    mkpart primary ext4 20MiB 100%

    # Create partitions
    {
        echo "t"
        echo "1"
        echo "EBD0A0A2-B9E5-4433-87C0-68B6B72699C7"
        echo "t"
        echo "2"
        echo "C12A7328-F81F-11D2-BA4B-00A0C93EC93B"
        echo "w"
    } | fdisk "${disk}" &> /dev/null || true

    partprobe "${disk}"

    partition_char="$(if [[ ${disk: -1} == [0-9] ]]; then echo p; fi)"

    sleep 1

    wait_loopdev "${disk}${partition_char}2" 60 || {
        echo "Failure to create ${disk}${partition_char}1 in time"
        exit 1
    }

    sleep 1

    wait_loopdev "${disk}${partition_char}1" 60 || {
        echo "Failure to create ${disk}${partition_char}1 in time"
        exit 1
    }

    sleep 1

    # Generate random uuid for bootfs
    boot_uuid=$(uuidgen | head -c8)

    # Generate random uuid for rootfs
    root_uuid=$(uuidgen)

    # Create filesystems on partitions
    mkfs.vfat -i "${boot_uuid}" -F32 -n CIDATA "${disk}${partition_char}1"
    dd if=/dev/zero of="${disk}${partition_char}2" bs=1KB count=10 > /dev/null
    mkfs.ext4 -U "${root_uuid}" -L cloudimg-rootfs "${disk}${partition_char}2"

    # Mount partitions
    mkdir -p ${mount_point}/{system-boot,writable} 
    mount "${disk}${partition_char}1" ${mount_point}/system-boot
    mount "${disk}${partition_char}2" ${mount_point}/writable

    # Cloud init config for server image
    cp ../overlay/boot/firmware/{meta-data,user-data,network-config} ${mount_point}/system-boot
~~~

现在源码和镜像肯定是有了，晚上应该看看佐大的视频，还是需要再研究看看



# mycode

rkbin

~~~shell
export ftp_proxy=http://127.0.0.1:8889/
export https_proxy=http://127.0.0.1:8889/
export FTP_PROXY=http://127.0.0.1:8889/
export HTTPS_PROXY=http://127.0.0.1:8889/
export HTTP_PROXY=http://127.0.0.1:8889/
export http_proxy=http://127.0.0.1:8889/

git clone --depth 1 https://github.com/rockchip-linux/rkbin
~~~

官方uboot

~~~shell
git clone --depth 1 https://source.denx.de/u-boot/u-boot.git
cd u-boot
export BL31=../rkbin/bin/rk35/rk3588_bl31_v1.45.elf
export ROCKCHIP_TPL=../rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_eyescan_v1.11.bin
make evb-rk3588_defconfig
make CROSS_COMPILE=aarch64-linux-gnu-
~~~

RK uboot

~~~shell
git clone https://github.com/rockchip-linux/u-boot.git
cd u-boot
export BL31=../rkbin/bin/rk35/rk3588_bl31_v1.45.elf
export ROCKCHIP_TPL=../rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_eyescan_v1.11.bin
make rk3588_defconfig
make CROSS_COMPILE=aarch64-linux-gnu- -j32
~~~



~~~shell
rules=orangepi_5,package-orangepi_5
make mrproper
dpkg-buildpackage -a "$(cat debian/arch)" -d -b -nc -uc --rules-target="${rules}"
~~~



~~~shell
make mrproper
rules=rk3588,package-rk3588
dpkg-buildpackage -a "$(cat debian/arch)" -d -b -nc -uc --rules-target="${rules}"
~~~





~~~shell
make CROSS_COMPILE=aarch64-linux-gnu- orangepi_5_defconfig -j32 
make CROSS_COMPILE=aarch64-linux-gnu-  -j32 
make ARCH=arm \
	CROSS_COMPILE=aarch64-linux-gnu- \
	BL31=../rkbin/bin/rk35/rk3588_bl31_v1.38.elf \
	spl/u-boot-spl.bin u-boot.dtb u-boot.itb \
	-j32
~~~



~~~shell
make CROSS_COMPILE=aarch64-linux-gnu- rk3588_defconfig -j32 
make CROSS_COMPILE=aarch64-linux-gnu-  -j32 
make ARCH=arm \
	CROSS_COMPILE=aarch64-linux-gnu- \
	BL31=../rkbin/bin/rk35/rk3588_bl31_v1.38.elf \
	spl/u-boot-spl.bin u-boot.dtb u-boot.itb \
	-j32
~~~



```
decode_bl31.py
def main():
    if "BL31" in os.environ:
        bl31_elf=os.getenv("BL31");
    elif os.path.isfile("./bl31.elf"):
        bl31_elf = "./bl31.elf"
    else:
        os.system("echo 'int main(){}' > bl31.c")
        os.system("${CROSS_COMPILE}gcc -c bl31.c -o bl31.elf")
        bl31_elf = "./bl31.elf"
        logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
        logging.warning(' BL31 file bl31.elf NOT found, resulting binary is non-functional')
        logging.warning(' Please read Building section in doc/README.rockchip')
    generate_atf_binary(bl31_elf);
    
make_fit_atf.sh
	注释掉BL32
```





~~~shell
	./tools/mkimage -n rk3588 -T rksd -d \
	  ../rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.11.bin:spl/u-boot-spl.bin \
	  idbloader.img
~~~

sudo dd if=idbloader.img of=/dev/sdc seek=64

sudo dd if=u-boot.itb of=/dev/sdc  seek=16384 conv=notrunc



~~~shell
cd ../rkbin
./tools/trust_merger RKTRUST/RK3588TRUST.ini
sudo dd if=trust.img of=/dev/sdc seek=24576
~~~



<GITHUB_TOKEN_REDACTED>



# 系统移植

## 1.构建v2ray



## 2.拉取源码

设置http端口

~~~shell
export ftp_proxy=http://127.0.0.1:8889/
export https_proxy=http://127.0.0.1:8889/
export FTP_PROXY=http://127.0.0.1:8889/
export HTTPS_PROXY=http://127.0.0.1:8889/
export HTTP_PROXY=http://127.0.0.1:8889/
export http_proxy=http://127.0.0.1:8889/
~~~

拉取orangepi源码  

拉取ubuntu-rockchip源码

~~~shell
git clone https://github.com/Joshua-Riek/ubuntu-rockchip.git
git clone --single-branch --progress -b v2017.09-rk3588 https://github.com/orangepi-xunlong/u-boot-orangepi.git u-boot-orangepi-rk3588
git -C u-boot-orangepi-rk3588 checkout 7f7ff61a8b79fdb4f2d51dfb8aa643b8bc3ada0c
cp -r ubuntu-rockchip/packages/u-boot-orangepi-rk3588/debian u-boot-orangepi-rk3588
~~~

拉取瑞芯微官方uboot源码和rkbin源码

~~~shell
git clone https://github.com/rockchip-linux/u-boot.git
git clone https://github.com/rockchip-linux/rkbin.git
~~~



## 3.编译

安装交叉编译器：

~~~shell
sudo apt install gcc-aarch64-linux-gnu
~~~

修改arch/arm/mach-rockchip/decode_bl31.py文件

~~~python
vim arch/arm/mach-rockchip/decode_bl31.py
def main():
    if "BL31" in os.environ:
        bl31_elf=os.getenv("BL31");
    elif os.path.isfile("./bl31.elf"):
        bl31_elf = "./bl31.elf"
    else:
        os.system("echo 'int main(){}' > bl31.c")
        os.system("${CROSS_COMPILE}gcc -c bl31.c -o bl31.elf")
        bl31_elf = "./bl31.elf"
        logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
        logging.warning(' BL31 file bl31.elf NOT found, resulting binary is non-functional')
        logging.warning(' Please read Building section in doc/README.rockchip')
    generate_atf_binary(bl31_elf);
~~~

修改arch/arm/mach-rockchip/make_fit_atf.sh 文件注释掉#gen_bl32_node

```shell
vim arch/arm/mach-rockchip/make_fit_atf.sh

source ./${srctree}/arch/arm/mach-rockchip/fit_nodes.sh

gen_header
gen_uboot_node
gen_bl31_node
# gen_bl32_node
gen_mcu_node
gen_loadable_node
gen_kfdt_node
gen_fdt_node
gen_arm64_configurations
```

修改波特率

~~~shell
vim configs/rk3588_defconfig
CONFIG_BAUDRATE=115200
~~~



~~~shell
cp /home/topeet/back/01_tmp/decode_bl31.py  arch/arm/mach-rockchip/
cp /home/topeet/back/01_tmp/make_fit_atf.sh  arch/arm/mach-rockchip/
cp /home/topeet/back/01_tmp/rk3588_defconfig configs/
~~~



编译

~~~shell
	  make CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm  -j20  rk3588_defconfig
	  make CROSS_COMPILE=aarch64-linux-gnu- -j20 
	  make CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm  -j20 \
	  BL31=../rkbin/bin/rk35/rk3588_bl31_v1.45.elf \
	  spl/u-boot-spl.bin u-boot.dtb u-boot.itb
~~~

构建idbloader.img

~~~shell
./tools/mkimage -n rk3588 -T rksd -d \
	../rkbin/bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2400MHz_v1.16.bin:spl/u-boot-spl.bin \
	idbloader.img
~~~



## 4.写入

~~~shell
sudo dd if=idbloader.img of=/dev/sdc seek=64
sudo dd if=u-boot.itb of=/dev/sdc seek=16384 conv=notrunc
sync
~~~





~~~shell
    sudo dd if=/dev/zero of=/dev/sdc count=4096 bs=512 
    sudo parted --script /dev/sdc  \
    mklabel gpt \
    mkpart primary fat32 16MiB 20MiB \
    mkpart primary ext4 20MiB 100%

    # Create partitions
    {
        echo "t"
        echo "1"
        echo "EBD0A0A2-B9E5-4433-87C0-68B6B72699C7"
        echo "t"
        echo "2"
        echo "C12A7328-F81F-11D2-BA4B-00A0C93EC93B"
        echo "w"
    } | sudo fdisk /dev/sdc  &> /dev/null || true

    sudo partprobe /dev/sdc 
    
        # Generate random uuid for bootfs
    boot_uuid=$(uuidgen | head -c8)

    # Generate random uuid for rootfs
    root_uuid=$(uuidgen)

    # Create filesystems on partitions
    sudo mkfs.vfat -i "${boot_uuid}" -F32 -n CIDATA /dev/sdc1
    sudo dd if=/dev/zero of=/dev/sdc2 bs=1KB count=10 > /dev/null
    sudo mkfs.ext4 -U "${root_uuid}" -L cloudimg-rootfs /dev/sdc2
    
    # Mount partitions
    mkdir -p {system-boot,writable} 
    mount "sdc1" system-boot
    mount "sdc2" writable
~~~



# 命令学习

## mklabel

```shell
    parted --script /dev/sdb \
    mklabel gpt \
    mkpart primary ext4 16MiB 100%
```

1. - `mklabel gpt`: 创建了一个 GPT（GUID 分区表）磁盘标签。GPT 是一种磁盘分区表标准，支持更大的磁盘容量和更多的分区。
   - `mkpart primary ext4 16MiB 100%`: 创建了一个主分区，并将其格式化为 ext4 文件系统。具体的参数解释如下：
     - `primary`: 表示创建一个主分区。主分区是可用于安装操作系统或存储数据的分区类型。
     - `ext4`: 表示将分区格式化为 ext4 文件系统。ext4 是一种常见的 Linux 文件系统。
     - `16MiB`: 表示分区的起始位置。这里的 `16MiB` 表示分区从磁盘的 16MiB 处开始。
     - `100%`: 表示分区的结束位置。这里的 `100%` 表示分区将占据整个磁盘的剩余空间。

   `--script` 参数用于在不需要用户交互的情况下运行 parted 命令。它告诉 parted 不要提示用户进行确认或提供交互式输入。

## fdisk

~~~shell
   # Create partitions
    {
        echo "t"
        echo "1"
        echo "C12A7328-F81F-11D2-BA4B-00A0C93EC93B"
        echo "w"
    } | fdisk /dev/sdb &> /dev/null || true
~~~

这段代码使用了 `fdisk` 工具来创建分区。下面是对代码中各个部分的解释：

1. `echo "t"`: 发送 "t" 命令给 `fdisk`，用于更改分区类型。
2. `echo "1"`: 发送 "1" 命令给 `fdisk`，用于选择第一个分区。
3. `echo "C12A7328-F81F-11D2-BA4B-00A0C93EC93B"`: 发送 "C12A7328-F81F-11D2-BA4B-00A0C93EC93B" 命令给 `fdisk`，用于将分区类型更改为 EFI System。
4. `echo "w"`: 发送 "w" 命令给 `fdisk`，用于保存分区表并退出。

## partprobe

​	重新加载分区

~~~shell
partprobe /dev/sdb
~~~



# 文件系统配置

​	给文件系统分区设置uuid，创建ext4文件系统分区

~~~shell
    # Generate random uuid for rootfs
    root_uuid=$(uuidgen)

    # Create filesystems on partitions
    dd if=/dev/zero of=/dev/sdb1 bs=1KB count=10 
    mkfs.ext4 -U "${root_uuid}" -L desktop-rootfs /dev/sdb1

    # Mount partitions
    mkdir -p writable
    mount /dev/sdb1 writable
~~~

​	拷贝文件系统镜像到SD卡分区，并设置fstab

~~~shell
# Copy the rootfs to root partition
tar -xpf "${rootfs}" -C writable
echo "# <file system>     <mount point>  <type>  <options>   <dump>  <fsck>" > writable/etc/fstab
echo "UUID=${root_uuid,,} /              ext4    defaults,x-systemd.growfs    0       1" >> writable/etc/fstab
~~~

​	写入idbloader 和 uboot

~~~shell
sudo dd if=idbloader.img of=/dev/sdb seek=64
sudo dd if=u-boot.itb of=/dev/sdb seek=16384 conv=notrunc
sync
~~~





~~~shell
sudo mkdir boot
sudo mkdir boot/extlinux 
sudo vim boot/extlinux/extlinux.conf
~~~



~~~shell
## /boot/extlinux/extlinux.conf
##
## IMPORTANT WARNING
##
## The configuration of this file is generated automatically.
## Do not edit this file manually, use: u-boot-update

default l0
menu title U-Boot menu
prompt 1
timeout 20


label l0
        menu label Ubuntu 22.04.4 LTS 5.10.0-1004-rockchip
        linux /boot/vmlinuz-5.10.0-1004-rockchip
        initrd /boot/initrd.img-5.10.0-1004-rockchip
        fdtdir /lib/firmware/5.10.0-1004-rockchip/device-tree/

        append root=/dev/mmcblk1p1 rootwait rw console=ttyS2,1500000 console=tty1 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory

label l0r
        menu label Ubuntu 22.04.4 LTS 5.10.0-1004-rockchip (rescue target)
        linux /boot/vmlinuz-5.10.0-1004-rockchip
        initrd /boot/initrd.img-5.10.0-1004-rockchip
        fdtdir /lib/firmware/5.10.0-1004-rockchip/device-tree/
        append root=UUID=ad3b52b5-62aa-4f25-95fc-796d6126a268 rootwait rw console=ttyS2,1500000 console=tty1 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory single
~~~





~~~shell
# <file system>     <mount point>  <type>  <options>   <dump>  <fsck>
/dev/mmcblk1p1 / ext4 defaults 0 1
~~~









# 最终步骤

~~~shell
export ftp_proxy=http://127.0.0.1:8889/
export https_proxy=http://127.0.0.1:8889/
export FTP_PROXY=http://127.0.0.1:8889/
export HTTPS_PROXY=http://127.0.0.1:8889/
export HTTP_PROXY=http://127.0.0.1:8889/
export http_proxy=http://127.0.0.1:8889/

git clone https://github.com/Joshua-Riek/ubuntu-rockchip.git
git clone --single-branch --progress -b v2017.09-rk3588 https://github.com/orangepi-xunlong/u-boot-orangepi.git u-boot-orangepi-rk3588
git -C u-boot-orangepi-rk3588 checkout 7f7ff61a8b79fdb4f2d51dfb8aa643b8bc3ada0c
cp -r ubuntu-rockchip/packages/u-boot-orangepi-rk3588/debian u-boot-orangepi-rk3588

~~~



修改uboot波特率为115200

~~~
~~~



	  make CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm  -j32  orangepi_5_defconfig
	  make CROSS_COMPILE=aarch64-linux-gnu- -j32 
	  make CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm  -j32 \
	  BL31=../rkbin/bin/rk35/rk3588_bl31_v1.45.elf \
	  spl/u-boot-spl.bin u-boot.dtb u-boot.itb