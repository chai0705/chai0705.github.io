---
title: 设备树overlay
date: 2024-08-30 06:50:19
categories:
  - Linux系统
link: 07_小技巧/16_设备树overlay
---

好的，以下是您的学习计划开始的步骤和相关说明。我们将从设备树的基础概念开始，然后逐步深入学习设备树叠加的语法和实际应用。

### 1. 了解设备树（Device Tree）的基础知识

#### 1.1 什么是设备树

设备树是一种描述硬件配置的数据结构，通常在嵌入式系统中用于告诉操作系统（例如 Linux 内核）如何配置硬件。设备树以树形结构组织，包含节点和属性，用于描述各种硬件设备及其参数。

- **节点（Node）**：表示一个硬件设备或资源。
- **属性（Property）**：定义设备的具体参数，如地址、尺寸、中断等。

#### 1.2 设备树的作用

设备树用于在不依赖固件（如 BIOS）的情况下，让操作系统了解设备的硬件配置。这在嵌入式系统中非常重要，因为这些系统通常没有标准化的硬件配置。

#### 1.3 设备树的文件类型

- **`\*.dts` 文件**：设备树源文件，包含完整的设备树描述。
- **`\*.dtsi` 文件**：设备树包含文件，通常用于复用一些通用配置。
- **`\*.dtb` 文件**：设备树二进制文件，由 `*.dts` 文件编译而成，供操作系统使用。

#### 1.4 设备树的基本语法

设备树源文件使用类 C 的语法。以下是一个简单的设备树示例：

```
COPY/dts-v1/;

/ {
    model = "Example Board";
    compatible = "example,board";

    cpus {
        #address-cells = <1>;
        #size-cells = <0>;

        cpu@0 {
            device_type = "cpu";
            compatible = "arm,cortex-a7";
            reg = <0>;
        };
    };

    memory {
        device_type = "memory";
        reg = <0x80000000 0x4000000>;
    };

    soc {
        #address-cells = <1>;
        #size-cells = <1>;

        gpio@3f200000 {
            compatible = "brcm,bcm2835-gpio";
            reg = <0x3f200000 0x100>;
        };
    };
};
```

### 2. 理解设备树的结构和节点属性

#### 2.1 设备树节点

每个节点表示系统中的一个硬件设备或资源，节点以 `{}` 包围，包含其属性。节点名称可以包含 `@` 符号后跟地址，例如 `cpu@0`。

#### 2.2 设备树属性

属性是键值对，用于描述节点的特性。键是属性名，值可以是字符串、整数、字节数组等。属性使用 `=` 号连接，并以 `;` 结束。

#### 2.3 常见设备树属性

- **`compatible`**：定义设备与哪些驱动程序兼容。
- **`reg`**：定义设备的物理地址和大小。
- **`interrupts`**：定义设备使用的中断号。
- **`clocks`**：定义设备所依赖的时钟资源。

### 3. 学习设备树编译工具（DTC）

#### 3.1 安装设备树编译器（DTC）

如果您还没有安装设备树编译器，请使用以下命令安装：

```
COPYsudo apt-get install device-tree-compiler
```

#### 3.2 编译设备树源文件

使用 `dtc` 命令可以将 `*.dts` 文件编译为 `*.dtb` 文件：

```
COPYdtc -I dts -O dtb -o example.dtb example.dts
```

- **`-I dts`**：指定输入文件格式为 `dts`。
- **`-O dtb`**：指定输出文件格式为 `dtb`。
- **`-o example.dtb`**：指定输出文件名。

### 4. 学习设备树叠加（Overlay）的语法

#### 4.1 设备树叠加文件的结构

设备树叠加文件是用于修改或扩展现有设备树的 `dts` 文件，通常用于动态配置硬件。叠加文件使用 `/plugin/` 关键字和 `fragment` 节点来定义修改。

#### 4.2 示例设备树叠加文件

以下是一个简单的设备树叠加文件示例：

```
COPY/dts-v1/;
/plugin/;

/ {
    fragment@0 {
        target-path = "/soc/gpio@3f200000";
        __overlay__ {
            status = "okay";
            pinctrl-names = "default";
            pinctrl-0 = <&pinctrl_gpios>;
        };
    };

    fragment@1 {
        target = <&i2c1>;
        __overlay__ {
            status = "okay";
            clock-frequency = <400000>;
        };
    };
};
```

### 5. 实战练习

#### 5.1 编写和编译设备树叠加文件

编写一个设备树叠加文件，然后使用 `dtc` 编译它为 `.dtbo` 文件：

```
COPYdtc -I dts -O dtb -o example.dtbo example-overlay.dts
```

#### 5.2 加载设备树叠加文件

使用 `U-Boot` 或操作系统工具（如 `configfs`）加载设备树叠加文件，并观察效果。

### 6. 总结和扩展学习

在完成以上步骤后，您可以通过实践更多复杂的设备树叠加来进一步巩固所学内容。

------

通过这个学习计划，您将逐步掌握设备树和设备树叠加的基本语法和使用方法。如果您有任何问题，随时可以提问！

## 迅为设备树拆分

好的，以下是为每个屏幕类型拆分后的单独设备树文件的示例。每个文件只包含一个屏幕的定义和相关配置。

### 1. MIPI0 (LCD_TYPE_MIPI0)

