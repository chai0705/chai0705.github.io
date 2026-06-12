---
title: 瑞芯微build-sh脚本分析
date: 2023-09-10 17:16:56
categories:
  - 瑞芯微
link: 02_瑞芯微/03 瑞芯微build-sh脚本分析
---

build.sh脚本内容如下所示：

~~~shell
#!/bin/bash

# 设置环境变量 LC_ALL，用于定义程序的本地化设置
# 将 LC_ALL 设置为 C，表示使用标准的C语言环境，忽略本地化设置
export LC_ALL=C

# 设置环境变量 LD_LIBRARY_PATH，用于指定动态链接库的搜索路径
# 将 LD_LIBRARY_PATH 设置为空，表示清空动态链接库搜索路径
export LD_LIBRARY_PATH=

# 错误处理函数
err_handler()
{
	ret=$?
	[ "$ret" -eq 0 ] && return
	# 打印错误信息
	echo "ERROR: Running ${FUNCNAME[1]} failed!"
	echo "ERROR: exit code $ret from line ${BASH_LINENO[0]}:"
	echo "    $BASH_COMMAND"
	# 退出脚本
	exit $ret
}

# 设置错误处理函数为 trap 的处理程序，当发生错误时调用 err_handler() 函数
trap 'err_handler' ERR

# 设置 shell 的错误处理行为
set -eE

# 完成构建操作
finish_build()
{
	echo "Running ${FUNCNAME[1]} succeeded."
	# 切换到顶级目录
	cd $TOP_DIR
}

# 检查配置函数
check_config()
{
	# 清除变量 missing
	unset missing
	# 遍历传入的参数列表

	for var in $@; do
		# 使用 eval 检查变量是否存在值，如果存在则跳过
		eval [ \$$var ] && continue
		# 将缺失的配置变量记录到 missing 变量中
		missing="$missing $var"
	done
	# 如果所有配置变量均存在值，则返回0表示检查通过
	[ -z "$missing" ] && return 0
	# 如果存在缺失的配置变量，则输出错误信息并返回1
	echo "Skipping ${FUNCNAME[1]} for missing configs: $missing."
	return 1
}

# 选择板卡函数
choose_board()
{
	# 获取板卡配置文件列表到 BOARD_ARRAY 数组
	BOARD_ARRAY=( $(cd ${CHIP_DIR}/; ls BoardConfig*.mk | sort) )

	# 获取板卡数组的长度	
	RK_TARGET_BOARD_ARRAY_LEN=${#BOARD_ARRAY[@]}
	
	# 如果板卡数组长度为0，则表示没有可用的板卡配置文件，输出错误信息并返回-1
	if [ $RK_TARGET_BOARD_ARRAY_LEN -eq 0 ]; then
		echo "No available Board Config"
		return -1
	fi

	echo
	echo "You're building on Linux"
	echo "Lunch menu...pick a combo:"
	echo ""
	
	# 输出可用的板卡配置文件列表
	echo "0. default BoardConfig.mk"
	echo ${BOARD_ARRAY[@]} | xargs -n 1 | sed "=" | sed "N;s/\n/. /"

	local INDEX
	read -p "Which would you like? [0]: " INDEX
	INDEX=$((${INDEX:-0} - 1))
	
	# 根据用户选择的索引确定所选的板卡配置文件
	if echo $INDEX | grep -vq [^0-9]; then
		BOARD="${BOARD_ARRAY[$INDEX]}"
	else
		echo "Lunching for Default BoardConfig.mk boards..."
		BOARD=BoardConfig.mk
	fi

	# 创建符号链接，将所选的板卡配置文件链接到 BOARD_CONFIG 变量指定的路径
	ln -rsf "$CHIP_DIR/$BOARD" "$BOARD_CONFIG"
	echo "switching to board: $(realpath $BOARD_CONFIG)"
}
# 获取当前脚本所在目录的绝对路径，并赋值给 COMMON_DIR 变量
COMMON_DIR="$(dirname "$(realpath "$0")")"

# 根据 COMMON_DIR 计算出顶级目录的绝对路径，并赋值给 TOP_DIR 变量
TOP_DIR="$(realpath "$COMMON_DIR/../../..")"

# 切换到顶级目录
cd "$TOP_DIR"

# 创建 rockdev 目录（如果不存在）
mkdir -p rockdev

# 设置 BOARD_CONFIG 变量为顶级目录下的 device/rockchip/.BoardConfig.mk 文件的绝对路径
BOARD_CONFIG="$TOP_DIR/device/rockchip/.BoardConfig.mk"

# 获取 CHIP_DIR 变量的绝对路径，该变量指向顶级目录下的 device/rockchip/.target_product 目录
CHIP_DIR="$(realpath $TOP_DIR/device/rockchip/.target_product)"

# 预构建 U-Boot 函数
prebuild_uboot()
{
	# 构建 U-Boot 的编译命令字符串
	UBOOT_COMPILE_COMMANDS="\
			${RK_TRUST_INI_CONFIG:+../rkbin/RKTRUST/$RK_TRUST_INI_CONFIG} \
			${RK_SPL_INI_CONFIG:+../rkbin/RKBOOT/$RK_SPL_INI_CONFIG} \
			${RK_UBOOT_SIZE_CONFIG:+--sz-uboot $RK_UBOOT_SIZE_CONFIG} \
			${RK_TRUST_SIZE_CONFIG:+--sz-trust $RK_TRUST_SIZE_CONFIG}"
	UBOOT_COMPILE_COMMANDS="$(echo $UBOOT_COMPILE_COMMANDS)"
	# 如果启用 RAMDISK 安全启动，则添加相关的编译命令选项
	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
		UBOOT_COMPILE_COMMANDS=" \
			$UBOOT_COMPILE_COMMANDS \
			${RK_ROLLBACK_INDEX_BOOT:+--rollback-index-boot $RK_ROLLBACK_INDEX_BOOT} \
			${RK_ROLLBACK_INDEX_UBOOT:+--rollback-index-uboot $RK_ROLLBACK_INDEX_UBOOT} "
	fi
}

# 预构建安全启动的 U-Boot 函数
prebuild_security_uboot()
{
	# 获取传入的模式参数
	local mode=$1
	# 如果启用 RAMDISK 安全启动，则添加相关的编译命令选项
	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
		# 如果 RK_SECURITY_OTP_DEBUG 不等于 "true"，则添加 --burn-key-hash 选项
		if [ "$RK_SECURITY_OTP_DEBUG" != "true" ]; then
			UBOOT_COMPILE_COMMANDS="$UBOOT_COMPILE_COMMANDS --burn-key-hash"
		fi
		# 根据传入的模式参数进行不同的处理
		case "${mode:-normal}" in
			# 对于 uboot 模式，不需要额外的处理
			uboot)
				;;
			# 对于 boot 模式，添加 --boot_img 选项，并设置值为 $TOP_DIR/u-boot/boot.img
			boot)
				UBOOT_COMPILE_COMMANDS=" \
					--boot_img $TOP_DIR/u-boot/boot.img \
					$UBOOT_COMPILE_COMMANDS "
				;;
			# 对于 recovery 模式，添加 --recovery_img 选项，并设置值为 $TOP_DIR/u-boot/recovery.img
			recovery)
				UBOOT_COMPILE_COMMANDS=" \
					--recovery_img $TOP_DIR/u-boot/recovery.img
					$UBOOT_COMPILE_COMMANDS "
				;;
			*)
			# 对于其他模式，默认添加 --boot_img 选项，并设置值为 $TOP_DIR/u-boot/boot.img
				UBOOT_COMPILE_COMMANDS=" \
					--boot_img $TOP_DIR/u-boot/boot.img \
					$UBOOT_COMPILE_COMMANDS "
				# 如果 RK_PACKAGE_FILE_AB 为空，则添加 --recovery_img 选项，并设置值为 $TOP_DIR/u-boot/recovery.img
				test -z "${RK_PACKAGE_FILE_AB}" && \
					UBOOT_COMPILE_COMMANDS="$UBOOT_COMPILE_COMMANDS --recovery_img $TOP_DIR/u-boot/recovery.img"
				;;
		esac
		# 使用 echo 命令重新赋值 UBOOT_COMPILE_COMMANDS 变量，去除多余空格
		UBOOT_COMPILE_COMMANDS="$(echo $UBOOT_COMPILE_COMMANDS)"
	fi
}

# 用法函数，打印脚本的使用说明
usage()
{
	# 打印使用说明
	echo "Usage: build.sh [OPTIONS]"
	echo "Available options:"
	echo "BoardConfig*.mk    -switch to specified board config"
	echo "lunch              -list current SDK boards and switch to specified board config"
	echo "wifibt             -build wifibt"
	echo "uboot              -build uboot"
	echo "uefi		 -build uefi"
	echo "spl                -build spl"
	echo "loader             -build loader"
	echo "kernel-4.4         -build kernel 4.4"
	echo "kernel-4.19        -build kernel 4.19"
	echo "kernel-5.10        -build kernel 5.10"
	echo "kernel             -build kernel"
	echo "modules            -build kernel modules"
	echo "rootfs             -build rootfs (default is buildroot)"
	echo "buildroot          -build buildroot rootfs"
	echo "yocto              -build yocto rootfs"
	echo "debian             -build debian rootfs"
	echo "pcba               -build pcba"
	echo "recovery           -build recovery"
	echo "all                -build uboot, kernel, rootfs, recovery image"
	echo "cleanall           -clean uboot, kernel, rootfs, recovery"
	echo "firmware           -pack all the image we need to boot up system"
	echo "updateimg          -pack update image"
	echo "otapackage         -pack ab update otapackage image (update_ota.img)"
	echo "sdpackage          -pack update sdcard package image (update_sdcard.img)"
	echo "save               -save images, patches, commands used to debug"
	echo "allsave            -build all & firmware & updateimg & save"
	echo "info               -see the current board building information"
	echo ""
	echo "createkeys         -create secureboot root keys"
	echo "security_rootfs    -build rootfs and some relevant images with security paramter (just for dm-v)"
	echo "security_boot      -build boot with security paramter"
	echo "security_uboot     -build uboot with security paramter"
	echo "security_recovery  -build recovery with security paramter"
	echo "security_check     -check security paramter if it's good"
	echo ""
	echo "Default option is 'allsave'."
}

