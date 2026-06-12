---
title: 搭建hexo
date: 2023-09-03 09:55:17
categories:
  - 工具配置
link: 工具配置/0 搭建hexo
---

Hexo 是一个快速、简洁且高效的博客框架。Hexo 使用 [Markdown]Daring Fireball: Markdown )（或其他渲染引擎）解析文章，在几秒内，即可利用靓丽的主题生成静态网页。

# Linux 安装hexo

==以后尽可能地用Linux的hexo，使用wsl之后能非常轻松的部署上==

> ### 1. 安装 Hexo 所需的环境
>
> Hexo 基于 Node.js 运行，因此需要安装 Node.js 和 Git。
>
> #### 1.1 安装 Node.js
>
> 你可以通过 NodeSource 安装 Node.js，或者使用包管理工具来安装。建议安装最新的稳定版本。
>
> ```
> bash复制代码# 更新包管理器
> sudo apt update
> 
> # 安装 Node.js 和 npm
> sudo apt install -y nodejs npm
> ```
>
> #### 1.2 安装 Git
>
> Git 是 Hexo 部署到 GitHub 等平台的必备工具。
>
> ```
> sudo apt install -y git
> ```
> 
> ### 2. 全局安装 Hexo
> 
> 安装 Hexo 的命令行工具 `hexo-cli`。
>
> ```
>sudo npm install -g hexo-cli
> ```
>
> 安装完成后，你可以检查是否安装成功：
> 
> ```
> hexo -v
> ```

# 第一章 前期准备

## 1.1 安装前所需环境介绍

安装 Hexo 之前，需要确保您的 PC 中已经安装以下工具:

Node.js           https://nodejs.org/en
	    Git    https://git-scm.com/
如果您的电脑已经具备所需工具，那么您可以直接进入第二章开始安装 Hexo 了。

如果您还未安装这两款工具，那么请按照以下步骤进行安装。

## 1.2 安装 Git

官方下载地址: https://git-scm.com/ 
注意事项: 建议选择 64-bit Git for Windows Setup，并且安装时要勾选 Add to PATH 选项

win + R 在命令行输入cmd进入终端模式，输入下面指令，当显示版本则安装成功
git -v

## 1.3 安装 Node.js

官方下载地址:  https://nodejs.org/en
注意事项: 使用 Node.js 官方安装程序时，请确保勾选 Add to PATH 选项（默认已勾选）

win + R 在命令行输入cmd进入终端模式，输入下面指令，当显示版本则安装成功
node --version


至此，您已经完成了安装 Hexo 所需的所有额外环境，接下来就可以安装 Hexo 了。

# 第二章 安装 Hexo

## 2.1 安装 cnpm

当您安装 Node.js 之后，便可以在命令行中通过 node install 命令安装您想要的程序了。但本文推荐使用 cnpm 安装 Hexo，所以需要先通过 npm install 安装 cnpm。

命令:

~~~shell
 npm install -g cnpm --registry==https://registry.npm.taobao.org
~~~


说明: -g 表示进行全局安装，–registry==https://registry.npm.taobao.org  表示使用淘宝镜像安装 cnpm

安装后验证: 在 cmd 中输入命令 cnpm -v, 可查看 cnpm 版本

## 2.2 安装 Hexo

命令:

~~~
cnpm install -g hexo-cli
~~~

说明: -g 表示全局安装，hexo-cli 为所安装的包
安装后验证: 在 cmd 中输入命令 hexo -v, 可查看 hexo 版本

## 2.3 注意事项

建议永远安装最新版本的 Hexo，以及 [推荐的 Node.js 版本](文档 | Hexo )。
至此，您已成成功安装了 Hexo，接下来进入 Github 的配置吧!

# 第三章 配置 Github

如果您还没有 Gihub 账户，请注册一个 Github 账户吧!

## 3.1 在 Github 上创建仓库

