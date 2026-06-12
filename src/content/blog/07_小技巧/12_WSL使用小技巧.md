---
title: WSL使用小技巧
date: 2024-08-20 06:50:19
categories:
  - 小技巧
link: 07_小技巧/12_WSL使用小技巧
---

#  WSL代理

现在不用v2ray ，而是用clash，感觉clash比v2ray强一点，下载地址和简单教程为：https://igghelper.com/helper/?p=535

 安装之后导入代理，接下来的就是下面的一些设置了。

![image-20240819203759228](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043950.png)

 系统代理和开机自启要设置一下，如下所示：

![image-20240819204149507](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043025.png)image-20240819204149507

 然后打开Tun模式，我测试就可以了

![image-20240819205233715](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043043.png)image-20240819205233715

==这个tun模式指的是虚拟一个网卡，但这样的话会导致网络发生变化，从而导致一系列的问题，例如无法正常拉取==

![image-20240819213826540](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043016.png)image-20240819213826540

 所以现在正确的设置是这个地方：

![image-20240819214845649](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043030.png)image-20240819214845649

其他的就不用设置了，行了，去洗澡。

Clash 是一种代理工具，它可以根据配置文件的规则将网络流量通过不同的代理服务器或直接连接到目标服务器。**本地直连**（通常称为 “DIRECT”）是一种规则配置，意味着流量将不通过代理服务器，而是直接从你的设备连接到目标服务器。

 选clash代理的时候尽量选美国，其他的好慢啊。

更新wsl内核版本：

```
COPYsudo apt install linux-image-generic-hwe-22.04
```



# windows商店打不开的解决方法

打开“运行”输入 inetcpl.cpl 或者“WINDOWS”+“R”键，输入 inetcpl.cpl亦可。
点开高级往下拉，勾上"使用TLS 1.2"选项，或者点还原高级设置。

![在这里插入图片描述](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409121422525.png)

# WSL压缩方法

PS C:\Users\Administrator\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu22.04LTS_79rhkp1fndgsc\LocalState> Optimize-VHD -Path .\ext4.vhdx  -Mode Full

# WSL移动到其他盘

你可以按以下步骤将你的 `Ubuntu-22.04` 发行版导入到 `G:\` 盘：

### 1. 导出 WSL 发行版
首先，导出你的 `Ubuntu-22.04` WSL 发行版为 `.tar` 文件（如果尚未导出），例如：

```bash
wsl --export Ubuntu-22.04 G:\ubuntu-22.04-backup.tar
```

![image-20240915135926150](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409151359184.png)

这个命令会将你的 `Ubuntu-22.04` 版本导出到 `G:` 文件夹中，文件名为 `ubuntu-22.04-backup.tar`。你可以根据需要更改路径和文件名。

### 2. 删除原 WSL 发行版
如果确认导出成功，可以使用以下命令从 WSL 中删除原来的 `Ubuntu-22.04` 版本：

```bash
wsl --unregister Ubuntu-22.04
```

这样做会从 WSL 中删除现有的 `Ubuntu-22.04`，但不会影响你导出的 `.tar` 文件。

### 3. 导入到 G:\ 盘
现在你可以将导出的 WSL 发行版安装到 `G:\` 盘。运行以下命令将 `Ubuntu-22.04` 版本导入到 `G:\wsl\ubuntu-22.04` 文件夹：

```bash
wsl --import Ubuntu-22.04 G:\ubuntu-22.04 G:\ubuntu-22.04-backup.tar
```

这会将你的 `Ubuntu-22.04` 发行版安装到 `G:\wsl\ubuntu-22.04` 目录。

![image-20240915140014438](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409151400503.png)

### 4. 启动新位置的 WSL
导入完成后，你可以使用以下命令启动新的 `Ubuntu-22.04` 发行版：

```bash
wsl -d Ubuntu-22.04
```

这样，你的 `Ubuntu-22.04` 就会在 `G:\` 盘上运行了。

如果有任何问题或进一步的帮助需求，请随时告知！



# 设置默认用户

wsl -d Ubuntu-22.04 --user topeet

ubuntu2204 config --default-user topeet



wsl -d Ubuntu-20.04 --user topeet

ubuntu2004 config --default-user topeet