```
COPY// File: lcd_mipi0.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&route_dsi0 {
    status = "okay";
    connect = <&vp2_out_dsi0>;
};

&dsi0_in_vp2 {
    status = "okay";
};

&mipi_dcphy0 {
    status = "okay";
};

&dsi0 {
    status = "okay";
    dsi0_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        power-supply = <&vcc3v3_lcd_n>;
        reg = <0>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <120>;
        size,height = <170>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings0: display-timings {
            native-mode = <&dsi0_timing0>;
            dsi0_timing0: timing0 {
                clock-frequency = <60000000>;
                hactive = <800>;
                vactive = <1280>;
                hfront-porch = <80>;
                hsync-len = <20>;
                hback-porch = <80>;
                vfront-porch = <20>;
                vsync-len = <4>;
                vback-porch = <12>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi: endpoint {
                    remote-endpoint = <&dsi_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi>;
            };
        };
    };
};

&i2c2 {
    status = "okay";
    pinctrl-0 = <&i2c2m4_xfer>;
    ft5x06@38 {
        status = "okay";
        compatible = "edt,edt-ft5406";
        reg = <0x38>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touchscreen-size-x = <800>;
        touchscreen-size-y = <1280>;
    };
};
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

/ {
    fragment@0 {
        target = <&route_dsi0>;

        __overlay__ {
            status = "okay";
            connect = <&vp2_out_dsi0>;
        };
    };

    fragment@1 {
        target = <&dsi0_in_vp2>;

        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&mipi_dcphy0>;

        __overlay__ {
            status = "okay";
        };
    };

    fragment@3 {
        target = <&dsi0>;

        __overlay__ {
            status = "okay";

            dsi0_panel: panel@0 {
                status = "okay";
                compatible = "simple-panel-dsi";
                power-supply = <&vcc3v3_lcd_n>;
                reg = <0>;
                backlight = <&backlight>;
                reset-delay-ms = <10>;
                enable-delay-ms = <35>;
                prepare-delay-ms = <6>;
                unprepare-delay-ms = <0>;
                disable-delay-ms = <20>;
                dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
                dsi,format = <MIPI_DSI_FMT_RGB888>;
                dsi,lanes  = <4>;
                dsi,channel = <0>;
                size,width = <120>;
                size,height = <170>;

panel-init-sequence = [
                        29 00 03 E0 AB BA
                        29 00 03 E1 BA AB
                        15 00 02 B0 00
                        29 00 05 B1 10 01 47 FF
                        29 00 07 B2 0C 0E 04 14 14 14
                        29 00 04 B3 56 D3 00
                        29 00 04 B4 22 30 04
                        15 00 02 B5 00
                        29 00 08 B6 B0 00 00 10 00 10 00
                        29 00 09 B7 0E 00 FF 08 08 FF FF 00
                        29 00 08 B8 05 12 29 49 48 00 00
                        29 00 27 B9 4D 42 38 31 33 27 2F 1B 36 35 35 53 41 49 3D 3D 33 29 26 4C 42 39 31 33 27 2F 1B 36 35 35 53 41 49 3D 3D 33 29 26
                        29 00 09 BA 00 00 00 44 24 00 00 00
                        29 00 04 BB 76 00 00
                        29 00 03 BC 00 00
                        29 00 06 BD FF 00 00 00 00
                        15 00 02 BE 00
                        29 00 11 C0 98 76 12 34 33 33 44 44 06 04 8A 04 0F 00 00 00
                        29 00 0B C1 53 94 02 85 06 04 8A 04 54 00
                        29 00 0D C2 37 09 08 89 08 10 22 21 44 BB 18 00
                        29 00 17 C3 9C 1D 1E 1F 10 12 0C 0E 05 24 24 24 24 24 24 07 24 24 24 24 24 24
                        29 00 17 C4 1C 1D 1E 1F 11 13 0D 0F 04 24 24 24 24 24 24 06 24 24 24 24 24 24
                        29 00 04 C5 E8 85 76
                        29 00 03 C6 20 20
                        29 00 17 C7 41 01 0D 11 09 15 19 4F 10 D7 CF 19 1B 1D 03 02 25 30 00 03 FF 00
                        29 00 07 C8 61 00 31 42 54 16
                        29 00 06 C9 A1 22 FF Cd 23
                        29 00 03 CA 4B 43
                        29 00 05 CC 2E 02 04 08
                        29 00 09 CD 0E 64 64 20 1E 6B 06 83
                        29 00 04 D0 27 10 80
                        29 00 05 D1 00 0D FF 0F
                        29 00 05 D2 E3 2B 38 00
                        29 00 0C D4 00 01 00 0E 04 44 08 10 00 07 00
                        15 00 02 D5 00
                        29 00 03 D6 00 00
                        29 00 05 D7 00 00 00 00
                        29 00 04 E4 08 55 03
                        29 00 09 E6 00 01 FF FF FF FF FF FF
                        29 00 04 E7 00 00 00
                        29 00 08 E8 D5 FF FF FF 00 00 00
                        15 00 02 E9 FF
                        29 00 06 F0 12 03 20 00 FF
                        29 00 1B F1 A6 C8 EA E6 E4 CC E4 BE F0 B2 AA C7 FF 66 98 E3 87 C8 99 C8 8C BE 96 91 8F FF
                        15 00 02 F3 03
                        29 00 1B F4 FF FE FC FA F8 F4 F0 E8 E0 D0 C0 A0 80 7F 5F 3F 2F 1F 17 0F 0B 07 05 03 01 00
                        29 00 1B F5 FF FE FC FA F8 F4 F0 E8 E0 D0 C0 A0 80 7F 5F 3F 2F 1F 17 0F 0B 07 05 03 01 00
                        29 00 1B F6 FF FE FC FA F8 F4 F0 E8 E0 D0 C0 A0 80 7F 5F 3F 2F 1F 17 0F 0B 07 05 03 01 00
                        29 00 08 F7 00 00 00 00 00 00 00
                        29 00 08 F8 00 00 00 00 00 00 00
                        29 00 08 F9 00 00 00 00 00 00 00
                        29 00 1A FA 00 84 12 21 48 48 21 12 84 69 69 5A A5 96 96 A5 5A B7 DE ED 7B 7B ED DE B7
                        29 00 18 FB 00 12 0F FF FF FF 00 38 40 08 70 0B 40 19 50 21 C0 27 60 2D 00 00 0F
                        29 00 03 E3 20 21
                        05 C8 01 11
                        05 14 01 29
                ];

                panel-exit-sequence = [
                        05 00 01 28
                        05 78 01 10
                ];

                disp_timings0: display-timings {
                    native-mode = <&dsi0_timing0>;
                    dsi0_timing0: timing0 {
                        clock-frequency = <60000000>;
                        hactive = <800>;
                        vactive = <1280>;
                        hfront-porch = <80>;
                        hsync-len = <20>;
                        hback-porch = <80>;
                        vfront-porch = <20>;
                        vsync-len = <4>;
                        vback-porch = <12>;
                        hsync-active = <0>;
                        vsync-active = <0>;
                        de-active = <0>;
                        pixelclk-active = <0>;
                    };
                };

                ports {
                    #address-cells = <1>;
                    #size-cells = <0>;

                    port@0 {
                        reg = <0>;
                        panel_in_dsi: endpoint {
                            remote-endpoint = <&dsi_out_panel>;
                        };
                    };
                };
            };

            ports {
                #address-cells = <1>;
                #size-cells = <0>;

                port@1 {
                    reg = <1>;
                    dsi_out_panel: endpoint {
                        remote-endpoint = <&panel_in_dsi>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&i2c2>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c2m4_xfer>;

            ft5x06@38 {
                status = "okay";
                compatible = "edt,edt-ft5406";
                reg = <0x38>;
                touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
                interrupt-parent = <&gpio3>;
                interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
                reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
                touchscreen-size-x = <800>;
                touchscreen-size-y = <1280>;
            };
        };
    };
};
```

