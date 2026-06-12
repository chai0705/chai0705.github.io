---
title: rkdeb包的制作
date: 2023-11-14 19:55:17
categories:
  - 瑞芯微开发
link: 02_瑞芯微/02 rk deb包的制作
---

先说一下前情提要：
	最近这一个月一直在制作debian和ubuntu文件系统，rk官方默认情况下只是构建了debian，好像是因为版权问题，然而呢，我肯定是要构建ubuntu镜像的，而我要做的，就是根据rk提供的debian系统的构建方法，来进行ubuntu的构建。

​	最大的问题出现在deb包的构建,也就是下面这些deb包：
![image-20231113205017093](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132050152.png)

很多很多的包，根本不知道从哪里来的~~，而现在呢大约知道了，首先呢先来分析一下各个dockerfile文件。

几个很重要的github链接：

**docker环境的大佬链接**

~~~
https://github.com/Caesar-github
~~~

![image-20231113205704425](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132057450.png)

各种库的大佬链接：

~~~
https://github.com/JeffyCN?tab=repositories
~~~

![image-20231113205817179](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132058219.png)



香橙派的仓库链接

~~~
https://github.com/orangepi-xunlong/rk-rootfs-build
~~~

![image-20231113220515527](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132205565.png)

# 1 dockerfile 文件

## 1.1 debian10

~~~dockerfile
FROM debian:buster
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 设置多架构环境
RUN dpkg --add-architecture arm64

# 设置 apt 配置以跳过 SSL 验证
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加源列表
ADD sources.list /etc/apt/

# 更新并安装交叉编译所需的基本软件包
RUN apt-get update && apt-get install -y crossbuild-essential-arm64 apt-transport-https

# 添加 overlay 目录
ADD ./overlay/  /

# 安装构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf

# 安装 arm64 架构下 libdrm 的构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm

# 安装 arm64 架构下 xorg-server 的构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

# 安装 arm64 架构下的 gstreamer 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装 libdrm-dev:arm64
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装 gstreamer-rockchip 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装 libmali 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装 drm-cursor 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装 glmark2 相关软件包
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装 rktoolkit 相关软件包
#RUN apt install -y libmad-ocaml-dev libmad0-dev:arm64

# 安装 lib4l2 相关软件包
#RUN apt update -y
#RUN apt build-dep -y libv4l-dev:arm64

# 安装 blueman 的构建依赖项
RUN apt-get build-dep -y blueman

# 生成 en_US.UTF-8 本地化设置
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=non交互式 locales && \
    update-locale LANG=en_US.UTF-8

