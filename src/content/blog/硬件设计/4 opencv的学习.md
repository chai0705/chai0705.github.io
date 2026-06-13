---
title: opencv的学习
date: 2024-01-01 00:00:00
categories:
  - 硬件设计
link: 硬件设计/4 opencv的学习
---

1|---
2|title: opencv的学习
3|date: 2024-01-01 00:00:00
4|categories:
5|  - 硬件设计
6|link: 硬件设计/4 opencv的学习
7|---
8|
9|1|---
10|2|description: "多好的周日呀，玩了一半总要学习一半，你说对吧 RGA是我总想要要学习的一个东西，只是一直没有机会，好吧，还是我自己的问题 RGA是一个硬件，他是用来加速2d的，也就是说对于画线等2d操作有很好的加速作用，而我是在哪些时候见到的RGA的呢，是在opencv里面，具体RK是怎样用的呢，我忘记了，所以这里"
11|3|cover: /img/cover/2.webp
12|4|
13|5|title: opencv的学习
14|6|date: 2023-12-09 14:17:20
15|7|categories:
16|8|  - 硬件设计
17|9|---
18|10|
19|11|==多好的周日呀，玩了一半总要学习一半，你说对吧==
20|12|
21|13|RGA是我总想要要学习的一个东西，只是一直没有机会，好吧，还是我自己的问题~
22|14|
23|15|RGA是一个硬件，他是用来加速2d的，也就是说对于画线等2d操作有很好的加速作用，而我是在哪些时候见到的RGA的呢，是在opencv里面，具体RK是怎样用的呢，我忘记了，所以这里先来重新学习一下opencv，也不用多学，只需要学习windows和Linux里面opencv的配置即可。
24|16|
25|17|# 1 windows opencv的配置
26|18|
27|19|[看样子最好的一个链接](https://blog.csdn.net/qq_45022687/article/details/120241068?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170117660416800222888362%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=170117660416800222888362&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-120241068-null-null.142^v96^pc_search_result_base2&utm_term=vscode%20opencv&spm=1018.2226.3001.4187)
28|20|下面是我根据教程来构建的步骤。
29|21|
30|22|## 1.1 软件准备
31|23|
32|24|[MinGw](https://so.csdn.net/so/search?q=MinGw&spm=1001.2101.3001.7020)：版本：8.1.0-release-posix-seh-rt_v6-rev0
33|25|
34|26|Cmake：版本：3.20.2
35|27|
36|28|[Opencv](https://so.csdn.net/so/search?q=Opencv&spm=1001.2101.3001.7020)：版本：4.5.2
37|29|
38|30|其中Cmake和opencv我当然知道是什么，cmake是用来编译oepcnv的，而mingw是什么呢？
39|31|
40|32|MinGW（Minimalist GNU for Windows）是一个用于在Windows操作系统上进行开发的开源软件开发工具集合。它提供了一组GNU工具和库，包括GCC编译器、GNU调试器（GDB）、GNU构建工具（Make）等，使开发者能够在Windows环境下编译和运行C、C++等程序。
41|33|
42|34|MinGW的目标是为Windows提供一个简洁、轻量级的开发环境，以便开发者能够在Windows上进行基于GNU工具的软件开发，而无需依赖于Microsoft Visual Studio等大型开发工具。
43|35|
44|36|MinGW基于GNU工具链，因此它支持标准的GNU编程工具和库，使开发者能够编写和构建跨平台的应用程序。通过MinGW，开发者可以使用GCC编译器在Windows上编译和构建命令行程序、库文件或者跨平台的应用程序。
45|37|
46|38|此外，MinGW还有一个变种版本叫做MinGW-w64，它提供了对64位Windows系统的支持，并且在一些方面进行了改进和扩展。
47|39|
48|40|==上面是人工智能得到的，我目前就简单的将它理解为在windows上的一个GCC工具链吧==
49|41|
50|42|## 1.2 软件的下载
51|43|
52|44|### 1.2.1 MinGw下载
53|45|
54|46|[mingw](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/)
55|47|
56|48|![image-20231128212412942](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282124974.png)
57|49|
58|50|- `x86_64`: 表示64位x86架构。
59|51|- `i686`: 表示32位x86架构（也称为x86或IA-32）。
60|52|- `posix`: 表示采用POSIX标准的操作系统接口。
61|53|- `win32`: 表示基于Windows操作系统的接口。
62|54|
63|55|对于异常处理（Exception Handling）方式：
64|56|
65|57|- `sjlj`（Set Jump/Long Jump）：使用基于setjmp/longjmp函数的异常处理机制。
66|58|- `seh`（Structured Exception Handling）：使用Windows结构化异常处理机制。
67|59|
68|60|对于调试信息（Debug Information）方式：
69|61|
70|62|- `dwarf`：使用DWARF调试格式。
71|63|- `sjlj` 和 `seh` 不涉及调试信息。
72|64|
73|65|解压该软件包之后得到ming64的文件夹，我将它放到了D盘的根目录
74|66|
75|67|![image-20231128214221986](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282142004.png)
76|68|
77|69|随后将“==D:\mingw64\bin==”这个地址加入环境变量，注：win+q 搜索环境变量可以快速打开环境配置，对Path进行配置即可，之前这里对我还挺困难的，如果现在还不懂，那就是你的问题了。最后通过“==g++ -v==”来进行验证，验证成功如下所示：
78|70|
79|71|![image-20231128215324105](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282153126.png)
80|72|
81|73|### 1.2.2 Cmake下载
82|74|
83|75|[cmake下载地址](https://cmake.org/files/)
84|76|
85|77|![image-20231128213309747](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282133808.png)
86|78|
87|79|这里直接选用最新的版本[3.28](https://cmake.org/files/v3.28/)，同理跟上面的mingw一样，以同样的方法设置cmake，解压之后的名字为cmake-3.28.0-rc5-windows-x86_64，也放到D盘下，如下所示：
88|80|
89|81|![image-20231128215506778](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282155794.png)
90|82|
91|83|具体要添加的路径为D:\cmake-3.28.0-rc5-windows-x86_64\bin，也要加入Path，然后测试如下所示：
92|84|
93|85|~~~shell
94|86|cmake --version
95|87|~~~
96|88|
97|89|![image-20231128215641421](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282156434.png)
98|90|
99|91|### 1.2.3 Opencv下载
100|92|
101|93|[opencv](https://opencv.org/releases/)
102|94|
103|95|这里也直接下windows的最新版4.8
104|96|
105|97|![image-20231128213946356](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282139382.png)
106|98|
107|99|opencv也是一样的，opencv虽然是一个exe文件，实际也是解包的一个过程，解包完成如下所示：
108|100|![image-20231128215855620](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282158637.png)
109|101|
110|102|
111|103|
112|104|## 1.3 编译
113|105|
114|106|OpenCV是一个广泛使用的计算机视觉库，它提供了各种图像和视频处理功能，用于开发计算机视觉应用程序。在Windows操作系统上，原生支持Visual Studio（VS）作为开发环境，可以直接在VS中使用OpenCV。
115|107|
116|108|然而，Visual Studio过于庞大和笨重，不太方便使用。相比之下，Visual Studio Code（VSCode）是一个轻量级的代码编辑器，具有良好的可定制性和扩展性。因此，他们选择使用VSCode作为开发环境来配置OpenCV。
117|109|
118|110|在使用VSCode配置OpenCV时，有一个重要的前提，那就是我们需要将OpenCV的源代码进行编译。编译是将源代码转换为可执行程序或库的过程。在这里，我们使用CMake作为构建工具来管理编译过程。
119|111|
120|112|
121|113|
122|114|### 1.3.1、cmake-gui
123|115|
124|116|找到cmake文件夹下的bin里的cmake-gui 文件，启动。
125|117|![image-20231128220416838](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282204857.png)
126|118|
127|119|Where is the source code: 这里使用opencv目录下的source目录
128|120|
129|121|Where to build the binaries: 这里是编译后的文件的放置目录
130|122|
131|123|配置完成如下所示：
132|124|![image-20231128220536920](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282205939.png)
133|125|
134|126|点击configure之后一点不能选错，选择如下所示：
135|127|![image-20231128220629482](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282206498.png)
136|128|
137|129|接下来编译器的选择，分别选择gcc和g++，选择完成如下所示：
138|130|![image-20231128220726753](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282207767.png)
139|131|
140|132|然后开始配置，等待配置完成：
141|133|![image-20231128220750554](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282207571.png)
142|134|
143|135|在执行完后，把关于python的都给取消勾选。勾选BUILD_opencv_world，WITH_OPENGL和BUILD_EXAMPLES，不勾选WITH_IPP、WITH_MSMF和ENABLE_PRECOMPILED_HEADERS（如果有的话），CPU_DISPATCH选空，然后继续General。
144|136|
145|137|配置完成如下所示：
146|138|
147|139|![image-20231128222444655](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282224674.png)
148|140|
149|141|到这里，该配置的也都完成了，需要去用编译生成。
150|142|
151|143|### 1.3.2 编译
152|144|
153|145|D:\opencv\build\x64\mingw
154|146|执行命令: 
155|147|
156|148|~~~
157|149|minGW32-make -j 32
158|150|~~~
159|151|
160|152|![image-20231128222621959](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282226079.png)
161|153|
162|154|问题1：
163|155|
164|156|去掉WITH_DIRECTX,WITH_OPENCL_D3D11_NV选项-代表了windows下directx的使用以及d3d功能，编译会出错，应该是需要windows相关支持
165|157|
166|158|
167|159|
168|160|问题2：
169|161|去掉 test java python
170|162|
171|163|问题3：
172|164|去掉OPENCV_GENERATE_SETUPVARS
173|165|
174|166|
175|167|
176|168|至此，编译成功：
177|169|![image-20231128224242594](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282242616.png)
178|170|
179|171|### 1.3.3 安装
180|172|
181|173|~~~
182|174|minGW32-make install
183|175|~~~
184|176|
185|177|![image-20231129072435906](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311290724934.png)
186|178|
187|179|然后我们继续添加两个环境变量：
188|180|第一个path是：D:\opencv\build\x64\vc16\bin
189|181|第二个path是：D:\opencv\build\x64\mingw\bin
190|182|
191|183|然后随便打开一个shell终端，输入以下命令测试即可。
192|184|
193|185|![image-20231129072736532](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311290727554.png)
194|186|
195|187|## 1.4 vscode配置
196|188|
197|189|最终效果
198|190|
199|191|![image-20231129205332655](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292053680.png)
200|192|
201|193|
202|194|
203|195|launch.json
204|196|
205|197|~~~json
206|198|{
207|199|
208|200|    "version": "0.2.0",
209|201|    "configurations": [
210|202|        {
211|203|            "name": "opencv debuge",
212|204|            "type": "cppdbg",
213|205|            "request": "launch",
214|206|            "program": "${workspaceFolder}\\Debugger\\${fileBasenameNoExtension}.exe",
215|207|            //上面这个Debugger是我自己定义的，为了方便放置生成的exe文件
216|208|            "args": [],
217|209|            "stopAtEntry": false, //这里如果为 false，则说明调试直接运行。（反之则停止）
218|210|            "cwd": "${workspaceFolder}",
219|211|            "environment": [],
220|212|            "externalConsole": true,//是否调用外部cmd
221|213|            "MIMode": "gdb",
222|214|            "miDebuggerPath": "D:\\mingw64\\bin\\gdb.exe",//自己进行设置
223|215|            "setupCommands": [
224|216|                {
225|217|                    "description": "为 gdb 启用整齐打印",
226|218|                    "text": "-enable-pretty-printing",
227|219|                    "ignoreFailures": false
228|220|                }
229|221|            ],
230|222|            "preLaunchTask": "opencv3.5.2"
231|223|        }
232|224|    ]
233|225|}
234|226|
235|227|
236|228|~~~
237|229|
238|230|
239|231|
240|232|c_cpp_properties.json
241|233|
242|234|~~~json
243|235|{
244|236|    "configurations": [
245|237|        {
246|238|            "name": "win",
247|239|            "includePath": [
248|240|                "${workspaceFolder}/**",
249|241|                "D:/opencv/build/x64/mingw/install/include",
250|242|                "D:/opencv/build/x64/mingw/install/include/opencv2"
251|243|            ],
252|244|            "defines": [],
253|245|            "compilerPath": "D:/mingw64/bin/g++.exe",
254|246|            "cStandard": "c11",
255|247|            "cppStandard": "c++17",
256|248|            "intelliSenseMode": "${default}"
257|249|        }
258|250|    ],
259|251|    "version": 4
260|252|}
261|253|
262|254|~~~
263|255|
264|256|
265|257|
266|258|tasks.json
267|259|
268|260|~~~json
269|261|{
270|262|    "version": "2.0.0",
271|263|    "tasks": [
272|264|        {
273|265|            "type": "shell",
274|266|            "label": "opencv3.5.2",
275|267|            "command": "D:/mingw64/bin/g++.exe",
276|268|            "args": [
277|269|                "-g",
278|270|                "${file}",
279|271|                "-o",
280|272|                "${workspaceFolder}\\Debugger\\${fileBasenameNoExtension}.exe",
281|273|                //上面这个Debugger是我自己定义的，为了方便放置生成的exe文件
282|274|                "D:/opencv/build/x64/mingw/bin/libopencv_world480.dll",
283|275|                "-I",
284|276|                "D:/opencv/build/x64/mingw/install/include",
285|277|                "-I",
286|278|                "D:/opencv/build/x64/mingw/install/include/opencv2"
287|279|            ],
288|280|            "options": {
289|281|                "cwd": "D:/mingw64/bin"
290|282|            },
291|283|            "problemMatcher": [
292|284|                "$gcc"
293|285|            ],
294|286|            "group": {
295|287|                "kind": "build",
296|288|                "isDefault": true
297|289|            }
298|290|        }
299|291|    ]
300|292|}
301|293|
302|294|~~~
303|295|
304|296|
305|297|
306|298|测试例程
307|299|
308|300|~~~c++
309|301|#include <opencv2/opencv.hpp>
310|302|#include <iostream>
311|303|
312|304|using namespace cv;
313|305|using namespace std;
314|306|
315|307|int main()
316|308|{
317|309|    VideoCapture cap(0);
318|310|    Mat img;
319|311|
320|312|    while (1)
321|313|    {
322|314|        cap >> img;
323|315|        if (img.empty())
324|316|            break;
325|317|        namedWindow("img", WINDOW_NORMAL);
326|318|        imshow("img", img);
327|319|        if (27 == waitKey(20))
328|320|            break;
329|321|    }
330|322|
331|323|    return 0;
332|324|}
333|325|~~~
334|326|
335|327|
336|328|
337|329|# 2 VS opencv的配置
338|330|
339|331|## 2.1 安装vs
340|332|
341|333|​	上面是VS code配置opencv事实上，可以直接通过vs来配置，上面也算是走了弯路了。
342|334|
343|335|[VS 官网](https://visualstudio.microsoft.com/zh-hans/)
344|336|
345|337|​	等待安装完成：
346|338|
347|339|![image-20231129210245054](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292102072.png) 
348|340|
349|341|安装程序下载安装验证完毕，将会提示进入这个界面
350|342|
351|343|![image-20231129210632825](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292106854.png)
352|344|
353|345|
354|346|
355|347|选择C++的桌面开发和Visual Studio 扩展开发，然后更改安装位置。
356|348|
357|349|![image-20231129210813082](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292108111.png)
358|350|
359|351|![image-20231129210828463](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292108494.png)
360|352|
361|353|![image-20231129210742854](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292107884.png)
362|354|
363|355|## 2.2 安装opencv
364|356|
365|357|​	在第一小节已经讲解过，就不再讲了
366|358|
367|359|## 2.3 配置VSCODE
368|360|
369|361|​	其实也就那几步，没啥好写的，我留个[链接](https://blog.csdn.net/weixin_54583016/article/details/121424060?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170126271516800186526751%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=170126271516800186526751&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-121424060-null-null.142^v96^pc_search_result_base2&utm_term=vs%20opencv&spm=1018.2226.3001.4187)吧
370|362|
371|363|测试完成如下所示：
372|364|![image-20231129215026178](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292150244.png)
373|365|
374|366|​	既然opencv中已经在ubuntu提供的库中了，那为什么人们更多的还是自己编译opencv再使用呢，就比如下面这个例子：
375|367|![image-20231017205544904](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116812.png)
376|368|
377|369|想用一些库，然而发现ubuntu自带的opencv是没有开启的，这时候就要自己编译opencv了。
378|370|
379|371|# 3 oepncv源码的编译（Linux）
380|372|
381|373|## 1.拉取opencv源码
382|374|
383|375|opencv地址 **https://opencv.org/releases/**
384|376|
385|377|https://github.com/opencv/opencv
386|378|
387|379|opencv-contrib 链接https://github.com/opencv/opencv_contrib
388|380|
389|381|OpenCV (Open Source Computer Vision Library) 是一个开源计算机视觉和图像处理库，提供了一系列用于处理图像和视频的函数和工具。OpenCV-contrib（OpenCV contributions）是对OpenCV的扩展和补充，包含了一些额外的模块和功能，以增强OpenCV的功能和应用范围。
390|382|
391|383|OpenCV-contrib模块是由OpenCV社区的开发人员和贡献者创建和维护的，它提供了许多实用的功能、算法和工具，用于计算机视觉、图像处理、目标检测、机器学习等领域的应用。
392|384|
393|385|以下是一些常见的OpenCV-contrib模块及其功能：
394|386|
395|387|1. **aruco**：提供了用于检测和跟踪ArUco标记的函数和类。ArUco标记是一种用于增强现实和相机姿态估计的二维条码。
396|388|2. **bgsegm**：包含了一些背景分割算法的实现，用于从视频中提取前景对象。这些算法可以用于运动检测、目标跟踪等任务。
397|389|3. **bioinspired**：实现了一些生物启发式的图像处理算法，包括视网膜模型、光流估计等。这些算法受到生物视觉系统的启发，用于模拟人眼的感知机制。
398|390|4. **dnn**：提供了深度学习的支持，包括加载和运行基于深度学习模型的图像分类、目标检测和图像分割等任务。
399|391|5. **face**：包含了人脸检测、人脸识别和人脸特征点检测等相关功能。这些功能可以用于人脸分析、人脸识别和表情识别等应用。
400|392|6. **text**：提供了文本检测和识别的功能，可以用于场景文本检测、OCR（光学字符识别）等任务。
401|393|7. **xfeatures2d**：扩展了OpenCV的特征检测和描述子模块，提供了一些额外的特征检测算法和描述子算法，如SURF、SIFT等。
402|394|
403|395|除了上述模块，OpenCV-contrib还包括其他一些模块和功能，如光学流、结构光、三维重建、图像分割等。这些模块和功能可以通过下载和编译OpenCV-contrib库来使用。
404|396|
405|397|在这里就只是编译opencv源码了，也就不再添加opencv-contrib，目前是用不到的。
406|398|
407|399|克隆opencv源码
408|400|
409|401|~~~shell
410|402|git clone https://github.com/opencv/opencv
411|403|~~~
412|404|
413|405|github的仓库源码太大了，还是直接从官网下载吧~，这里下载最新的opencv4.8 ，拷贝到ubuntu之上然后解压：
414|406|![image-20231017210921130](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116816.png)
415|407|
416|408|在编译之前还需要先安装一些依赖
417|409|
418|410|~~~shell
419|411|sudo apt-get install build-essential 
420|412|
421|413|sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
422|414|
423|415|sudo apt-get install python-dev-is-python2 python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev  libdc1394-22-dev
424|416|
425|417|pip3 install numpy
426|418| 
427|419|sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 100
428|420|sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 150
429|421|~~~
430|422|
431|423|## 2.源码编译（PC）
432|424|
433|425|然后在opencv源码目录下创建一个build目录进行工程
434|426|
435|427|~~~
436|428|mkdir build
437|429|cd build
438|430|~~~
439|431|
440|432|构建命令如下所示：
441|433|
442|434|(1) 构建静态库
443|435|
444|436|~~~shell
445|437|cmake -D  CMAKE_INSTALL_PREFIX=/usr/local \
446|438|-D CMAKE_BUILD_TYPE=Release \
447|439|-D OPENCV_GENERATE_PKGCONFIG=ON \
448|440|-D WITH_QUIRC=ON  \
449|441|-D OPENCV_ENABLE_NONFREE=True \
450|442|-D OPENCV_GENERATE_PKGCONFIG=YES \
451|443|-D WITH_OPENGL=ON \
452|444|-D ENABLE_CXX11=1 \
453|445|-D WITH_OPENMP=ON \
454|446|-D WITH_1394=OFF \
455|447|-D INSTALL_C_EXAMPLES=OFF \
456|448|-D BUILD_EXAMPLES=OFF \
457|449|-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
458|450|-D BUILD_opencv_python3=yes \
459|451|-D BUILD_opencv_python2=no \
460|452|-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
461|453|-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
462|454|-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
463|455|-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
464|456|-D BUILD_SHARED_LIBS=OFF \
465|457|..
466|458|~~~
467|459|
468|460|
469|461|
470|462|(2)构建动态库
471|463|
472|464|~~~shell
473|465|cmake -D CMAKE_INSTALL_PREFIX=/usr/local \
474|466|-D CMAKE_BUILD_TYPE=Release \
475|467|-D OPENCV_GENERATE_PKGCONFIG=ON \
476|468|-D WITH_QUIRC=ON  \
477|469|-D OPENCV_ENABLE_NONFREE=True \
478|470|-D OPENCV_GENERATE_PKGCONFIG=YES \
479|471|-D WITH_OPENGL=ON \
480|472|-D ENABLE_CXX11=1 \
481|473|-D WITH_OPENMP=ON \
482|474|-D WITH_1394=OFF \
483|475|-D INSTALL_C_EXAMPLES=OFF \
484|476|-D BUILD_EXAMPLES=OFF \
485|477|-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
486|478|-D BUILD_opencv_python3=yes \
487|479|-D BUILD_opencv_python2=no \
488|480|-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
489|481|-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
490|482|-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
491|483|-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
492|484|..
493|485|~~~
494|486|
495|487|- `-D CMAKE_INSTALL_PREFIX=/usr/local`: 指定安装目录为`/usr/local`，生成的库和可执行文件将安装到该目录下。
496|488|- `-D CMAKE_BUILD_TYPE=Release`: 指定构建类型为"Release"，这意味着生成的库将进行优化，并且不包含调试信息。
497|489|- `-D OPENCV_GENERATE_PKGCONFIG=ON`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
498|490|- `-D WITH_QUIRC=ON`: 启用QUIRC支持，QUIRC是用于解码二维条码（如QR码）的库。通过这个参数，编译生成的OpenCV库将包含QUIRC功能。
499|491|- `-D OPENCV_ENABLE_NONFREE=True`: 启用非免费模块，这些模块可能包含受限制的功能，需要购买或获取许可证才能使用。
500|492|- `-D OPENCV_GENERATE_PKGCONFIG=YES`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
501|