---
title:  瑞芯微build-sh脚本分析
date: 2024-08-01 10:00:00
categories:
  - 瑞芯微开发
link: 瑞芯微开发/03 瑞芯微build-sh脚本分析
---

1|1|---
2|2|description: "build.sh脚本内容如下所示： shell !/bin/bash 设置环境变量 LC_ALL，用于定义程序的本地化设置 将 LC_ALL 设置为 C，表示使用标准的C语言环境，忽略本地化设置 export LC_ALLC 设置环境变量 LD_LIBRARY_PATH，用于指定动态链接库的搜"
3|3|cover: /img/cover/4.webp
4|4|
5|5|title: 瑞芯微build-sh脚本分析
6|6|date: 2023-09-10 17:16:56
7|7|categories:
8|8|  - 瑞芯微开发
9|9|link: 瑞芯微开发/03 瑞芯微build-sh脚本分析
10|10|---
11|11|
12|12|build.sh脚本内容如下所示：
13|13|
14|14|~~~shell
15|15|#!/bin/bash
16|16|
17|17|# 设置环境变量 LC_ALL，用于定义程序的本地化设置
18|18|# 将 LC_ALL 设置为 C，表示使用标准的C语言环境，忽略本地化设置
19|19|export LC_ALL=C
20|20|
21|