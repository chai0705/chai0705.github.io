---
title: ubuntu和debian文件系统构建详解
date: 2023-11-20 21:16:57
categories:
  - 瑞芯微开发
link: 瑞芯微开发/01 debian和ubuntu文件系统构建详解
---

# 第7章 Ubuntu和Debian系统构建

在前面的几个章节中，我们利用了busybox，buildroot，yocto工具构建文件系统。我们也可以使用Linux发行版来直接作为文件系统，比如Ubuntu系统和Debian系统。由于Ubuntu和Debian系统的构建方法相同，所以作者将他们两个系统的构建放到了一起。

注意：必须要在ubuntu20等更高版本的系统上进行本章节的文件系统构建，经测试在ubutnu18上因为一些工具的版本问题，会出现很多意想不到的问题。

## 7.1 安装所需的工具

使用如下命令安装所需的工具

~~~
sudo apt-get install binfmt-support qemu qemu-user-static debootstrap
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050842.jpg) 

binfmt-support：提供了对二进制格式解释器的支持。允许在Linux系统中执行非本机二进制文件，例如在ARM架构上运行x86二进制文件。它为Linux内核添加了解释器注册表和执行文件的解析逻辑。

qemu：是一个开源的硬件虚拟化和仿真软件，允许在一个平台上模拟另一个平台的运行。它支持多种体系结构和硬件设备，并可以用于开发和测试操作系统、应用程序等。

qemu-user-static：这是QEMU的用户态静态二进制文件。允许在主机平台上运行不同体系结构的可执行文件，而无需运行完整的虚拟机。这对于交叉编译和在本地主机上模拟其他体系结构的应用程序非常有用。

debootstrap：用于在Linux系统中创建基于Debian的最小文件系统的工具。可以帮助你从零开始构建一个基本的和Ubuntu和Debian系统，并可以用于创建chroot环境或构建自定义的Linux发行版。

## 7.2根文件系统制作

首先来学习一下debootstrap命令的基本语法：

~~~
debootstrap arch <架构> <发行版> <目标目录> [镜像地址]
~~~

--arch <架构>：指定目标系统的架构，例如 amd64、armhf、arm64 等。根据目标系统的架构选择合适的值。

<发行版>：指定要创建的Debian发行版，流行系统的版本号如下所示：

（1）Ubuntu 20.04：focal

（2）Ubuntu 22.04：jammy

（3）Debian 10： buster

（4）Debian 11：bullseye

<目标目录>：指定要创建的目标文件系统的目录路径。所有的Debian软件包和配置文件将安装到该目录中。

[镜像地址]（可选）：指定用于下载Ubuntu和Debian软件包的镜像地址。如果不提供镜像地址，将使用默认的镜像地址进行下载,这里建议选择国内源，例如华为源、阿里源等。

注意：debootstrap 命令的使用需要在root用户下。

首先创建一个镜像存放的目录，这里作者起名为binary，大家随意即可，创建完成如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050838.jpg) 

然后使用以下命令制作根文件系统，每个系统的制作命令都已经列了出来：
（1）Ubuntu 20.04：focal

~~~
arch=arm64
release=focal
chroot_dir=binary
mirror=https://mirrors.huaweicloud.com/repository/ubuntu-ports/
debootstrap --arch ${arch} ${release} ${chroot_dir} ${mirror}
~~~

（2）Ubuntu 22.04：jammy

~~~
arch=arm64
release=jammy
chroot_dir=binary
mirror=https://mirrors.huaweicloud.com/repository/ubuntu-ports/
sudo debootstrap --arch ${arch} ${release} ${chroot_dir} ${mirror}
~~~

（3）Debian 10： buster

~~~
arch=arm64
release=buster
chroot_dir=
mirror=https://mirrors.huaweicloud.com/repository/debian/
debootstrap --arch ${arch} ${release} ${chroot_dir} ${mirror}
~~~

（4）Debian 11：bullseye

~~~
arch=arm64
release=bullseye
chroot_dir=binary
mirror=https://mirrors.huaweicloud.com/repository/debian/
debootstrap --arch ${arch} ${release} ${chroot_dir} ${mirror}
~~~

这里作者以ubuntu20为例进行演示，命令输入之后会开始文件系统的构建，构建构成如下所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050845.jpg) 

然后等待构建完成，构建完成之后如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050849.jpg)

可以看到Linux的一些基本目录就都已经生成了。

## 7.3挂载根文件系统

在构建Ubuntu和Debian文件系统时，需要将主机的/proc、/sys/、dev/、dev/pts这些虚拟文件系统挂载到要构建的系统中通过挂载这些临时文件系统，构建文件系统的过程中的命令可以正常访问和操作系统的进程、内核、硬件以及临时文件和进程。这些挂载操作为构建过程提供了必要的运行环境和资源。

挂载操作这里通过mount.sh脚本来完成，该脚本的具体内容如下所示：

~~~shell
#!/bin/bash
mnt() {
	echo "MOUNTING"
	sudo mount -t proc /proc ${2}proc
	sudo mount -t sysfs /sys ${2}sys
	sudo mount -o bind /dev ${2}dev
	sudo mount -o bind /dev/pts ${2}dev/pts
}
umnt() {
	echo "UNMOUNTING"
	sudo umount ${2}proc
	sudo umount ${2}sys
	sudo umount ${2}dev/pts
	sudo umount ${2}dev
}

if [ "$1" == "-m" ] && [ -n "$2" ] ;
then
	mnt $1 $2
elif [ "$1" == "-u" ] && [ -n "$2" ];
then
	umnt $1 $2
else
	echo ""
	echo "Either 1'st, 2'nd or both parameters were missing"
	echo ""
	echo "1'st parameter can be one of these: -m(mount) OR -u(umount)"
	echo "2'nd parameter is the full path of rootfs directory(with trailing '/')"
	echo ""
	echo "For example: ch-mount -m /media/sdcard/"
	echo ""
	echo 1st parameter : ${1}
	echo 2nd parameter : ${2}
fi
~~~



创建该文件，添加相应的内容并赋予可执行权限，具体操作如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050848.jpg)

该脚本既可以用来挂载，也可以用来解除挂载，挂载的命令如下所示：

~~~
./mount.sh -m binary/
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050850.jpg) 

挂载成功之后使用以下命令改变根目录，将根目录修改为刚刚创建好的文件系统中，如下图所示：

~~~
chroot binary/
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050000.jpg) 

接下来就可以进入下一个小节，开始文件系统的定制了。

## 7.4 定制根文件系统

### **7.4.1 apt换源**	

由于构建出系统的软件源在国外，因为网络问题而不稳定导致下载速度缓慢，所以这里先将默认源更换为国内源。

