---
title: RK3588 RKMPP 学习指南
date: 2026-06-11 20:07:00
categories:
  - Linux系统
link: Linux学习/RK3588 RKMPP 融合优化学习指南
---



# RK3588 RKMPP 融合优化学习指南

> 本文由 `rk3588-rkmpp-learning.md` 和 `RK3588_RKMPP_学习指南.md` 融合整理而成，目标不是堆命令，而是帮助你建立 RKMPP 的学习地图：先知道每一层在做什么，再用实验确认当前板卡和系统到底支持什么，最后再读 MPP API 和源码。

## 0. 如何使用这份指南

建议按下面顺序学习，不要一开始就跳到 FFmpeg 或 API 代码：

1. 先读第 1 到第 4 节，建立概念模型。
2. 跑第 5 到第 13 节，把当前板卡的硬件、驱动、MPP demo 和硬件负载验证跑通。
3. 再跑第 14 到第 15 节，确认 FFmpeg / GStreamer 这类应用框架是否暴露了 RKMPP。
4. 最后学习第 16 到第 18 节的 API、buffer、零拷贝和性能方法。
5. 遇到问题时按第 19 节排错，不要只看一条错误日志就下结论。

学习 RKMPP 时最重要的一句话：

> RK3588 的芯片规格、你当前系统的驱动能力、FFmpeg/GStreamer 暴露出来的能力，是三件相关但不同的事。

## 1. 学习目标与前置知识

学完本文后，你应该能完成这些事：

- 说清楚 RKMPP / Rockchip MPP / MPI / VPU / RGA / DRM / DMA-BUF 分别是什么。
- 判断当前 RK3588 系统有没有可用的 MPP 设备节点、权限和用户态库。
- 用 MPP demo 验证 H.264 / H.265 解码和编码。
- 用 FFmpeg / GStreamer 枚举和测试 RKMPP 封装。
- 通过 FPS、CPU、日志、`/proc/mpp_service/load` 判断是否真的走了硬件。
- 阅读 `mpi_dec_test.c`、`mpi_enc_test.c` 时知道重点看哪里。
- 设计自己的编解码能力测试矩阵，并记录可复现结果。

建议你提前熟悉：

- Linux 基本命令和用户组权限。
- 视频容器和裸码流的区别，例如 MP4/MKV 与 `.264` / `.h265`。
- YUV、NV12、stride、码率、帧率、GOP 等基础概念。
- FFmpeg 或 GStreamer 的基本命令行使用。

## 2. RK3588 视频能力总览

RK3588 是 Rockchip 的高性能 ARM SoC，常见于边缘计算、NAS、工控、多媒体盒子、AI 视觉盒子等场景。常见硬件特性包括：

| 模块 | 说明 |
| --- | --- |
| CPU | 4 个 Cortex-A76 + 4 个 Cortex-A55 |
| GPU | Mali-G610 MP4 |
| NPU | 约 6 TOPS |
| 视频解码 | 官方产品页描述为 H.265 / H.264 / AV1 / AVS2 等多格式解码，最高 8K@60fps |
| 视频编码 | 官方产品页描述为 H.264 / H.265 编码，最高 8K@30fps |
| 显示 | 最高 8K@60fps 显示输出 |

这些是芯片层面的高层规格。学习和测试时要额外确认：

- 当前内核是否带 Rockchip VPU / MPP / RGA / DRM / DMA-BUF / DMA-HEAP 相关驱动。
- 当前系统是否安装 `librockchip_mpp`、`librga`、GStreamer Rockchip 插件、带 RKMPP 的 FFmpeg。
- 当前码流的 codec、profile、level、bit depth、chroma、resolution、fps、bitrate 是否被当前软件栈支持。
- 应用最终使用的是 MPP、V4L2 M2M、GStreamer 插件、FFmpeg RKMPP 封装，还是纯软件解码。

官方产品页给的是整个平台的最高宣传规格，没有在该页面逐项拆分每一种 codec/profile/bit depth 的可用上限。实际学习和验收时，不要把“多格式解码最高 8K@60fps”理解成任何输入文件、任何系统镜像、任何应用框架都一定能达到这个上限。

## 3. 三层能力模型

排查 RKMPP 问题时，先把问题放到下面三层里：

| 层级 | 你要问的问题 | 典型证据 |
| --- | --- | --- |
| 芯片能力 | RK3588 理论上是否支持这种编解码？ | Rockchip 官方规格、芯片手册、板厂资料 |
| 系统能力 | 当前内核、设备树、驱动、MPP 用户态库是否可用？ | `/dev/mpp_service`、`dmesg`、`mpp_info_test`、`mpi_dec_test` |
| 应用能力 | 当前 FFmpeg/GStreamer/Jellyfin/mpv 是否暴露了硬件路径？ | `ffmpeg -decoders`、`ffmpeg -encoders`、`gst-inspect-1.0`、应用日志 |

常见误区：

- 官方写支持 8K，不代表你当前 FFmpeg 包一定有 `hevc_rkmpp`。
- `ffmpeg` 能播放，不代表走了硬件，可能是软件解码。
- MPP demo 能跑，不代表 GStreamer 插件一定安装好了。
- 硬件解码成功，不代表后面的格式转换、缩放、显示也零拷贝。

## 4. RKMPP 视频栈地图

更准确的名字是 Rockchip MPP。常见说法如下：

| 名称 | 含义 |
| --- | --- |
| MPP | Media Process Platform，Rockchip 的媒体处理平台 |
| MPI | Media Process Interface，MPP 暴露给应用层的 C API |
| RKMPP / RKMpp | 生态中的常见简称，通常指“通过 Rockchip MPP 使用硬件编解码” |
| VPU | 视频编解码硬件单元 |
| RGA | Rockchip 2D 图像加速模块，常用于缩放、裁剪、旋转、颜色转换 |
| DRM / DMA-BUF / DMA-HEAP | Linux 图形/内存共享机制，是零拷贝视频管线的关键 |

### 4.1 从应用到硬件