# 构建信息函数，打印当前构建的相关信息
build_info()
{
	# 如果 CHIP_DIR 路径不存在，则打印错误信息，表示未找到目标芯片
	if [ ! -L $CHIP_DIR ];then
		echo "No found target chip!!!"
	fi
	# 如果 BOARD_CONFIG 路径不存在，则打印错误信息，表示未找到目标板级配置
	if [ ! -L $BOARD_CONFIG ];then
		echo "No found target board config!!!"
	fi

	# 如果存在 .repo/manifest.xml 文件，则获取 SDK 版本号，并打印构建的 SDK 版本
	if [ -f .repo/manifest.xml ]; then
		local sdk_ver=""
		sdk_ver=`grep "include name"  .repo/manifest.xml | awk -F\" '{print $2}'`
		sdk_ver=`realpath .repo/manifests/${sdk_ver}`
		echo "Build SDK version: `basename ${sdk_ver}`"
	else
		echo "Not found .repo/manifest.xml [ignore] !!!"
	fi

	# 打印当前构建的信息，包括目标芯片、目标板级配置和一些目标的其他配置参数
	echo "Current Building Information:"
	echo "Target Chip: $CHIP_DIR"
	echo "Target BoardConfig: `realpath $BOARD_CONFIG`"
	echo "Target Misc config:"
	echo "`env |grep "^RK_" | grep -v "=$" | sort`"

	# 根据 RK_KERNEL_ARCH 变量的值确定设备树（dtb）的路径，并删除已存在的 dtb 文件
	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
		dtb="kernel/arch/arm/boot/dts/${RK_KERNEL_DTS}.dtb"
	else
		dtb="kernel/arch/arm64/boot/dts/rockchip/${RK_KERNEL_DTS}.dtb"
	fi

	rm -f $dtb

	# 使用 $KMAKE dtbs 命令生成设备树（dtb）文件
	$KMAKE dtbs

	# 调用 build_check_power_domain 函数检查电源域
	build_check_power_domain
}

# 构建检查电源域函数，用于检查电源域配置是否正确
build_check_power_domain()
{
	# 定义临时文件和变量
	local dump_kernel_dtb_file
	local tmp_phandle_file
	local tmp_io_domain_file
	local tmp_regulator_microvolt_file
	local tmp_final_target
	local tmp_none_item

	# 根据 RK_KERNEL_ARCH 变量的值确定设备树（dts）文件的路径
	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
		dts="kernel/arch/arm/boot/dts/$RK_KERNEL_DTS"
	else
		dts="kernel/arch/arm64/boot/dts/rockchip/$RK_KERNEL_DTS"
	fi

	# 定义临时文件的路径
	dump_kernel_dtb_file=${dts}.dump.dts
	tmp_phandle_file=`mktemp`
	tmp_io_domain_file=`mktemp`
	tmp_regulator_microvolt_file=`mktemp`
	tmp_final_target=`mktemp`
	tmp_grep_file=`mktemp`

	# 将设备树二进制文件转换为文本格式，并保存为 dump_kernel_dtb_file
	dtc -I dtb -O dts -o ${dump_kernel_dtb_file} ${dts}.dtb 2>/dev/null

	# 如果 RK_SYSTEM_CHECK_METHOD 变量的值为 "DM-E"，则检查是否在设备树中添加了 optee-tz 的兼容性
	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ] ; then
		if ! grep "compatible = \"linaro,optee-tz\";" $dump_kernel_dtb_file > /dev/null 2>&1 ; then
			echo "Please add: "
			echo "        optee: optee {"
			echo "                compatible = \"linaro,optee-tz\";"
			echo "                method = \"smc\";"
			echo "                status = \"okay\";"
			echo "        }"
			echo "To your dts file"
			return -1;
		fi
	fi
	# 使用正则表达式从设备树中提取 io-domains 配置，并保存到临时文件 tmp_io_domain_file 和 tmp_grep_file
	if ! grep -Pzo "io-domains\s*{(\n|\w|-|;|=|<|>|\"|_|\s|,)*};" $dump_kernel_dtb_file 1>$tmp_grep_file 2>/dev/null; then
		#echo "Not Found io-domains in ${dts}.dts"
		rm -f $tmp_grep_file
		return 0
	fi

	# 从临时文件 tmp_grep_file 中提取供电（supply）信息，并保存到临时文件 tmp_io_domain_file
	grep -a supply $tmp_grep_file > $tmp_io_domain_file
	rm -f $tmp_grep_file
	awk '{print "phandle = " $3}' $tmp_io_domain_file > $tmp_phandle_file

	# 逐行读取临时文件 tmp_phandle_file 和 tmp_io_domain_file，并进行处理
	while IFS= read -r item_phandle && IFS= read -u 3 -r item_domain
	do
		echo "${item_domain% *}" >> $tmp_regulator_microvolt_file
		tmp_none_item=${item_domain% *}
		cmds="grep -Pzo \"{(\\n|\w|-|;|=|<|>|\\\"|_|\s)*"$item_phandle\"

		# 使用 eval 执行命令，从设备树中提取相应的 regulator-m..-microvolt 配置，并将结果保存到临时文件 tmp_regulator_microvolt_file
		eval "$cmds $dump_kernel_dtb_file | strings | grep "regulator-m..-microvolt" >> $tmp_regulator_microvolt_file" || \
			eval "sed -i \"/${tmp_none_item}/d\" $tmp_regulator_microvolt_file" && continue

		echo >> $tmp_regulator_microvolt_file
	done < $tmp_phandle_file 3<$tmp_io_domain_file

	# 逐行读取临时文件 tmp_regulator_microvolt_file，生成最终的目标文件 tmp_final_target
	while read -r regulator_val
	do
		if echo ${regulator_val} | grep supply &>/dev/null; then
			echo -e "\n\n\e[1;33m${regulator_val%*=}\e[0m" >> $tmp_final_target
		else
			tmp_none_item=${regulator_val##*<}
			tmp_none_item=${tmp_none_item%%>*}
			echo -e "${regulator_val%%<*} \e[1;31m$(( $tmp_none_item / 1000 ))mV\e[0m" >> $tmp_final_target
		fi
	done < $tmp_regulator_microvolt_file

	echo -e "\e[41;1;30m PLEASE CHECK BOARD GPIO POWER DOMAIN CONFIGURATION !!!!!\e[0m"
	echo -e "\e[41;1;30m <<< ESPECIALLY Wi-Fi/Flash/Ethernet IO power domain >>> !!!!!\e[0m"
	echo -e "\e[41;1;30m Check Node [pmu_io_domains] in the file: ${dts}.dts \e[0m"
	echo
	echo -e "\e[41;1;30m 请再次确认板级的电源域配置！！！！！！\e[0m"
	echo -e "\e[41;1;30m <<< 特别是Wi-Fi，FLASH，以太网这几路IO电源的配置 >>> ！！！！！\e[0m"
	echo -e "\e[41;1;30m 检查内核文件 ${dts}.dts 的节点 [pmu_io_domains] \e[0m"
	cat $tmp_final_target

	rm -f $tmp_phandle_file
	rm -f $tmp_regulator_microvolt_file
	rm -f $tmp_io_domain_file
	rm -f $tmp_final_target
	rm -f $dump_kernel_dtb_file
}

# 设置交叉编译工具链和相关参数
setup_cross_compile()
{
	if [ "$RK_CHIP" = "rv1126_rv1109" ]; then
		TOOLCHAIN_OS=rockchip
	else
		TOOLCHAIN_OS=none
	fi

	# 将 RK_KERNEL_ARCH 中的 arm64 替换为 aarch64
	TOOLCHAIN_ARCH=${RK_KERNEL_ARCH/arm64/aarch64}

	# 查找匹配的 GCC 工具链路径
	TOOLCHAIN_DIR="$(realpath prebuilts/gcc/*/$TOOLCHAIN_ARCH/gcc-arm-*)"
	GCC="$(find "$TOOLCHAIN_DIR" -name "*$TOOLCHAIN_OS*-gcc")"

	# 检查是否存在可执行的 GCC 工具链
	if [ ! -x "$GCC" ]; then
		echo "No prebuilt GCC toolchain!"
		return 1
	fi

	# 设置交叉编译前缀
	export CROSS_COMPILE="${GCC%gcc}"
	echo "Using prebuilt GCC toolchain: $CROSS_COMPILE"

	# 获取可用的处理器核心数量
	NUM_CPUS=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 1)

	# 设置并发编译任务数，默认为处理器核心数量加一
	JLEVEL=${RK_JOBS:-$(( $NUM_CPUS + 1 ))}

	# 定义内核编译命令
	KMAKE="make -C kernel/ ARCH=$RK_KERNEL_ARCH -j$JLEVEL"
}

# 构建 UEFI
build_uefi()
{
	# 设置交叉编译工具链和相关参数
	setup_cross_compile

	# 根据 RK_KERNEL_ARCH 的值确定 dtb 文件路径
	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
		dtb="kernel/arch/arm/boot/dts/${RK_KERNEL_DTS}.dtb"
	else
		dtb="kernel/arch/arm64/boot/dts/rockchip/${RK_KERNEL_DTS}.dtb"
	fi

	echo "============Start building uefi============"
	echo "Copy kernel dtb $dtb to uefi/edk2-platforms/Platform/Rockchip/DeviceTree/rk3588.dtb"
	echo "========================================="

	# 检查 dtb 文件是否存在
	if [ ! -f $dtb ]; then
		echo "Please compile the kernel before"
		return -1
	fi

	# 将 dtb 文件复制到 uefi 目录
	cp $dtb uefi/edk2-platforms/Platform/Rockchip/DeviceTree/rk3588.dtb

	# 进入 uefi 目录并执行构建脚本
	cd uefi
	./make.sh $RK_UBOOT_DEFCONFIG

	# 完成构建流程
	finish_build
}

