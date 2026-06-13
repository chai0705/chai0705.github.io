---
description: "这是我学习docker的一个前提条件，在之前的一些时间，我也是简单的看了一下docker，当时我是想用docker来进行deb包的构建的，为什么想到用docker了呢，这是因为我看大佬的github和瑞芯微的指导手册里都使用的docker，其实这个就跟开发板直接编译的效果是一样的，只是docker是"
cover: /img/cover/3.webp

title: docker学习
date: 2023-11-09 09:55:17
categories:
  - 工具配置
link: 工具配置/2 docker学习
---

这是我学习docker的一个前提条件，在之前的一些时间，我也是简单的看了一下docker，当时我是想用docker来进行deb包的构建的，为什么想到用docker了呢，这是因为我看大佬的github和瑞芯微的指导手册里都使用的docker，其实这个就跟开发板直接编译的效果是一样的，只是docker是在本机上，所以操作更流畅一些，而且开发板的编译速度以及方便程度，是有些区别的，所以docker就出现了，再然后我发现源码的编译里也是可以用到docker的，毕竟也就仅仅是一些环境而已，所以我又萌发了用docker编译源码的想法，所以docker的学习正式开始。

**弱小和无知不是生存的障碍，傲慢才是**

**唯有出现需求，你的目标和需求相匹配，才是学习最快速的路径。**

# Docker为什么出现

在我看来，我不是运维人员，我是嵌入式软件工程师，现在编译一个系统，换一个开发板，他们的环境都是不一样的，这就很烦，然而docker呢就很方便的解决了依赖这些相关的问题，而且还很小，这也是我学习docker的原因。

Docker的思想来自于集装箱，集装箱解决了什么问题？在一艘大船上，可以把货物规整的摆放起来。并且各种各样的货物被集装箱标准化了，集装箱和集装箱之间不会互相影响。那么我就不需要专门运送水果的船和专门运送化学品的船了。只要这些货物在集装箱里封装的好好的，那我就可以用一艘大船把他们都运走。

Docker是基于Go语言实现的云开源项目。

Docker的主要目标是“Build，Ship and Run Any App , Anywhere”，也就是通过对应用组件的封装、分发、部署、运行等生命周期的管理，使用户的APP（可以是一个WEB应用或数据库应用等等）及其运行环境能够做到“一次封装，到处运行”。Linux 容器技术的出现就解决了这样一个问题，而 Docker 就是在它的基础上发展过来的。将应用运行在Docker 容器上面，而 Docker 容器在任何操作系统上都是一致的，这就实现了跨平台、跨服务器。只需要一次配置好环境，换到别的机子上就可以一键部署好，大大简化了操作。

**虚拟机的缺点：**

1、资源占用多

2、冗余步骤多

3 、启动慢

容器虚拟化技术

由于前面虚拟机存在这些缺点，Linux 发展出了另一种虚拟化技术：Linux 容器（Linux Containers，缩写为 LXC）。

Linux 容器不是模拟一个完整的操作系统，而是对进程进行隔离。有了容器，就可以将软件运行所需的所有资源打包到一个隔离的容器中。容器与虚拟机不同，不需要捆绑一整套操作系统，只需要软件工作所需的库资源和设置。系统因此而变得高效轻量并保证部署在任何环境中的软件都能始终如一地运行。

比较了 Docker 和传统虚拟化方式的不同之处：

- 传统虚拟机技术是虚拟出一套硬件后，在其上运行一个完整操作系统，在该系统上再运行所需应用进程；
- 而容器内的应用进程直接运行于宿主的内核，容器内没有自己的内核，而且也没有进行硬件虚拟。因此容器要比传统虚拟机更为轻便。
- 每个容器之间互相隔离，每个容器有自己的文件系统 ，容器之间进程不会相互影响，能区分计算资源。

学习途径

Docker官网：http://www.docker.com

Docker中文网站：https://www.docker-cn.com

Docker Hub官网：https://hub.docker.com （仓库）

还是我那句话，只要学不死，就往死里学！

# Docker安装

我这里就直接使用ubuntu20 ，也就是3588的虚拟机了，我要虚拟一个ubuntu20的docker容器，这是我的第一个目的。

1.安装gcc g++相关环境

~~~
sudo apt-get -y install gcc g++
~~~

![image-20231110095659265](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028310.png)

确保之前的docker删除掉：

~~~
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
~~~

![image-20231110100326456](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028358.png)

然后设置镜像仓库

~~~shell
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
~~~

![image-20231110100407513](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028368.png)

接下来安装docker

~~~shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
~~~

