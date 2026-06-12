---
title: ubuntu环境搭建
date: 2023-12-25 06:50:19
categories:
  - Linux学习
link: 03_Linux学习/2 ubuntu环境搭建
---

# 	1.ubuntu22环境搭建

## 1.1 ubuntu22 镜像源下载

​	清华源 https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/

​	中科大源 https://mirrors.ustc.edu.cn/ubuntu-releases/

![image-20231225205248378](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252052418.png)

​	我这里就直接下载ubuntu22了，vmware虚拟机安装ubuntu22的步骤就不再多说，这里就根据步骤来进行就好了。

## 2.设置中文

​	对于一打印信息还是中文更加友好，所以这里将系统的环境更换为中文。首先来到设置，如下所示：
![image-20231225210703377](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252107402.png)

​	找到Region and Language，点击语言管理：
![image-20231225210811158](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252108180.png)

​	将汉语(中国)移动到最上面，移动完成如下所示：
![image-20231225210931069](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252109085.png)

​	然后点击应用到系统：
![image-20231225210958420](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252109436.png)

​	重启系统就是中文了。如下所示：
![image-20231225211128599](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252111623.png)

## 3.设置不休眠

​	默认情况下都是五分钟休眠，这里时间太短了，所以需要在设置里的电源中改为无休眠。

![image-20231225211252490](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252112513.png)

## 4.其他配置

​	安装一些软件和依赖，确保编译和一些工具能成功

~~~shell
sudo apt-get install -y uuid uuid-dev zlib1g-dev liblz-dev liblzo2-2 liblzo2-dev lzop \
git curl u-boot-tools mtd-utils openjdk-8-jdk device-tree-compiler \
gdisk m4 git gnupg flex bison gperf libsdl1.2-dev libesd-java \
squashfs-tools build-essential zip libncurses5-dev pngcrush schedtool \
libxml2 libxml2-utils xsltproc lzop libc6-dev g++-multilib lib32z1-dev \
lib32ncurses-dev lib32readline-dev libswitch-perl libssl-dev unzip \
liblz4-tool ssh make gcc libssl-dev vim expect \
patchelf chrpath gawk texinfo diffstat binfmt-support \
qemu-user-static live-build fakeroot cmake rsync subversion \
sed binutils wget bzr cvs git mercurial \
patch gzip bzip2 perl tar cpio file bc python3-pip \
rsync android-sdk-libsparse-utils python2 net-tools vim
~~~

​	然后禁止掉wayland，不禁掉不能正常拖动文件。

~~~shell
sudo vim /etc/gdm3/custom.conf
~~~

打开WaylandEnable=false的注释，然后重启系统，果然修改了之后，可以直接拖动了，不错。然后修改一下虚拟机配置：
![image-20231225105730434](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252115362.png)

​	上面的这三个没啥用，直接关掉，启动时连接也取消掉。然后备份一下系统，中文输入法也不用安装，反正一般都是用ssh来连接的。

​	重启之后先来设置ssh，我还是喜欢用ssh，设置的步骤如下所示：

~~~shell
# 使能root用户登录
vim /etc/ssh/sshd_config
PermitRootLogin yes
~~~

到这里该安装的就差不多了，剩下的就让tabby来，为了确保传输速度，先加一个nat的网卡：
![image-20231225112113607](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252115313.png)

在编译内核的时候遇到了的第一个问题：
![image-20231225134018868](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312252115336.png)需要将python3链接到python，具体命令如下所示：

~~~shell
sudo ln -s /usr/bin/python3 /usr/bin/python
~~~

修改之后内核编译成功。编译recovery成功。编译文件系统成功、打包完整的update镜像成功，皆大欢喜，莫得问题，编译整体时间大约为两个小时，13：30开始编译，15：30编译结束时间.

随后又测试了安卓，同样可以编译成功。