# 构建 U-Boot
build_uboot()
{
	# 检查 RK_UBOOT_DEFCONFIG 配置是否存在，若不存在则返回
	check_config RK_UBOOT_DEFCONFIG || return 0

	# 设置交叉编译工具链和相关参数
	setup_cross_compile

	# 准备 U-Boot 构建所需的文件
	prebuild_uboot
	prebuild_security_uboot $@

	echo "============Start building uboot============"
	echo "TARGET_UBOOT_CONFIG=$RK_UBOOT_DEFCONFIG"
	echo "========================================="

	# 进入 u-boot 目录并删除旧的 *_loader_*.bin 文件
	cd u-boot
	rm -f *_loader_*.bin

	# 构建 U-Boot
	if [ -n "$RK_UBOOT_DEFCONFIG_FRAGMENT" ]; then
		if [ -f "configs/${RK_UBOOT_DEFCONFIG}_defconfig" ]; then
			UBOOT_CONFIGS="${RK_UBOOT_DEFCONFIG}_defconfig"
		else
			UBOOT_CONFIGS="${RK_UBOOT_DEFCONFIG}.config"
		fi
		UBOOT_CONFIGS="$UBOOT_CONFIGS $RK_UBOOT_DEFCONFIG_FRAGMENT"
	else
		UBOOT_CONFIGS="$RK_UBOOT_DEFCONFIG"
	fi
	./make.sh $UBOOT_CONFIGS $UBOOT_COMPILE_COMMANDS \
		CROSS_COMPILE=$CROSS_COMPILE

	# 如果需要更新 RK_IDBLOCK_SPL，则执行带有 --idblock 和 --spl 参数的 make.sh
	if [ "$RK_IDBLOCK_UPDATE_SPL" = "true" ]; then
		./make.sh --idblock --spl
	fi

	cd ..

	# 如果需要进行 RAMDISK 安全启动，则创建链接到 rockdev 目录的 boot.img 和 recovery.img
	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
		ln -rsf u-boot/boot.img rockdev/
		test -z "${RK_PACKAGE_FILE_AB}" && \
			ln -rsf u-boot/recovery.img rockdev/ || true
	fi

	# 创建链接到 rockdev 目录的 MiniLoaderAll.bin、uboot.img 和 trust.img（如果存在）
	LOADER="$(echo u-boot/*_loader_*v*.bin | head -1)"
	SPL="$(echo u-boot/*_loader_spl.bin | head -1)"
	ln -rsf "${LOADER:-$SPL}" rockdev/MiniLoaderAll.bin
	ln -rsf u-boot/uboot.img rockdev/
	[ ! -e u-boot/trust.img ] || \
		ln -rsf u-boot/trust.img rockdev/

	# 完成构建流程
	finish_build
}

# 构建 SPL
build_spl()
{
	# 检查 RK_SPL_DEFCONFIG 配置是否存在，若不存在则返回
	check_config RK_SPL_DEFCONFIG || return 0

	echo "============Start building spl============"
	echo "TARGET_SPL_CONFIG=$RK_SPL_DEFCONFIG"
	echo "========================================="

	# 进入 u-boot 目录并删除旧的 spl.bin 文件
	cd u-boot
	rm -f *spl.bin

	# 构建 SPL
	./make.sh $RK_SPL_DEFCONFIG
	./make.sh --spl
	cd ..

	# 创建链接到 rockdev 目录的 MiniLoaderAll.bin
	SPL="$(echo u-boot/*_loader_spl.bin | head -1)"
	ln -rsf "$SPL" rockdev/MiniLoaderAll.bin

	# 完成构建流程
	finish_build
}

# 构建 Loader
build_loader()
{
	# 检查 RK_LOADER_BUILD_TARGET 配置是否存在，若不存在则返回
	check_config RK_LOADER_BUILD_TARGET || return 0

	echo "============Start building loader============"
	echo "RK_LOADER_BUILD_TARGET=$RK_LOADER_BUILD_TARGET"
	echo "=========================================="

	# 进入 loader 目录并执行 build.sh 构建 Loader
	cd loader
	./build.sh $RK_LOADER_BUILD_TARGET

	# 完成构建流程
	finish_build
}

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

