---
title: 如何构建deb包
date: 2023-10-19 20:47:53
categories:
  - 瑞芯微
link: 02_瑞芯微/05 构建deb包.md
---

# 1.三个核心概念

三个最核心的概念为：

- 上游原始代码包（upstream tarball）:
  - 通常，人们为上游开发者（通常为第三方）编写的软件打包。
  - 上游开发者会使用源代码归档软件或原始代码包的方式发放他们的软件。
  - 原始代码包一般是上游制作的 `.tar.gz` 或 `.tgz` 文件，它也可能被压缩成 `.tar.bz2`，`.tb2` 或 `.tar.xz` 格式。原始代码包就是 Debian 构建包时使用的原材料。
- 源码包：
  - 当您拥有了上游制作的原始代码包，下一步就可以制作 Debian 源码包了。
- 二进制包：
  - 从源码包您可以构建 Debian 二进制包，它才是是实际上会被安装的包。

最简单的源码包由3个文件组成：

- 上游原始代码包，需要被重命名来符合一个特定的模式。
- 一个 debian 目录，带有所有上游源代码的更改记录，外加所有为 Debian 打包系统生成的所有文件。这种包拥有 `.debian.tar.gz` 的文件名。
- 一个描述文件（以 `.dsc` 结尾），罗列了其他两个文件。

听起来有些过于复杂，人们的第一印象是：所有东西都放在一个文件里会更简单。然而，保持上游代码包与 Debian 特定更改分离可以节省大量磁盘空间和带宽。对 Debian 来说，追踪必要的修改也更加简单。

# 2. deb包制作流程

首先创建一个debian目录

```bash
mkdir debian
```

我们需要提供不少文件，让我们按顺序来看。

## 2.1 debian/changelog

第一个文件是 `debian/changelog`，这个是记录 Debian 包变化的日志文件。它无需罗列出上游代码的每一个改变，只要它能帮助用户总结这些变化即可。我们在制作第一个版本，所以这里应当什么都没有。然而，我们仍需制作一个变化日志的入口，因为打包工具会从日志里读取特定信息。最重要的是它会读取包的版本。

`debian/changelog` 拥有一个十分特殊的格式。最简单的创建方式就是使用 `dch` 工具。

~~~
apt install devscripts
dch --create -v 1.0-1 --package hithere
~~~

会在文件中产生以下内容：

![image-20231009205902071](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310092059083.png)

![image-20231009205839642](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310092058676.png)

这里有很多注意点：

`hithere` 部分必须与源代码包的名字相同。`1.0-1` 是版本号，`1.0` 部分是上游版本号。`-1` 部分是 Debian 的版本：它是第一个上游版本为 `1.0` 的 Debian 包。如果这个 Debian 包有错误，并且被修复了，那么上游版本号仍保持相同，下一个版本应当被叫做 `1.0-2`，接下来是 `1.0-3`，依此类推。

UNRELEASED 被称作上传目标。它会告诉上传工具这个二进制包应当被上传到哪里。UNRELEASED 意味着这个包还没有做好上传的准备。保持 UNRELEASED 是一个好主意，以避免您错误上传它。

目前请先忽略 `urgency=medium`。

`(Closes：#XXXXXX)` 作用在于上传包时关闭错误。这是在 Debian 中关闭错误的常用方法：当上传修复错误的包时，错误跟踪器会注意到这一点，并将错误标记为已关闭。我们可以删除 `(Closes...)` 位

## 2.2 debian/control

控制文件描述代码和二进制包，并给出他们的详细信息，比如名称、包的维护者是谁，等等。下面是一个示例：

~~~shell
Source: hithere
Maintainer: Lars Wirzenius <liw@liw.fi>
Section: misc
Priority: optional
Standards-Version: 3.9.2
Build-Depends: debhelper (>= 9)

Package: hithere
Architecture: any
Depends: ${shlibs:Depends}, ${misc:Depends}
Description: greet user
 hithere greets the user, or the world.
~~~

在这个文件里有许多需求的字段，但是现在您可以像对待魔法一样对待它。那么，在 `debian/control` 中有两段文字。

第一段文字描述了源代码包，使用以下字段：

### 2.2.1 Source

源代码包名。

###  2.2.2 Maintainer

维护者的姓名和电子邮箱。

### 2.2.3 Priority

包的重要性（'required 可选的', 'important 重要的', 'standard 标准' 或 'optional' 其中之一）。通常，包是“可选”的，除非它对于标准系统功能是“必不可少的”，即启动或网络功能。 如果包与另一个“可选”包冲突，或者它不打算用于标准桌面安装，则应该是“额外”的而不是“可选”的。 “额外”包的显着例子是调试包。 （由Sebastian Tennant添加）。

### 2.2.4 Build-Depends

需要安装以构建程序包的程序包列表。实际使用包时有可能需要它们。

第一个之后的所有段落都描述了从此源构建的二进制包。 可以有许多从同一来源构建的二进制包; 但对于我们的例子只有一个。 我们使用这些字段：

### 2.2.5 Package

二进制包的名称。 名称可能与源包名称不同。

### 2.2.6 Architecture

指定二进制包预期使用的计算机体系结构：用于32位Intel CPU的i386，用于64位的amd64，用于ARM处理器的armel等等。 Debian总共可以处理大约十几种计算机体系结构，因此这种体系结构支持至关重要。 “Architecture”字段可以包含特定体系结构的名称，但通常它包含两个特殊值中的一个。