RUN echo "Update Headers!"
RUN dpkg -i /packages/arm64/rga/*.deb
RUN dpkg -i /packages/arm64/mpp/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gstreamer/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-bad1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-good1.0/*.deb

RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb
#RUN dpkg -i /packages/arm64/gst-rkmpp/*.deb
#RUN dpkg -i /packages/arm64/ffmpeg/*.deb
#RUN dpkg -i /packages/arm64/libmali/libmali-midgard-t86x-r18p0-x11*.deb
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

RUN echo "deb https://mirrors.ustc.edu.cn/debian/ bullseye main contrib non-free" >> /etc/apt/sources.list
RUN apt update
RUN apt install -y meson=0.56.2-1

RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'rk user' -m -d /home/rk -s /bin/bash rk
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo rk

USER rk
~~~



## 1.2 debian11

~~~dockerfile
FROM debian:bookworm
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 设置多架构环境
RUN dpkg --add-architecture arm64
#RUN echo "deb-src http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list
#RUN echo "deb-src http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list
#RUN echo "deb-src http://security.debian.org bullseye/updates main" >> /etc/apt/sources.list

# 运行apt-get update并安装ca-certificates
#RUN apt-get update && apt-get install -y ca-certificates
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加sources.list文件到/etc/apt/目录
ADD sources.list /etc/apt/
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 添加overlay目录到根目录
ADD ./overlay/  /

# 安装构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装rga所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装gstreamer-rockchip所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libmali所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装drm-cursor所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装glmark2所需的依赖项
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装rktoolkit所需的依赖项
#RUN apt install -y libmad-ocaml-dev libmad0-dev:arm64

# 安装lib4l2所需的依赖项
#RUN apt update -y
#RUN apt build-dep -y libv4l-dev:arm64

# 生成en_US.UTF-8本地化
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

RUN echo "Update Headers!"
RUN dpkg -i /packages/arm64/rga/*.deb
RUN dpkg -i /packages/arm64/mpp/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gstreamer/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-bad1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-good1.0/*.deb

#RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb
#RUN dpkg -i /packages/arm64/gst-rkmpp/*.deb
#RUN dpkg -i /packages/arm64/ffmpeg/*.deb
#RUN dpkg -i /packages/arm64/libmali/libmali-midgard-t86x-r18p0-x11*.deb
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

RUN apt-get update && apt-get install -y -f

# 切换到非root用户
RUN useradd -c 'rk user' -m -d /home/rk -s /bin/bash rk
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo rk

USER rk
~~~



## 1.3 debian12

~~~dockerfile
# 使用Debian bookworm作为基础镜像
FROM debian:bookworm

# 设置镜像的维护者信息
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 添加arm64架构支持
RUN dpkg --add-architecture arm64

# 配置apt，禁用HTTPS的证书验证
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加自定义的sources.list文件到容器的/etc/apt/目录
ADD sources.list /etc/apt/

# 更新apt源并安装crossbuild-essential-arm64软件包
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 将当前目录下的overlay目录添加到镜像的根目录
ADD ./overlay/  /

# 安装构建过程中需要的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt install -fy sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec device-tree-compiler:arm64 bc:arm64 cpio:arm64 parted dosfstools:arm64 mtools:arm64 libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev:arm64 meson:arm64 debhelper:arm64 pkgconf:arm64

# 安装构建libdrm库所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm

# 安装构建xorg-server所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

# 安装GStreamer相关的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装libdrm-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装libx11-dev、libdrm-dev、libgstreamer1.0-dev、libgstreamer-plugins-base1.0-dev等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 libgstreamer-plugins-base1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libstdc++6、libgbm-dev、libdrm-dev、libx11-xcb1、libxcb-dri2-0、libxdamage1、libxext6、libwayland-client0等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装libgbm-dev、libegl1-mesa-dev、libgles2-mesa-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装debhelper-compat、libjpeg-dev、libpng-dev、libudev-dev、libxcb1-dev、python3、wayland-protocols、libwayland-dev、libwayland-bin等依赖包
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装构建weston所需的依赖包
RUN apt-get update && apt build-dep -y weston:arm64

# 生成并设置系统的locale为en_US.UTF-8
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# 修改locale.gen文件并重新配置locales，更新locale设置
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

# 打印日志信息
RUN echo "Update Headers!"

# 安装rga2软件包
RUN dpkg -i /packages/arm64/rga2/*.deb

# 安装mpp软件包
RUN dpkg -i /packages/arm64/mpp/*.deb

# 安装gst-rkmpp软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb

# 安装gst-plugins-base1.0软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb

# 安装libv4l软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb

# 解压libdrm软件包
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

# 更新apt源并安装依赖包
RUN apt-get update && apt-get install -y -f

# 创建名为rk的用户
RUN useradd -c 'rk user' -m -d /home/rk -s /bin/bash rk

# 修改sudoers文件，允许rk用户使用sudo命令无需密码验证
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers

# 将rk用户添加到sudo用户组中
RUN usermod -a -G sudo rk

# 切换到rk用户
USER rk

~~~

# 2.问题探究

默认情况下是不可以下载软件源码的，当取消一些特定的注释之后，是可以使用apt-get source命令进行软件包源码的下载的，

~~~shell
apt-get source xorg-server
~~~

![image-20231113211818133](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132118169.png)

最后一句话忽略即可

![image-20231113211831167](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132118188.png)

- `xorg-server-1.20.13`：这是一个目录，其中包含了`xorg-server`软件包的源代码文件和其他相关文件。
- `xorg-server_1.20.13-1ubuntu1~20.04.9.diff.gz`：这是一个压缩文件，其中包含了对源代码进行修改的补丁文件（diff文件）。
- `xorg-server_1.20.13-1ubuntu1~20.04.9.dsc`：这是一个文本文件，其中包含了软件包的元数据信息，例如软件包的名称、版本号、维护者等。
- `xorg-server_1.20.13.orig.tar.gz`：这是一个压缩文件，其中包含了软件包的原始源代码文件，即未经过任何修改的原始文件。
- `xorg-server_1.20.13.orig.tar.gz.asc`：这是一个数字签名文件，用于验证软件包的完整性和真实性。

由于我是虚拟机上进行测试的所以我应该安装电脑amd64的，这里先安装构建xorg-server的软件包，下面需要注意的是build-dep这个参数：
~~~shell
DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a amd64 xorg-server
~~~

![image-20231113212511030](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132125078.png)

然后使用以下命令构建deb包

~~~shell
DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -rfakeroot -b -d -uc -us -aamd64
~~~

- `DEB_BUILD_OPTIONS=nocheck`：这个选项设置构建过程中不运行自动化的测试。
- `dpkg-buildpackage`：这个命令用于构建 Debian 软件包。
- `-rfakeroot`：这个选项在构建过程中模拟 root 权限，以便可以在非特权用户下进行构建。
- `-b`：这个选项告诉 `dpkg-buildpackage` 构建二进制软件包（即生成 .deb 文件）。
- `-d`：这个选项告诉 `dpkg-buildpackage` 忽略构建依赖关系，即不检查构建依赖关系是否满足。
- `-uc`：这个选项告诉 `dpkg-buildpackage` 不使用软件包的维护者密钥进行签名。
- `-us`：这个选项告诉 `dpkg-buildpackage` 不生成源码软件包（即不生成 .dsc 文件）。
- `-aamd64`：这个选项指定了目标架构为 amd64，即构建适用于 amd64 架构的软件包。

![image-20231113212628562](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132126611.png)

构建完成之后如下图所示：
![image-20231113213003305](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132130327.png)

根据提供的软件包列表，可以将它们分为以下几类：

1. **xorg-server 相关**：
   - `xorg-server-source_1.20.13-1ubuntu1~20.04.9_all.deb`：xorg-server 的源代码包。
   - `xorg-server_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xorg-server 的二进制软件包。
   - `xorg-server-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xorg-server 的调试符号包。
2. **xserver-xorg-core 相关**：
   - `xserver-xorg-core_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xserver-xorg-core 的二进制软件包。
   - `xserver-xorg-core-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xserver-xorg-core 的调试符号包。
   - `xserver-xorg-core-udeb_1.20.13-1ubuntu1~20.04.9_amd64.udeb`：xserver-xorg-core 的用于 Debian 安装程序的最小化二进制软件包。
3. **xserver-xephyr 相关**：
   - `xserver-xephyr_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xserver-xephyr 的二进制软件包。
   - `xserver-xephyr-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xserver-xephyr 的调试符号包。
4. **xserver-xorg-legacy 相关**：
   - `xserver-xorg-legacy_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xserver-xorg-legacy 的二进制软件包。
   - `xserver-xorg-legacy-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xserver-xorg-legacy 的调试符号包。
5. **其他组件**：
   - `xdmx_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xdmx 的二进制软件包。
   - `xdmx-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xdmx 的调试符号包。
   - `xdmx-tools_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xdmx-tools 的二进制软件包。
   - `xdmx-tools-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xdmx-tools 的调试符号包。
   - `xnest_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xnest 的二进制软件包。
   - `xnest-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xnest 的调试符号包。
   - `xwayland_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xwayland 的二进制软件包。
   - `xwayland-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xwayland 的调试符号包。
   - `xserver-common_1.20.13-1ubuntu1~20.04.9_all.deb`：xserver 的公共文件包。
   - `xserver-xorg-dev_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xserver-xorg-dev 的二进制软件包。
   - `xvfb_1.20.13-1ubuntu1~20.04.9_amd64.deb`：xvfb 的二进制软件包。
   - `xvfb-dbgsym_1.20.13-1ubuntu1~20.04.9_amd64.ddeb`：xvfb 的调试符号包。



==为什么会有deb udeb ddeb呢有什么区别？==

在 Debian 系统中，软件包文件的扩展名可以有不同的形式，如 .deb、.udeb 和 .ddeb。这些扩展名代表了不同类型的软件包。

1. **.deb**：.deb 是最常见的 Debian 软件包扩展名，用于二进制软件包。这些软件包包含已经编译好的二进制文件，可以直接安装和使用。通常用于常规的应用程序、库和工具等。
2. **.udeb**：.udeb 是用于 Debian 安装程序的特殊类型的软件包扩展名，它表示微型二进制软件包（microdeb）。这些软件包通常非常小，并包含了在系统安装过程中所需的最小化组件。.udeb 文件主要用于 Debian 安装程序（如 Debian Installer）期间的系统安装和配置，它们通常包含一些核心组件和驱动程序。
3. **.ddeb**：.ddeb 是调试符号软件包的扩展名。调试符号包包含了编译后的二进制文件与调试信息的映射关系，它们用于在调试软件时进行符号解析和调试。通过将调试符号包与相应的二进制软件包结合使用，开发人员可以在调试过程中获取更详细和有用的调试信息。.ddeb 文件通常用于开发和调试目的。

也就是说这些才是最重要的：
![image-20231113213434571](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132134590.png)

那么现在我上面的那些docker镜像终于有作用了。

然后拉取大佬的xserver源码，拉取完成如下所示：
~~~shell
git clone https://github.com/JeffyCN/xorg-xserver.git
~~~



![image-20231113221319299](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132213321.png)

然后切换分支到1.20.4

~~~
git chechout remotes/origin/rockchip/debian/1.20.4
~~~

![image-20231113221707543](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132217566.png)

然后查看一下分支：
![image-20231113221726438](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132217464.png)

最后使用docker加载一下该源码

~~~shell
docker run --privileged -it -v /home/topeet/Linux/xorg-xserver:/home/topeet/xorg-xserver debian10
~~~

![image-20231113222045776](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132220805.png)

然后使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -rfakeroot -b -d -uc -us -aarm64
~~~

==我还以为这是aarch64，我说咋一直不对~~~==，构建完成如下图所示：

![image-20231113222638562](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132226598.png)

然后开始在上一节目录下生成了对应的deb包：
![image-20231113222742691](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311132227725.png)

# 1.debian10 dockerfile

~~~dockerfile
FROM debian:buster
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 设置多架构环境
RUN dpkg --add-architecture arm64

# 设置 apt 配置以跳过 SSL 验证
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加源列表
ADD sources.list /etc/apt/

# 更新并安装交叉编译所需的基本软件包
RUN apt-get update && apt-get install -y crossbuild-essential-arm64 apt-transport-https

# 添加 overlay 目录
ADD ./overlay/  /

# 安装构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf

# 安装 arm64 架构下 libdrm 的构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm

# 安装 arm64 架构下 xorg-server 的构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

# 安装 arm64 架构下的 gstreamer 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装 libdrm-dev:arm64
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装 gstreamer-rockchip 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装 libmali 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装 drm-cursor 相关软件包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装 glmark2 相关软件包
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装 rktoolkit 相关软件包
#RUN apt install -y libmad-ocaml-dev libmad0-dev:arm64

# 安装 lib4l2 相关软件包
#RUN apt update -y
#RUN apt build-dep -y libv4l-dev:arm64

# 安装 blueman 的构建依赖项
RUN apt-get build-dep -y blueman

# 生成 en_US.UTF-8 本地化设置
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=non交互式 locales && \
    update-locale LANG=en_US.UTF-8

RUN echo "Update Headers!"
RUN dpkg -i /packages/arm64/rga/*.deb
RUN dpkg -i /packages/arm64/mpp/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gstreamer/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-bad1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-good1.0/*.deb

RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb
#RUN dpkg -i /packages/arm64/gst-rkmpp/*.deb
#RUN dpkg -i /packages/arm64/ffmpeg/*.deb
#RUN dpkg -i /packages/arm64/libmali/libmali-midgard-t86x-r18p0-x11*.deb
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

RUN echo "deb https://mirrors.ustc.edu.cn/debian/ bullseye main contrib non-free" >> /etc/apt/sources.list
RUN apt update
RUN apt install -y meson=0.56.2-1

RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'topeet user' -m -d /home/topeet -s /bin/bash topeet
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo topeet

USER topeet
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~

然后运行以下命令进行镜像的构建，之前都构建了一次了所以这次应该挺快的

~~~
docker build -t debian10 .
~~~

![image-20231114101013852](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043237.png)

发现问题，源不太对了，所以这里先改一下源，好像不改也可以，是我自己的电脑问题，重启就好了

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

![image-20231114102245237](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043278.png)

构建完成如上所示，然后打包该镜像

~~~
docker save -o debian10.tar.gz debian10
~~~

![image-20231114102532308](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043250.png)

最后整体打包一下：

~~~shell
tar -zcvf docker-rockchip-debian-buster.tar.gz docker-rockchip-debian-buster/
~~~



# 2.debian11 dockerfile

~~~dockerfile
FROM debian:bookworm
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 设置多架构环境
RUN dpkg --add-architecture arm64
#RUN echo "deb-src http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list
#RUN echo "deb-src http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list
#RUN echo "deb-src http://security.debian.org bullseye/updates main" >> /etc/apt/sources.list

# 运行apt-get update并安装ca-certificates
#RUN apt-get update && apt-get install -y ca-certificates
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加sources.list文件到/etc/apt/目录
ADD sources.list /etc/apt/
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 添加overlay目录到根目录
ADD ./overlay/  /

# 安装构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装rga所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装gstreamer-rockchip所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libmali所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装drm-cursor所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装glmark2所需的依赖项
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装rktoolkit所需的依赖项
#RUN apt install -y libmad-ocaml-dev libmad0-dev:arm64

# 安装lib4l2所需的依赖项
#RUN apt update -y
#RUN apt build-dep -y libv4l-dev:arm64

# 生成en_US.UTF-8本地化
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

RUN echo "Update Headers!"
RUN dpkg -i /packages/arm64/rga/*.deb
RUN dpkg -i /packages/arm64/mpp/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gstreamer/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-bad1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-good1.0/*.deb

#RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb
#RUN dpkg -i /packages/arm64/gst-rkmpp/*.deb
#RUN dpkg -i /packages/arm64/ffmpeg/*.deb
#RUN dpkg -i /packages/arm64/libmali/libmali-midgard-t86x-r18p0-x11*.deb
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'topeet user' -m -d /home/topeet -s /bin/bash topeet
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo topeet

USER topeet
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~

然后运行以下命令进行镜像的构建，之前都构建了一次了所以这次应该挺快的

~~~
docker build -t debian11 .
~~~

![image-20231114103043179](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043356.png)

![image-20231114103238803](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043290.png)

构建完成如上所示，然后打包该镜像

~~~
docker save -o debian11.tar.gz debian11
~~~

最后整体打包一下：

~~~shell
tar -zcvf docker-rockchip-debian-bullseye.tar.gz docker-rockchip-debian-bullseye
~~~



# 3.debian12 dockerfile

~~~dockerfile
# 使用Debian bookworm作为基础镜像
FROM debian:bookworm

# 设置镜像的维护者信息
MAINTAINER Caesar Wang "wxt@rock-chips.com"

# 添加arm64架构支持
RUN dpkg --add-architecture arm64

# 配置apt，禁用HTTPS的证书验证
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加自定义的sources.list文件到容器的/etc/apt/目录
ADD sources.list /etc/apt/

# 更新apt源并安装crossbuild-essential-arm64软件包
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 将当前目录下的overlay目录添加到镜像的根目录
ADD ./overlay/  /

# 安装构建过程中需要的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt install -fy sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec device-tree-compiler:arm64 bc:arm64 cpio:arm64 parted dosfstools:arm64 mtools:arm64 libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev:arm64 meson:arm64 debhelper:arm64 pkgconf:arm64

# 安装构建libdrm库所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm

# 安装构建xorg-server所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

# 安装GStreamer相关的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装libdrm-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装libx11-dev、libdrm-dev、libgstreamer1.0-dev、libgstreamer-plugins-base1.0-dev等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 libgstreamer-plugins-base1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libstdc++6、libgbm-dev、libdrm-dev、libx11-xcb1、libxcb-dri2-0、libxdamage1、libxext6、libwayland-client0等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装libgbm-dev、libegl1-mesa-dev、libgles2-mesa-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装debhelper-compat、libjpeg-dev、libpng-dev、libudev-dev、libxcb1-dev、python3、wayland-protocols、libwayland-dev、libwayland-bin等依赖包
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装构建weston所需的依赖包
RUN apt-get update && apt build-dep -y weston:arm64

# 生成并设置系统的locale为en_US.UTF-8
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# 修改locale.gen文件并重新配置locales，更新locale设置
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

# 打印日志信息
RUN echo "Update Headers!"

# 安装rga2软件包
RUN dpkg -i /packages/arm64/rga2/*.deb

# 安装mpp软件包
RUN dpkg -i /packages/arm64/mpp/*.deb

# 安装gst-rkmpp软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb

# 安装gst-plugins-base1.0软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb

# 安装libv4l软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb

# 解压libdrm软件包
RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

# 更新apt源并安装依赖包
RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'topeet user' -m -d /home/topeet -s /bin/bash topeet
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo topeet

USER topeet
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~

然后运行以下命令进行镜像的构建，之前都构建了一次了所以这次应该挺快的

~~~
docker build -t debian12 .
~~~

![image-20231114101013852](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043237.png)

构建完成如上所示，然后打包该镜像

~~~
docker save -o debian12.tar.gz debian12
~~~

![image-20231114102532308](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043250.png)

最后整体打包一下：

~~~shell
tar -zcvf docker-rockchip-debian-bookworm.tar.gz docker-rockchip-debian-bookworm
~~~

# 4.ubuntu20 dockerfile

~~~dockerfile
FROM arm64v8/ubuntu:20.04

# 设置多架构环境
RUN dpkg --add-architecture arm64
# 运行apt-get update并安装ca-certificates
#RUN apt-get update && apt-get install -y ca-certificates
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加sources.list文件到/etc/apt/目录
ADD sources.list /etc/apt/
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 添加overlay目录到根目录
ADD ./overlay/  /

# 安装构建依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装rga所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装gstreamer-rockchip所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libmali所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装drm-cursor所需的依赖项
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装glmark2所需的依赖项
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装rktoolkit所需的依赖项
#RUN apt install -y libmad-ocaml-dev libmad0-dev:arm64

# 安装lib4l2所需的依赖项
#RUN apt update -y
#RUN apt build-dep -y libv4l-dev:arm64

# 生成en_US.UTF-8本地化
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

RUN echo "Update Headers!"
RUN apt-get install -fy --allow-downgrades /packages/arm64/rga/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/mpp/*.deb
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gstreamer/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-bad1.0/*.deb
#RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-good1.0/*.deb

#RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb
#RUN dpkg -i /packages/arm64/gst-rkmpp/*.deb
#RUN dpkg -i /packages/arm64/ffmpeg/*.deb
#RUN dpkg -i /packages/arm64/libmali/libmali-midgard-t86x-r18p0-x11*.deb
#RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'topeet user' -m -d /home/topeet -s /bin/bash topeet
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo topeet

USER topeet
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~

然后运行以下命令进行镜像的构建，之前都构建了一次了所以这次应该挺快的

~~~
docker build -t debian11 .
~~~

![image-20231114103043179](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043356.png)

![image-20231114103238803](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043290.png)

构建完成如上所示，然后打包该镜像

~~~
docker save -o ubuntu20.tar.gz ubuntu20
~~~

# 5.ubuntu22 dockerfile

~~~dockerfile
FROM arm64v8/ubuntu:22.04

# 添加arm64架构支持
RUN dpkg --add-architecture arm64

# 配置apt，禁用HTTPS的证书验证
RUN touch /etc/apt/apt.conf.d/99verify-peer.conf && echo >>/etc/apt/apt.conf.d/99verify-peer.conf "Acquire { https::Verify-Peer false }"

# 添加自定义的sources.list文件到容器的/etc/apt/目录
ADD sources.list /etc/apt/

# 更新apt源并安装crossbuild-essential-arm64软件包
RUN apt-get update && apt-get install -y crossbuild-essential-arm64

# 将当前目录下的overlay目录添加到镜像的根目录
ADD ./overlay/  /

# 安装构建过程中需要的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt install -fy sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec device-tree-compiler:arm64 bc:arm64 cpio:arm64 parted dosfstools:arm64 mtools:arm64 libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev:arm64 meson:arm64 debhelper:arm64 pkgconf:arm64

# 安装构建libdrm库所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 libdrm

# 安装构建xorg-server所需的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get build-dep -y -a arm64 xorg-server

# 安装GStreamer相关的依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y gstreamer1.0-plugins-bad:arm64 gstreamer1.0-plugins-base:arm64 gstreamer1.0-tools:arm64 \
        gstreamer1.0-alsa:arm64 gstreamer1.0-plugins-base-apps:arm64 qtmultimedia5-examples:arm64

# 安装libdrm-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libdrm-dev:arm64

# 安装libx11-dev、libdrm-dev、libgstreamer1.0-dev、libgstreamer-plugins-base1.0-dev等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-dev:arm64 libdrm-dev:arm64 libgstreamer1.0-dev:arm64 libgstreamer-plugins-base1.0-dev:arm64 \
        libgstreamer-plugins-base1.0-dev:arm64

# 安装libstdc++6、libgbm-dev、libdrm-dev、libx11-xcb1、libxcb-dri2-0、libxdamage1、libxext6、libwayland-client0等依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libstdc++6:arm64 libgbm-dev:arm64 libdrm-dev:arm64 libx11-xcb1:arm64 libxcb-dri2-0:arm64 libxdamage1:arm64 \
        libxext6:arm64 libwayland-client0:arm64

# 安装libgbm-dev、libegl1-mesa-dev、libgles2-mesa-dev依赖包
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libgbm-dev:arm64 libegl1-mesa-dev:arm64 libgles2-mesa-dev:arm64

# 安装debhelper-compat、libjpeg-dev、libpng-dev、libudev-dev、libxcb1-dev、python3、wayland-protocols、libwayland-dev、libwayland-bin等依赖包
RUN apt-get install -y debhelper-compat libjpeg-dev:arm64 libpng-dev:arm64 libudev-dev:arm64  libxcb1-dev:arm64 python3 wayland-protocols libwayland-dev libwayland-bin

# 安装构建weston所需的依赖包
RUN apt-get update && apt build-dep -y weston:arm64

# 生成并设置系统的locale为en_US.UTF-8
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# 修改locale.gen文件并重新配置locales，更新locale设置
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

# 打印日志信息
RUN echo "Update Headers!"

# 安装rga2软件包
RUN dpkg -i /packages/arm64/rga2/*.deb

# 安装mpp软件包
RUN dpkg -i /packages/arm64/mpp/*.deb

# 安装gst-rkmpp软件包
RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-rkmpp/*.deb

# 安装gst-plugins-base1.0软件包
# RUN apt-get install -fy --allow-downgrades /packages/arm64/gst-plugins-base1.0/*.deb

# 安装libv4l软件包
# RUN apt-get install -fy --allow-downgrades /packages/arm64/libv4l/*.deb

# 解压libdrm软件包
# RUN find /packages/arm64/libdrm -name '*.deb' | sudo xargs -I{} dpkg -x {} /

# 更新apt源并安装依赖包
RUN apt-get update && apt-get install -y -f

# 切换到非 root 用户
RUN useradd -c 'topeet user' -m -d /home/topeet -s /bin/bash topeet
RUN sed -i -e '/\%sudo/ c \%sudo ALL=(ALL) NOPASSWD: ALL' /etc/sudoers
RUN usermod -a -G sudo topeet

USER topeet
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~

然后运行以下命令进行镜像的构建，之前都构建了一次了所以这次应该挺快的

~~~
docker build -t debian12 .
~~~

![image-20231114101013852](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043237.png)

构建完成如上所示，然后打包该镜像

~~~
docker save -o ubuntu22.tar.gz ubuntu22
~~~

![image-20231114102532308](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043250.png)

# 6.继续构建

docker搞完了，然后继续搞deb包的构建。先使用debian10 构建xserver的，

```
docker run --privileged -it -v /home/topeet/Linux/xorg-xserver:/home/topeet/ubuntu20_build debian10
```

![image-20231114125740932](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043305.png)

然后使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -rfakeroot -b -d -uc -us -aarm64
~~~

构建成功了，但是我目前仍旧不知道具体的区别所在。

X server 是一种实现图形用户界面的服务器软件，它允许图形应用程序在计算机上运行并与显示设备交互。“glamor” 是 X server 中的一个加速架构，它提供了对OpenGL ES 2.0的支持，可以加速图形渲染。“rga” 是一种基于 Arm Mali GPU 的图形加速器，可以提高图形渲染性能。“exa” 是 X server 的一个图形加速架构，可以提高 2D 图形操作的性能。因此，“X server with glamor hacks for gles2 and rga based exa” 意味着某种针对 OpenGL ES 2.0、rga 图形加速和 exa 图形加速的 X server 的改进版本或配置。这可能是一种优化后的 X server，可以提供更好的图形渲染性能和功能。



# 7.测试xserver

测试的灵感来自这个csdn https://blog.csdn.net/Neutionwei/article/details/111411023

![image-20231114135548345](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043592.png)

我先来几个疑问？

**1.什么是glamor**？

Glamor 是一个用于加速 2D 图形渲染的开源库和技术。它最初是为 X.Org 服务器开发的，旨在提供更高效的图形渲染方式。Glamor 的目标是通过利用现代图形硬件的能力，提供快速和高效的图形渲染，从而改善用户界面的性能和响应能力。

传统上，X.Org 服务器使用软件渲染来处理图形操作，这对于复杂的图形和动画效果可能效率较低。Glamor 的出现解决了这个问题，它利用了现代图形硬件中的 2D 加速功能，从而在支持硬件加速的系统上提供更快的图形渲染性能。

Glamor 的工作原理是将高级的 2D 图形操作转换为底层的图形加速接口调用，如 OpenGL 或 Vulkan。它通过将图形操作转发给底层硬件加速接口，利用 GPU 强大的并行处理能力来加速图形渲染。这种方式比传统的软件渲染更高效，可以显著提升图形渲染的性能和响应速度。

Glamor 提供了一个抽象层，使得开发者可以方便地在支持 Glamor 的系统上使用硬件加速的图形渲染。它可以与多种图形库和窗口系统集成，如 Xlib、Wayland 和 DirectFB。开发者可以使用 Glamor 提供的 API 来绘制图形，而无需直接操作底层的硬件加速接口。

**2.上面提到了glamor是一个硬件加速技术，那在rk3568上我要如何实现glamor硬件加速呢？**

确认硬件支持：首先，确保 RK3568 平台的图形硬件支持硬件加速。RK3568 是一款搭载了 Mali-G52 GPU 的芯片，Mali-G52 是一款支持 OpenGL ES、Vulkan 和 OpenCL 等标准的图形处理器。你需要确保该芯片在 Linux 系统上的驱动程序正确安装和配置，并支持硬件加速功能。

安装相关软件：为了使用硬件加速，你需要安装支持 Glamor 的图形库和驱动程序。通常，这包括 Mesa 3D 图形库、X.Org 服务器和相应的 DRM/KMS 驱动程序。你可以根据具体的 Linux 发行版和系统配置，使用包管理器来安装这些软件包。

配置 X.Org 服务器：Glamor 是为 X.Org 服务器设计的，因此你需要配置 X.Org 服务器以启用 Glamor。你可以编辑 X.Org 服务器的配置文件（通常是 `/etc/X11/xorg.conf` 或 `/etc/X11/xorg.conf.d/` 目录下的文件），添加或修改相关的配置选项来启用 Glamor。具体的配置选项可能会因不同的系统和驱动程序而有所差异，你可以参考相关文档或官方指南来了解如何正确配置 Glamor。

测试和验证：完成上述步骤后，你可以编写一个简单的测试程序来验证硬件加速是否正常工作。你可以使用 OpenGL 或 Vulkan 等图形库来进行绘图操作，并通过性能测试或其他指标来评估图形渲染性能的提升。你也可以尝试使用 Glamor 提供的 API 来进行图形绘制，以验证 Glamor 的功能和性能。

**3.那我用默认的ubuntu软件包和 Mali-G52驱动能正常使用glamor吗？**

在使用默认的 Ubuntu 软件包和 Mali-G52 驱动时，使用 Glamor 应该是可行的。Ubuntu 是一个广泛使用的 Linux 发行版，它通常包含了 Mesa 3D 图形库和 X.Org 服务器等组件，这些组件对于使用 Glamor 是必要的。

Mali-G52 是 ARM 公司的图形处理器，它在 Linux 系统上有对应的 DRM/KMS 驱动程序，用于与 X.Org 服务器和图形库进行交互。这些驱动程序通常会随着操作系统的更新和发布而更新，以确保兼容性和性能优化。

在大多数情况下，当你使用默认的 Ubuntu 软件包和 Mali-G52 驱动时，Glamor 应该已经预先配置并启用了。这意味着你可以直接通过 X.Org 服务器和相关图形库（如 OpenGL）来进行图形渲染，而无需额外的配置步骤。

**4.但我看瑞芯微已经对drm xserver等软件包进行了魔改，这是为啥呢？**

瑞芯微对 DRM（Direct Rendering Manager）和 X.Org 服务器等软件包进行魔改的主要目的是为了更好地适配和优化他们的芯片和硬件。这种魔改通常是为了解决特定的硬件功能、性能或兼容性问题，并确保在特定的瑞芯微平台上能够获得最佳的图形渲染性能和用户体验。

以下是一些可能的原因和动机：

1. 硬件优化：瑞芯微可能会对 DRM 和 X.Org 服务器进行修改，以最大程度地利用他们的芯片中的硬件加速功能。通过直接访问硬件特性和功能，他们可以实现更高效的图形渲染和处理，提供更好的性能和响应能力。
2. 兼容性和稳定性：瑞芯微可能会对软件包进行修改，以确保其与他们的芯片和硬件之间的兼容性。这可能涉及对驱动程序的修改、参数的调整或特定硬件功能的支持。通过这些修改，他们可以提供更稳定和可靠的图形渲染环境，减少与硬件相关的问题和兼容性冲突。
3. 定制化需求：瑞芯微的客户可能有特定的需求，需要定制化的图形渲染解决方案。通过对软件包进行魔改，他们可以满足客户的定制需求，提供针对特定应用场景和硬件平台的优化和定制化功能。

测试程序如下所示：

~~~c++
#include <iostream>
#include <chrono>
#include <X11/Xlib.h>

void drawRectangleWithGlamor(int width, int height, int drawCount) {
    Display* display = XOpenDisplay(NULL);
    if (display == NULL) {
        std::cerr << "无法打开 X 服务器连接" << std::endl;
        return;
    }

    Window rootWindow = DefaultRootWindow(display);
    Window window = XCreateSimpleWindow(display, rootWindow, 0, 0, width, height, 0, 0, 0);
    XSelectInput(display, window, StructureNotifyMask);
    XMapWindow(display, window);
    XEvent event;
    do {
        XNextEvent(display, &event);
    } while (event.type != MapNotify);

    GC gc = XCreateGC(display, window, 0, NULL);

    auto startTime = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < drawCount; ++i) {
        XSetForeground(display, gc, WhitePixel(display, DefaultScreen(display)));
        XFillRectangle(display, window, gc, 0, 0, width, height);
        XFlush(display);
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    double drawTime = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    double drawRate = static_cast<double>(drawCount) / (drawTime / 1000);

    XFreeGC(display, gc);
    XDestroyWindow(display, window);
    XCloseDisplay(display);

    std::cout << width << "x" << height << "大小的矩形（使用 glamor）：" << std::endl;
    std::cout << drawCount << "次绘制，每次绘制耗时" << drawTime / drawCount << "毫秒，每秒绘制次数为" << drawRate << "次。" << std::endl;
}

void drawRectangleWithoutGlamor(int width, int height, int drawCount) {
    Display* display = XOpenDisplay(NULL);
    if (display == NULL) {
        std::cerr << "无法打开 X 服务器连接" << std::endl;
        return;
    }

    Window rootWindow = DefaultRootWindow(display);
    Window window = XCreateSimpleWindow(display, rootWindow, 0, 0, width, height, 0, 0, 0);
    XSelectInput(display, window, StructureNotifyMask);
    XMapWindow(display, window);
    XEvent event;
    do {
        XNextEvent(display, &event);
    } while (event.type != MapNotify);

    GC gc = XCreateGC(display, window, 0, NULL);

    auto startTime = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < drawCount; ++i) {
        XSetForeground(display, gc, WhitePixel(display, DefaultScreen(display)));
        XDrawRectangle(display, window, gc, 0, 0, width - 1, height - 1);
        XFillRectangle(display, window, gc, 0, 0, width, height);
        XFlush(display);
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    double drawTime = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    double drawRate = static_cast<double>(drawCount) / (drawTime / 1000);

    XFreeGC(display, gc);
    XDestroyWindow(display, window);
    XCloseDisplay(display);

    std::cout << width << "x" << height << "大小的矩形（不使用 glamor）：" << std::endl;
    std::cout << drawCount << "次绘制，每次绘制耗时" << drawTime / drawCount << "毫秒，每秒绘制次数为" << drawRate << "次。" << std::endl;
}

void drawRectangle(int width, int height, int drawCount, bool useGlamor) {
    if (useGlamor) {
        drawRectangleWithGlamor(width, height, drawCount);
    } else {
        drawRectangleWithoutGlamor(width, height, drawCount);
    }
}

int main() {
    // 不使用 glamor 的测试
    drawRectangle(1, 1, 50000, false);
    drawRectangle(10, 10, 50000, false);
    drawRectangle(100, 100, 50000, false);
    drawRectangle(500, 500, 50000, false);

    std::cout << std::endl;

    // 使用 glamor 的测试
    drawRectangle(1, 1, 50000, true);
    drawRectangle(10, 10, 50000, true);
    drawRectangle(100, 100, 50000, true);
    drawRectangle(500, 500, 50000, true);

    return 0;
}
~~~

然后使用以下命令进行编译：

~~~shell
 g++ test.cpp -o test -lX11
~~~

![image-20231114140810933](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043661.png)

然后运行测试，测试结果如下所示：

![](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043817.png)

得出的结论如下所示：使用加速（glamor）：

- 对于1x1、10x10、100x100和500x500大小的矩形，每次绘制的耗时都在0.0057毫秒到0.0061毫秒之间。
- 每秒绘制次数在162242到175190之间。

不使用加速：

- 对于1x1、10x10、100x100和500x500大小的矩形，每次绘制的耗时在0.0028毫秒到0.0087毫秒之间。
- 每秒绘制次数在114430到357260之间。

从这些数据中可以看出，使用加速（glamor）相对于不使用加速，绘制矩形的耗时更稳定且更快。而不使用加速的情况下，绘制耗时有较大的波动，并且随着矩形大小的增加，绘制次数呈现不同程度的下降。

总体而言，使用加速（glamor）可以提供更稳定和高效的绘制性能，特别是在处理较大尺寸的矩形时。然而，要注意这些结论仅基于你提供的数据，具体的性能差异可能会因不同的环境和配置而有所变化。

上面是通过程序测试的，也有一个专门的命令行进行查看

~~~shell
cat /var/log/Xorg.0.log | grep glamor
~~~

![image-20231114145330988](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043734.png)

显示“glamor initialized”，则表示已启用加速。



# 8.测试opencl

打印基础信息

~~~c++
#define CL_TARGET_OPENCL_VERSION 220
#include <CL/cl.h>
#include <stdio.h>
#include <stdlib.h> // 使用标准库函数需包含该头文件

int main() {
    cl_platform_id *platform;
    cl_uint num_platform;
    cl_int err;

    // 获取平台数量
    err = clGetPlatformIDs(0, NULL, &num_platform);
    if (err != CL_SUCCESS) {
        printf("无法获取平台数量\n");
        return err;
    }

    platform = (cl_platform_id *)malloc(sizeof(cl_platform_id) * num_platform);

    // 获取平台ID
    err = clGetPlatformIDs(num_platform, platform, NULL);
    if (err != CL_SUCCESS) {
        printf("无法获取平台ID\n");
        free(platform);
        return err;
    }

    for (int i = 0; i < num_platform; i++) {
        size_t size;
        char *name, *vendor, *version, *profile, *extensions;

        // 获取平台名称
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_NAME, 0, NULL, &size);
        name = (char *)malloc(size);
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_NAME, size, name, NULL);
        printf("CL_PLATFORM_NAME: %s\n", name);
        free(name);

        // 获取平台供应商
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_VENDOR, 0, NULL, &size);
        vendor = (char *)malloc(size);
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_VENDOR, size, vendor, NULL);
        printf("CL_PLATFORM_VENDOR: %s\n", vendor);
        free(vendor);

        // 获取平台版本
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_VERSION, 0, NULL, &size);
        version = (char *)malloc(size);
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_VERSION, size, version, NULL);
        printf("CL_PLATFORM_VERSION: %s\n", version);
        free(version);

        // 获取平台配置文件
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_PROFILE, 0, NULL, &size);
        profile = (char *)malloc(size);
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_PROFILE, size, profile, NULL);
        printf("CL_PLATFORM_PROFILE: %s\n", profile);
        free(profile);

        // 获取平台扩展
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_EXTENSIONS, 0, NULL, &size);
        extensions = (char *)malloc(size);
        err = clGetPlatformInfo(platform[i], CL_PLATFORM_EXTENSIONS, size, extensions, NULL);
        printf("CL_PLATFORM_EXTENSIONS: %s\n", extensions);
        free(extensions);

        printf("\n\n");
    }

    free(platform);
    return 0;
}
~~~

编译：

~~~
gcc opencl.cpp -o opencl_test -lmali -L/usr/lib/aarch64-linux-gnu/  -I/usr/include/CL/
~~~

运行“
![image-20231114160309270](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142043741.png)

然后使用clinfo命令也可以打印opencl的信息

~~~
root@topeet:/home/topeet$ clinfo
Number of platforms                               1
  Platform Name                                   ARM Platform
  Platform Vendor                                 ARM
  Platform Version                                OpenCL 2.1 v1.g6p0-01eac0.efb75e2978d783a80fe78be1bfb0efc1
  Platform Profile                                FULL_PROFILE
  Platform Extensions                             cl_khr_global_int32_base_atomics cl_khr_global_int32_extended_atomics cl_khr_local_int32_base_atomics cl_khr_local_int32_extended_atomics cl_khr_byte_addressable_store cl_khr_3d_image_writes cl_khr_int64_base_atomics cl_khr_int64_extended_atomics cl_khr_fp16 cl_khr_icd cl_khr_egl_image cl_khr_image2d_from_buffer cl_khr_depth_images cl_khr_subgroups cl_khr_subgroup_extended_types cl_khr_subgroup_non_uniform_vote cl_khr_subgroup_ballot cl_khr_il_program cl_khr_priority_hints cl_khr_create_command_queue cl_khr_spirv_no_integer_wrap_decoration cl_khr_extended_versioning cl_khr_device_uuid cl_arm_core_id cl_arm_printf cl_arm_non_uniform_work_group_size cl_arm_import_memory cl_arm_import_memory_dma_buf cl_arm_import_memory_host cl_arm_integer_dot_product_int8 cl_arm_integer_dot_product_accumulate_int8 cl_arm_integer_dot_product_accumulate_saturate_int8 cl_arm_scheduling_controls cl_arm_controlled_kernel_termination cl_ext_cxx_for_opencl
  Platform Extensions function suffix             ARM
  Platform Host timer resolution                  1ns

  Platform Name                                   ARM Platform
Number of devices                                 1
arm_release_ver of this libmali is 'g6p0-01eac0', rk_so_ver is '5'.
  Device Name                                     Mali-LODX r0p0
  Device Vendor                                   ARM
  Device Vendor ID                                0xa8670000
  Device Version                                  OpenCL 2.1 v1.g6p0-01eac0.efb75e2978d783a80fe78be1bfb0efc1
  Device UUID                                     000067a8-0100-0000-0000-000000000000
  Driver UUID                                     d9495bef-ea91-7c52-8a43-8a3c2f7b49cc
  Valid Device LUID                               No
  Device LUID                                     0000-000000000000
  Device Node Mask                                0
  Device Numeric Version                          0x801000 (2.1.0)
  Driver Version                                  2.1
  Device OpenCL C Version                         OpenCL C 2.0 v1.g6p0-01eac0.efb75e2978d783a80fe78be1bfb0efc1
  Device C++ for OpenCL Numeric Version           0x400000 (1.0.0)
  Device Type                                     GPU
  Device Profile                                  FULL_PROFILE
  Device Available                                Yes
  Compiler Available                              Yes
  Linker Available                                Yes
  Max compute units                               4
  Available core IDs                              0, 2, 16, 18
  Max clock frequency                             1000MHz
  Device Partition                                (core)
    Max number of sub-devices                     0
    Supported partition types                     None
    Supported affinity domains                    (n/a)
  Max work item dimensions                        3
  Max work item sizes                             1024x1024x1024
  Max work group size                             1024
  Preferred work group size multiple (kernel)     16
~~~

clpeak测试，这个源里面是没有的，所以需要先git

```
git clone https://github.com/krrishnarraj/clpeak
mkdir clpeak/build
cd clpeak/build
cmake ..
make -j$(nproc)
./clpeak
```

~~~shell
oot@topeet:/home/topeet/clpeak/build$ ./clpeak

Platform: ARM Platform
arm_release_ver of this libmali is 'g6p0-01eac0', rk_so_ver is '5'.
  Device: Mali-LODX r0p0
    Driver version  : 2.1 (Linux ARM64)
    Compute units   : 4
    Clock frequency : 1000 MHz

    Global memory bandwidth (GBPS)
      float   : 23.15
      float2  : 24.43
      float4  : 25.12
      float8  : 12.74
      float16 : 12.29

    Single-precision compute (GFLOPS)
      float   : 439.08
      float2  : 467.79
      float4  : 463.03
      float8  : 432.98
      float16 : 408.58

    Half-precision compute (GFLOPS)
      half   : 439.79
      half2  : 867.20
      half4  : 898.12
      half8  : 875.33
      half16 : 835.56

    No double precision support! Skipped

    Integer compute (GIOPS)
      int   : 124.79
      int2  : 125.28
      int4  : 124.83
      int8  : 123.36
      int16 : 123.81

    Integer compute Fast 24bit (GIOPS)
      int   : 124.67
      int2  : 125.32
      int4  : 124.79
      int8  : 123.36
      int16 : 123.82

    Transfer bandwidth (GBPS)
      enqueueWriteBuffer              : 2.73
      enqueueReadBuffer               : 7.82
      enqueueWriteBuffer non-blocking : 7.26
      enqueueReadBuffer non-blocking  : 8.16
      enqueueMapBuffer(for read)      : 60.05
        memcpy from mapped ptr        : 9.09
      enqueueUnmap(after write)       : 56.96
        memcpy to mapped ptr          : 8.79

    Kernel launch latency : 40.79 us

root@topeet:/home/topeet/clpeak/build$
~~~



这个输出显示了在 ARM 平台上的 OpenCL 性能测试结果。具体来说，它提供了以下信息：

- 平台信息：ARM 平台。
- 设备信息：Mali-LODX r0p0 设备，具有以下特性：
  - 驱动版本：2.1 (Linux ARM64)。
  - 计算单元数量：4。
  - 时钟频率：1000 MHz。

然后，它提供了一系列性能指标，包括：

- 全局内存带宽（单位：GBPS）：浮点数运算的带宽。
  - `float`：23.15 GBPS
  - `float2`：24.43 GBPS
  - `float4`：25.12 GBPS
  - `float8`：12.74 GBPS
  - `float16`：12.29 GBPS
- 单精度浮点数计算性能（单位：GFLOPS）：
  - `float`：439.08 GFLOPS
  - `float2`：467.79 GFLOPS
  - `float4`：463.03 GFLOPS
  - `float8`：432.98 GFLOPS
  - `float16`：408.58 GFLOPS
- 半精度浮点数计算性能（单位：GFLOPS）：
  - `half`：439.79 GFLOPS
  - `half2`：867.20 GFLOPS
  - `half4`：898.12 GFLOPS
  - `half8`：875.33 GFLOPS
  - `half16`：835.56 GFLOPS
- 不支持双精度浮点数计算。
- 整数计算性能（单位：GIOPS）：
  - `int`：124.79 GIOPS
  - `int2`：125.28 GIOPS
  - `int4`：124.83 GIOPS
  - `int8`：123.36 GIOPS
  - `int16`：123.81 GIOPS
- 快速 24 位整数计算性能（单位：GIOPS）：
  - `int`：124.67 GIOPS
  - `int2`：125.32 GIOPS
  - `int4`：124.79 GIOPS
  - `int8`：123.36 GIOPS
  - `int16`：123.82 GIOPS
- 传输带宽（单位：GBPS）：不同类型的内存传输操作的带宽。
  - `enqueueWriteBuffer`：2.73 GBPS
  - `enqueueReadBuffer`：7.82 GBPS
  - `enqueueWriteBuffer non-blocking`：7.26 GBPS
  - `enqueueReadBuffer non-blocking`：8.16 GBPS
  - `enqueueMapBuffer(for read)`：60.05 GBPS
  - `memcpy from mapped ptr`：9.09 GBPS
  - `enqueueUnmap(after write)`：56.96 GBPS
  - `memcpy to mapped ptr`：8.79 GBPS
- 内核启动延迟：40.79 微秒。

# 9.对比测试（编译一个什么都没有的ubuntu）

~~~

~~~

# 10 opengl学习

学习网址：https://blog.csdn.net/XscKernel/article/details/50158329?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522169996845316800211564994%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=169996845316800211564994&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-50158329-null-null.142

==什么是opengl？==

OpenGL（Open Graphics Library）是一个用于渲染2D和3D图形的跨平台图形编程接口。它提供了一套函数和命令，用于管理图形数据、执行基本绘图操作和实现高级的图形效果。

下面是一些关于OpenGL的详细说明：

1. **跨平台性**: OpenGL是跨平台的，可以在不同的操作系统（如Windows、MacOS、Linux）上运行。这使得开发者可以编写与特定操作系统无关的图形应用程序。
2. **硬件加速**: OpenGL可以利用计算机中的图形硬件（如显卡）进行硬件加速，以提高图形渲染的性能。这使得OpenGL在处理复杂的3D图形时具有出色的性能。
3. **图形渲染管线**: OpenGL使用图形渲染管线来处理图形数据。图形渲染管线是一系列的处理阶段，将输入的3D图形数据转换为最终在屏幕上显示的2D图像。它包括几何处理、光栅化、着色和输出等阶段。
4. **基本几何图元**: OpenGL支持绘制基本几何图元，如点、线和三角形。这些图元构成了绘制复杂3D对象的基础。
5. **着色器编程**: OpenGL使用着色器来处理图形的顶点和像素。顶点着色器负责对每个顶点进行变换和处理，而像素着色器则在光栅化阶段对每个像素进行处理。这使得开发者可以根据需要自定义图形的外观和效果。
6. **纹理映射**: OpenGL支持将纹理映射到3D模型的表面，以实现更加真实和详细的图形效果。纹理可以包含图像、颜色或其他数据，可以用于模拟材质、添加细节和实现纹理映射效果。
7. **光照和阴影**: OpenGL提供了灯光模型和阴影技术，可以模拟光的交互和对象之间的阴影关系。这使得图形更加逼真和真实。
8. **扩展和版本**: OpenGL不断发展和更新，引入新的功能和扩展，以适应不断增长的图形需求。每个OpenGL版本都有其特定的功能和支持的硬件级别。

## 10.1 环境搭建

安装OpenGL Library

```
sudo apt-get install libgl1-mesa-dev
```

安装OpenGL Utilities

```
sudo apt-get install libglu1-mesa-dev
```

  OpenGL Utilities 是一组建构于 OpenGL Library 之上的工具组，提供许多很方便的函式，使 OpenGL 更强大且更容易使用。

  安装OpenGL Utility Toolkit

```
sudo apt-get install freeglut3-dev
```

  OpenGL Utility Toolkit 是建立在 OpenGL Utilities 上面的工具箱，除了强化了 OpenGL Utilities 的不足之外，也增加了 OpenGL 对于视窗介面支援。

测试程序

~~~c
#include <GL/glut.h>

void myDisplay(void)
{
    glClear(GL_COLOR_BUFFER_BIT);
    glRectf(-0.5f, -0.5f, 0.5f, 0.5f);
    glFlush();
}

int main(int argc, char *argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE);
    glutInitWindowPosition(100, 100);
    glutInitWindowSize(400, 400);
    glutCreateWindow("the first opengL test");
    glutDisplayFunc(&myDisplay);
    glutMainLoop();

    return 0;
}
~~~



~~~
gcc -o test test.c -lGL -lGLU -lglut
~~~

演示效果如下所示：

![image-20231114213934062](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142139102.png)

## 10.2：画一个圆

~~~c
#include <GL/glut.h>  // 引入OpenGL库
#include <math.h>

const int n = 20;  // 定义多边形的边数
const GLfloat R = 0.5f;  // 多边形的半径
const GLfloat Pi = 3.1415926536f;  // 圆周率Pi

void myDisplay(void)
{
    glClear(GL_COLOR_BUFFER_BIT);  // 清空颜色缓冲区

    glBegin(GL_POLYGON);  // 开始绘制多边形
    for (int i = 0; i < n; ++i)
    {
        // 计算多边形每个顶点的坐标
        GLfloat x = R * cos(2 * Pi / n * i);
        GLfloat y = R * sin(2 * Pi / n * i);
        glVertex2f(x, y);  // 添加顶点
    }
    glEnd();  // 结束绘制多边形

    glFlush();  // 清空OpenGL命令缓冲区，强制执行绘图命令
}

int main(int argc, char* argv[])
{
    glutInit(&argc, argv);  // 初始化GLUT库

    glutInitDisplayMode(GLUT_RGB);  // 设置显示模式为RGB颜色模式
    glutInitWindowSize(400, 400);  // 设置窗口大小
    glutCreateWindow("OpenGL Polygon");  // 创建窗口，并设置标题为 "OpenGL Polygon"

    glutDisplayFunc(myDisplay);  // 注册显示回调函数

    glutMainLoop();  // 进入主循环，开始事件处理

    return 0;
}
~~~



~~~shell
gcc -o test test.c -lGL -lGLU -lglut
~~~



![image-20231114214250208](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142142229.png)



## 10.3 画一个五角星

~~~c
#include <GL/glut.h>
#include <math.h>

const GLfloat Pi = 3.1415926536f;

void myDisplay(void)
{
    // 计算五角星的相关坐标
    GLfloat a = 1 / (2 - 2 * cos(72 * Pi / 180));
    GLfloat bx = a * cos(18 * Pi / 180);
    GLfloat by = a * sin(18 * Pi / 180);
    GLfloat cy = -a * cos(18 * Pi / 180);

    // 定义五个顶点的坐标
    GLfloat PointA[2] = {0, a};
    GLfloat PointB[2] = {bx, by};
    GLfloat PointC[2] = {0.5, cy};
    GLfloat PointD[2] = {-0.5, cy};
    GLfloat PointE[2] = {-bx, by};

    glClear(GL_COLOR_BUFFER_BIT);

    // 按照A->C->E->B->D->A的顺序，绘制五角星
    glBegin(GL_LINE_LOOP);
    glVertex2fv(PointA);
    glVertex2fv(PointC);
    glVertex2fv(PointE);
    glVertex2fv(PointB);
    glVertex2fv(PointD);
    glEnd();

    glFlush();
}

int main(int argc, char* argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB);
    glutInitWindowSize(400, 400);
    glutCreateWindow("OpenGL Star");

    glutDisplayFunc(myDisplay);

    glutMainLoop();

    return 0;
}
~~~



~~~shell
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~

![image-20231114214602345](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142146381.png)



## 10.4 画一个正弦

~~~c
#include <GL/glut.h>
#include <math.h>

const GLfloat factor = 0.1f;

void myDisplay(void)
{
    GLfloat x;

    glClear(GL_COLOR_BUFFER_BIT);

    // 绘制坐标轴
    glBegin(GL_LINES);
    glVertex2f(-1.0f, 0.0f); // x轴起点
    glVertex2f(1.0f, 0.0f);  // x轴终点
    glVertex2f(0.0f, -1.0f); // y轴起点
    glVertex2f(0.0f, 1.0f);  // y轴终点
    glEnd();

    // 绘制正弦曲线
    glBegin(GL_LINE_STRIP);
    for (x = -1.0f / factor; x < 1.0f / factor; x += 0.01f)
    {
        glVertex2f(x * factor, sin(x) * factor);
    }
    glEnd();

    glFlush();
}

int main(int argc, char* argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB);
    glutInitWindowSize(400, 400);
    glutCreateWindow("OpenGL Sine Curve");

    glutDisplayFunc(myDisplay);

    glutMainLoop();

    return 0;
}
~~~



~~~shell
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~

![image-20231114214746801](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142147823.png)

## 10.5 指定着色模型

~~~c
#include <GL/glut.h>
#include <math.h>

const GLdouble Pi = 3.1415926536;

void myDisplay(void)
{
    int i;

    glClear(GL_COLOR_BUFFER_BIT);

    glBegin(GL_TRIANGLE_FAN);

    glColor3f(1.0f, 1.0f, 1.0f);
    glVertex2f(0.0f, 0.0f);

    for (i = 0; i <= 8; ++i)
    {
        glColor3f((i & 0x04) ? 1.0f : 0.0f, (i & 0x02) ? 1.0f : 0.0f, (i & 0x01) ? 1.0f : 0.0f);
        glVertex2f(cos(i * Pi / 4), sin(i * Pi / 4));
    }

    glEnd();

    glFlush();
}

int main(int argc, char *argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB);
    glutInitWindowSize(400, 400);
    glutCreateWindow("OpenGL Colorful Triangle");

    glutDisplayFunc(myDisplay);

    glutMainLoop();

    return 0;
}
~~~



~~~
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~



![image-20231114214959931](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142149974.png)

这个图形渲染出来就很慢，这可能就是GPU的作用了

## 10.6 三维变换

模型变换和视图变换

投影变换

视口变换

操作矩阵堆栈

~~~c
#include <GL/glut.h>

static int day = 200;

void myDisplay(void)
{
    glEnable(GL_DEPTH_TEST);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(75, 1, 1, 400000000);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(0, -200000000, 200000000, 0, 0, 0, 0, 0, 1);

    glColor3f(1.0f, 0.0f, 0.0f);
    glutSolidSphere(69600000, 20, 20);

    glColor3f(0.0f, 0.0f, 1.0f);
    glRotatef(day / 360.0f * 360.0f, 0.0f, 0.0f, -1.0f);
    glTranslatef(150000000, 0.0f, 0.0f);
    glutSolidSphere(15945000, 20, 20);

    glColor3f(1.0f, 1.0f, 0.0f);
    glRotatef(day / 30.0f * 360.0f - day / 360.0f * 360.0f, 0.0f, 0.0f, -1.0f);
    glTranslatef(38000000, 0.0f, 0.0f);
    glutSolidSphere(4345000, 20, 20);

    glFlush();
}

int main(int argc, char* argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 800);
    glutCreateWindow("Solar System");

    glutDisplayFunc(myDisplay);

    // 添加深度测试函数
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_EQUAL);

    glutMainLoop();

    return 0;
}
~~~

~~~
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~

## 10.7 动起来

~~~
#include <GL/glut.h>

// 太阳、地球和月亮
// 假设每个月都是30天
// 一年12个月，共是360天
static int day = 200; // day的变化：从0到359

void myDisplay(void)
{
    glEnable(GL_DEPTH_TEST);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(75, 1, 1, 400000000);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    gluLookAt(0, -200000000, 200000000, 0, 0, 0, 0, 0, 1);

    // 绘制红色的“太阳”
    glColor3f(1.0f, 0.0f, 0.0f);
    glutSolidSphere(69600000, 20, 20);

    // 绘制蓝色的“地球”
    glColor3f(0.0f, 0.0f, 1.0f);
    glRotatef(day / 360.0f * 360.0f, 0.0f, 0.0f, -1.0f);
    glTranslatef(150000000, 0.0f, 0.0f);
    glutSolidSphere(15945000, 20, 20);

    // 绘制黄色的“月亮”
    glColor3f(1.0f, 1.0f, 0.0f);
    glRotatef(day / 30.0f * 360.0f - day / 360.0f * 360.0f, 0.0f, 0.0f, -1.0f);
    glTranslatef(38000000, 0.0f, 0.0f);
    glutSolidSphere(4345000, 20, 20);

    glFlush();
    glutSwapBuffers();
}

void myIdle(void)
{
    /* 新的函数，在空闲时调用，作用是把日期往后移动一天并重新绘制，达到动画效果 */
    ++day;
    if (day >= 360)
        day = 0;
    glutPostRedisplay(); // 通知系统重新绘制窗口，触发显示回调函数 myDisplay()
}

