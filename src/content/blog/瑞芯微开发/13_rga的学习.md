---
title: rga的学习
date: 2024-07-10 17:17:03
categories:
  - 瑞芯微开发
link: 02_瑞芯微/13_rga的学习
---

# RGA源码获取

https://meta.zbox.filez.com/v/link/view/c3559cbbf1514464bf109b44901db9fa  提取码rkrga

# RGA源码编译

​	其实源码的编译很简单，总共是需要安装三个工具分别为gcc g++和cmake

~~~shell
sudo apt install cmake g++ gcc 
sudo apt install g++-9-aarch64-linux-gnu gcc-9-aarch64-linux-gnu 
~~~

然后链接一下
~~~shell
sudo ln -s /usr/bin/aarch64-linux-gnu-g++-9 /usr/bin/aarch64-linux-gnu-g++
sudo ln -s /usr/bin/aarch64-linux-gnu-g++-9 /usr/bin/aarch64-linux-gnu-g++
~~~

然后修改源码目录的cmake交叉编译器设置文件

~~~shell
vim toolchains/toolchain_linux.cmake
~~~

修改完成之后如下所示：

![image-20240710204241524](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102042549.png)

​	然后直接运行cmake-linux.sh编译即可，编译完成如下所示：

~~~shell
SCRIPT_DIR=$PWD
SOURCE_PATH=${SCRIPT_DIR}
TOOLCHAIN_PATH=${SOURCE_PATH}/toolchains/toolchain_linux.cmake

cmake 	-DBUILD_TOOLCHAINS_PATH=${TOOLCHAIN_PATH} .

make -j8

popd
~~~

![image-20240710205510721](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102055766.png)

​	会在源码目录下的build/build_linux/install目录中生成后续使用的头文件和库，可以看到lib库不仅提供了so动态库还提供了.a静态库

![image-20240710205553582](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102055622.png)

​	使用file命令也可以得到他的架构类型：
![image-20240710205752179](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102057202.png)

​	还有第二种meson的编译方法，其实还挺简单，但是我还是很喜欢cmake 的方式的，方便，只需要改一下cross/cross_file_aarch64.txt文件，修改以下几个地方，还挺简单，

~~~shell
c = '/usr/bin/aarch64-linux-gnu-gcc'
cpp = '/usr/bin/aarch64-linux-gnu-g++'
ar = '/usr/bin/aarch64-linux-gnu-ar'
strip = '/usr/bin/aarch64-linux-gnu-strip'
~~~

​	然后运行./meson.sh脚本即可，具体步骤如下所示：
![image-20240710215119171](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102151221.png)

​	会将要用到的包放到build/meson_aarch64/install目录下，具体如下所示：

![image-20240710215203845](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407102152895.png)

​	行了，就先到这里。

# 开发板上RGA的使用

​	上面的编译步骤直接在开发板上试了一下，然后替换对应的rga库，然后来测试rga Demo，首先获取RGA属性，具体如下所示：
![image-20240712211025031](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407122110073.png)

| 项目             | 内容                                                         |
| :--------------- | :----------------------------------------------------------- |
| 选择模式         | 0                                                            |
| im2d querystring | ..                                                           |
| RGA 演示模式     | 0x0                                                          |
| RGA API 版本     | 1.10.1_[0]                                                   |
| RGA 供应商       | Rockchip Electronics Co.,Ltd.                                |
| RGA API 版本     | v1.10.1_[0]                                                  |
| RGA 版本         | RGA_2_Enhance RGA_3                                          |
| 最大输入分辨率   | 8192x8192                                                    |
| 最大输出分辨率   | 8128x8128                                                    |
| 字节对齐         | 16 byte                                                      |
| 缩放比例范围     | 0.0625 ~ 16                                                  |
| 输入格式         | RGBA/ARGB_8888, RGB_888, RGB_565, ARGB_4444, ARGB_5551, YUV420_sp_8bit, YUV420_sp_10bit, YUV420_p_8bit, YUV420_p_10bit, YUV422_sp_8bit, YUV422_sp_10bit, YUV422_p_8bit, YUV422_p_10bit, YUYV422, YUV400 |
| 输出格式         | RGBA/ARGB_8888, RGB_888, RGB_565, ARGB_4444, ARGB_5551, RGBA_4444, RGBA_5551, YUV420_sp_8bit, YUV420_sp_10bit, YUV420_p_8bit, YUV422_sp_8bit, YUV422_sp_10bit, YUV422_p_8bit, YUYV420, YUYV422, YUV400, Y4 |
| RGA 功能         | color_fill, color_palette, ROP, quantize, src1_r2y_csc, dst_full_csc, FBC_mode, blend_in_YUV, BT.2020 |
| 预期性能         | 最大 4 像素/周期                                             |





以下是整理后的`rgaImDemo`使用说明：

### 用法：

```shell
sh复制代码rgaImDemo [--help/-h] [--while/-w=(time)] [--querystring/--querystring=<options>]
          [--copy] [--resize=<up/down>] [--crop] [--rotate=90/180/270]
          [--flip=H/V] [--translate] [--blend] [--cvtcolor]
          [--fill=blue/green/red]
```