Ubuntu和Debian系统的软件源文件为“/etc/apt/sources.list”，而不同的文件系统他们的软件源也各不相同，所以这里罗列了不同系统的国内软件源，如下所示：
（1）Ubuntu 20.04：focal

~~~
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ focal main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ focal main main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse
deb https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-security main restricted universe multiverse
deb-src https://mirrors.ustc.edu.cn/ubuntu-ports/ focal-security main restricted universe multiverse
~~~

（2）Ubuntu 22.04：jammy

~~~
deb https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy main restricted universe multiverse
deb-src https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy main restricted universe multiverse
deb https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb-src https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-backports main restricted universe multiverse
deb-src https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-backports main restricted universe multiverse
deb https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-security main restricted universe multiverse
deb-src https://mirrors.huaweicloud.com/repository/ubuntu-ports/ jammy-security main restricted universe multiverse
~~~

（3）Debian 10： buster

~~~
deb https://mirrors.huaweicloud.com/repository/debian/ buster main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian/ buster-updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian/ buster-backports main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian-security buster/updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
~~~



（4）Debian 11：bullseye

~~~shell
deb https://mirrors.huaweicloud.com/debian/ bullseye main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye main non-free contrib
deb https://mirrors.huaweicloud.com/debian-security/ bullseye-security main
deb-src https://mirrors.huaweicloud.com/debian-security/ bullseye-security main
deb https://mirrors.huaweicloud.com/debian/ bullseye-updates main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye-updates main non-free contrib
deb https://mirrors.huaweicloud.com/debian/ bullseye-backports main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye-backports main non-free contrib
~~~

然后使用vim命令修改/etc/apt/sources.list为上面提供的国内源，修改完成如下所示：

~~~shell
vi /etc/apt/sources.list
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050010.jpg) 

然后使用以下命令进行软件源的更新，更新过程如下图所示：

~~~shell
apt update 
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050017.jpg) 

等待更新完成即可。默认的dns源在烧写到开发板之后可能也无法正常解析域名，所以需要使用以下命令更换镜像的dns源，如下图所示：
~~~
rm -rf /etc/resolv.conf
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 114.114.114.114" >> /etc/resolv.conf
~~~

![image-20231122074527194](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311220745228.png)

### **7.4.2安装常用工具**

然后使用以下命令安装必备的软件包，安装过程如下所示：
~~~shell
apt-get -y install dmidecode mtd-utils i2c-tools u-boot-tools \
bash-completion man-db manpages nano gnupg initramfs-tools sudo \
dosfstools mtools parted ntfs-3g zip atop \
p7zip-full htop iotop pciutils lshw lsof exfat-fuse hwinfo \
net-tools wireless-tools openssh-client openssh-server wpasupplicant ifupdown \
pigz wget curl lm-sensors bluez gdisk usb-modeswitch usb-modeswitch-data make \
gcc libc6-dev bison libssl-dev flex  fake-hwclock rfkill wireless-regdb toilet cmake locales \
openssh-server openssh-client network-manager fonts-wqy-zenhei xfonts-intl-chinese alsa-utils vim blueman 
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050030.jpg) 

等待安装完成即可，每个安装包的具体作用如下所示：

~~~
dmidecode：用于获取系统的DMI（Desktop Management Interface）信息，包括硬件设备、BIOS和固件等。
mtd-utils：提供对嵌入式闪存设备（MTD）的管理和操作工具，用于读取、擦除和编程闪存芯片。
i2c-tools：用于配置和调试I2C总线设备的工具集。
u-boot-tools：提供与U-Boot引导加载程序相关的工具，用于配置和管理嵌入式系统的引导过程。
bash-completion：为Bash shell提供自动补全功能，可以快速补全命令、选项和文件名。
man-db和manpages：man-db是一个用于管理和浏览man页面（Linux帮助文档）的工具，manpages则是包含常见命令和函数的man页面集合。
nano：一个简单易用的文本编辑器，适用于终端环境。
gnupg：GNU隐私保护工具，用于加密、签名和认证数据和通信。
initramfs-tools：用于创建和管理初始内存文件系统（initramfs），通常用于启动Linux系统前的初始化过程。
sudo：允许普通用户以超级用户（root）权限执行命令的工具。
dosfstools：用于创建、检查和维护DOS/Windows文件系统（FAT）的工具集。
mtools：用于在Linux系统上管理DOS/Windows文件系统（FAT）的工具。
parted：磁盘分区工具，用于创建、调整和管理磁盘分区。
ntfs-3g：用于在Linux系统上读写NTFS文件系统的驱动程序。
zip和p7zip-full：用于创建和提取ZIP和7z等压缩文件的工具。
htop和iotop：用于监视系统资源使用情况的命令行工具，分别监视进程和磁盘I/O的情况。
pciutils：用于查询和配置PCI总线设备的工具。
lshw：显示系统硬件信息的工具。
lsof：列出打开的文件和进程的工具。
exfat-fuse：用于在Linux系统上访问exFAT文件系统的驱动程序。
hwinfo：用于获取和显示硬件信息的工具。
net-tools：包含一些基本的网络工具，如ifconfig和netstat。
wireless-tools：用于配置和管理无线网络接口的工具。
openssh-client和openssh-server：提供SSH客户端和服务器，用于远程安全登录和文件传输。
wpasupplicant：用于配置和连接无线网络的工具。
ifupdown：用于配置和管理网络接口的工具。
pigz：并行压缩/解压缩工具，用于加快压缩速度。
wget和curl：用于从网络上下载文件的命令行工具。
lm-sensors：用于监测硬件传感器（如温度、风扇速度）的工具。
bluez：提供蓝牙协议栈的工具和库。
gdisk：用于创建和管理GUID分区表（GPT）的工具。
usb-modeswitch和usb-modeswitch-data：用于在Linux系统上切换和配置USB移动宽带设备的工具和数据。
make和gcc：编译和构建软件的工具和编译器。
libc6-dev：C语言标准库的开发文件，用于编译和链接C语言程序。
bison和flex：用于生成词法分析器和语法分析器的生成工具。
fake-hwclock：用于在系统没有硬件时钟的情况下，模拟保存和恢复时间的工具。
rfkill：用于管理射频设备的软件屏蔽开关状态的工具。
wireless-regdb：无线电设备的法规数据库，用于配置无线电频率和功率限制。
toilet：用于在终端中生成彩色的ASCII艺术字的工具。
cmake：一个跨平台的开源构建工具，用于管理软件项目的构建过程。
locales：用于配置系统的本地化设置，包括语言、日期、时间等。
network-manager：用于配置和管理网络连接的工具。
fonts-wqy-zenhei和xfonts-intl-chinese：提供中文字体支持，用于显示中文字符。
alsa-utils：用于配置和管理Advanced Linux Sound Architecture (ALSA)的工具。
vim：一个功能强大的文本编辑器，适用于终端环境
~~~

