---
title: ad学习
date: 2024-01-01 00:00:00
categories:
  - 硬件设计
link: 硬件设计/1 ad学习
---

1|---
2|description: "从今天开始学习一下PCB的学习，我当然也是想画一些高速PCB板子，那些8层的、10层的，但是路还很远，很长，所以慢慢的加油吧。 11月12 日，今天来学习第一部分，软件的安装，由于使用的是两层板，版本是AD19,所以这里要先进行软件的安装和设置，后续的内容，下一个星期日再见。 1 AD 19软件安"
3|cover: /img/cover/5.webp
4|title: PCB学习
5|date: 2023-11-12 21:55:17
6|categories:
7|  - 硬件设计
8|link: 硬件设计/1 ad学习
9|---
10|11|
11|12|从今天开始学习一下PCB的学习，我当然也是想画一些高速PCB板子，那些8层的、10层的，但是路还很远，很长，所以慢慢的加油吧。
12|13|
13|14|11月12 日，今天来学习第一部分，软件的安装，由于使用的是两层板，版本是AD19,所以这里要先进行软件的安装和设置，后续的内容，下一个星期日再见。
14|15|
15|16|# 1 AD 19软件安装和配置
16|17|
17|18|~~~
18|19|链接：https://pan.baidu.com/s/1gznZRe00REAmoUThExJrCQ 
19|20|提取码：gtqh 
20|21|--来自百度网盘超级会员V6的分享
21|22|~~~
22|23|
23|24|下载之后如下图所示：
24|25|
25|26|![image-20231112205457032](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122054070.png)
26|27|
27|28|先来安装：
28|29|![image-20231112205829074](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122058090.png)
29|30|
30|31|这里的安装倒是没啥，换个中文然后下一步即可，等待安装完成：
31|32|
32|33|![image-20231112205938748](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122059776.png)
33|34|
34|35|然后来到License文件
35|36|
36|37|![image-20231112210025754](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122100769.png)
37|38|
38|39|将两个用于破解和验证的文件放到安装的AD目录，
39|40|
40|41|![image-20231112211807344](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122118366.png)
41|42|
42|43|然后打开AD软件，找到add licence
43|44|
44|45|![image-20231112211923345](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122119378.png)
45|46|
46|47|然后找到拷贝过去的alf文件，点击确定，破解完成如下图所示：
47|48|
48|49|![image-20231112212333451](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122123467.png)
49|50|
50|51|然后进行中文的切换，点击右上角的小齿轮，进入设置界面，如下图所示：
51|52|
52|53|![image-20231112212448161](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122124175.png)
53|54|
54|55|![image-20231112212500549](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122125573.png)
55|56|
56|57|点击使用本地资源，如下图所示：
57|58|![image-20231112212529208](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122125233.png)
58|59|
59|60|设置完成之后，重启ad软件即可，可以看到已经是中文了。
60|61|
61|62|![image-20231112212617017](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122126032.png)
62|63|
63|64| [*navigation*](http://www.baidu.com/link?url=g5y-7qzhA8Qmd06DRFxhB5NMwanpnh580e8Dyaa7qAnmN373vLCa5UQZL42gPzCSzdfLiKF4PSbBsMfZ7DzTnq) 导航，这里可以通过原理图去寻找PCB，需要注意的是右面只是保存了元件，其他两个可能并不好用
64|65|
65|66|![image-20231112213052978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122130017.png)
66|67|
67|68|然后是design insight，将这些全部取消勾选
68|69|
69|70|![image-20231112213241293](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122132319.png)
70|71|
71|72|然后是data 的自动保存，这里设置十分钟自动保存：
72|73|![image-20231112213355211](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122133235.png)
73|74|
74|75|原理图中的\代表负信号，进行勾选
75|76|
76|77|![image-20231112213527468](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122135497.png)
77|78|
78|79|PCB中的设置，这里的光标类型选择Large 90，然后文件报告忽略都打开
79|80|![image-20231112213743978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122137017.png)
80|81|
81|82|![image-20231112213854832](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122138876.png)
82|83|
83|84|显示抬头颜色这里取消：
84|85|![image-20231112214002651](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122140678.png)
85|86|
86|87|颜色选择实心覆盖：
87|88|![image-20231112214048376](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122140402.png)
88|89|
89|90|过孔大小设置为12 和 24，并且i勾选盖油
90|91|
91|92|![image-20231112214328703](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122143733.png)
92|93|
93|94|铜皮操作，设置大小为4和5，移除死铜
94|95|
95|96|![image-20231112214442963](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311122144991.png)
96|97|
97|98|保存好的ad配置网盘链接如下所示：
98|99|链接：https://pan.baidu.com/s/1EKzwbSOtfkkl_NPCFTDGCw 
99|100|提取码：sd8a 
100|101|--来自百度网盘超级会员V6的分享
101|102|
102|103|可以直接进行导入即可，省去了这一系列的设置，还是挺方便的。
103|104|
104|105|==11月12日 21：48学习完成，下一次学习就是下个周日了，希望不会忘记==