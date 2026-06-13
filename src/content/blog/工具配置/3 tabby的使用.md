---
description: "​	先说一下前提条件，本来我其实挺不爱用终端的，就算使用终端也是用mobaxterm，只能说这个软件很是强大，但是并没有给我一种给经验的感觉，当然肯定比之前的超级终端强得多，但还是不能给我一个十分想用的感觉，而这个tabby的软件就不一样，简洁而且看起来很好用，他的分屏、颜色、背景插件等等一系列的操"
cover: /img/cover/11.webp

title: tabby的使用
date: 2023-12-10 12:50:19
categories:
  - 工具配置
---

​	先说一下前提条件，本来我其实挺不爱用终端的，就算使用终端也是用mobaxterm，只能说这个软件很是强大，但是并没有给我一种给经验的感觉，当然肯定比之前的超级终端强得多，但还是不能给我一个十分想用的感觉，而这个tabby的软件就不一样，简洁而且看起来很好用，他的分屏、颜色、背景插件等等一系列的操作都让我很是喜欢，所以下面就简单的讲解一下tabby的使用。

# 1.Tabby简介

 🍀 Tabby是一个无限可定制的跨平台终端应用程序，适用于local shells、serial、SSH和Telnet的连接。
 🍁 Tabby是基于TypeScript开发的终端模拟器，可用于Linux、Windows和Mac OS系统。

🌺 Tabby (前身是 Terminus) 是一个可高度配置的终端模拟器和 SSH 或串口客户端，支持 Windows，macOS 和 Linux

-  集成 SSH，Telnet 客户端和连接管理器
-  集成串行终端
-  定制主题和配色方案
-  完全可配置的快捷键和多键快捷键
-  分体式窗格
-  自动保存标签页
-  支持 PowerShell（和 PS Core）、WSL、Git-Bash、Cygwin、MSYS2、Cmder 和 CMD
-  在 SSH 会话中通过 Zmodem 进行直接文件传输
-  完整的 Unicode 支持，包括双角字符
-  不会因快速的输出而卡住
-  Windows 上舒适的 shell 体验，包括 tab 自动补全（通过 Clink）
-  为 SSH secrets 和设置集成了加密容器
-  SSH、SFTP 和 Telnet 客户端可用作 Web 应用（也可托管）

# 2.tabby的安装

下载地址：https://github.com/Eugeny/tabby/releases/tag/v1.0.205

![image-20231210153958212](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101539329.png)

