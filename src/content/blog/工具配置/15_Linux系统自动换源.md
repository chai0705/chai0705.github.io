---
description: "> 不管是用开发板、虚拟机、还是wsl，Linux的系统软件源更换都是很重要的一件事，我的常用做法是在网上搜索华为源更换源，每次都要这样操作，很是无奈，所以在机缘巧合之下，发现了这个github项目，可以自动检测国内源，测速并更换，该项目的地址为https://github.com/RubyMetr"
cover: /img/cover/1.webp

title: Linux系统自动换源
date: 2024-08-29 06:50:19
categories:
  - 工具配置
link: 工具配置/15_Linux系统自动换源
---

> 不管是用开发板、虚拟机、还是wsl，Linux的系统软件源更换都是很重要的一件事，我的常用做法是在网上搜索华为源更换源，每次都要这样操作，很是无奈，所以在机缘巧合之下，发现了这个github项目，可以自动检测国内源，测速并更换，该项目的地址为https://github.com/RubyMetric/chsrc

> 我一般情况下，用下面的这些命令就可以了，后面的有需要再试了。

```
# x64
curl -L https://github.com/RubyMetric/chsrc/releases/download/pre/chsrc-x64-linux -o chsrc; chmod +x ./chsrc

# aarch64
curl -L https://github.com/RubyMetric/chsrc/releases/download/pre/chsrc-aarch64-linux -o chsrc; chmod +x ./chsrc

sudo chsrc set ubuntu
```

**`chsrc` 不仅是一个命令行工具，同时也是一个换源框架，它甚至使你能够在不了解C语言的情况下编写出新的换源方法(recipe)。**

立刻为一个新软件添加换源方法！[Write A Recipe Even If You Don’t Know C](https://chai0705.github.io/2024/08/29/07_小技巧/13_ Linux系统自动换源/doc/Write-A-Recipe-Even-If-You-Dont-Know-C.md)