int main(int argc, char *argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE);
    glutInitWindowPosition(100, 100);
    glutInitWindowSize(400, 400);
    glutCreateWindow("太阳，地球和月亮");

    glutDisplayFunc(myDisplay);
    glutIdleFunc(myIdle);

    glutMainLoop();

    return 0;
}
~~~

~~~
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~



![image-20231114215605879](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142156920.png)

~~~c
#include <GL/glut.h>

void setLight(void)
{
    static const GLfloat light_position[] = {1.0f, 1.0f, -1.0f, 1.0f};
    static const GLfloat light_ambient[] = {0.2f, 0.2f, 0.2f, 1.0f};
    static const GLfloat light_diffuse[] = {1.0f, 1.0f, 1.0f, 1.0f};
    static const GLfloat light_specular[] = {1.0f, 1.0f, 1.0f, 1.0f};

    glLightfv(GL_LIGHT0, GL_POSITION, light_position);
    glLightfv(GL_LIGHT0, GL_AMBIENT, light_ambient);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, light_diffuse);
    glLightfv(GL_LIGHT0, GL_SPECULAR, light_specular);

    glEnable(GL_LIGHT0);
    glEnable(GL_LIGHTING);
    glEnable(GL_DEPTH_TEST);
}

void setMaterial(const GLfloat mat_diffuse[4], GLfloat mat_shininess)
{
    static const GLfloat mat_specular[] = {0.0f, 0.0f, 0.0f, 1.0f};
    static const GLfloat mat_emission[] = {0.0f, 0.0f, 0.0f, 1.0f};

    glMaterialfv(GL_FRONT, GL_AMBIENT_AND_DIFFUSE, mat_diffuse);
    glMaterialfv(GL_FRONT, GL_SPECULAR, mat_specular);
    glMaterialfv(GL_FRONT, GL_EMISSION, mat_emission);
    glMaterialf(GL_FRONT, GL_SHININESS, mat_shininess);
}