### **7.4.3配置root密码**

输入“passwd root”命令，然后连续输入两次root 用户密码，如图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050040.jpg) 

### **7.4.4添加topeet用户**

然后输入以下命令添加名字为topeet的用户，并将topeet用户的登录密码设置为topeet，并授予该用户以管理员（root）权限执行所有命令，如下图所示：

~~~shell
adduser topeet --gecos "First Last,RoomNumber,WorkPhone,HomePhone" --disabled-password
echo "topeet:topeet" |  chpasswd
echo "topeet ALL=(ALL:ALL) ALL" >> /etc/sudoers
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050045.jpg) 

至此，topeet用户就创建完成了，如果想要修改创建的用户修改命令中的topeet即可。

### **7.4.5配置主机名**

接下来使用如下命令设置主机名称和本机 IP：

~~~shell
export HOST=topeet
echo $HOST > /etc/hostname
echo "127.0.0.1 localhost.localdomain localhost" >> /etc/hosts
echo "127.0.0.1 $HOST" >> /etc/hosts
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050162.jpg) 

### **7.4.6中文设置**

目前的终端交互仍旧使用的是英文，为了便于交互和查看打印信息，可以根据以下步骤修改为中文。

首先使用sed 工具修改 /etc/locale.gen 文件的内容，将以 zh_CN.UTF-8 开头的行中的注释符号 # 去除。

然后设置系统的默认语言环境为中文（中国），如下图所示：

~~~shell
sed -i 's/^# *\(zh_CN.UTF-8\)/\1/' /etc/locale.gen
echo "LANG=zh_CN.UTF-8" >> /etc/default/locale
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050190.jpg) 

然后使用以下命令生成 zh_CN.UTF-8 语言环境所需的配置文件，执行过程如下所示：

~~~shell
locale-gen zh_CN.UTF-8
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050196.jpg)
	最后执行以下命令将LC_ALL 、LANG和LANGUAGE追加到root和topeet用户的环境变量中，如下图所示：

~~~shell
echo "export LC_ALL=zh_CN.UTF-8" >> ~/.bashrc
echo "export LANG=zh_CN.UTF-8" >> ~/.bashrc
echo "export LANGUAGE=zh_CN.UTF-8" >> ~/.bashrc

echo "export LC_ALL=zh_CN.UTF-8" >> /home/topeet/.bashrc
echo "export LANG=zh_CN.UTF-8" >> /home/topeet/.bashrc
echo "export LANGUAGE=zh_CN.UTF-8" >> /home/topeet/.bashrc
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050210.jpg) 

至此，中文环境就设置完成了，可以使用apt-get update命令来查看中文是否设置成功，设置成功如下所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050231.jpg)

可以看到打印信息已经设置为了中文。

### 7.4.7安装桌面

上面只是对系统进行了一些基本设置，本小节将进行桌面系统的安装，在Linux的发行版中以GNOME、KDE、Xfce和LXQt的使用最为广泛，考虑到3568的性能这里选用Xfce桌面进行安装，如果想要安装其他桌面可以自行搜索其他桌面的安装命令。Xfce桌面及一些其他的配置软件安装命令如下所示：

~~~
apt-get install -y xubuntu-core lightdm
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050239.jpg) 

在安装过程中可能要选择默认显示管理器，选择lightmd即可，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050316.jpg) 

安装完成之后使用以下命令删除gdm3 ubuntu-session两个软件，如下图所示：

~~~
apt-get remove -y gdm3 ubuntu-session
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212050334.jpg) 

至此，关于桌面的安装就完成了。

### 7.4.8配置硬盘自动扩展

为了尽可能的让烧写的镜像小，所以在构建烧写镜像的时候只是在原有的基础上扩大了300M（后面讲到），但系统烧写进去之后，会因为空间所以无法启动桌面环境等，所以硬盘自动扩展也是必不可少的一个步骤。

首先在usr/bin目录下创建一个名为disk-helper的文件，该文件内容如下所示：

~~~shell
cd usr/bin
vim disk-helper
~~~



~~~shell
#!/bin/sh

# Uncomment below to see more logs
# set -x

MISC_DEV=$(realpath /dev/block/by-name/misc 2>/dev/null)

BUSYBOX_MOUNT_OPTS="loop (a|)sync (no|)atime (no|)diratime (no|)relatime (no|)dev (no|)exec (no|)suid (r|)shared (r|)slave (r|)private (un|)bindable (r|)bind move remount ro"
NTFS_3G_MOUNT_OPTS="ro uid=[0-9]* gid=[0-9]* umask=[0-9]* fmask=[0-9]* dmask=[0-9]*"

check_tool()
{
	TOOL=$(echo $1 | grep -o "^[^ ]*")
	BR2_CONFIG=$2

	type $TOOL >/dev/null && return 0

	if grep -wq "ID=buildroot" /etc/os-release 2>/dev/null; then
		[ -n "$BR2_CONFIG" ] && \
			echo "You may need to enable $BR2_CONFIG"
	else
		echo "Missing tool: $TOOL"
	fi
	return 1
}

prepare_ubi()
{
	# Only support ubi for mtd device
	if echo $DEV | grep -vq /dev/mtd; then
		echo "$DEV is not a mtd device!"
		return 1
	fi

	[ "$PART_NO" ] || { echo "No valid part number!" && return 1; }

	if [ "$FSGROUP" = ubifs ]; then
		DEV=/dev/ubi${PART_NO}_0
	else
		DEV=/dev/ubiblock${PART_NO}_0
	fi

	MTDDEV=/dev/mtd${PART_NO}

	echo "Preparing $DEV from $MTDDEV"

	echo "Remove ubi block device"
	if echo $DEV | grep -q ubiblock; then
		check_tool ubiblock BR2_PACKAGE_MTD_UBIBLOCK || return 1
		ubiblock -r /dev/ubi${PART_NO}_0 &>/dev/null
	fi

	echo "Detach ubi device"
	check_tool ubidetach BR2_PACKAGE_MTD_UBIDETACH || return 1
	ubidetach -p $MTDDEV &>/dev/null

	echo "Attach ubi device"
	check_tool ubiattach BR2_PACKAGE_MTD_UBIATTACH || return 1
	ubiattach /dev/ubi_ctrl -m $PART_NO -d $PART_NO || return 1

	echo "Check for valid volume"
	if [ ! -e /dev/ubi${PART_NO}_0 ]; then
		echo "No valid ubi volume"
		return 1
	fi

	echo "Create ubi block device"
	if echo $DEV | grep -q ubiblock; then
		check_tool ubiblock BR2_PACKAGE_MTD_UBIBLOCK || return 1
		ubiblock -c /dev/ubi${PART_NO}_0 || return 1
	fi

	return 0
}