```text
应用层
  ffmpeg / gst-launch / mpv / chromium / jellyfin / 自己写的程序

框架层
  FFmpeg rkmpp decoder/encoder
  GStreamer rockchipmpp plugin
  OpenMAX / MediaCodec / 其他封装

Rockchip 用户态库
  librockchip_mpp.so
  librga.so

MPP 内部
  MPI 接口
  codec parser / encoder controller
  HAL register generation
  OSAL / buffer / dma-buf / drm / dma-heap allocator

内核驱动
  mpp_service / vcodec / rkvdec / rkvenc / vepu / vdpu
  rga
  drm
  dma-buf / dma-heap

硬件
  RK3588 VPU / decoder / encoder / JPEG / RGA / display
```

当你运行：

```bash
ffmpeg -c:v h264_rkmpp -i input.mp4 -f null -
```

FFmpeg 并不是自己完成硬件寄存器操作，而是通过 RKMPP 封装调用 MPP。MPP 再通过内核驱动把任务提交给 RK3588 的视频硬件。

### 4.2 MPP、V4L2、DRM、RGA 的关系

- MPP 是 Rockchip 提供的用户态媒体库；直接开发时通常使用 MPI API。
- V4L2 M2M 是 Linux 标准视频编解码接口；某些内核和发行版可能也通过 V4L2 暴露硬件编解码。
- DRM / DMA-BUF / DMA-HEAP 用来在硬件模块之间共享 buffer，减少 CPU 拷贝。
- RGA 负责 2D 图像处理，例如 NV12 到 RGB、4K 缩放到 1080p、旋转、裁剪。
- 常见高性能链路是：MPP 解码 -> DMA-BUF -> RGA 转换/缩放 -> DRM/Wayland/KMS 显示。

## 5. 媒体数据模型

先理解数据形态，后面的命令才不会乱。

| 数据形态 | 例子 | 常见用途 | 注意点 |
| --- | --- | --- | --- |
| 容器文件 | `.mp4`、`.mkv`、`.webm` | 播放、FFmpeg/GStreamer 输入 | 里面包含音频、视频、字幕、时间戳，需要 demux |
| 裸码流 | `.264`、`.h264`、`.h265`、`.hevc` | MPP demo 解码输入 | 通常需要 Annex-B 格式 |
| 原始图像 | `.yuv`、NV12、YUV420P | MPP demo 编码输入 | 必须知道宽、高、像素格式、stride |
| `MppPacket` | 压缩码流包 | 解码输入、编码输出 | 一维压缩数据 |
| `MppFrame` | 原始视频帧 | 解码输出、编码输入 | 二维图像，带宽高、stride、format、buffer |
| `MppBuffer` | 硬件可访问内存 | 承载 frame 或 packet 数据 | 可来自内部分配，也可导入 DMA-BUF |
| `MppBufferGroup` | buffer 池 | 管理一组 buffer | 解码 `info_change` 时经常要处理 |

解码链路：

```text
MP4/MKV/WebM
  -> demux/parser
  -> H.264/H.265/VP9/AV1 elementary stream
  -> MppPacket
  -> MPP/VPU
  -> MppFrame(NV12/YUV)
  -> 文件 / RGA / 显示 / 再编码
```

编码链路：

```text
NV12/YUV/camera frame
  -> MppFrame
  -> MPP/VPU
  -> MppPacket(H.264/H.265/JPEG)
  -> 裸码流 / MP4 / RTSP / 文件
```

## 6. 工具选择表

| 工具 | 什么时候用 | 输入 | 成功信号 | 常见失败 |
| --- | --- | --- | --- | --- |
| MPP demo | 验证 MPP 和硬件最小路径 | 裸码流、NV12/YUV | `mpp_info_test`、`mpi_dec_test`、`mpi_enc_test` 正常，MPP load 有变化 | 输入格式不对、权限不够、设备节点缺失 |
| FFmpeg RKMPP | 验证应用生态、转码、服务端工具链 | 容器或裸流 | `ffmpeg -decoders/-encoders` 能枚举，日志有 `rkmpp`，CPU 低 | 当前 FFmpeg 未启用 RKMPP、格式转换回落 CPU |
| GStreamer RockchipMPP | 验证 pipeline、摄像头、RTSP、显示链路 | 容器、RTP、raw video | `gst-inspect-1.0` 能找到插件，pipeline 跑通 | caps negotiation 失败、缺 parser、sink 不支持 |
| 自写 MPI 程序 | 学 API、做产品集成、控制 buffer | packet/frame/buffer | 能稳定处理 packet/frame 和 `info_change` | buffer 生命周期、stride、外部 buffer 导入出错 |

学习阶段推荐顺序：

```text
设备节点和权限 -> MPP demo -> FFmpeg 枚举/对比 -> GStreamer pipeline -> MPP API 源码
```

## 7. 环境预检 Checklist

先在 RK3588 板子上执行这些命令。

### 7.1 记录系统信息

```bash
uname -a
cat /etc/os-release
id
groups
```

建议记录：

```text
日期：
板卡型号：
SoC：
内核版本：
系统镜像：
登录用户：
用户组：
```

### 7.2 检查设备节点

```bash
ls -l /dev | grep -E 'mpp|rga|dri|dma_heap|vpu|rkv|hevc|vepu|h265'
ls -l /dev/dri 2>/dev/null || true
ls -l /dev/dma_heap 2>/dev/null || true
```

常见节点：

```text
/dev/mpp_service
/dev/rga
/dev/dri/card0
/dev/dri/renderD128
/dev/dma_heap/system
```

旧内核或兼容环境里也可能看到：

```text
/dev/mpp-service
/dev/vpu_service
/dev/vpu-service
/dev/hevc_service
/dev/rkvdec
/dev/rkvenc
/dev/vepu
/dev/h265e
```

### 7.3 检查权限

```bash
ls -l /dev/mpp_service /dev/rga /dev/dri/renderD128 2>/dev/null
```

如果普通用户访问失败，优先把用户加入相关组：

```bash
sudo usermod -aG video,render "$USER"
```