### 2. LVDS 10.1 1280x800 GT911 (LCD_TYPE_LVDS_10_1_1280x800_GT911)

```
COPY// File: lcd_lvds_10_1_1280x800_gt911.dts
/dts-v1/;
/include/ "base_file.dtsi"
#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&dsi0 {
    status = "okay";
    dsi0_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        reg = <0>;
        power-supply = <&vcc3v3_lcd_n>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <235>;
        size,height = <143>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings0: display-timings {
            native-mode = <&dsi0_timing0>;
            dsi0_timing0: timing0 {
                clock-frequency = <90000000>;
                hactive = <1280>;
                vactive = <800>;
                hback-porch = <320>;
                hfront-porch = <1270>;
                vback-porch = <15>;
                vfront-porch = <20>;
                hsync-len = <10>;
                vsync-len = <20>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi: endpoint {
                    remote-endpoint = <&dsi_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi>;
            };
        };
    };
};

&i2c2 {
    status = "okay";
    pinctrl-0 = <&i2c2m4_xfer>;
    gt9xx@5d {
        compatible = "goodix,gt9xx";
        reg = <0x5d>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpio = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        status = "okay";
        tp-size = <911>;
        max-x = <1280>;
        max-y = <800>;
    };
};
```

### 3. LVDS 10.1 1280x800 GT9271 (LCD_TYPE_LVDS_10_1_1280x800_GT9271)

```
COPY// File: lcd_lvds_10_1_1280x800_gt9271.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&dsi0 {
    status = "okay";
    dsi0_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        reg = <0>;
        power-supply = <&vcc3v3_lcd_n>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <235>;
        size,height = <143>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings0: display-timings {
            native-mode = <&dsi0_timing0>;
            dsi0_timing0: timing0 {
                clock-frequency = <90000000>;
                hactive = <1280>;
                vactive = <800>;
                hback-porch = <320>;
                hfront-porch = <1270>;
                vback-porch = <15>;
                vfront-porch = <20>;
                hsync-len = <10>;
                vsync-len = <20>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi: endpoint {
                    remote-endpoint = <&dsi_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1

>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi>;
            };
        };
    };
};

&i2c2 {
    status = "okay";
    pinctrl-0 = <&i2c2m4_xfer>;
    gt9xx@5d {
        compatible = "goodix,gt9271";
        reg = <0x5d>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpio = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        status = "okay";
        tp-size = <9271>;
        max-x = <1280>;
        max-y = <800>;
        touchscreen-inverted-x;
    };
};
```

### 4. LVDS 10.1 1024x600 GT911 (LCD_TYPE_LVDS_10_1_1024x600_GT911)

```
COPY// File: lcd_lvds_10_1_1024x600_gt911.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&dsi0 {
    status = "okay";
    dsi0_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        reg = <0>;
        power-supply = <&vcc3v3_lcd_n>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <235>;
        size,height = <143>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings0: display-timings {
            native-mode = <&dsi0_timing0>;
            dsi0_timing0: timing0 {
                clock-frequency = <82000000>;
                hactive = <1024>;
                vactive = <600>;
                hfront-porch = <1580>;
                hsync-len = <10>;
                hback-porch = <100>;
                vfront-porch = <10>;
                vsync-len = <10>;
                vback-porch = <25>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi: endpoint {
                    remote-endpoint = <&dsi_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi>;
            };
        };
    };
};

&i2c2 {
    status = "okay";
    pinctrl-0 = <&i2c2m4_xfer>;
    gt9xx@14 {
        compatible = "goodix,gt9xx";
        reg = <0x14>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpio = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        status = "okay";
        tp-size = <911>;
        max-x = <1024>;
        max-y = <600>;
    };
};
```

### 5. LVDS 7.0 (LCD_TYPE_LVDS_7_0)