format_ubifs()
{
	echo "Formatting $MTDDEV for $DEV"

	echo "Remove ubi block device"
	if echo $DEV | grep -q ubiblock; then
		check_tool ubiblock BR2_PACKAGE_MTD_UBIBLOCK || return 1
		ubiblock -r /dev/ubi${PART_NO}_0 &>/dev/null
	fi

	echo "Detach ubi device"
	check_tool ubidetach BR2_PACKAGE_MTD_UBIDETACH || return 1
	ubidetach -p $MTDDEV &>/dev/null

	echo "Format device"
	check_tool ubiformat BR2_PACKAGE_MTD_UBIFORMAT || return 1
	ubiformat -yq $MTDDEV || return 1

	echo "Attach ubi device"
	ubiattach /dev/ubi_ctrl -m $PART_NO -d $PART_NO || return 1

	echo "Create ubi volume"
	check_tool ubimkvol BR2_PACKAGE_MTD_UBIMKVOL || return 1
	ubimkvol /dev/ubi$PART_NO -N $PART_NAME -m || return 1

	echo "Create ubi block device"
	if echo $DEV | grep -q ubiblock; then
		check_tool ubiblock BR2_PACKAGE_MTD_UBIBLOCK || return 1
		ubiblock -c /dev/ubi${PART_NO}_0 || return 1
	fi
}

is_rootfs()
{
	[ $MOUNT_POINT = "/" ]
}

remount_part()
{
	mountpoint -q $MOUNT_POINT || return

	if touch $MOUNT_POINT &>/dev/null; then
		[ "$1" = ro ] && mount -o remount,ro $MOUNT_POINT
	else
		[ "$1" = rw ] && mount -o remount,rw $MOUNT_POINT
	fi
}

format_part()
{
	echo "Formatting $DEV($FSTYPE)"

	case $FSGROUP in
		ext2)
			# Set max-mount-counts to 0, and disable the time-dependent checking.
			check_tool mke2fs BR2_PACKAGE_E2FSPROGS && \
			mke2fs -F -L $PART_NAME $DEV && \
			tune2fs -c 0 -i 0 $DEV
			;;
		vfat)
			# Use fat32 by default
			check_tool mkfs.vfat BR2_PACKAGE_DOSFSTOOLS_MKFS_FAT && \
			mkfs.vfat -I -F 32 -n $PART_NAME $DEV
			;;
		ntfs)
			# Enable compression
			check_tool mkntfs BR2_PACKAGE_NTFS_3G_NTFSPROGS && \
			mkntfs -FCQ -L $PART_NAME $DEV
			;;
		ubifs)
			format_ubifs
			;;
		squashfs)
			# check_tool mksquashfs BR2_PACKAGE_SQUASHFS && \
			# mksquashfs $DEV
			echo "It's pointness to format a squashfs partition..."
			;;
		jffs2)
			echo "It's pointness to format a jffs2 partition..."
			;;
		auto)
			echo "Unable to format a auto partition..."
			;;
		*)
			echo Unsupported file system $FSTYPE for $DEV
			false
			;;
	esac
}

format_resize()
{
	BACKUP=$1
	SRC=$(realpath $MOUNT_POINT)

	echo "Format-resizing $DEV($FSTYPE)"

	echo "Backup original data"
	cp -a "$SRC" "$BACKUP/" || return 1
	umount "$SRC" || return 1

	echo "Format and mount rw"
	format_part || return 1
	mount_part || return 1
	remount_part rw

	echo "Restore backup data"
	cp -a "$BACKUP/$SRC" $(dirname "$SRC") || return 1
}

resize_ext2()
{
	check_tool resize2fs BR2_PACKAGE_E2FSPROGS_RESIZE2FS || return 1

	resize2fs $DEV
}

resize_vfat()
{
	check_tool fatresize BR2_PACKAGE_FATRESIZE || return 1

	SIZE=$(fatresize -i $DEV | grep "Size:" | grep -o "[0-9]*$")

	# Somehow fatresize only works for 256M+ fat
	[ "$SIZE" -gt $((256 * 1024 * 1024)) ] && return 1

	MAX_SIZE=$(( $(cat $SYS_PATH/size) * 512))
	MIN_SIZE=$(($MAX_SIZE - 16 * 1024 * 1024))
	[ $MIN_SIZE -lt $SIZE ] && return 0 # Large enough!
	while [ $MAX_SIZE -gt $MIN_SIZE ];do
		# Somehow fatresize cannot resize to max size
		MAX_SIZE=$(($MAX_SIZE - 512 * 1024))

		# Try to resize with fatresize, not always work
		fatresize -s $MAX_SIZE $DEV && return
	done
	return 1
}

resize_ntfs()
{
	check_tool ntfsresize BR2_PACKAGE_NTFS_3G_NTFSPROGS || return 1

	echo y | ntfsresize -f $DEV
}

resize_part()
{
	# Fixed size or already resized
	[ -f $MOUNT_POINT/.fixed -o -f $MOUNT_POINT/.resized ] && return

	if [ -z "$FSRESIZE" ]; then
		echo "No resize for $FSTYPE"
		return
	fi

	echo "Resizing $DEV($FSTYPE)"

	# Online resize needs read-write
	remount_part rw
	if eval $FSRESIZE; then
		touch $MOUNT_POINT/.resized
		return
	fi

	echo "Done with rootfs"
	is_rootfs && return

	echo "Fallback to format resize"
	TEMP_BACKUP=$(mktemp -d)
	format_resize $TEMP_BACKUP && touch $MOUNT_POINT/.resized
	rm -rf $TEMP_BACKUP
}

erase_oem_command()
{
	CMD=$1
	FILE=$2

	echo "OEM: Erasing $CMD in $FILE"

	COUNT=$(echo $CMD | wc -c)
	OFFSETS=$(strings -t d $FILE | grep -w "$CMD" | awk '{ print $1 }')

	for offset in $OFFSETS; do
		dd if=/dev/zero of=$FILE bs=1 count=$COUNT seek=$offset conv=notrunc 2>/dev/null
	done
}