重新登录后再测。临时调试可以用 `sudo` 跑单条命令，但长期开发不要依赖 `sudo ffmpeg`。不要把 `chmod 666 /dev/mpp_service` 当成正式方案；如果确实要临时验证，验证完应恢复权限或改用 udev 规则。

### 7.4 检查驱动日志

```bash
dmesg | grep -Ei 'mpp|rga|rkvdec|rkvenc|vcodec|dma_heap|drm|vpu' | tail -100
```

如果日志里完全没有 MPP/VPU/RGA/DRM 相关信息，要先检查内核、设备树和系统镜像。

## 8. 安装或编译 Rockchip MPP

### 8.1 安装依赖

```bash
sudo apt update
sudo apt install -y git make cmake gcc g++ pkg-config build-essential libdrm-dev
```

不同系统包名可能不同，板厂镜像可能已经预装 MPP。

### 8.2 从源码编译 MPP

```bash
git clone https://github.com/rockchip-linux/mpp -b develop
cd mpp/build/linux/aarch64
./make-Makefiles.bash
make -j"$(nproc)"
```

编译后先跑：

```bash
./test/mpp_info_test
./test/mpi_dec_test -h
./test/mpi_enc_test -h
```

常见 demo：

| 工具 | 作用 |
| --- | --- |
| `mpp_info_test` | 打印 MPP 版本和兼容信息 |
| `mpi_dec_test` | 解码测试，压缩码流输入，YUV 输出 |
| `mpi_enc_test` | 编码测试，YUV 输入，压缩码流输出 |
| `mpi_rc_test` | 码率控制测试 |
| `mpi_test` | MPI 调用方式参考 |

### 8.3 使用系统包

不同发行版包名差异较大，可能包括：

```bash
sudo apt install rockchip-mpp
sudo apt install librockchip-mpp1 librockchip-mpp-dev
sudo apt install gstreamer1.0-rockchip
```

如果这些包不存在，说明你的发行版没有打包 Rockchip 组件，需要使用板厂 SDK、源码编译，或安装板厂提供的 Debian/Ubuntu 镜像。

## 9. Lab 1：MPP 最小可用性验证

目标：先证明 MPP 库和硬件最短路径能跑，再去测 FFmpeg/GStreamer。

```bash
cd mpp/build/linux/aarch64
./test/mpp_info_test
```

通过标准：

- 命令能正常运行，不是 `Permission denied` 或 `No such file or directory`。
- 能看到 MPP 版本、构建信息或兼容信息。
- 如果失败，先回到第 7 节检查设备节点、权限和驱动日志。

## 10. Lab 2：准备标准测试素材

MPP demo 通常更适合吃裸码流，而不是 MP4/MKV 容器。

### 10.1 从 MP4/MKV 抽 H.264/H.265 裸流

```bash
ffmpeg -i input_h264.mp4 -an -c:v copy -bsf:v h264_mp4toannexb input_h264.264
ffmpeg -i input_h265.mp4 -an -c:v copy -bsf:v hevc_mp4toannexb input_h265.h265
```

### 10.2 生成 NV12 编码输入

```bash
ffmpeg -f lavfi -i testsrc2=s=1920x1080:r=30 \
  -frames:v 300 -pix_fmt nv12 input_1080p_nv12.yuv

ffmpeg -f lavfi -i testsrc2=s=3840x2160:r=30 \
  -frames:v 120 -pix_fmt nv12 input_4k_nv12.yuv
```

### 10.3 记录素材信息

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,width,height,pix_fmt,avg_frame_rate,bit_rate \
  -of default=nw=1 input_h264.mp4
```

记录模板：

```text
文件名：
容器：
codec：
profile/level：
pix_fmt：
bit depth：
width/height：
fps：
bitrate：
是否裸码流：
```

## 11. Lab 3：MPP Demo 解码

进入 MPP 编译目录：

```bash
cd mpp/build/linux/aarch64
```

H.264 解码：

```bash
./test/mpi_dec_test \
  -i input_h264.264 \
  -o out_h264.yuv \
  -t 7 \
  -n 300
```

H.265 解码：

```bash
./test/mpi_dec_test \
  -i input_h265.h265 \
  -o out_h265.yuv \
  -t 16777220 \
  -n 300
```

说明：

- `-i`：输入裸码流。
- `-o`：输出 YUV。纯性能测试时可以不输出，避免写盘成为瓶颈。
- `-t`：MPP 编码类型编号。不同版本可能略有差异，必须以 `./test/mpi_dec_test -h` 的本机输出为准。
- `-n`：测试帧数。

通过标准：

- 程序正常结束，或输出 `test success` 一类成功信息。
- FPS 明显超过实时播放需求，例如 1080p30 解码速度大于 30fps。
- CPU 占用不高。
- `/proc/mpp_service/load` 能看到负载变化。

## 12. Lab 4：MPP Demo 编码

H.264 编码：

```bash
./test/mpi_enc_test \
  -i input_1080p_nv12.yuv \
  -o out_1080p.264 \
  -w 1920 \
  -h 1080 \
  -f 0 \
  -t 7 \
  -n 300 \
  -bps 4000000
```

H.265 编码：

```bash
./test/mpi_enc_test \
  -i input_4k_nv12.yuv \
  -o out_4k.h265 \
  -w 3840 \
  -h 2160 \
  -f 0 \
  -t 16777220 \
  -n 120 \
  -bps 15000000
```

常见参数：

| 参数 | 含义 |
| --- | --- |
| `-w` / `-h` | 输入图像宽高 |
| `-f` | 输入像素格式，常见 `0` 是 YUV420SP/NV12，具体以 `-h` 输出为准 |
| `-t` | 编码类型 |
| `-bps` | 目标码率 |
| `-fps` | 帧率相关参数，部分版本支持 |

验证输出：

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,width,height,avg_frame_rate,bit_rate \
  -of default=nw=1 out_1080p.264

ffmpeg -v error -i out_1080p.264 -f null -
```

## 13. 证明真的走了硬件

不要只凭命令能跑就判断“硬解成功”。至少看下面四类证据：