void myDisplay(void)
{
    // 定义一些材质颜色
    const static GLfloat red_color[] = {1.0f, 0.0f, 0.0f, 1.0f};
    const static GLfloat green_color[] = {0.0f, 1.0f, 0.0f, 0.3333f};
    const static GLfloat blue_color[] = {0.0f, 0.0f, 1.0f, 0.5f};

    // 清除屏幕
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // 启动混合并设置混合因子
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // 设置光源
    setLight();

    // 以(0, 0, 0.5)为中心，绘制一个半径为0.3的不透明红色球体（离观察者最远）
    setMaterial(red_color, 30.0);
    glPushMatrix();
    glTranslatef(0.0f, 0.0f, 0.5f);
    glutSolidSphere(0.3, 30, 30);
    glPopMatrix();

    // 下面将绘制半透明物体了，因此将深度缓冲设置为只读
    glDepthMask(GL_FALSE);

    // 以(0.2, 0, -0.5)为中心，绘制一个半径为0.2的半透明蓝色球体（离观察者最近）
    setMaterial(blue_color, 30.0);
    glPushMatrix();
    glTranslatef(0.2f, 0.0f, -0.5f);
    glutSolidSphere(0.2, 30, 30);
    glPopMatrix();

    // 以(0.1, 0, 0)为中心，绘制一个半径为0.15的半透明绿色球体（在前两个球体之间）
    setMaterial(green_color, 30.0);
    glPushMatrix();
    glTranslatef(0.1, 0, 0);
    glutSolidSphere(0.15, 30, 30);
    glPopMatrix();

    // 完成半透明物体的绘制，将深度缓冲区恢复为可读可写的形式
    glDepthMask(GL_TRUE);

    glutSwapBuffers();
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE | GLUT_DEPTH);
    glutInitWindowPosition(100, 100);
    glutInitWindowSize(800, 600);
    glutCreateWindow("Transparent Objects");

    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

    glutDisplayFunc(myDisplay);

    glutMainLoop();

    return 0;
}
~~~

