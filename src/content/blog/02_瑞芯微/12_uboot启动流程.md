---
title: uboot启动流程
date: 2024-07-04 16:17:03
categories:
  - 瑞芯微
link: 02_瑞芯微/12_uboot启动流程
---

​	uboot可以说就是一个裸机程序，是由一系列程序链接起来的，链接脚本为根目录下的u-boot.lds

![image-20240704204240610](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042042636.png)

 *(.__image_copy_start) 先不用管，零长度数组。

然后是 arch/arm/cpu/armv8/start.o (.text*)

首次执行的是reset，具体内容如下所示：
![image-20240704205658534](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042056573.png)

​	而reset的内容如下所示：
~~~asm
	/* Allow the board to save important registers */
	b	save_boot_params
.globl	save_boot_params_ret
~~~

反正最后是跳到了arch/arm/lib/crt0.S，在该汇编文件中构建了C语言的临时运行环境，然后运行了board_init_f_ C语言函数。

该函数在common/board_r.c文件中，具体内容如下所示：
~~~c
void board_init_r(gd_t *new_gd, ulong dest_addr)
{
	/*
	 * Set up the new global data pointer. So far only x86 does this
	 * here.
	 * TODO(sjg@chromium.org): Consider doing this for all archs, or
	 * dropping the new_gd parameter.
	 */
#if CONFIG_IS_ENABLED(X86_64)
	arch_setup_gd(new_gd);
#endif

#ifdef CONFIG_NEEDS_MANUAL_RELOC
	int i;
#endif

#if !defined(CONFIG_X86) && !defined(CONFIG_ARM) && !defined(CONFIG_ARM64)
	gd = new_gd;
#endif
	gd->flags &= ~GD_FLG_LOG_READY;

#ifdef CONFIG_NEEDS_MANUAL_RELOC
	for (i = 0; i < ARRAY_SIZE(init_sequence_r); i++)
		init_sequence_r[i] += gd->reloc_off;
#endif

	if (initcall_run_list(init_sequence_r))
		hang();

	/* NOTREACHED - run_main_loop() does not return */
	hang();
}
~~~

​	其中init_sequence_r是一个数组，有各种初始化操作，具体如下所示：

![image-20240704212609374](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042126409.png)

然后继续根据瑞芯微的来即可：

![image-20240704221021869](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407042210930.png)