| 证据 | 怎么看 | 说明 |
| --- | --- | --- |
| 日志 | FFmpeg verbose 日志、GStreamer `GST_DEBUG`、MPP demo 输出 | 是否出现 `rkmpp`、`mpp`、相关 codec |
| 性能 | FPS、`speed=`、总耗时 | 硬件路径通常明显快于软件路径 |
| CPU | `top`、`htop`、`pidstat` | CPU 低不一定硬解，但 CPU 很高通常有问题 |
| 硬件负载 | `/proc/mpp_service/load`、RGA debugfs | 能看到 MPP/RGA 负载变化更有说服力 |

MPP 负载：

```bash
sudo sh -c 'echo 1000 > /proc/mpp_service/load_interval' 2>/dev/null || true
watch -n 1 'cat /proc/mpp_service/load 2>/dev/null || true'
```

RGA 负载：

```bash
sudo watch -n 1 'cat /sys/kernel/debug/rkrga/load 2>/dev/null || true'
```

其他调试节点可能包括：

```bash
cat /proc/mpp_service/sessions 2>/dev/null || true
cat /sys/kernel/debug/mpp_service/status 2>/dev/null || true
```

注意：这些 proc/debugfs 节点与内核版本、调试配置、板厂镜像有关，不存在不一定代表硬件不可用。

## 14. Lab 5：FFmpeg RKMPP 测试与结果判读

### 14.1 先确认当前 FFmpeg 是否带 RKMPP

```bash
ffmpeg -hide_banner -version
ffmpeg -hide_banner -buildconf | grep -Ei 'rkmpp|libdrm'
ffmpeg -hide_banner -decoders | grep rkmpp
ffmpeg -hide_banner -encoders | grep rkmpp
```

你可能看到：

```text
V..... h264_rkmpp
V..... hevc_rkmpp
V..... vp8_rkmpp
V..... vp9_rkmpp
V..... mjpeg_rkmpp
```

或者编码器：

```text
V..... h264_rkmpp
V..... hevc_rkmpp
V..... mjpeg_rkmpp
```

注意：

- 不同 FFmpeg 版本差异很大，不要假设网上某条命令在你板子上一定可用。
- 是否有 `h264_rkmpp` 编码器，要以 `ffmpeg -encoders | grep rkmpp` 的本机输出为准。
- 不要照抄 `h264_rkmpp_encoder` 这类未经本机枚举确认的名字。
- `ffmpeg -hwaccels` 不是可靠的 RKMPP 能力检查，优先看 `-decoders`、`-encoders`、`-buildconf` 和单个编解码器帮助。
- FFmpeg 的 RKMPP 通常需要 `--enable-rkmpp --enable-libdrm`。

### 14.2 如果要自己编译 FFmpeg

先确认 MPP 和 libdrm 的 pkg-config 信息可用：

```bash
pkg-config --modversion rockchip_mpp
pkg-config --cflags --libs rockchip_mpp libdrm
```

配置 FFmpeg 时至少需要：

```bash
./configure \
  --enable-rkmpp \
  --enable-libdrm
```

上游 FFmpeg 的 `configure` 会检查 `rockchip_mpp` 和 `libdrm`。如果 `pkg-config` 找不到 `rockchip_mpp`，不要急着改 FFmpeg，先修 MPP 安装路径、`.pc` 文件、`PKG_CONFIG_PATH`。

### 14.3 查看单个编解码器参数

```bash
ffmpeg -hide_banner -h decoder=h264_rkmpp
ffmpeg -hide_banner -h decoder=hevc_rkmpp
ffmpeg -hide_banner -h decoder=vp9_rkmpp
ffmpeg -hide_banner -h decoder=mjpeg_rkmpp

ffmpeg -hide_banner -h encoder=h264_rkmpp
ffmpeg -hide_banner -h encoder=hevc_rkmpp
```

如果提示 `Unknown decoder` 或 `Unknown encoder`，说明当前 FFmpeg 没编进对应能力。

### 14.4 解码性能测试

H.264：

```bash
ffmpeg -benchmark -stats -loglevel verbose \
  -c:v h264_rkmpp \
  -i input_h264.mp4 \
  -an -sn -f null -
```

H.265：

```bash
ffmpeg -benchmark -stats -loglevel verbose \
  -c:v hevc_rkmpp \
  -i input_h265.mp4 \
  -an -sn -f null -
```

VP9：

```bash
ffmpeg -benchmark -stats -loglevel verbose \
  -c:v vp9_rkmpp \
  -i input_vp9.webm \
  -an -sn -f null -
```

如果你的 FFmpeg 支持 `-hwaccel rkmpp` 和 DRM PRIME：

```bash
ffmpeg -benchmark -stats -loglevel verbose \
  -hwaccel rkmpp \
  -hwaccel_output_format drm_prime \
  -i input_h264.mp4 \
  -an -sn -f null -
```

### 14.5 编码测试

只有在本机能枚举出编码器时再执行。

H.264：

```bash
ffmpeg -benchmark -stats \
  -f lavfi -i testsrc2=s=1920x1080:r=30,format=nv12 \
  -c:v h264_rkmpp \
  -b:v 4M \
  -g 60 \
  -frames:v 300 \
  -y out_h264_rkmpp.mp4
```

H.265：

```bash
ffmpeg -benchmark -stats \
  -f lavfi -i testsrc2=s=3840x2160:r=30,format=nv12 \
  -c:v hevc_rkmpp \
  -b:v 15M \
  -g 60 \
  -frames:v 300 \
  -y out_hevc_rkmpp.mp4
```

校验输出：

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,width,height,avg_frame_rate,bit_rate \
  -of default=nw=1 out_h264_rkmpp.mp4

ffmpeg -v error -i out_h264_rkmpp.mp4 -f null -
```

### 14.6 对比软件解码

```bash
ffmpeg -benchmark -stats -c:v h264 -i input_h264.mp4 -an -sn -f null -
ffmpeg -benchmark -stats -c:v h264_rkmpp -i input_h264.mp4 -an -sn -f null -
```

如果硬件版本 CPU 更低、速度更高、MPP load 有变化，基本可以确认走了硬件。

## 15. Lab 6：GStreamer RockchipMPP 测试与结果判读

### 15.1 枚举插件

```bash
gst-inspect-1.0 --version
gst-inspect-1.0 rockchipmpp
gst-inspect-1.0 | grep -E 'mpp(video|jpeg|h264|h265|vp8|vp9)'