### 参数说明：

#### 基本选项：

- `--help` / `-h`: 显示帮助信息。
- `--while` / `-w=(time)`: 设置循环模式，用户可以自行设定循环次数。

#### 查询信息：

- ```shell
  --querystring
  ```

   / 

  ```shell
  --querystring=<options>
  ```

  : 根据选项打印当前版本的RGA的版本或支持信息。如果没有输入选项，则打印所有版本和支持信息。

  <options>

  - `vendor`: 打印厂商信息。
  - `version`: 打印RGA版本和librga/im2d_api版本。
  - `maxinput`: 打印最大输入分辨率。
  - `maxoutput`: 打印最大输出分辨率。
  - `scalelimit`: 打印缩放限制。
  - `inputformat`: 打印支持的输入格式。
  - `outputformat`: 打印支持的输出格式。
  - `expected`: 打印预期性能。
  - `all`: 打印所有信息（默认）。

#### 图像处理选项：

- `--copy`: 使用RGA复制图像，默认是720p到720p。

- `--resize`: 使用RGA调整图像大小，可以选择放大或缩小。

  <options>

  - `up`: 放大720p (1280x720) -> 1080p (1920x1080)。
  - `down`: 缩小720p (1280x720) -> 480p (720x480)。

- `--crop`: 使用RGA裁剪图像，默认从(100,100)位置裁剪300x300大小的图像。

- `--rotate`: 使用RGA旋转图像，可以选择旋转角度。

  <options>

  - `90`: 旋转90度。
  - `180`: 旋转180度。
  - `270`: 旋转270度。

- `--flip`: 使用RGA翻转图像，可以选择水平或垂直翻转。

  <options>

  - `H`: 水平镜像。
  - `V`: 垂直镜像。

- `--translate`: 使用RGA平移图像，默认平移(300,300)。

- `--blend`: 使用RGA混合图像，默认是Porter-Duff的'SRC over DST'模式。

  <options>

  - `src`: Porter-Duff SRC模式。
  - `dst`: Porter-Duff DST模式。
  - `src-over`: Porter-Duff SRC-OVER模式（默认）。
  - `dst-over`: Porter-Duff DST-OVER模式。
  - `src-in`: Porter-Duff SRC-IN模式。
  - `dst-in`: Porter-Duff DST-IN模式。
  - `src-out`: Porter-Duff SRC-OUT模式。
  - `dst-out`: Porter-Duff DST-OUT模式。
  - `src-atop`: Porter-Duff SRC-ATOP模式。
  - `dst-atop`: Porter-Duff DST-ATOP模式。
  - `xor`: Porter-Duff XOR模式。

- `--cvtcolor`: 使用RGA修改图像格式和颜色空间，默认是RGBA8888到NV12。

- `--fill`: 使用RGA填充图像颜色，可以选择填充为蓝色、绿色或红色。

  <options>

  

  - `red`: 填充为红色。
  - `blue`: 填充为蓝色。
  - `green`: 填充为绿色。
  - `<value>`: 填充颜色值，格式为红[0:7]绿[8:15]蓝[16:23] alpha[24:31]。

### 示例用法：

```shell
sh复制代码# 显示帮助信息
rgaImDemo --help

# 设置循环模式，循环次数为10
rgaImDemo --while=10

# 打印RGA版本和支持信息
rgaImDemo --querystring=all

# 复制图像
rgaImDemo --copy

# 放大图像
rgaImDemo --resize=up

# 旋转图像90度
rgaImDemo --rotate=90

# 水平翻转图像
rgaImDemo --flip=H

# 混合图像，使用Porter-Duff的SRC模式
rgaImDemo --blend=src

# 填充图像为蓝色
rgaImDemo --fill=blue
```

以上是整理后的`rgaImDemo`使用说明，以便更好地理解和使用该工具。

终于显示出来了正常的图片，有点问题：
![image-20240712220110651](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407122201709.png)

​	 现在可以了，这是我的代码：
~~~python
import cv2
import numpy as np

# 读取 RGBA 数据
img_data = np.fromfile('out0w1920-h1080-rgba8888.bin', dtype=np.uint8)
img = img_data.reshape((1080, 1920, 4))

# 转换为 BGR 格式
img_bgr = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)

# 保存图像为 JPG 格式
cv2.imwrite('output.jpg', img_bgr)
~~~

​	终于算是能读取出来了，行了现在去研究一下RGA的代码吧，其实也没啥，这个RGA的程序跟oepncv是一样的，这一点毋庸置疑，只要学过opencv这个就不是问题。

# rga_resize_demo

~~~c
/*
 * 版权所有 (C) 2022  Rockchip Electronics Co., Ltd.
 * 作者:
 *     YuQiaowei <cerf.yu@rock-chips.com>
 *
 * 根据 Apache 许可证，版本 2.0（“许可证”）授权；
 * 您不能根据许可证使用此文件，除非符合许可证。
 * 您可以在以下网址获取许可证副本：
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * 除非适用法律要求或书面同意，按照许可证分发的软件
 * 是按“原样”分发的，没有任何明示或暗示的担保或条件。
 * 请参阅许可证以了解管理权限和限制的特定语言。
 */

