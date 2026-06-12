---
title: PCB学习
date: 2023-11-12 21:55:17
categories:
  - PCB学习
link: 09_PCB学习/1 ad学习
---

从今天开始学习一下PCB的学习，我当然也是想画一些高速PCB板子，那些8层的、10层的，但是路还很远，很长，所以慢慢的加油吧。

11月12 日，今天来学习第一部分，软件的安装，由于使用的是两层板，版本是AD19,所以这里要先进行软件的安装和设置，后续的内容，下一个星期日再见。

# 1 AD 19软件安装和配置

~~~
链接：https://pan.baidu.com/s/1gznZRe00REAmoUThExJrCQ 
提取码：gtqh 
--来自百度网盘超级会员V6的分享
~~~

下载之后如下图所示：

![image-20231112205457032](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122054070.png)

先来安装：
![image-20231112205829074](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122058090.png)

这里的安装倒是没啥，换个中文然后下一步即可，等待安装完成：

![image-20231112205938748](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122059776.png)

然后来到License文件

![image-20231112210025754](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122100769.png)

将两个用于破解和验证的文件放到安装的AD目录，

![image-20231112211807344](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122118366.png)

然后打开AD软件，找到add licence

![image-20231112211923345](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122119378.png)

然后找到拷贝过去的alf文件，点击确定，破解完成如下图所示：

![image-20231112212333451](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122123467.png)

然后进行中文的切换，点击右上角的小齿轮，进入设置界面，如下图所示：

![image-20231112212448161](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122124175.png)

![image-20231112212500549](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122125573.png)

点击使用本地资源，如下图所示：
![image-20231112212529208](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122125233.png)

设置完成之后，重启ad软件即可，可以看到已经是中文了。

![image-20231112212617017](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122126032.png)

 [*navigation*](http://www.baidu.com/link?url=g5y-7qzhA8Qmd06DRFxhB5NMwanpnh580e8Dyaa7qAnmN373vLCa5UQZL42gPzCSzdfLiKF4PSbBsMfZ7DzTnq) 导航，这里可以通过原理图去寻找PCB，需要注意的是右面只是保存了元件，其他两个可能并不好用

![image-20231112213052978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122130017.png)

然后是design insight，将这些全部取消勾选

![image-20231112213241293](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122132319.png)

然后是data 的自动保存，这里设置十分钟自动保存：
![image-20231112213355211](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122133235.png)

原理图中的\代表负信号，进行勾选

![image-20231112213527468](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122135497.png)

PCB中的设置，这里的光标类型选择Large 90，然后文件报告忽略都打开
![image-20231112213743978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122137017.png)

![image-20231112213854832](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122138876.png)

显示抬头颜色这里取消：
![image-20231112214002651](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122140678.png)

颜色选择实心覆盖：
![image-20231112214048376](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122140402.png)

过孔大小设置为12 和 24，并且i勾选盖油

![image-20231112214328703](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122143733.png)

铜皮操作，设置大小为4和5，移除死铜

![image-20231112214442963](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122144991.png)

保存好的ad配置网盘链接如下所示：
链接：https://pan.baidu.com/s/1EKzwbSOtfkkl_NPCFTDGCw 
提取码：sd8a 
--来自百度网盘超级会员V6的分享

可以直接进行导入即可，省去了这一系列的设置，还是挺方便的。

==11月12日 21：48学习完成，下一次学习就是下个周日了，希望不会忘记==