~~~
gcc -o test test.c -lm -lGL -lGLU -lglut
~~~

![image-20231114220315130](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311142203186.png)

# 11.opencl学习

==什么是opencl？==

OpenCL（Open Computing Language）是一个开放的跨平台编程框架，用于实现并行计算和通用计算任务的加速。它允许开发者利用多核 CPU、GPU、FPGA和其他加速器等异构计算资源，以高效地执行并行计算任务。

下面是对OpenCL的详细解释：

1. **跨平台性**: OpenCL是一个跨平台的编程框架，可在各种操作系统（如Windows、MacOS、Linux）和硬件平台上运行。这使得开发者可以编写与特定平台和硬件无关的并行计算代码。
2. **异构计算**: OpenCL支持异构计算，利用多种计算设备（如CPU、GPU、FPGA等）的并行计算能力。这些设备以不同的方式处理数据和执行计算任务，使得开发者能够充分利用各种硬件资源。
3. **并行计算模型**: OpenCL采用基于任务和数据并行的计算模型。开发者可以将计算任务分解为多个独立的子任务，然后并行执行这些子任务。这种并行计算模型可以在不同的设备上同时执行任务，实现高效的并行计算。
4. **内核函数**: OpenCL使用内核函数来描述并行计算任务。内核函数是程序员编写的并行计算代码，运行在OpenCL设备上的并行处理单元上。开发者可以通过编写内核函数来定义要执行的计算任务。
5. **内存模型**: OpenCL提供了全局内存、局部内存和私有内存等不同类型的内存来管理数据。全局内存对所有内核函数可见，局部内存用于共享数据和协同工作，而私有内存用于每个工作项的私有数据。开发者可以根据计算需求来选择合适的内存类型。
6. **任务调度和并行执行**: OpenCL使用工作组（work-group）和工作项（work-item）的概念来管理任务的调度和并行执行。工作组是一组相关的工作项，它们可以协同工作和共享数据。工作项是最小的并行执行单元，每个工作项独立执行内核函数。
7. **运行时系统**: OpenCL通过运行时系统来管理和调度并行计算任务。运行时系统负责加载和初始化设备驱动程序，分配和管理内存，调度并行任务的执行，以及在设备之间进行数据传输。
8. **扩展和版本**: OpenCL不断发展和更新，引入新的功能和扩展，以适应不断增长的并行计算需求。每个OpenCL版本都有其特定的功能和支持的硬件级别。

