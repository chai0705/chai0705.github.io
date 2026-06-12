---
title: 开放麒麟shell脚本解析
date: 2024-08-12 17:17:03
categories:
  - 瑞芯微开发
link: 瑞芯微开发/16_野火sdk学习shell脚本解析
---

> 项目地址：https://gitee.com/openkylin/openkylin-embedded-builder
>
> 开放麒麟官网：[https://www.openkylin.top](https://www.openkylin.top/)
>
> 文档目的：强化shell脚本编写阅读能力，提取开放麒麟文件系统构建脚本
>
> 代码阅读和编译环境：VS code 和 WSL ubuntu22

# 项目仓库的获取

```
COPYgit clone https://gitee.com/openkylin/openkylin-embedded-builder.git
```

![image-20240816133742484](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026560.png)image-20240816133742484

==果然不愧是gitee，果然是比github快的多，就还不错吧==

# 仓库目录文件的分析

 拉取下来之后，仓库的目录和文件内容如下所示：

![image-20240816133930163](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026374.png)image-20240816133930163

上面的这些文件和文件夹中，只有后四个对我们有用，具体作用如下所示：

| 文件和文件夹名称                     | 作用                                             |
| ------------------------------------ | ------------------------------------------------ |
| [check-env.sh](http://check-env.sh/) | 检查文件系统构建的环境，查看依赖是不是安装完成   |
| config                               | 存放一系列的配置文件，和后处理脚本               |
| [functions.sh](http://functions.sh/) | 文件系统的脚本，系统的构建，主要函数都在该脚本中 |
| [okbuild.sh](http://okbuild.sh/)     | 逻辑函数，对一些内容进行判断，这是需要执行的脚本 |

根据我理解的逻辑对，上面提到的这四个文件或文件夹进行分析

# check-env.sh脚本分析

脚本执行过程如下所示：
![image-20240816135726813](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026523.png)image-20240816135726813

首先是将当前用户设置为无密码使用sudo，然后检查了几个工具是否安装，如果没安装就安装上，最后，将okbuild.sh链接到usr/bin目录

```
COPY#!/bin/bash  
  
set -e  # 如果任何语句的执行结果为非真，则立即退出脚本  
  
# 获取当前脚本的绝对路径所在的目录  
CURRENT_DIR=$(dirname "$(readlink -f "$0")")  
# 导入当前目录下的functions.sh脚本  
. "${CURRENT_DIR}"/functions.sh  
  
# 配置sudo权限  
config_sudo  
  
# 检查并安装制作镜像所需的包  
check_package debootstrap  # 检查并安装debootstrap包，用于创建根文件系统  
check_package gdisk        # 检查并安装gdisk包，用于操作GPT分区表  
check_package mtools       # 检查并安装mtools包，用于操作MS-DOS文件系统  
check_package dosfstools   # 检查并安装dosfstools包，用于创建和管理FAT文件系统  
check_package genisoimage  # 检查并安装genisoimage包，用于创建ISO映像文件  
check_package squashfs-tools  # 检查并安装squashfs-tools包，用于创建和管理squashfs文件系统  
check_package xz-utils     # 检查并安装xz-utils包，用于处理XZ格式的压缩文件  
  
# 检查并安装设备树编译器  
check_package device-tree-compiler  
  
# 创建软链接，将okbuild.sh脚本链接到/usr/bin/目录下，使其可以在任何地方被调用  
sudo ln -v -sf "${CURRENT_DIR}"/okbuild.sh /usr/bin/
```

上面用了两个函数，从他们的名字上就可以分析出他们的作用，config_sudo是配置当前用户的sudo免密码权限，而check_package用来检测工具是否安装，这两个函数都定义在functions.sh脚本当中，等等再对这个脚本里的函数进行分析。

# config文件内容分析

config是这里唯一的一个文件夹，这个文件夹里有一些细分的脚本

![image-20240816141742796](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026400.png)image-20240816141742796

可以分成两类，第一类是六个，如下所示：
![image-20240816142830197](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026423.png)image-20240816142830197

这些脚本里面就是安装一些工具，创建openkylin用户，设置中文环境罢了，其他也没啥，而public.sh里面是四个函数，具体内容如下所示：

```
COPY#!/bin/bash

# 仅打印
function MY_LOG() {
    echo " => $*"
}
# 打印 并 执行
function MY_LOG_EXEC() {
    echo " => $*"
    eval "$*"
}

# 执行指定目录下的脚本
function run_scripts() {
    SCRIPTS_DIR="${1}"
    VK_ORDER=${VK_ORDER:-default}

    if [ -d "${SCRIPTS_DIR}" ]; then
        if [ -f "${SCRIPTS_DIR}/${VK_ORDER}" ]; then
            # 按照给定的顺序执行脚本
            for script_name in $(cat ${SCRIPTS_DIR}/${VK_ORDER} | sed '/^#/d'); do
                echo "---> . ${SCRIPTS_DIR}/${script_name}"
                . ${SCRIPTS_DIR}/${script_name} 2>&1 | tee /config/"$(basename ${script_name})".log
            done
        else
            # 按照sort -n排序，执行全部脚本
            for script_name in $(find ${SCRIPTS_DIR} -name "*.sh" | sort -n); do
                echo "---> . ${script_name}"
                . "${script_name}" 2>&1 | tee /config/"$(basename ${script_name})".log
            done
        fi
    fi
}

# 创建用户
function create_user() {
    USERNAME="$1"
    PASSWORD="$2"
    USERID="${3:-1000}"
    if ! awk -F: '{print $1}' /etc/passwd | grep -q ${USERNAME}; then
        useradd -m -s /bin/bash -u ${USERID} "${USERNAME}"
        usermod -c "${USERNAME}" "${USERNAME}"
        echo "${USERNAME}:${PASSWORD}" | chpasswd
        adduser ${USERNAME} sudo
        adduser ${USERNAME} adm
        adduser ${USERNAME} cdrom >/dev/null 2>&1 || true
        adduser ${USERNAME} dip >/dev/null 2>&1 || true
        adduser ${USERNAME} plugdev >/dev/null 2>&1 || true
        adduser ${USERNAME} lpadmin >/dev/null 2>&1 || true
        adduser ${USERNAME} sambashare >/dev/null 2>&1 || true
        adduser ${USERNAME} libvirtd >/dev/null 2>&1 || true
        adduser ${USERNAME} lxd >/dev/null 2>&1 || true
    else
        echo "user ${USERNAME} already exists"
    fi
}

function set_hostname() {
    HOSTNAME="$1"
    echo ${HOSTNAME} >/etc/hostname

    touch /etc/hosts
    if ! grep -q "127.0.0.1 localhost" /etc/hosts; then
        cat >>/etc/hosts <<EOF
127.0.0.1 localhost
127.0.1.1 ${HOSTNAME}
EOF
    fi
}

function install_pkgs() {
    MY_LOG_EXEC apt-get install -y "$*"
}

# 循环单个安装
function install_pkgs_each() {
    for pkg in "$@"; do
        MY_LOG_EXEC apt-get install -y -q "${pkg}"
    done
}

# 结束，收尾
function finish() {
    # 禁止 kylin-virtual-keyboard, ukui-tablet-desktop.desktop 开机不启动
    [ -f "/etc/xdg/autostart/kylin-virtual-keyboard.desktop" ] && mv -v /etc/xdg/autostart/kylin-virtual-keyboard.desktop{,.bak}
    [ -f "/etc/xdg/autostart/ukui-tablet-desktop.desktop" ] && mv -v /etc/xdg/autostart/ukui-tablet-desktop.desktop{,.bak}

    # 删除开始菜单图标
    rm -rf /usr/share/applications/vim.desktop
    rm -rf /usr/share/applications/org.kde.systemmonitor.desktop
    rm -rf /usr/share/applications/org.kde.plasma-systemmonitor.desktop
    rm -rf /usr/share/applications/org.kde.khelpcenter.desktop
    rm -rf /usr/share/applications/mate-user-guide.desktop
    rm -rf /usr/share/applications/yelp.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.telhandler.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.sms.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.kcm.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.app.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.smshandler.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.nonplasma.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect.daemon.desktop
    rm -rf /usr/share/applications/org.kde.kdeconnect_open.desktop
    rm -rf /usr/share/applications/org.kde.kinfocenter.desktop

    set_hostname openkylin

    if [ -f /lib/systemd/system/dnsmasq.service ]; then
        systemctl disable dnsmasq.service
    fi

    # 设置时区
    echo "Asia/Shanghai" >/etc/timezone
    rm -rf /etc/localtime
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

    echo "---> file system make finish"

    export HISTSIZE=0
    rm -rf /var/cache/apt/archives/*.deb
    if (: "${VK_KEEP_VAR_LIB_APT_LISTS}") 2>/dev/null && [ "${VK_KEEP_VAR_LIB_APT_LISTS}" = "y" ]; then
        rm -rf /var/cache/apt/*.bin
        rm -rf /var/lib/apt/lists/*_Packages
        rm -rf /var/lib/apt/lists/*_InRelease
        rm -rf /var/lib/apt/lists/*_Translation*
        rm -rf /root/.bash_history
        rm -rf /tmp/*
        rm -rf ~/.bash_history
    fi
}

# 设置默认语言为中文
function config_zh_cn() {
    cat >/etc/locale.gen <<EOF
zh_CN.UTF-8 UTF-8
en_US.UTF-8 UTF-8
EOF

    cat >/etc/default/locale <<EOF
LANG=zh_CN.UTF-8
LANGUAGE="zh_CN:zh"
EOF

    locale-gen
}

# 设置默认语言为英文
function config_en_utf8() {
    cat >/etc/locale.gen <<EOF
en_US ISO-8859-1
en_US.UTF-8 UTF-8
EOF

    cat >/etc/default/locale <<EOF
LANG=en_US.UTF-8
LANGUAGE="en_US:en"
EOF

    locale-gen
}
```

第三个函数run_scripts和第四个函数create_user需要注意一下，第四个函数可以学习一下，用在我们的构建上，而第三个是重点，根据他的内容可以推测出正是调用了这个函数才真正的调用了下面的这些shell函数：
![image-20240816143742187](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026426.png)image-20240816143742187

这些shell等等再讲解，先来看openkylin目录下的文件，可以将这些文件分为三部分，具体如下所示：
![image-20240816144035365](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026090.png)image-20240816144035365

main.sh可以从名字看出他是最主要的文件，具体内容如下所示：

```
COPY#!/bin/bash  
set -e  
  
# 解析宿主环境传递参数  
for item in $*; do  
    if grep -q "^VK.*=" <<<"${item}"; then  
        KEY=${item%%=*}  # 提取键名  
        VALUE="${item##*=}"  # 提取键值  
        eval "export ${KEY}='${VALUE}'"  # 导出键值对为环境变量  
    fi  
done  
  
# 系统版本信息  
[ -f /etc/os-release ] && source /etc/os-release  # 如果存在系统版本信息文件，则导入  
  
CURRENT_DIR=$(dirname "$(readlink -f "$0")")  # 获取当前脚本的绝对路径  
[ -f "${CURRENT_DIR}"/public.sh ] && . "${CURRENT_DIR}"/public.sh  # 如果存在公共脚本，则导入  
[ -f "${CURRENT_DIR}"/private.sh ] && . "${CURRENT_DIR}"/private.sh  # 如果存在私有脚本，则导入  
  
CURRENT_ARCH=$(dpkg --print-architecture)  # 获取当前系统架构  
  
# 设置内网源  
. "${CURRENT_DIR}"/apt_source-${CURRENT_ARCH}.sh  # 导入对应架构的内网源设置脚本  
  
# 制作系统  
if [ "${VK_CURRENT_TASK}" = "config" ]; then  # 如果当前任务为配置  
    if (: "${VK_UPDATE}") 2>/dev/null && [ "${VK_UPDATE}" = "y" ]; then  # 如果设置了更新标志，并且值为y  
        if [ -f /rootfs.deblist ] && [ ! -f /rootfs-update.deblist ]; then  # 如果存在基础包列表文件，且不存在更新后的列表文件  
            # 升级基础包  
            for pkg in $(awk '{print $1}' /rootfs.deblist); do  # 遍历基础包列表  
                MY_LOG_EXEC apt-get install -y -q --allow-downgrades ${pkg}  # 安装或降级包  
            done  
            # 升级后的列表  
            dpkg-query -W --showformat='${Package} ${Version}\n' >/rootfs-update.deblist  # 生成更新后的列表文件  
            rm -rf /var/cache/apt/archives/*.deb  # 清理下载的包文件  
        fi  
    fi  
  
    run_scripts "${CURRENT_DIR}"/shells  # 执行shell脚本目录下的所有脚本  
else  
    . "${CURRENT_DIR}"/${VK_CURRENT_TASK}.sh  # 导入并执行当前任务对应的脚本  
fi  
  
# 设置公网源  
. "${CURRENT_DIR}"/apt_public-${CURRENT_ARCH}.sh  # 导入对应架构的公网源设置脚本  
  
finish  # 执行结束操作
```

然后是内网源和公网源的，这里我还没看懂到底是啥意思，为社么要设置两次呢，这里不是很理解，等等再说吧，而第39行终于是调用了前面提到的run_scripts，调用shell下的一系列内容。

最后是以prop开头的一系列文件，根据内容开看这是一系列的配置文件，以树莓派4b的配置文件为例，可以看到有以下内容：
![image-20240816145605421](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026104.png)image-20240816145605421

分别记录了版本状态、主板标识、架构、执行顺序、执行任务等等，现在还不知道是哪里用到了这个配置文件，但肯定是用到了，后面对于编译流程的分析过程中再来讲解，最后来看shells文件夹里的脚本，如下所示：
![image-20240816145829922](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026080.png)image-20240816145829922

同样是根据名字进行推理，前面六个脚本可以分成一类，是文件系统设置的脚本，而后面六个可以分成一类，根据不同的开发板来决定都调用前面哪几个脚本，然后来对前面这几个脚本进行分析

```
COPY#!/bin/bash

PKGS=(
    # base tools
    apt-utils
    kmod
    kbd
    whiptail
    locales

    systemd-resolved

    # extra tools
    vim
    lsof
    cpio
    file
    sudo
    tree
    wget
    rsync
    fdisk
    gdisk
    parted
    psmisc
    rsyslog
    dosfstools
    lsb-release
    archdetect-deb
    bash-completion
    zstd
)

install_pkgs "${PKGS[@]}"
```

1-tools.sh就是安装一点软件而已，[然后看2-net.sh](http://xn--2-net-408hr55ok0j.sh/)，其实也就是安装了一点网络相关的软件，具体内容如下所示：

```
COPY#!/bin/bash

PKGS=(
    iputils-ping iproute2 net-tools
    network-manager
    wpasupplicant

    # ssh
    openssh-server
    openssh-client
)

install_pkgs "${PKGS[@]}"
```

[然后来看3-ukui.sh](http://xn--3-ukui-9h6jv19jfqswkn.sh/)，也是装一些工具，他这里的工具主要是关于桌面配置相关的东西，具体内容如下所示：

```
COPY#!/bin/bash

PKGS=(
    xinit lightdm xdg-user-dirs ukui-control-center ukui-desktop-environment ukui-desktop-environment-core ukui-greeter openkylin-wallpapers
    ukui-globaltheme-heyin
    libukuiinputgatherclient1 xserver-xorg-video-fbdev
    xserver-xorg-input-all

    # 网络设置
    network-manager-gnome

    # 便签
    ukui-notebook libqt5sql5-sqlite
    # 屏幕键盘
    onboard python3-xdg
    # VNC工具
    remmina remmina-plugin-vnc

    kylin-daq
    kylin-app-manager
)

install_pkgs "${PKGS[@]}"

# lite-ukui-config
if apt-cache policy lite-ukui-config | grep -q lite-ukui-config; then
    apt-get install -y lite-ukui-config
fi
```

[然后是4-grub.sh](http://xn--4-grub-9h6jv11j4zu.sh/)，我到现在也不知道grub是做什么的，但是看内容是只有amd64的才需要，就不管了。

```
COPY#!/bin/bash

CURRENT_ARCH=$(dpkg --print-architecture)

if [ "${CURRENT_ARCH}" == "amd64" ]; then
    PKGS=(
        grub-efi
        grub-common
        grub2-common
        # label.so
        plymouth-label
    )

    install_pkgs "${PKGS[@]}"
fi
```

[然后看5-kernel.sh](http://xn--5-kernel-kf1np64ujon.sh/)，根据内容就知道这是内核的构建，忽略即可，无需理会。[最后来看9-lash.sh](http://xn--9-lash-9h6js56j9zau85i.sh/)，这里就是设置了一下允许root登录，以及设置网络配置文件，其他就没啥了

```
COPY#!/bin/bash

# NetworkManager
if [ -d /etc/NetworkManager/conf.d ]; then
    touch /etc/NetworkManager/conf.d/10-globally-managed-devices.conf
fi

# ssh allow root login
{
    if [ -f /etc/ssh/sshd_config ]; then
        if ! grep -q "^PermitRootLogin yes$" /etc/ssh/sshd_config; then
            sed -i.bak '/PermitRootLogin/d' /etc/ssh/sshd_config
            echo 'PermitRootLogin yes' >>/etc/ssh/sshd_config
        fi
    fi
}
```

到这里关于config文件就分析的差不多了。

# okbuild.sh脚本分析

这个脚本就是最开始运行的构建脚本，一切以这个为开始，但是呢，这个脚本实际上并没有什么用，因为我只需要文件系统构建的地方即可，这里的内容有些空虚了，具体内容如下所示：

```
COPY#!/bin/bash
set -e

CURRENT_FILE=$(readlink -f "$0")
CURRENT_DIR=$(dirname "${CURRENT_FILE}")
# 函数库 优先级 1
. "${CURRENT_DIR}"/functions.sh

function usage() {
    echo -en "USAGE:
$(basename "$0") -p prop_chilliepi  # 双椒派
$(basename "$0") -p prop_lotus2     # lotus2开发板

$(basename "$0") -p prop_rpi4b      # 树莓派4B
$(basename "$0") -p prop_vf2        # VisionFive2

$(basename "$0") -p prop_phytiumpi_2G  # 飞腾派 2GB 版本
$(basename "$0") -p prop_phytiumpi_4G  # 飞腾派 4GB 版本
"
    exit 1
}

# 判断参数个数
if [ $# -eq 0 ]; then
    usage
fi

# 配置sudo免密
if [ "$(id -nu)" != "root" ]; then
    sudo tee "/etc/sudoers.d/${USER}" <<EOF
$USER ALL=(ALL:ALL) NOPASSWD: ALL
EOF
fi

ARGS=$(getopt -a -o h,p: -l help,conf:,prop:,mirror:,suite:,name:,arch:,debdir:,tasks:,version: -- "$@")
eval set -- "${ARGS}"

# 参数 优先级 1
while true; do
    case "$1" in
    -h | --help)
        usage
        shift
        ;;
    -p | --prop)
        PROP=$2
        shift
        ;;
    --arch)
        VK_ARCH=$2
        shift
        ;;
    --tasks)
        VK_TASKS=$2
        shift
        ;;
    --)
        break
        ;;
    esac
    shift
done

# 默认选用base目录
CONF=${CONF:-openkylin}

if [ ! -d "${CURRENT_DIR}/config/${CONF}" ]; then
    color_error "${CURRENT_DIR}/config/${CONF} not exist!!"
    usage
fi

# 参数 优先级 2
if [ -f "${CURRENT_DIR}/config/${CONF}/${PROP:-default.prop}" ]; then
    . "${CURRENT_DIR}/config/${CONF}/${PROP:-default.prop}"
fi

# 参数 优先级 3
for item in "$@"; do
    if grep -q "^VK.*=" <<<"${item}"; then
        KEY=${item%%=*}
        VALUE="${item##*=}"
        eval "export ${KEY}='${VALUE}'"
    fi
done

# 参数 优先级 4
if [ -f "${CURRENT_DIR}/config/${CONF}/${VK_ENV}" ]; then
    . "${CURRENT_DIR}/config/${CONF}/${VK_ENV}"
fi

# 是否保留镜像制作目录
VK_KEEP_IMAGE_DIR=${VK_KEEP_IMAGE_DIR:-y}

VK_ARCH=${VK_ARCH:-arm64}
VK_MIRROR=${VK_MIRROR:-http://archive.build.openkylin.top/openkylin}
VK_SUITE=${VK_SUITE:-yangtze}
VK_VERSION=${VK_VERSION:-test}

ROOTFS_DIR="openKylin"
if [ -n "${VK_VERSION}" ]; then
    ROOTFS_DIR="${ROOTFS_DIR}-${VK_VERSION}"
fi
if [ -n "${VK_TERMINAL}" ]; then
    ROOTFS_DIR="${ROOTFS_DIR}-${VK_TERMINAL}"
fi
if [ -n "${VK_BOARD}" ]; then
    ROOTFS_DIR="${ROOTFS_DIR}-${VK_BOARD}"
fi
if [ -n "${VK_ARCH}" ]; then
    ROOTFS_DIR="${ROOTFS_DIR}-${VK_ARCH}"
fi

# 函数库 优先级 2
if [ -f "${CURRENT_DIR}/config/${CONF}/functions.sh" ]; then
    . "${CURRENT_DIR}/config/${CONF}/functions.sh"
fi

color_info "---> args"
set | grep "^VK_" | tee "${ROOTFS_DIR}.prop"

function exit_function() {
    umount_target "${ROOTFS_DIR}"
    umount_target "${ROOTFS_DIR}-iso/${ROOTFS_DIR}"
    umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"

    umount_target ./p1
    umount_target ./p2
    umount_target ./p3

    umount_target "${ROOTFS_DIR}-target"
}

trap "exit_function" 0

umount_target "${ROOTFS_DIR}"

if [ -z "${VK_TASKS}" ]; then
    color_error "---> no task to do!!"
    usage
fi

# 判断是否支持此架构
if ! echo "${VK_ARCH}" | grep -q -E "amd64|arm64|loongarch64|i386|riscv64"; then
    color_error "not support 'ARCH: ${VK_ARCH}'"
    exit
fi

# x86上制作其他架构, 需安装 binfmt-support,qemu-user-static
if [ "$(dpkg --print-architecture)" == "amd64" ] && [ "${VK_ARCH}" != "amd64" ]; then
    check_package binfmt-support
    check_package qemu-user-static
elif [ "$(dpkg --print-architecture)" != "${VK_ARCH}" ]; then
    # 非x86, 提示不能制作其他架构
    color_error "current os is $(dpkg --print-architecture), don't support ${VK_ARCH}!!"
    exit
fi

# 执行任务
##################################################
for task in ${VK_TASKS//,/ }; do
    color_info "---> do_${task}"
    export VK_CURRENT_TASK="${task}"
    do_"${task}"
done | tee "${ROOTFS_DIR}.log"
##################################################
```

判断了，确实没有什么需要学习的地方

# functions.sh脚本分析

这里面的内容有点多，我先将每个函数隔离出来

## 函数 config_sudo

```
COPY# 配置sudo免密
function config_sudo() {
    if [ $(id -u) != 0 ]; then
        sudo tee /etc/sudoers.d/$USER <<EOF
$USER ALL=(ALL:ALL) NOPASSWD: ALL
EOF
    fi
}
```

## 函数 check_package

```
COPY# 检查是否安装指定包
function check_package() {
    pkg_name="$1"
    if [ -n "${pkg_name}" ]; then
        if ! dpkg -l | grep "^ii  ${pkg_name}"; then
            sudo apt-get install -y -qq "${pkg_name}"
        fi
    fi
}
```

## 函数 mount_host_to_target

```
COPY# 宿主机挂载 设备节点 到 rootfs
function mount_host_to_target() {
    sudo mount --bind /dev ${1}/dev
    sudo mount --bind /run ${1}/run
    sudo mount -t devpts devpts ${1}/dev/pts
    sudo mount -t proc proc ${1}/proc
    sudo mount -t sysfs sysfs ${1}/sys
}
```

## 函数 umount_target

```
COPY# 卸载宿主设备节点
function umount_target() {
    sudo umount -l ${1}/* >/dev/null 2>&1 || true
    sudo umount ${1} >/dev/null 2>&1 || true
}
```

## 函数 do_rootfs

```
COPY# 制作基础根文件系统
function do_rootfs() {
    # 先删除 原有 rootfs 目录
    if [ ! -f "${ROOTFS_DIR}.done" ]; then
        umount_target "${ROOTFS_DIR}"
        MY_LOG_EXEC "sudo rm -rf ${ROOTFS_DIR}"

        # debootstrap 参数
        DEBOOTSTRAP_ARGS="--no-check-gpg --variant=minbase --arch=${VK_ARCH} --components=main --include=openkylin-keyring,systemd-sysv ${VK_SUITE} ${ROOTFS_DIR} ${VK_MIRROR} gutsy"

        # 制作 rootfs
        MY_LOG_EXEC "sudo debootstrap ${DEBOOTSTRAP_ARGS}"

        # 记录基础rootfs的包列表，给第2步升级包版本用
        # sudo chroot "${ROOTFS_DIR}" bash -c "dpkg-query -W --showformat='\${Package} \${Version}\n' > /rootfs.deblist"
        # cp "${ROOTFS_DIR}"/rootfs.deblist "${ROOTFS_DIR}".rootfs.deblist
        sudo chroot "${ROOTFS_DIR}" bash -c "dpkg-query -W --showformat='\${Package} \${Version}\n'" >"${ROOTFS_DIR}".rootfs.deblist

        sudo rm -rf ${ROOTFS_DIR}/var/cache/apt/archives/*.deb
        if (: "${VK_KEEP_VAR_LIB_APT_LISTS}") 2>/dev/null && [ "${VK_KEEP_VAR_LIB_APT_LISTS}" = "y" ]; then
            sudo rm -rf ${ROOTFS_DIR}/var/cache/apt/*.bin
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_Packages
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_InRelease
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_Translation*
            sudo rm -rf ${ROOTFS_DIR}/root/.bash_history
            sudo rm -rf ${ROOTFS_DIR}/tmp/*
        fi

        # rootfs制作完成
        MY_LOG_EXEC "touch ${ROOTFS_DIR}.done"
    fi
}
```

## 函数 do_config

```
COPY# 进入根文件系统进行安装、配置
function do_config() {
    # 需要升级基础rootfs
    if (: "${VK_UPDATE}") 2>/dev/null && [ "${VK_UPDATE}" = "y" ] && [ "${VK_CURRENT_TASK}" = "config" ] && [ ! -f "${ROOTFS_DIR}.rootfs-update.deblist" ]; then
        MY_LOG_EXEC "sudo cp -v ${ROOTFS_DIR}.rootfs.deblist ${ROOTFS_DIR}/rootfs.deblist"
    fi

    # 挂载
    umount_target "${ROOTFS_DIR}"
    mount_host_to_target ${ROOTFS_DIR}

    # 拷贝配置到 ${ROOTFS_DIR}/config
    sudo rm -rf ${ROOTFS_DIR}/config
    sudo mkdir -p ${ROOTFS_DIR}/config
    sudo cp -v ${CURRENT_DIR}/config/*.sh ${ROOTFS_DIR}/config/
    if [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        sudo cp -r ${CURRENT_DIR}/config/${CONF}/. ${ROOTFS_DIR}/config/
        # 制作
        sudo chroot ${ROOTFS_DIR} /usr/bin/env -i \
            PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
            HOME=/root \
            LC_ALL=C \
            DEBIAN_FRONTEND=noninteractive \
            APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn \
            bash -euo pipefail /config/main.sh "$(set | grep "^VK_" | xargs)"
    else
        echo "'config/${CONF}' not exits!"
    fi

    # 卸载
    umount_target ${ROOTFS_DIR}

    # 参考分析用
    sudo rm -rf ${ROOTFS_DIR}-config
    # sudo cp -rf -a ${ROOTFS_DIR}/config ${ROOTFS_DIR}-config
    sudo rm -rf ${ROOTFS_DIR}/config

    # 记录包列表
    if [ "${VK_CURRENT_TASK}" == "config" ]; then
        sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${ROOTFS_DIR}.deblist
    fi

    # 删除 update 包列表
    if [ -f "${ROOTFS_DIR}"/rootfs-update.deblist ] && [ ! -f "${ROOTFS_DIR}".rootfs-update.deblist ]; then
        cp -v "${ROOTFS_DIR}"/rootfs-update.deblist "${ROOTFS_DIR}".rootfs-update.deblist
    fi
    sudo rm -v -rf "${ROOTFS_DIR}"/rootfs*.deblist
}
```

## 函数 do_tar

```
COPY# 将 rootfs 打为 tar 包
function do_tar() {
    MY_LOG_EXEC "sudo tar zcf ${ROOTFS_DIR}.tar.gz --numeric-owner -C ${ROOTFS_DIR} ."
    md5sum ${ROOTFS_DIR}.tar.gz >${ROOTFS_DIR}.tar.gz.md5
}
```

## 函数 do_iso

```
COPY# 制作iso文件
function do_iso() {
    umount_target "${ROOTFS_DIR}-${VK_CURRENT_TASK}/${ROOTFS_DIR}"
    sudo rm -rf "${ROOTFS_DIR}-${VK_CURRENT_TASK}"
    mkdir -pv "${ROOTFS_DIR}-${VK_CURRENT_TASK}"
    sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-${VK_CURRENT_TASK}"
    pushd "${ROOTFS_DIR}-${VK_CURRENT_TASK}"

    do_config

    # 记录包列表
    sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${ROOTFS_DIR}.${VK_CURRENT_TASK}.deblist

    # 镜像名称
    ISO_FILENAME="${ROOTFS_DIR}.iso"
    CDROM_DIR="${ROOTFS_DIR}-cdrom"

    sudo rm -rf ${CDROM_DIR}
    mkdir -pv ${CDROM_DIR}/{casper,boot/grub,EFI/BOOT}

    # 拷贝 内核 和 initrd
    if [ -f ${ROOTFS_DIR}/boot/vmlinuz ] && [ -f ${ROOTFS_DIR}/boot/initrd.img ]; then
        # 标准内核情况
        sudo cp -v ${ROOTFS_DIR}/boot/vmlinuz ${CDROM_DIR}/casper/vmlinuz
        sudo cp -v ${ROOTFS_DIR}/boot/initrd.img ${CDROM_DIR}/casper/initrd.lz
    else
        # 没有内核软链接文件的情况
        VMLINUXZ=$(sudo find ${ROOTFS_DIR}/boot -name "vmlinuz*" | head -n1)
        INITRD_IMG=$(sudo find ${ROOTFS_DIR}/boot -name "initrd*" | head -n1)
        sudo cp -v ${VMLINUXZ} ${CDROM_DIR}/casper/vmlinuz
        sudo cp -v ${INITRD_IMG} ${CDROM_DIR}/casper/initrd.lz
    fi

    echo "---> mksquash"
    [ -f ${CDROM_DIR}/casper/filesystem.squashfs ] && sudo rm -rf ${CDROM_DIR}/casper/filesystem.squashfs
    [ -f ${CDROM_DIR}/casper/filesystem.squashfs ] || sudo mksquashfs ${ROOTFS_DIR} ${CDROM_DIR}/casper/filesystem.squashfs -quiet # -comp xz -no-progress
    printf $(sudo du -sx --block-size=1 ${ROOTFS_DIR} | cut -f1) >${CDROM_DIR}/casper/filesystem.size

    # iso grub菜单项
    cat >${CDROM_DIR}/boot/grub/grub.cfg <<EOF
set default=0
set timeout=3

set color_normal=white/black
set color_highlight=black/light-gray

menuentry "install openkylin" {
    linux   /casper/vmlinuz boot=casper only-ubiquity locale=zh_CN quiet splash
    initrd  /casper/initrd.lz
}
EOF

    if [ "${VK_ARCH}" = "arm64" ]; then
        EFINAME="bootaa64.efi"
    elif [ "${VK_ARCH}" = "amd64" ]; then
        EFINAME="bootx64.efi"
    fi

    # efi
    if [ -f "${CURRENT_DIR}/${EFINAME}" ]; then
        cp -v ${CURRENT_DIR}/${EFINAME} ${CDROM_DIR}/EFI/BOOT/${EFINAME}
    fi

    dd if=/dev/zero of=${CDROM_DIR}/boot/grub/efi.img bs=1M count=10
    mkfs.vfat ${CDROM_DIR}/boot/grub/efi.img
    mmd -i ${CDROM_DIR}/boot/grub/efi.img efi efi/boot
    mcopy -i ${CDROM_DIR}/boot/grub/efi.img ${CDROM_DIR}/EFI/BOOT/${EFINAME} ::efi/boot/

    [ -d ${CURRENT_DIR}/config/cdrom ] && cp -r ${CURRENT_DIR}/config/cdrom/. ${CDROM_DIR}

    sudo mkisofs -input-charset utf-8 -J -r -V openKylin -eltorito-alt-boot -e boot/grub/efi.img -no-emul-boot -o ${ISO_FILENAME} ${CDROM_DIR}
    md5sum "${ISO_FILENAME}" >"${ISO_FILENAME}".md5
    cp -rf "${ISO_FILENAME}"* ..
    cp -rf ./*.deblist ..

    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        cp -rf ${ISO_FILENAME}* ..
        cp -rf *.deblist ..
        popd
    fi

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 ${VK_CURRENT_TASK} 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-${VK_CURRENT_TASK}"
    else
        echo "---> 保留 ${ROOTFS_DIR}-${VK_CURRENT_TASK} 制作目录"
    fi
}
```

## 具体硬件构建

```
COPY# 双椒派 镜像
function do_img_chilliepi() {
    umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"
    sudo rm -rf "${ROOTFS_DIR}-img"
    mkdir -pv "${ROOTFS_DIR}-img"
    sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-img"
    pushd "${ROOTFS_DIR}-img"

    do_config

    # 磁盘文件名
    IMAGE_FILE="${ROOTFS_DIR}.img"

    # 记录包列表
    sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${IMAGE_FILE}.deblist

    # 计算rootfs目录大小
    dusize=$(sudo du -sm ${ROOTFS_DIR} | awk '{print $1}')
    size=$((${dusize} + 128 + 2048))

    dd if=/dev/zero of="${IMAGE_FILE}" bs=1M count=${size} status=progress

    # boot分区
    sgdisk -n 0:0:+128M -c 0:boot "${IMAGE_FILE}" >/dev/null
    # 根分区
    sgdisk -n 0:0:0 -c 0:root "${IMAGE_FILE}" >/dev/null

    # sgdisk -p "${IMAGE_FILE}"

    DISK_PATH=$(readlink -f "${IMAGE_FILE}")
    LOOP_DEV=$(losetup -l -O NAME,BACK-FILE | grep "${DISK_PATH}" | awk '{print $1}')

    if [ -z "${LOOP_DEV}" ]; then
        LOOP_DEV=$(sudo losetup -f)
        # 将镜像关联到loop设备上
        sudo losetup -P ${LOOP_DEV} "${IMAGE_FILE}"
        # sudo partprobe ${LOOP_DEV}
    fi
    echo ${LOOP_DEV}

    # 格式化分区
    yes | sudo mkfs.vfat -n BOOT ${LOOP_DEV}p1
    yes | sudo mkfs.ext4 -Fq -L ROOT ${LOOP_DEV}p2

    part1_uuid=$(sudo blkid -s UUID -o value ${LOOP_DEV}p1)
    part2_uuid=$(sudo blkid -s UUID -o value ${LOOP_DEV}p2)

    echo part1_uuid=${part1_uuid}
    echo part2_uuid=${part2_uuid}

    # 拷贝文件
    mkdir -p {p1,p2}
    sudo mount ${LOOP_DEV}p1 ./p1/
    sudo mount ${LOOP_DEV}p2 ./p2/

    # copy boot
    sudo cp -v -rf -a ${ROOTFS_DIR}/boot/. ./p1/

    echo "---> copy rootfs"
    sudo cp -rf -a ${ROOTFS_DIR}/. ./p2/

    echo "---> generate fstab"
    sudo tee ./p2/etc/fstab <<EOF
UUID=${part2_uuid}   /           ext4    rw,relatime 0 1
UUID=${part1_uuid}   /boot       vfat    nodev,noexec,rw   0       2
EOF

    sudo umount ./p1 ./p2
    rmdir p1 p2
    sudo losetup -d ${LOOP_DEV}

    xz -zkv --extreme --threads=0 ${IMAGE_FILE}
    md5sum ${IMAGE_FILE}.xz >${IMAGE_FILE}.xz.md5

    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        cp -rf ${IMAGE_FILE}.xz* ..
        cp -rf *.deblist ..
        popd
    fi

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 img 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-img"
    else
        echo "---> 保留 ${ROOTFS_DIR}-img 制作目录"
    fi
}

# 树莓派 4B
function do_img_rpi4b() {
    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"
        sudo rm -rf "${ROOTFS_DIR}-img"
        mkdir -pv "${ROOTFS_DIR}-img"
        sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-img"
        pushd "${ROOTFS_DIR}-img"

        do_config
    fi

    # 磁盘文件名
    IMAGE_FILE="${ROOTFS_DIR}.img"

    # 记录包列表
    sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${IMAGE_FILE}.deblist

    # 计算rootfs目录大小
    dusize=$(sudo du -sm ${ROOTFS_DIR} | awk '{print $1}')
    size=$((${dusize} + 128 + 1024))

    dd if=/dev/zero of="${IMAGE_FILE}" bs=1M count=${size} status=progress
    parted -s ${IMAGE_FILE} mktable msdos
    parted -s ${IMAGE_FILE} mkpart primary fat32 1MiB 128MiB
    parted -s ${IMAGE_FILE} mkpart primary ext4 128MiB 100%
    parted -s ${IMAGE_FILE} set 1 boot on

    DISK_PATH=$(readlink -f "${IMAGE_FILE}")
    LOOP_DEV=$(losetup -l -O NAME,BACK-FILE | grep "${DISK_PATH}" | awk '{print $1}')

    if [ -z "${LOOP_DEV}" ]; then
        LOOP_DEV=$(sudo losetup -f)
        # 将镜像关联到loop设备上
        sudo losetup -P ${LOOP_DEV} "${IMAGE_FILE}"
        # sudo partprobe ${LOOP_DEV}
    fi
    echo ${LOOP_DEV}

    # 格式化分区
    yes | sudo mkfs.vfat -n BOOT -F 32 ${LOOP_DEV}p1
    yes | sudo mkfs.ext4 -Fq -L ROOT ${LOOP_DEV}p2

    part1_uuid=$(sudo blkid -s UUID -o value ${LOOP_DEV}p1)
    part2_uuid=$(sudo blkid -s UUID -o value ${LOOP_DEV}p2)

    echo part1_uuid=${part1_uuid}
    echo part2_uuid=${part2_uuid}

    ROOT_TARGET="${ROOTFS_DIR}-target"
    mkdir -pv ${ROOT_TARGET}
    sudo mount ${LOOP_DEV}p2 ${ROOT_TARGET}
    sudo mkdir -p ${ROOT_TARGET}/boot
    sudo mount ${LOOP_DEV}p1 ${ROOT_TARGET}/boot

    echo "---> copy rootfs"
    sudo cp -rf -a ${ROOTFS_DIR}/. ./${ROOT_TARGET}/

    echo "---> generate fstab"
    sudo tee ${ROOT_TARGET}/etc/fstab <<EOF
UUID=${part2_uuid}   /           ext4    rw,relatime 0 1
UUID=${part1_uuid}   /boot       vfat    nodev,noexec,rw   0       2
EOF

    # copy boot
    git clone https://gitee.com/openkylin/bootfiles-embedded.git
    sudo cp -v -rf ./bootfiles-embedded/rpi4b/boot/. ./${ROOT_TARGET}/boot

    sudo tee ./${ROOT_TARGET}/boot/cmdline.txt <<EOF
console=ttyAMA0,115200 kgdboc=ttyAMA0,115200 root=/dev/mmcblk0p2 rootfstype=ext4 rootwait
EOF

    sudo tee ./${ROOT_TARGET}/boot/config.txt <<EOF
[all]
kernel=vmlinuz-5.15.92-v8+
cmdline=cmdline.txt

[pi4]
max_framebuffers=2
arm_boost=1
dtoverlay=vc4-fkms-v3d

[all]
dtparam=audio=on
dtparam=i2c_arm=on
dtparam=spi=on
disable_overscan=1
dtoverlay=vc4-kms-v3d
dtoverlay=dwc2
camera_auto_detect=1
display_auto_detect=1
arm_64bit=1
dtparam=audio=on
enable_uart=1
enable_gic=1
dtoverlay=pi3-miniuart-bt
force_turbo=1
EOF

    sync

    sudo umount ${ROOT_TARGET}/boot
    sudo umount ${ROOT_TARGET}
    sudo losetup -d ${LOOP_DEV}

    xz -zkv --extreme --threads=0 ${IMAGE_FILE}
    md5sum ${IMAGE_FILE}.xz >${IMAGE_FILE}.xz.md5

    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        cp -rf ${IMAGE_FILE}.xz* ..
        cp -rf *.deblist ..
        popd
    fi

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 img 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-img"
    else
        echo "---> 保留 ${ROOTFS_DIR}-img 制作目录"
    fi
}

function do_img_vf2() {
    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"
        sudo rm -rf "${ROOTFS_DIR}-img"
        mkdir -pv "${ROOTFS_DIR}-img"
        sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-img"
        pushd "${ROOTFS_DIR}-img"

        do_config
    fi

    # 磁盘文件名
    IMAGE_FILE="${ROOTFS_DIR}.img"

    # 记录包列表
    sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${IMAGE_FILE}.deblist

    # 计算rootfs目录大小
    dusize=$(sudo du -sm ${ROOTFS_DIR} | awk '{print $1}')
    size=$((${dusize} + 64 + 256))

    dd if=/dev/zero of="${IMAGE_FILE}" bs=1M count=${size} status=progress

    sgdisk --clear --set-alignment=2 \
        --new=1:4096:8191 --change-name=1:spl --typecode=1:2E54B353-1271-4842-806F-E436D6AF6985 \
        --new=2:8192:16383 --change-name=2:uboot --typecode=2:BC13C2FF-59E6-4262-A352-B275FD6F7172 \
        --new=3:16384:+64M --change-name=3:system --typecode=3:EBD0A0A2-B9E5-4433-87C0-68B6B72699C7 \
        --new=4:0:-0 --change-name=4:rootfs --typecode=4:0x8300 \
        "${IMAGE_FILE}"

    DISK_PATH=$(readlink -f "${IMAGE_FILE}")
    LOOP_DEV=$(losetup -l -O NAME,BACK-FILE | grep "${DISK_PATH}" | awk '{print $1}')

    if [ -z "${LOOP_DEV}" ]; then
        LOOP_DEV=$(sudo losetup -f)
        # 将镜像关联到loop设备上
        sudo losetup -P ${LOOP_DEV} "${IMAGE_FILE}"
        # sudo partprobe ${LOOP_DEV}
    fi
    echo ${LOOP_DEV}

    # spl and uboot for vf2
    U_BOOT_SPL="https://www.openkylin.top/public/software/Embedded/visionfive2/u-boot-spl.bin.normal.out"
    U_BOOT_FILE="https://www.openkylin.top/public/software/Embedded/visionfive2/visionfive2_fw_payload.img"
    wget -qO- ${U_BOOT_SPL} | sudo dd of=${LOOP_DEV}p1 status=progress
    wget -qO- ${U_BOOT_FILE} | sudo dd of=${LOOP_DEV}p2 status=progress

    # 格式化分区
    sudo mkfs.vfat ${LOOP_DEV}p3
    sudo mkfs.ext4 ${LOOP_DEV}p4
    sudo dosfslabel ${LOOP_DEV}p3 BOOT
    sudo e2label ${LOOP_DEV}p4 ROOT

    ROOT_TARGET="${ROOTFS_DIR}-target"
    mkdir -pv ${ROOT_TARGET}
    # mount root partition
    sudo mount ${LOOP_DEV}p4 ${ROOT_TARGET}
    sudo mkdir -p ${ROOT_TARGET}/boot
    sudo mount ${LOOP_DEV}p3 ${ROOT_TARGET}/boot

    echo "---> copy rootfs"
    sudo cp -rf -a ${ROOTFS_DIR}/. ./${ROOT_TARGET}/

    echo "---> generate fstab"
    sudo tee ${ROOT_TARGET}/etc/fstab <<EOF
# <file system> <mount point>   <type>  <options>       <dump>  <pass> 
LABEL=ROOT  /               ext4    errors=remount-ro 0       1
LABEL=BOOT  /boot           vfat    nodev,noexec,rw   0       2
EOF

    # uEnv.txt
    echo "---> generate uEnv.txt"
    sudo tee "${ROOT_TARGET}"/boot/uEnv.txt <<EOF
fdt_high=0xffffffffffffffff
initrd_high=0xffffffffffffffff
kernel_addr_r=0x44000000
kernel_comp_addr_r=0x90000000
kernel_comp_size=0x10000000
fdt_addr_r=0x48000000
ramdisk_addr_r=0x48100000
# Move distro to first boot to speed up booting
boot_targets=distro mmc0 dhcp
# Fix wrong fdtfile name
fdtfile=starfive/jh7110-visionfive-v2.dtb
# Fix missing bootcmd
#bootcmd=run load_distro_uenv;run bootcmd_distro
EOF

    sudo touch "${ROOT_TARGET}"/boot/vf2_uEnv.txt

    # extlinux.conf
    echo "---> generate extlinux.conf"
    sudo mkdir -p ${ROOT_TARGET}/boot/extlinux
    sudo tee ${ROOT_TARGET}/boot/extlinux/extlinux.conf <<EOF
default openkylin
menu title openkylin
prompt 0
timeout 50

label openkylin
	menu label openkylin
	linux /vmlinuz-5.10.79+
	initrd /initrd.img-5.10.79+
	
	fdtdir /dtbs
	append  root=/dev/mmcblk1p4 rw rootwait console=ttyS0,115200 earlycon rootwait
EOF

    # umount
    sudo umount ${ROOT_TARGET}/boot
    sudo umount ${ROOT_TARGET}
    sudo losetup -d ${LOOP_DEV}

    xz -zkv --extreme --threads=0 ${IMAGE_FILE}
    md5sum ${IMAGE_FILE}.xz >${IMAGE_FILE}.xz.md5

    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        cp -rf ${IMAGE_FILE}.xz* ..
        cp -rf *.deblist ..
        popd
    fi

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 img 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-img"
    else
        echo "---> 保留 ${ROOTFS_DIR}-img 制作目录"
    fi
}

function do_img_lotus2() {
    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"
        sudo rm -rf "${ROOTFS_DIR}-img"
        mkdir -pv "${ROOTFS_DIR}-img"
        sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-img"
        pushd "${ROOTFS_DIR}-img"

        do_config
    fi

    MY_LOG_EXEC "sudo tar zcf ${ROOTFS_DIR}.tar.gz -C ${ROOTFS_DIR} ."
    md5sum ${ROOTFS_DIR}.tar.gz >${ROOTFS_DIR}.tar.gz.md5
    cp -rf ${ROOTFS_DIR}.tar.gz* ..
    popd

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 img 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-img"
    else
        echo "---> 保留 ${ROOTFS_DIR}-img 制作目录"
    fi
}

# 飞腾派
function do_img_phytiumpi() {
    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        umount_target "${ROOTFS_DIR}-img/${ROOTFS_DIR}"
        sudo rm -rf "${ROOTFS_DIR}-img"
        mkdir -pv "${ROOTFS_DIR}-img"
        sudo cp -rf -a "${ROOTFS_DIR}" "${ROOTFS_DIR}-img"
        pushd "${ROOTFS_DIR}-img"

        do_config
    fi

    # 磁盘文件名
    IMAGE_FILE="${ROOTFS_DIR}.img"

    echo "---> use ${VK_UBOOT_FILE}"

    # 记录包列表
    sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${IMAGE_FILE}.deblist

    # 计算rootfs目录大小
    dusize=$(sudo du -sm ${ROOTFS_DIR} | awk '{print $1}')
    size=$((${dusize} + 1024))

    # 文件系统放在ext4文件中
    dd if=/dev/zero of="${ROOTFS_DIR}.ext4" bs=1M count=${size} status=progress
    # 格式化ext4
    MY_LOG_EXEC "yes | sudo mkfs.ext4 -Fq -L ROOT ${ROOTFS_DIR}.ext4"

    ROOT_TARGET="${ROOTFS_DIR}-target"
    mkdir -pv ${ROOT_TARGET}
    MY_LOG_EXEC "sudo mount ${ROOTFS_DIR}.ext4 ${ROOT_TARGET}"

    echo "---> copy rootfs"
    MY_LOG_EXEC "sudo cp -rf -a ${ROOTFS_DIR}/. ${ROOT_TARGET}"

    sync

    sudo umount ${ROOT_TARGET}

    # 安装uboot
    echo "---> install uboot"
    (
        # 先删除旧的
        rm -rf ./phyitum-pi/

        mkdir -p ./phyitum-pi/resource
        cp -v ${ROOTFS_DIR}/boot/vmlinuz ./phyitum-pi/resource/vmlinuz

        cd ./phyitum-pi/resource
        wget -R "index.html*,*.deb" -r -np -nd http://factory.openkylin.top/kif/archive/get/repos/phyitumpi/pool/

        # mkimage 依赖 上面拷贝的vmlinuz文件
        mkimage -f ./edu.its ./uImage.itd

        # cp -v ${VK_UBOOT_FILE} fip.bin
        # dd if=./uImage.itd of=./fip.bin bs=1M seek=4
    )

    MY_LOG_EXEC "dd if=./phyitum-pi/resource/${VK_UBOOT_FILE} of=${IMAGE_FILE} conv=notrunc"
    MY_LOG_EXEC "dd if=./phyitum-pi/resource/uImage.itd of=${IMAGE_FILE} bs=1M seek=4 conv=notrunc"
    MY_LOG_EXEC "dd if=./${ROOTFS_DIR}.ext4 of=${IMAGE_FILE} bs=1M seek=64 conv=notrunc"

    echo "---> success"

    xz -zkv --extreme --threads=0 ${IMAGE_FILE}
    md5sum ${IMAGE_FILE}.xz >${IMAGE_FILE}.xz.md5

    if [ -n "${CONF}" ] && [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        cp -rf ${IMAGE_FILE}.xz* ..
        cp -rf *.deblist ..
        popd
    fi

    if [ -z "${VK_KEEP_IMAGE_DIR}" ] || [ "${VK_KEEP_IMAGE_DIR}" != "y" ]; then
        echo "---> 删除 img 制作目录，节省空间"
        sudo rm -rf "${ROOTFS_DIR}-img"
    else
        echo "---> 保留 ${ROOTFS_DIR}-img 制作目录"
    fi
}
```

# 构建自己的脚本

> 我的目的也只是想要构建一个文件系统，由于ubuntu24上才能构建成功base，所以我就在一个基础包上构建即可。

```
COPYapt install -y apt-utils kmod kbd whiptail locales \
	systemd-resolved vim lsof cpio file sudo tree wget rsync \
	fdisk gdisk parted psmisc rsyslog dosfstools lsb-release archdetect-deb \
	bash-completion zstd iputils-ping iproute2 net-tools network-manager \
	wpasupplicant openssh-server openssh-client xinit lightdm xdg-user-dirs 


apt install ukui-control-center ukui-desktop-environment ukui-desktop-environment-core \
	ukui-greeter openkylin-wallpapers ukui-globaltheme-heyin libukuiinputgatherclient1 \
	 ukui-notebook \
 	kylin-daq kylin-app-manager
	
	
	
	apt install xserver-xorg-video-fbdev xserver-xorg-input-all 	libqt5sql5-sqlite onboard python3-xdg remmina remmina-plugin-vnc network-manager-gnome 
```

openkylin-anything.list

```
COPYdeb http://ppa.build.openkylin.top/kylinsoft/anything2.0/openkylin/ nile main
```

openkylin-software.list

```
COPYdeb http://software.openkylin.top/openkylin/ nile main all    
```

问题解决了，使用官方的构建脚本的话会出现几个问题，首先呢源不对，要将源换成2.0的开放麒麟源，再然后呢需要将apt的整个目录换掉，最后有个deb包是装不上的，需要手动装一下，这样才是真的成功，然后呢，我已经构建成功迅为的开放麒麟镜像了，现在开始研究一下官方构建步骤的楼层

# 构建流程

直接输入./okbuild.sh而不添加任何参数会打印usage，说明该脚本总共支持的平台，以及各个平台的编译步骤，这里使用树莓派的编译命令，即

```
COPY./okbuild.sh -p prop_rpi4b 
```

![image-20240817151602795](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026406.png)image-20240817151602795

这个命令总共有两个参数，分别为-p选项和prop_rpi4b 参数，其实在shell脚本里，这些都属于参数，写下来的内容呢就是对这两个参数进行判断，然后赋值，具体内容会将prop_rpi4b 赋值给PROP，CONF默认值为openkylin，再然后读取了prop配置文件的值，该文件的值接下来会进行逐个判定，先列一下该配置文件的具体内容

```
COPY#!/bin/bash

# 版本状态
VK_VERSION="1.0.2"
# 主板标识
VK_BOARD="rpi4b"
# 架构
VK_ARCH="arm64"
# 执行顺序
VK_ORDER="order_rpi4b"

# 执行任务
VK_TASKS="rootfs,config,img_rpi4b"

VK_UPDATE="y"
VK_KEEP_IMAGE_DIR="n"
```

最后会将这些值导入，这里最重要的是VK_TASKS，在okbuild.sh中，他的最后会依次执行rootfs,config,img_rpi4b，也就是do_rootfs函数、do_config函数，以及do_img_rpi4b函数，do_rootfs函数很简单，就是构建了一个最小文件系统，具体内容如下所示：

```
COPYfunction do_rootfs() {
    # 先删除 原有 rootfs 目录
    if [ ! -f "${ROOTFS_DIR}.done" ]; then
        umount_target "${ROOTFS_DIR}"
        MY_LOG_EXEC "sudo rm -rf ${ROOTFS_DIR}"

        # debootstrap 参数
        DEBOOTSTRAP_ARGS="--no-check-gpg --variant=minbase --arch=${VK_ARCH} --components=main --include=openkylin-keyring,systemd-sysv ${VK_SUITE} ${ROOTFS_DIR} ${VK_MIRROR} gutsy"

        # 制作 rootfs
        MY_LOG_EXEC "sudo debootstrap ${DEBOOTSTRAP_ARGS}"

        # 记录基础rootfs的包列表，给第2步升级包版本用
        # sudo chroot "${ROOTFS_DIR}" bash -c "dpkg-query -W --showformat='\${Package} \${Version}\n' > /rootfs.deblist"
        # cp "${ROOTFS_DIR}"/rootfs.deblist "${ROOTFS_DIR}".rootfs.deblist
        sudo chroot "${ROOTFS_DIR}" bash -c "dpkg-query -W --showformat='\${Package} \${Version}\n'" >"${ROOTFS_DIR}".rootfs.deblist

        sudo rm -rf ${ROOTFS_DIR}/var/cache/apt/archives/*.deb
        if (: "${VK_KEEP_VAR_LIB_APT_LISTS}") 2>/dev/null && [ "${VK_KEEP_VAR_LIB_APT_LISTS}" = "y" ]; then
            sudo rm -rf ${ROOTFS_DIR}/var/cache/apt/*.bin
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_Packages
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_InRelease
            sudo rm -rf ${ROOTFS_DIR}/var/lib/apt/lists/*_Translation*
            sudo rm -rf ${ROOTFS_DIR}/root/.bash_history
            sudo rm -rf ${ROOTFS_DIR}/tmp/*
        fi

        # rootfs制作完成
        MY_LOG_EXEC "touch ${ROOTFS_DIR}.done"
    fi
}
```

然后来do_config

```
COPY
# 进入根文件系统进行安装、配置
function do_config() {
    # 需要升级基础rootfs
    if (: "${VK_UPDATE}") 2>/dev/null && [ "${VK_UPDATE}" = "y" ] && [ "${VK_CURRENT_TASK}" = "config" ] && [ ! -f "${ROOTFS_DIR}.rootfs-update.deblist" ]; then
        MY_LOG_EXEC "sudo cp -v ${ROOTFS_DIR}.rootfs.deblist ${ROOTFS_DIR}/rootfs.deblist"
    fi

    # 挂载
    umount_target "${ROOTFS_DIR}"
    mount_host_to_target ${ROOTFS_DIR}

    # 拷贝配置到 ${ROOTFS_DIR}/config
    sudo rm -rf ${ROOTFS_DIR}/config
    sudo mkdir -p ${ROOTFS_DIR}/config
    sudo cp -v ${CURRENT_DIR}/config/*.sh ${ROOTFS_DIR}/config/
    if [ -d "${CURRENT_DIR}/config/${CONF}" ]; then
        sudo cp -r ${CURRENT_DIR}/config/${CONF}/. ${ROOTFS_DIR}/config/
        # 制作
        sudo chroot ${ROOTFS_DIR} /usr/bin/env -i \
            PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
            HOME=/root \
            LC_ALL=C \
            DEBIAN_FRONTEND=noninteractive \
            APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn \
            bash -euo pipefail /config/main.sh "$(set | grep "^VK_" | xargs)"
    else
        echo "'config/${CONF}' not exits!"
    fi

    # 卸载
    umount_target ${ROOTFS_DIR}

    # 参考分析用
    sudo rm -rf ${ROOTFS_DIR}-config
    # sudo cp -rf -a ${ROOTFS_DIR}/config ${ROOTFS_DIR}-config
    sudo rm -rf ${ROOTFS_DIR}/config

    # 记录包列表
    if [ "${VK_CURRENT_TASK}" == "config" ]; then
        sudo chroot ${ROOTFS_DIR} dpkg -l | grep ^i | awk '{print $2,$3}' >${ROOTFS_DIR}.deblist
    fi

    # 删除 update 包列表
    if [ -f "${ROOTFS_DIR}"/rootfs-update.deblist ] && [ ! -f "${ROOTFS_DIR}".rootfs-update.deblist ]; then
        cp -v "${ROOTFS_DIR}"/rootfs-update.deblist "${ROOTFS_DIR}".rootfs-update.deblist
    fi
    sudo rm -v -rf "${ROOTFS_DIR}"/rootfs*.deblist
}
```

他这里就很灵性，亦或者很取巧，他把config目录整个搬进去了，这样直接在chroot环境运行，这肯定没啥问题，我就没想到这个地方，虽然这属于一个很简单的地方，果然是不传递的，之前的想发也就不对了，在ubuntu上定义的环境变量，是不会进入到chroot的环境中的，如下所示：

![image-20240817154352321](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051026448.png)image-20240817154352321

| 对传入的两个参数进行判断 | 将prop_rpi4b 赋值给PROP | 读取prop配置文件值，并导入进环境变量 | 根据VK_TASKS值进行任务逐个执行 | 首先执行do_rootfs | 然后执行do_config |
| ------------------------ | ----------------------- | ------------------------------------ | ------------------------------ | ----------------- | ----------------- |
|                          |                         |                                      |                                |                   |                   |

 至此对于流程就大致分析完成了，确实挺简单的，就是一些shell脚本的语法还不是很熟悉，但也就这样了，开放麒麟的构建就这样了，后续也没啥东西了，ok，那就先这样。