gst-inspect-1.0 mppvideodec
gst-inspect-1.0 mpph264enc
gst-inspect-1.0 mpph265enc
gst-inspect-1.0 mppjpegenc
```

常见插件名可能包括：

- `mppvideodec`
- `mppjpegdec`
- `mpph264enc`
- `mpph265enc`
- `mppjpegenc`
- `mppvp8enc`

不同系统包名称和插件元素名可能不同，以 `gst-inspect-1.0` 为准。不要假定一定存在 `mppvideoenc`。

### 15.2 解码到 fakesink 测 FPS

H.264 MP4：

```bash
gst-launch-1.0 -v \
  filesrc location=input_h264.mp4 ! \
  qtdemux ! h264parse ! \
  mppvideodec ! \
  fpsdisplaysink video-sink=fakesink text-overlay=false sync=false
```

H.265 MP4：

```bash
gst-launch-1.0 -v \
  filesrc location=input_h265.mp4 ! \
  qtdemux ! h265parse ! \
  mppvideodec ! \
  fpsdisplaysink video-sink=fakesink text-overlay=false sync=false
```

RTSP H.264：

```bash
gst-launch-1.0 -v \
  rtspsrc location=rtsp://HOST/PATH latency=100 ! \
  rtph264depay ! h264parse ! \
  mppvideodec ! \
  waylandsink sync=false
```

### 15.3 编码测试

H.264：

```bash
gst-launch-1.0 -e \
  videotestsrc num-buffers=300 ! \
  video/x-raw,format=NV12,width=1920,height=1080,framerate=30/1 ! \
  mpph264enc bps=4000000 gop=60 ! \
  h264parse ! mp4mux ! \
  filesink location=out_h264_gst.mp4
```

H.265：

```bash
gst-launch-1.0 -e \
  videotestsrc num-buffers=300 ! \
  video/x-raw,format=NV12,width=3840,height=2160,framerate=30/1 ! \
  mpph265enc bps=15000000 gop=60 ! \
  h265parse ! mp4mux ! \
  filesink location=out_h265_gst.mp4
```

### 15.4 调试日志

```bash
GST_DEBUG=2,*mpp*:4 gst-launch-1.0 ...
GST_DEBUG=fpsdisplaysink:7 gst-launch-1.0 ...
```

如果 caps negotiation 失败，按这个顺序排查：

1. 输入 parser 是否正确，例如 `h264parse` / `h265parse`。
2. raw caps 是否固定，例如 `video/x-raw,format=NV12,width=...,height=...,framerate=...`。
3. 是否需要 `queue` 拆分线程。
4. 先用 `fakesink` 验吞吐，再换 `waylandsink` / `kmssink`。
5. 打开 `GST_DEBUG=2,*mpp*:4` 看协商失败点。

## 16. MPP API 核心对象与流程

### 16.1 你必须认识的对象

| 对象 | 作用 |
| --- | --- |
| `MppCtx` | 一个编码器或解码器实例上下文 |
| `MppApi` | 函数指针表，应用通过它调用 MPP |
| `MppPacket` | 一维压缩码流数据，解码输入、编码输出常用 |
| `MppFrame` | 二维图像帧，解码输出、编码输入常用 |
| `MppBuffer` | 可被硬件访问的内存块封装 |
| `MppBufferGroup` | 一组 buffer 的管理器/池 |
| `MppTask` | 高级队列接口里的任务对象，用于更复杂的异步/零拷贝流程 |

重要 API：

| 函数 | 说明 |
| --- | --- |
| `mpp_create()` | 创建 MPP 上下文 |
| `mpp_init()` | 初始化编解码器类型 |
| `mpp_destroy()` | 销毁 MPP 上下文 |
| `mpi->decode_put_packet()` | 输入压缩数据 |
| `mpi->decode_get_frame()` | 获取解码帧 |
| `mpi->encode_put_frame()` | 输入原始帧 |
| `mpi->encode_get_packet()` | 获取编码数据 |
| `mpi->control()` | 控制命令 |

### 16.2 解码最小流程

伪代码：

```c
MppCtx ctx = NULL;
MppApi *mpi = NULL;

mpp_create(&ctx, &mpi);

/* 如果输入不是一帧一包的裸码流，通常要打开 parser split。 */
mpi->control(ctx, MPP_DEC_SET_PARSER_SPLIT_MODE, &need_split);

mpp_init(ctx, MPP_CTX_DEC, MPP_VIDEO_CodingAVC);

while (read_bitstream(&data, &len)) {
    MppPacket packet = NULL;
    mpp_packet_init(&packet, data, len);

    mpi->decode_put_packet(ctx, packet);
    mpp_packet_deinit(&packet);

    while (1) {
        MppFrame frame = NULL;
        MPP_RET ret = mpi->decode_get_frame(ctx, &frame);
        if (ret || !frame)
            break;

        if (mpp_frame_get_info_change(frame)) {
            /*
             * 读取 width / height / hor_stride / ver_stride / buf_size。
             * 创建或调整 MppBufferGroup。
             * 通过 MPP_DEC_SET_EXT_BUF_GROUP 交给解码器。
             * 最后调用 MPP_DEC_SET_INFO_CHANGE_READY。
             */
        } else {
            MppBuffer buf = mpp_frame_get_buffer(frame);
            void *ptr = mpp_buffer_get_ptr(buf);
            size_t size = mpp_buffer_get_size(buf);
            /*
             * ptr 不是简单的 width * height 连续 RGB 图。
             * 保存或处理时必须考虑 format、hor_stride、ver_stride。
             */
        }

        mpp_frame_deinit(&frame);
    }
}