any
 （我们在示例中看到）意味着可以为任何体系结构构建包。 换句话说，代码是可移植的，因此它不会对硬件做太多假设。 但是，仍然需要为每个体系结构单独构建二进制包。

all
 意味着相同的二进制包将适用于所有体系结构，而无需为每个体系结构单独构建。 例如，仅包含shell脚本的包将是“all”。 Shell脚本在任何地方都可以工作，不需要编译。

### 2.2.7 Depends

为了让二进制包中程序能够正常运行，需要安装的包列表。手动列出这些依赖项是繁琐且容易出错的工作。为了能够让其工作，我们需要一个神奇的小东西 `${shlibs:Depends}`。另一个神奇的东西是给 `debhelper` 的，它是 `${misc:Depends}`。shlibs 是为了动态链接库，而 misc 是为了 `debherlper` 的一些工作。对于别的依赖，您可以将其手动加入到 `Depends` 或 `Build-Depends` 中。但请注意，`${...}` 仅在 `Depends` 中有效。

### 2.2.8 Description

二进制包的完整描述。它希望对用户有所帮助。第一行用作简要概要（摘要）描述，其余部分是包的更长的描述。
 命令 `cme edit dpkg` 提供了一个GUI能够用来编辑大多数打包文件，包括 `debian/control`。 请参阅使用 `cme` 页面管理 `Debian` 软件包。`cme`命令在 Debian 中的 `cme` 包中提供。您也可以使用 `cme edit dpkg-control` 命令仅编辑 `debian/control` 文件。

~~~
Source: linux-rockchip-5.10.110
Section: kernel
Priority: optional
Standards-Version: 4.6.0
Build-Depends: bc, rsync, kmod, cpio, build-essential, u-boot-tools, bison, python3 | python, python-is-python3 | python-is-python2, flex | flex:native , , libssl-dev:native
~~~

## 2.3 debian/copyright

这是一个非常重要的文件，但是现在我们将先使用一个空文件。
 对于 Debian ，此文件用于跟踪有关包的合法性、版权相关信息。但是，从技术角度来看，这并不重要。目前，我们将专注于技术方面。如果有兴趣，我们可以稍后再回到 `debian/copyright`。



## 2.4 debian/rules



~~~
#!/usr/bin/make -f
%:
        dh $@
~~~

**注意： 最后一行应当使用一个 Tab 字符进行缩进，而不使用空格。这个文件是一个 Makefile，因此 Tab 字符是 make 所期望的。**

事实上 `debian/rules` 可能是一个相当复杂的文件。然而，在 `debhelper 7` 中的 `dh` 命令让它可以在大多数情况下变得更简单。

## 2.5 debian/source/format

最后一个我们需要的文件是 `debian/source/format`，它应当包含源代码包的版本号，这里为 `3.0 (quilt)`。

~~~
3.0 (quilt)
~~~

# 3.实例制作一个包

- changelog: 文件记录了deb包的作者、版本以及最后一次更新日期等信息；
- control: 文件记录了包名、版本号、架构、维护者及描述等信息；
- copyright: 文件记录了一些版权信息；
- postinst: 软件在进行正常目录文件拷贝到系统后需要执行的脚本。
- postrm文件: 软件卸载后需要执行的脚本。

这里以昨天编译的opencv静态库和动态库为例进行deb的打包

![image-20231019212535607](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192125627.png)

为了不影响两个包，我这里就单独创建一个deb目录了，然后拷贝动态opencv库，拷贝完成如下所示：

![image-20231019212906221](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192129240.png)

然后创建DEBIAN目录，在DEBIAN目录下创建三个文件，命令如下所示：

~~~
mkdir DEBIAN 

touch DEBIAN/control
~~~

但是我感觉我可以不用这些~~，我能安装上就行了，为啥还要有这些说明呢，现在还不需要呢，就先这样.

但是control这个是必须要添加的,向DEBIAN/control文件中写入以下内容

~~~
Package: opencv-deb
Version: 1.0.0
Section: free
Priority: optional
Essential: no
Architecture: arm64
Maintainer: topeet <topeet@topeet>
Provides: opencv_deb
Description: opencv 4.8.0
~~~

然后使用以下命令构建deb包：

~~~
dpkg-deb -b ../deb ../opencv_4_8.0_arm64.deb
~~~

![image-20231019213754765](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192137781.png)

在上一级的目录下就创建了该目录

![image-20231019213855976](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192138990.png)

可以使用以下命令查看deb包的内容

~~~
dpkg -c opencv_4_8.0_arm64.deb
~~~

![image-20231019214105760](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192141793.png)

使用以下命令查看deb包的信息：
~~~
dpkg --info  opencv_4_8.0_arm64.deb
~~~

可以看到该包的信息就被打印了出来，也就是我们在上面填写的DEBIAN/control的内容

![image-20231019214247209](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192142227.png)

我现在这个包是arm64架构的，但是我想在虚拟机ubuntu上用，那我要怎么办呢，实际上是可以强制安装的，在-i参数前面加入一个--force-depends 参数：
~~~
dpkg --force-depends -i opencv_4_8.0_arm64.deb
~~~

然鹅发现还是不行，看来这个架构问题是永远改不了的呀，伤心了

还是解包吧

~~~
dpkg --unpack opencv_4_8.0_arm64.deb
~~~

因为体系不行解包都不行，因为这个也类似于安装

只是解压应该用这个命令

~~~
dpkg -x  opencv_4_8.0_arm64.deb opencv
~~~

![image-20231019215145390](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202310192151417.png)

这就好了，搞到这个地方应该就可以了，我认为。ok，那就先这样。