```
COPY// File: lcd_lvds_7_0.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&dsi0 {
    status = "okay";
    dsi0_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        reg = <0>;
        power-supply = <&vcc3v3_lcd_n>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <120>;
        size,height = <170>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings0: display-timings {
            native-mode = <&dsi0_timing0>;
            dsi0_timing0: timing0 {
                clock-frequency = <90000000>;
                hactive = <800>;
                vactive = <1280>;
                hsync-len = <10>;
                hback-porch = <100>;
                hfront-porch = <1580>;
                vsync-len = <10>;
                vback-porch = <25>;
                vfront-porch = <10>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi: endpoint {
                    remote-endpoint = <&dsi_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi>;
            };
        };
    };
};

&i2c2 {
    status = "okay";
    pinctrl-0 = <&i2c2m4_xfer>;
    ft5x06@38 {
        status = "okay";
        compatible = "edt,edt-ft5406";
        reg = <0x38>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touchscreen-size-x = <800>;
        touchscreen-size-y = <1280>;
    };
};
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

/ {
    fragment@0 {
        target = <&dsi0>;

        __overlay__ {
            status = "okay";

            dsi0_panel: panel@0 {
                status = "okay";
                compatible = "simple-panel-dsi";
                reg = <0>;
                power-supply = <&vcc3v3_lcd_n>;
                backlight = <&backlight>;
                reset-delay-ms = <10>;
                enable-delay-ms = <35>;
                prepare-delay-ms = <6>;
                unprepare-delay-ms = <0>;
                disable-delay-ms = <20>;
                dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
                dsi,format = <MIPI_DSI_FMT_RGB888>;
                dsi,lanes  = <4>;
                dsi,channel = <0>;
                size,width = <120>;
                size,height = <170>;

                panel-init-sequence = [
                                       29 02 06 3C 01 09 00 07 00                      
                                        29 02 06 14 01 06 00 00 00                      
                                        29 02 06 64 01 0B 00 00 00                      
                                        29 02 06 68 01 0B 00 00 00                      
                                        29 02 06 6C 01 0B 00 00 00                      
                                        29 02 06 70 01 0B 00 00 00                      
                                        29 02 06 34 01 1F 00 00 00                      
                                        29 02 06 10 02 1F 00 00 00                      
                                        29 02 06 04 01 01 00 00 00                      
                                        29 02 06 04 02 01 00 00 00                      
                                        29 02 06 50 04 20 01 F0 03                      
                                        29 02 06 54 04 19 00 5A 00                       //5A
                                        29 02 06 58 04 20 03 24 00                      
                                        29 02 06 5C 04 0A 00 19 00                      
                                        29 02 06 60 04 00 05 0A 00                      
                                        29 02 06 64 04 01 00 00 00                      
                                        29 02 06 A0 04 06 80 44 00
                                        29 02 06 A0 04 06 80 04 00
                                        29 02 06 04 05 04 00 00 00                      
#if 1   /* three channel */
                                        29 02 06 80 04 02 03 04 05     /* three channel */
                                        29 02 06 84 04 06 07 07 0A                      
                                        29 02 06 88 04 0B 0C 0E 0F                      
                                        29 02 06 8C 04 0D 0E 0F 12                      
                                        29 02 06 90 04 16 17 13 14                      
                                        29 02 06 94 04 15 16 17 1B                      
                                        29 02 06 98 04 18 19 1A 06                      
#else   /* four channel */
                                        29 02 06 80 04 00 01 02 03     /* four channel */
                                        29 02 06 84 04 04 07 05 08
                                        29 02 06 88 04 09 0A 0E 0F
                                        29 02 06 8C 04 0B 0C 0D 10
                                        29 02 06 90 04 16 17 11 12
                                        29 02 06 94 04 13 14 15 1B
                                        29 02 06 98 04 18 19 1A 06
#endif
                                        /*
                                        29 02 06 80 04 1A 1A 1A 1A                                          
                                        29 02 06 84 04 1A 19 1A 1A                                           
                                        29 02 06 88 04 18 18 19 19                                             
                                        29 02 06 8C 04 18 18 18 18                                             
                                        29 02 06 90 04 19 19 18 12                                             
                                        29 02 06 94 04 13 14 15 19                                             
                                        29 02 06 98 04 18 19 1A 19
                                        */
                                        29 02 06 9C 04 31 04 00 00
                ];

                panel-exit-sequence = [
                        05 05 01 28
                        05 78 01 10
                ];

                disp_timings0: display-timings {
                    native-mode = <&dsi0_timing0>;
                    dsi0_timing0: timing0 {
                        clock-frequency = <90000000>;
                        hactive = <800>;
                        vactive = <1280>;
                        hsync-len = <10>;
                        hback-porch = <100>;
                        hfront-porch = <1580>;
                        vsync-len = <10>;
                        vback-porch = <25>;
                        vfront-porch = <10>;
                        hsync-active = <0>;
                        vsync-active = <0>;
                        de-active = <0>;
                        pixelclk-active = <0>;
                    };
                };

                ports {
                    #address-cells = <1>;
                    #size-cells = <0>;

                    port@0 {
                        reg = <0>;
                        panel_in_dsi: endpoint {
                            remote-endpoint = <&dsi_out_panel>;
                        };
                    };
                };
            };

            ports {
                #address-cells = <1>;
                #size-cells = <0>;

                port@1 {
                    reg = <1>;
                    dsi_out_panel: endpoint {
                        remote-endpoint = <&panel_in_dsi>;
                    };
                };
            };
        };
    };

    fragment@1 {
        target = <&i2c2>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c2m4_xfer>;

            ft5x06@38 {
                status = "okay";
                compatible = "edt,edt-ft5406";
                reg = <0x38>;
                touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
                interrupt-parent = <&gpio3>;
                interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
                reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
                touchscreen-size-x = <800>;
                touchscreen-size-y = <1280>;
            };
        };
    };
};
```

