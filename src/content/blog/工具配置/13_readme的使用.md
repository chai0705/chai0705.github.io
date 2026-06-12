---
title: readme的使用
date: 2024-08-20 06:50:19
categories:
  - 工具配置
link: 工具配置/13_readme的使用
---

[ 2024-08-20 ](https://chai0705.github.io/2024/08/20/07_小技巧/11_ readme使用/)

 [小技巧](https://chai0705.github.io/categories/小技巧/)

 字数统计: 130  |   阅读时长≈ 1 分钟

1. [问题发布](https://chai0705.github.io/2024/08/20/07_小技巧/11_ readme使用/#问题发布)

# 问题发布

进入readme之后如下所示：

![image-20240820152323098](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042152.png)image-20240820152323098

然后点击右上角的名称进入用户界面，如下所示：

![image-20240820152418206](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042196.png)image-20240820152418206

然后点击这里的FAE项目，进入FAE界面如下所示：

![image-20240820152444567](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042176.png)image-20240820152444567

进入FAE界面如下所示，然后点击左上角的加号即可：

**![image-20240820152536358](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042169.png)image-20240820152536358**

具体的内容填写界面如下所示：

![image-20240820152755600](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042162.png)image-20240820152755600

其中只有RK芯片经销商:科通要注意一下，其他无所谓的，填写完成的表格如下所示：

![image-20240820152851767](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051042119.png)image-20240820152851767

然后等待RK的回复即可。







# rk的ssh配置

~~~shell
repo init --repo-url ssh://git@www.rockchip.com.cn/repo/rk/tools/repo -u ssh://git@www.rockchip.com.cn/linux/rockchip/platform/manifests -b linux -m rk356x_linux5.10_release.xml
~~~



~~~shell
Host www.rockchip.com.cn
    HostName www.rockchip.com.cn
    User git
    Port 22
    IdentityFile ~/.ssh/id_rsa
    PreferredAuthentications publickey
    StrictHostKeyChecking no
    UserKnownHostsFile ~/.ssh/known_hosts
    PubKeyAcceptedKeyTypes +ssh-rsa
~~~

