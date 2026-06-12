---
title: ubuntu和debian源
date: 2023-12-03 15:01:21
categories:
  - 瑞芯微开发
link: 02_瑞芯微/10 ubuntu和debian源
---

ubuntu20

~~~shell
deb https://repo.huaweicloud.com/ubuntu-ports/ focal main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ focal main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ focal-security main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ focal-security main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ focal-updates main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ focal-updates main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ focal-backports main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ focal-backports main restricted universe multiverse

## Not recommended
# deb https://repo.huaweicloud.com/ubuntu-ports/ focal-proposed main restricted universe multiverse
# deb-src https://repo.huaweicloud.com/ubuntu-ports/ focal-proposed main restricted universe multiverse
~~~

ubuntu22

~~~shell
deb https://repo.huaweicloud.com/ubuntu-ports/ jammy main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ jammy main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ jammy-updates main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ jammy-backports main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ jammy-backports main restricted universe multiverse

deb https://repo.huaweicloud.com/ubuntu-ports/ jammy-security main restricted universe multiverse
deb-src https://repo.huaweicloud.com/ubuntu-ports/ jammy-security main restricted universe multiverse

#  Not recommended
# deb http://ports.ubuntu.com/ubuntu-ports/ jammy-proposed main restricted universe multiverse
# deb-src http://ports.ubuntu.com/ubuntu-ports/ jammy-proposed main restricted universe multiverse
~~~

debian10

~~~shell
deb https://mirrors.huaweicloud.com/repository/debian/ buster main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian/ buster-updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian/ buster-backports main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
deb https://mirrors.huaweicloud.com/repository/debian-security buster/updates main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
~~~

debian11

~~~shell
deb https://mirrors.huaweicloud.com/debian/ bullseye main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye main non-free contrib
deb https://mirrors.huaweicloud.com/debian-security/ bullseye-security main
deb-src https://mirrors.huaweicloud.com/debian-security/ bullseye-security main
deb https://mirrors.huaweicloud.com/debian/ bullseye-updates main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye-updates main non-free contrib
deb https://mirrors.huaweicloud.com/debian/ bullseye-backports main non-free contrib
deb-src https://mirrors.huaweicloud.com/debian/ bullseye-backports main non-free contrib
~~~

debian12

~~~shell
deb https://mirrors.huaweicloud.com/debian/ bookworm main non-free non-free-firmware contrib 
deb-src https://mirrors.huaweicloud.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.huaweicloud.com/debian-security/ bookworm-security main 
deb-src https://mirrors.huaweicloud.com/debian-security/ bookworm-security main 
deb https://mirrors.huaweicloud.com/debian/ bookworm-updates main non-free non-free-firmware contrib 
deb-src https://mirrors.huaweicloud.com/debian/ bookworm-updates main non-free non-free-firmware contrib 
deb https://mirrors.huaweicloud.com/debian/ bookworm-backports main non-free non-free-firmware contrib 
deb-src https://mirrors.huaweicloud.com/debian/ bookworm-backports main non-free non-free-firmware contrib 
~~~