# 12.rga编译

RGA（Raster Graphic Acceleration Unit）光栅图形加速单元是一个独立的硬件加速器，专门用于加速2D图形操作。它提供了高效的点/线绘制、图像缩放、旋转、位块传输（bitBlt）、Alpha混合等常见的2D图形操作功能。

RGA 的设计目标是通过硬件加速来提高2D图形处理的性能和效率，减轻CPU的负担。它具有独立的硬件模块，可以通过用户空间驱动程序进行访问和控制。

以下是 RGA 的主要特性和功能：

1. 点/线绘制加速：RGA 提供了硬件加速的点和线绘制功能，可以快速绘制图形中的点和线条，提供更高的绘制性能。
2. 图像缩放和旋转：RGA 支持硬件加速的图像缩放和旋转，可以快速执行图像的放大、缩小和旋转操作，适用于图像处理和显示应用。
3. 位块传输（bitBlt）：RGA 提供了硬件加速的位块传输功能，可以高效地在内存之间传输图像数据，包括复制、填充和裁剪等操作。
4. Alpha混合：RGA 支持硬件加速的Alpha混合操作，可以实现图像的透明度混合，以实现图像叠加和特效效果。
5. 用户空间驱动程序：RGA 提供了用户空间驱动程序，允许应用程序通过API访问和控制RGA硬件加速器。这样，开发者可以方便地利用RGA的功能来加速2D图形操作。