# 构建 Wi-Fi 和蓝牙
build_wifibt()
{
	# 设置交叉编译工具链
	setup_cross_compile

	# 设置 Buildroot 相关路径
	BUILDROOT_OUTDIR=$TOP_DIR/buildroot/output/$RK_CFG_BUILDROOT/
	BUILDROOT_HOST_DIR=$BUILDROOT_OUTDIR/host/

	# 检查 Buildroot 架构
	if grep -wq aarch64 "$BUILDROOT_OUTDIR/.config" 2>/dev/null; then
		BUILDROOT_ARCH=arm64
	else
		BUILDROOT_ARCH=arm
	fi

	# 获取 Buildroot GCC 和 SYSROOT 路径
	BUILDROOT_GCC="$(echo $BUILDROOT_HOST_DIR/bin/*buildroot*-gcc)"
	BUILDROOT_SYSROOT="$(echo $BUILDROOT_HOST_DIR/*/sysroot/)"
	if [ ! -x "$BUILDROOT_GCC" -o ! -d "$BUILDROOT_SYSROOT" ]; then
		echo "ERROR: Buildroot not ready!"
		exit -1
	fi

	# 设置 Wi-Fi 和蓝牙芯片类型和 TTY 设备
	if [ -n "$1" ]; then
		WIFI_CHIP=$1
	elif [ -n "$RK_WIFIBT_CHIP" ]; then
		WIFI_CHIP=$RK_WIFIBT_CHIP
	else
		# 默认为 ALL_AP
		echo "=== WARNNING WIFI_CHIP is NULL so default to ALL_AP ==="
		WIFI_CHIP=ALL_AP
	fi

	if [ -n "$2" ]; then
		BT_TTY_DEV=$2
	elif [ -n "$RK_WIFIBT_TTY" ]; then
		BT_TTY_DEV=$RK_WIFIBT_TTY
	else
		echo "=== WARNNING BT_TTY is NULL so default to ttyS0 ==="
		BT_TTY_DEV=ttyS0
	fi

	# 检查内核 .config 配置
	WIFI_USB=$(grep "CONFIG_USB=y" $TOP_DIR/kernel/.config || true)
	WIFI_SDIO=$(grep "CONFIG_MMC=y" $TOP_DIR/kernel/.config || true)
	WIFI_PCIE=$(grep "CONFIG_PCIE_DW_ROCKCHIP=y" $TOP_DIR/kernel/.config || true)
	WIFI_RFKILL=$(grep "CONFIG_RFKILL=y" $TOP_DIR/kernel/.config || true)
	if [ -z "$WIFI_SDIO" ]; then
		echo "=== WARNNING CONFIG_MMC not set !!! ==="
	fi
	if [ -z "$WIFI_RFKILL" ]; then
		echo "=== WARNNING CONFIG_USB not set !!! ==="
	fi
	if [[ "$WIFI_CHIP" =~ "U" ]]; then
		if [ -z "$WIFI_USB" ]; then
			echo "=== WARNNING CONFIG_USB not set so ABORT!!! ==="
			exit 0
		fi
	fi
	echo "kernel config: $WIFI_USB $WIFI_SDIO $WIFI_RFKILL"

	TARGET_CC=${CROSS_COMPILE}gcc
	RKWIFIBT=$TOP_DIR/external/rkwifibt
	RKWIFIBT_APP=$TOP_DIR/external/rkwifibt-app
	TARGET_ROOTFS_DIR=$TOP_DIR/buildroot/output/$RK_CFG_BUILDROOT/target

	echo "========build wifibt info======="
	echo CROSS_COMPILE=$CROSS_COMPILE
	echo WIFI_CHIP=$WIFI_CHIP
	echo BT_TTY_DEV=$BT_TTY_DEV
	echo TARGET_ROOTFS_DIR=$TARGET_ROOTFS_DIR
	echo BUILDROOT_GCC=$BUILDROOT_GCC
	echo BUILDROOT_SYSROOT=$BUILDROOT_SYSROOT

	if [[ "$WIFI_CHIP" =~ "ALL_AP" ]];then
		echo "building bcmdhd sdio"
		$KMAKE M=$RKWIFIBT/drivers/bcmdhd CONFIG_BCMDHD=m CONFIG_BCMDHD_SDIO=y CONFIG_BCMDHD_PCIE=
		if [ -n "$WIFI_PCIE" ]; then
			echo "building bcmdhd pcie"
			$KMAKE M=$RKWIFIBT/drivers/bcmdhd CONFIG_BCMDHD=m CONFIG_BCMDHD_PCIE=y CONFIG_BCMDHD_SDIO=
		fi
		if [ -n "$WIFI_USB" ]; then
			echo "building rtl8188fu usb"
			$KMAKE M=$RKWIFIBT/drivers/rtl8188fu modules
		fi
		echo "building rtl8189fs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8189fs modules
		echo "building rtl8723ds sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8723ds modules
		echo "building rtl8821cs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8821cs modules
		echo "building rtl8822cs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8822cs modules
		echo "building rtl8852bs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8852bs modules DRV_PATH=$RKWIFIBT/drivers/rtl8852bs
		if [ -n "$WIFI_PCIE" ]; then
			echo "building rtl8852be pcie"
			$KMAKE M=$RKWIFIBT/drivers/rtl8852be modules DRV_PATH=$RKWIFIBT/drivers/rtl8852be
		fi
	fi

	if [[ "$WIFI_CHIP" =~ "ALL_CY" ]];then
		echo "building CYW4354"
		cp $RKWIFIBT/drivers/infineon/chips/CYW4354_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
		echo "building CYW4373"
		cp $RKWIFIBT/drivers/infineon/chips/CYW4373_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
		echo "building CYW43438"
		cp $RKWIFIBT/drivers/infineon/chips/CYW43438_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
		echo "building CYW43455"
		cp $RKWIFIBT/drivers/infineon/chips/CYW43455_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
		echo "building CYW5557X"
		cp $RKWIFIBT/drivers/infineon/chips/CYW5557X_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
		if [ -n "$WIFI_PCIE" ]; then
			echo "building CYW5557X_PCIE"
			cp $RKWIFIBT/drivers/infineon/chips/CYW5557X_PCIE_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
			$KMAKE M=$RKWIFIBT/drivers/infineon
			echo "building CYW54591_PCIE"
			cp $RKWIFIBT/drivers/infineon/chips/CYW54591_PCIE_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
			$KMAKE M=$RKWIFIBT/drivers/infineon
		fi
		echo "building CYW54591"
		cp $RKWIFIBT/drivers/infineon/chips/CYW54591_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$
		KMAKE M=$RKWIFIBT/drivers/infineon

		if [ -n "$WIFI_USB" ]; then
			echo "building rtl8188fu usb"
			$KMAKE M=$RKWIFIBT/drivers/rtl8188fu modules
		fi
		echo "building rtl8189fs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8189fs modules
		echo "building rtl8723ds sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8723ds modules
		echo "building rtl8821cs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8821cs modules
		echo "building rtl8822cs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8822cs modules
		echo "building rtl8852bs sdio"
		$KMAKE M=$RKWIFIBT/drivers/rtl8852bs modules DRV_PATH=$RKWIFIBT/drivers/rtl8852bs
		if [ -n "$WIFI_PCIE" ]; then
			echo "building rtl8852be pcie"
			$KMAKE M=$RKWIFIBT/drivers/rtl8852be modules DRV_PATH=$RKWIFIBT/drivers/rtl8852be
		fi
	fi

	if [[ "$WIFI_CHIP" =~ "AP6" ]];then
		if [[ "$WIFI_CHIP" = "AP6275_PCIE" ]];then
			echo "building bcmdhd pcie driver"
			$KMAKE M=$RKWIFIBT/drivers/bcmdhd CONFIG_BCMDHD=m CONFIG_BCMDHD_PCIE=y CONFIG_BCMDHD_SDIO=
		else
			echo "building bcmdhd sdio driver"
			$KMAKE M=$RKWIFIBT/drivers/bcmdhd CONFIG_BCMDHD=m CONFIG_BCMDHD_SDIO=y CONFIG_BCMDHD_PCIE=
		fi
	fi

	if [[ "$WIFI_CHIP" = "CYW4354" ]];then
		echo "building CYW4354"
		cp $RKWIFIBT/drivers/infineon/chips/CYW4354_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW4373" ]];then
		echo "building CYW4373"
		cp $RKWIFIBT/drivers/infineon/chips/CYW4373_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW43438" ]];then
		echo "building CYW43438"
		cp $RKWIFIBT/drivers/infineon/chips/CYW43438_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW43455" ]];then
		echo "building CYW43455"
		cp $RKWIFIBT/drivers/infineon/chips/CYW43455_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW5557X" ]];then
		echo "building CYW5557X"
		cp $RKWIFIBT/drivers/infineon/chips/CYW5557X_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW5557X_PCIE" ]];then
		echo "building CYW5557X_PCIE"
		cp $RKWIFIBT/drivers/infineon/chips/CYW5557X_PCIE_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW54591" ]];then
		echo "building CYW54591"
		cp $RKWIFIBT/drivers/infineon/chips/CYW54591_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "CYW54591_PCIE" ]];then
		echo "building CYW54591_PCIE"
		cp $RKWIFIBT/drivers/infineon/chips/CYW54591_PCIE_Makefile $RKWIFIBT/drivers/infineon/Makefile -r
		$KMAKE M=$RKWIFIBT/drivers/infineon
	fi

	if [[ "$WIFI_CHIP" = "RTL8188FU" ]];then
		echo "building rtl8188fu driver"
		$KMAKE M=$RKWIFIBT/drivers/rtl8188fu modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8189FS" ]];then
		echo "building rtl8189fs driver"
		$KMAKE M=$RKWIFIBT/drivers/rtl8189fs modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8723DS" ]];then
		$KMAKE M=$RKWIFIBT/drivers/rtl8723ds modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8821CS" ]];then
		$KMAKE M=$RKWIFIBT/drivers/rtl8821cs modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8822CS" ]];then
		$KMAKE M=$RKWIFIBT/drivers/rtl8822cs modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8852BS" ]];then
		$KMAKE M=$RKWIFIBT/drivers/rtl8852bs modules
	fi

	if [[ "$WIFI_CHIP" = "RTL8852BE" ]];then
		$KMAKE M=$RKWIFIBT/drivers/rtl8852be modules
	fi

	echo "building brcm_tools"
	$TARGET_CC -o $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1 $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1.c
	$TARGET_CC -o $RKWIFIBT/tools/brcm_tools/dhd_priv $RKWIFIBT/tools/brcm_tools/dhd_priv.c

	echo "building rk_wifibt_init"
	$TARGET_CC -o $RKWIFIBT/src/rk_wifibt_init $RKWIFIBT/src/rk_wifi_init.c

	echo "building realtek_tools"
	make -C $RKWIFIBT/tools/rtk_hciattach/ CC=$TARGET_CC

	echo "building realtek bt drivers"
	$KMAKE M=$RKWIFIBT/drivers/bluetooth_uart_driver
	if [ -n "$WIFI_USB" ]; then
		$KMAKE M=$RKWIFIBT/drivers/bluetooth_usb_driver
	fi

	if [ "$RK_CHIP" = "rv1126_rv1109" ];then
		echo "target is rv1126_rv1109, skip $RKWIFIBT_APP"
	else
		echo "building rkwifibt-app"
		make -C $RKWIFIBT_APP CC=$BUILDROOT_GCC \
			SYSROOT=$BUILDROOT_SYSROOT ARCH=$BUILDROOT_ARCH || true
	fi

	echo "chmod +x tools"
	chmod 755 $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1
	chmod 755 $RKWIFIBT/tools/brcm_tools/dhd_priv
	chmod 755 $RKWIFIBT/src/rk_wifibt_init
	chmod 755 $RKWIFIBT/tools/rtk_hciattach/rtk_hciattach

	echo "mkdir rootfs dir" $TARGET_ROOTFS_DIR
	rm -rf $TARGET_ROOTFS_DIR/system/lib/modules/
	rm -rf $TARGET_ROOTFS_DIR/system/etc/firmware/
	rm -rf $TARGET_ROOTFS_DIR/vendor/
	rm -rf $TARGET_ROOTFS_DIR/usr/lib/modules/
	mkdir -p $TARGET_ROOTFS_DIR/usr/lib/modules/
	mkdir -p $TARGET_ROOTFS_DIR/system/lib/modules/
	mkdir -p $TARGET_ROOTFS_DIR/system/etc/firmware/
	mkdir -p $TARGET_ROOTFS_DIR/lib/firmware/rtlbt/

	echo "create link system->vendor"
	cd $TARGET_ROOTFS_DIR/
	rm -rf $TARGET_ROOTFS_DIR/vendor
	ln -rsf system $TARGET_ROOTFS_DIR/vendor
	cd -

	echo "copy tools/sh to rootfs"
	cp $RKWIFIBT/bin/$BUILDROOT_ARCH/* $TARGET_ROOTFS_DIR/usr/bin/
	cp $RKWIFIBT/sh/wifi_start.sh $TARGET_ROOTFS_DIR/usr/bin/
	cp $RKWIFIBT/sh/wifi_ap6xxx_rftest.sh $TARGET_ROOTFS_DIR/usr/bin/
	cp $RKWIFIBT/conf/wpa_supplicant.conf $TARGET_ROOTFS_DIR/etc/
	cp $RKWIFIBT/conf/dnsmasq.conf $TARGET_ROOTFS_DIR/etc/
	cp $RKWIFIBT/tools/brcm_tools/dhd_priv $TARGET_ROOTFS_DIR/usr/bin/
	cp $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1 $TARGET_ROOTFS_DIR/usr/bin/
	cp $RKWIFIBT/src/rk_wifibt_init $TARGET_ROOTFS_DIR/usr/bin/

	if [[ "$WIFI_CHIP" = "ALL_CY" ]];then
		echo "copy infineon/realtek firmware/nvram to rootfs"
		cp $RKWIFIBT/drivers/infineon/*.ko $TARGET_ROOTFS_DIR/system/lib/modules/ || true
		cp $RKWIFIBT/firmware/infineon/*/* $TARGET_ROOTFS_DIR/system/etc/firmware/ || true

		#todo rockchip
		#cp $RKWIFIBT/firmware/rockchip/* $TARGET_ROOTFS_DIR/system/etc/firmware/
		cp $RKWIFIBT/sh/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_init.sh
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_pcba_test

		#reatek
		cp $RKWIFIBT/firmware/realtek/*/* $TARGET_ROOTFS_DIR/lib/firmware/
		cp $RKWIFIBT/firmware/realtek/*/* $TARGET_ROOTFS_DIR/lib/firmware/rtlbt/
		cp $RKWIFIBT/tools/rtk_hciattach/rtk_hciattach $TARGET_ROOTFS_DIR/usr/bin/
		cp $RKWIFIBT/drivers/bluetooth_uart_driver/hci_uart.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
		if [ -n "$WIFI_USB" ]; then
			cp $RKWIFIBT/drivers/bluetooth_usb_driver/rtk_btusb.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
		fi

		rm -rf $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
		cp $RKWIFIBT/S36load_all_wifi_modules $TARGET_ROOTFS_DIR/etc/init.d/
		sed -i "s/BT_TTY_DEV/\/dev\/${BT_TTY_DEV}/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_all_wifi_modules
	fi

	if [[ "$WIFI_CHIP" = "ALL_AP" ]];then
		echo "copy ap6xxx/realtek firmware/nvram to rootfs"
		cp $RKWIFIBT/drivers/bcmdhd/*.ko $TARGET_ROOTFS_DIR/system/lib/modules/
		cp $RKWIFIBT/firmware/broadcom/*/wifi/* $TARGET_ROOTFS_DIR/system/etc/firmware/ || true
		cp $RKWIFIBT/firmware/broadcom/*/bt/* $TARGET_ROOTFS_DIR/system/etc/firmware/ || true

		#todo rockchip
		#cp $RKWIFIBT/firmware/rockchip/* $TARGET_ROOTFS_DIR/system/etc/firmware/
		cp $RKWIFIBT/sh/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_init.sh
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_pcba_test

		#reatek
		cp -rf $RKWIFIBT/firmware/realtek/*/* $TARGET_ROOTFS_DIR/lib/firmware/
		cp -rf $RKWIFIBT/firmware/realtek/*/* $TARGET_ROOTFS_DIR/lib/firmware/rtlbt/
		cp $RKWIFIBT/tools/rtk_hciattach/rtk_hciattach $TARGET_ROOTFS_DIR/usr/bin/
		cp $RKWIFIBT/drivers/bluetooth_uart_driver/hci_uart.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
		if [ -n "$WIFI_USB" ]; then
			cp $RKWIFIBT/drivers/bluetooth_usb_driver/rtk_btusb.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
		fi

		rm -rf $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
		cp $RKWIFIBT/S36load_all_wifi_modules $TARGET_ROOTFS_DIR/etc/init.d/
		sed -i "s/BT_TTY_DEV/\/dev\/${BT_TTY_DEV}/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_all_wifi_modules
	fi

	if [[ "$WIFI_CHIP" =~ "RTL" ]];then
		echo "Copy RTL file to rootfs"
		if [ -d "$RKWIFIBT/firmware/realtek/$WIFI_CHIP" ]; then
			cp $RKWIFIBT/firmware/realtek/$WIFI_CHIP/* $TARGET_ROOTFS_DIR/lib/firmware/rtlbt/
			cp $RKWIFIBT/firmware/realtek/$WIFI_CHIP/* $TARGET_ROOTFS_DIR/lib/firmware/
		else
			echo "INFO: $WIFI_CHIP isn't bluetooth?"
		fi

		WIFI_KO_DIR=$(echo $WIFI_CHIP | tr '[A-Z]' '[a-z]')

		cp $RKWIFIBT/drivers/$WIFI_KO_DIR/*.ko $TARGET_ROOTFS_DIR/system/lib/modules/

		cp $RKWIFIBT/sh/bt_load_rtk_firmware $TARGET_ROOTFS_DIR/usr/bin/
		sed -i "s/BT_TTY_DEV/\/dev\/${BT_TTY_DEV}/g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_rtk_firmware
		if [ -n "$WIFI_USB" ]; then
			cp $RKWIFIBT/drivers/bluetooth_usb_driver/rtk_btusb.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
			sed -i "s/BT_DRV/rtk_btusb/g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_rtk_firmware
		else
			cp $RKWIFIBT/drivers/bluetooth_uart_driver/hci_uart.ko $TARGET_ROOTFS_DIR/usr/lib/modules/
			sed -i "s/BT_DRV/hci_uart/g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_rtk_firmware
		fi
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_rtk_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_init.sh
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_rtk_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_pcba_test
		cp $RKWIFIBT/tools/rtk_hciattach/rtk_hciattach $TARGET_ROOTFS_DIR/usr/bin/
		rm -rf $TARGET_ROOTFS_DIR/etc/init.d/S36load_all_wifi_modules
		cp $RKWIFIBT/S36load_wifi_modules $TARGET_ROOTFS_DIR/etc/init.d/
		sed -i "s/WIFI_KO/\/system\/lib\/modules\/$WIFI_CHIP.ko/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
	fi

	if [[ "$WIFI_CHIP" =~ "CYW" ]];then
		echo "Copy CYW file to rootfs"
		#tools
		cp $RKWIFIBT/tools/brcm_tools/dhd_priv $TARGET_ROOTFS_DIR/usr/bin/
		cp $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1 $TARGET_ROOTFS_DIR/usr/bin/
		#firmware
		cp $RKWIFIBT/firmware/infineon/$WIFI_CHIP/* $TARGET_ROOTFS_DIR/system/etc/firmware/
		cp $RKWIFIBT/drivers/infineon/*.ko $TARGET_ROOTFS_DIR/system/lib/modules/
		#bt
		cp $RKWIFIBT/sh/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/
		sed -i "s/BT_TTY_DEV/\/dev\/${BT_TTY_DEV}/g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware
		sed -i "s/BTFIRMWARE_PATH/\/system\/etc\/firmware\//g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_init.sh
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_pcba_test
		#wifi
		rm -rf $TARGET_ROOTFS_DIR/etc/init.d/S36load_all_wifi_modules
		cp $RKWIFIBT/S36load_wifi_modules $TARGET_ROOTFS_DIR/etc/init.d/
		sed -i "s/WIFI_KO/\/system\/lib\/modules\/$WIFI_CHIP.ko/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
	fi

	if [[ "$WIFI_CHIP" =~ "AP6" ]];then
		echo "Copy AP file to rootfs"
		#tools
		cp $RKWIFIBT/tools/brcm_tools/dhd_priv $TARGET_ROOTFS_DIR/usr/bin/
		cp $RKWIFIBT/tools/brcm_tools/brcm_patchram_plus1 $TARGET_ROOTFS_DIR/usr/bin/
		#firmware
		cp $RKWIFIBT/firmware/broadcom/$WIFI_CHIP/wifi/* $TARGET_ROOTFS_DIR/system/etc/firmware/
		cp $RKWIFIBT/firmware/broadcom/$WIFI_CHIP/bt/* $TARGET_ROOTFS_DIR/system/etc/firmware/
		cp $RKWIFIBT/drivers/bcmdhd/*.ko $TARGET_ROOTFS_DIR/system/lib/modules/
		#bt
		cp $RKWIFIBT/sh/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/
		sed -i "s/BT_TTY_DEV/\/dev\/${BT_TTY_DEV}/g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware
		sed -i "s/BTFIRMWARE_PATH/\/system\/etc\/firmware\//g" $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_init.sh
		cp $TARGET_ROOTFS_DIR/usr/bin/bt_load_broadcom_firmware $TARGET_ROOTFS_DIR/usr/bin/bt_pcba_test
		#wifi
		rm -rf $TARGET_ROOTFS_DIR/etc/init.d/S36load_all_wifi_modules
		cp $RKWIFIBT/S36load_wifi_modules $TARGET_ROOTFS_DIR/etc/init.d/
		if [[ "$WIFI_CHIP" =~ "AP" ]];then
			sed -i "s/WIFI_KO/\/system\/lib\/modules\/bcmdhd.ko/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
		else
			sed -i "s/WIFI_KO/\/system\/lib\/modules\/bcmdhd_pcie.ko/g" $TARGET_ROOTFS_DIR/etc/init.d/S36load_wifi_modules
		fi
	fi
	finish_build
	#exit 0
}

# 构建内核模块
build_modules()
{
	check_config RK_KERNEL_DEFCONFIG || return 0

	echo "============Start building kernel modules============"
	echo "TARGET_KERNEL_ARCH   =$RK_KERNEL_ARCH"
	echo "TARGET_KERNEL_CONFIG =$RK_KERNEL_DEFCONFIG"
	echo "TARGET_KERNEL_CONFIG_FRAGMENT =$RK_KERNEL_DEFCONFIG_FRAGMENT"
	echo "=================================================="

	# 设置交叉编译工具链
	setup_cross_compile

	# 使用指定的内核配置和片段进行构建
	$KMAKE $RK_KERNEL_DEFCONFIG $RK_KERNEL_DEFCONFIG_FRAGMENT
	$KMAKE modules

	# 完成构建
	finish_build
}

# 构建 Buildroot 根文件系统
build_buildroot()
{
	check_config RK_CFG_BUILDROOT || return 0

	ROOTFS_DIR=$1

	echo "==========Start building buildroot rootfs =========="
	echo "TARGET_BUILDROOT_CONFIG=$RK_CFG_BUILDROOT"
	echo "========================================="

	DST_DIR=.buildroot

	# 使用 mk-buildroot.sh 脚本构建 Buildroot 根文件系统
	/usr/bin/time -f "you take %E to build buildroot" \
		$COMMON_DIR/mk-buildroot.sh $RK_CFG_BUILDROOT $DST_DIR

	# 删除旧的根文件系统目录并创建新的符号链接
	rm -rf $ROOTFS_DIR
	ln -rsf $DST_DIR $ROOTFS_DIR

	# 完成构建
	finish_build
}

kernel_version()
{
	[ -d "$1" ] || return 0

	# 定义内核版本号的关键字
	VERSION_KEYS="VERSION PATCHLEVEL"
	VERSION=""

	# 遍历关键字，获取内核版本号的各个部分
	for k in $VERSION_KEYS; do
		v=$(grep "^$k = " $1/Makefile | cut -d' ' -f3)
		VERSION=${VERSION:+${VERSION}.}$v
	done
	echo $VERSION
}

# 构建 Yocto rootfs
build_yocto()
{
	check_config RK_YOCTO_MACHINE || return 0

	# 开始构建 Yocto rootfs
	echo "=========开始构建 Yocto rootfs========="
	echo "目标机器：$RK_YOCTO_MACHINE"
	echo "====================================="

	KERNEL_VERSION=$(kernel_version kernel/)

	cd yocto
	ln -rsf $RK_YOCTO_MACHINE.conf build/conf/local.conf
	source oe-init-build-env
	LANG=en_US.UTF-8 LANGUAGE=en_US.en LC_ALL=en_US.UTF-8 \
		bitbake core-image-minimal -r conf/include/rksdk.conf \
		-r conf/include/kernel-$KERNEL_VERSION.conf

	finish_build
}

# 构建 debian rootfs
build_debian()
{
	ARCH=${RK_DEBIAN_ARCH:-${RK_KERNEL_ARCH}}
	case $ARCH in
		arm|armhf) ARCH=armhf ;;
		*) ARCH=arm64 ;;
	esac

	echo "=========开始构建 Debian ($ARCH) 根文件系统========="

	cd debian

	# 检查是否存在 linaro 版本的 Debian 根文件系统压缩包，如果不存在则执行 mk-base-debian.sh 脚本构建
	if [ ! -f linaro-$RK_DEBIAN_VERSION-alip-*.tar.gz ]; then
		RELEASE=$RK_DEBIAN_VERSION TARGET=desktop ARCH=$ARCH ./mk-base-debian.sh
		ln -rsf linaro-$RK_DEBIAN_VERSION-alip-*.tar.gz linaro-$RK_DEBIAN_VERSION-$ARCH.tar.gz
	fi

	VERSION=debug ARCH=$ARCH ./mk-rootfs-$RK_DEBIAN_VERSION.sh
	./mk-image.sh

	# 完成构建
	finish_build
}

# 编译文件系统
build_rootfs()
{
	check_config RK_ROOTFS_TYPE || return 0

	ROOTFS=${1:-${RK_ROOTFS_SYSTEM:-buildroot}}
	ROOTFS_IMG=rootfs.${RK_ROOTFS_TYPE}
	ROOTFS_DIR=.rootfs

	echo "==========开始构建根文件系统($ROOTFS)，输出到$ROOTFS_DIR=========="

	# 删除旧的根文件系统目录并创建新的目录
	rm -rf $ROOTFS_DIR
	mkdir -p $ROOTFS_DIR

	case "$ROOTFS" in
		yocto)
			build_yocto
			ln -rsf yocto/build/latest/rootfs.img \
				$ROOTFS_DIR/rootfs.ext4
			;;
		debian)
			build_debian
			ln -rsf debian/linaro-rootfs.img \
				$ROOTFS_DIR/rootfs.ext4
			;;
		buildroot)
			build_buildroot $ROOTFS_DIR
			build_wifibt

			# 为 wifibt 重新编译
			build_buildroot $ROOTFS_DIR
			;;
		*)
			echo "$ROOTFS 不支持！"
			exit 1
			;;
	esac

	if [ ! -f "$ROOTFS_DIR/$ROOTFS_IMG" ]; then
		echo "未生成 $ROOTFS_IMG..."
		exit 1
	fi

	ln -rsf $ROOTFS_DIR/$ROOTFS_IMG rockdev/rootfs.img

	[ ! -f $ROOTFS_DIR/oem.img ] || ln -rsf $ROOTFS_DIR/oem.img rockdev/

	if [ "$RK_RAMBOOT" ]; then
		/usr/bin/time -f "you take %E to pack ramboot image" \
			$COMMON_DIR/mk-ramdisk.sh rockdev/rootfs.img \
			$ROOTFS_DIR/ramboot.img
		ln -rsf $ROOTFS_DIR/ramboot.img rockdev/boot.img

		# 用于安全性
		cp rockdev/boot.img u-boot/
	fi

	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ]; then
		echo "尝试为 $RK_SYSTEM_CHECK_METHOD 构建 init"

		if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-V" ]; then
			SYSTEM_IMG=rootfs.squashfs
		else
			SYSTEM_IMG=$ROOTFS_IMG
		fi
		if [ ! -f "$ROOTFS_DIR/$SYSTEM_IMG" ]; then
			echo "未生成 $SYSTEM_IMG..."
			exit -1
		fi

		$COMMON_DIR/mk-dm.sh $RK_SYSTEM_CHECK_METHOD \
			$ROOTFS_DIR/$SYSTEM_IMG
		ln -rsf $ROOTFS_DIR/security-system.img rockdev/rootfs.img
	fi

	# 完成构建
	finish_build
}

build_recovery()
{
	# 检查是否启用了主备份(A/B)模式的SD卡更新
	if [ "$RK_UPDATE_SDCARD_ENABLE_FOR_AB" = "true" ] ;then
		# 如果是启用了主备份(A/B)模式的SD卡更新，则使用相应的恢复配置
		RK_CFG_RECOVERY=$RK_UPDATE_SDCARD_CFG_RECOVERY
	fi

	# 检查是否存在主备份(A/B)模式的包文件
	if [ ! -z "$RK_PACKAGE_FILE_AB" ]; then
		# 如果存在主备份(A/B)模式的包文件，则直接返回，不进行构建
		return 0
	fi

	# 检查恢复配置是否已配置
	check_config RK_CFG_RECOVERY || return 0

	# 打印构建恢复镜像的提示信息
	echo "==========开始构建恢复镜像(buildroot)=========="
	echo "TARGET_RECOVERY_CONFIG=$RK_CFG_RECOVERY"
	echo "========================================"

	# 设置目标目录
	DST_DIR=.recovery

	# 构建恢复镜像(buildroot)
	/usr/bin/time -f "用时 %E 构建恢复镜像(buildroot)" \
		$COMMON_DIR/mk-buildroot.sh $RK_CFG_RECOVERY $DST_DIR

	# 打包恢复镜像
	/usr/bin/time -f "用时 %E 打包恢复镜像" \
		$COMMON_DIR/mk-ramdisk.sh $DST_DIR/rootfs.cpio.gz \
		$DST_DIR/recovery.img \
		"$CHIP_DIR/$RK_RECOVERY_FIT_ITS"
	ln -rsf $DST_DIR/recovery.img rockdev/

	# 为了安全起见，将恢复镜像复制到u-boot目录
	cp rockdev/recovery.img u-boot/

	# 完成构建
	finish_build
}
# 构建PCBA
build_pcba()
{
	# 检查PCBA配置是否已配置
	check_config RK_CFG_PCBA || return 0

	# 打印构建PCBA镜像的提示信息
	echo "==========开始构建PCBA镜像(buildroot)=========="
	echo "TARGET_PCBA_CONFIG=$RK_CFG_PCBA"
	echo "===================================="

	# 设置目标目录
	DST_DIR=.pcba

	# 构建PCBA镜像(buildroot)
	/usr/bin/time -f "用时 %E 构建PCBA镜像(buildroot)" \
		$COMMON_DIR/mk-buildroot.sh $RK_CFG_PCBA $DST_DIR

	# 打包PCBA镜像
	/usr/bin/time -f "用时 %E 打包PCBA镜像" \
		$COMMON_DIR/mk-ramdisk.sh $DST_DIR/rootfs.cpio.gz \
		$DST_DIR/pcba.img
	ln -rsf $DST_DIR/pcba.img rockdev/

	# 完成构建
	finish_build
}

BOOT_FIXED_CONFIGS="
	CONFIG_BLK_DEV_DM                # 启用设备映射（Device Mapper）
	CONFIG_DM_CRYPT                  # 启用设备映射加密模块
	CONFIG_BLK_DEV_CRYPTOLOOP        # 启用块设备加密循环设备
	CONFIG_DM_VERITY                 # 启用设备映射完整性校验模块"

BOOT_OPTEE_FIXED_CONFIGS="
	CONFIG_TEE                       # 启用可信执行环境（Trusted Execution Environment）
	CONFIG_OPTEE                     # 启用OP-TEE（Open Portable Trusted Execution Environment）"

UBOOT_FIXED_CONFIGS="
	CONFIG_FIT_SIGNATURE             # 启用FIT（Flattened Image Tree）签名支持
	CONFIG_SPL_FIT_SIGNATURE         # 启用SPL（Secondary Program Loader）FIT签名支持"

UBOOT_AB_FIXED_CONFIGS="
	CONFIG_ANDROID_AB                # 启用Android A/B分区支持"

ROOTFS_UPDATE_ENGINEBIN_CONFIGS="
	BR2_PACKAGE_RECOVERY             # 启用恢复系统包
	BR2_PACKAGE_RECOVERY_UPDATEENGINEBIN"  # 启用恢复系统更新引擎二进制文件

ROOTFS_AB_FIXED_CONFIGS="
	$ROOTFS_UPDATE_ENGINEBIN_CONFIGS     # 包括ROOTFS_UPDATE_ENGINEBIN_CONFIGS中的配置
	BR2_PACKAGE_RECOVERY_BOOTCONTROL"    # 启用恢复系统引导控制

# 检查默认配置
defconfig_check()
{
	# 1. defconfig 2. fixed config
	echo debug-$1   # 调试输出，显示传入的参数1
	for i in $2   # 遍历参数2中的每个配置选项
	do
		echo "查找 $i"   # 输出正在查找的配置选项
		result=$(cat $1 | grep "${i}=y" -w || echo "未找到")   # 在配置文件中查找配置选项，将结果存储在变量result中
		if [ "$result" = "未找到" ]; then   # 如果未找到配置选项
			echo -e "\e[41;1;37m错误：在 $1 中未找到配置项 ${i} \e[0m"   # 输出错误信息，配置项未找到
			echo "请确保您的配置文件包含以下列表中的选项"
			echo "---------------------------------------"
			echo "$2"   # 输出参数2中的配置选项列表
			echo "---------------------------------------"
			return -1;   # 返回-1表示检查失败
		fi
	done
	return 0   # 返回0表示检查通过
}

# 从默认配置文件中查找字符串
find_string_in_config()
{
	result=$(cat "$2" | grep "$1" || echo "No found")   # 在文件$2中查找字符串$1，将结果存储在变量result中
	if [ "$result" = "No found" ]; then   # 如果未找到字符串
		echo "Security: No found string $1 in $2"   # 输出错误信息，未找到字符串
		return -1;   # 返回-1表示未找到
	fi
	return 0;   # 返回0表示找到了字符串
}

check_security_condition()
{
	# check security enabled
	test -z "$RK_SYSTEM_CHECK_METHOD" && return 0

	if [ ! -d u-boot/keys ]; then
		echo "ERROR: No root keys(u-boot/keys) found in u-boot"
		echo "       Create it by ./build.sh createkeys or move your key to it"
		return -1
	fi

	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ]; then
		if [ ! -f u-boot/keys/root_passwd ]; then
			echo "ERROR: No root passwd(u-boot/keys/root_passwd) found in u-boot"
			echo "       echo your root key for sudo to u-boot/keys/root_passwd"
			echo "       some operations need supper user permission when create encrypt image"
			return -1
		fi

		if [ ! -f u-boot/keys/system_enc_key ]; then
			echo "ERROR: No enc key(u-boot/keys/system_enc_key) found in u-boot"
			echo "       Create it by ./build.sh createkeys or move your key to it"
			return -1
		fi

		BOOT_FIXED_CONFIGS="${BOOT_FIXED_CONFIGS}
				    ${BOOT_OPTEE_FIXED_CONFIGS}"
	fi

	echo "check kernel defconfig"
	defconfig_check \
		kernel/arch/$RK_KERNEL_ARCH/configs/$RK_KERNEL_DEFCONFIG \
		"$BOOT_FIXED_CONFIGS"

	if [ ! -z "${RK_PACKAGE_FILE_AB}" ]; then
		UBOOT_FIXED_CONFIGS="${UBOOT_FIXED_CONFIGS}
				     ${UBOOT_AB_FIXED_CONFIGS}"

		defconfig_check buildroot/configs/${RK_CFG_BUILDROOT}_defconfig "$ROOTFS_AB_FIXED_CONFIGS"
	fi
	echo "check uboot defconfig"
	defconfig_check u-boot/configs/${RK_UBOOT_DEFCONFIG}_defconfig "$UBOOT_FIXED_CONFIGS"

	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ]; then
		echo "check ramdisk defconfig"
		defconfig_check buildroot/configs/${RK_CFG_BUILDROOT}_defconfig "$ROOTFS_UPDATE_ENGINEBIN_CONFIGS"
	fi

	echo "check rootfs defconfig"
	find_string_in_config "BR2_ROOTFS_OVERLAY=\".*board/rockchip/common/security-system-overlay.*" "buildroot/configs/${RK_CFG_BUILDROOT}_defconfig"

	echo "Security: finish check"
}

# check_security_condition函数用于检查安全条件
check_security_condition()
{
	# 检查是否启用了安全选项，如果未启用则直接返回0
	test -z "$RK_SYSTEM_CHECK_METHOD" && return 0

	# 检查是否存在u-boot/keys目录，如果不存在则输出错误信息并返回-1
	if [ ! -d u-boot/keys ]; then
		echo "错误：在u-boot中未找到根密钥（u-boot/keys）"
		echo "      请通过./build.sh createkeys创建或将您的密钥移动到该目录中"
		return -1
	fi

	# 如果RK_SYSTEM_CHECK_METHOD的值为DM-E，则继续进行下一步检查
	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ]; then
		# 检查是否存在u-boot/keys/root_passwd文件，如果不存在则输出错误信息并返回-1
		if [ ! -f u-boot/keys/root_passwd ]; then
			echo "错误：在u-boot中未找到根口令（u-boot/keys/root_passwd）"
			echo "      请将您的根密钥（用于sudo）echo到u-boot/keys/root_passwd中"
			echo "      创建加密镜像时某些操作需要超级用户权限"
			return -1
		fi

		# 检查是否存在u-boot/keys/system_enc_key文件，如果不存在则输出错误信息并返回-1
		if [ ! -f u-boot/keys/system_enc_key ]; then
			echo "错误：在u-boot中未找到加密密钥（u-boot/keys/system_enc_key）"
			echo "      请通过./build.sh createkeys创建或将您的密钥移动到该目录中"
			return -1
		fi

		# 将BOOT_OPTEE_FIXED_CONFIGS添加到BOOT_FIXED_CONFIGS变量中
		BOOT_FIXED_CONFIGS="${BOOT_FIXED_CONFIGS}
				    ${BOOT_OPTEE_FIXED_CONFIGS}"
	fi

	echo "检查内核配置"
	defconfig_check \
		kernel/arch/$RK_KERNEL_ARCH/configs/$RK_KERNEL_DEFCONFIG \
		"$BOOT_FIXED_CONFIGS"

	# 如果RK_PACKAGE_FILE_AB不为空，则进行下一步检查
	if [ ! -z "${RK_PACKAGE_FILE_AB}" ]; then
		# 将UBOOT_AB_FIXED_CONFIGS添加到UBOOT_FIXED_CONFIGS变量中
		UBOOT_FIXED_CONFIGS="${UBOOT_FIXED_CONFIGS}
				     ${UBOOT_AB_FIXED_CONFIGS}"

		# 检查buildroot/configs/${RK_CFG_BUILDROOT}_defconfig文件是否存在
		defconfig_check buildroot/configs/${RK_CFG_BUILDROOT}_defconfig "$ROOTFS_AB_FIXED_CONFIGS"
	fi

	echo "检查uboot配置"
	defconfig_check u-boot/configs/${RK_UBOOT_DEFCONFIG}_defconfig "$UBOOT_FIXED_CONFIGS"

	# 如果RK_SYSTEM_CHECK_METHOD的值为DM-E，则继续进行下一步检查
	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ]; then
		echo "检查ramdisk配置"
		defconfig_check buildroot/configs/${RK_CFG_BUILDROOT}_defconfig "$ROOTFS_UPDATE_ENGINEBIN_CONFIGS"
	fi

	echo "检查rootfs配置"
	# 在buildroot/configs/${RK_CFG_BUILDROOT}_defconfig文件中查找字符串"BR2_ROOTFS_OVERLAY=\".*board/rockchip/common/security-system-overlay.*"
	find_string_in_config "BR2_ROOTFS_OVERLAY=\".*board/rockchip/common/security-system-overlay.*" "buildroot/configs/${RK_CFG_BUILDROOT}_defconfig"

	echo "安全检查完成"
}

# 清理
build_cleanall()
{
	echo "clean uboot, kernel, rootfs, recovery"   # 执行清理操作，清理u-boot、kernel、rootfs和recovery相关的内容

	make -C u-boot distclean   # 在u-boot目录中执行distclean命令，清理构建过程产生的临时文件和目标文件
	make -C kernel distclean   # 在kernel目录中执行distclean命令，清理构建过程产生的临时文件和目标文件
	rm -rf buildroot/output   # 删除buildroot/output目录，清理构建rootfs过程中生成的文件
	rm -rf yocto/build/tmp yocto/build/*cache   # 删除yocto/build/tmp目录和所有yocto/build/*cache目录，清理构建yocto过程中生成的临时文件和缓存文件
	rm -rf debian/binary   # 删除debian/binary目录，清理构建debian包时生成的二进制文件

	finish_build   # 调用finish_build函数，进行后续的清理和处理操作
}

build_firmware()
{
	./mkfirmware.sh $BOARD_CONFIG   # 运行mkfirmware.sh脚本，传递$BOARD_CONFIG参数，用于构建固件

	finish_build   # 调用finish_build函数，进行后续的清理和处理操作
}

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

# 编译ota的包
build_otapackage()
{
	IMAGE_PATH=$TOP_DIR/rockdev   # 设置IMAGE_PATH变量为$TOP_DIR/rockdev，用于存储生成的镜像文件路径
	PACK_TOOL_DIR=$TOP_DIR/tools/linux/Linux_Pack_Firmware   # 设置PACK_TOOL_DIR变量为$TOP_DIR/tools/linux/Linux_Pack_Firmware，用于存储打包工具的路径

	echo "Make ota ab update_ota.img"
	cd $PACK_TOOL_DIR/rockdev   # 进入$PACK_TOOL_DIR/rockdev目录

	if [ -f "$RK_PACKAGE_FILE_OTA" ]; then   # 如果存在$RK_PACKAGE_FILE_OTA文件
		source_package_file_name=`ls -lh $PACK_TOOL_DIR/rockdev/package-file | awk -F ' ' '{print $NF}'`   # 获取package-file的文件名
		ln -fs "$RK_PACKAGE_FILE_OTA" package-file   # 创建软链接，将$RK_PACKAGE_FILE_OTA链接到package-file
		./mkupdate.sh   # 运行mkupdate.sh脚本，生成update.img
		mv update.img $IMAGE_PATH/update_ota.img   # 将生成的update.img移动到$IMAGE_PATH/update_ota.img
		ln -fs $source_package_file_name package-file   # 创建软链接，将source_package_file_name链接到package-file
	fi

	finish_build   # 调用finish_build函数，进行后续的清理和处理操作
}

# 编译sd卡镜像
build_sdcard_package()
{
	check_config RK_UPDATE_SDCARD_ENABLE_FOR_AB || return 0   # 检查配置项 RK_UPDATE_SDCARD_ENABLE_FOR_AB，如果没有启用则返回0

	local image_path=$TOP_DIR/rockdev   # 设置image_path变量为$TOP_DIR/rockdev，用于存储生成的镜像文件路径
	local pack_tool_dir=$TOP_DIR/tools/linux/Linux_Pack_Firmware   # 设置pack_tool_dir变量为$TOP_DIR/tools/linux/Linux_Pack_Firmware，用于存储打包工具的路径
	local rk_sdupdate_ab_misc=${RK_SDUPDATE_AB_MISC:=sdupdate-ab-misc.img}   # 设置rk_sdupdate_ab_misc变量为RK_SDUPDATE_AB_MISC的值（默认为sdupdate-ab-misc.img）
	local rk_parameter_sdupdate=${RK_PARAMETER_SDUPDATE:=parameter-sdupdate.txt}   # 设置rk_parameter_sdupdate变量为RK_PARAMETER_SDUPDATE的值（默认为parameter-sdupdate.txt）
	local rk_package_file_sdcard_update=${RK_PACKAGE_FILE_SDCARD_UPDATE:=sdcard-update-package-file}   # 设置rk_package_file_sdcard_update变量为RK_PACKAGE_FILE_SDCARD_UPDATE的值（默认为sdcard-update-package-file）
	local sdupdate_ab_misc_img=$TOP_DIR/device/rockchip/common/images/$rk_sdupdate_ab_misc   # 设置sdupdate_ab_misc_img变量为$TOP_DIR/device/rockchip/common/images/加上rk_sdupdate_ab_misc的值
	local parameter_sdupdate=$TOP_DIR/device/rockchip/common/images/$rk_parameter_sdupdate   # 设置parameter_sdupdate变量为$TOP_DIR/device/rockchip/common/images/加上rk_parameter_sdupdate的值
	local recovery_img=$TOP_DIR/buildroot/output/$RK_UPDATE_SDCARD_CFG_RECOVERY/images/recovery.img   # 设置recovery_img变量为$TOP_DIR/buildroot/output/加上RK_UPDATE_SDCARD_CFG_RECOVERY/images/recovery.img的值

	if [ $RK_UPDATE_SDCARD_CFG_RECOVERY ]; then   # 如果存在RK_UPDATE_SDCARD_CFG_RECOVERY配置项
		if [ -f $recovery_img ]; then   # 如果存在recovery_img文件
			echo -n "create recovery.img..."   # 输出提示信息
			ln -rsf $recovery_img $image_path/recovery.img   # 创建软链接，将recovery_img链接到$image_path/recovery.img
		else
			echo "error: $recovery_img not found!"   # 输出错误信息
			return 1   # 返回1表示出错
		fi
	fi

	echo "Make sdcard update update_sdcard.img"   # 输出提示信息
	cd $pack_tool_dir/rockdev   # 进入$pack_tool_dir/rockdev目录
	if [ -f "$rk_package_file_sdcard_update" ]; then   # 如果存在$rk_package_file_sdcard_update文件
		if [ $rk_parameter_sdupdate ]; then   # 如果存在$rk_parameter_sdupdate变量
			if [ -f $parameter_sdupdate ]; then   # 如果存在$parameter_sdupdate文件
				echo -n "create sdcard update image parameter..."   # 输出提示信息
				ln -rsf $parameter_sdupdate $image_path/   # 创建软链接，将$parameter_sdupdate链接到$image_path/
			fi
		fi

		if [ $rk_sdupdate_ab_misc ]; then   # 如果存在$rk_sdupdate_ab_misc变量
			if [ -f $sdupdate_ab_misc_img ]; then   # 如果存在$sdupdate_ab_misc_img文件
				echo -n "create sdupdate ab misc.img..."   # 输出提示信息
				ln -rsf $sdupdate_ab_misc_img $image_path/   # 创建软链接，将$sdupdate_ab_misc_img链接到$image_path/
			fi
		fi

		source_package_file_name=`ls -lh $pack_tool_dir/rockdev/package-file | awk -F ' ' '{print $NF}'`   # 获取$pack_tool_dir/rockdev/package-file的文件名
		ln -fs "$rk_package_file_sdcard_update" package-file   # 创建软链接，将$rk_package_file_sdcard_update链接到package-file
		./mkupdate.sh   # 运行mkupdate.sh脚本，生成update.img
		mv update.img $image_path/update_sdcard.img   # 将生成的update.img移动到$image_path/update_sdcard.img
		ln -fs $source_package_file_name package-file   # 创建软链接，将$source_package_file_name链接到package-file
		rm -f $image_path/$rk_sdupdate_abmisc $image_path/$rk_parameter_sdupdate $image_path/recovery.img   # 删除$image_path/$rk_sdupdate_ab_misc、$image_path/$rk_parameter_sdupdate和$image_path/recovery.img文件
	fi

	finish_build   # 调用finish_build函数
}

build_save()
{
	IMAGE_PATH=$TOP_DIR/rockdev   # 设置IMAGE_PATH变量为$TOP_DIR/rockdev，用于存储生成的镜像文件路径
	DATE=$(date  +%Y%m%d.%H%M)   # 获取当前日期和时间，格式为YYYYMMDD.HHMM
	STUB_PATH=Image/"$RK_KERNEL_DTS"_"$DATE"_RELEASE_TEST   # 设置STUB_PATH变量为Image/加上$RK_KERNEL_DTS、日期和_RELEASE_TEST
	STUB_PATH="$(echo $STUB_PATH | tr '[:lower:]' '[:upper:]')"   # 将STUB_PATH转换为大写字母
	export STUB_PATH=$TOP_DIR/$STUB_PATH   # 导出STUB_PATH变量为$TOP_DIR/加上$STUB_PATH
	export STUB_PATCH_PATH=$STUB_PATH/PATCHES   # 导出STUB_PATCH_PATH变量为$STUB_PATH/PATCHES
	mkdir -p $STUB_PATH   # 创建$STUB_PATH目录

	# 生成补丁文件
#	.repo/repo/repo forall -c \
#		"$TOP_DIR/device/rockchip/common/gen_patches_body.sh"

	# 复制补丁文件
#	yes | .repo/repo/repo manifest -r -o $STUB_PATH/manifest_${DATE}.xml
	mkdir -p $STUB_PATCH_PATH/kernel   # 创建$STUB_PATCH_PATH/kernel目录
	cp kernel/.config $STUB_PATCH_PATH/kernel   # 复制kernel目录下的.config文件到$STUB_PATCH_PATH/kernel目录
	cp kernel/vmlinux $STUB_PATCH_PATH/kernel   # 复制kernel目录下的vmlinux文件到$STUB_PATCH_PATH/kernel目录
	mkdir -p $STUB_PATH/IMAGES/   # 创建$STUB_PATH/IMAGES/目录
	cp $IMAGE_PATH/* $STUB_PATH/IMAGES/   # 复制$IMAGE_PATH目录下的所有文件到$STUB_PATH/IMAGES/目录

	# 保存构建命令信息
	echo "UBOOT:  defconfig: $RK_UBOOT_DEFCONFIG" >> $STUB_PATH/build_cmd_info   # 将UBOOT的配置信息写入build_cmd_info文件
	echo "KERNEL: defconfig: $RK_KERNEL_DEFCONFIG, dts: $RK_KERNEL_DTS" >> $STUB_PATH/build_cmd_info   # 将KERNEL的配置信息写入build_cmd_info文件
	echo "BUILDROOT: $RK_CFG_BUILDROOT" >> $STUB_PATH/build_cmd_info   # 将BUILDROOT的配置信息写入build_cmd_info文件

	finish_build   # 调用finish_build函数
}

build_allsave()
{
	rm -fr $TOP_DIR/rockdev   # 删除$TOP_DIR/rockdev目录及其内容
	mkdir -p $TOP_DIR/rockdev   # 创建$TOP_DIR/rockdev目录
	build_all   # 调用build_all函数，执行全部构建过程
	build_firmware   # 调用build_firmware函数，构建固件
	build_updateimg   # 调用build_updateimg函数，构建更新镜像
	build_save   # 调用build_save函数，保存构建过程中的相关文件

	build_check_power_domain   # 调用build_check_power_domain函数，检查电源域配置

	finish_build   # 调用finish_build函数
}

create_keys()
{
	test -d u-boot/keys && echo "ERROR: u-boot/keys has existed" && return -1   # 检查u-boot/keys目录是否已存在，如果存在则输出错误信息并返回-1

	mkdir u-boot/keys -p   # 创建u-boot/keys目录

	./rkbin/tools/rk_sign_tool kk --bits 2048 --out u-boot/keys   # 使用rk_sign_tool工具生成密钥对，密钥长度为2048位，并存储在u-boot/keys目录下
	ln -s private_key.pem u-boot/keys/dev.key   # 创建符号链接将private_key.pem命名为u-boot/keys/dev.key
	ln -s public_key.pem u-boot/keys/dev.pubkey   # 创建符号链接将public_key.pem命名为u-boot/keys/dev.pubkey

	openssl req -batch -new -x509 -key u-boot/keys/dev.key -out u-boot/keys/dev.crt   # 使用openssl生成自签名证书，使用u-boot/keys/dev.key作为私钥，生成的证书存储在u-boot/keys/dev.crt中

	openssl rand -out u-boot/keys/system_enc_key -hex 32   # 使用openssl生成32字节的随机数，并以十六进制格式存储在u-boot/keys/system_enc_key文件中
}

security_is_enabled()
{
	if [ "$RK_RAMDISK_SECURITY_BOOTUP" != "true" ]; then   # 如果环境变量$RK_RAMDISK_SECURITY_BOOTUP不等于"true"
		echo "No security paramter found in $BOARD_CONFIG"   # 输出错误信息，表示在$BOARD_CONFIG中未找到安全参数
		exit -1   # 退出脚本，返回-1
	fi
}


#=========================
# build targets
#=========================

# OPTIONS="${@:-allsave}"
if [ -z "$1" ]; then
    titlestr="请选择一个选项"                         # 菜单标题
    backtitle="iTOP-RK3568构建脚本，http://www.topeet.com"  # 返回标题
    menustr="编译镜像 | u-boot| 内核| recovery| buildroot | debian | yocto | all"  # 菜单选项

    TTY_X=$(($(stty size | awk '{print $2}')-6))  # 确定终端宽度
    TTY_Y=$(($(stty size | awk '{print $1}')-6))  # 确定终端高度

    choose+=("uboot"       "build_uboot")      # 选项1: u-boot编译
    choose+=("kernel"       "build_kernel")    # 选项2: 内核编译
    choose+=("recovery"       "build_recovery")  # 选项3: recovery编译
    choose+=("buildroot"       "build_rootfs buildroot")  # 选项4: 编译buildroot根文件系统
    choose+=("debian"       "build_rootfs debian")         # 选项5: 编译Debian根文件系统
    choose+=("yocto"       "build_rootfs yocto")           # 选项6: 编译Yocto根文件系统
    choose+=("save"       "build_save")        # 选项7: 保存构建结果
    choose+=("all"       "build_all")          # 选项8: 编译所有

    OPTIONS=$(whiptail --title "${titlestr}" --backtitle "${backtitle}" --notags \
                --menu "${menustr}" "${TTY_Y}" "${TTY_X}" $((TTY_Y - 8)) \
                --cancel-button 退出 --ok-button 选择 "${choose[@]}" \
                3>&1 1>&2 2>&3)  # 使用whiptail创建菜单，并获取用户选择的选项

else
    OPTIONS="${1}"
fi

# 预处理选项
unset POST_OPTIONS
for option in $OPTIONS; do
    case $option in
        BoardConfig*.mk)
            option="$CHIP_DIR/$option"
            ;&
        *.mk)
            CONF=$(realpath $option)
            echo "切换到配置文件: $CONF"
            if [ ! -f $CONF ]; then
                echo "文件不存在!"
                exit 1
            fi

            ln -rsf $CONF $BOARD_CONFIG
            ;;
        lunch) choose_board ;;
        kernel-4.4|kernel-4.19|kernel-5.10)
            RK_KERNEL_VERSION=${option#kernel-}
            ;;
        *) POST_OPTIONS="$POST_OPTIONS $option";;
    esac
done

if [ -r "$BOARD_CONFIG" ]; then  # 如果配置文件存在且可读
    source $BOARD_CONFIG  # 导入配置文件
else
    choose_board  # 否则，调用选择板型函数
fi

if [ -d "$CHIP_DIR/build-hooks/" ]; then  # 如果存在构建钩子目录
    for hook in $(find "$CHIP_DIR/build-hooks" -name "*.sh"); do  # 遍历所有以.sh结尾的文件
        source "$hook"  # 导入每个构建钩子脚本
    done
fi

# 回退到当前内核版本
RK_KERNEL_VERSION=${RK_KERNEL_VERSION:-$(kernel_version kernel/)}

# 回退到5.10内核版本
RK_KERNEL_VERSION=${RK_KERNEL_VERSION:-5.10}

# 更新内核
if [ "$(kernel_version kernel/)" != "$RK_KERNEL_VERSION" ]; then  # 如果当前内核版本与指定版本不一致
    KERNEL_DIR=kernel-$RK_KERNEL_VERSION  # 设置新的内核目录名称
    echo "切换到 $KERNEL_DIR"
    if [ ! -d "$KERNEL_DIR" ]; then  # 如果新的内核目录不存在
        echo "不存在！"
        exit 1
    fi
    rm -rf kernel  # 删除旧的内核软链接
    ln -rsf $KERNEL_DIR kernel  # 创建新的内核软链接
fi
# 后续选项处理
for option in $POST_OPTIONS; do
    echo "处理选项: $option"
    case $option in
        all) build_all ;;  # 执行编译所有选项
        save) build_save ;;  # 执行保存构建结果选项
        allsave) build_allsave ;;  # 执行编译所有并保存结果选项
        cleanall) build_cleanall ;;  # 执行清理所有构建结果选项
        firmware) build_firmware ;;  # 执行编译固件选项
        updateimg) build_updateimg ;;  # 执行编译更新镜像选项
        otapackage) build_otapackage ;;  # 执行编译OTA包选项
        sdpackage) build_sdcard_package ;;  # 执行编译SD卡镜像选项
        spl) build_spl ;;  # 执行编译SPL选项
        uboot) build_uboot ;;  # 执行编译u-boot选项
        uefi) build_uefi ;;  # 执行编译UEFI选项
        loader) build_loader ;;  # 执行编译loader选项
        kernel) build_kernel ;;  # 执行编译内核选项
        wifibt)  # 执行编译Wi-Fi和蓝牙固件选项
            build_wifibt $2 $3  # 调用编译Wi-Fi和蓝牙固件的函数，并传递参数$2和$3
            exit 1 ;;  # 退出脚本
        modules) build_modules ;;  # 执行编译内核模块选项
        rootfs) build_rootfs ;;  # 执行编译根文件系统选项
        buildroot|debian|yocto) build_rootfs $option ;;  # 执行编译指定根文件系统选项
        pcba) build_pcba ;;  # 执行编译PCBA选项
        recovery) build_recovery ;;  # 执行编译recovery选项
        info) build_info ;;  # 执行显示构建信息选项
        createkeys) create_keys ;;  # 执行生成密钥选项
        security_boot)  # 执行启用安全引导的选项
            security_is_enabled  # 检查安全引导是否已启用
            build_rootfs  # 编译根文件系统
            build_uboot boot  # 编译启动引导程序
            ;;
        security_uboot)  # 执行启用安全引导的u-boot选项
            security_is_enabled  # 检查安全引导是否已启用
            build_uboot uboot  # 编译u-boot引导程序
            ;;
        security_recovery)  # 执行启用安全引导的recovery选项
            security_is_enabled  # 检查安全引导是否已启用
            build_recovery  # 编译recovery
            build_uboot recovery  # 编译recovery引导程序
            ;;
        security_check) check_security_condition ;;  # 执行检查安全条件选项
        security_rootfs)  # 执行启用安全引导的根文件系统选项
            security_is_enabled  # 检查安全引导是否已启用
            build_rootfs  # 编译根文件系统
            build_uboot  # 编译u-boot引导程序
            echo "请更新 rootfs.img / boot.img"
            ;;
        *) usage ;;  # 显示用法
    esac
done

~~~

