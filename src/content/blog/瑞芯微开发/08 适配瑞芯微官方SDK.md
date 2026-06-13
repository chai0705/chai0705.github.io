---
description: "!Rockchip bootflow.jpghttps://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272155420.jpeg 瑞芯微的分区表如上图所示，虽然在瑞芯微的wiki中提供了一些简单的开源介绍，但是我是没有见过的。，，很坑，所以"
cover: /img/cover/4.webp

title: 适配瑞芯微官方SDK
date: 2023-09-27 20:47:53
categories:
  - 瑞芯微开发
link: 瑞芯微开发/08 适配瑞芯微官方SDK
---

![Rockchip bootflow.jpg](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272155420.jpeg)

瑞芯微的分区表如上图所示，虽然在瑞芯微的wiki中提供了一些简单的开源介绍，但是我是没有见过的。，，很坑，所以还是以瑞芯微的开放SDK进行移植

# 1. miniloader

瑞芯微官方miniloader路径为https://github.com/rockchip-linux/rkbin.git

首先克隆官方的rkbin，瑞芯微提供了闭源的的二进制文件

~~~
git clone https://github.com/rockchip-linux/rkbin.git
~~~

拉取完成如下图所示：
![image-20230927215856386](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272158411.png)

![image-20230927215908314](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272159325.png)

瑞芯微的README如下所示：

```
Rockchip loader binaries naming rule

总则：
不管单个模块，还是合并后的loader，命名都采用
[chip]_[module]_[feature]_[version].[postfix]

chip: 芯片或芯片系列名称, 必选项, 与所有kernel/uboot driver中的名称保持一致, 具体命名方式不在此讨论, 小写
module: 模块名称, 必选项, 如loader, ddr, miniloader，usbplug,bl3x,tee,tee_ta，小写
feature: 模块特征, 可选项, 可多个, 如ddr使用的频率, 或者只支持某个特定的ddr, miniloader的特别选项等, 小写
version: 版本信息, 必选项, 格式采用[v1.00,], 正式发布之前为0.xx, 正式发布后为1.00以后，小写
postfix: 后缀名, 必选项, 代码编译出来的默认为.bin, 也有可能为.elf, 合并后为.img，小写
连接符号采用下划线“_”
例如：
ddr模块提供的文件
rk3228_ddr3_800MHz_v1.06.bin

特殊规则：
1. 合并后的loader命名:
    loader: 由ddrbin, usbplug, miniloader合并而成可用于Windows RK升级工具使用的loader;
    ubootloader: 由ddrbin, usbplug, U-Boot合并而成可用于Windows RK升级工具使用的loader;
    idbloader: 由ddrbin, 一级loader(miniloader或uboot)按IDB格式合并直接用于烧写到IDB区的binary;
    注: miniloader的命名, 仅表示miniloader工程编译输出的bin, 不再延续到合并后的loader中使用;
2. 合并后的loader的version定义:
    vx.yy.zzz
v:  version的意思，一直采用这个字符，小写
x.yy: ddr所提供文件的版本号，小写
zzz: [1]是miniloader所提供文件的版本号，去掉点号的，小写
     [2]uboot提供的版本号

3. 命名小写会引起歧义的，就用大写
如ddr的GB，不能写成gb
举例：
合并好的loader命名：
rk3328_loader_v1.03.106.bin
其中的1.03是ddr的版本号v1.03
106是miniloader的版本号v1.06去掉点号的
```

接下来对这些目录的内容进行介绍