RGA 的优势在于它提供了高效的硬件加速，能够加速常见的2D图形操作，从而提高图形处理和显示的性能。应用程序可以通过使用RGA的用户空间驱动程序来利用这些功能，实现更快速、流畅的图形处理和显示效果。

RGA（Raster Graphic Acceleration Unit）并不是一个独立的硬件加速器。实际上，RGA是一种软件技术，也可以指代一组相关的软件库和驱动程序。

RGA是Rockchip（瑞芯微电子）公司开发的图像处理技术，主要应用于他们的系统芯片中。RGA技术在Rockchip的芯片中集成了一个专门的硬件模块，用于加速2D图形操作。这个硬件模块通常被称为RGA硬件加速器。

然而，RGA并不是像GPU（图形处理单元）这样的独立硬件设备。它是与Rockchip系统芯片集成的一部分，用于提供2D图形处理的加速功能。RGA的驱动程序和软件库允许开发者通过API来访问和利用这个硬件加速器。

因此，RGA实际上是Rockchip芯片中的一个特定功能模块，用于加速2D图形操作，并通过软件驱动程序提供对该模块的访问和控制。



rockchip 的github https://github.com/orgs/rockchip-linux/repositories?type=all

rga的github https://github.com/JeffyCN/mirrors/tree/linux-rga-multi

~~~
git clone https://github.com/Caesar-github/linux-rga.git
~~~

```
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
```