mpp_destroy(ctx);
```

关键点：

- MPP demo 常用裸码流，不是 MP4/MKV 容器。
- 如果分帧不正确，需要 parser split。
- 解码时可能发生 `info_change`，例如分辨率、stride、buffer size 变化。
- `mpp_frame_get_buffer(frame)` 返回的是 `MppBuffer`，不是裸指针；要通过 `mpp_buffer_get_ptr()` 取 CPU 可访问指针。
- 真正做零拷贝显示时，buffer group 和 dma-buf ownership 是核心。

### 16.3 编码最小流程

伪代码：

```c
MppCtx ctx = NULL;
MppApi *mpi = NULL;

mpp_create(&ctx, &mpi);
mpp_init(ctx, MPP_CTX_ENC, MPP_VIDEO_CodingAVC);

/* 配置 MppEncCfg：宽高、stride、format、fps、gop、码率、profile 等。 */
mpi->control(ctx, MPP_ENC_SET_CFG, cfg);

/* H.264/H.265 通常先取 SPS/PPS/VPS 头。 */
mpi->control(ctx, MPP_ENC_GET_HDR_SYNC, header_packet);

while (read_yuv_frame(&buffer)) {
    MppFrame frame = NULL;
    mpp_frame_init(&frame);
    mpp_frame_set_width(frame, width);
    mpp_frame_set_height(frame, height);
    mpp_frame_set_hor_stride(frame, hor_stride);
    mpp_frame_set_ver_stride(frame, ver_stride);
    mpp_frame_set_fmt(frame, MPP_FMT_YUV420SP);
    mpp_frame_set_buffer(frame, buffer);

    mpi->encode_put_frame(ctx, frame);
    mpp_frame_deinit(&frame);

    while (1) {
        MppPacket packet = NULL;
        MPP_RET ret = mpi->encode_get_packet(ctx, &packet);
        if (ret || !packet)
            break;

        /* 写出 mpp_packet_get_pos(packet) 和 mpp_packet_get_length(packet)。 */
        mpp_packet_deinit(&packet);
    }
}

mpp_destroy(ctx);
```

关键点：

- 编码比解码更依赖正确配置：宽高、stride、像素格式、码率、帧率、GOP。
- 输入最好是硬件可访问 buffer，例如 DMA-BUF / DRM / DMA-HEAP。
- 如果输入是普通 malloc 内存，通常需要拷贝到 `MppBuffer`，性能会受影响。
- `MPP_DEC_SET_PARSER_SPLIT_MODE` 是 parser split 相关控制，不是“设置线程数”。

### 16.4 编码参数常见配置

```c
mpp_enc_cfg_set_s32(cfg, "prep:width", 1920);
mpp_enc_cfg_set_s32(cfg, "prep:height", 1080);
mpp_enc_cfg_set_s32(cfg, "prep:hor_stride", 1920);
mpp_enc_cfg_set_s32(cfg, "prep:ver_stride", 1080);
mpp_enc_cfg_set_s32(cfg, "prep:format", MPP_FMT_YUV420SP);

mpp_enc_cfg_set_s32(cfg, "rc:mode", MPP_ENC_RC_MODE_CBR);
mpp_enc_cfg_set_s32(cfg, "rc:bps_target", 4000000);
mpp_enc_cfg_set_s32(cfg, "rc:bps_max", 4500000);
mpp_enc_cfg_set_s32(cfg, "rc:bps_min", 3500000);
mpp_enc_cfg_set_s32(cfg, "rc:gop", 60);
```

具体 key 和取值以当前 MPP 版本、官方 demo、头文件为准。

## 17. BufferGroup、DMA-BUF、RGA 与零拷贝

`MppBufferGroup` 常见三种模式：

| 模式 | 说明 | 适合阶段 |
| --- | --- | --- |
| 内部模式 | MPP 自己分配和管理 buffer | 入门、demo、最小验证 |
| 半内部模式 | 应用创建 group，MPP 在 group 里分配 buffer | 需要控制 buffer 数量和生命周期 |
| 外部导入模式 | 应用从 DRM/DMA-HEAP/ION 等分配 buffer，再导入 MPP | 高性能显示、摄像头编码、零拷贝转码 |

学习建议：

- 先用内部模式和官方 demo 跑通，不要一开始就写外部 DMA-BUF 导入。
- 需要解码后显示、解码后 RGA 缩放、摄像头帧编码、转码时，再研究外部 buffer。
- 零拷贝不是“永远没有 CPU 参与”，而是尽量避免大块图像数据在 CPU 内存里来回复制。

典型零拷贝思路：

```text
解码输出 MppFrame(DMA-BUF)
  -> RGA 做 resize/colorspace
  -> DRM/Wayland/KMS 显示

摄像头/ISP 输出 DMA-BUF
  -> MPP encoder 输入 MppFrame
  -> H.264/H.265 packet
  -> mux/network/file
