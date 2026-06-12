---
title: mpp的学习
date: 2024-07-14 17:17:03
categories:
  - 瑞芯微开发
link: 瑞芯微/14_mpp学习
---

# mpp源码获取

https://github.com/rockchip-linux/mpp

# mpp readme介绍



## 媒体处理平台 (Media Process Platform, MPP) 模块目录说明：

### MPP 目录说明：

- **MPP**：媒体处理平台   Media Process Platform
- **MPI**：媒体处理接口   Media Process Interface
- **HAL**：硬件抽象层  Hardware Abstract Layer
- **OSAL**：操作系统抽象层  Operation System Abstract Layer

### 规则：

1. **头文件安排规则**
   - 每个模块文件夹中的 `inc` 目录用于外部模块使用。
   - 模块内部头文件应与实现文件一起放置。
   - 头文件不应包含任何相对路径或绝对路径，所有包含路径应在 `Makefile` 中指定。
2. **编译系统规则**
   - 使用 CMake 作为跨平台编译管理系统。
   - 使用 CMake 的 out-of-source build，最终的二进制文件和库将安装到 `out/` 目录。
3. **头文件包含顺序**
   - MODULE_TAG
   - 系统头文件
   - OSAL 头文件
   - 模块头文件

### 注意事项：

1. 不再维护 Windows 支持。

2. MPP 现在支持所有 Rockchip 芯片，包括：

   - RK29XX/RK30XX/RK31XX
   - RK3288/RK3368/RK3399
   - RK3228/RK3229/RK3228H/RK3328
   - RK3528/RK3528A
   - RK3562
   - RK3566/RK3568
   - RK3588
   - RV1108/RV1107
   - RV1109/RV1126

3. MPP 支持硬件支持的所有格式，除了 VC1。