使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
export CC=aarch64-none-linux-gnu-gcc
export CXX=aarch64-none-linux-gnu-g++
~~~

- `DEB_BUILD_OPTIONS=nocheck`: 这是一个环境变量设置，指定在构建软件包时不运行自动化测试。`nocheck` 选项告诉构建系统跳过自动化测试阶段，以加快构建过程。
- `dpkg-buildpackage`: 这是用于构建 Debian 软件包的工具。它会根据当前目录中的源代码和相关文件构建一个 .deb 文件。
- `-b`: 这是一个选项，指定只构建二进制软件包，不包括源代码。
- `-d`: 这是一个选项，告诉 dpkg-buildpackage 在构建过程中处理依赖关系。
- `-uc -us`: 这是两个选项，用于指定在构建过程中不签名软件包。`-uc` 表示不对源代码包进行签名，`-us` 表示不对二进制软件包进行签名。

- `-aarm64`: 这是一个选项，指定要构建的目标架构为 arm64（ARM 64位架构）。

![image-20231115152331453](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311152100173.png)

这就编译成功了，得到了三个包。

# 13.mpp编译

MPP（Media Processing Platform）是一种多媒体处理平台，用于实现音频和视频数据的处理、编解码和处理。MPP 提供了一组丰富的功能和算法，用于处理各种多媒体数据，并且能够在硬件加速的环境下提供高效的处理性能。

以下是 MPP 的主要作用：

视频编解码：MPP 提供了各种视频编解码器，如 H.264、H.265、MPEG-2 等。这些编解码器能够将视频数据进行压缩（编码）和解压缩（解码），以满足不同应用场景对视频数据的存储和传输需求。通过硬件加速，MPP 可以提供高效的视频编解码性能，减轻 CPU 的负担。

图像处理：MPP 包含了一系列图像处理算法，如图像缩放、旋转、裁剪、色彩空间转换等。这些算法可以对图像进行各种操作和转换，以满足不同应用场景对图像处理的需求。MPP 的硬件加速能力可以加快图像处理的速度，并提供更高的效率。

音频编解码：除了视频编解码，MPP 还提供了音频编解码的功能。它支持常见的音频编码格式，如 AAC、MP3、AC3 等。通过 MPP，可以对音频数据进行高效的压缩和解压缩，实现音频的存储、传输和处理。

多媒体处理流程管理：MPP 提供了一个统一的框架和接口，用于管理和控制多媒体处理流程。它可以对多个媒体处理单元进行调度和协调，实现复杂的多媒体处理任务。MPP 还提供了丰富的配置选项和参数设置，以满足不同应用场景的需求。

总之，MPP 是一个强大的多媒体处理平台，提供了视频编解码、图像处理、音频编解码等功能。它通过硬件加速，能够实现高效的多媒体数据处理和处理性能，满足各种应用场景对多媒体处理的需求。

 https://github.com/rockchip-linux/mpp

~~~
git clone  https://github.com/rockchip-linux/mpp
~~~

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

![image-20231115153242539](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311152100221.png)

# 14.drm-cursor编译

drm-cursor 模块的作用是在 Linux 内核中管理和控制硬件光标的显示和操作。它提供了对硬件光标平面（cursor plane）的支持，允许用户在图形界面中显示和操作硬件加速的光标。

具体而言，drm-cursor 模块负责以下功能：

1. 硬件光标位置控制：它允许用户在屏幕上drm-cursor 模块的作用是在 Linux 内核中管理和控制硬件光标的显示和操作。它提供了对硬件光标平面（cursor plane）的支持，允许用户在图形界面中显示和操作硬件加速的光标。

具体而言，drm-cursor 模块负责以下功能：

1. 硬件光标位置控制：它允许用户在屏幕上设置光标的位置，使光标能够随着鼠标移动而移动。
2. 硬件光标外观设置：它允许用户定义光标的外观，包括光标的形状、大小、颜色等。
3. 硬件光标的显示和更新：它负责将光标的图像数据传递给显示硬件，以便在屏幕上显示光标。它还负责在光标位置发生变化时更新光标的显示。
4. 硬件光标的交互响应：它监听用户的鼠标输入，并将相应的事件传递给应用程序，以实现光标的交互操作，如点击、拖动等。

通过硬件加速的光标显示和操作，drm-cursor 模块提供了更高效、更平滑和更响应的光标体验，从而提升了图形界面的用户体验。

https://github.com/JeffyCN/drm-cursor.git

~~~
git clone  https://github.com/JeffyCN/drm-cursor.git
~~~

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

![image-20231115173657884](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311152100215.png)

# 15.mali编译

https://github.com/JeffyCN/mirrors/tree/libmali

~~~
git clone https://github.com/JeffyCN/mirrors/tree/libmali
~~~

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

~~~
apt-get install pip
pip3 install meson==0.54.0 -i https://pypi.mirrors.ustc.edu.cn/simple/
~~~

![image-20231115173447296](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311152100218.png)

# 16.libv4l-mpp编译(目前没这个，还不需要)

~~~
git clone https://github.com/JeffyCN/libv4l-rkmpp.git
~~~

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~



# 17.gst-rk编译(目前没这个，还不需要)

https://github.com/JeffyCN/mirrors/tree/gstreamer-rockchip

~~~
git clone  https://github.com/JeffyCN/mirrors/tree/gstreamer-rockchip
~~~

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

使用以下命令构建deb包

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

# 18.xserver编译

xserver这个我看瑞芯微并没有提供ubuntu20 和ubuntu22的，所以这里就使用它提供好的xserver来代替。现在就先这样了，也没有其他好办法。首先拉取提供好的源码：

~~~
git clone https://github.com/JeffyCN/xorg-xserver.git
~~~



~~~

~~~

==上面的不对，看了看瑞芯微的直播课找到了方法==

获取ubuntu的xserver源码

~~~
apt-get source xorg-server
~~~

获取rk的xserver源码：

~~~
git clone https://github.com/JeffyCN/xorg-xserver.git
~~~

切换版本，这里切换到1.20.11：

~~~
git checkout remotes/origin/rockchip/debian/1.20.11
~~~

获取补丁包

~~~
git format-patch e4f4521ca
~~~

打补丁的脚本

~~~shell
#!/bin/bash

PATCHES_DIR="$1"  # 补丁文件所在目录
SOURCE_DIR="$2"  # 源码目录

# 检查补丁文件目录是否存在
if [ ! -d "$PATCHES_DIR" ]; then
  echo "补丁文件目录不存在: $PATCHES_DIR"
  exit 1
fi

# 检查源码目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
  echo "源码目录不存在: $SOURCE_DIR"
  exit 1
fi

# 获取补丁文件列表，并按文件名排序
PATCH_FILES=$(find "$PATCHES_DIR" -type f -name "*.patch" | sort)

# 应用每个补丁文件到源码中
for PATCH_FILE in $PATCH_FILES; do
  echo "应用补丁文件: $PATCH_FILE"
  patch -d "$SOURCE_DIR" -p1 --no-backup-if-mismatch -f < "$PATCH_FILE"

  # 检查应用补丁是否成功
  if [ $? -eq 0 ]; then
    echo "补丁文件已成功应用"
  else
    echo "应用补丁文件时出错"
  fi
done
~~~

脚本运行如下所示：
![image-20231116173059788](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144402.png)

到这里就修改完成了，然后加载docker镜像，挂载相应的目录

~~~
docker run --privileged -it -v /home/topeet/tmp/xorg:/home/topeet/ ubuntu20
~~~

接下来修改一些版本号，首先是configure.ac，将原来的1.20.8修改为1.20.13

~~~
sudo vim configure.ac
~~~

![image-20231116141046609](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144390.png)

然后修改meson.build文件，通样修改版本号，修改完成如下图所示：
![image-20231116141249595](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144393.png)

最后修改构建deb包的debain文件，其中的debian/changelog用来控制构建的名称，然后添加上下面这个，这样最后生成的就是对应名称的的包了。

~~~makefile
xorg-server (2:1.20.13-1ubuntu1~20.04.9) focal-security; urgency=medium

  * SECURITY UPDATE: OOB write in XIChangeDeviceProperty and
    RRChangeOutputProperty
    - debian/patches/CVE-2023-5367.patch: fix handling of PropModeAppend
      and PropModePrepend in Xi/xiproperty.c, randr/rrproperty.c.
    - CVE-2023-5367
  * SECURITY UPDATE: Use-after-free bug in DestroyWindow
    - debian/patches/CVE-2023-5380.patch: reset the PointerWindows
      reference on screen switch in dix/enterleave.h, include/eventstr.h,
      mi/mipointer.c.
    - CVE-2023-5380
~~~

到这里就修改完成了，然后加载docker镜像，挂载相应的目录

~~~
docker run --privileged -it -v /home/topeet/:/home/topeet/ ubuntu20
~~~

然后进行构建即可，构建完成如下所示	

~~~
sudo quilt refresh -f
sudo quilt pop -a -f
sudo debian/rules clean
~~~



~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

![image-20231116142000186](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144432.png)

无论是ubuntu20还是ubutnu22应该都能以同样的方式进行构建xserver的包，安装gpu驱动之后会黑屏，这时候上面构建的deb包就需要安装了。

~~~
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

![image-20231116142000186](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144432.png)

自己做的deb包：
1.20.13

~~~
链接：https://pan.baidu.com/s/1237Qxwq0u7s6cJwTDF5oyQ 
提取码：gh2p 
--来自百度网盘超级会员V6的分享
~~~

明天再做ubuntu22的

# 19.firefly 网址

https://wiki.t-firefly.com/zh_CN/Firefly-Linux-Guide/manual_ubuntu.html#shi-pin-ying-jian-bian-jie-ma-zhi-chi

 

# 20.Rockchip Graphics介绍

https://bbs.elecfans.com/jishu_2275817_1_1.html

# 21.ubuntu20 qt的编译

docker加载镜像和源码：

~~~
docker run --privileged -it -v /home/topeet/Linux/qt/:/home/topeet/ ubuntu20
~~~

![image-20231116143753225](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144377.png)

# 22.开发调试流程简介

![image-20231116162242671](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311162144550.png)

Rockchip_Developer_Guide_Third_Party_System_Adaptation_CN.pdf
这个pdf文件很重要。