done_oem_command()
{
	CMD=$1

	echo "OEM: Done with $CMD"

	if [ -b "$MISC_DEV" ]; then
		erase_oem_command $CMD $MISC_DEV
	else
		echo "OEM: Erase $CMD from mtd device"

		check_tool nanddump BR2_PACKAGE_MTD_NANDDUMP || return
		check_tool nandwrite BR2_PACKAGE_MTD_NANDWRITE || return
		check_tool flash_erase BR2_PACKAGE_MTD_FLASH_ERASE || return

		TEMP=$(mktemp)
		nanddump $MISC_DEV -f $TEMP
		erase_oem_command $CMD $TEMP
		flash_erase $MISC_DEV 0 0
		nandwrite $MISC_DEV $TEMP
	fi
}

handle_oem_command()
{
	[ "$OEM_CMD" ] || return

	for cmd in $OEM_CMD; do
		case $cmd in
			cmd_wipe_$PART_NAME)
				is_rootfs && continue

				echo "OEM: $cmd - Wiping $DEV"
				format_part && done_oem_command $cmd
				;;
		esac
	done
}

convert_mount_opts()
{
	# Accept all opts by default for standard mount tool
	if [ -z "$@" ] && [ "$(readlink $(which mount))" != busybox ]; then
		echo $OPTS
		return
	fi

	# Filter out unsupported opts
	for opt in ${@:-$BUSYBOX_MOUNT_OPTS}; do
		echo ${OPTS//,/ } | xargs -n 1 | grep -oE "^$opt$"
	done | tr "\n" ","
}

prepare_part()
{
	# Ignore external storages
	echo $MOUNT_POINT | grep -q "^\/mnt\/" && return 1

	# Find real dev for root dev
	if is_rootfs; then
		DEV=$(findmnt -n -o source /)

		# Fallback to the by-name link
		[ "$DEV" ] || DEV=/dev/block/by-name/rootfs
	fi

	DEV=$(realpath $DEV 2>/dev/null)
	PART_NO=$(echo $DEV | grep -oE "[0-9]*$")

	# Unknown device
	[ -b "$DEV" -o -c "$DEV" ] || return 1

	SYS_PATH=$(echo /sys/class/*/${DEV##*/})
	if [ -f "$SYS_PATH/name" ]; then
		PART_NAME=$(cat $SYS_PATH/name)
	else
		PART_NAME=$(grep PARTNAME ${SYS_PATH}/uevent | cut -d '=' -f 2)
	fi
	PART_NAME=${PART_NAME:-${DEV##*/}}

	case $FSTYPE in
		ext[234])
			FSGROUP=ext2
			FSCK="fsck.$FSTYPE -y"
			FSCK_CONFIG=BR2_PACKAGE_E2FSPROGS_FSCK
			FSRESIZE=resize_ext2
			;;
		msdos|fat|vfat)
			FSGROUP=vfat
			FSCK="fsck.vfat -y"
			FSCK_CONFIG=BR2_PACKAGE_DOSFSTOOLS_FSCK_FAT
			FSRESIZE=resize_vfat
			;;
		ntfs)
			FSGROUP=ntfs
			FSCK=ntfsfix
			FSCK_CONFIG=BR2_PACKAGE_NTFS_3G_NTFSPROGS
			FSRESIZE=resize_ntfs
			;;
		ubi|ubifs)
			FSGROUP=ubifs
			unset FSCK
			unset FSRESIZE
			;;
		squashfs)
			FSGROUP=squashfs
			unset FSCK
			unset FSRESIZE
			;;
		jffs2)
			FSGROUP=jffs2
			unset FSCK
			unset FSRESIZE
			;;
		auto)
			FSGROUP=auto
			echo "Running fsck on a random fs is dangerous"
			unset FSCK
			unset FSRESIZE
			;;
		*)
			echo "Unsupported file system $FSTYPE for $DEV"
			return
	esac

	# Setup mount tool and opts
	case $FSGROUP in
		ntfs)
			MOUNT=ntfs-3g
			check_tool ntfs-3g BR2_PACKAGE_NTFS_3G || return 1
			OPTS=$(convert_mount_opts "$NTFS_3G_MOUNT_OPTS")
			;;
		ubifs)
			MOUNT="mount -t ubifs"
			OPTS=$(convert_mount_opts)
			;;
		*)
			MOUNT=mount
			OPTS=$(convert_mount_opts)
			;;
	esac
	MOUNT_OPTS=${OPTS:+" -o ${OPTS%,}"}

	# Prepare for ubi (consider /dev/mtdX as ubiblock)
	if [ "$FSGROUP" = ubifs ] || echo $DEV | grep -q "/dev/mtd[0-9]";then
		if ! prepare_ubi; then
			echo "Failed to prepare ubi for $DEV"
			[ "$AUTO_MKFS" ] || return

			echo "Auto formatting"
			format_ubifs || return
		fi
	fi
}

check_part()
{
	[ "$SKIP_FSCK" -o "$PASS" -eq 0 ] && return

	if [ -z "$FSCK" ]; then
		echo "No fsck for $FSTYPE"
		return
	fi

	echo "Checking $DEV($FSTYPE)"

	check_tool "$FSCK" $FSCK_CONFIG || return

	# Fsck needs read-only
	remount_part ro

	$FSCK $DEV
}

mount_part()
{
	echo "Mounting $DEV($FSTYPE) on $MOUNT_POINT ${MOUNT_OPTS:+with$MOUNT_OPTS}"
	$MOUNT $DEV $MOUNT_POINT $MOUNT_OPTS && return
	[ "$AUTO_MKFS" ] || return

	echo "Failed to mount $DEV, try to format it"
	format_part && \
		$MOUNT $DEV $MOUNT_POINT $MOUNT_OPTS
}

~~~

​	然后继续创建一个名为resize-helper的脚本文件，向该文件添加以下内容：

~~~shell
vim resize-helper
~~~



~~~shell
#!/bin/sh
### BEGIN INIT INFO
# Provides:       resize-all
# Default-Start:  S
# Default-Stop:
# Description:    调整所有已挂载的内部分区的大小
### END INIT INFO

# 不在错误状态下退出
set +e

# 取消以下注释以查看更多日志
# set -x

# 包含 disk-helper 脚本
. $(dirname $0)/disk-helper

LOGFILE=/tmp/resize-all.log

do_part()
{
    DEV=$1
    MOUNT_POINT=$2
    FSTYPE=$3
    OPTS=$4

    echo "处理 $DEV $MOUNT_POINT $FSTYPE $OPTS"

    # 设置检查/挂载工具并进行一些准备工作
    prepare_part || return

    # 存储 ro/rw
    MOUNTED_RO_RW=$(touch $MOUNT_POINT &>/dev/null && echo rw || echo ro)

    # 如果需要，调整分区大小
    resize_part

    # 恢复 ro/rw
    remount_part $MOUNTED_RO_RW
}

