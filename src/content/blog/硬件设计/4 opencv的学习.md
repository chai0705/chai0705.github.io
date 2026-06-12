---
title: opencv的学习
date: 2023-12-09 14:17:20
categories:
  - 硬件设计
link: 10_音视频学习/4 opencv的学习
---

==多好的周日呀，玩了一半总要学习一半，你说对吧==

RGA是我总想要要学习的一个东西，只是一直没有机会，好吧，还是我自己的问题~

RGA是一个硬件，他是用来加速2d的，也就是说对于画线等2d操作有很好的加速作用，而我是在哪些时候见到的RGA的呢，是在opencv里面，具体RK是怎样用的呢，我忘记了，所以这里先来重新学习一下opencv，也不用多学，只需要学习windows和Linux里面opencv的配置即可。

# 1 windows opencv的配置

[看样子最好的一个链接](https://blog.csdn.net/qq_45022687/article/details/120241068?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170117660416800222888362%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=170117660416800222888362&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-120241068-null-null.142^v96^pc_search_result_base2&utm_term=vscode%20opencv&spm=1018.2226.3001.4187)
下面是我根据教程来构建的步骤。

## 1.1 软件准备

[MinGw](https://so.csdn.net/so/search?q=MinGw&spm=1001.2101.3001.7020)：版本：8.1.0-release-posix-seh-rt_v6-rev0

Cmake：版本：3.20.2

[Opencv](https://so.csdn.net/so/search?q=Opencv&spm=1001.2101.3001.7020)：版本：4.5.2

其中Cmake和opencv我当然知道是什么，cmake是用来编译oepcnv的，而mingw是什么呢？

MinGW（Minimalist GNU for Windows）是一个用于在Windows操作系统上进行开发的开源软件开发工具集合。它提供了一组GNU工具和库，包括GCC编译器、GNU调试器（GDB）、GNU构建工具（Make）等，使开发者能够在Windows环境下编译和运行C、C++等程序。

MinGW的目标是为Windows提供一个简洁、轻量级的开发环境，以便开发者能够在Windows上进行基于GNU工具的软件开发，而无需依赖于Microsoft Visual Studio等大型开发工具。

MinGW基于GNU工具链，因此它支持标准的GNU编程工具和库，使开发者能够编写和构建跨平台的应用程序。通过MinGW，开发者可以使用GCC编译器在Windows上编译和构建命令行程序、库文件或者跨平台的应用程序。

此外，MinGW还有一个变种版本叫做MinGW-w64，它提供了对64位Windows系统的支持，并且在一些方面进行了改进和扩展。

==上面是人工智能得到的，我目前就简单的将它理解为在windows上的一个GCC工具链吧==

## 1.2 软件的下载

### 1.2.1 MinGw下载

[mingw](https://sourceforge.net/projects/mingw-w64/files/mingw-w64/)

![image-20231128212412942](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282124974.png)

- `x86_64`: 表示64位x86架构。
- `i686`: 表示32位x86架构（也称为x86或IA-32）。
- `posix`: 表示采用POSIX标准的操作系统接口。
- `win32`: 表示基于Windows操作系统的接口。

对于异常处理（Exception Handling）方式：

- `sjlj`（Set Jump/Long Jump）：使用基于setjmp/longjmp函数的异常处理机制。
- `seh`（Structured Exception Handling）：使用Windows结构化异常处理机制。

对于调试信息（Debug Information）方式：

- `dwarf`：使用DWARF调试格式。
- `sjlj` 和 `seh` 不涉及调试信息。

解压该软件包之后得到ming64的文件夹，我将它放到了D盘的根目录

![image-20231128214221986](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282142004.png)

随后将“==D:\mingw64\bin==”这个地址加入环境变量，注：win+q 搜索环境变量可以快速打开环境配置，对Path进行配置即可，之前这里对我还挺困难的，如果现在还不懂，那就是你的问题了。最后通过“==g++ -v==”来进行验证，验证成功如下所示：

![image-20231128215324105](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282153126.png)

### 1.2.2 Cmake下载

[cmake下载地址](https://cmake.org/files/)

![image-20231128213309747](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282133808.png)

这里直接选用最新的版本[3.28](https://cmake.org/files/v3.28/)，同理跟上面的mingw一样，以同样的方法设置cmake，解压之后的名字为cmake-3.28.0-rc5-windows-x86_64，也放到D盘下，如下所示：

![image-20231128215506778](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282155794.png)

具体要添加的路径为D:\cmake-3.28.0-rc5-windows-x86_64\bin，也要加入Path，然后测试如下所示：

~~~shell
cmake --version
~~~

![image-20231128215641421](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282156434.png)

### 1.2.3 Opencv下载

[opencv](https://opencv.org/releases/)

这里也直接下windows的最新版4.8

![image-20231128213946356](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282139382.png)

opencv也是一样的，opencv虽然是一个exe文件，实际也是解包的一个过程，解包完成如下所示：
![image-20231128215855620](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282158637.png)



## 1.3 编译

OpenCV是一个广泛使用的计算机视觉库，它提供了各种图像和视频处理功能，用于开发计算机视觉应用程序。在Windows操作系统上，原生支持Visual Studio（VS）作为开发环境，可以直接在VS中使用OpenCV。

然而，Visual Studio过于庞大和笨重，不太方便使用。相比之下，Visual Studio Code（VSCode）是一个轻量级的代码编辑器，具有良好的可定制性和扩展性。因此，他们选择使用VSCode作为开发环境来配置OpenCV。

在使用VSCode配置OpenCV时，有一个重要的前提，那就是我们需要将OpenCV的源代码进行编译。编译是将源代码转换为可执行程序或库的过程。在这里，我们使用CMake作为构建工具来管理编译过程。



### 1.3.1、cmake-gui

找到cmake文件夹下的bin里的cmake-gui 文件，启动。
![image-20231128220416838](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282204857.png)

Where is the source code: 这里使用opencv目录下的source目录

Where to build the binaries: 这里是编译后的文件的放置目录

配置完成如下所示：
![image-20231128220536920](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282205939.png)

点击configure之后一点不能选错，选择如下所示：
![image-20231128220629482](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282206498.png)

接下来编译器的选择，分别选择gcc和g++，选择完成如下所示：
![image-20231128220726753](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282207767.png)

然后开始配置，等待配置完成：
![image-20231128220750554](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282207571.png)

在执行完后，把关于python的都给取消勾选。勾选BUILD_opencv_world，WITH_OPENGL和BUILD_EXAMPLES，不勾选WITH_IPP、WITH_MSMF和ENABLE_PRECOMPILED_HEADERS（如果有的话），CPU_DISPATCH选空，然后继续General。

配置完成如下所示：

![image-20231128222444655](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282224674.png)

到这里，该配置的也都完成了，需要去用编译生成。

### 1.3.2 编译

D:\opencv\build\x64\mingw
执行命令: 

~~~
minGW32-make -j 32
~~~

![image-20231128222621959](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282226079.png)

问题1：

去掉WITH_DIRECTX,WITH_OPENCL_D3D11_NV选项-代表了windows下directx的使用以及d3d功能，编译会出错，应该是需要windows相关支持



问题2：
去掉 test java python

问题3：
去掉OPENCV_GENERATE_SETUPVARS



至此，编译成功：
![image-20231128224242594](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311282242616.png)

### 1.3.3 安装

~~~
minGW32-make install
~~~

![image-20231129072435906](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311290724934.png)

然后我们继续添加两个环境变量：
第一个path是：D:\opencv\build\x64\vc16\bin
第二个path是：D:\opencv\build\x64\mingw\bin

然后随便打开一个shell终端，输入以下命令测试即可。

![image-20231129072736532](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311290727554.png)

## 1.4 vscode配置

最终效果

![image-20231129205332655](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292053680.png)



launch.json

~~~json
{

    "version": "0.2.0",
    "configurations": [
        {
            "name": "opencv debuge",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}\\Debugger\\${fileBasenameNoExtension}.exe",
            //上面这个Debugger是我自己定义的，为了方便放置生成的exe文件
            "args": [],
            "stopAtEntry": false, //这里如果为 false，则说明调试直接运行。（反之则停止）
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": true,//是否调用外部cmd
            "MIMode": "gdb",
            "miDebuggerPath": "D:\\mingw64\\bin\\gdb.exe",//自己进行设置
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": false
                }
            ],
            "preLaunchTask": "opencv3.5.2"
        }
    ]
}


~~~



c_cpp_properties.json

~~~json
{
    "configurations": [
        {
            "name": "win",
            "includePath": [
                "${workspaceFolder}/**",
                "D:/opencv/build/x64/mingw/install/include",
                "D:/opencv/build/x64/mingw/install/include/opencv2"
            ],
            "defines": [],
            "compilerPath": "D:/mingw64/bin/g++.exe",
            "cStandard": "c11",
            "cppStandard": "c++17",
            "intelliSenseMode": "${default}"
        }
    ],
    "version": 4
}

~~~



tasks.json

~~~json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "shell",
            "label": "opencv3.5.2",
            "command": "D:/mingw64/bin/g++.exe",
            "args": [
                "-g",
                "${file}",
                "-o",
                "${workspaceFolder}\\Debugger\\${fileBasenameNoExtension}.exe",
                //上面这个Debugger是我自己定义的，为了方便放置生成的exe文件
                "D:/opencv/build/x64/mingw/bin/libopencv_world480.dll",
                "-I",
                "D:/opencv/build/x64/mingw/install/include",
                "-I",
                "D:/opencv/build/x64/mingw/install/include/opencv2"
            ],
            "options": {
                "cwd": "D:/mingw64/bin"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}

~~~



测试例程

~~~c++
#include <opencv2/opencv.hpp>
#include <iostream>

using namespace cv;
using namespace std;

int main()
{
    VideoCapture cap(0);
    Mat img;

    while (1)
    {
        cap >> img;
        if (img.empty())
            break;
        namedWindow("img", WINDOW_NORMAL);
        imshow("img", img);
        if (27 == waitKey(20))
            break;
    }

    return 0;
}
~~~



# 2 VS opencv的配置

## 2.1 安装vs

​	上面是VS code配置opencv事实上，可以直接通过vs来配置，上面也算是走了弯路了。

[VS 官网](https://visualstudio.microsoft.com/zh-hans/)

​	等待安装完成：

![image-20231129210245054](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292102072.png) 

安装程序下载安装验证完毕，将会提示进入这个界面

![image-20231129210632825](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292106854.png)



选择C++的桌面开发和Visual Studio 扩展开发，然后更改安装位置。

![image-20231129210813082](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292108111.png)

![image-20231129210828463](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292108494.png)

![image-20231129210742854](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292107884.png)

## 2.2 安装opencv

​	在第一小节已经讲解过，就不再讲了

## 2.3 配置VSCODE

​	其实也就那几步，没啥好写的，我留个[链接](https://blog.csdn.net/weixin_54583016/article/details/121424060?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170126271516800186526751%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=170126271516800186526751&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-121424060-null-null.142^v96^pc_search_result_base2&utm_term=vs%20opencv&spm=1018.2226.3001.4187)吧

测试完成如下所示：
![image-20231129215026178](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202311292150244.png)

​	既然opencv中已经在ubuntu提供的库中了，那为什么人们更多的还是自己编译opencv再使用呢，就比如下面这个例子：
![image-20231017205544904](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116812.png)

想用一些库，然而发现ubuntu自带的opencv是没有开启的，这时候就要自己编译opencv了。

# 3 oepncv源码的编译（Linux）

## 1.拉取opencv源码

opencv地址 **https://opencv.org/releases/**

https://github.com/opencv/opencv

opencv-contrib 链接https://github.com/opencv/opencv_contrib

OpenCV (Open Source Computer Vision Library) 是一个开源计算机视觉和图像处理库，提供了一系列用于处理图像和视频的函数和工具。OpenCV-contrib（OpenCV contributions）是对OpenCV的扩展和补充，包含了一些额外的模块和功能，以增强OpenCV的功能和应用范围。

OpenCV-contrib模块是由OpenCV社区的开发人员和贡献者创建和维护的，它提供了许多实用的功能、算法和工具，用于计算机视觉、图像处理、目标检测、机器学习等领域的应用。

以下是一些常见的OpenCV-contrib模块及其功能：

1. **aruco**：提供了用于检测和跟踪ArUco标记的函数和类。ArUco标记是一种用于增强现实和相机姿态估计的二维条码。
2. **bgsegm**：包含了一些背景分割算法的实现，用于从视频中提取前景对象。这些算法可以用于运动检测、目标跟踪等任务。
3. **bioinspired**：实现了一些生物启发式的图像处理算法，包括视网膜模型、光流估计等。这些算法受到生物视觉系统的启发，用于模拟人眼的感知机制。
4. **dnn**：提供了深度学习的支持，包括加载和运行基于深度学习模型的图像分类、目标检测和图像分割等任务。
5. **face**：包含了人脸检测、人脸识别和人脸特征点检测等相关功能。这些功能可以用于人脸分析、人脸识别和表情识别等应用。
6. **text**：提供了文本检测和识别的功能，可以用于场景文本检测、OCR（光学字符识别）等任务。
7. **xfeatures2d**：扩展了OpenCV的特征检测和描述子模块，提供了一些额外的特征检测算法和描述子算法，如SURF、SIFT等。

除了上述模块，OpenCV-contrib还包括其他一些模块和功能，如光学流、结构光、三维重建、图像分割等。这些模块和功能可以通过下载和编译OpenCV-contrib库来使用。

在这里就只是编译opencv源码了，也就不再添加opencv-contrib，目前是用不到的。

克隆opencv源码

~~~shell
git clone https://github.com/opencv/opencv
~~~

github的仓库源码太大了，还是直接从官网下载吧~，这里下载最新的opencv4.8 ，拷贝到ubuntu之上然后解压：
![image-20231017210921130](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116816.png)

在编译之前还需要先安装一些依赖

~~~shell
sudo apt-get install build-essential 

sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev

sudo apt-get install python-dev-is-python2 python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev  libdc1394-22-dev

pip3 install numpy
 
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 100
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 150
~~~

## 2.源码编译（PC）

然后在opencv源码目录下创建一个build目录进行工程

~~~
mkdir build
cd build
~~~

构建命令如下所示：

(1) 构建静态库

~~~shell
cmake -D  CMAKE_INSTALL_PREFIX=/usr/local \
-D CMAKE_BUILD_TYPE=Release \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D WITH_QUIRC=ON  \
-D OPENCV_ENABLE_NONFREE=True \
-D OPENCV_GENERATE_PKGCONFIG=YES \
-D WITH_OPENGL=ON \
-D ENABLE_CXX11=1 \
-D WITH_OPENMP=ON \
-D WITH_1394=OFF \
-D INSTALL_C_EXAMPLES=OFF \
-D BUILD_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
-D BUILD_opencv_python3=yes \
-D BUILD_opencv_python2=no \
-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
-D BUILD_SHARED_LIBS=OFF \
..
~~~



(2)构建动态库

~~~shell
cmake -D CMAKE_INSTALL_PREFIX=/usr/local \
-D CMAKE_BUILD_TYPE=Release \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D WITH_QUIRC=ON  \
-D OPENCV_ENABLE_NONFREE=True \
-D OPENCV_GENERATE_PKGCONFIG=YES \
-D WITH_OPENGL=ON \
-D ENABLE_CXX11=1 \
-D WITH_OPENMP=ON \
-D WITH_1394=OFF \
-D INSTALL_C_EXAMPLES=OFF \
-D BUILD_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
-D BUILD_opencv_python3=yes \
-D BUILD_opencv_python2=no \
-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
..
~~~

- `-D CMAKE_INSTALL_PREFIX=/usr/local`: 指定安装目录为`/usr/local`，生成的库和可执行文件将安装到该目录下。
- `-D CMAKE_BUILD_TYPE=Release`: 指定构建类型为"Release"，这意味着生成的库将进行优化，并且不包含调试信息。
- `-D OPENCV_GENERATE_PKGCONFIG=ON`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
- `-D WITH_QUIRC=ON`: 启用QUIRC支持，QUIRC是用于解码二维条码（如QR码）的库。通过这个参数，编译生成的OpenCV库将包含QUIRC功能。
- `-D OPENCV_ENABLE_NONFREE=True`: 启用非免费模块，这些模块可能包含受限制的功能，需要购买或获取许可证才能使用。
- `-D OPENCV_GENERATE_PKGCONFIG=YES`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
- `-D WITH_OPENGL=ON`: 启用OpenGL支持，用于与OpenGL相关的功能。
- `-D ENABLE_CXX11=1`: 启用C++11标准支持。
- `-D WITH_OPENMP=ON`: 启用OpenMP多线程支持。
- `-D WITH_1394=OFF`: 禁用IEEE 1394（FireWire）支持。
- `-D INSTALL_C_EXAMPLES=OFF`: 禁用C语言示例的安装。
- `-D BUILD_EXAMPLES=OFF`: 禁用构建示例程序。
- `-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作
- `-D BUILD_opencv_python3=yes`: 启用构建OpenCV的Python 3绑定。
- `-D BUILD_opencv_python2=no`: 禁用构建OpenCV的Python 2绑定。
- `-D PYTHON3_EXECUTABLE=/usr/bin/python3`: 指定Python 3解释器的路径为`/usr/bin/python3`。
- `-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8`: 指定Python 3的头文件目录的路径为`/usr/include/python3.8`，这里需要提供Python 3的开发包路径，具体版本号可能会有所不同。
- `-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so`: 指定Python 3的库文件路径为`/usr/lib/x86_64-linux-gnu/libpython3.8.so`，这里需要提供Python 3的动态链接库文件路径，具体路径和文件名可能会有所不同。
- `-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作。`-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作。

==注意：在CMake中，使用-D参数来定义变量。每个参数开头的-D表示要定义一个CMake变量，并为其赋予特定的值==

![image-20231017221820208](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116804.png)

然后进行编译安装

~~~shell
make -j32
sudo make install
~~~

我这电脑还是很快的，两分钟吧也就，还是家里的电脑好呀

![image-20231017212507239](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116859.png)

![image-20231017221754400](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116801.png)

​	最后拷贝和链接python库（==这一步必须做，否则在使用的时候会找不到cv2这个模块==）

~~~shell
cp lib/python3/cv2.cpython-38-x86_64-linux-gnu.so /usr/local/lib/python3.8/dist-packages/
sudo ln -s  /usr/local/lib/python3.8/dist-packages/cv2.cpython-38-x86_64-linux-gnu.so  /usr/lib/python3/dist-packages/cv2.so
~~~

![image-20231017222605454](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116808.png)

然后进行简单的测试：

~~~python
python

import cv2
cv2.__version__
~~~

![image-20231017222821948](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116273.png)

然后测试一个opencv的C++程序

首先创建三个目录build  install  src

~~~
mkdir -p build  install  src
~~~

![image-20231017225840415](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116304.png)

然后在src目录下创建测试例程demo.cpp,然后向该文件中添加以下程序：

~~~c++
#include "opencv2/core/core.hpp"                                                                               
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include <iostream>

using namespace cv;
using namespace std;

int main()
{
    VideoCapture capture(0);
    if (!capture.isOpened())
    {
        // 如果无法打开摄像头，则输出提示信息
        cout << "无法打开摄像头" << endl;
        return -1;
    }

    double time0 = static_cast<double>(getTickCount()); // 获取开始时间
    while (true)
    {
        // 从摄像头捕获帧
        Mat frame;
        capture >> frame;

        // 如果捕获到帧，则显示它
        if (!frame.empty())
        {
            cvtColor(frame, frame, COLOR_RGB2BGR);
            double time1 = static_cast<double>(getTickCount()); // 获取结束时间
            double fps = getTickFrequency() / (time1 - time0); // 计算实时帧率
            time0 = time1; // 更新开始时间
            putText(frame, "FPS: " + to_string(fps), Point(10, 30), FONT_HERSHEY_SIMPLEX, 1, Scalar(0, 0, 255), 2); // 在图像上显示帧率
            imshow("MIPI Camera", frame);
        }

        // 按下'q'键退出循环
        if (waitKey(1) == 'q')
        {
            break;
        }
    }

    // 释放资源并关闭窗口
    capture.release();
    destroyAllWindows();

    return 0;
}
~~~

然后创建cmake的配置文件CMakeLists.txt，添加内容如下所示：

~~~cmake
cmake_minimum_required(VERSION 3.4.1)

# 设置项目名称为 opencv_demo
project(opencv_demo)

# 设置 C++ 标准为 11，并且要求编译器支持该标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找并引入 OpenCV
find_package(OpenCV REQUIRED)

# 添加可执行文件 opencv_demo，源文件为 src/demo.cpp
add_executable(opencv_demo
        src/demo.cpp
)

# 链接 OpenCV 库
target_link_libraries(opencv_demo
  ${OpenCV_LIBS}
)

# 设置安装目录为 ./install/操作系统名
set(CMAKE_INSTALL_PREFIX ${CMAKE_SOURCE_DIR}/install/${CMAKE_SYSTEM_NAME})

# 安装可执行文件 opencv_demo 到指定目录
install(TARGETS opencv_demo DESTINATION ./)
~~~

然后进入build目录，执行以下命令，进行配置、编译和安装三个步骤：

~~~shell
cd build/
cmake ../
make 
make install 
~~~

![image-20231017230355394](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116295.png)

在install/Linux目录下就生成了测试APP opencv_demo![image-20231017230415584](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116215.png)

然后接一个摄像头进行测试，测试功能正常：
![image-20231017231044428](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116448.png)

至此，opencv在PC机的编译就完成了。

## 3.交叉编译（qemu）

上面编译的其实都是在X86上编译的一些个版本，而这里将编译开发板的版本，本来想的是交叉编译呀，可是后来我一想，我有qemu呀，我还交叉编译啥呀，完全不需要呀，完全忘记了qemu还有这个~。

首先解压一下开发板ubuntu20的源码，解压完成如下所示：

![image-20231018220418904](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116328.png)

​	然后创建一个名为mount.sh的挂载脚本，该脚本的作用是挂载ubuntu并qemu

~~~shell
#!/bin/bash

function mnt() {
    echo "MOUNTING"
    sudo mount -t proc /proc ${2}proc
    sudo mount -t sysfs /sys ${2}sys
    sudo mount -o bind /dev ${2}dev
    sudo mount -B /dev/pts ${2}dev/pts

    sudo chroot ${2} /bin/sh
}

function umnt() {
    echo "UNMOUNTING"
    sudo umount ${2}proc
    sudo umount ${2}sys
    sudo umount ${2}dev/pts
    sudo umount ${2}dev
}

if [ "$1" == "-m" ] && [ -n "$2" ] ;
then
    mnt $1 $2
elif [ "$1" == "-u" ] && [ -n "$2" ];
then
    umnt $1 $2
else
    echo ""
    echo "Either 1'st, 2'nd or both parameters were missing"
    echo ""
    echo "1'st parameter can be one of these: -m(mount) OR -u(umount)"
    echo "2'nd parameter is the full path of rootfs directory(with trailing '/')"
    echo ""
    echo "For example: ch-mount -m /media/sdcard/"
    echo ""
    echo 1st parameter : ${1}
    echo 2nd parameter : ${2}
fi

~~~

![image-20231018220519930](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116667.png)

然后这样进行挂载：

~~~
./mount.sh -m ubuntu/
~~~

![image-20231018220618193](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116729.png)

我这里首先更新了一下软件源，然后就是安装一些依赖，就跟上面在PC上安装依赖的方法相同。

~~~shell
sudo apt-get install build-essential 

sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev

sudo apt-get install python-dev-is-python2 python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev  libdc1394-22-dev

pip3 install numpy
 
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 100
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 150
~~~

然后将opencv源码拷贝到qumu的uubntu目录下，如下图所示：

![image-20231018220935063](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116797.png)

然后进行opencv源码的解压：

~~~
unzip opencv-4.8.0.zip
~~~

然后在opencv源码目录下创建一个build目录进行工程

~~~
mkdir build
cd build
~~~

构建命令如下所示：

(1) 构建静态库

~~~shell
cmake -D  CMAKE_INSTALL_PREFIX=../install \
-D CMAKE_BUILD_TYPE=Release \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D WITH_QUIRC=ON  \
-D OPENCV_ENABLE_NONFREE=True \
-D OPENCV_GENERATE_PKGCONFIG=YES \
-D WITH_OPENGL=ON \
-D ENABLE_CXX11=1 \
-D WITH_OPENMP=ON \
-D WITH_1394=OFF \
-D INSTALL_C_EXAMPLES=OFF \
-D BUILD_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
-D BUILD_opencv_python3=yes \
-D BUILD_opencv_python2=no \
-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
-D BUILD_SHARED_LIBS=OFF \
..
~~~

由于这里只是想要得到他的库，所以这里就不安装到usr/local目录下了

(2)构建动态库

~~~shell
cmake -D CMAKE_INSTALL_PREFIX=../install \
-D CMAKE_BUILD_TYPE=Release \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D WITH_QUIRC=ON  \
-D OPENCV_ENABLE_NONFREE=True \
-D OPENCV_GENERATE_PKGCONFIG=YES \
-D WITH_OPENGL=ON \
-D ENABLE_CXX11=1 \
-D WITH_OPENMP=ON \
-D WITH_1394=OFF \
-D INSTALL_C_EXAMPLES=OFF \
-D BUILD_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3 \
-D BUILD_opencv_python3=yes \
-D BUILD_opencv_python2=no \
-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8 \
-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so \
-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.8/dist-packages/numpy/core/include/ \
..
~~~

由于这里只是想要得到他的库，所以这里就不安装到usr/local目录下了

- `-D CMAKE_INSTALL_PREFIX=/usr/local`: 指定安装目录为`/usr/local`，生成的库和可执行文件将安装到该目录下。
- `-D CMAKE_BUILD_TYPE=Release`: 指定构建类型为"Release"，这意味着生成的库将进行优化，并且不包含调试信息。
- `-D OPENCV_GENERATE_PKGCONFIG=ON`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
- `-D WITH_QUIRC=ON`: 启用QUIRC支持，QUIRC是用于解码二维条码（如QR码）的库。通过这个参数，编译生成的OpenCV库将包含QUIRC功能。
- `-D OPENCV_ENABLE_NONFREE=True`: 启用非免费模块，这些模块可能包含受限制的功能，需要购买或获取许可证才能使用。
- `-D OPENCV_GENERATE_PKGCONFIG=YES`: 生成用于`pkg-config`的OpenCV配置文件，这样其他程序可以使用`pkg-config`来查找和链接OpenCV库。
- `-D WITH_OPENGL=ON`: 启用OpenGL支持，用于与OpenGL相关的功能。
- `-D ENABLE_CXX11=1`: 启用C++11标准支持。
- `-D WITH_OPENMP=ON`: 启用OpenMP多线程支持。
- `-D WITH_1394=OFF`: 禁用IEEE 1394（FireWire）支持。
- `-D INSTALL_C_EXAMPLES=OFF`: 禁用C语言示例的安装。
- `-D BUILD_EXAMPLES=OFF`: 禁用构建示例程序。
- `-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作
- `-D BUILD_opencv_python3=yes`: 启用构建OpenCV的Python 3绑定。
- `-D BUILD_opencv_python2=no`: 禁用构建OpenCV的Python 2绑定。
- `-D PYTHON3_EXECUTABLE=/usr/bin/python3`: 指定Python 3解释器的路径为`/usr/bin/python3`。
- `-D PYTHON3_INCLUDE_DIR=/usr/include/python3.8`: 指定Python 3的头文件目录的路径为`/usr/include/python3.8`，这里需要提供Python 3的开发包路径，具体版本号可能会有所不同。
- `-D PYTHON3_LIBRARY=/usr/lib/x86_64-linux-gnu/libpython3.8.so`: 指定Python 3的库文件路径为`/usr/lib/x86_64-linux-gnu/libpython3.8.so`，这里需要提供Python 3的动态链接库文件路径，具体路径和文件名可能会有所不同。
- `-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作。`-D PYTHON_DEFAULT_EXECUTABLE=/usr/bin/python3`: 指定默认的Python解释器路径为`/usr/bin/python3`，这将用于与Python相关的构建和安装操作。

==注意：在CMake中，使用-D参数来定义变量。每个参数开头的-D表示要定义一个CMake变量，并为其赋予特定的值==

![image-20231018221553413](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116906.png)

~~~
make -j32
sudo make install
~~~

虽然是qemu，但是用的仍旧是PC的CPU，但是这个速度是真的慢呀，但我看CPU都跑满了呀~~竟然搞了三十分钟~

![image-20231018225750952](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116875.png)

![image-20231018225848736](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116200.png)

​	最后拷贝和链接python库（==这一步必须做，否则在使用的时候会找不到cv2这个模块==）

~~~
cp lib/python3/cv2.cpython-38-aarch64-linux-gnu.so ../install/lib/python3.8/site-packages/
ln -s  /usr/local/lib/python3.8/dist-packages/cv2.cpython-38-aarch64-linux-gnu.so  /usr/lib/python3/dist-packages/cv2.so
~~~

![image-20231017222605454](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116808.png)

然后进行简单的测试：

~~~
python

import cv2
cv2.__version__
~~~

![image-20231017222821948](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116273.png)

然后测试一个opencv的C++程序

首先创建三个目录build  install  src

~~~
mkdir -p build  install  src
~~~

![image-20231017225840415](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116304.png)

然后在src目录下创建测试例程demo.cpp,然后向该文件中添加以下程序：

~~~c++
#include "opencv2/core/core.hpp"                                                                               
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include <iostream>

using namespace cv;
using namespace std;

int main()
{
    VideoCapture capture(0);
    if (!capture.isOpened())
    {
        // 如果无法打开摄像头，则输出提示信息
        cout << "无法打开摄像头" << endl;
        return -1;
    }

    double time0 = static_cast<double>(getTickCount()); // 获取开始时间
    while (true)
    {
        // 从摄像头捕获帧
        Mat frame;
        capture >> frame;

        // 如果捕获到帧，则显示它
        if (!frame.empty())
        {
            cvtColor(frame, frame, COLOR_RGB2BGR);
            double time1 = static_cast<double>(getTickCount()); // 获取结束时间
            double fps = getTickFrequency() / (time1 - time0); // 计算实时帧率
            time0 = time1; // 更新开始时间
            putText(frame, "FPS: " + to_string(fps), Point(10, 30), FONT_HERSHEY_SIMPLEX, 1, Scalar(0, 0, 255), 2); // 在图像上显示帧率
            imshow("MIPI Camera", frame);
        }

        // 按下'q'键退出循环
        if (waitKey(1) == 'q')
        {
            break;
        }
    }

    // 释放资源并关闭窗口
    capture.release();
    destroyAllWindows();

    return 0;
}
~~~

然后创建cmake的配置文件CMakeLists.txt，添加内容如下所示：

~~~cmake
cmake_minimum_required(VERSION 3.4.1)

# 设置项目名称为 opencv_demo
project(opencv_demo)

# 设置 C++ 标准为 11，并且要求编译器支持该标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找并引入 OpenCV
find_package(OpenCV REQUIRED)

# 添加可执行文件 opencv_demo，源文件为 src/demo.cpp
add_executable(opencv_demo
        src/demo.cpp
)

# 链接 OpenCV 库
target_link_libraries(opencv_demo
  ${OpenCV_LIBS}
)

# 设置安装目录为 ./install/操作系统名
set(CMAKE_INSTALL_PREFIX ${CMAKE_SOURCE_DIR}/install/${CMAKE_SYSTEM_NAME})

# 安装可执行文件 opencv_demo 到指定目录
install(TARGETS opencv_demo DESTINATION ./)
~~~

然后进入build目录，执行以下命令，进行配置、编译和安装三个步骤（==这里由于我是将opencv的库和头文件等放到了上一级的install目录，所以这里可能要修改一下CmakeLists，但也还好==）：

~~~shell
cd build/
cmake ../
make 
make install 
~~~

![image-20231017230355394](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312042116295.png)

至此，opencv qemu编译就完成了。

# 4.vscode 配置python

## 4.1.下载VScode

[附上官网地址：Visual Studio Code - Code Editing. Redefined](https://code.visualstudio.com/)

## 4.2.在[vs安装](https://so.csdn.net/so/search?q=vs安装&spm=1001.2101.3001.7020)python插件

这个很简单，我就不再截图了。

## 4.3.配置python环境

[python官网：Welcome to Python.org](https://www.python.org/)

![image-20231205073415526](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312050734569.png)

虽然已经到了3.12的版本，但这个随意了，我认为无所谓。

![image-20231205073900729](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312050739764.png)

然后打开一个shell终端，发现运行python之后没什么问题，如下图所示：
![image-20231205073953699](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312050739725.png)

然后安装两个包：
~~~
pip install flake8 yapf -i https://pypi.tuna.tsinghua.edu.cn/simple
~~~

flake8会检查编写代码时的不规范的地方和语法错误。

yapf是一个代码格式化工具，可以一键美化代码。**Shift + Alt + F一键美化代码**

![image-20231205074300847](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312050743881.png)

一定要在python目录下才可以，难道我需要再添加一下路径吗，很奇怪反正~~。

### 4.4选择python解释器

打开VScode，点击左上角，文件->首选项->设置

![image-20231205212927391](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052129421.png)

然后打开界面右上角的箭头纸张这就是json设置

![image-20231205213107628](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052131657.png)

然后将下面代码替换里面的内容，第一行即为python所在路径。记得在路径多加 \ 

```json
{
    "python.PYTHONPATH":"D:\\Python\\Python312",
    "python.linting.flake8Enabled": true,
    "editor.formatOnSave": true,
    "python.formatting.provider": "yapf",
    "python.formatting.yapfArgs": [
        "--style={based_on_style: pep8, indent_width: 4}"
    ],
    "python.linting.flake8Args": ["--max-line-length=248"],
    "python.linting.pylintEnabled": false,
    "explorer.confirmDelete": false,
    "[python]": {
        "editor.formatOnType": true
    }
}
```

之后保存即可，就可以在python文件中使用**Shift + Alt + F**来格式化你的代码啦。

测试可用：
![image-20231205213520975](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052135998.png)

![image-20231205213527919](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052135954.png)

# 5 windows c++环境的配置

## 5.1 Visual Studio Code相关信息

- Visual Studio Code 下载地址：https://code.visualstudio.com/download
- VS Code建议安装插件列表：
  - 中文菜单：
    - MS-CEINTL.vscode-language-pack-zh-hans
  - SSH远程开发：
    - ms-vscode-remote.remote-ssh
    - ms-vscode-remote.remote-ssh-edit
    - ms-vscode.remote-explorer
  - C++开发
    - ms-vscode.cpptools
  - 代码补全
    - TabNine.tabnine-vscode
    - GitHub.copilot

## 5.2下载安装g++

==具体可以看1.2.1小节==

## 5.3配置调试功能

首先大家在一个你希望的位置建一个文件夹，随意起名就可以（注意不可以用中文！），以后的C/C++代码文件都要放在这个文件夹里才可以正常调试。

然后进入VSCode,点击Open Folder或者点击左上角File -> Open Folder，然后打开刚刚建的文件夹，选择信任父级文件夹点击这个图标新建一个文件夹，命名为.vscode（注意必须是这个名字！）

![image-20231205214658480](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052146527.png)

创建完成后再点击这个图标新建四个文件，文件名分别是

~~~
//c_cpp_properties.json
//launch.json
//settings.json
//tasks.json
~~~

![image-20231205214844970](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052148993.png)

接下来复制粘贴这四个文件的内容 

首先是c_cpp_properties.json

~~~json
{
    "configurations": [
        {
            "name": "Win64",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [
                "_DEBUG",
                "UNICODE",
                "_UNICODE"
            ],
            "windowsSdkVersion": "10.0.18362.0",
            "compilerPath": "D:/mingw64/bin/gcc.exe",
            "cStandard": "c17",
            "cppStandard": "c++17",
            "intelliSenseMode": "gcc-x64"
        }
    ],
    "version": 4
}
~~~


注意compilerPath这一项要把路径改成刚才g++的安装路径：找到刚刚的安装文件夹->MinGW->bin->g++,exe ,然后复制或者手动把g++.exe的路径敲上去，格式要跟上面代码段一样

然后是launch.json

~~~json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceRoot}",
            "environment": [],
            "externalConsole": true,
            "MIMode": "gdb",
            "miDebuggerPath": "D:\\mingw64\\bin\\gdb.exe",
            "preLaunchTask": "g++",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
        }
    ]
}
~~~


注意miDebuggerPath这一项也要把路径改成刚才g++的安装路径：找到刚刚的安装文件夹->MinGW->bin->gdb,exe ,然后复制或者手动把gdb.exe的路径敲上去，格式要跟上面代码段一样

 接下来是settings.json

~~~json


{
  "files.associations": {
    "*.py": "python",
    "iostream": "cpp",
    "*.tcc": "cpp",
    "string": "cpp",
    "unordered_map": "cpp",
    "vector": "cpp",
    "ostream": "cpp",
    "new": "cpp",
    "typeinfo": "cpp",
    "deque": "cpp",
    "initializer_list": "cpp",
    "iosfwd": "cpp",
    "fstream": "cpp",
    "sstream": "cpp",
    "map": "c",
    "stdio.h": "c",
    "algorithm": "cpp",
    "atomic": "cpp",
    "bit": "cpp",
    "cctype": "cpp",
    "clocale": "cpp",
    "cmath": "cpp",
    "compare": "cpp",
    "concepts": "cpp",
    "cstddef": "cpp",
    "cstdint": "cpp",
    "cstdio": "cpp",
    "cstdlib": "cpp",
    "cstring": "cpp",
    "ctime": "cpp",
    "cwchar": "cpp",
    "exception": "cpp",
    "ios": "cpp",
    "istream": "cpp",
    "iterator": "cpp",
    "limits": "cpp",
    "memory": "cpp",
    "random": "cpp",
    "set": "cpp",
    "stack": "cpp",
    "stdexcept": "cpp",
    "streambuf": "cpp",
    "system_error": "cpp",
    "tuple": "cpp",
    "type_traits": "cpp",
    "utility": "cpp",
    "xfacet": "cpp",
    "xiosbase": "cpp",
    "xlocale": "cpp",
    "xlocinfo": "cpp",
    "xlocnum": "cpp",
    "xmemory": "cpp",
    "xstddef": "cpp",
    "xstring": "cpp",
    "xtr1common": "cpp",
    "xtree": "cpp",
    "xutility": "cpp",
    "stdlib.h": "c",
    "string.h": "c"
  },
  "editor.suggest.snippetsPreventQuickSuggestions": false,
  "aiXcoder.showTrayIcon": true
}
~~~


 最后是tasks.json

~~~json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "g++",
      "command": "g++",
      "args": [
        "-g",
        "${file}",
        "-o",
        "${fileDirname}/${fileBasenameNoExtension}.exe"
      ],
      "problemMatcher": {
        "owner": "cpp",
        "fileLocation": ["relative", "${workspaceRoot}"],
        "pattern": {
          "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "message": 5
        }
      },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
} 
~~~

保存这四个文件就配置完成了！

再次强调：以后的C/C++代码文件必须放在这个Code文件夹里，或者说有.vscode文件夹的文件夹里，如果调试放在其他位置的代码文件会报错！

测试完成如下所示：
![image-20231205221434929](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312052214005.png)

# 6.opencv的学习

## 6.1 读取图片并显示

~~~c++
// 图片的读取和显示
// 导入opencv头文件
#include "opencv2/opencv.hpp"
#include <iostream>

int main(int argc, char **argv)
{
    // 读取图片，mat是matrix的缩写，是一个矩阵，类似与numpy ndarray
    cv::Mat image = cv::imread("E:\\05_opencv\\work\\src\\cat.jpg");
    // 判断是否读取成功
    if (image.empty())
    {
        std::cout << "无法读取图片 " << std::endl;
        return 1;
    }
    // 打印图片高度和宽度
    std::cout << "图片高度: " << image.rows << " 宽度: " << image.cols << std::endl;

    // 打印图片data
    // 以Numpy的方式打印
    // std::cout << "图片data: " << cv::format(image, cv::Formatter::FMT_NUMPY) << std::endl;
    // 以python list的方式打印
    // std::cout << "图片data: " << cv::format(image, cv::Formatter::FMT_PYTHON) << std::endl;

    // 创建一个灰度图
    cv::Mat gray;
    // 转换为灰度图
    cv::cvtColor(image, gray, cv::COLOR_BGR2GRAY);
    // 保存
    cv::imwrite("gray.jpg", gray);

    // 显示
    cv::imshow("原图", image);
    cv::imshow("灰度图", gray);
    // 等待按键
    cv::waitKey(0);
}
~~~

遇到的第一个问题，第9行的路径问题，在windows目录下必须要使用两个\\不知道这是为啥

在Windows目录中，反斜杠 `\` 是用作路径分隔符。然而，反斜杠在C++中被用作转义字符，用于表示特殊字符序列。因此，如果您想在字符串中使用反斜杠作为路径分隔符，您需要使用双反斜杠 `\\` 来表示一个单独的反斜杠。

这是因为一个反斜杠 `\` 表示一个转义字符的开始，例如 `\n` 表示换行符。为了在字符串中表示一个反斜杠字符本身，您需要使用两个连续的反斜杠 `\\` 来转义它，告诉编译器它是一个普通的反斜杠字符。

没有自动补全，重新确定一下插件：
1)、C/C++，这个肯定是必须的。

2)、C/C++ Snippets，即 C/C++重用代码块。

3)、C/C++ Advanced Lint,即 C/C++静态检测 。

4)、Code Runner，即代码运行。

5)、Include AutoComplete，即自动头文件包含。

6)、Rainbow Brackets，彩虹花括号，有助于阅读代码。

7)、One Dark Pro，VSCode 的主题。

8)、GBKtoUTF8，将 GBK 转换为 UTF8。 

9)、ARM，即支持 ARM 汇编语法高亮显示。

10)、Chinese(Simplified)，即中文环境。

11)、vscode-icons，VSCode 图标插件，主要是资源管理器下各个文件夹的图标。

12)、compareit，比较插件，可以用于比较两个文件的差异。

13)、DeviceTree，设备树语法插件。

14)、CMake Tools Cmake 工具

==还是不能补全，不知道为啥windows的环境会这样，这样下去可不行，问题该解决的当然还是要解决的，遇到问题解决问题==

上面这个案例有以下几个重点我来回顾一下

1. 头文件

一般情况下使用c++和opencv都会包含上面提到的两个头文件，也就是<opencv2/opencv.hpp>和<iostream>这两个头文件。

<opencv/opencv.hpp>中包含了一些opencv中的常用函数，就比如imread、imwrite、imshow、waitkey、cvtColor等等，而<iostream>中存放的是c++中的一些常用函数，就比如cout输出等等。

2. 工作区using namespace

如果是我一般写C语言的话，我都会写上工作区，但是老师给的这些示例代码并没有，而是直接使用的就比如cv::imread() std::cout这些，都是在前加上工作去，然后再引用的，这样的好处应该是防止混乱引用，目前我还没遇到这个情况，这个以后再说。

3. opencv图像的格式Mat

   没记错的话这个Mat格式用来存放的是RGB三原色每个像素的值

4. 相关函数的使用

cv::imread 两个参数，第一个参数为要读取图片的路径、第二个参数为flag标志位我记得是0 1 -1，这三个最常用，其中0代表灰度值，1代表彩色。

cv::imwrite 这个是用来写入的，其实跟读取的使用方法一样，也是两个参数，其中第一个参数为要保存的图片名称，第二个参数为图片的数据，没有数据你只保存名字那肯定不行呀。

cv::imshow 从名字可以看出来这是图片的展示，有两个参数，第一个参数为展示图片的框的名称，第二个参数为图片数据，同理，你只显示框的名称，但是没有数据拿什么也显示不出来呀，我说的对吗.

cv::cvtColor 这个函数是用来进行颜色通道转换的，就比如从RGB转换为BGR等等，你可以思考一下应该有几个参数，你看要转换肯定要有一个原始数据对吧，然后肯定有一个输出数据对吧，最后必然要有一个如何转换对吧，所以必要填写的是三个参数。

最后是cv::waitKey(0)这个函数的意义是让图片一直显示，直到按下一个按键。

## 6.2 读取视频并显示

~~~c++
// 导入opencv 库
#include <opencv2/opencv.hpp>
#include <iostream>
// 导入gflags 库
#include <gflags/gflags.h>
// 定义命令行参数
DEFINE_string(video, "./media/dog.mp4", "Input video"); // 视频路径

int main(int argc, char **argv)
{
    // 解析命令行参数
    gflags::ParseCommandLineFlags(&argc, &argv, true);
    // 读取视频：创建了一个VideoCapture对象，参数为视频路径
    cv::VideoCapture capture(FLAGS_video);
    // 判断视频是否读取成功，返回true表示成功
    if (!capture.isOpened())
    {
        std::cout << "无法读取视频: " << FLAGS_video << std::endl;
        return 1;
    }
    // 读取视频帧，使用Mat类型的frame存储返回的帧
    cv::Mat frame;
    // 灰度图
    cv::Mat gray_frame;
    // 循环读取视频帧
    while (true)
    {
        // 读取视频帧，使用 >> 运算符或者read()函数，他的参数是返回的帧
        capture.read(frame);
        // capture >> frame;

        // 判断是否读取成功
        if (frame.empty())
        {
            std::cout << "文件读取完毕" << std::endl;
            break;
        }
        // 转成灰度图
        cv::cvtColor(frame, gray_frame, cv::COLOR_BGR2GRAY);
        // 显示视频帧
        cv::imshow("raw frame", frame);
        cv::imshow("gray frame", gray_frame);
        // 等待按键，延迟30ms，否则视频播放太快
        int k = cv::waitKey(30);
        // 按下ESC键退出
        if (k == 27)
        {
            std::cout << "退出" << std::endl;
            break;
        }
    }

    return 0;
}
~~~

重点1：VideoCapture类

​	就跟上一个小节讲解的Mat一样，可以看到VideoCapture的第一个字母也大写了，所以他也是一个opencv中的类型，用来存放捕获到的视频，`cv::VideoCapture` 类的构造函数可以接受不同的参数来指定要打开的视频源：

1.通过设备索引：您可以传递一个整数值作为设备索引来指定要打开的摄像头设备。例如，`0` 表示默认的摄像头设备，`1` 表示第二个摄像头设备，以此类推。

```
cv::VideoCapture cap(0); // 打开默认的摄像头设备
```

2.通过视频文件路径：您可以传递一个字符串参数，表示要打开的视频文件的路径。

```
cv::VideoCapture cap("video.mp4"); // 打开名为 "video.mp4" 的视频文件
```

一旦创建了 `cv::VideoCapture` 对象，您可以使用 `read()` 方法来连续读取视频帧。`read()` 方法将返回一个布尔值，指示是否成功读取了一帧图像。

~~~c++
cv::Mat frame;
while (cap.read(frame)) {
    // 处理当前帧
    cv::imshow("Video", frame);

    // 等待按键退出
    if (cv::waitKey(1) == 'q') {
        break;
    }
}
~~~