​	有windows macos和linux多种类型的安装包，当然也包括多种架构的，我这里要在windows上进行使用，所以下载了windowd的exe文件，也就是这个[tabby-1.0.205-setup-x64.exe](https://github.com/Eugeny/tabby/releases/download/v1.0.205/tabby-1.0.205-setup-x64.exe)，下载完成之后进行安装。安装完成之后打开该软件

​	由于我要写markdown，所以我把之前下载的删掉了，但是它仍旧保存了我之前的配置，所以除了删掉软件之外还需要去删掉C盘的配置文件：C:\Users\Administrator\AppData\Roaming。

​	第一次启动如下所示：
![image-20231210155713230](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101557259.png)

​	这里的语言可以选择中文，选择之后如下所示：
![image-20231210155753314](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101557342.png)

​	而且我比较喜欢黑色的终端，所以就保持默认的黑色的配色方案了。关闭退出之后进入软件界面如下所示：
![image-20231210155851798](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101558826.png)

​	至此，关于tabby的安装就完成了。

# 3.tabby快捷键的修改

删除显示配置选择器 ctrl+shift+e，因为我想要让该快捷键改为向右分割窗格。

![image-20231210160101515](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101601528.png)

然后将ctrl+shift的快捷按键也删除掉，

![image-20231210160223634](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101602643.png)

这里的关闭标签为ctrl+shift+w，我认为不方便，由于我经常将该快捷按键设置为关闭单一的窗格，所以这里也删除掉

![image-20231210160540547](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101605559.png)

将向右拆分窗格设置为ctrl+shift+e，将向下拆分窗格设置为ctrl+shift+o

![image-20231210160745073](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101607090.png)

将关闭已聚焦的窗格设置为ctrl+shift+w

![image-20231210160817023](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101608034.png)

最后在写几个好用的快捷按键

1.ctrl+shift+左右按键可以切换不同的==标签页==

2.alt+数字按键也可以切换不同的==标签页==

3.ctrl+alt +上下左右可以切换不同的==窗格==

==上面这些确实不错可以让我解放双手，不需要懂鼠标，只需要键盘即可==

4.当窗格进行拆分之后，可以通过ctrl+alt+回车最大化当前的==窗格==

5.ctrl+alt+t 可以切换当前==窗格==的配置（==本来不知道是做啥的后来才知道，但还挺好用==）

6.ctrl+shift+. 可以将当前的窗格修改为单独的==标签页==

7.ctrl+shift+， 将所有的==标签页==合并到当前页

可以看到跟ctrl+shift有关的都是标签页，而跟窗格有关的都是ctrl+alt，反正ctrl是不能少的，而是窗格还是标签就要根据shift和alt来决定了。

# 4.串口的连接

​	点击右上角的齿轮按钮或者标签页右侧的按钮都可以进行配置。

![image-20231210163447978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101634986.png)

![image-20231210163454106](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101634116.png)

​	我这里是串口5，点击之后可以选择波特率，我这里选择115200，如下图所示：

![image-20231210163551067](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101635089.png)

![image-20231210163634527](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101636546.png)

![image-20231210163642195](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101636210.png)

如果是从齿轮设置打开，则需要先点击配置和连接，再选择串口5，如下所示：
![image-20231210163734239](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101637283.png)

# 5.ssh的连接

​	如果仅仅只是上面的串口功能，还并不能吸引我，更重要的是这个ssh功能，ssh功能因为要配置IP和密码，所以不能直接点击，需要从配置和连接中，点击ssh右侧小箭头中的克隆，如下图所示：
![image-20231210163959998](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101640012.png)

![image-20231210164012101](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101640130.png)

​	然后以此输入名称，连接的主机ip即可，我这里连接的是ip为192.168.1.84的ubuntu20，我们一般情况下加载普通用户，就不要使用root用户了，设置完成如下所示：
![image-20231210164206146](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101642173.png)

​	而ssh的色彩我更喜欢这个名叫Argonaut的，看着还挺好的。

![image-20231210165346454](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101653467.png)	

​	然后点击保存，可以发现刚刚配置的ssh已经在未命名的组内了：
![image-20231210164253114](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101642152.png)

​	然后点击箭头进行连接即可，连接成功如下所示：
![image-20231210164609480](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101646500.png)

# 6.字体设置

​	现在的字体特别小，而且颜色也并不是很好看，可以通过设置中的外观进行修改，进入之后如下所示：
![image-20231210164841697](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101648741.png)

这里的字体我喜欢设置为Cascadia Code SemiBold，而字体大小设置为20即可

![image-20231210165607329](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101656358.png)

​	最后的效果如下所示：

![image-20231210165653910](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101656926.png)

​	对比度鲜艳，让人看着就赏心悦目，工作更加有动力，哈哈。

# 7.好用的插件

## 7.1 background

​	重点来了，这个是我最最最最推荐的一个插件了，当你的终端背后是一个小姐姐的时候，你是不是想要多看会儿，这样你连摸鱼的时间都会少很多，而且还能适当的放松一下，极大的提高到了工作效率。

![image-20231210165947584](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101659617.png)

​	获取之后需要重启软件，在菜单中会多出一个背景，如下图所示：

![image-20231210170052921](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101700953.png)

​	首先启用背景，如下所示：
![image-20231210170120756](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101701772.png)

​	然后选择一个你喜欢的图片，我这里当然是神里凌华了==我是神里凌华的狗==，修改完之后是这个样子

![image-20231210170251409](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101702859.png)

​	但这也太招摇了，这时候下面的选项就有用了，将背景不透明度设置为6或者7这个样子，我测试最为合适，如下图所示：
![image-20231210170443701](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101704726.png)

​	最后的效果如下所示：

![image-20231210170508231](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101705347.png)

​	==嘿嘿是不是感觉还不错==

我发现每次重新启动tabby的时候都会自动打开一个 windows的tabby，我感觉好烦，可以在菜单栏中找到终端如下所示：

![image-20231210170926400](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101709443.png)

然后取消下面的这个即可

![image-20231210170905398](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101709459.png)

## 7.2.trzsz

​	默认情况下可以通过这里右上角的sftp进行文件的传输，但是这里有个问题，只能上传文件，但是不能上传文件夹：

![image-20231210171255099](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101712233.png)

​	而trzsz插件可以解决这个问题

![image-20231210171347327](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101713340.png)

安装之后重启tabby，测试发现仍旧不行，但我看github有人说这个问题呀，就很奇怪，算了传输文件不行还能接受，就先这样吧。

## 7.3 highlight

从名字可以看出这是一个高亮的插件，有时候的一些错误信息是需要查看的，或者调试的时候需要捕获到一些特殊字符，所以这个高亮插件还是很重要的。

![image-20231210171941753](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101719770.png)

安装完成重启，可以看到多出来了一个高亮的图标如下所示：

![image-20231210172013491](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101720547.png)

然后点击启动即可：
![image-20231210172048815](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101720063.png)

![image-20231210172058507](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101720552.png)

​	默认已经给你写好了一些关键字，自己也可以根据需求进行添加。

## 7.4 save-output

![image-20231210172326381](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101723396.png)

​	有时候需要保存终端的输出，默认情况下该终端软件是没有保存的功能的，所以需要安装一个名为save-output的插件。

​	安装完成之后会在菜单栏中多出来一个名为save-output的按钮如下所示：

![image-20231210172632938](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101726132.png)

​	设置为on之后设置要存储的路径即可。然后随意打开一个终端。按右键之后可以发现会有一个save-output to file的选项

![image-20231210172727612](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101727627.png)

点击保存即可

![image-20231210172814048](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101728088.png)

在对应的文件中可以看到打印信息，如下图所示：

![image-20231210172857106](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101728121.png)

​	到这里，关于tabby的简单设置和使用就介绍完成了，下面说一下感受吧，我之前其实并不是很喜欢这些华丽花哨的东西，感觉简简单单能用就好了，但随着时间的推移，发现有些东西并不是你想的那样的，一个好用的工具确实能给人带来不一样的体验，最后祝看到这里的小伙伴，事事顺心。

​	为了方便我的后续使用，我将相应的配置进行了打包，以后如果换电脑了只需要将下面网盘的资料放到C:\Users\Administrator\AppData\Roaming目录下解压即可。

链接：https://pan.baidu.com/s/1EBBtEmSY9SCBeIlB5YVoWQ 
提取码：bs5v 
--来自百度网盘超级会员V6的分享