resize_all()
{
    echo "将调整 /proc/mounts 中的所有分区大小"

    while read LINE; do
        do_part $LINE
    done < /proc/mounts
}

case "$1" in
    start|"")
        resize_all 2>&1 | tee $LOGFILE
        echo "日志保存至 $LOGFILE"
        ;;
    *)
        echo "用法: resize-helper start" >&2
        exit 3
        ;;
esac
~~~

​	该脚本的主要功能是在系统引导时调整所有已挂载的内部分区的大小，保存退出之后，使用以下命令给予两个脚本的可执行权限，如下图所示：
~~~
chmod 777 resize-helper disk-helper
~~~

![image-20231121225448900](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311212254933.png)

然后在etc/init.d目录下创建一个名为resize-disk.sh的开机启动项，内容如下所示：

~~~shell
#!/bin/bash -e
# Description:  调整 Rockchip 平台环境下的磁盘大小
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

case "$1" in
    start)
        if [ ! -e /var/lib/misc/firstrun ]; then
            /usr/bin/resize-helper  # 调用 resize-helper 脚本来调整磁盘大小
            mkdir -p /var/lib/misc  # 创建目录 /var/lib/misc
            touch /var/lib/misc/firstrun  # 创建文件 /var/lib/misc/firstrun
        fi
        ;;
    stop)
        ;;
    restart|reload)
        ;;
    *)
        echo "用法: $0 {start|stop|restart}"
        exit 1
esac

exit $?
~~~

该脚本是一个初始化脚本（init script），用于在第一次启动系统时，运行/usr/bin/resize-helper调整磁盘大小。现在只是创建了该脚本，接下来向系统中添加相应的服务，让该脚本开机自动运行，首先来到/usr/lib/systemd/system目录下，创建一个名为resize-disk.service的服务，然后向该服务中添加以下内容

~~~
cd /usr/lib/systemd/system
vi resize-disk.service
~~~

~~~shell
#start
[Unit]
Description=Resize disk for rockchcip platform
After=lighdm.service

[Service]
Type=simple
ExecStart=/etc/init.d/resize-disk.sh start

[Install]
WantedBy=multi-user.target
#end
~~~

该服务会运行/etc/init.d/resize-disk.sh脚本，该脚本

保存退出之后，使用以下命令创建该文件的软链接到/etc/systemd/system/sysinit.target.wants/目录下

~~~
ln -s /usr/lib/systemd/system/resize-disk.service /etc/systemd/system/sysinit.target.wants/resize-disk.service
~~~

![image-20231122073214553](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311220732603.png)

​	至此，关于自动扩容相关的配置也就完成了，这时候如果制作烧写镜像进入系统之后会自动扩容，最终效果如下所示：
![image-20231122073421803](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311220734847.png)

### 7.4.9配置ADB

瑞芯微在很多地方要用到adb服务，例如在RKNPU中要用到的连扳推理，PC端向开发板传输文件都要使用adb服务，所以在本小节将对adb服务进行适配。

本小节要用到了文件已经放在了“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\02_配置ADB”目录下，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023023.jpg) 

首先进入/usr/lib/systemd/system/目录，创建一个名为usbdevice.service的服务，该服务的内容如下所示：

~~~
[Unit]
Description=Manage USB device functions
DefaultDependencies=no
After=local-fs.target

[Service]
Type=forking
ExecStart=/usr/bin/usbdevice start 
ExecStop=/usr/bin/usbdevice stop
[Install]
WantedBy=sysinit.target
~~~

保存退出之后，继续使用以下命令创建该文件的软链接到/etc/systemd/system/sysinit.target.wants/目录下，如下图所示

ln -s /usr/lib/systemd/system/usbdevice.service /etc/systemd/system/sysinit.target.wants/usbdevice.service

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023029.jpg) 

然后进入/usr/lib/udev/rules.d目录下，创建一个名为61-usbdevice.rules的规格，具体内容如下所示：

~~~
SUBSYSTEM=="android_usb",ACTION=="change",RUN+="/usr/bin/usbdevice update"  
~~~

这个规则定义了一个触发条件，即当系统中的Android USB设备发生更改时（例如插入或拔出设备），将运行一个特定的命令/usr/bin/usbdevice update，然后将提供资料里的usbdevice脚本和adbd拷贝到/usr/bin目录下（需要打开一个终端进行操作），拷贝完成如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023030.jpg)

然后使用以下命令赋予两个文件可执行权限，如下图所示：

~~~~~shell
chmod 777 adbd usbdevice
~~~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023031.jpg) 

最后来到/etc/profile.d/目录下创建一个名为usbdevice.sh的文件，/etc/profile.d/目录是用于存放系统级别的配置文件的目录。当用户登录时，系统会自动执行/etc/profile文件，然后向usbdevice.sh文件写入以下内容：

~~~shell
#!/bin/sh
  
# The env variables below can be overridden

# option: adb acm hid mtp ntb rndis uac1 uac2 ums uvc
export USB_FUNCS="adb"       
export UMS_FILE=/userdata/ums_shared.img
export UMS_SIZE=256M
export UMS_FSTYPE=vfat
export UMS_MOUNT=0
export UMS_MOUNTPOINT=/mnt/ums
export UMS_RO=0
~~~

其中要注意的是第6行的内容，表示默认模式为ADB，也有其他的几种模式，如果后续用到会进行说明，至此，关于adb的配置就完成了，镜像打包之后烧写到开发板上，在RK的烧写软件中会显示“发现了一个ADB设备”，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023035.jpg)

然后将ADB设备连接到虚拟机ubuntu上，连接成功之在左侧后会有一个手机的图标，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023033.jpg)

首先输入“adb devices”命令查看adb设备如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023203.jpg)

然后使用以下命令将测试文件test通过adb传输到开发板的根目录，传输过程如下所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023212.jpg)

然后查看开发板的根目录，可以看到test文件已经成功传输，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023222.jpg)

至此，关于adb的测试就完成了。

### 7.4.10配置终端和桌面自动登录

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\03_终端和桌面自动登录”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023229.jpg) 

为了方便，本小节将取消ubuntu启动时的终端登录和桌面的登录，默认让终端登录进root用户，桌面默认登录topeet用户，首先输入以下命令修改终端设置选项：

~~~
vim /lib/systemd/system/serial-getty\@.service
~~~

然后将ExecStart选项修改为以下内容，修改完成如下图所示：

~~~
ExecStart= -/sbin/agetty --autologin root --noclear %I $TERM
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023238.jpg) 

至此，串口终端自动登录root用户就设置完成了，然后设置桌面自动登录，在安装桌面章节默认显示管理器使用的是lightdm，所以这里需要将提供资料里面的lightdm.conf拷贝到/etc/lightdm目录下，拷贝完成如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023246.jpg) 