新建一个名为: http://username.github.io  的仓库(username 为您的 Github 用户名)
比如，如果您的 github 用户名是 test，那么您就新建名为 http://test.github.io  的仓库（必须是您的用户名，其它名称无效），将来你的网站访问地址就是 https://test.github.io  了。由此可见，每一个 github 账户最多只能创建一个这样可以直接使用域名访问的仓库。

## 3.2 配置 SSH 免密登录

为什么要配置这个呢？因为您提交代码肯定要拥有您的 github 权限才可以，但是直接使用用户名和密码太不安全了，所以我们使用 ssh key 来解决本地和服务器的连接问题。

注: 如果您已经配置过 SSH，可跳过此步骤

步骤:

1、首先打开电脑文件夹，找到 C:\Users\您的用户名\ .ssh文件夹并删除(如果没有，则直接进入第二步)

2、在 C:\Users\您的用户名 文件夹下右键打开 Git Bash Here 输入命令: ssh-keygen -t rsa -C "你的github登录邮箱" 生成.ssh秘钥，输入后连敲三次回车，出现下图情况代表成功

3、生成了一个新的 C:\Users\您的用户名\ .ssh文件夹，打开这个文件夹，找到 .ssh\id_rsa.pub 文件，记事本打开并复制里面的内容

4、打开您的 github 主页，进入个人设置 -> SSH and GPG keys -> New SSH key，把复制的内容粘贴进去，title 随便填，保存即可，我们的公钥就添加成功了，设置好如下图:

5、检测是否设置成功:

输入命令: ssh -T git@github.com

看到以上信息说明 SSH 已配置成功!

如果出现提示则选择yes知道成功；

6、此外您还需要如下配置:

命令: git config --global user.name “chai0705“

命令: git config --global user.email  1361382269@qq.com 

至此，您已经成功配置好了 Github，接下来开始搭建个人博客吧!

# 第四章 使用 Hexo 搭建博客

Hexo 的一些命令
生成静态文件：hexo g；
清空静态文件：hexo cl；
在本地运行：hexo s；
部署到网站：hexo d；
生成静态文件并部署到网站：hexo d -g 或 hexo g -d；
创建新文章：hexo new <file>。

## 4.1 初始化

1、在电脑的某个磁盘或路径新建一个名为 hexo 的文件夹(名字可以随便取)，比如我的是 D:\hexo，由于这个文件夹将来就作为您存放代码的地方，所以最好不要随便放

2、在 D:\hexo 文件夹下右键打开 Git Bash Here，输入命令: hexo init 进行初始化

hexo 会自动下载一些文件到这个目录，包括 node_modules，目录结构如下图:

3、执行命令: hexo g 会在 public 文件夹下生成相关的 html 文件，这些文件将来需要提交到 Github 上

4、执行命令: hexo s 可以开启本地预览服务，打开浏览器访问 http://localhost:4000  即可看到博客内容

## 4.2 将博客部署到 Github

1、在 D:\hexo 目录下安装 hexo-deployer-git 插件

命令: npm install hexo-deployer-git --save
2、编辑 D:\hexo 目录下的 _config.yml 文件，在文件末尾添加如下内容:

注意: 其中 repository 中的内容即为 github 个人主页链接地址

3、在 D:\hexo 目录下，输入命令: hexo d 将本地 blog 推送到 github 远程仓库，也可能需要输入 username & pwd

推送成功后，即可通过https://baizhouhaoyue.github.io/访问个人博客了 !

CLASH 

![image-20230915224913754](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202309152249472.png)

![image-20230915224959370](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042118499.png)1 文章的分类和标签

# 第5章 hexo进阶

## 5.1 分类和标签

分类的话就是在最上方的状态栏中加入	categories:  属性即可

标签的话就是在最上方的状态栏中加入	tags:  属性即可



## 5.2图床搭建教程

根据这个教程来即可

[图床](https://eryinote.com/post/105)



踩坑 picgo这个软件双击并不是直接打开，而是到了右下角的小菜单。。。

![image-20230903113402329](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042118512.png)

然后在typora软件中进行简单的设置即可。如下所示：

![image-20230903114440776](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042118538.png)





至此就搞完了，其他目前也没啥需求，继续学习C++