1. **bin/**：通常用于存放可执行文件（二进制文件）

![image-20230927220321625](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272203645.png)

进入该目录之后又有一系列的子目录，我们要适配的是3588，所以要进入rk35的目录，具体内容如下所示：
![image-20230927220422326](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272204357.png)

根据名称来看总共是有两种类型的二进制文件，分别为rk**ddr*的tpl 和 rk“**”spl的spl，第一个用来进行初始化内存，然后加载spl，spl用来初始化时钟等其他外设，这里我们用到的应该是rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin和rk3588_spl_v1.12.bin两二进制文件，

2.**doc/**目录，通常用于存放文档文件。在这个目录下，有着更新时候的一些说明，如下图所示：
![image-20230927221327879](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272213894.png)

3.img目录根3588无关不用理会。

4.**LICENSE**：通常用于存放软件或项目的许可证信息

5.README**：是一个简要的说明文件

6.**RKBOOT/**：它可能包含与引导（Boot）相关的文件、脚本或配置。具体内容如下所示：
![image-20230927221534210](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272215234.png)

这个其实是后面讲到uboot make.sh时候的说明，用来将spl和tpl整合成一个完整的miniloader的，我们要用到的是RK3588MINIALL.ini，具体内容如下所示：、

![image-20230927221754711](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272217736.png)

Path1=bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin

FlashData=bin/rk35/rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin

FlashBoot=bin/rk35/rk3588_spl_v1.12.bin

PATH=rk3588_spl_loader_v1.12.112.bin

7.**RKBOOT.ini**：不用管

8.**RKTRUST/**：这是一个目录，可能与 Rockchip 平台安全性（Trust）相关。根据目录名称，它可能包含与安全启动、安全引导或安全认证相关的文件、脚本或配置。

![image-20230927221941937](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309272219951.png)

​	这也是一些ini文件，这是基于开源的bl31和bl32来的，上面的两个流程呀，属于第二条，闭源的miniloader属于第一条。

1. **scripts/**：checkpatch.sh只有这一个脚本，看了一下应该没啥用，应该是瑞芯微用于检查时候的一个脚本，
2. 这些脚本可以用于自动化任务、配置设置、编译构建等。
3. **tools/**：这是一个目录，通常用于存放工具文件。工具文件可以是用于特定任务或目的的实用程序、应用程序或脚本。这些工具可以帮助你完成各种操作，如调试、分析、转换等。

ddrbin_tool_user_guide.txt 是ddrbin_tool的使用说明，倒是还挺详细，我们要改的是ddr相关的tpl，重要内容整理如下

**功能 1：从 ddrbin_param.txt 修改 ddr.bin 文件。**

1. 修改 'ddrbin_param.txt' 文件，设置你想要的 DDR 频率、UART 信息等。如果想保持默认值，请将这些项目留空。
2. 运行 'ddrbin_tool'，并使用以下参数：参数 1 为 ddrbin_param.txt，参数 2 为 ddr.bin 文件。
   例如：./ddrbin_tool ddrbin_param.txt px30_ddr_333MHz_v1.13.bin

**功能 2：将 ddr.bin 文件的配置保存到 gen_param.txt 文件中。**
如果想要获取 ddr.bin 文件的配置，请执行以下操作：
./ddrbin_tool -g gen_param.txt px30_ddr_333MHz_v1.15.bin
配置信息将显示在 gen_param.txt 文件中。



而我要修改的是rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin，想用功能2 保存到 gen_param.txt

~~~shell
./ddrbin_tool -g  gen_param.txt rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin
~~~

![image-20231003175311976](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031753004.png)

![image-20231003175354464](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031753485.png)

修改之后还需要重新生成bin文件

~~~
./ddrbin_tool gen_param.txt rk3588_ddr_lp4_2112MHz_lp5_2736MHz_v1.12.bin
~~~

**![image-20231003175617140](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031756166.png)**

修改的地方只有这里的115200，其他倒是没关，然后就是看看如何整合spl和tpl了，整合成一个完整的loader.bin

这里我就不用uboot的的make.sh了，而是找到他的命令和makefile具体内容如下所示：
~~~shell
function pack_loader_image()
{
	rm -f *loader*.bin *download*.bin *idblock*.img
	cd ${RKBIN}
	DEF_PATH=${RKBIN}/`filt_val "^PATH" ${INI_LOADER}`
	IDB_PATH=${RKBIN}/`filt_val "IDB_PATH" ${INI_LOADER}`
	${SCRIPT_LOADER} --ini ${INI_LOADER}
	cd -
	if [ -f ${DEF_PATH} ]; then
		mv ${DEF_PATH} ./
	fi
	if [ -f ${IDB_PATH} ]; then
		mv ${IDB_PATH} ./
	fi
}
~~~



~~~shell
#!/bin/bash
#
# Copyright (c) 2020 Rockchip Electronics Co., Ltd
#
# SPDX-License-Identifier: GPL-2.0
#

set -e

if [ $# -eq 0 ]; then
	echo "ERROR: No args of $0"
	exit 1
fi

while [ $# -gt 0 ]; do
	case $1 in
		--ini)
			INI=$2
			shift 2
			;;
		*)
			echo "ERROR: Unknown arg: $1"
			exit 1
			;;
	esac
done

if [ ! -f ${INI} ]; then
	echo "pack loader failed! Can't find: ${INI}"
	exit 0
fi

COUNT=`cat ${INI} | wc -l`
if [ ${COUNT} -eq 1 ]; then
	IMG=`sed -n "/PATH=/p" ${INI} | tr -d '\r' | cut -d '=' -f 2`
	cp ${IMG} ./
else
	./tools/boot_merger ${INI}
fi

echo "pack loader okay! Input: ${INI}"
~~~

最后用的还是boot_merger这个工具。

~~~shell
./tools/boot_merger RKBOOT/RK3588MINIALL.ini
~~~



![image-20231003181000745](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031810759.png)

关于spl和tpl就这样了，然后是uboot

# 2.uboot

克隆源码

~~~shell
 git clone https://github.com/rockchip-linux/u-boot.git
~~~

![image-20231003184552359](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031845388.png)

修改make menuconfig，rk3588的默认配置文件为./configs/rk3588_defconfig

![image-20231003185216305](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031852329.png)

~~~
export arch=arm64
make rk3588_defconfig
make menuconfig
~~~

![image-20231003185541087](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031855129.png)

目前只需要将这里的uboot修改为115200即可，然后重新保存configs/rk3588_defconfig，重新编译

~~~shell
export arch=arm64
make rk3588_defconfig
make CROSS_COMPILE="aarch64-linux-gnu-" -j32
modules_install
~~~

![image-20231003185809741](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031858771.png)

编译完这里的uboot.img就是我们需要的镜像，不对，后来发现事情并不是想的那样，理论上应该是uboot.img这里的选择不对。所以接下来去寻找uboot.img的生成流程

实际应该是

~~~
./make.sh rk3588 CROSS_COMPILE=aarch64-linux-gnu-
~~~

![image-20231003192010183](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310031920218.png)

~~~shell
# 编译uboot.itb
make CROSS_COMPILE="aarch64-linux-gnu-" -j32 u-boot.itb
~~~

![image-20231005103717571](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310051037632.png)

但是并没有找到源头，然后找一下make.sh的内容具体内容如下所示：

~~~shell
# 打包生成uboot镜像
function pack_uboot_image()
{
	rm u-boot.img u-boot-dtb.img -f
	LOAD_ADDR=`sed -n "/CONFIG_SYS_TEXT_BASE=/s/CONFIG_SYS_TEXT_BASE=//p" include/autoconf.mk|tr -d '\r'`
	if [ -z "${LOAD_ADDR}" ]; then
		# upstream U-Boot
		LOAD_ADDR=`grep CONFIG_SYS_TEXT_BASE include/generated/autoconf.h | awk '{ print $3 }' | tr -d '\r'`
	fi

	if [ -z "${LOAD_ADDR}" ]; then
		echo "ERROR: No CONFIG_SYS_TEXT_BASE for u-boot";
		exit 1
	fi

	${SCRIPT_UBOOT} --load ${LOAD_ADDR} ${PLAT_UBOOT_SIZE}
}
~~~

SCRIPT_UBOOT="${SRCTREE}/scripts/uboot.sh"

LOAD_ADDR=0x00200000

--size 2048 1

configs/rk3588-ramboot.config:4:CONFIG_UBOOT_SIZE_KB=2048

configs/rk3588-ramboot.config:5:CONFIG_UBOOT_NUM=1

可行的代码为

~~~shell
./scripts/uboot.sh --load  0x00200000 --size 2048 1
~~~



uboot.sh内容如下所示：

~~~shell
#!/bin/bash
#
# Copyright (c) 2020 Rockchip Electronics Co., Ltd
#
# SPDX-License-Identifier: GPL-2.0
#

set -e

if [ $# -eq 0 ]; then
        echo "ERROR: No args of $0"
        exit 1
fi

while [ $# -gt 0 ]; do
        case $1 in
                --load)
                        LOAD_ADDR=$2
                        shift 2
                        ;;
                --size)
                        SIZE="$1 $2 $3"
                        shift 3
                        ;;
                *)
                        echo "ERROR: Unknown arg: $1"
                        exit 1
                        ;;
        esac
done

rm uboot.img -f

if [ -z "${LOAD_ADDR}" ]; then
        echo "ERROR: No load address"
        exit 1
fi

HEAD_KB=2
BIN_KB=`ls -l u-boot.bin | awk '{ print $5 }'`
if [ -z "${SIZE}" ]; then
        MAX_KB=1046528
else
        MAX_KB=`echo ${SIZE} | awk '{print strtonum($2)}'`
        MAX_KB=$(((MAX_KB-HEAD_KB)*1024))
fi

if [ ${BIN_KB} -gt ${MAX_KB} ]; then
        echo "ERROR: pack uboot failed! u-boot.bin actual: ${BIN_KB} bytes, max limit: ${MAX_KB} bytes"
        exit 1
fi

../rkbin/tools/loaderimage --pack --uboot u-boot.bin uboot.img ${LOAD_ADDR} ${SIZE}
echo "pack uboot okay! Input: u-boot.bin"
echo

~~~

而实际上使用的命令是

~~~shell
../rkbin/tools/loaderimage --pack --uboot u-boot.bin uboot.img 0x00200000 --size 2048 1
~~~

![image-20231003202108625](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310032021655.png)

不知道他的源码呀~~~~，这就没意思了。。。先这样吧。

# 3.kernel

git拉取源码

~~~shell
git clone https://github.com/rockchip-linux/kernel.git
~~~



查看全部分支，如下所示：

![image-20231003203437480](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310032034502.png)

我直接一步到位，直接到5.10就行

~~~shell
git checkout develop-5.10
~~~

![image-20231003203633412](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310032036427.png)

然后寻找kernel的编译过程，

~~~shell

# 构建 Kernel
build_kernel()
{
	# 检查 RK_KERNEL_DTS 和 RK_KERNEL_DEFCONFIG 配置是否存在，若不存在则返回
	check_config RK_KERNEL_DTS RK_KERNEL_DEFCONFIG || return 0

	echo "============Start building kernel============"
	echo "TARGET_KERNEL_ARCH   =$RK_KERNEL_ARCH"
	echo "TARGET_KERNEL_CONFIG =$RK_KERNEL_DEFCONFIG"
	echo "TARGET_KERNEL_DTS    =$RK_KERNEL_DTS"
	echo "TARGET_KERNEL_CONFIG_FRAGMENT =$RK_KERNEL_DEFCONFIG_FRAGMENT"
	echo "=========================================="

	# 设置交叉编译工具链
	setup_cross_compile

	# 使用 KMAKE 构建 Kernel
	$KMAKE $RK_KERNEL_DEFCONFIG $RK_KERNEL_DEFCONFIG_FRAGMENT
	$KMAKE $RK_KERNEL_DTS.img

	# 检查是否存在 Kernel FIT 文件并使用 mk-fitimage.sh 创建镜像
	ITS="$CHIP_DIR/$RK_KERNEL_FIT_ITS"
	if [ -f "$ITS" ]; then
		$COMMON_DIR/mk-fitimage.sh kernel/$RK_BOOT_IMG \
			"$ITS" $RK_KERNEL_IMG
	fi

	# 创建链接到 rockdev 目录的 boot.img
	ln -rsf kernel/$RK_BOOT_IMG rockdev/boot.img

	# 将 boot.img 复制到 u-boot 目录下，用于安全性考虑
	cp rockdev/boot.img u-boot/

	# 构建检查电源域
	build_check_power_domain

	# 完成构建流程
	finish_build
}
~~~



~~~
KMAKE="make ARCH=arm64 -j32" 
CROSS_COMPILE=aarch64-linux-gnu-
~~~





	make ARCH=arm64 -j32  CROSS_COMPILE=aarch64-linux-gnu- rockchip_linux_defconfig rk3588_linux.config
	make ARCH=arm64 -j32  CROSS_COMPILE=aarch64-linux-gnu- rk3588-evb7-lp4-v10-linux.img

编译成功，但是还需要修改波特率，要修改的设备树为rk3588-linux.dtsi

![image-20231003204847848](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310032048880.png)

然后修改rk3588-evb7-lp4.dtsi文件，里面有PCIE相关的内容，需要disabled不然会卡在内核

![image-20231003205604330](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310032056361.png)

反正现在的dhmi屏幕问题不大，就先这样了。

# 4.image

首先git大佬的源码

~~~shell
git clone https://github.com/Joshua-Riek/ubuntu-rockchip.git
~~~

我这里先以香橙派为例进行编译

export VENDOR=orangepi

export BOARD=orangepi-5b

build-u-boot.sh内容如下所示：

~~~shell
#!/bin/bash

set -eE 
trap 'echo Error: in $0 on line $LINENO' ERR

if [ "$(id -u)" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

cd "$(dirname -- "$(readlink -f -- "$0")")" && cd ..
mkdir -p build && cd build

if [[ -z ${VENDOR} ]]; then
    echo "Error: VENDOR is not set"
    exit 1
fi

if [ ! -d u-boot-"${VENDOR}" ]; then
    # shellcheck source=/dev/null
    source ../packages/u-boot-"${VENDOR}"-rk3588/debian/upstream
    git clone --single-branch --progress -b "${BRANCH}" "${GIT}" u-boot-"${VENDOR}"
    git -C u-boot-"${VENDOR}" checkout "${COMMIT}"
    cp -r ../packages/u-boot-"${VENDOR}"-rk3588/debian u-boot-"${VENDOR}"
fi
cd u-boot-"${VENDOR}"

# Compile u-boot into a deb package
dpkg-buildpackage -a "$(cat debian/arch)" -d -b -nc -uc

rm -f ../*.buildinfo ../*.changes

~~~





build.sh内容如下所示：

~~~~shell

mkdir -p build/logs
exec > >(tee "build/logs/build-$(date +"%Y%m%d%H%M%S").log") 2>&1

if [[ ${KERNEL_ONLY} == "Y" ]]; then
    eval "${DOCKER}" ./scripts/build-kernel.sh
    exit 0
fi

if [[ ${UBOOT_ONLY} == "Y" ]]; then
    eval "${DOCKER}" ./scripts/build-u-boot.sh
    exit 0
fi

if [[ ${LAUNCHPAD} != "Y" ]]; then
    if [[ ! -e "$(find build/linux-image-*.deb | sort | tail -n1)" || ! -e "$(find build/linux-headers-*.deb | sort | tail -n1)" ]]; then
        eval "${DOCKER}" ./scripts/build-kernel.sh
    fi
fi

if [[ ${LAUNCHPAD} != "Y" ]]; then
    if [[ ! -e "$(find build/u-boot-"${BOARD}"_*.deb | sort | tail -n1)" ]]; then
        eval "${DOCKER}" ./scripts/build-u-boot.sh
    fi
fi

eval "${DOCKER}" ./scripts/build-rootfs.sh
eval "${DOCKER}" ./scripts/config-image.sh

exit 0
                                                                                                                                     
~~~~



boot.cmd

~~~
setenv bootargs "console=ttyS2,115200 earlycon=uart8250,mmio32,0xff130000 root=/dev/mmcblk1p2 rw rootwait"
load mmc 1:1 ${fdt_addr_r} rk3588-evb7-lp4-v10-linux.dtb
setenv kernel_comp_addr_r 0x0a000000
load mmc 1:1 ${kernel_addr_r} Image.gz
setenv kernel_comp_size ${filesize}
booti ${kernel_addr_r} - ${fdt_addr_r}
~~~

mkimage -A arm -O linux -T script -C none -a 0 -e 0 -d boot.cmd boot.scr

![image-20231004105004887](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310041050935.png)

安装内核模块

~~~
make ARCH=arm64 CROSS_COMPILE="aarch64-linux-gnu-" INSTALL_MOD_STRIP=1 INSTALL_MOD_PATH="/home/topeet/rockchip/image/lib" modules_install -j32
~~~

![image-20231004110040296](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310041100339.png)

~~~shell
find -name "*ko" -exec cp {} /home/topeet/rockchip/image/rootfs/lib/modules/5.10.110 \;
find -name "*ko" | xargs -I {} cp {} /home/topeet/rockchip/image/rootfs/lib/modules/5.10.110
~~~



制作完整的镜像

```
./gen_image_generic.sh <file> <kernel size> <kernel directory> <rootfs size> <rootfs image> [<align>]
```

其中，`<file>`是要生成的镜像文件的名称，`<kernel size>`是内核文件系统的大小，`<kernel directory>`是包含内核文件系统内容的目录，`<rootfs size>`是根文件系统的大小，`<rootfs image>`是根文件系统的镜像文件，`<align>`是可选的对齐参数。



~~~~
./gen_image_generic.sh system.img 100 boot 7144 rootfs.img 32768
~~~~



写入uboot

~~~
sudo dd if=uboot.img of=system.img seek=64 conv=notrunc
~~~

~~~
sudo dd if=system.img of=/dev/sdc status=progress
~~~

# 5.打包

~~~shell
build_updateimg()
{
	IMAGE_PATH=$TOP_DIR/rockdev   # 设置IMAGE_PATH变量为$TOP_DIR/rockdev，用于存储生成的镜像文件路径
	PACK_TOOL_DIR=$TOP_DIR/tools/linux/Linux_Pack_Firmware   # 设置PACK_TOOL_DIR变量为$TOP_DIR/tools/linux/Linux_Pack_Firmware，用于存储打包工具的路径

	cd $PACK_TOOL_DIR/rockdev   # 进入$PACK_TOOL_DIR/rockdev目录

	if [ -f "$RK_PACKAGE_FILE_AB" ]; then   # 如果存在$RK_PACKAGE_FILE_AB文件
		build_sdcard_package   # 调用build_sdcard_package函数，构建SD卡包
		build_otapackage   # 调用build_otapackage函数，构建OTA包

		cd $PACK_TOOL_DIR/rockdev   # 返回$PACK_TOOL_DIR/rockdev目录
		echo "Make Linux a/b update_ab.img."
		source_package_file_name=`ls -lh package-file | awk -F ' ' '{print $NF}'`   # 获取package-file的文件名
		ln -fs "$RK_PACKAGE_FILE_AB" package-file   # 创建软链接，将$RK_PACKAGE_FILE_AB链接到package-file
		./mkupdate.sh   # 运行mkupdate.sh脚本，生成update.img
		mv update.img $IMAGE_PATH/update_ab.img   # 将生成的update.img移动到$IMAGE_PATH/update_ab.img
		ln -fs $source_package_file_name package-file   # 创建软链接，将source_package_file_name链接到package-file
	else
		echo "Make update.img"

		if [ -f "$RK_PACKAGE_FILE" ]; then   # 如果存在$RK_PACKAGE_FILE文件
			source_package_file_name=`ls -lh package-file | awk -F ' ' '{print $NF}'`   # 获取package-file的文件名
			ln -fs "$RK_PACKAGE_FILE" package-file   # 创建软链接，将$RK_PACKAGE_FILE链接到package-file
			./mkupdate.sh   # 运行mkupdate.sh脚本，生成update.img
			ln -fs $source_package_file_name package-file   # 创建软链接，将source_package_file_name链接到package-file
		else
			./mkupdate.sh   # 运行mkupdate.sh脚本，生成update.img
		fi
		mv update.img $IMAGE_PATH   # 将生成的update.img移动到$IMAGE_PATH
	fi

	finish_build   # 调用finish_build函数，进行后续的清理和处理操作
}
~~~

研究了一下这个玩意，这个打包完成确实是问题不大，现在我只想知道boot.img是怎样编译出来的

boot.img kernel.img resource.img zboot.img

最后找到发现是在scripts/mkimg脚本里，里面有一个repack_boot_img的函数



~~~shell
make_boot_img()
{
        RAMDISK_IMG_PATH=${objtree}/ramdisk.img
        [ -f ${RAMDISK_IMG_PATH} ] && RAMDISK_IMG=ramdisk.img && RAMDISK_ARG="--ramdisk ${RAMDISK_IMG_PATH}"

        ${srctree}/scripts/mkbootimg \
                ${KERNEL_IMAGE_ARG} \
                ${RAMDISK_ARG} \
                --second resource.img \
                -o boot.img && \
        echo "  Image:  boot.img (with Image ${RAMDISK_IMG} resource.img) is ready";
        echo                 ${KERNEL_IMAGE_ARG} \
                ${RAMDISK_ARG} \
                --second resource.img \
                -o boot.img && \


        ${srctree}/scripts/mkbootimg \
                ${KERNEL_ZIMAGE_ARG} \
                ${RAMDISK_ARG} \
                --second resource.img \
                -o zboot.img && \
        echo "  Image:  zboot.img (with ${ZIMAGE} ${RAMDISK_IMG} resource.img) is ready"
}

~~~



resource.img的由来

LOGO=logo.bmp

LOGO_KERNEL=logo_kernel.bmp

DTB_PATH=${objtree}/arch/arm/boot/dts/rk3588-evb7-lp4-v10-linux.dtb

~~~
scripts/resource_tool ${DTB_PATH} ${LOGO} ${LOGO_KERNEL}
scripts/resource_tool arch/arm64/boot/dts/rockchip/rk3588-evb7-lp4-v10-linux.dtb logo.bmp logo_kernel.bmp
~~~

然后可以用下面的命令解包

~~~
scripts/resource_tool --verbose --unpack --image=resource.img
~~~



而是实际的打包其实是repack-bootimg这个脚本

~~~shell
        ${srctree}/scripts/mkbootimg \
                ${KERNEL_IMAGE_ARG} \
                ${RAMDISK_ARG} \
                --second resource.img \
                -o boot.img && \
~~~

打包

~~~
scripts/mkbootimg --kernel ./arch/arm64/boot/Image --second resource.img -o boot.img
~~~



再一绕发现是mkbootimg这个脚本，，，真的6

~~~shell
$srctree/scripts/mkbootimg \
--kernel $kernel \
$SECOND \
--ramdisk $ramdisk \
$DTB \
$RECOVERY_DTBO \
--cmdline "${cmdline}${extra_cmdline}" \
--header_version $version \
--os_version $os_version \
--os_patch_level $os_patch_level \
--output $output
                      
~~~

一些相关内容如下所示：
~~~shell
mkbootimg命令的帮助信息，它用于创建Android引导镜像。

命令的用法如下：

shell
Copy
mkbootimg [-h] [--kernel KERNEL] [--ramdisk RAMDISK] [--second SECOND]
          [--dtb DTB] [--recovery_dtbo RECOVERY_DTBO | --recovery_acpio RECOVERY_ACPIO]
          [--cmdline CMDLINE] [--vendor_cmdline VENDOR_CMDLINE]
          [--base BASE] [--kernel_offset KERNEL_OFFSET]
          [--ramdisk_offset RAMDISK_OFFSET]
          [--second_offset SECOND_OFFSET] [--dtb_offset DTB_OFFSET]
          [--os_version OS_VERSION] [--os_patch_level OS_PATCH_LEVEL]
          [--tags_offset TAGS_OFFSET] [--board BOARD]
          [--pagesize {2048,4096,8192,16384}] [--id]
          [--header_version HEADER_VERSION] [-o OUTPUT]
          [--vendor_boot VENDOR_BOOT] [--vendor_ramdisk VENDOR_RAMDISK]
以下是参数的说明：

-h, --help：显示帮助信息并退出。
--kernel KERNEL：指定内核文件的路径。
--ramdisk RAMDISK：指定ramdisk文件的路径。
--second SECOND：指定第二级引导加载程序文件的路径。
--dtb DTB：指定设备树二进制文件的路径。
--recovery_dtbo RECOVERY_DTBO：指定恢复DTBO文件的路径。
--recovery_acpio RECOVERY_ACPIO：指定恢复ACPIO文件的路径。
--cmdline CMDLINE：指定传递给内核命令行的额外参数。
--vendor_cmdline VENDOR_CMDLINE：包含在供应商引导中的内核命令行参数。
--base BASE：指定基地址。
--kernel_offset KERNEL_OFFSET：指定内核偏移量。
--ramdisk_offset RAMDISK_OFFSET：指定ramdisk偏移量。
--second_offset SECOND_OFFSET：指定第二级引导加载程序偏移量。
--dtb_offset DTB_OFFSET：指定设备树偏移量。
--os_version OS_VERSION：操作系统版本。
--os_patch_level OS_PATCH_LEVEL：操作系统补丁级别。
--tags_offset TAGS_OFFSET：标签偏移量。
--board BOARD：板级名称。
--pagesize {2048,4096,8192,16384}：页面大小。
--id：在标准输出中打印图像ID。
--header_version HEADER_VERSION：引导镜像头版本。
-o OUTPUT, --output OUTPUT：输出文件名。
--vendor_boot VENDOR_BOOT：供应商引导输出文件名。
--vendor_ramdisk VENDOR_RAMDISK：指定供应商ramdisk文件的路径。
~~~