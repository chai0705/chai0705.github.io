---
title: uboot启动流程
date: 2024-01-01 00:00:00
categories:
  - 瑞芯微开发
link: 瑞芯微开发/12_uboot启动流程
---

1|1|---
2|2|description: "​ uboot可以说就是一个裸机程序，是由一系列程序链接起来的，链接脚本为根目录下的u-boot.lds !image-20240704204240610https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042042636.png"
3|3|cover: /img/cover/11.webp
4|4|
5|5|title: uboot启动流程
6|6|date: 2024-07-04 16:17:03
7|7|categories:
8|8|  - 瑞芯微开发
9|9|link: 瑞芯微开发/12_uboot启动流程
10|10|---
11|11|
12|12|​	uboot可以说就是一个裸机程序，是由一系列程序链接起来的，链接脚本为根目录下的u-boot.lds
13|13|
14|14|![image-20240704204240610](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042042636.png)
15|15|
16|16| *(.__image_copy_start) 先不用管，零长度数组。
17|17|
18|18|然后是 arch/arm/cpu/armv8/start.o (.text*)
19|19|
20|20|首次执行的是reset，具体内容如下所示：
21|21|![image-20240704205658534](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042056573.png)
22|22|
23|23|​	而reset的内容如下所示：
24|24|~~~asm
25|25|	/* Allow the board to save important registers */
26|26|	b	save_boot_params
27|27|.globl	save_boot_params_ret
28|28|~~~
29|29|
30|30|反正最后是跳到了arch/arm/lib/crt0.S，在该汇编文件中构建了C语言的临时运行环境，然后运行了board_init_f_ C语言函数。
31|31|
32|32|该函数在common/board_r.c文件中，具体内容如下所示：
33|33|~~~c
34|34|void board_init_r(gd_t *new_gd, ulong dest_addr)
35|35|{
36|36|	/*
37|37|	 * Set up the new global data pointer. So far only x86 does this
38|38|	 * here.
39|39|	 * TODO(sjg@chromium.org): Consider doing this for all archs, or
40|40|	 * dropping the new_gd parameter.
41|41|	 */
42|42|#if CONFIG_IS_ENABLED(X86_64)
43|43|	arch_setup_gd(new_gd);
44|44|#endif
45|45|
46|46|#ifdef CONFIG_NEEDS_MANUAL_RELOC
47|47|	int i;
48|48|#endif
49|49|
50|50|#if !defined(CONFIG_X86) && !defined(CONFIG_ARM) && !defined(CONFIG_ARM64)
51|51|	gd = new_gd;
52|52|#endif
53|53|	gd->flags &= ~GD_FLG_LOG_READY;
54|54|
55|55|#ifdef CONFIG_NEEDS_MANUAL_RELOC
56|56|	for (i = 0; i < ARRAY_SIZE(init_sequence_r); i++)
57|57|		init_sequence_r[i] += gd->reloc_off;
58|58|#endif
59|59|
60|60|	if (initcall_run_list(init_sequence_r))
61|61|		hang();
62|62|
63|63|	/* NOTREACHED - run_main_loop() does not return */
64|64|	hang();
65|65|}
66|66|~~~
67|67|
68|68|​	其中init_sequence_r是一个数组，有各种初始化操作，具体如下所示：
69|69|
70|70|![image-20240704212609374](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042126409.png)
71|71|
72|72|然后继续根据瑞芯微的来即可：
73|73|
74|74|![image-20240704221021869](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042210930.png)