### 6. HDMI1 (LCD_TYPE_HDMI1)

```
COPY// File: lcd_hdmi1.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&hdptxphy_hdmi1 {
    status = "okay";
};

&hdmi1 {
    enable-gpios = <&gpio4 RK_PA2 GPIO_ACTIVE_HIGH>;
    status = "okay";
};

&hdmi1_in_vp1 {
    status = "okay";
};

&hdmi1_sound {
    status = "okay";
};

&route_hdmi1 {
    status = "okay";
};
```

### 7. HDMI0 (LCD_TYPE_HDMI0)

```
COPY// File: lcd_hdmi0.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&hdptxphy_hdmi0 {
    status = "okay";
};

&hdmi0 {
    enable-gpios = <&gpio4 RK_PB1 GPIO_ACTIVE_HIGH>;
    status = "okay";
};

&hdmi0_in_vp0 {
    status = "okay";
};

&hdmi0_sound {
    status = "okay";
};

&route_hdmi0 {
    status = "okay";
};
```

### 8. Type-C DP (LCD_TYPE_TYPEC_DP)

```
COPY// File: lcd_typec_dp.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&dp0 {
    status = "okay";
};

&dp0_in_vp2 {
    status = "okay";
};
```

### 9. MIPI1 (LCD_TYPE_MIPI1)

```
COPY// File: lcd_mipi1.dts
/dts-v1/;
/include/ "base_file.dtsi"

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

&route_dsi1 {
    status = "okay";
    connect = <&vp3_out_dsi1>;
};

&dsi1_in_vp3 {
    status = "okay";
};

&mipi_dcphy1 {
    status = "

okay";
};

&dsi1 {
    status = "okay";
    dsi1_panel: panel@0 {
        status = "okay";
        compatible = "simple-panel-dsi";
        reg = <0>;
        power-supply = <&vcc3v3_lcd_n>;
        backlight = <&backlight>;
        reset-delay-ms = <10>;
        enable-delay-ms = <35>;
        prepare-delay-ms = <6>;
        unprepare-delay-ms = <0>;
        disable-delay-ms = <20>;
        dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
        dsi,format = <MIPI_DSI_FMT_RGB888>;
        dsi,lanes  = <4>;
        dsi,channel = <0>;
        size,width = <120>;
        size,height = <170>;
        panel-init-sequence = [...];  // 保持现有的初始化序列
        panel-exit-sequence = [...];  // 保持现有的退出序列

        disp_timings1: display-timings {
            native-mode = <&dsi1_timing0>;
            dsi1_timing0: timing0 {
                clock-frequency = <71900000>;
                hactive = <800>;
                vactive = <1280>;
                hfront-porch = <20>;
                hsync-len = <20>;
                hback-porch = <20>;
                vfront-porch = <10>;
                vsync-len = <4>;
                vback-porch = <4>;
                hsync-active = <0>;
                vsync-active = <0>;
                de-active = <0>;
                pixelclk-active = <0>;
            };
        };

        ports {
            #address-cells = <1>;
            #size-cells = <0>;

            port@0 {
                reg = <0>;
                panel_in_dsi1: endpoint {
                    remote-endpoint = <&dsi1_out_panel>;
                };
            };
        };
    };

    ports {
        #address-cells = <1>;
        #size-cells = <0>;

        port@1 {
            reg = <1>;
            dsi1_out_panel: endpoint {
                remote-endpoint = <&panel_in_dsi1>;
            };
        };
    };
};

&i2c3 {
    status = "okay";
    pinctrl-0 = <&i2c3m0_xfer>;
    ft5x06@38 {
        status = "okay";
        compatible = "edt,edt-ft5406";
        reg = <0x38>;
        touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
        interrupt-parent = <&gpio3>;
        interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
        reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
        touchscreen-size-x = <800>;
        touchscreen-size-y = <1280>;
    };
};
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/pinctrl/rockchip.h>
#include <dt-bindings/display/drm_mipi_dsi.h>
#include <dt-bindings/interrupt-controller/irq.h>

/ {
    fragment@0 {
        target = <&route_dsi1>;

        __overlay__ {
            status = "okay";
            connect = <&vp3_out_dsi1>;
        };
    };

    fragment@1 {
        target = <&dsi1_in_vp3>;

        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&mipi_dcphy1>;

        __overlay__ {
            status = "okay";
        };
    };

    fragment@3 {
        target = <&dsi1>;

        __overlay__ {
            status = "okay";

            dsi1_panel: panel@0 {
                status = "okay";
                compatible = "simple-panel-dsi";
                reg = <0>;
                power-supply = <&vcc3v3_lcd_n>;
                backlight = <&backlight>;
                reset-delay-ms = <10>;
                enable-delay-ms = <35>;
                prepare-delay-ms = <6>;
                unprepare-delay-ms = <0>;
                disable-delay-ms = <20>;
                dsi,flags = <(MIPI_DSI_MODE_VIDEO | MIPI_DSI_MODE_VIDEO_BURST | MIPI_DSI_MODE_LPM | MIPI_DSI_MODE_EOT_PACKET)>;
                dsi,format = <MIPI_DSI_FMT_RGB888>;
                dsi,lanes  = <4>;
                dsi,channel = <0>;
                size,width = <120>;
                size,height = <170>;

                panel-init-sequence = [
                    // 保持现有的初始化序列
                ];

                panel-exit-sequence = [
                    // 保持现有的退出序列
                ];

                disp_timings1: display-timings {
                    native-mode = <&dsi1_timing0>;
                    dsi1_timing0: timing0 {
                        clock-frequency = <71900000>;
                        hactive = <800>;
                        vactive = <1280>;
                        hfront-porch = <20>;
                        hsync-len = <20>;
                        hback-porch = <20>;
                        vfront-porch = <10>;
                        vsync-len = <4>;
                        vback-porch = <4>;
                        hsync-active = <0>;
                        vsync-active = <0>;
                        de-active = <0>;
                        pixelclk-active = <0>;
                    };
                };

                ports {
                    #address-cells = <1>;
                    #size-cells = <0>;

                    port@0 {
                        reg = <0>;
                        panel_in_dsi1: endpoint {
                            remote-endpoint = <&dsi1_out_panel>;
                        };
                    };
                };
            };

            ports {
                #address-cells = <1>;
                #size-cells = <0>;

                port@1 {
                    reg = <1>;
                    dsi1_out_panel: endpoint {
                        remote-endpoint = <&panel_in_dsi1>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&i2c3>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c3m0_xfer>;

            ft5x06@38 {
                status = "okay";
                compatible = "edt,edt-ft5406";
                reg = <0x38>;
                touch-gpio = <&gpio3 RK_PC0 IRQ_TYPE_EDGE_RISING>;
                interrupt-parent = <&gpio3>;
                interrupts = <RK_PC0 IRQ_TYPE_LEVEL_LOW>;
                reset-gpios = <&gpio3 RK_PC1 GPIO_ACTIVE_LOW>;
                touchscreen-size-x = <800>;
                touchscreen-size-y = <1280>;
            };
        };
    };
};
```