涉及到自动登录的内容为该配置文件的126行和127行，具体内容如下所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023348.jpg)

这里默认登录的为topeet用户，如果想要自动登录其他用户自行修改即可，打包镜像，烧写到开发板上之后，可以看到终端已经自动登录进入了系统，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023362.jpg)

在图形界面也跳过了登录界面，自动进入了桌面，进入桌面之后如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023376.png)

至此终端和桌面自动登录的设置就完成了。

### 7.4.11配置以太网络

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\05_以太网配置”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023386.jpg) 

现在系统启动之后如果使用“ifconfig”命令查看网络可以发现只有一个本地回环生效了，其他的并未生效，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023392.jpg)

所以需要对网络进行一些配置，首先对“/etc/NetworkManager/NetworkManager.conf”文件进行修改，将ifupdown从false设置为true，修改完成如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023399.jpg)

通过将[ifupdown]部分中的managed选项设置为true，可以启用 NetworkManager 对 ifupdown 工具的集成。这意味着 NetworkManager 将读取和解释 /etc/network/interfaces 文件中的配置，并使用自己的机制来管理这些网络接口。

然后修改/usr/lib/NetworkManager/conf.d/10-globally-managed-devices.conf配置文件，修改为以下内容

~~~
[keyfile] 
unmanaged-devices=*,except:type:wifi,except:type:ethernet,except:type:gsm,except:type:cdma
~~~

这个规则的作用是告诉 NetworkManager 不要自动管理除了Wi-Fi、以太网、GSM 和 CDMA 设备之外的其他类型的网络设备。这样可以确保这些设备不受 NetworkManager 的干预，并允许其他工具或配置来处理它们。

至此关于网络相关的配置就完成了。打包镜像重新烧写之后，重新使用“ifconfig”命令查看网络配置，可以看到eth0和eth1已经出现了，由于现在只是插着一根网线，所以只有eth1获取到了ip，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023546.jpg)	

当使用“apt-get update”命令进行软件源更新的时候可能出现以下打印，这是因为证书过期所导致的：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023562.jpg) 

该问题可以通过输入下面两条命令来解决，如下图所示：

~~~
touch /etc/apt/apt.conf.d/99verify-peer.conf

echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023572.jpg) 

至此，关于网络相关的配置就完成了。

### 7.4.12配置蓝牙WIFI

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\06_配置蓝牙WIFI”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023578.jpg) 

由于迅为使用的蓝牙WIFI模块为8723du，该模块若想正常使用，需要在系统启动之后通过ko的形式进行加载，所以本小节将会讲解如何让模块开机之后自动被加载。

首先进入到/usr/local/bin目录下，创建一个名为wifi_blue.sh的脚本文件，然后向该脚本中添加以下内容：

~~~shell
#!/bin/bash
insmod /usr/local/modules/8723du.ko
insmod /usr/local/modules/rtk_btusb.ko    
rfkill unblock bluetooth
hciconfig hci0 up
~~~

该脚本的作用就是加载蓝牙和WIFI两个KO模块，保存退出之后使用chmod命令给予该脚本可执行权限，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023584.jpg)

这时候只是有了可以加载驱动的脚本，然后来到/usr/lib/systemd/system目录下创建一个名为wifibt.service的开机自动运行服务，向该服务中添加以下内容

~~~
#start
[Unit]
Description=insmod topeet wifi_blue modules
After=lighdm.service

[Service]
Type=forking
ExecStart=/usr/local/bin/wifi_blue.sh

[Install]
WantedBy=multi-user.target
#end
~~~

该服务的目的就是开机运行/usr/local/bin/wifi_blue.sh脚本，从而加载WIFI和蓝牙模块，让两个功能正常使用，然后使用以下命令创建该服务的软链接，创建完成如下图所示：

~~~shell
ln -s /usr/lib/systemd/system/wifibt.service /etc/systemd/system/sysinit.target.wants/
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023685.jpg) 

接下来需要在/usr/local/目录下创建一个名为modules的目录，然后将提供资料里的两个ko文件拷贝到该目录下，拷贝完成如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023716.jpg) 

需要注意的是，在资料中提供的这两个ko文件只适用于内核版本为4.19的系统，如果是其他版本的系统可以自行替换对应的ko文件。

初次之外蓝牙的正常运行还需要相应的固件，所以还需要资料中提供的rtl8723du_config和rtl8723du_fw两个固件拷贝到/usr/lib/firmware目录下，拷贝完成如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023722.jpg)

至此，关于蓝牙WIFI相关的配置就完成了。打包镜像并烧写到开发板上，来到图形界面，可以看到蓝牙已经可以正常的搜索到设备了，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023728.png)

在右上角的网络设置中也可以搜索到相应的WIFI，如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023739.png)

至此，关于蓝牙WIFI 的相关配置就完成了。

### 7.4.13配置ssh允许root登录

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\04_ssh 允许root登录”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023770.jpg) 

默认情况下ssh是不能root用户登录的，为了方便调试，可以通过修改sshd的配置文件来允许ssh root登录。

sshd的配置文件为“/etc/ssh/sshd_config”，打开该文件找到下图所示的内容：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023832.jpg)

然后修改为以下内容，修改完成如下图所示：】

~~~
PermitRootLogin yes
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023859.jpg) 

至此，关于ssh有关的配置就修改完成了。然后打包镜像烧写到开发板，进入系统之后查看开发板的ip地址为192.168.1.168，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023871.jpg) 

然后通过ssh软件通过root用户连接，连接设置如下所示：


![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023943.jpg)

连接成功如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023992.jpg)

至此，关于ssh允许root登录的设置就完成了。

### 7.4.14安装rga deb包

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\07_rga”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023026.jpg) 

注：这里提供的仅仅只是ubuntu20 rga相关的deb包，如果是其他系统并不适用。

RGA是Rockchip（瑞芯微电子）公司开发的图像处理技术，主要应用于他们的系统芯片中。RGA技术在Rockchip的芯片中集成了一个专门的硬件模块，用于加速2D图形操作。这个硬件模块通常被称为RGA硬件加速器。

RGA会对图形界面有一定的加速效果，而且后面在安装GPU相关库的部分也会用到RGA，所以这里先来安装一下RGA相关的deb包。

首先将deb包拷贝到构建的ubuntu文件系统中，拷贝完成如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023034.jpg)

然后使用以下命令进行安装,安装过程如下所示：

~~~shell
dpkg -i librga-dev_2.2.0-1_arm64.deb
dpkg -i librga2_2.2.0-1_arm64.deb
dpkg -i librga2-dbgsym_2.2.0-1_arm64.deb
~~~

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222023053.jpg) 