```

## 18. Lab 7：性能测试矩阵

不要只跑一个 1080p 文件就判断能力。建议按下面矩阵测试：

| 方向 | 格式 | 分辨率 | 帧率 | 工具 | 目标 |
| --- | --- | --- | --- | --- | --- |
| 解码 | H.264 | 1080p | 30/60 | MPP/FFmpeg/GStreamer | 基线 |
| 解码 | H.265 Main | 4K | 30/60 | MPP/FFmpeg/GStreamer | 常见高分辨率 |
| 解码 | H.265 Main10 | 4K/8K | 30/60 | FFmpeg/GStreamer/MPP | 10bit 支持验证 |
| 解码 | VP9 | 4K | 30/60 | FFmpeg/GStreamer | Web 视频 |
| 解码 | AV1 | 4K/8K | 30/60 | GStreamer/MPP/定制 FFmpeg | 新格式验证 |
| 编码 | H.264 | 1080p/4K | 30/60 | MPP/FFmpeg/GStreamer | 基线 |
| 编码 | H.265 | 4K/8K | 30 | MPP/FFmpeg/GStreamer | 高压缩率 |
| 编码 | JPEG/MJPEG | 1080p/4K | 30 | MPP/GStreamer/定制 FFmpeg | 图像编码 |

结果记录模板：

```text
日期：
板卡型号：
SoC：
内核版本：
系统镜像：
MPP 版本：
FFmpeg 版本和 buildconf：
GStreamer 版本：
输入文件 codec/profile/level/pix_fmt/resolution/fps/bitrate：
命令：
平均 fps/speed：
CPU 占用：
/proc/mpp_service/load：
RGA load：
是否成功：
错误日志：
结论：
```

测试卫生：

- 性能测试时尽量用 `-f null -` 或 `fakesink`，不要让写 YUV 文件成为瓶颈。
- 记录 CPU governor、温度、频率，避免热降频影响结论。
- 高分辨率测试要确认存储读速足够。
- 如果 pipeline 中做了 NV12->RGB、缩放、字幕、滤镜，单独记录这些开销。
- 硬解后如果把硬件帧下载到 CPU，再做软件转换，CPU 仍然可能很高。

## 19. 故障排查 Playbook

### 19.1 `Unknown decoder 'h264_rkmpp'`

原因：当前 FFmpeg 没有编译 RKMPP 解码器。

检查：

```bash
ffmpeg -hide_banner -buildconf | grep -i rkmpp
ffmpeg -hide_banner -decoders | grep rkmpp
```

处理：

- 换板厂或发行版提供的 FFmpeg。
- 自己编译 FFmpeg，启用 `--enable-rkmpp --enable-libdrm`。
- 改用 MPP demo 或 GStreamer Rockchip 插件测试硬件。

### 19.2 `Unknown encoder 'h264_rkmpp'`

原因：当前 FFmpeg 没有 RKMPP 编码器，或编码器名字与你照抄的命令不同。

处理：

```bash
ffmpeg -hide_banner -encoders | grep rkmpp
ffmpeg -hide_banner -h encoder=h264_rkmpp
```

如果没有对应编码器：

- 使用 GStreamer `mpph264enc` / `mpph265enc`，前提是 `gst-inspect-1.0` 能枚举到。
- 使用 MPP `mpi_enc_test`。
- 使用带 Rockchip 编码器封装的 FFmpeg 构建。

### 19.3 `Permission denied`

原因：用户没有访问 `/dev/mpp_service`、`/dev/dri/renderD128`、`/dev/rga` 等节点的权限。

处理：

```bash
sudo usermod -aG video,render "$USER"
```

重新登录后再测。

### 19.4 设备节点不存在

现象：

```bash
ls: cannot access '/dev/mpp_service': No such file or directory
```

检查：

```bash
dmesg | grep -Ei 'mpp|rkvdec|rkvenc|vcodec|vpu'
ls -l /dev | grep -E 'mpp|vpu|rkv|vepu'
```

可能原因：

- 内核不包含相关驱动。
- 设备树没有启用 VPU/RGA。
- 当前容器或 chroot 没有映射设备节点。
- 板厂镜像裁剪了媒体组件。

### 19.5 能跑但 CPU 很高

可能原因：

- 实际走了软件解码。
- 硬件解码后又做了 CPU 格式转换。
- 输出到 `out.yuv` 写盘成为瓶颈。
- pipeline 中间从 DMA-BUF 下载到了 CPU 内存。
- 过滤器、字幕、缩放、色彩转换在 CPU 上执行。

检查：

```bash
top -H -p "$(pidof ffmpeg)"
cat /proc/mpp_service/load 2>/dev/null || true
ffmpeg -loglevel verbose ...
GST_DEBUG=2,*mpp*:4 gst-launch-1.0 ...
```

### 19.6 8K 文件跑不动

不要马上认定芯片不支持。先确认：

- 文件 codec/profile/bit depth/chroma 是否在当前栈支持范围内。
- 存储读速是否够。
- 是否输出 YUV 到慢速磁盘。
- 是否启用了显示、缩放、格式转换等额外负载。
- 是否存在热降频。
- 当前内核和 MPP 是否足够新。

先用 `-f null -` 或 `fakesink` 跑纯解码吞吐，再测显示和转码。

### 19.7 GStreamer caps negotiation 失败

处理顺序：

1. 加 parser：`h264parse` / `h265parse`。
2. 固定 caps：`video/x-raw,format=NV12,width=...,height=...,framerate=...`。
3. 加 `queue` 拆分线程。
4. 先用 `fakesink`，再换 `waylandsink` / `kmssink`。
5. 打开 `GST_DEBUG=2,*mpp*:4`。

### 19.8 编译或运行找不到头文件/库

检查：

```bash
pkg-config --list-all | grep -Ei 'mpp|rockchip'
pkg-config --modversion rockchip_mpp 2>/dev/null || true
pkg-config --cflags --libs rockchip_mpp 2>/dev/null || true
pkg-config --cflags --libs libdrm 2>/dev/null || true
ldconfig -p | grep -Ei 'mpp|rockchip'
```

常见处理：

```bash
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
sudo ldconfig
```

如果是板厂 SDK，请优先使用 SDK 说明里的 include/lib 路径。

### 19.9 `unsupported`、`invalid profile`、输出异常

先用 `ffprobe` 把输入文件说清楚：

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,profile,level,width,height,pix_fmt,avg_frame_rate,bit_rate \
  -of default=nw=1 input.mp4
```

重点看：

- codec 是否是当前 MPP/FFmpeg/GStreamer 路径支持的格式。
- profile、level、bit depth、chroma 是否超出当前系统支持范围。
- 输入是否真的是裸 Annex-B 码流，还是容器文件。
- raw YUV 输入的宽高、像素格式、stride 是否和命令参数一致。

### 19.10 debugfs、CMA、内存和热降频

如果性能不稳定或高分辨率失败，补查：

```bash
mount | grep debugfs || true
df -h
free -h
dmesg | grep -Ei 'cma|iommu|mpp|rga|vpu|alloc|fail' | tail -100
cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head
```

可能原因：

- debugfs 没挂载，所以看不到某些负载节点。
- CMA/IOMMU/连续内存不足，导致高分辨率 buffer 分配失败。
- 系统内存或存储 I/O 不足。
- 温度过高导致 CPU/VPU/内存频率下降。

## 20. Lab 8：故意制造错误来练排查

真正学会 RKMPP，不能只跑成功路径。建议做这些小实验：

