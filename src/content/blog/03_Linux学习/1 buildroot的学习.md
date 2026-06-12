---
title: buildroot的学习
date: 2023-10-16 21:55:17
categories:
  - Linux学习
link: 03_Linux学习/1 buildroot的学习
---

buildroot官网地址：https://buildroot.org/

github链接：https://github.com/buildroot/buildroot

两个指导文档

![image-20231016222739549](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310162227581.png)

![image-20231016222749732](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310162227750.png)



# 1.拉取buildroot



拉取下载buildroot

~~~shell
git clone https://github.com/buildroot/buildroot
~~~



![image-20231017075747677](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170757701.png)

建议以普通用户来进行操作，buildroot管饭极力推荐普通用户



# 2.help帮助菜单

所有的交互都是通过在主构建根源目录中调用make来实现的，可以通过make help来获取帮助，具体内容如下所示：

**清理：**
	clean - 删除构建生成的所有文件
	distclean - 删除所有非源代码文件（包括.config文件）

**构建：**
	all - 构建整个系统
	toolchain - 构建工具链
	sdk - 构建可移植的SDK

**配置：**
	menuconfig - 交互式基于curses的配置工具
	nconfig - 交互式基于ncurses的配置工具
	xconfig - 交互式基于Qt的配置工具
	gconfig - 交互式基于GTK的配置工具
	oldconfig - 解决.config文件中的未解决符号
	syncconfig - 与oldconfig相同，但静默执行，并更新依赖关系
	olddefconfig - 与syncconfig相同，但将新符号设置为默认值
	randconfig - 随机回答所有选项的新配置
	**defconfig - 所有选项都使用默认答案的新配置；如果在命令行上设置了BR2_DEFCONFIG，则使用其作为输入**
	**savedefconfig - 将当前配置保存到BR2_DEFCONFIG（最小配置）**

​		上面的这两个应该是在配置里面最有用的那一个，默认情况下这个BR2_DEFCONFIG并不会被设置，所以只能是配置完成之后，第一次是一定要设置的。特殊记忆一下。

​	update-defconfig - 与savedefconfig相同
​	allyesconfig - 所有选项都接受yes答案的新配置
​	allnoconfig - 所有选项都使用no答案的新配置
​	alldefconfig - 所有选项都设置为默认值的新配置
​	randpackageconfig - 随机回答包选项的新配置
​	allyespackageconfig - 所有包选项都接受yes答案的新配置
​	allnopackageconfig - 所有包选项都使用no答案的新配置

**针对特定软件包：**
	<pkg> - 构建并安装<pkg>及其所有依赖项
	<pkg>-source - 仅下载<pkg>的源代码文件

~~~
make opencv4-source
~~~

![image-20231017081853414](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170818453.png)

​	<pkg>-extract - 提取<pkg>的源代码

~~~
make opencv4-extract
~~~

![image-20231017081936374](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170819393.png)

​	<pkg>-patch - 对<pkg>应用补丁

~~~
make opencv4-patch
~~~

![image-20231017082105272](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170821298.png)	<pkg>-depends - 构建<pkg>的依赖项

~~~
make opencv4-depends
~~~

![image-20231017082141682](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170821715.png)

​	<pkg>-configure - 构建<pkg>到配置阶段

~~~
make opencv4-configure
~~~

![image-20231017083044583](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170830641.png)

​	<pkg>-build - 构建<pkg>到编译阶段

~~~
make opencv4-build
~~~

![image-20231017083149028](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310170831059.png)

​	<pkg>-show-info - 生成关于<pkg>的信息，以JSON格式呈现
​	<pkg>-show-depends - 列出<pkg>依赖的软件包
​	<pkg>-show-rdepends - 列出以<pkg>为依赖的软件包
​	<pkg>-show-recursive-depends 递归列出<pkg>依赖的软件包
​	<pkg>-show-recursive-rdepends  递归列出以<pkg>为依赖的软件包
​	<pkg>-graph-depends - 生成<pkg>依赖关系的图形
​	<pkg>-graph-rdepends - 生成<pkg>反向依赖关系的图形
​	<pkg>-dirclean - 删除<pkg>的构建目录
​	<pkg>-reconfigure - 从配置阶段重新开始构建
​	<pkg>-rebuild - 从编译阶段重新开始构建
​	<pkg>-reinstall - 从安装阶段重新开始构建



**文档：**
	manual - 构建所有格式的手册
	manual-html - 构建HTML格式的手册
	manual-split-html - 构建拆分的HTML格式的手册
	manual-pdf - 构建PDF格式的手册
	manual-text - 构建文本格式的手册
	manual-epub - 构建ePub格式的手册
	graph-build - 生成构建时间的图表
	graph-depends - 生成依赖树的图表
	graph-size - 生成文件系统大小的统计信息
	list-defconfigs - 列出所有预配置的最小系统

**杂项：**
source - 下载离线构建所需的所有源代码
external-deps - 列出使用的外部软件包
legal-info - 生成有关许可证合规性的信息
show-info - 生成关于软件包的信息，以JSON格式呈现
pkg-stats - 以JSON和HTML格式生成有关软件包的信息
printvars - 导出通过VARS=...选择的内部变量
show-vars - 以JSON格式呈现所有内部变量；使用VARS=...限制列表以匹配该模式

make V=0|1 - 0 => 静默构建（默认），1 => 详细构建
make O=dir - 将所有输出文件定位在"dir"中，包括.config文件

有关更多详细信息，请参阅README，生成Buildroot手册或在线查阅它，网址为http://buildroot.org/docs.html