4. 可以在 Linux 和 Android 上获取 MPP 的应用示例：

   - Linux: [mpp_linux_cpp](https://github.com/WainDing/mpp_linux_cpp), [ffmpeg_rtsp_mpp](https://github.com/MUZLATAN/ffmpeg_rtsp_mpp)
   - Android: [RKMediaCodecDemo](https://github.com/c-xh/RKMediaCodecDemo)

5. 官方 GitHub: 

   rockchip-linux/mpp

   - 开发版 GitHub: [HermanChen/mpp](https://github.com/HermanChen/mpp)
   - 开发版 Gitee: [hermanchen82/mpp](https://gitee.com/hermanchen82/mpp)

6. 提交消息格式应基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

更多文档可在 [Rockchips 开源平台](http://opensource.rock-chips.com/wiki_Mpp) 找到。

### MPP 目录结构：

```
csharp复制代码  top
   ├── build                  // CMake out-of-source build 目录
   │   ├── cmake              // cmake 脚本目录
   │   ├── android            // android build 目录
   │   ├── linux              // linux build 目录
   │   ├── vc10-x86_64        // Visual Studio 2010 on x86_64 build 目录
   │   ├── vc12-x86_64        // Visual Studio 2013 on x86_64 build 目录
   ├── doc                    // MPP 设计文档
   ├── inc                    // 外部使用的头文件，包括平台头文件和 MPI 头文件
   ├── mpp                    // 媒体处理平台: MPI 功能私有实现和 MPP 基础结构
   │   ├── base               // 基本组件，包括 MppBuffer、MppFrame、MppPacket、MppTask、MppMeta 等
   │   ├── common             // 视频编解码协议语法接口，供编解码器解析器和 HAL 使用
   │   ├── codec              // 所有视频编解码器解析器，将流转换为协议结构
   │   │   ├── inc            // 编解码器模块提供的外部使用头文件
   │   │   ├── dec            // 解码器解析器工作流示例
   │   │   ├── enc            // 编码器控制器工作流示例
   │   ├── hal                // 硬件抽象层 (HAL)：MPI 中使用的模块
   │   │   ├── inc            // HAL 提供的外部使用头文件
   │   │   ├── iep            // IEP 用户库
   │   │   ├── pp             // 后处理器用户库
   │   │   ├── rga            // RGA 用户库
   │   │   ├── deinter        // 去交错功能模块，包括 PP/IEP/RGA
   │   │   ├── rkdec          // Rockchip 硬件解码器寄存器生成
   │   │   ├── vpu            // VPU 寄存器生成库
   │   ├── legacy             // 生成新的 libvpu，包括旧的 vpuapi 路径和新的 mpp 路径
   │   ├── test               // MPP 内部视频协议单元测试和演示
   ├── test                   // MPP 缓冲区/包组件单元测试和 MPP/MPI/VPU_API 演示
   ├── out                    // 最终发布的二进制输出目录
   │   ├── bin                // 可执行二进制文件输出目录
   │   ├── inc                // 头文件输出目录
   │   ├── lib                // 库文件输出目录
   ├── osal                   // 操作系统抽象层：不同操作系统的抽象层
   │   ├── allocator          // 支持的分配器，包括 Android 的 ion 和 Linux 的 drm
   │   ├── android            // Google's Android
   │   ├── inc                // MPP 模块的 OSAL 头文件
   │   ├── linux              // 主线 Linux 内核
   │   ├── windows            // Microsoft's Windows
   │   ├── test               // OSAL 单元测试
   ├── tools                  // 代码风格格式化工具
   ├── utils                  // 小工具函数
```

### MPP 实现整体框架：

```
                +---------------------------------------+
                |                                       |
                | ffmpeg / OpenMax / gstreamer / libva  |
                |                                       |
                +---------------------------------------+

            +-------------------- MPP ----------------------+
            |                                               |
            |   +-------------------------+    +--------+   |
            |   |                         |    |        |   |
            |   |        MPI / MPP        |    |        |   |
            |   |   buffer queue manage   |    |        |   |
            |   |                         |    |        |   |
            |   +-------------------------+    |        |   |
            |                                  |        |   |
            |   +-------------------------+    |        |   |
            |   |                         |    |        |   |
            |   |          codec          |    |  OSAL  |   |
            |   |    decoder / encoder    |    |        |   |
            |   |                         |    |        |   |
            |   +-------------------------+    |        |   |
            |                                  |        |   |
            |   +-----------+ +-----------+    |        |   |
            |   |           | |           |    |        |   |
            |   |  parser   | |    HAL    |    |        |   |
            |   |  recoder  | |  reg_gen  |    |        |   |
            |   |           | |           |    |        |   |
            |   +-----------+ +-----------+    +--------|   |
            |                                               |
            +-------------------- MPP ----------------------+

                +---------------------------------------+
                |                                       |
                |                kernel                 |
                |       RK vcodec_service / v4l2        |
                |                                       |
                +---------------------------------------+
```

### 媒体处理接口 (Media Process Interface) 分层结构：

```
                +-------------------+
                |                   |
                |        MPI        |
                |                   |
                +---------+---------+
                          |
                          |
                          v
                +---------+---------+
                |                   |
            +---+        ctx        +---+
            |   |                   |   |
            |   +-------------------+   |
            |                           |
            v                           v
    +-------+-------+           +-------+-------+
    |               |           |               |
    |     packet    |           |     frame     |
    |               |           |               |
    +---------------+           +-------+-------+
            |                           |
            |                           |
            |                           |
            |     +---------------+     |
            |     |               |     |
            +---->+     buffer    +<----+
                  |               |
                  +---------------+
```

## H.264 解码器示例工作流程：

视频流首先由 MPI/MPP 层排队，MPP 将流发送到 codec 层，codec 层解析流头并生成协议标准输出。此输出将发送到 HAL 生成寄存器文件集并与硬件通信。硬件完成任务并发送回信息。MPP 通知 codec 硬件结果，codec 按显示顺序输出解码帧。

```
                MPP              decoder             parser              HAL

 +                  +                  +                  +                  +
 |                  |                  |                  |                  |
 |   open context   |                  |                  |                  |
 +----------------> |                  |                  |                  |
 |                  |                  |                  |                  |
 |       init       |                  |                  |                  |
 +----------------> |                  |                  |                  |
 |                  |                  |                  |                  |
 |                  |       init       |                  |                  |
 |                  +----------------> |                  |                  |
 |                  |                  |                  |                  |
 |                  |                  |       init       |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |                  |                  |                  |       open       |
 |                  |                  +-----------------------------------> |
 |                  |                  |                  |                  |
 |      decode      |                  |                  |                  |
 +----------------> |                  |                  |                  |
 |                  |                  |                  |                  |
 |                  |   send_stream    |                  |                  |
 |                  +----------------> |                  |                  |
 |                  |                  |                  |                  |
 |                  |                  |   parse_stream   |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |                  |                  |                  |  reg generation  |
 |                  |                  +-----------------------------------> |
 |                  |                  |                  |                  |
 |                  |                  |                  |    send_regs     |
 |                  |                  +-----------------------------------> |
 |                  |                  |                  |                  |
 |                  |                  |                  |    wait_regs     |
 |                  |                  +-----------------------------------> |
 |                  |                  |                  |                  |
 |                  |                  |  notify_hw_end   |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |                  |   get_picture    |                  |                  |
 |                  +----------------> |                  |                  |
 |                  |                  |                  |                  |
 |                  |                  |   get_picture    |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |      flush       |                  |                  |                  |
 +----------------> |                  |                  |                  |
 |                  |                  |                  |                  |
 |                  |      flush       |                  |                  |
 |                  +----------------> |                  |                  |
 |                  |                  |                  |                  |
 |                  |                  |      reset       |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |      close       |                  |                  |                  |
 +----------------> |                  |                  |                  |
 |                  |                  |                  |                  |
 |                  |      close       |                  |                  |
 |                  +----------------> |                  |                  |
 |                  |                  |                  |                  |
 |                  |                  |      close       |                  |
 |                  |                  +----------------> |                  |
 |                  |                  |                  |                  |
 |                  |                  |                  |      close       |
 |                  |                  +-----------------------------------> |
 +                  +                  +                  +                  +
```

1. 解码器支持三种内存使用模式：

   ### 模式1：纯内部模式

   在这种模式下，用户不会调用 `MPP_DEC_SET_EXT_BUF_GROUP` 控制解码器，只需调用 `MPP_DEC_SET_INFO_CHANGE_READY` 让解码器继续运行。解码器会在内部创建缓冲区，用户需要释放每一帧获取到的缓冲区。

   **优点**：

   - 简单易用，快速获得示例。

   **缺点**：

   1. 解码器的缓冲区在解码器关闭前可能无法返回，可能导致内存泄漏或崩溃。
   2. 无法控制解码器的内存使用，解码器处于自由运行状态，会消耗所有可用内存。
   3. 实现零拷贝显示路径较为困难。

   ### 模式2：半内部模式

   这种模式是当前 `mpi_dec_test` 代码使用的模式。用户需要根据返回的信息变化创建 `MppBufferGroup`，并使用 `mpp_buffer_group_limit_config` 限制解码器的内存使用。

   **优点**：

   1. 简单易用。
   2. 用户可以在解码器关闭后释放 `MppBufferGroup`，内存可以更安全地保留更长时间。
   3. 可以通过 `mpp_buffer_group_limit_config` 限制内存使用。

   **缺点**：

   1. 缓冲区限制仍不准确，内存使用是100%固定的。
   2. 实现零拷贝显示路径仍然困难。

   ### 模式3：纯外部模式

   在这种模式下，用户需要创建空的 `MppBufferGroup` 并通过文件句柄从外部分配器导入内存。在 Android 上，surfaceflinger 将创建缓冲区，mediaserver 从 surfaceflinger 获取文件句柄并提交到解码器的 `MppBufferGroup`。

   **优点**：

   - 最有效的零拷贝显示方式。

   **缺点**：

   1. 学习和使用较为困难。
   2. 播放器工作流可能限制这种使用方式。
   3. 可能需要外部解析器来获取外部分配器所需的正确缓冲区大小。

   ### 所需缓冲区大小计算：

   - 像素数据：`hor_stride * ver_stride * 3 / 2`
   - 额外信息：`hor_stride * ver_stride / 2`
   - 总计：`hor_stride * ver_stride * 2`

   对于 H.264/H.265 编码器，20+ 个缓冲区足够；对于其他编解码器，10 个缓冲区足够。
   
   # 源码的编译
   
   其实源码的编译很简单，总共是需要安装三个工具分别为gcc g++和cmake
   
   ~~~shell
   sudo apt install g++-9-aarch64-linux-gnu gcc-9-aarch64-linux-gnu 
   ~~~
   
   然后链接一下
   
   ~~~shell
   sudo ln -s /usr/bin/aarch64-linux-gnu-g++-9 /usr/bin/aarch64-linux-gnu-g++
   sudo ln -s /usr/bin/aarch64-linux-gnu-g++-9 /usr/bin/aarch64-linux-gnu-g++
   ~~~
   
   然后进入源码目录下的mpp/build/linux/aarch64文件如下所示：
   
   ![image-20240714215012311](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142150341.png)
   
   然后运行make-Makefiles.bash可执行程序，在此之前需要加一下-DCMAKE_INSTALL_PREFIX=install \在make-Makefiles.bash的cmake中，添加完成如下图所示：
   
   ![image-20240714215615158](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142156183.png)
   
   ​	生成Makefile如下所示：
   
   ![image-20240714215058817](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142150861.png)
   
   ​	然后运行make -j32 && make install 编译安装如下图所示
   
   ![image-20240714220256505](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142202549.png)
   
   ​	然后会在当前目录下生成install目录，如下图所示：
   ![image-20240714220326941](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142203966.png)

而在install目录下有对应的二进制测试文件和头文件以及对应的vpu库，

![image-20240714220351911](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202407142203977.png)