至此，RGA相关的库就安装完成了。

### 7.4.15 安装mpp deb包

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\08_mpp”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226972.jpg) 

注：这里提供的仅仅只是ubuntu20 mpp相关的deb包，如果是其他系统并不适用。

MPP（Media Processing Platform）是一种多媒体处理平台，用于实现音频和视频数据的处理、编解码和处理。MPP 提供了一组丰富的功能和算法，用于处理各种多媒体数据，并且能够在硬件加速的环境下提供高效的处理性能。

以下是 MPP 的主要作用：

（1）视频编解码：MPP 提供了各种视频编解码器，如 H.264、H.265、MPEG-2 等。这些编解码器能够将视频数据进行压缩（编码）和解压缩（解码），以满足不同应用场景对视频数据的存储和传输需求。通过硬件加速，MPP 可以提供高效的视频编解码性能，减轻 CPU 的负担。

（2）图像处理：MPP 包含了一系列图像处理算法，如图像缩放、旋转、裁剪、色彩空间转换等。这些算法可以对图像进行各种操作和转换，以满足不同应用场景对图像处理的需求。MPP 的硬件加速能力可以加快图像处理的速度，并提供更高的效率。

（3）音频编解码：除了视频编解码，MPP 还提供了音频编解码的功能。它支持常见的音频编码格式，如 AAC、MP3、AC3 等。通过 MPP，可以对音频数据进行高效的压缩和解压缩，实现音频的存储、传输和处理。

（4）多媒体处理流程管理：MPP 提供了一个统一的框架和接口，用于管理和控制多媒体处理流程。它可以对多个媒体处理单元进行调度和协调，实现复杂的多媒体处理任务。MPP 还提供了丰富的配置选项和参数设置，以满足不同应用场景的需求。

MPP包的安装方法跟上面RGA包的安装方法相同，首先将资料中提供的MPP包拷贝到构建的ubuntu文件系统中，拷贝完成如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226970.jpg)

然后使用以下命令进行安装,安装过程如下所示：

dpkg -i librockchip-mpp1_1.5.0-1_arm64.deb 

dpkg -i librockchip-mpp-dev_1.5.0-1_arm64.deb

dpkg -i librockchip-vpu0_1.5.0-1_arm64.deb 

dpkg -i rockchip-mpp-demos_1.5.0-1_arm64.deb

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226980.jpg) 

至此，MPP相关的库就安装完成了，打包镜像，然后烧写到开发板，开发板启动之后，在开发板终端输入以下命令用来监控系统打印，如下图所示：

tail -f /var/log/syslog &

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226975.jpg) 

然后输入以下命令通过mpi_dec_test命令调用mpp进行视频的解码，将[h264](https://so.csdn.net/so/search?q=h264&spm=1001.2101.3001.7020)转为yuv，解码过程如下图所示：

mpi_dec_test -i /oem/200frames_count.h264 -t 7 -n 250 -o /home/topeet/test.yuv -w 640 -h 480

 ![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226973.jpg)

解码完成之后在/home/topeet/目录下生成了解码为yuv格式的test.yuv文件，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226987.jpg) 

然后继续使用mpi_enc_test命令进行视频的编码，将上面解码出来的yuv转为h264格式，编码过程如下图所示：

mpi_enc_test -i /home/topeet/test.yuv -t 7 -n 250 -o /home/topeet/test.h264 -w 640 -h 480 -fps 25

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226355.jpg) 

编码完成之后在/home/topeet/目录下生成了编码为h264格式的test.h26文件，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226373.jpg) 

至此，关于MPP的相关测试就完成了。

### 7.4.16 安装gpu deb包

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\09_gpu”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226388.jpg) 

注：这里提供的仅仅只是ubuntu20 gpu相关的deb包，如果是其他系统并不适用。

首先将上面提供资料里的xserver相关deb包拷贝到要构建的ubuntu系统中，拷贝完成如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226397.jpg) 

然后使用以下命令进行deb包的安装，安装过程如下所示：
dpkg -i xserver-common_1.20.13-1ubuntu1~20.04.9_all.deb

dpkg -i xserver-xorg-core_1.20.13-1ubuntu1~20.04.9_arm64.deb 

dpkg -i xserver-xorg-dev_1.20.13-1ubuntu1~20.04.9_arm64.deb 

dpkg -i xserver-xorg-legacy_1.20.13-1ubuntu1~20.04.9_arm64.deb

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226407.jpg) 

中间在安装xserver-xorg-core_1.20.13-1ubuntu1~20.04.9_arm64.deb包时出现了错误，这里我们使用“apt-get install -f”命令进行修复即可，修复过程如下所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226421.jpg)

修复完成之后将提供资料中的libmali库同样拷贝构建的ubuntu系统中，拷贝完成如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226522.jpg) 

然后使用以下命令进行安装，安装过程如下所示：

dpkg -i libmali-bifrost-g52-g13p0-x11-gbm_1.9-1_arm64.deb

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226531.jpg) 

至此，关于GPU 相关库的安装就完成了，

### 7.4.17 清除安装的软件包

经过了上面的一些步骤已经对构建的ubuntu进行了简单的配置，但在配置的过程中也下载了很多的软件包，这些软件包会占用很多的空间，所以在配置完成之后运行下面的命令清除安装的软件包，如下图所示：

apt-get -y clean && apt-get -y autoclean

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226543.jpg) 

 

 

 

 

 

### 7.4.18 退出chroot环境

设置好以后就可以退出根文件系统了，输入命令“exit”退出。如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226565.jpg) 

然后通过以下命令取消binary目录的挂载，如下图所示：

./mount.sh -u binary/

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226608.jpg) 

## 7.5 文件系统镜像的制作

本小节要用到的文件路径为“iTOP-3568开发板\03_【iTOP-RK3568开发板】指南教程\03_文件系统构建配套资料\04_Ubuntu和Debian系统构建配套资料\10_制作烧写镜像”，如下图所示：

![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226627.jpg) 

首先将上述资料中提供的mk-image.sh和post-build.sh脚本拷贝到虚拟机ubutnu上，而且要跟构建的binary目录放到同一目录下，拷贝完成如下所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226706.jpg)
	然后使用以下命令赋予两个脚本可执行权限，如下图所示：

chmod 777 mk-image.sh post-build.sh
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226714.jpg)

然后运行mk-image.sh脚本即可完成烧写镜像的制作了，制作过程如下图所示：
![img](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311222226722.jpg)

制作完成之后会在当前目录生成一个名为rootfs.img的烧写镜像，只需要根据烧写手册进行单独烧写即可。至此，关于Ubuntu和Debian文件系统的构建就讲解完成了。

 

 