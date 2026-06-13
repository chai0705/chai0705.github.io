---
description: "寻找orangepi主题地址 !image-20240901085802755https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051030729.pngimage-20240901085802755 **选择默认主题**：设置默认"
cover: /img/cover/6.webp

title: 瑞芯微logo显示
date: 2024-09-01 17:17:03
categories:
  - 瑞芯微开发
link: 瑞芯微开发/21_瑞芯微logo显示
---

# 寻找orangepi主题地址

![image-20240901085802755](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051030729.png)image-20240901085802755

**选择默认主题**：设置默认的Plymouth主题。

```
COPYsudo update-alternatives --config default.plymouth
```

sudo update-initramfs -u

mkimage -A arm -T ramdisk -C gzip -n ‘Initrd Image’ -d /boot/initrd.img-5.10.198 /boot/initrd.img-5.10.198

```
COPYrootfstype=ext4 rootwait rw console=ttyFIQ0 console=tty1 console=ttyFIQ0 cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory swapaccount=1 systemd.unified_cgroup_hierarchy=0 quiet splash plymouth.ignore-serial-consoles earlycon=uart8250,mmio32,0xfeb50000 coherent_pool=1m irqchip.gicv3_pseudo_nmi=0
```

# 添加新的 Plymouth 主题

要添加和启用你已经在 `/usr/share/plymouth/themes/orangepi` 目录下的 Plymouth 主题，可以按照以下步骤操作：

### 1. **验证主题文件**

- 首先，确保 `orangepi` 主题目录中至少包含以下两个文件：

  - **`orangepi.plymouth`**：主题的主配置文件。
  - **`orangepi.script`** 或其他必要资源文件（如背景图片 `background.png`、动画文件等）。

- 例如，你可以检查文件是否存在：

  ```
  COPYls /usr/share/plymouth/themes/orangepi/
  ```

### 2. **更新 Plymouth 主题列表**

- 将 `orangepi.plymouth` 主题添加到系统的 Plymouth 主题列表中：

  ```
  COPYsudo update-alternatives --install /usr/share/plymouth/themes/default.plymouth default.plymouth /usr/share/plymouth/themes/orangepi/orangepi.plymouth 100
  ```

- 你可以验证是否成功添加主题，并选择它作为默认主题：

  ```
  COPYsudo update-alternatives --config default.plymouth
  ```

- 在提示中，选择 `orangepi` 主题对应的数字。

### 3. **更新 initramfs**

- 每次更改 Plymouth 主题后，都需要更新

   

  ```
  initramfs
  ```

   

  以使更改生效：

  ```
  COPYsudo update-initramfs -u
  ```

### 4. **测试主题**

- 重启系统以测试新 Plymouth 主题：

  ```
  COPYsudo reboot
  ```

### 5. **手动预览主题（可选）**

- 如果你想在不重启的情况下快速预览主题，可以运行以下命令：

  ```
  COPYsudo plymouthd
  sudo plymouth --show-splash
  sudo plymouth quit
  ```

### 6. **检查日志和调试**

- 如果主题没有正常显示，你可以检查 Plymouth 的日志或确保你的 framebuffer 设置正确。调试时，可以通过以下方式获取更多信息：

  ```
  COPYsudo journalctl -b | grep plymouth
  ```

### 7. **恢复默认主题（可选）**

- 如果需要恢复到系统的默认 Plymouth 主题，可以运行：

  ```
  COPYsudo update-alternatives --auto default.plymouth
  sudo update-initramfs -u
  sudo reboot
  ```

通过以上步骤，你应该可以成功将 `orangepi` 主题添加并设置为系统启动时显示的 Plymouth 主题。