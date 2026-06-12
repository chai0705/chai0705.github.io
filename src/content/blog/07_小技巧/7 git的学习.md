---
title: git的学习
date: 2023-12-10 10:50:19
categories:
  - 小技巧
link: 07_小技巧/7 git的学习
---

​	前提条件，先来说一下未什么要学习git吧，目前先不考虑远程git和github，我目前只是想要在Linux环境下进行git的使用，说一个最简单的目的，我想让我的Linux目录用到什么就显示什么，而且其他的文件也会进行存档，当我需要这个项目的时候就切换到这个分支进行开发，而不是像我现在这个样子，还要保存，删除等等，这样我也能知道我都做了哪些的修改，目前的需求就这样，学习去。

拉取全部分支，但是只拉取最近的log

~~~shell
git clone --depth 1 --no-single-branch git@github.com:chai0705/ubuntu.git
~~~



# 1.git的安装

​	关于git的介绍就不再多说了，linus的丰功伟绩，一直是我的指路明灯，也是我为之不断努力的方向， 过多的就不再多说。

安装需要的插件：

~~~shell
sudo apt-get install libcurl4-gnutls-dev libexpat1-dev gettext libz-dev libssl-dev git
~~~

![image-20231210103658547](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101036140.png)

安装完成之后查看git的版本：

~~~shell
git --version
~~~

![image-20231210103828814](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101038851.png)

# 2. git的配置

配置个人的用户名和电子邮箱

~~~shell
git config --global user.name "chai"
git config --global user.email "1361382269@qq.com"
~~~

![image-20231210104002380](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101040420.png)

查看配置

~~~shell
git config --list --global
~~~

![image-20231210104018710](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101040757.png)

配置也可以在 ~/.gitconfig 或 /etc/gitconfig 看到这里加上 --global 是全局的配置， 如果想要在某个特定的配置中使用单独的配置就将–global去掉

设置颜色差异：
~~~shell
git config --global color.ui true
~~~

设置git命令补全

~~~shell
wget https://github.com/markgandolfo/git-bash-completion/blob/master/git-completion.bash
~~~

![image-20231210110546532](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101105829.png)

​	然后将

~~~shell
sudo mv git-completion.bash /usr/bin/
sudo echo source /usr/bin/git-completion.bash >> /home/topeet/.bashrc
# root的配置文件需要权限，sudo不顶用，所以要换到root用户
sudo echo source /usr/bin/git-completion.bash >> /root/.bashrc
~~~

![image-20231210111049872](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101110920.png)

现在git就可以正常的进行命令的提示了，如下图所示：
![image-20231210111136282](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101111447.png)

==默认情况下ssh连接是不能翻墙的，原因是一些环境变量的问题，所以就需要手动导入一下下面的上网的环境变量==

~~~
export ftp_proxy=http://127.0.0.1:8889/
export https_proxy=http://127.0.0.1:8889/
export FTP_PROXY=http://127.0.0.1:8889/
export HTTPS_PROXY=http://127.0.0.1:8889/
export HTTP_PROXY=http://127.0.0.1:8889/
export http_proxy=http://127.0.0.1:8889/
~~~

目前还不想用码云和github所以这里的ssh配置就先不配置

==另一个方法，更简单，使用自带的即可==

~~~
sudo echo source /usr/share/bash-completion/completions/git >> /home/topeet/.bashrc
sudo echo source /usr/share/bash-completion/completions/git  >> /home/topeet/.bashrc
~~~



# 3.git 基础理论

​	我其实早就学习过了一遍git了，但是一直没有用起来，关于理论这里也算是学习过了，而git的核心命令也就在这个地方。我这里就不复制了，凭借我的记忆复述一下。

​	git有三个工作区域，分别为工作目录（working directory）、暂存区（stage/index）和资源库（repository），而原创git仓库这里先不管，以后再说，大概是长这个样子：

![image-20231210111712990](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101117006.png)

加上各种命令的切换，长这个样子：
![在这里插入图片描述](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101117699.png)

Workspace:工作区，就是平时存放项目代码的地方

Index/Stage:暂存区，用于临时存放你的改动，事实上它是一个文件，保存即将提交的列表信息