### 基础文件 base_file.dtsi

```
COPY// File: base_file.dtsi
/dts-v1/;

/ {
    backlight: backlight {
        compatible = "pwm-backlight";
        brightness-levels = <...>;
        default-brightness-level = <200>;
    };
};

&backlight {
    pwms = <&pwm1 0 25000 0>;
    status = "okay";
};

&pwm1 {
    status = "okay";
};
```

以上是所有屏幕类型的单独设备树文件的完整拆分。每个设备树文件只包含一个屏幕的定义和相关配置，其他部分从基础文件 `base_file.dtsi` 中引入。

根据您的请求，我将四个摄像头配置分解为四个独立的设备树，每个摄像头独立成一个设备树overlay文件。以下是分开的设备树overlay文件：

### 1. `camera_j1_overlay.dts`

```
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/clock/rockchip,rk3588-cru.h>
#include <dt-bindings/pinctrl/rockchip.h>

/ {
    fragment@0 {
        target = <&csi2_dphy3>;

        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipidphy3_in_ucam0: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&ov5695_out_4>;
                        data-lanes = <1 2>;
                    };
                    mipidphy3_in_ucam0_ov13850: endpoint@2 {
                        reg = <2>;
                        remote-endpoint = <&ov13850_out_4>;
                        data-lanes = <1 2 3 4>;
                    };
                };

                port@1 {
                    reg = <1>;

                    csidphy3_out: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&mipi4_csi2_input>;
                    };
                };
            };
        };
    };

    fragment@1 {
        target = <&csi2_dphy1_hw>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&i2c4>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c4m1_xfer>;

            ov5695_4: ov5695@36 {
                status = "okay";
                compatible = "ovti,ov5695";
                reg = <0x36>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M4>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera4_clk>;
                reset-gpios = <&gpio1 RK_PD3 GPIO_ACTIVE_LOW>;
                pwdn-gpios = <&gpio1 RK_PB0 GPIO_ACTIVE_HIGH>;
                rockchip,camera-module-index = <0>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "default";
                rockchip,camera-module-lens-name = "default";

                port {
                    ov5695_out_4: endpoint {
                        remote-endpoint = <&mipidphy3_in_ucam0>;
                        data-lanes = <1 2>;
                    };
                };
            };

            ov13850_4: ov13850@10 {
                status = "okay";
                compatible = "otvi,ov13850";
                reg = <0x10>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M4>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera4_clk>;
                reset-gpios = <&gpio1 RK_PD3 GPIO_ACTIVE_HIGH>;
                pwdn-gpios = <&gpio1 RK_PB0 GPIO_ACTIVE_HIGH>;
                rockchip,camera-module-index = <3>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "CMK-CT0116";
                rockchip,camera-module-lens-name = "Largan-50013A1";

                port {
                    ov13850_out_4: endpoint {
                        remote-endpoint = <&mipidphy3_in_ucam0_ov13850>;
                        data-lanes = <1 2 3 4>;
                    };
                };
            };
        };
    };

    fragment@3 {
        target = <&mipi4_csi2>;
        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi4_csi2_input: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&csidphy3_out>;
                    };
                };

                port@1 {
                    reg = <1>;

                    mipi4_csi2_output: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&cif_mipi4_in0>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&rkcif>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@5 {
        target = <&rkcif_mipi_lvds4>;
        __overlay__ {
            status = "okay";

            port {
                cif_mipi4_in0: endpoint {
                    remote-endpoint = <&mipi4_csi2_output>;
                };
            };
        };
    };

    fragment@6 {
        target = <&rkcif_mipi_lvds4_sditf>;
        __overlay__ {
            status = "okay";

            port {
                mipi_lvds4_sditf: endpoint {
                    remote-endpoint = <&isp0_vir0>;
                };
            };
        };
    };

    fragment@7 {
        target = <&rkcif_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@8 {
        target = <&rkisp0>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@9 {
        target = <&isp0_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@10 {
        target = <&rkisp0_vir0>;
        __overlay__ {
            status = "okay";

            port {
                isp0_vir0: endpoint@0 {
                    reg = <0>;
                    remote-endpoint = <&mipi_lvds4_sditf>;
                };
            };
        };
    };
};
```

### 2. `camera_j2_overlay.dts`