| 实验 | 预期失败 | 学习点 |
| --- | --- | --- |
| 用普通用户访问无权限设备节点 | `Permission denied` | 用户组、udev、render/video |
| 把 MP4 直接喂给 `mpi_dec_test` | 解码失败或乱码 | 容器与裸码流区别 |
| 去掉 GStreamer parser | caps negotiation 失败 | parser 的作用 |
| 强行使用不存在的 FFmpeg 编码器名 | `Unknown encoder` | 本机枚举优先 |
| 输出 8K YUV 到慢盘 | FPS 很差 | I/O 瓶颈与纯解码吞吐 |
| 用错误宽高编码 NV12 | 输出异常或失败 | raw video 必须带外部元数据 |

每次失败都记录：

```text
错误现象：
命令：
日志关键行：
属于哪一层：芯片 / 系统 / 应用 / 输入数据 / 性能瓶颈
下一步检查：
修复方法：
```

## 21. Lab 9：源码阅读路线

Rockchip MPP 仓库建议阅读顺序：

```text
readme.txt
doc/Rockchip_Developer_Guide_MPP_CN.md
inc/rk_mpi.h
inc/mpp_packet.h
inc/mpp_frame.h
inc/mpp_buffer.h
test/mpp_info_test.c
test/mpi_dec_test.c
test/mpi_enc_test.c
```

重点问题：

- `mpp_create()` 和 `mpp_init()` 在哪里被调用？
- `MppPacket` 的数据来自哪里，什么时候释放？
- `decode_get_frame()` 后如何处理 `info_change`？
- `MppBufferGroup` 是内部、半内部还是外部？
- `MppFrame` 的 width、height、hor_stride、ver_stride、format 如何设置？
- 编码时 SPS/PPS/VPS header 是如何取出的？
- demo 如何统计 FPS 和错误？

## 22. Capstone：完成一份板卡编解码能力报告

最后用这份模板总结你的板卡：

```text
# RK3588 RKMPP 能力报告

## 板卡与系统
板卡：
SoC：
系统镜像：
内核：
MPP 版本：
FFmpeg 版本：
GStreamer 版本：

## 设备节点
/dev/mpp_service：
/dev/rga：
/dev/dri/renderD128：
/dev/dma_heap：
用户组：

## MPP demo
mpp_info_test：
H.264 decode：
H.265 decode：
H.264 encode：
H.265 encode：

## FFmpeg
rkmpp decoders：
rkmpp encoders：
软件解码对比：
硬件解码对比：

## GStreamer
rockchipmpp 插件：
mppvideodec：
mpph264enc：
mpph265enc：

## 性能矩阵
填入第 18 节表格。

## 问题与结论
当前可用能力：
当前不可用能力：
原因判断：
后续计划：
```

## 23. 第一轮命令清单

如果你现在只想先摸底，按顺序跑这一组：

```bash
uname -a
cat /etc/os-release
ls -l /dev | grep -E 'mpp|rga|dri|dma_heap|vpu|rkv|hevc|vepu|h265'
id
groups
dmesg | grep -Ei 'mpp|rga|rkvdec|rkvenc|vcodec|dma_heap|drm|vpu' | tail -100
```

```bash
ffmpeg -hide_banner -version
ffmpeg -hide_banner -buildconf | grep -Ei 'rkmpp|libdrm'
ffmpeg -hide_banner -decoders | grep rkmpp
ffmpeg -hide_banner -encoders | grep rkmpp
```

```bash
gst-inspect-1.0 --version
gst-inspect-1.0 rockchipmpp
gst-inspect-1.0 | grep -E 'mpp(video|jpeg|h264|h265|vp8|vp9)'
```

如果 MPP 源码已编译：

```bash
./test/mpp_info_test
./test/mpi_dec_test -h
./test/mpi_enc_test -h
```

## 24. 资料来源

本指南融合了当前目录下两份原始教程：

- `rk3588-rkmpp-learning.md`
- `RK3588_RKMPP_学习指南.md`

建议优先查看这些一手资料：

- Rockchip RK3588 官方产品页：<https://www.rock-chips.com/a/en/products/RK35_Series/2022/0926/1660.html>
- Rockchip MPP 官方仓库：<https://github.com/rockchip-linux/mpp>
- MPP README：<https://github.com/rockchip-linux/mpp/blob/develop/readme.txt>
- MPP 中文开发指南：<https://github.com/rockchip-linux/mpp/blob/develop/doc/Rockchip_Developer_Guide_MPP_CN.md>
- `mpi_dec_test.c`：<https://github.com/rockchip-linux/mpp/blob/develop/test/mpi_dec_test.c>
- `mpi_enc_test.c`：<https://github.com/rockchip-linux/mpp/blob/develop/test/mpi_enc_test.c>
- `mpp_buffer.h`：<https://github.com/rockchip-linux/mpp/blob/develop/inc/mpp_buffer.h>
- `rk_mpi.h`：<https://github.com/rockchip-linux/mpp/blob/develop/inc/rk_mpi.h>
- FFmpeg configure RKMPP 选项：<https://github.com/FFmpeg/FFmpeg/blob/master/configure>
- FFmpeg RKMPP decoder 源码：<https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/rkmppdec.c>
- GStreamer 调试文档：<https://gstreamer.freedesktop.org/documentation/tutorials/basic/debugging-tools.html>
- Jellyfin Rockchip 硬件加速文档：<https://jellyfin.org/docs/general/post-install/transcoding/hardware-acceleration/rockchip/>
- ffmpeg-rockchip 项目：<https://github.com/nyanmisaka/ffmpeg-rockchip>

## 25. 一句话总结

RK3588 的硬件编解码能力很强，但学习和排错时必须分清三层：芯片规格、内核/MPP 驱动能力、应用框架暴露能力。最稳的学习路径是先用 MPP demo 验证硬件，再用 FFmpeg/GStreamer 验证实际业务软件栈，最后根据日志、FPS、CPU、MPP load、RGA load 判断是否真正走了 RKMPP，并在源码中理解 packet、frame、buffer 和 `info_change` 的生命周期。