![image-20231110100446286](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028314.png)

测试docker helloworld

~~~shell
docker run hello-world
~~~

![image-20231110100628135](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028319.png)

首先本地是没有docker的helloworld镜像的，所以他会首先从dockerhub拉取helloworld镜像，然后开始运行，到这里docker就安装完成了。

然后可以使用以下命令可以查看目前系统中有哪些docker镜像。

~~~
docker ps -a
~~~

![image-20231110101205930](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028329.png)

# 阿里云镜像加速

由于国外的dockerhub太慢了。拉取一些镜像非常慢，所以就需要更换国内的源来进行加速

1、介绍：https://www.aliyun.com/product/acr

2、注册一个属于自己的阿里云账户(可复用淘宝账号)

3、进入管理控制台设置密码，开通

4、查看镜像加速器自己的

https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors

针对Docker客户端版本大于 1.10.0 的用户

您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://4cmfmhps.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

![image-20231110101800496](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028744.png)

~~~shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
"registry-mirrors": ["https://docker.m.daocloud.io","https://docker.086181.xyz","https://docker.salty.eu.org"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
~~~



# Docker常用命令

## 帮助命令

docker version # 显示 Docker 版本信息。

![image-20231110101930475](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028784.png)

docker info # 显示 Docker 系统信息，包括镜像和容器数。

![image-20231110101954091](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028763.png)

docker --help # 帮助

![image-20231110102010973](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028769.png)

## 镜像命令

### docker images 

列出本地主机上的镜像

~~~
docker images
~~~

![image-20231110102117914](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028775.png)

~~~shell
# 解释
REPOSITORY 镜像的仓库源
TAG 镜像的标签
IMAGE ID 镜像的ID
CREATED 镜像创建时间
SIZE 镜像大小
# 同一个仓库源可以有多个 TAG，代表这个仓库源的不同版本，我们使用REPOSITORY：TAG 定义不同
的镜像，如果你不定义镜像的标签版本，docker将默认使用 lastest 镜像！
# 可选项
-a： 列出本地所有镜像
-q： 只显示镜像id
--digests： 显示镜像的摘要信息
~~~

### docker search

搜索镜像

~~~
docker search mysql
~~~

![image-20231110102407460](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028862.png)

~~~shell
# docker search 某个镜像的名称 对应DockerHub仓库中的镜像
# 可选项
--filter=stars=50 ： 列出收藏数不小于指定值的镜像。
~~~

### docker pull

下载镜像

~~~
docker pull mysql
~~~

![image-20231110102532256](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028173.png)

~~~shell
 # 不写tag，默认是latest
 sha256:61a2a33f4b8b4bc93b7b6b9e65e64044aaec594809f818aeffbff69a893d1944 #
签名
Status: Downloaded newer image for mysql:latest
docker.io/library/mysql:latest # 真实位置
# 指定版本下载
docker pull mysql:5.7
~~~



### docker rmi

删除镜像

~~~shell
# 删除镜像
docker rmi -f 镜像id # 删除单个
docker rmi -f 镜像名:tag 镜像名:tag # 删除多个
docker rmi -f $(docker images -qa) # 删除全部
~~~

![image-20231110102733970](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028206.png)

## 容器命令

有镜像才能创建容器，狂神的是cenos，我这里肯定用ubuntu，线搜索一下ubuntu

![image-20231110103746806](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028184.png)

然后我这里拉取ubuntu20.04的镜像：

~~~
docker pull ubuntu:20.04
~~~

![image-20231110103933502](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028215.png)

### docker run 

新建容器并启动

~~~shell
# 命令
docker run [OPTIONS] IMAGE [COMMAND][ARG...]
# 常用参数说明
--name="Name" # 给容器指定一个名字
-d # 后台方式运行容器，并返回容器的id！
-i # 以交互模式运行容器，通过和 -t 一起使用
-t # 给容器重新分配一个终端，通常和 -i 一起使用
-P # 随机端口映射（大写）
-p # 指定端口映射（小结），一般可以有四种写法
ip:hostPort:containerPort
ip::containerPort
hostPort:containerPort (常用)
containerPort
~~~

先使用 docker images命令查看一下拉取的镜像

~~~
docker images
~~~

![image-20231110104246665](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028178.png)

使用ubuntu进行用交互模式启动容器，在容器内执行/bin/bash命令！

~~~shell
docker run -it ubuntu:20.04 /bin/bash
~~~

![image-20231110104414762](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028212.png)

==注意，这里要添加tag标签，不然无法成功==

最后使用exit退出镜像即可。

![image-20231110104527685](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028464.png)

### docker ps 

列出所有容器

~~~shell
# 命令
docker ps [OPTIONS]
# 常用参数说明
-a # 列出当前所有正在运行的容器 + 历史运行过的容器
-l # 显示最近创建的容器
-n=? # 显示最近n个创建的容器
-q # 静默模式，只显示容器编号。
~~~

![image-20231110104629549](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028606.png)

### exit

退出容器

### docker start 

启动容器

需要注意：==`docker run`用于创建和启动新的容器，并可以指定要在容器内执行的命令，而`docker start`仅用于启动已经存在但目前停止的容器。==

### docker restart

 重启容器

### docker stop

停止容器

### docker kill 

 强制停止容器

### docker rm

删除容器

## 其他常用命令

### docker run -d 

后台启动容器

### docker logs -f -t --tail 

查看日志

### docker top 

查看容器中运行的进程信息

### docker inspect

查看容器/镜像的元数据

### docker exec -it

进入正在运行的容器

### docker cp 

从容器内拷贝文件到主机上

==一般用的不多吧，一般都是直接卷的挂载==

# **docker commit** 

从容器创建一个新的镜像，类似于虚拟机的快照相关的东西，但是后面的dockerfile实现的是一个形同的目的，所以这里直接去到dockerfile

# 挂载卷

这个方法很重要，以后的挂载构建镜像以及构系统源码进行编译都要用这个，但是后面的挂载我还不是很懂，这里后面要在看看。

# DockerFile

dockerfile是用来构建Docker镜像的构建文件，是由一系列命令和参数构成的脚本。

构建步骤：

1、编写DockerFile文件

2、docker build 构建镜像

3、docker run

**DockerFile****构建过程**

**基础知识：**

1、每条保留字指令都必须为大写字母且后面要跟随至少一个参数

2、指令按照从上到下，顺序执行

3、# 表示注释

4、每条指令都会创建一个新的镜像层，并对镜像进行提交

**流程：**

1、docker从基础镜像运行一个容器

2、执行一条指令并对容器做出修改

3、执行类似 docker commit 的操作提交一个新的镜像层

4、Docker再基于刚提交的镜像运行一个新容器

5、执行dockerfile中的下一条指令直到所有指令都执行完成！

**说明：**

从应用软件的角度来看，DockerFile，docker镜像与docker容器分别代表软件的三个不同阶段。

DockerFile 是软件的原材料 （代码）

Docker 镜像则是软件的交付品 （.apk）

Docker 容器则是软件的运行状态 （客户下载安装执行）

DockerFile 面向开发，Docker镜像成为交付标准，Docker容器则涉及部署与运维，三者缺一不可！

~~~shell
FROM # 基础镜像，当前新镜像是基于哪个镜像的
MAINTAINER # 镜像维护者的姓名混合邮箱地址
RUN # 容器构建时需要运行的命令
EXPOSE # 当前容器对外保留出的端口
WORKDIR # 指定在创建容器后，终端默认登录的进来工作目录，一个落脚点
ENV # 用来在构建镜像过程中设置环境变量
ADD # 将宿主机目录下的文件拷贝进镜像且ADD命令会自动处理URL和解压tar压缩包
COPY # 类似ADD，拷贝文件和目录到镜像中！
VOLUME # 容器数据卷，用于数据保存和持久化工作
CMD # 指定一个容器启动时要运行的命令，dockerFile中可以有多个CMD指令，但只有最
后一个生效！
ENTRYPOINT # 指定一个容器启动时要运行的命令！和CMD一样
ONBUILD # 当构建一个被继承的DockerFile时运行命令，父镜像在被子镜像继承后，父镜像的
ONBUILD被触发
~~~

编写完一个完整的dockerfile文件如下所示：

~~~dockerfile
FROM ubuntu:20.04
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gnupg \
       gnupg1 \
       gpgv1 \
    && rm -rf /var/lib/apt/lists/*
RUN dpkg --add-architecture i386

RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get install -y --no-install-recommends \
       acl \
       aptly \
       aria2 \
       bc \
       binfmt-support \
       binutils \
       bison \
       btrfs-progs \
       build-essential \
       ca-certificates \
       ccache \
       cpio \
       cryptsetup \
       cryptsetup-bin \
       curl \
       debian-archive-keyring \
       debian-keyring \
       debootstrap \
       device-tree-compiler \
       dialog \
       dosfstools \
       f2fs-tools \
       fakeroot \
       flex \
       gawk \
       git \
       imagemagick \
       kmod \
       lib32ncurses6 \
       lib32stdc++6 \
       lib32tinfo6 \
       libbison-dev \
       libc6-dev-armhf-cross \
       libc6-i386 \
       libfile-fcntllock-perl \
       libfl-dev \
       liblz4-tool \
       libncurses5-dev \
       libpython2.7-dev \
       libpython3-dev \
       libssl-dev \
       libusb-1.0-0-dev \
       linux-base \
       locales \
       lsb-release \
       lzop \
       ncurses-base \
       ncurses-term \
       nfs-kernel-server \
       ntpdate \
       p7zip-full \
       parted \
       patchutils \
       pigz \
       pixz \
       pkg-config \
       psmisc \
       pv \
       python2 \
       python3 \
       python3-dev \
       python3-distutils \
       qemu-user-static \
       rsync \
       swig \
       systemd-container \
       tzdata \
       u-boot-tools \
       udev \
       unzip \
       uuid-dev \
       wget \
       whiptail \
       xxd \
       zip \
       zlib1g-dev \
       zlib1g:i386 \
       sudo \
       vim \
       uuid \
       uuid-dev \
       zlib1g-dev \
       liblz-dev \
       liblzo2-2 \
       liblzo2-dev \
       lzop \
       git \
       curl \
       u-boot-tools \
       mtd-utils \
       openjdk-8-jdk \
       device-tree-compiler \
       gdisk \
       m4 \
       zlib1g-dev \
       git \
       gnupg \
       flex \
       bison \
       gperf \
       libsdl1.2-dev \
       libesd-java \
       squashfs-tools \
       build-essential \
       zip \
       curl \
       libncurses5-dev \
       zlib1g-dev \
       pngcrush \
       schedtool \
       libxml2 \
       libxml2-utils \
       xsltproc \
       lzop \
       libc6-dev \
       schedtool \
       g++-multilib \
       lib32z1-dev \
       lib32ncurses-dev \
       lib32readline-dev \
       gcc-multilib \
       libswitch-perl \
       libssl-dev \
       unzip \
       zip \
       liblz4-tool \
       git \
       ssh \
       make \
       gcc \
       libssl-dev \
       liblz4-tool \
       vim \
       expect \
       g++ \
       patchelf \
       chrpath \
       gawk \
       texinfo \
       chrpath \
       diffstat \
       binfmt-support \
       qemu-user-static \
       live-build \
       bison \
       flex \
       fakeroot \
       cmake \
       gcc-multilib \
       g++-multilib \
       unzip \
       device-tree-compiler \
       python3-pip \
       libncurses5-dev \
       rsync \
       subversion \
       sed \
       make \
       binutils \
       build-essential \
       gcc \
       g++ \
       wget \
       python-is-python2 \
       libncurses5 \
       bzr \
       cvs \
       git \
       mercurial \
       patch \
       gzip \
       bzip2 \
       perl \
       tar \
       cpio \
       unzip \
       rsync \
       file \
       bc \
       wget \
       qemu-user-static \
       live-build \
       android-sdk-libsparse-utils \
       android-sdk-ext4-utils \
       time \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/bin/python \
    && sudo ln -s /usr/bin/python3 /usr/bin/python

RUN locale-gen en_US.UTF-8
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8' TERM=screen
WORKDIR /home/topeet
ENTRYPOINT [ "/bin/bash"]
~~~



运行构建docker的命令如下所示：

~~~
docker build -f Dockerfile -t ubuntu20:1 .
~~~

==注意最后有个.表示当前目录~~我说呢==

然后运行：

~~~
docker run -it ubuntu20:1
~~~

![image-20231110130235371](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028618.png)

运行成功证明构建的没问题，然后打包ubuntu20：

~~~
docker save -o image.tar.gz ubuntu20:1
~~~

![image-20231110135153759](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028624.png)

r然后在其他电脑上只需要使用下面的命令加载镜像即可

~~~
docker load -i image.tar.gz
~~~

最后测试挂载然后编译：

~~~
docker run --privileged -it -v /home/topeet/Linux/ubuntu20_build:/home/topeet/ubuntu20_build ubuntu20:1
~~~

其中  --privileged是必须要加的，否则构建系统的时候会有权限问题。构建ubuntu20文件系统通过，没有任何问题：
![image-20231110144134276](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311102028650.png)

然后测试编译Linux源码

~~~
docker run --privileged -it -v /home/topeet/Linux/3588-linux:/home/topeet/3588-linux ubuntu20:1
~~~

测试没有什么问题，编译的时间太长了，晚上再测。

~~~
docker run --privileged -it -v /home/topeet/Android/3588-android12:/home/topeet/3588-android12 ubuntu20:1
~~~