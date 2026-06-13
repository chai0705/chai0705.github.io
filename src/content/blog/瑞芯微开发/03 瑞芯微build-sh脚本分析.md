1|---
2|description: "build.sh脚本内容如下所示： shell !/bin/bash 设置环境变量 LC_ALL，用于定义程序的本地化设置 将 LC_ALL 设置为 C，表示使用标准的C语言环境，忽略本地化设置 export LC_ALLC 设置环境变量 LD_LIBRARY_PATH，用于指定动态链接库的搜"
3|cover: /img/cover/4.webp
4|
5|title: 瑞芯微build-sh脚本分析
6|date: 2023-09-10 17:16:56
7|categories:
8|  - 瑞芯微开发
9|link: 瑞芯微开发/03 瑞芯微build-sh脚本分析
10|---
11|
12|build.sh脚本内容如下所示：
13|
14|~~~shell
15|#!/bin/bash
16|
17|# 设置环境变量 LC_ALL，用于定义程序的本地化设置
18|# 将 LC_ALL 设置为 C，表示使用标准的C语言环境，忽略本地化设置
19|export LC_ALL=C
20|
21|# 设置环境变量 LD_LIBRARY_PATH，用于指定动态链接库的搜索路径
22|# 将 LD_LIBRARY_PATH 设置为空，表示清空动态链接库搜索路径
23|export LD_LIBRARY_PATH=
24|
25|# 错误处理函数
26|err_handler()
27|{
28|	ret=$?
29|	[ "$ret" -eq 0 ] && return
30|	# 打印错误信息
31|	echo "ERROR: Running ${FUNCNAME[1]} failed!"
32|	echo "ERROR: exit code $ret from line ${BASH_LINENO[0]}:"
33|	echo "    $BASH_COMMAND"
34|	# 退出脚本
35|	exit $ret
36|}
37|
38|# 设置错误处理函数为 trap 的处理程序，当发生错误时调用 err_handler() 函数
39|trap 'err_handler' ERR
40|
41|# 设置 shell 的错误处理行为
42|set -eE
43|
44|# 完成构建操作
45|finish_build()
46|{
47|	echo "Running ${FUNCNAME[1]} succeeded."
48|	# 切换到顶级目录
49|	cd $TOP_DIR
50|}
51|
52|# 检查配置函数
53|check_config()
54|{
55|	# 清除变量 missing
56|	unset missing
57|	# 遍历传入的参数列表
58|
59|	for var in $@; do
60|		# 使用 eval 检查变量是否存在值，如果存在则跳过
61|		eval [ \$$var ] && continue
62|		# 将缺失的配置变量记录到 missing 变量中
63|		missing="$missing $var"
64|	done
65|	# 如果所有配置变量均存在值，则返回0表示检查通过
66|	[ -z "$missing" ] && return 0
67|	# 如果存在缺失的配置变量，则输出错误信息并返回1
68|	echo "Skipping ${FUNCNAME[1]} for missing configs: $missing."
69|	return 1
70|}
71|
72|# 选择板卡函数
73|choose_board()
74|{
75|	# 获取板卡配置文件列表到 BOARD_ARRAY 数组
76|	BOARD_ARRAY=( $(cd ${CHIP_DIR}/; ls BoardConfig*.mk | sort) )
77|
78|	# 获取板卡数组的长度	
79|	RK_TARGET_BOARD_ARRAY_LEN=${#BOARD_ARRAY[@]}
80|	
81|	# 如果板卡数组长度为0，则表示没有可用的板卡配置文件，输出错误信息并返回-1
82|	if [ $RK_TARGET_BOARD_ARRAY_LEN -eq 0 ]; then
83|		echo "No available Board Config"
84|		return -1
85|	fi
86|
87|	echo
88|	echo "You're building on Linux"
89|	echo "Lunch menu...pick a combo:"
90|	echo ""
91|	
92|	# 输出可用的板卡配置文件列表
93|	echo "0. default BoardConfig.mk"
94|	echo ${BOARD_ARRAY[@]} | xargs -n 1 | sed "=" | sed "N;s/\n/. /"
95|
96|	local INDEX
97|	read -p "Which would you like? [0]: " INDEX
98|	INDEX=$((${INDEX:-0} - 1))
99|	
100|	# 根据用户选择的索引确定所选的板卡配置文件
101|	if echo $INDEX | grep -vq [^0-9]; then
102|		BOARD="${BOARD_ARRAY[$INDEX]}"
103|	else
104|		echo "Lunching for Default BoardConfig.mk boards..."
105|		BOARD=BoardConfig.mk
106|	fi
107|
108|	# 创建符号链接，将所选的板卡配置文件链接到 BOARD_CONFIG 变量指定的路径
109|	ln -rsf "$CHIP_DIR/$BOARD" "$BOARD_CONFIG"
110|	echo "switching to board: $(realpath $BOARD_CONFIG)"
111|}
112|# 获取当前脚本所在目录的绝对路径，并赋值给 COMMON_DIR 变量
113|COMMON_DIR="$(dirname "$(realpath "$0")")"
114|
115|# 根据 COMMON_DIR 计算出顶级目录的绝对路径，并赋值给 TOP_DIR 变量
116|TOP_DIR="$(realpath "$COMMON_DIR/../../..")"
117|
118|# 切换到顶级目录
119|cd "$TOP_DIR"
120|
121|# 创建 rockdev 目录（如果不存在）
122|mkdir -p rockdev
123|
124|# 设置 BOARD_CONFIG 变量为顶级目录下的 device/rockchip/.BoardConfig.mk 文件的绝对路径
125|BOARD_CONFIG="$TOP_DIR/device/rockchip/.BoardConfig.mk"
126|
127|# 获取 CHIP_DIR 变量的绝对路径，该变量指向顶级目录下的 device/rockchip/.target_product 目录
128|CHIP_DIR="$(realpath $TOP_DIR/device/rockchip/.target_product)"
129|
130|# 预构建 U-Boot 函数
131|prebuild_uboot()
132|{
133|	# 构建 U-Boot 的编译命令字符串
134|	UBOOT_COMPILE_COMMANDS="\
135|			${RK_TRUST_INI_CONFIG:+../rkbin/RKTRUST/$RK_TRUST_INI_CONFIG} \
136|			${RK_SPL_INI_CONFIG:+../rkbin/RKBOOT/$RK_SPL_INI_CONFIG} \
137|			${RK_UBOOT_SIZE_CONFIG:+--sz-uboot $RK_UBOOT_SIZE_CONFIG} \
138|			${RK_TRUST_SIZE_CONFIG:+--sz-trust $RK_TRUST_SIZE_CONFIG}"
139|	UBOOT_COMPILE_COMMANDS="$(echo $UBOOT_COMPILE_COMMANDS)"
140|	# 如果启用 RAMDISK 安全启动，则添加相关的编译命令选项
141|	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
142|		UBOOT_COMPILE_COMMANDS=" \
143|			$UBOOT_COMPILE_COMMANDS \
144|			${RK_ROLLBACK_INDEX_BOOT:+--rollback-index-boot $RK_ROLLBACK_INDEX_BOOT} \
145|			${RK_ROLLBACK_INDEX_UBOOT:+--rollback-index-uboot $RK_ROLLBACK_INDEX_UBOOT} "
146|	fi
147|}
148|
149|# 预构建安全启动的 U-Boot 函数
150|prebuild_security_uboot()
151|{
152|	# 获取传入的模式参数
153|	local mode=$1
154|	# 如果启用 RAMDISK 安全启动，则添加相关的编译命令选项
155|	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
156|		# 如果 RK_SECURITY_OTP_DEBUG 不等于 "true"，则添加 --burn-key-hash 选项
157|		if [ "$RK_SECURITY_OTP_DEBUG" != "true" ]; then
158|			UBOOT_COMPILE_COMMANDS="$UBOOT_COMPILE_COMMANDS --burn-key-hash"
159|		fi
160|		# 根据传入的模式参数进行不同的处理
161|		case "${mode:-normal}" in
162|			# 对于 uboot 模式，不需要额外的处理
163|			uboot)
164|				;;
165|			# 对于 boot 模式，添加 --boot_img 选项，并设置值为 $TOP_DIR/u-boot/boot.img
166|			boot)
167|				UBOOT_COMPILE_COMMANDS=" \
168|					--boot_img $TOP_DIR/u-boot/boot.img \
169|					$UBOOT_COMPILE_COMMANDS "
170|				;;
171|			# 对于 recovery 模式，添加 --recovery_img 选项，并设置值为 $TOP_DIR/u-boot/recovery.img
172|			recovery)
173|				UBOOT_COMPILE_COMMANDS=" \
174|					--recovery_img $TOP_DIR/u-boot/recovery.img
175|					$UBOOT_COMPILE_COMMANDS "
176|				;;
177|			*)
178|			# 对于其他模式，默认添加 --boot_img 选项，并设置值为 $TOP_DIR/u-boot/boot.img
179|				UBOOT_COMPILE_COMMANDS=" \
180|					--boot_img $TOP_DIR/u-boot/boot.img \
181|					$UBOOT_COMPILE_COMMANDS "
182|				# 如果 RK_PACKAGE_FILE_AB 为空，则添加 --recovery_img 选项，并设置值为 $TOP_DIR/u-boot/recovery.img
183|				test -z "${RK_PACKAGE_FILE_AB}" && \
184|					UBOOT_COMPILE_COMMANDS="$UBOOT_COMPILE_COMMANDS --recovery_img $TOP_DIR/u-boot/recovery.img"
185|				;;
186|		esac
187|		# 使用 echo 命令重新赋值 UBOOT_COMPILE_COMMANDS 变量，去除多余空格
188|		UBOOT_COMPILE_COMMANDS="$(echo $UBOOT_COMPILE_COMMANDS)"
189|	fi
190|}
191|
192|# 用法函数，打印脚本的使用说明
193|usage()
194|{
195|	# 打印使用说明
196|	echo "Usage: build.sh [OPTIONS]"
197|	echo "Available options:"
198|	echo "BoardConfig*.mk    -switch to specified board config"
199|	echo "lunch              -list current SDK boards and switch to specified board config"
200|	echo "wifibt             -build wifibt"
201|	echo "uboot              -build uboot"
202|	echo "uefi		 -build uefi"
203|	echo "spl                -build spl"
204|	echo "loader             -build loader"
205|	echo "kernel-4.4         -build kernel 4.4"
206|	echo "kernel-4.19        -build kernel 4.19"
207|	echo "kernel-5.10        -build kernel 5.10"
208|	echo "kernel             -build kernel"
209|	echo "modules            -build kernel modules"
210|	echo "rootfs             -build rootfs (default is buildroot)"
211|	echo "buildroot          -build buildroot rootfs"
212|	echo "yocto              -build yocto rootfs"
213|	echo "debian             -build debian rootfs"
214|	echo "pcba               -build pcba"
215|	echo "recovery           -build recovery"
216|	echo "all                -build uboot, kernel, rootfs, recovery image"
217|	echo "cleanall           -clean uboot, kernel, rootfs, recovery"
218|	echo "firmware           -pack all the image we need to boot up system"
219|	echo "updateimg          -pack update image"
220|	echo "otapackage         -pack ab update otapackage image (update_ota.img)"
221|	echo "sdpackage          -pack update sdcard package image (update_sdcard.img)"
222|	echo "save               -save images, patches, commands used to debug"
223|	echo "allsave            -build all & firmware & updateimg & save"
224|	echo "info               -see the current board building information"
225|	echo ""
226|	echo "createkeys         -create secureboot root keys"
227|	echo "security_rootfs    -build rootfs and some relevant images with security paramter (just for dm-v)"
228|	echo "security_boot      -build boot with security paramter"
229|	echo "security_uboot     -build uboot with security paramter"
230|	echo "security_recovery  -build recovery with security paramter"
231|	echo "security_check     -check security paramter if it's good"
232|	echo ""
233|	echo "Default option is 'allsave'."
234|}
235|
236|# 构建信息函数，打印当前构建的相关信息
237|build_info()
238|{
239|	# 如果 CHIP_DIR 路径不存在，则打印错误信息，表示未找到目标芯片
240|	if [ ! -L $CHIP_DIR ];then
241|		echo "No found target chip!!!"
242|	fi
243|	# 如果 BOARD_CONFIG 路径不存在，则打印错误信息，表示未找到目标板级配置
244|	if [ ! -L $BOARD_CONFIG ];then
245|		echo "No found target board config!!!"
246|	fi
247|
248|	# 如果存在 .repo/manifest.xml 文件，则获取 SDK 版本号，并打印构建的 SDK 版本
249|	if [ -f .repo/manifest.xml ]; then
250|		local sdk_ver=""
251|		sdk_ver=`grep "include name"  .repo/manifest.xml | awk -F\" '{print $2}'`
252|		sdk_ver=`realpath .repo/manifests/${sdk_ver}`
253|		echo "Build SDK version: `basename ${sdk_ver}`"
254|	else
255|		echo "Not found .repo/manifest.xml [ignore] !!!"
256|	fi
257|
258|	# 打印当前构建的信息，包括目标芯片、目标板级配置和一些目标的其他配置参数
259|	echo "Current Building Information:"
260|	echo "Target Chip: $CHIP_DIR"
261|	echo "Target BoardConfig: `realpath $BOARD_CONFIG`"
262|	echo "Target Misc config:"
263|	echo "`env |grep "^RK_" | grep -v "=$" | sort`"
264|
265|	# 根据 RK_KERNEL_ARCH 变量的值确定设备树（dtb）的路径，并删除已存在的 dtb 文件
266|	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
267|		dtb="kernel/arch/arm/boot/dts/${RK_KERNEL_DTS}.dtb"
268|	else
269|		dtb="kernel/arch/arm64/boot/dts/rockchip/${RK_KERNEL_DTS}.dtb"
270|	fi
271|
272|	rm -f $dtb
273|
274|	# 使用 $KMAKE dtbs 命令生成设备树（dtb）文件
275|	$KMAKE dtbs
276|
277|	# 调用 build_check_power_domain 函数检查电源域
278|	build_check_power_domain
279|}
280|
281|# 构建检查电源域函数，用于检查电源域配置是否正确
282|build_check_power_domain()
283|{
284|	# 定义临时文件和变量
285|	local dump_kernel_dtb_file
286|	local tmp_phandle_file
287|	local tmp_io_domain_file
288|	local tmp_regulator_microvolt_file
289|	local tmp_final_target
290|	local tmp_none_item
291|
292|	# 根据 RK_KERNEL_ARCH 变量的值确定设备树（dts）文件的路径
293|	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
294|		dts="kernel/arch/arm/boot/dts/$RK_KERNEL_DTS"
295|	else
296|		dts="kernel/arch/arm64/boot/dts/rockchip/$RK_KERNEL_DTS"
297|	fi
298|
299|	# 定义临时文件的路径
300|	dump_kernel_dtb_file=${dts}.dump.dts
301|	tmp_phandle_file=`mktemp`
302|	tmp_io_domain_file=`mktemp`
303|	tmp_regulator_microvolt_file=`mktemp`
304|	tmp_final_target=`mktemp`
305|	tmp_grep_file=`mktemp`
306|
307|	# 将设备树二进制文件转换为文本格式，并保存为 dump_kernel_dtb_file
308|	dtc -I dtb -O dts -o ${dump_kernel_dtb_file} ${dts}.dtb 2>/dev/null
309|
310|	# 如果 RK_SYSTEM_CHECK_METHOD 变量的值为 "DM-E"，则检查是否在设备树中添加了 optee-tz 的兼容性
311|	if [ "$RK_SYSTEM_CHECK_METHOD" = "DM-E" ] ; then
312|		if ! grep "compatible = \"linaro,optee-tz\";" $dump_kernel_dtb_file > /dev/null 2>&1 ; then
313|			echo "Please add: "
314|			echo "        optee: optee {"
315|			echo "                compatible = \"linaro,optee-tz\";"
316|			echo "                method = \"smc\";"
317|			echo "                status = \"okay\";"
318|			echo "        }"
319|			echo "To your dts file"
320|			return -1;
321|		fi
322|	fi
323|	# 使用正则表达式从设备树中提取 io-domains 配置，并保存到临时文件 tmp_io_domain_file 和 tmp_grep_file
324|	if ! grep -Pzo "io-domains\s*{(\n|\w|-|;|=|<|>|\"|_|\s|,)*};" $dump_kernel_dtb_file 1>$tmp_grep_file 2>/dev/null; then
325|		#echo "Not Found io-domains in ${dts}.dts"
326|		rm -f $tmp_grep_file
327|		return 0
328|	fi
329|
330|	# 从临时文件 tmp_grep_file 中提取供电（supply）信息，并保存到临时文件 tmp_io_domain_file
331|	grep -a supply $tmp_grep_file > $tmp_io_domain_file
332|	rm -f $tmp_grep_file
333|	awk '{print "phandle = " $3}' $tmp_io_domain_file > $tmp_phandle_file
334|
335|	# 逐行读取临时文件 tmp_phandle_file 和 tmp_io_domain_file，并进行处理
336|	while IFS= read -r item_phandle && IFS= read -u 3 -r item_domain
337|	do
338|		echo "${item_domain% *}" >> $tmp_regulator_microvolt_file
339|		tmp_none_item=${item_domain% *}
340|		cmds="grep -Pzo \"{(\\n|\w|-|;|=|<|>|\\\"|_|\s)*"$item_phandle\"
341|
342|		# 使用 eval 执行命令，从设备树中提取相应的 regulator-m..-microvolt 配置，并将结果保存到临时文件 tmp_regulator_microvolt_file
343|		eval "$cmds $dump_kernel_dtb_file | strings | grep "regulator-m..-microvolt" >> $tmp_regulator_microvolt_file" || \
344|			eval "sed -i \"/${tmp_none_item}/d\" $tmp_regulator_microvolt_file" && continue
345|
346|		echo >> $tmp_regulator_microvolt_file
347|	done < $tmp_phandle_file 3<$tmp_io_domain_file
348|
349|	# 逐行读取临时文件 tmp_regulator_microvolt_file，生成最终的目标文件 tmp_final_target
350|	while read -r regulator_val
351|	do
352|		if echo ${regulator_val} | grep supply &>/dev/null; then
353|			echo -e "\n\n\e[1;33m${regulator_val%*=}\e[0m" >> $tmp_final_target
354|		else
355|			tmp_none_item=${regulator_val##*<}
356|			tmp_none_item=${tmp_none_item%%>*}
357|			echo -e "${regulator_val%%<*} \e[1;31m$(( $tmp_none_item / 1000 ))mV\e[0m" >> $tmp_final_target
358|		fi
359|	done < $tmp_regulator_microvolt_file
360|
361|	echo -e "\e[41;1;30m PLEASE CHECK BOARD GPIO POWER DOMAIN CONFIGURATION !!!!!\e[0m"
362|	echo -e "\e[41;1;30m <<< ESPECIALLY Wi-Fi/Flash/Ethernet IO power domain >>> !!!!!\e[0m"
363|	echo -e "\e[41;1;30m Check Node [pmu_io_domains] in the file: ${dts}.dts \e[0m"
364|	echo
365|	echo -e "\e[41;1;30m 请再次确认板级的电源域配置！！！！！！\e[0m"
366|	echo -e "\e[41;1;30m <<< 特别是Wi-Fi，FLASH，以太网这几路IO电源的配置 >>> ！！！！！\e[0m"
367|	echo -e "\e[41;1;30m 检查内核文件 ${dts}.dts 的节点 [pmu_io_domains] \e[0m"
368|	cat $tmp_final_target
369|
370|	rm -f $tmp_phandle_file
371|	rm -f $tmp_regulator_microvolt_file
372|	rm -f $tmp_io_domain_file
373|	rm -f $tmp_final_target
374|	rm -f $dump_kernel_dtb_file
375|}
376|
377|# 设置交叉编译工具链和相关参数
378|setup_cross_compile()
379|{
380|	if [ "$RK_CHIP" = "rv1126_rv1109" ]; then
381|		TOOLCHAIN_OS=rockchip
382|	else
383|		TOOLCHAIN_OS=none
384|	fi
385|
386|	# 将 RK_KERNEL_ARCH 中的 arm64 替换为 aarch64
387|	TOOLCHAIN_ARCH=${RK_KERNEL_ARCH/arm64/aarch64}
388|
389|	# 查找匹配的 GCC 工具链路径
390|	TOOLCHAIN_DIR="$(realpath prebuilts/gcc/*/$TOOLCHAIN_ARCH/gcc-arm-*)"
391|	GCC="$(find "$TOOLCHAIN_DIR" -name "*$TOOLCHAIN_OS*-gcc")"
392|
393|	# 检查是否存在可执行的 GCC 工具链
394|	if [ ! -x "$GCC" ]; then
395|		echo "No prebuilt GCC toolchain!"
396|		return 1
397|	fi
398|
399|	# 设置交叉编译前缀
400|	export CROSS_COMPILE="${GCC%gcc}"
401|	echo "Using prebuilt GCC toolchain: $CROSS_COMPILE"
402|
403|	# 获取可用的处理器核心数量
404|	NUM_CPUS=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 1)
405|
406|	# 设置并发编译任务数，默认为处理器核心数量加一
407|	JLEVEL=${RK_JOBS:-$(( $NUM_CPUS + 1 ))}
408|
409|	# 定义内核编译命令
410|	KMAKE="make -C kernel/ ARCH=$RK_KERNEL_ARCH -j$JLEVEL"
411|}
412|
413|# 构建 UEFI
414|build_uefi()
415|{
416|	# 设置交叉编译工具链和相关参数
417|	setup_cross_compile
418|
419|	# 根据 RK_KERNEL_ARCH 的值确定 dtb 文件路径
420|	if [ "$RK_KERNEL_ARCH" == "arm" ]; then
421|		dtb="kernel/arch/arm/boot/dts/${RK_KERNEL_DTS}.dtb"
422|	else
423|		dtb="kernel/arch/arm64/boot/dts/rockchip/${RK_KERNEL_DTS}.dtb"
424|	fi
425|
426|	echo "============Start building uefi============"
427|	echo "Copy kernel dtb $dtb to uefi/edk2-platforms/Platform/Rockchip/DeviceTree/rk3588.dtb"
428|	echo "========================================="
429|
430|	# 检查 dtb 文件是否存在
431|	if [ ! -f $dtb ]; then
432|		echo "Please compile the kernel before"
433|		return -1
434|	fi
435|
436|	# 将 dtb 文件复制到 uefi 目录
437|	cp $dtb uefi/edk2-platforms/Platform/Rockchip/DeviceTree/rk3588.dtb
438|
439|	# 进入 uefi 目录并执行构建脚本
440|	cd uefi
441|	./make.sh $RK_UBOOT_DEFCONFIG
442|
443|	# 完成构建流程
444|	finish_build
445|}
446|
447|# 构建 U-Boot
448|build_uboot()
449|{
450|	# 检查 RK_UBOOT_DEFCONFIG 配置是否存在，若不存在则返回
451|	check_config RK_UBOOT_DEFCONFIG || return 0
452|
453|	# 设置交叉编译工具链和相关参数
454|	setup_cross_compile
455|
456|	# 准备 U-Boot 构建所需的文件
457|	prebuild_uboot
458|	prebuild_security_uboot $@
459|
460|	echo "============Start building uboot============"
461|	echo "TARGET_UBOOT_CONFIG=$RK_UBOOT_DEFCONFIG"
462|	echo "========================================="
463|
464|	# 进入 u-boot 目录并删除旧的 *_loader_*.bin 文件
465|	cd u-boot
466|	rm -f *_loader_*.bin
467|
468|	# 构建 U-Boot
469|	if [ -n "$RK_UBOOT_DEFCONFIG_FRAGMENT" ]; then
470|		if [ -f "configs/${RK_UBOOT_DEFCONFIG}_defconfig" ]; then
471|			UBOOT_CONFIGS="${RK_UBOOT_DEFCONFIG}_defconfig"
472|		else
473|			UBOOT_CONFIGS="${RK_UBOOT_DEFCONFIG}.config"
474|		fi
475|		UBOOT_CONFIGS="$UBOOT_CONFIGS $RK_UBOOT_DEFCONFIG_FRAGMENT"
476|	else
477|		UBOOT_CONFIGS="$RK_UBOOT_DEFCONFIG"
478|	fi
479|	./make.sh $UBOOT_CONFIGS $UBOOT_COMPILE_COMMANDS \
480|		CROSS_COMPILE=$CROSS_COMPILE
481|
482|	# 如果需要更新 RK_IDBLOCK_SPL，则执行带有 --idblock 和 --spl 参数的 make.sh
483|	if [ "$RK_IDBLOCK_UPDATE_SPL" = "true" ]; then
484|		./make.sh --idblock --spl
485|	fi
486|
487|	cd ..
488|
489|	# 如果需要进行 RAMDISK 安全启动，则创建链接到 rockdev 目录的 boot.img 和 recovery.img
490|	if [ "$RK_RAMDISK_SECURITY_BOOTUP" = "true" ];then
491|		ln -rsf u-boot/boot.img rockdev/
492|		test -z "${RK_PACKAGE_FILE_AB}" && \
493|			ln -rsf u-boot/recovery.img rockdev/ || true
494|	fi
495|
496|	# 创建链接到 rockdev 目录的 MiniLoaderAll.bin、uboot.img 和 trust.img（如果存在）
497|	LOADER="$(echo u-boot/*_loader_*v*.bin | head -1)"
498|	SPL="$(echo u-boot/*_loader_spl.bin | head -1)"
499|	ln -rsf "${LOADER:-$SPL}" rockdev/MiniLoaderAll.bin
500|	ln -rsf u-boot/uboot.img rockdev/
501|