#define LOG_NDEBUG 0
#undef LOG_TAG
#define LOG_TAG "rga_resize_demo"

#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <time.h>
#include <sys/types.h>
#include <sys/time.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <signal.h>
#include <unistd.h>
#include <linux/stddef.h>

#include "RgaUtils.h"
#include "im2d.hpp"
#include "utils.h"

#define LOCAL_FILE_PATH "/data"  // 本地文件路径

int main() {
    int ret = 0;
    int src_width, src_height, src_format;  // 源图像的宽度、高度和格式
    int dst_width, dst_height, dst_format;  // 目标图像的宽度、高度和格式
    char *src_buf, *dst_buf;  // 源图像和目标图像的缓冲区
    int src_buf_size, dst_buf_size;  // 源图像和目标图像的缓冲区大小

    rga_buffer_t src_img, dst_img;  // RGA 缓冲区类型
    rga_buffer_handle_t src_handle, dst_handle;  // RGA 缓冲区句柄

    memset(&src_img, 0, sizeof(src_img));  // 初始化源图像缓冲区
    memset(&dst_img, 0, sizeof(dst_img));  // 初始化目标图像缓冲区

    src_width = 1280;  // 设置源图像宽度
    src_height = 720;  // 设置源图像高度
    src_format = RK_FORMAT_RGBA_8888;  // 设置源图像格式

    dst_width = 1920;  // 设置目标图像宽度
    dst_height = 1080;  // 设置目标图像高度
    dst_format = RK_FORMAT_RGBA_8888;  // 设置目标图像格式

    // 计算源图像和目标图像缓冲区大小
    src_buf_size = src_width * src_height * get_bpp_from_format(src_format);
    dst_buf_size = dst_width * dst_height * get_bpp_from_format(dst_format);

    // 为源图像和目标图像分配缓冲区
    src_buf = (char *)malloc(src_buf_size);
    dst_buf = (char *)malloc(dst_buf_size);

    /* 填充图像数据 */
    // 从文件读取源图像数据，如果读取失败则绘制RGBA图像
    if (0 != read_image_from_file(src_buf, LOCAL_FILE_PATH, src_width, src_height, src_format, 0)) {
        printf("src image read err\n");
        draw_rgba(src_buf, src_width, src_height);
    }
    memset(dst_buf, 0x80, dst_buf_size);  // 初始化目标图像缓冲区

    // 导入虚拟地址缓冲区
    src_handle = importbuffer_virtualaddr(src_buf, src_buf_size);
    dst_handle = importbuffer_virtualaddr(dst_buf, dst_buf_size);
    if (src_handle == 0 || dst_handle == 0) {
        printf("importbuffer failed!\n");
        goto release_buffer;
    }

    // 包装缓冲区句柄为RGA缓冲区
    src_img = wrapbuffer_handle(src_handle, src_width, src_height, src_format);
    dst_img = wrapbuffer_handle(dst_handle, dst_width, dst_height, dst_format);

    /*
     * 将源图像放大到1920*1080。
        --------------    ---------------------
        |            |    |                   |
        |  src_img   |    |     dst_img       |
        |            | => |                   |
        --------------    |                   |
                          |                   |
                          ---------------------
     */

    // 检查源图像和目标图像的合法性
    ret = imcheck(src_img, dst_img, {}, {});
    if (IM_STATUS_NOERROR != ret) {
        printf("%d, check error! %s", __LINE__, imStrError((IM_STATUS)ret));
        return -1;
    }

    // 调用RGA库进行图像缩放
    ret = imresize(src_img, dst_img);
    if (ret == IM_STATUS_SUCCESS) {
        printf("%s running success!\n", LOG_TAG);
    } else {
        printf("%s running failed, %s\n", LOG_TAG, imStrError((IM_STATUS)ret));
        goto release_buffer;
    }

    // 将目标图像写入文件
    write_image_to_file(dst_buf, LOCAL_FILE_PATH, dst_width, dst_height, dst_format, 0);

release_buffer:
    // 释放RGA缓冲区句柄
    if (src_handle)
        releasebuffer_handle(src_handle);
    if (dst_handle)
        releasebuffer_handle(dst_handle);

    // 释放缓冲区内存
    if (src_buf)
        free(src_buf);
    if (dst_buf)
        free(dst_buf);

    return ret;
}

~~~

​	



deb安装依赖

~~~shell
apt-get install -y sudo locales git fakeroot devscripts cmake vim qemu-user-static:arm64 binfmt-support \
        dh-make dh-exec pkg-kde-tools device-tree-compiler:arm64 bc cpio parted dosfstools mtools libssl-dev:arm64 \
        g++-aarch64-linux-gnu dpkg-dev meson debhelper pkgconf
~~~



编译deb包

~~~shell
sudo DEB_BUILD_OPTIONS=nocheck dpkg-buildpackage -b -d -uc -us -aarm64
~~~

