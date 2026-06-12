---
title: DeepSeek使用
date: 2025-02-05 06:50:19
categories:
  - 工具配置
link: 07_小技巧/19_维护我的github仓库
---

### 克隆命令

1. 克隆 `ubuntu` 项目：

   ```bash
   git clone git@github.com:chai0705/ubuntu.git
   ```

2. 克隆 `debian` 项目：

   ```bash
   git clone git@github.com:chai0705/debian.git
   ```

3. 克隆 `u-boot` 项目：

   ```bash
   git clone git@github.com:chai0705/u-boot.git u-boot
   ```

4. 克隆 `kernel` 项目(内核太大了，不用depth不行啊)：

   ```bash
   git clone --depth=1 git@github.com:chai0705/kernel.git kernel
   ```

5. 克隆 `rkbin` 项目：

   ```bash
   git clone git@github.com:chai0705/rkbin.git rkbin
   ```

6. 克隆 `initrd` 项目：

   ```bash
   git clone git@github.com:chai0705/initrd.git initrd
   ```

7. 克隆 `gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu` 交叉编译器项目：

   ```bash
   git clone git@github.com:chai0705/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu.git prebuilts/gcc/linux-x86/aarch64/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu
   ```

8. 克隆 `device_rockchip` 项目：

   ```bash
   git clone git@github.com:chai0705/device_rockchip.git device/rockchip
   ```

9. 克隆 `tools` 项目：

   ```bash
   git clone git@github.com:chai0705/tools.git tools
   git checkout 210be81d659a6bc4e7a648744ae77837f394be0f
   ```

这样所有的仓库将默认克隆到它们的默认分支，而不需要指定特定的分支。



根据你的 `manifest` 文件，我将列出所有需要创建的软链接命令 (`ln -s`)。这些链接会按照你在文件中的 `linkfile` 元素指定的源路径和目标路径进行创建。

### 软链接命令：

1. 对 `device_rockchip` 项目创建软链接：

   ```bash
   ln -s device/rockchip/common/mkfirmware.sh mkfirmware.sh
   ln -s device/rockchip/common/build.sh build.sh
   ln -s device/rockchip/common/rkflash.sh rkflash.sh
   ln -s rk3588 device/rockchip/.target_product
   ```

2. 对 `tools` 项目创建软链接：

   ```bash
   ln -s windows/RKDevTool/RKDevTool_Release/rk3588-config.cfg tools/windows/RKDevTool/RKDevTool_Release/config.cfg
   ln -s windows/RKDevTool/rockdev/rk3588-package-file tools/windows/RKDevTool/rockdev/package-file
   ln -s windows/RKDevTool/rockdev/rk3588-mkupdate.bat tools/windows/RKDevTool/rockdev/mkupdate.bat
   ln -s rk3588-mkupdate.sh tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh
   ln -s rk3588-package-file tools/linux/Linux_Pack_Firmware/rockdev/package-file
   
   ln -s rk3588-mkupdate.sh tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh
   ln -s rk3588-package-file tools/linux/Linux_Pack_Firmware/rockdev/package-file
   ```



### 测试

```
 mkdir rk3568_full rk3568_mini rk3588_full rk3588_mini rk3588s -p
```



~~~shell
    wget https://raw.githubusercontent.com/esrlabs/git-repo/stable/repo -O repo && chmod 777 repo && sudo mv repo /usr/bin/
~~~



~~~shell
repo init -u https://github.com/chai0705/manifest -b master -m rk3568_full_linux_release.xml 

repo init -u https://github.com/chai0705/manifest -b master -m rk3568_mini_linux_release.xml

repo init -u https://github.com/chai0705/manifest -b master -m rk3588_full_linux_release.xml

repo init -u https://github.com/chai0705/manifest -b master -m rk3588_mini_linux_release.xml

repo init -u https://github.com/chai0705/manifest -b master -m rk3588s_linux_release.xml 

repo init -u https://github.com/chai0705/manifest -b master -m rk3576_linux_release.xml 

~~~





### 整体打包命令



~~~shell
#!/bin/bash

# 目录列表
directories=("rk3568_full" "rk3568_mini" "rk3588_full" "rk3588_mini" "rk3588s")

# 遍历每个目录并执行 repo sync
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "进入目录 $dir"
        cd "$dir" || continue
        
        echo "执行 repo sync -j32"
        repo sync -j32
        
        echo "返回上一级目录"
        cd ..
    else
        echo "目录 $dir 不存在，跳过"
    fi
done

echo "所有目录的 repo sync 完成"
~~~



~~~shell
./convert.sh rk3568_linux_extboot ../rk3568_full/
XZ_OPT="-T0 -0" tar -cpJvf rk3568_linux_extboot_20241106.tar.xz rk3568_linux_extboot
rm -rf rk3568_linux_extboot

./convert.sh rk3568_linux_extboot ../rk3568_mini/
XZ_OPT="-T0 -0" tar -cpJvf rk3568_linux_mini_extboot_20241106.tar.xz rk3568_linux_extboot/    
rm -rf rk3568_linux_extboot

./convert.sh rk3588_linux_extboot ../rk3588_full/
XZ_OPT="-T0 -0" tar -cpJvf rk3588_linux_extboot_20241106.tar.xz rk3588_linux_extboot
rm -rf rk3588_linux_extboot

./convert.sh rk3588_linux_extboot ../rk3588_mini/
XZ_OPT="-T0 -0" tar -cpJvf rk3588_linux_mini_extboot_20241106.tar.xz rk3588_linux_extboot
rm -rf rk3588_linux_extboot

./convert.sh rk3588s_linux_extboot ../rk3588s/
XZ_OPT="-T0 -0" tar -cpJvf rk3588s_linux_extboot_20241106.tar.xz rk3588s_linux_extboot
rm -rf rk3588s_linux_extboot

~~~