local Repository:仓库区（或本地仓库），就是安全存放数据的位置，这里有你提交到所有版本的数据，其中HEAD指向最新放入仓库的版本

Remote Repository:远程仓库，托管代码的服务器，可以简单的认为是你项目组中的一台电脑用于远程数据交换

# 4.git工作流程

git的工作流程一般是这样的：

1. 在工作中添加，修改文件

2. 将需要进行的版本管理的文件放入暂存区域

3. 将暂存区域文件提交到git仓库

   因此，git管理的文件有三种状态：已修改（modified）,已暂存（staged）,已提交（committed）

![在这里插入图片描述](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101131377.png)

# 5.Git项目搭建

工作目录（WorkSpace）一般就是你希望Git帮助你管理的文件夹，可以是你的项目目录，也可以是空目录，建议不要有中文。

日常使用只需要记住下图6个命令：

![在这里插入图片描述](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101137263.png)

建立一个git仓库

~~~
git init
~~~

![image-20231210113938373](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101139420.png)

执行万命令后可以看到，仅仅在项目目录多出了一个.git目录（注意这个默认是隐藏的文件夹，需要手动在查看选项里面去掉隐藏的文件才能显示），关于版本等所有信息都在这个目录里面

![image-20231210114003052](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101140306.png)

git文件操作

版本控制就是对文件的版本控制，要对文件进行修改，提交等操作，首先要知道文件当前什么状态，不然可能会提交了现在还不想提交的文件，或者要提交的文件没提交上。

​	(1):Untracked:未跟踪，此文件在文件夹中，但并没有加入到git仓库，不参与版本控制.通过git add 状态变为Staged.

​	(2):Unmodify:文件已经入库，未修改，即版本库中的文件快照内容与文件夹完全一致.这种类型的文件有两种去处，如果它被修改，而变为Modified.如果使用git rm 移出版本库，则成为Untracked文件.

​	(3):Modified:文件已修改，仅仅是修改，并没有进行其他的操作.这个文件也有两个去处，通过git add可进入暂存staged状态，使用git 

checkout，则丢弃修改过，返回unmodify状态，这个git checkout即从库中取出文件，覆盖当前修改！

​	(4):Staged：暂存状态，执行git commit则将修改同步到库中，这时库中的文件和本地文件又变为一致，文件为Unmodify状态.执行git 

reset 

查看制定文件状态

~~~shell
git status [文件名]
~~~

![image-20231210114548647](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101145780.png)

查看所有文件状态

~~~shell
git status
~~~

![image-20231210114602428](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101146553.png)

添加所有文件到暂存区

~~~shell
git add . 
~~~

![image-20231210114733202](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101147341.png)

​	这里也仅仅只是将工作区上传到了暂存区，可以看到status已经变为了绿色。

提交暂存区中的内容到本地仓库 -m:提交的信息

~~~shell
git commit -m "信息"
~~~

![image-20231210114849962](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101148098.png)

可以看到git status的状态也已经更新了，如下所示：
![image-20231210114917210](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101149264.png)

# 6.忽略文件

有些时候我们不想把某些文件纳入版本控制中，比如数据库文件，临时文件，设计文件等

在主目录下建立“.gitignore”文件，此文件有如下规则：

1.忽略文件中的空行或以井号（# ）开始的行将会被忽略。

2.可以使用Linux通配符。例如∶星号(*)代表任意多个字符，问号(﹖)代表一个字符，方括号([abc] )代表可选字符范围，大括号( {string1,string2……})代表可选的字符串等。

3.如果名称的最前面有一个感叹号( !)，表示例外规则，将不被忽略。

4.如果名称的最前面是一个路径分隔符(/ )，表示要忽略的文件在此目录下，而子目录中的文件不忽略。

5.如果名称的最后面是一个路径分隔符(/ )，表示要忽略的是此目录下该名称的子目录，而非文件（默认文件或目录都忽略）。

例如以下这些实例:

~~~
*.txt   #忽略所有的.txt结尾的文件
！lib.txt  #但lib.txt除外
/temp  #进忽略项目根目录下的TODO文件，不包括其他目录temp
bulid/  #忽略bulid目录下的所有文件
doc/*.txt #会忽略doc/notes.txt 但是不包括doc/sever/arch.txt
~~~

# 7.查看日志以及恢复版本

在第5小节已经进行了第一次的提交，然后我进行第二次的提交

![image-20231210115334834](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101153879.png)

上面是进行的修改，接下来进行提交，如下所示：
![image-20231210115438817](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101154938.png)

然后进行提交的查看

~~~
git log
~~~

![image-20231210115527651](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101155808.png)

可以看到这是两个提交，现在指向的是第二次提交，而目前的情况是这样的，这一次的提交是错误的我不想要了，我想回退到第一次的提交，可以使用git reset进行回复

~~~
git reset [哈希值]
~~~

![image-20231210115707464](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101157577.png)

然后查看提交的状态如下所示：
![image-20231210115820807](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101158910.png)

但是仍旧需要手动删除才行，如下所示：
![image-20231210115912689](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101159755.png)

# 8.分支操作

分支是Git使用过程中非常重要的概念。使用分支意味着你可以把你的工作从开发主线上分离开来，以免影响开发主线。同一个仓库可以有多个分支,各个分支相互独立,互不干扰。通过git init命令创建本地仓库时默认会创建- -个master分支。

​	==之前还是不懂，对于分支有了不一样的想法，分支并不是一个新的，而是一个当前内容的分支==

查看分支：

（1）列出所有本地分支

~~~
git branch
~~~

![image-20231210120127025](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101201065.png)

列出所有远程分支

~~~
git branch -r
~~~

列出所有本地分支和远程分支

~~~
git branch -a
~~~

我这里并没有涉及到远程分支，所以也就先不用管。

（2）创建分支

~~~
git branch name
~~~

![image-20231210120516908](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101205974.png)

（3）删除分支

~~~
git branch -d name
~~~

![image-20231210120535123](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101205187.png)

（4）分支切换

首先在主分支创建了一个markdown测试文件，并且提交

![image-20231210121055669](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101210757.png)

然后创建另一个分支

~~~shell
git branch test
~~~

![image-20231210121207568](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101212631.png)

切换到新创建的分支

~~~
git checkout name
~~~

这里关于分支的还是不太懂，这里应该是要看一看视频。现在懂了，分支的名称才真正的懂得了。

（5）分支合并

![image-20231210150127690](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101501055.png)

可以看到目前head领先了master一个提交，使用下面的命令进行分支合并，将分支上的修改进行合并

~~~shell
git merge test
~~~

![image-20231210150257210](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312101502556.png)					可以看到head和master已经是同一个分支了。

9.scp命令的学习

`scp`（Secure Copy）命令用于在本地主机和远程主机之间进行文件传输。它使用SSH协议进行安全的文件传输。

`scp`命令的基本语法如下：

```shell
scp [选项] 源文件 目标文件
```

其中，`源文件`是要传输的文件或目录的路径，`目标文件`是传输到的目标位置的路径。

以下是一些常用的`scp`命令选项：

- `-r`：递归复制整个目录。
- `-P <port>`：指定SSH端口号。
- `-i <identity_file>`：指定用于身份验证的私钥文件。
- `-v`：显示详细的调试信息。
- `-C`：开启压缩传输。

下面是几个示例，演示了如何使用`scp`命令：

1. 从本地主机复制文件到远程主机：

   ```shell
   scp /path/to/local/file user@remote:/path/to/destination/
   ```

2. 从远程主机复制文件到本地主机：

   ```shell
   scp user@remote:/path/to/remote/file /path/to/destination/
   ```

3. 从本地主机复制整个目录到远程主机：

   ```shell
   scp -r /path/to/local/directory user@remote:/path/to/destination/
   ```

4. 从远程主机复制整个目录到本地主机：

   ```shell
   scp -r user@remote:/path/to/remote/directory /path/to/destination/
   ```

这些示例中的`user`是远程主机上的用户名，`remote`是远程主机的地址（可以是IP地址或域名），`/path/to/`是文件或目录的路径。