```
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/clock/rockchip,rk3588-cru.h>
#include <dt-bindings/pinctrl/rockchip.h>

/ {
    fragment@0 {
        target = <&csi2_dcphy1>;

        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi_in_ucam1: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&ov5695_out_2>;
                        data-lanes = <1 2>;
                    };
                    mipi_in_ucam1_ov13850: endpoint@2 {
                        reg = <2>;
                        remote-endpoint = <&ov13850_out_2>;
                        data-lanes = <1 2 3 4>;
                    };
                };

                port@1 {
                    reg = <1>;

                    csidcphy1_out: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&mipi1_csi2_input>;
                    };
                };
            };
        };
    };

    fragment@1 {
        target = <&mipi_dcphy1>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&i2c7>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c7m0_xfer>;

            ov5695_2: ov5695@36 {
                status = "okay";
                compatible = "ovti,ov5695";
                reg = <0x36>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M2>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera2_clk>;
                reset-gpios = <&gpio1 RK_PA3 GPIO_ACTIVE_LOW>;
                pwdn-gpios = <&gpio1 RK_PA4 GPIO_ACTIVE_LOW>;
                rockchip,camera-module-index = <1>;
                rockchip,camera-module-facing = "front";
                rockchip,camera-module-name = "default";
                rockchip,camera-module-lens-name = "default";

                port {
                    ov5695_out_2: endpoint {
                        remote-endpoint = <&mipi_in_ucam1>;
                        data-lanes = <1 2>;
                    };
                };
            };

            ov13850_2: ov13850@10 {
                status = "okay";
                compatible = "otvi,ov13850";
                reg = <0x10>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M2>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera2_clk>;
                reset-gpios = <&gpio1 RK_PA3 GPIO_ACTIVE_HIGH>;
                pwdn-gpios = <&gpio1 RK_PA4 GPIO_ACTIVE_HIGH>;
                rockchip,camera-module-index = <1>;
                rockchip,camera-module-facing =

 "front";
                rockchip,camera-module-name = "CMK-CT0116";
                rockchip,camera-module-lens-name = "Largan-50013A1";

                port {
                    ov13850_out_2: endpoint {
                        remote-endpoint = <&mipi_in_ucam1_ov13850>;
                        data-lanes = <1 2 3 4>;
                    };
                };
            };
        };
    };

    fragment@3 {
        target = <&mipi1_csi2>;
        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi1_csi2_input: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&csidcphy1_out>;
                    };
                };

                port@1 {
                    reg = <1>;

                    mipi1_csi2_output: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&cif_mipi_in1>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&rkcif>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@5 {
        target = <&rkcif_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@6 {
        target = <&rkcif_mipi_lvds1>;
        __overlay__ {
            status = "okay";

            port {
                cif_mipi_in1: endpoint {
                    remote-endpoint = <&mipi1_csi2_output>;
                };
            };
        };
    };

    fragment@7 {
        target = <&rkcif_mipi_lvds1_sditf>;
        __overlay__ {
            status = "okay";

            port {
                mipi_lvds1_sditf: endpoint {
                    remote-endpoint = <&isp1_vir0>;
                };
            };
        };
    };

    fragment@8 {
        target = <&rkisp1>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@9 {
        target = <&isp1_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@10 {
        target = <&rkisp1_vir0>;
        __overlay__ {
            status = "okay";

            port {
                isp1_vir0: endpoint@0 {
                    reg = <0>;
                    remote-endpoint = <&mipi_lvds1_sditf>;
                };
            };
        };
    };
};
```

### 3. `camera_j3_overlay.dts`

```
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/clock/rockchip,rk3588-cru.h>
#include <dt-bindings/pinctrl/rockchip.h>

/ {
    fragment@0 {
        target = <&csi2_dphy0>;

        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipidphy0_in_ucam0: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&ov5695_out_3>;
                        data-lanes = <1 2>;
                    };
                    mipidphy0_in_ucam0_ov13850: endpoint@2 {
                        reg = <2>;
                        remote-endpoint = <&ov13850_out_3>;
                        data-lanes = <1 2 3 4>;
                    };
                };

                port@1 {
                    reg = <1>;

                    csidphy0_out: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&mipi2_csi2_input>;
                    };
                };
            };
        };
    };

    fragment@1 {
        target = <&csi2_dphy0_hw>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&i2c3>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c3m0_xfer>;

            ov5695_3: ov5695@36 {
                status = "okay";
                compatible = "ovti,ov5695";
                reg = <0x36>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M3>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera3_clk>;
                reset-gpios = <&gpio1 RK_PD3 GPIO_ACTIVE_LOW>;
                pwdn-gpios = <&gpio1 RK_PB0 GPIO_ACTIVE_LOW>;
                rockchip,camera-module-index = <2>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "default";
                rockchip,camera-module-lens-name = "default";

                port {
                    ov5695_out_3: endpoint {
                        remote-endpoint = <&mipidphy0_in_ucam0>;
                        data-lanes = <1 2>;
                    };
                };
            };

            ov13850_3: ov13850@10 {
                status = "okay";
                compatible = "otvi,ov13850";
                reg = <0x10>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M3>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera3_clk>;
                reset-gpios = <&gpio1 RK_PD3 GPIO_ACTIVE_HIGH>;
                pwdn-gpios = <&gpio1 RK_PB0 GPIO_ACTIVE_HIGH>;
                rockchip,camera-module-index = <2>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "CMK-CT0116";
                rockchip,camera-module-lens-name = "Largan-50013A1";

                port {
                    ov13850_out_3: endpoint {
                        remote-endpoint = <&mipidphy0_in_ucam0_ov13850>;
                        data-lanes = <1 2 3 4>;
                    };
                };
            };
        };
    };

    fragment@3 {
        target = <&mipi2_csi2>;
        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi2_csi2_input: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&csidphy0_out>;
                    };
                };

                port@1 {
                    reg = <1>;

                    mipi2_csi2_output: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&cif_mipi2_in0>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&rkcif>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@5 {
        target = <&rkcif_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@6 {
        target = <&rkcif_mipi_lvds2>;
        __overlay__ {
            status = "okay";

            port {
                cif_mipi2_in0: endpoint {
                    remote-endpoint = <&mipi2_csi2_output>;
                };
            };
        };
    };

    fragment@7 {
        target = <&rkcif_mipi_lvds2_sditf>;
        __overlay__ {
            status = "okay";

            port {
                mipi_lvds2_sditf: endpoint {
                    remote-endpoint = <&isp0_vir0>;
                };
            };
        };
    };

    fragment@8 {
        target = <&rkisp0>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@9 {
        target = <&isp0_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@10 {
        target = <&rkisp0_vir0>;
        __overlay__ {
            status = "okay";

            port {
                isp0_vir0: endpoint@0 {
                    reg = <0>;
                    remote-endpoint = <&mipi_lvds2_sditf>;
                };
            };
        };
    };
};
```

### 4. `camera_j4_overlay.dts`

```
COPY/dts-v1/;
/plugin/;

#include <dt-bindings/gpio/gpio.h>
#include <dt-bindings/clock/rockchip,rk3588-cru.h>
#include <dt-bindings/pinctrl/rockchip.h>

/ {
    fragment@0 {
        target = <&csi2_dcphy0>;

        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi_in_ucam0: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&ov5695_out_1>;
                        data-lanes = <1 2>;
                    };
                    mipi_in_ucam0_ov13850: endpoint@2 {
                        reg = <2>;
                        remote-endpoint = <&ov13850_out_1>;
                        data-lanes = <1 2 3 4>;
                    };
                };



                port@1 {
                    reg = <1>;

                    csidcphy0_out: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&mipi0_csi2_input>;
                    };
                };
            };
        };
    };

    fragment@1 {
        target = <&mipi_dcphy0>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@2 {
        target = <&i2c2>;

        __overlay__ {
            status = "okay";
            pinctrl-0 = <&i2c2m4_xfer>;

            ov5695_1: ov5695@36 {
                status = "okay";
                compatible = "ovti,ov5695";
                reg = <0x36>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M1>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera1_clk>;
                reset-gpios = <&gpio1 RK_PA3 GPIO_ACTIVE_LOW>;
                pwdn-gpios = <&gpio1 RK_PA2 GPIO_ACTIVE_LOW>;
                rockchip,camera-module-index = <0>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "default";
                rockchip,camera-module-lens-name = "default";

                port {
                    ov5695_out_1: endpoint {
                        remote-endpoint = <&mipi_in_ucam0>;
                        data-lanes = <1 2>;
                    };
                };
            };

            ov13850_1: ov13850@10 {
                status = "okay";
                compatible = "otvi,ov13850";
                reg = <0x10>;
                clocks = <&cru CLK_MIPI_CAMARAOUT_M1>;
                clock-names = "xvclk";
                power-domains = <&power RK3588_PD_VI>;
                pinctrl-names = "default";
                pinctrl-0 = <&mipim0_camera1_clk>;
                reset-gpios = <&gpio1 RK_PA3 GPIO_ACTIVE_HIGH>;
                pwdn-gpios = <&gpio1 RK_PA2 GPIO_ACTIVE_HIGH>;
                rockchip,camera-module-index = <0>;
                rockchip,camera-module-facing = "back";
                rockchip,camera-module-name = "CMK-CT0116";
                rockchip,camera-module-lens-name = "Largan-50013A1";

                port {
                    ov13850_out_1: endpoint {
                        remote-endpoint = <&mipi_in_ucam0_ov13850>;
                        data-lanes = <1 2 3 4>;
                    };
                };
            };
        };
    };

    fragment@3 {
        target = <&mipi0_csi2>;
        __overlay__ {
            status = "okay";

            ports {
                port@0 {
                    reg = <0>;

                    mipi0_csi2_input: endpoint@1 {
                        reg = <1>;
                        remote-endpoint = <&csidcphy0_out>;
                    };
                };

                port@1 {
                    reg = <1>;

                    mipi0_csi2_output: endpoint@0 {
                        reg = <0>;
                        remote-endpoint = <&cif_mipi_in0>;
                    };
                };
            };
        };
    };

    fragment@4 {
        target = <&rkcif>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@5 {
        target = <&rkcif_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@6 {
        target = <&rkcif_mipi_lvds>;
        __overlay__ {
            status = "okay";

            port {
                cif_mipi_in0: endpoint {
                    remote-endpoint = <&mipi0_csi2_output>;
                };
            };
        };
    };

    fragment@7 {
        target = <&rkcif_mipi_lvds_sditf>;
        __overlay__ {
            status = "okay";

            port {
                mipi_lvds_sditf: endpoint {
                    remote-endpoint = <&isp0_vir0>;
                };
            };
        };
    };

    fragment@8 {
        target = <&rkisp0>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@9 {
        target = <&isp0_mmu>;
        __overlay__ {
            status = "okay";
        };
    };

    fragment@10 {
        target = <&rkisp0_vir0>;
        __overlay__ {
            status = "okay";

            port {
                isp0_vir0: endpoint@0 {
                    reg = <0>;
                    remote-endpoint = <&mipi_lvds_sditf>;
                };
            };
        };
    };
};
```

这些设备树overlay文件可以分别应用于不同的摄像头配置，确保每个摄像头模块独立配置，并能动态加载或更新。这些文件将帮助您为不同的摄像头模块设置所需的硬件资源和连接。
