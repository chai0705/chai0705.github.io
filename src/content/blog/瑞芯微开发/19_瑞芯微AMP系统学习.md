---
title: 瑞芯微AMP系统学习
date: 2024-08-29 17:17:03
categories:
  - 瑞芯微开发
link: 瑞芯微/19_瑞芯微AMP系统学习
---

> AMP之前是田田搞的，我认为这个东西很高级，反正听起来是这样的，之前对这个一直很感兴趣，但是并没有真正了解过，正好趁这个机会好好的研究看看。

------

# **Rockchip平台的AMP架构概述**。

------

## Rockchip平台的AMP架构概述

### 什么是AMP（Asymmetric Multiprocessing）架构？

在Rockchip平台上，AMP（非对称多处理）架构指的是一种包含多个不同类型处理器核的系统架构。这些核可能运行不同的操作系统或执行不同的任务，从而实现高效的资源利用和任务优化。与对称多处理（SMP）不同，AMP架构中的核并不对称，它们各自负责不同的任务，且具备不同的计算能力和功能特性。

### Rockchip平台中的AMP架构

Rockchip平台支持多种组合形式的AMP架构，包括：

- **全Baremetal系统**：基于HAL（Hardware Abstraction Layer）的独立运行部分，是一种简单的低级软件层，用于直接访问处理器特性和外设接口。
- **RTOS + Baremetal组合**：在这种组合中，RTOS（如RT-Thread）负责管理实时任务，而Baremetal部分则处理底层硬件交互。
- **Linux + Baremetal组合**：Linux系统负责复杂的应用和系统管理，Baremetal部分则处理特定的低级任务。
- **Linux + RTOS组合**：Linux系统与RTOS结合使用，前者负责高层次的任务管理，后者则处理时间敏感的任务。

### AMP架构的主要组件

1. **处理器核**
   - Rockchip平台中的处理器核可以分为高性能核和低功耗核。高性能核负责复杂的计算任务，而低功耗核则用于处理简单的、节能型任务。
2. **硬件抽象层（HAL）**
   - HAL是AMP架构中的核心组件之一，它提供对处理器的基本特性（如缓存、 中断和异常）的访问，以及对基础外设（如GPIO、UART、I2C、SPI、CAN、GMAC等）的驱动支持。
3. **操作系统层**
   - 在RTOS与Baremetal或Linux与Baremetal的组合中，不同的操作系统（RTOS、Linux、Baremetal）在各自的处理器核上运行。RTOS通常用于处理实时性要求较高的任务，而Linux系统负责资源密集型的任务。
4. **通信机制**
   - 在AMP架构下，不同核之间需要有效的通信机制以协调任务和共享资源。这可以通过共享内存、消息传递、中断等方式实现。

### AMP架构的优势

1. **性能优化**：通过将任务分配给最适合的处理器核，AMP架构能够显著提高系统的整体性能。例如，实时任务可以分配给RTOS，而复杂的计算任务可以由Linux处理。
2. **节能**：AMP架构可以根据任务需求动态调整处理器核的状态，例如让高性能核在空闲时进入低功耗模式，从而优化能耗。
3. **灵活性**：由于不同的处理器核可以运行不同的操作系统或任务，AMP架构在处理多样化的任务时具有极高的灵活性，能够满足不同应用场景的需求。

### AMP架构的应用场景

在Rockchip平台上，AMP架构被广泛应用于以下领域：

- **电力物联网**：AMP架构可以实现对电力系统数据的实时监控与处理，确保系统的稳定运行。
- **电网继电保护**：通过AMP架构中的实时操作系统来处理关键任务，确保继电保护系统的响应速度和可靠性。
- **工业自动化**：在工业控制系统中，AMP架构允许不同的处理器核处理不同的控制任务，提升系统的灵活性和稳定性。

------

这就是Rockchip平台AMP架构的概述！如果你有任何问题或需要更深入的解释，请随时告诉我。你也可以使用**/continue**来继续下一个主题的学习。🦌

我们将继续学习下一个主题：**基于HAL的Baremetal开发**。

------

## 基于HAL的Baremetal开发

### 什么是Baremetal开发？

Baremetal开发是一种直接在硬件上运行软件的开发方式，没有操作系统的介入。程序直接与硬件交互，这种方式通常用于对性能要求极高或者资源极度有限的系统。Baremetal开发的一个重要特点是其高度的灵活性和高效性，但也意味着开发者需要处理所有底层硬件的细节。

### 硬件抽象层（HAL）的作用

在Rockchip平台上，HAL（Hardware Abstraction Layer，硬件抽象层）是Baremetal开发的核心组件之一。HAL提供了一组API，用于直接访问处理器的基本功能（如缓存管理、中断处理、异常处理）以及基础外设的驱动支持（如GPIO、UART、I2C、SPI、CAN、GMAC等）。

HAL的主要作用包括：

1. **简化硬件操作**：HAL为开发者提供了对硬件的抽象接口，简化了直接访问硬件的复杂性，使得开发者无需处理底层硬件的细节。
2. **提高代码的可移植性**：通过使用HAL，开发者可以编写与特定硬件无关的代码，从而提高代码的可移植性。当硬件平台发生变化时，只需修改HAL层的实现，而应用层代码几乎无需改动。
3. **统一的硬件接口**：HAL为不同的外设提供了统一的接口，使得开发者可以通过一致的方式控制不同类型的硬件设备。

### Baremetal开发的关键要点

1. **初始化处理器**
   - 在Baremetal环境中，首先需要初始化处理器的基本功能，包括设置时钟频率、配置缓存、初始化堆栈指针和异常向量表等。
2. **中断管理**
   - 中断处理是Baremetal开发中的一个重要部分。需要设置中断向量表，并编写中断服务程序（ISR）来响应和处理各种中断请求。
3. **外设控制**
   - 使用HAL API控制和管理外设，例如GPIO用于控制输入输出引脚，UART用于串口通信，I2C和SPI用于与其他设备通信，CAN用于车载网络通信，GMAC用于以太网通信等。
4. **内存管理**
   - 在Baremetal开发中，需要手动管理内存。这包括静态内存分配（如全局变量）和动态内存分配（如果需要的话）。
5. **调试与测试**
   - 在没有操作系统的情况下，调试Baremetal代码可能会更加困难。通常需要借助硬件调试工具（如JTAG）来调试代码，并通过串口或其他通信接口输出调试信息。

### Baremetal开发的实际应用

Baremetal开发通常应用于以下场景：

- **实时性要求高的系统**：由于没有操作系统的开销，Baremetal程序可以实现更快的响应时间，适合对实时性要求极高的应用，例如工业控制系统和嵌入式实时系统。
- **资源受限的设备**：在资源非常有限的设备（如一些传感器节点或简单的物联网设备）上，Baremetal开发可以最大化地利用硬件资源。
- **特定功能模块**：在一些复杂系统中，Baremetal开发可以用于实现特定的功能模块，如在RTOS或Linux系统之外的独立任务处理。

### 开发示例：GPIO控制

以下是一个简单的Baremetal开发示例，使用HAL控制GPIO引脚：

```
COPY#include "hal_gpio.h"

int main(void) {
    // 初始化GPIO引脚
    hal_gpio_init(GPIO_PIN_0);

    // 设置GPIO引脚为输出模式
    hal_gpio_set_mode(GPIO_PIN_0, GPIO_MODE_OUTPUT);

    while (1) {
        // 设置GPIO引脚电平为高
        hal_gpio_write(GPIO_PIN_0, GPIO_PIN_SET);
        
        // 等待一段时间
        hal_delay(1000);
        
        // 设置GPIO引脚电平为低
        hal_gpio_write(GPIO_PIN_0, GPIO_PIN_RESET);
        
        // 等待一段时间
        hal_delay(1000);
    }
    
    return 0;
}
```

这个代码示例展示了如何在Baremetal环境下使用HAL控制一个GPIO引脚，实现简单的LED闪烁功能。

------

这就是基于HAL的Baremetal开发的基础知识！如果你有任何问题，或者想要进一步探讨某个具体部分，请随时告诉我。如果你准备好继续下一个主题，可以使用**/continue**命令。🦌

我们将继续学习下一个主题：**RTOS + Baremetal架构开发**。

------

## RTOS + Baremetal架构开发

### 什么是RTOS + Baremetal架构？

在RTOS（实时操作系统）和Baremetal架构的组合中，系统利用RTOS来管理和调度时间敏感的任务，同时使用Baremetal来直接控制硬件和处理低级任务。这种架构的优点是可以同时利用RTOS的实时性和Baremetal的高效性，适合需要实时响应和低级硬件控制的应用场景。

### RTOS与Baremetal的协作机制

在这种架构下，RTOS通常运行在一个或多个处理器核上，用于管理复杂的多任务环境。Baremetal代码则运行在独立的核上，直接控制特定的硬件资源或执行特定的任务。

1. **任务管理**
   - RTOS负责管理和调度多个任务，确保关键任务按时执行。它通常包含一个调度器来决定哪个任务在任何给定时间运行。
   - Baremetal代码独立于RTOS运行，通常负责特定的低级硬件操作，不参与多任务调度。
2. **硬件抽象层（HAL）**
   - 在这种架构中，HAL仍然是关键组件。它为Baremetal部分提供了访问硬件的接口，也可以被RTOS使用来简化硬件控制。
3. **通信机制**
   - RTOS和Baremetal之间的通信通常通过共享内存、中断或消息队列来实现。例如，Baremetal部分可以通过触发中断来通知RTOS某个任务已经完成，或者通过共享内存区域传递数据。

### RTOS + Baremetal架构的优点

1. **实时性与高效性结合**：RTOS提供了对时间敏感任务的有效管理，而Baremetal部分则可以高效地执行直接的硬件操作，减少延迟。
2. **灵活性**：这种架构允许开发者在同一系统中灵活使用RTOS和Baremetal，以应对不同类型的任务需求。
3. **资源优化**：通过将不同的任务分配给RTOS和Baremetal部分，可以更好地利用系统资源。例如，RTOS可以处理复杂的多任务调度，而Baremetal部分则处理简单且需要快速响应的任务。

### 实际应用中的RTOS + Baremetal架构

这种架构广泛应用于需要高实时性和高效硬件控制的领域，例如：

- **工业自动化**：在工业控制系统中，RTOS管理着系统的整体运行和任务调度，而Baremetal部分直接控制工业设备的传感器和执行器。
- **电力系统**：在电力继电保护和电网控制系统中，RTOS用于管理系统的正常运行和故障处理，而Baremetal部分则实时监控电力线路状态，确保系统的稳定性。
- **嵌入式设备**：在一些嵌入式设备中，RTOS负责设备的主控逻辑和用户界面管理，而Baremetal部分则处理与传感器和外设的低级通信。

### 开发示例：RTOS任务与Baremetal硬件控制

以下是一个简单的示例，展示如何在RTOS中管理任务，并使用Baremetal部分控制硬件：

```
COPY// RTOS任务管理部分
#include "rtos.h"
#include "hal_gpio.h"

void task_blink_led(void *pvParameters) {
    while (1) {
        hal_gpio_toggle(GPIO_PIN_0);
        rtos_delay(1000);  // 延时1秒
    }
}

int main(void) {
    rtos_init();  // 初始化RTOS

    // 创建LED闪烁任务
    rtos_create_task(task_blink_led, "Blink LED", configMINIMAL_STACK_SIZE, NULL, 1, NULL);

    rtos_start_scheduler();  // 启动RTOS调度器

    while (1) {
        // 在这里可以执行Baremetal代码
    }

    return 0;
}

// Baremetal硬件控制部分
#include "hal_gpio.h"

int baremetal_init(void) {
    hal_gpio_init(GPIO_PIN_0);  // 初始化GPIO引脚
    hal_gpio_set_mode(GPIO_PIN_0, GPIO_MODE_OUTPUT);  // 设置为输出模式

    // 可以在这里添加更多Baremetal硬件控制代码

    return 0;
}
```

在这个示例中，RTOS管理一个简单的任务来控制LED的闪烁，而Baremetal部分负责初始化硬件。RTOS与Baremetal部分相互独立运行，共同实现系统的功能。

------

这就是RTOS + Baremetal架构开发的基础知识！如果你有任何问题，或者想要进一步探讨某个具体部分，请随时告诉我。如果你准备好继续下一个主题，可以使用**/continue**命令。🦌

我们将继续学习下一个主题：**Linux + Baremetal架构开发**。

------

## Linux + Baremetal架构开发

### 什么是Linux + Baremetal架构？

在Linux + Baremetal架构中，系统中的一部分处理器核运行完整的Linux操作系统，用于处理复杂的多任务环境和资源密集型应用程序；同时，另一部分处理器核以Baremetal方式运行，直接控制特定硬件或执行时间敏感的任务。此架构在需要同时满足高级系统管理和低级硬件控制需求的场景中非常有用。

### Linux与Baremetal的协作机制

在这种架构中，Linux系统通常运行在高性能核上，管理应用程序、系统服务和外围设备。Baremetal部分则运行在低功耗核或专用核上，负责处理实时性要求较高或需要直接硬件访问的任务。

1. **任务分配**
   - **Linux核**：负责复杂任务，如文件系统管理、网络通信、多任务调度等。
   - **Baremetal核**：处理特定任务，如实时传感器数据采集、信号处理或关键任务的执行。
2. **通信机制**
   - Linux和Baremetal部分之间的通信可以通过多种机制实现，例如共享内存、消息传递、中断通知等。
   - 常见的方式是在Linux侧设置一个内核模块或用户空间程序，通过共享内存区域与Baremetal核交换数据。
3. **硬件资源管理**
   - Linux和Baremetal通常会各自管理部分硬件资源。例如，Linux管理通用外设（如存储、网络接口），而Baremetal管理特定的外设（如高速传感器接口、专用处理单元）。

### Linux + Baremetal架构的优点

1. **复杂任务和实时任务的分离**：Linux系统擅长处理复杂、非实时任务，而Baremetal部分则专注于时间敏感的任务，两者结合可以优化整体系统性能。
2. **资源优化**：这种架构允许在同一平台上高效利用硬件资源。Linux系统可以执行复杂的任务，同时Baremetal部分处理低级硬件控制，避免资源浪费。
3. **灵活性与定制化**：开发者可以根据应用需求灵活配置Linux和Baremetal的职责范围，从而满足多样化的需求。

### 实际应用中的Linux + Baremetal架构

这种架构在以下领域得到广泛应用：

- **电力系统**：在电力物联网和电网控制中，Linux系统用于管理和分析大规模数据，而Baremetal部分则实时监控电力设备状态，确保系统的快速响应。
- **汽车电子**：在汽车电子系统中，Linux用于运行复杂的娱乐和导航系统，而Baremetal部分控制实时性要求高的传感器和执行器。
- **工业控制**：在工业自动化中，Linux系统管理高层次的控制任务，如网络通信和数据处理，而Baremetal部分执行实时控制任务，如传感器数据采集和机器控制。

### 开发示例：Linux与Baremetal的通信

以下是一个简单的示例，展示如何通过共享内存实现Linux和Baremetal部分之间的通信：

#### Baremetal部分：

```
COPY#include "hal_shared_memory.h"
#include "hal_interrupt.h"

#define SHARED_MEMORY_BASE 0x80000000  // 假设的共享内存地址
volatile uint32_t *shared_memory = (uint32_t *)SHARED_MEMORY_BASE;

void baremetal_task(void) {
    // 读取共享内存中的数据
    uint32_t data = shared_memory[0];

    // 处理数据
    data = data + 1;

    // 将处理后的数据写回共享内存
    shared_memory[1] = data;

    // 触发中断通知Linux
    hal_interrupt_trigger(LINUX_INTERRUPT);
}

int main(void) {
    while (1) {
        baremetal_task();
    }
    return 0;
}
```

#### Linux部分（内核模块示例）：

```
COPY#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/io.h>
#include <linux/interrupt.h>

#define SHARED_MEMORY_BASE 0x80000000  // 与Baremetal部分共享的内存地址
volatile uint32_t *shared_memory;

static irqreturn_t baremetal_irq_handler(int irq, void *dev_id) {
    uint32_t data = shared_memory[1];
    printk(KERN_INFO "Received data from Baremetal: %u\n", data);
    return IRQ_HANDLED;
}

static int __init linux_baremetal_init(void) {
    shared_memory = ioremap(SHARED_MEMORY_BASE, sizeof(uint32_t) * 2);

    // 注册中断处理程序
    request_irq(LINUX_INTERRUPT, baremetal_irq_handler, IRQF_SHARED, "baremetal_irq", NULL);

    printk(KERN_INFO "Linux + Baremetal module initialized\n");
    return 0;
}

static void __exit linux_baremetal_exit(void) {
    free_irq(LINUX_INTERRUPT, NULL);
    iounmap(shared_memory);
    printk(KERN_INFO "Linux + Baremetal module exited\n");
}

module_init(linux_baremetal_init);
module_exit(linux_baremetal_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Developer");
MODULE_DESCRIPTION("Linux + Baremetal Communication Example");
```

在这个示例中，Baremetal部分通过共享内存将处理过的数据传递给Linux，并通过中断机制通知Linux读取数据。Linux侧通过内核模块接收中断并读取共享内存中的数据，从而实现了两个系统之间的协作。

------

这就是Linux + Baremetal架构开发的基础知识！如果你有任何问题，或者想要进一步探讨某个具体部分，请随时告诉我。如果你准备好继续下一个主题，可以使用**/continue**命令。🦌

我们将继续学习下一个主题：**Linux + RTOS架构开发**。

------

## Linux + RTOS架构开发

### 什么是Linux + RTOS架构？

在Linux + RTOS（实时操作系统）架构中，系统的部分处理器核运行完整的Linux操作系统，而其他处理器核运行RTOS。这个架构结合了Linux强大的多任务处理能力和RTOS的实时性能，适用于需要同时处理复杂应用和实时任务的场景。

### Linux与RTOS的协作机制

在这种架构中，Linux系统通常负责管理和运行复杂的应用程序，如网络通信、文件系统、用户界面等。而RTOS则负责执行需要严格时间控制的任务，如实时数据处理、紧急控制任务等。

1. **任务分配**
   - **Linux核**：负责资源密集型的任务，如处理大数据、运行复杂算法、网络通信和用户界面管理。
   - **RTOS核**：处理实时性要求高的任务，如传感器数据采集、控制系统和时间敏感的计算任务。
2. **通信机制**
   - Linux和RTOS之间的通信通常通过共享内存、消息队列或中断等机制实现。共享内存是一种常见的方式，它允许两个系统快速交换数据。
   - 中断机制可以用于Linux通知RTOS某个任务需要立即执行，或反过来通知Linux某个事件已经发生。
3. **资源管理**
   - 在这种架构中，Linux和RTOS通常管理各自独立的硬件资源。例如，Linux管理网络接口、存储设备，而RTOS管理时间敏感的I/O接口，如传感器和执行器。

### Linux + RTOS架构的优点

1. **实时性与复杂任务处理的结合**：这种架构允许同时处理复杂的多任务应用（通过Linux）和严格的实时任务（通过RTOS），提供了灵活性和强大的功能。
2. **系统稳定性**：通过将实时任务与复杂的非实时任务分离开来，可以提高系统的稳定性。即使Linux系统负载很高，RTOS仍能确保关键任务按时执行。
3. **灵活性**：开发者可以根据需求灵活地配置系统，选择将哪些任务放在Linux上运行，哪些任务放在RTOS上运行。

### 实际应用中的Linux + RTOS架构

这种架构广泛应用于以下领域：

- **汽车电子**：在汽车控制系统中，RTOS负责处理实时的车载传感器数据和控制任务，而Linux则用于运行导航、娱乐系统等复杂应用。
- **工业自动化**：在工业控制系统中，RTOS负责时间敏感的控制任务，如机械臂的实时控制，而Linux负责高层次的监控和数据处理。
- **医疗设备**：在医疗设备中，RTOS管理实时监控和控制功能，如患者生命体征的实时监测，而Linux处理数据存储、用户界面和远程通信。

### 开发示例：Linux与RTOS的通信

以下是一个简单的示例，展示如何通过共享内存实现Linux与RTOS之间的通信：

#### RTOS部分（基于RT-Thread的示例）：

```
COPY#include "rtthread.h"
#include "hal_shared_memory.h"
#include "hal_interrupt.h"

#define SHARED_MEMORY_BASE 0x80000000  // 假设的共享内存地址
volatile uint32_t *shared_memory = (uint32_t *)SHARED_MEMORY_BASE;

void rt_thread_entry(void *parameter) {
    while (1) {
        // 读取共享内存中的数据
        uint32_t data = shared_memory[0];
        
        // 处理数据
        data = data + 1;
        
        // 将处理后的数据写回共享内存
        shared_memory[1] = data;
        
        // 触发中断通知Linux
        hal_interrupt_trigger(LINUX_INTERRUPT);
        
        rt_thread_mdelay(1000);  // 延时1秒
    }
}

int main(void) {
    // 创建RTOS线程
    rt_thread_t thread = rt_thread_create("rt_thread", rt_thread_entry, RT_NULL, 1024, 10, 10);
    
    if (thread != RT_NULL) {
        rt_thread_startup(thread);
    }

    return 0;
}
```

#### Linux部分（内核模块示例）：

```
COPY#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/io.h>
#include <linux/interrupt.h>

#define SHARED_MEMORY_BASE 0x80000000  // 与RTOS部分共享的内存地址
volatile uint32_t *shared_memory;

static irqreturn_t rtos_irq_handler(int irq, void *dev_id) {
    uint32_t data = shared_memory[1];
    printk(KERN_INFO "Received data from RTOS: %u\n", data);
    return IRQ_HANDLED;
}

static int __init linux_rtos_init(void) {
    shared_memory = ioremap(SHARED_MEMORY_BASE, sizeof(uint32_t) * 2);

    // 注册中断处理程序
    request_irq(LINUX_INTERRUPT, rtos_irq_handler, IRQF_SHARED, "rtos_irq", NULL);

    printk(KERN_INFO "Linux + RTOS module initialized\n");
    return 0;
}

static void __exit linux_rtos_exit(void) {
    free_irq(LINUX_INTERRUPT, NULL);
    iounmap(shared_memory);
    printk(KERN_INFO "Linux + RTOS module exited\n");
}

module_init(linux_rtos_init);
module_exit(linux_rtos_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Developer");
MODULE_DESCRIPTION("Linux + RTOS Communication Example");
```

在这个示例中，RTOS线程通过共享内存与Linux交换数据，并通过中断机制通知Linux某个事件已完成。Linux通过内核模块接收中断并读取共享内存中的数据。

------

这就是Linux + RTOS架构开发的基础知识！如果你有任何问题，或者想要进一步探讨某个具体部分，请随时告诉我。如果你准备好继续下一个主题，可以使用**/continue**命令。🦌

我们将继续学习下一个主题：**AMP系统在电力和工业自动化中的应用**。

------

## AMP系统在电力和工业自动化中的应用

### 什么是AMP系统？

AMP（Asymmetric Multiprocessing）系统是一种利用异构处理器核的计算架构，系统中的不同核可能运行不同的操作系统或执行不同类型的任务。AMP系统通过合理分配任务给最合适的处理器核来优化整体性能和能效，尤其适合需要高实时性和多任务处理的场景。

### AMP系统在电力行业的应用

#### 1. **电力物联网**

- **数据采集与处理**：在电力物联网（IoT）中，AMP系统可用于实时采集和处理来自电力设备的传感器数据。低功耗核可能运行Baremetal或RTOS，专门处理数据采集任务，而高性能核则运行Linux，负责数据分析和通信。
- **远程监控与控制**：AMP系统支持在高性能核上运行复杂的监控软件，同时在实时核上执行关键控制任务。例如，RTOS核可以直接控制电网设备，而Linux核则管理监控和通信。

#### 2. **电网继电保护**

- **实时故障检测**：AMP系统可以在RTOS核上实现快速的故障检测和继电保护响应，确保电力系统在出现故障时能够迅速隔离故障区，防止故障扩散。
- **安全与可靠性**：通过AMP架构的分离处理机制，系统能够在Linux核上执行复杂的数据分析和日志记录，而RTOS核则负责实时的安全监控，保证系统的高可靠性。

#### 3. **电力系统安全控制**

- **多层次控制**：在电力系统中，AMP架构允许不同层次的控制任务在不同核上独立运行。例如，高层次的控制任务在Linux系统中执行，而实时性要求较高的低层次控制任务则由RTOS处理。
- **系统冗余**：AMP系统可以设计成冗余结构，确保即使部分处理器核出现故障，其他核仍然可以接管关键控制任务，保持系统稳定运行。

### AMP系统在工业自动化中的应用

#### 1. **实时控制系统**

- **机械控制**：在工业自动化中，RTOS核可以负责机械臂、传送带等设备的实时控制，确保精确的操作时序和快速响应。而Linux核则可以运行高级任务，如生产线管理、质量监控和数据分析。
- **传感器集成**：AMP系统可以集成各种传感器数据，并通过不同的处理器核进行分类处理。例如，温度传感器数据可以由Baremetal核处理，确保低延迟响应，而视觉传感器数据则可以由Linux核进行复杂的图像处理。

#### 2. **工业网络与通信**

- **实时数据交换**：AMP系统可以通过实时核（运行RTOS）处理工业通信协议（如CAN、EtherCAT），确保实时性和数据传输的可靠性。同时，Linux核可以负责管理网络堆栈和处理来自其他系统的数据流。
- **边缘计算**：在工业物联网（IIoT）中，AMP系统可用于边缘计算，将部分数据处理和分析任务放在本地RTOS核上执行，减少数据传输延迟，而复杂的决策任务则交由Linux核处理。

#### 3. **故障诊断与维护**

- **预防性维护**：AMP系统可以在RTOS核上实现对设备的实时监控和诊断，及时发现潜在的故障风险。同时，Linux核可以进行历史数据分析，预测设备的维护需求。
- **远程故障处理**：在出现故障时，AMP系统能够通过Linux核提供远程访问和控制，而RTOS核则执行本地的紧急处理任务，确保系统的持续运行。

### 实际案例分析

- **智能电网**：在智能电网中，AMP架构被用来管理大量的分布式能源资源，实时监控电网状态，并在检测到异常时迅速做出响应。Linux核管理高级调度和通信，RTOS核处理关键的继电保护任务。
- **工业4.0生产线**：在工业4.0的智能生产线中，AMP系统通过实时监控设备状态和控制生产流程，提高了生产效率和产品质量。RTOS核负责设备的实时控制，而Linux核则管理整个生产线的调度和优化。

------

这就是AMP系统在电力和工业自动化中的应用的基础知识！如果你有任何问题，或者想要进一步探讨某个具体部分，请随时告诉我。如果你准备好继续下一个主题，可以使用**/continue**命令。🦌

# RT-Thread学习

RT-Thread是一个开源的嵌入式实时操作系统，广泛应用于物联网、工业控制、消费电子等领域。它以其轻量级、高效和模块化的特点而著称。RT-Thread提供了一个丰富的组件库，包括线程管理、内存管理、设备框架、网络栈和GUI系统，这些组件使开发者能够快速构建复杂的嵌入式系统。

## **主题**: RT-Thread简介

### 历史与发展

RT-Thread于2006年首次发布，旨在为资源有限的嵌入式设备提供一个灵活的操作系统。随着时间的推移，RT-Thread逐渐发展壮大，社区贡献者也越来越多。如今，RT-Thread已经成为全球最受欢迎的开源RTOS之一，被广泛用于各种嵌入式应用中。

### RT-Thread的特点

- **模块化设计**: RT-Thread采用模块化设计，开发者可以根据需求裁剪系统，从而在资源受限的设备上运行。
- **丰富的组件库**: 提供了从基础功能到高级功能的一系列组件，涵盖了嵌入式开发的各个方面。
- **支持多种架构**: RT-Thread支持多种处理器架构，如ARM Cortex-M系列、RISC-V等。
- **广泛的应用场景**: RT-Thread被应用于物联网设备、智能家居、工业自动化等多个领域。

### 主要应用领域

1. **物联网（IoT）**: RT-Thread在物联网设备中得到了广泛应用，特别是在需要低功耗和高效实时性能的场景下。
2. **工业控制**: 在工业控制系统中，RT-Thread以其稳定性和高效性得到了认可，成为了众多工业设备的操作系统选择。
3. **消费电子**: RT-Thread在智能家居设备、可穿戴设备等消费电子产品中也有着广泛的应用。

## **主题**: RT-Thread内核架构

RT-Thread的内核架构是其性能和灵活性的基础。了解内核的设计理念和实现细节对于深入掌握RT-Thread非常重要。我们将从内核的关键组成部分开始，逐步探讨其设计与功能。

#### 1. 内核概述

RT-Thread的内核是一个微内核，具有简洁、高效和可移植的特点。它主要负责以下几个方面的功能：

- **线程管理**: 负责线程的创建、调度、销毁以及状态管理。
- **内存管理**: 提供动态内存分配、堆栈管理以及内存池的支持。
- **中断处理**: 处理外部中断，并将中断服务例程（ISR）与线程切换无缝集成。
- **定时器管理**: 提供硬件和软件定时器支持，实现周期性任务调度。

#### 2. 线程管理

线程管理是RT-Thread内核的核心功能之一。线程（或称任务）是RT-Thread中的基本执行单元。以下是RT-Thread的线程管理机制：

- **优先级调度**: RT-Thread采用优先级调度算法，支持多级优先级，确保高优先级任务优先执行。
- **时间片轮转**: 对于同一优先级的线程，RT-Thread使用时间片轮转的方式调度线程，以实现公平性。
- **线程状态**: 每个线程可以处于以下状态之一：就绪（Ready）、运行（Running）、挂起（Suspended）、阻塞（Blocked）等。
- **线程控制块（TCB）**: RT-Thread通过线程控制块（TCB）来管理每个线程的状态、优先级、堆栈等信息。

#### 3. 内存管理

RT-Thread的内存管理模块支持多种内存管理方式，以满足不同应用场景的需求：

- **静态内存分配**: 在编译时分配固定大小的内存区域，适用于资源受限的系统。
- **动态内存分配**: 使用堆（heap）来动态分配和释放内存，提供更大的灵活性。
- **内存池**: 通过预先分配的内存块（memory block）来提高内存分配和释放的效率。

#### 4. 中断处理

中断是嵌入式系统中非常重要的机制，用于响应外部事件。RT-Thread的中断处理机制包括：

- **中断服务例程（ISR）**: 当中断发生时，RT-Thread调用对应的中断服务例程来处理事件。
- **中断嵌套**: 支持中断嵌套，允许更高优先级的中断在低优先级的中断处理中打断。
- **中断线程化**: RT-Thread允许将中断服务例程的处理推迟到线程上下文中执行，以减少中断处理的延迟。

#### 5. 定时器管理

RT-Thread提供硬件和软件定时器来支持实时任务调度：

- **硬件定时器**: 直接依赖于处理器的硬件计时器，通常用于精确的时间管理。
- **软件定时器**: 基于系统时钟实现的软件定时器，适用于不太严格的时间要求。

------

RT-Thread的内核架构为其在嵌入式系统中的高效运行提供了坚实的基础。了解这些核心机制将帮助您在实际开发中更好地利用RT-Thread的功能。

请问您是否有任何问题？如果没有，我们可以继续学习下一节课内容：**任务与线程管理**。

## 主题：如何让RT-Thread跑在Rockchip上

要让RT-Thread运行在Rockchip的处理器上，需要经过几个关键步骤，包括环境搭建、内核移植、驱动程序开发和应用程序编写。以下是一个详细的指南，帮助您在Rockchip平台上成功运行RT-Thread。

### 1. 环境搭建

#### 1.1 获取开发板和芯片支持

首先，您需要获取一个支持Rockchip处理器的开发板，如RK3288、RK3399等。确保开发板的硬件文档和驱动支持能够获取到。

#### 1.2 安装交叉编译工具链

为了在ARM架构的Rockchip处理器上编译RT-Thread，您需要安装一个交叉编译工具链。通常使用的工具链是**GNU ARM Toolchain**，您可以在以下链接下载：

- [GNU ARM Toolchain 下载地址](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm)

安装完成后，确认工具链路径已经正确配置到环境变量中。

### 2. 移植RT-Thread到Rockchip平台

#### 2.1 获取RT-Thread源码

从RT-Thread的官方GitHub仓库克隆最新的RT-Thread源码：

```
COPYgit clone https://github.com/RT-Thread/rt-thread.git
```

#### 2.2 配置RT-Thread

进入RT-Thread源码目录，并使用`menuconfig`或`Kconfig`工具配置RT-Thread内核。配置过程中，您需要根据Rockchip的硬件特点选择合适的内核选项和驱动支持。

```
COPYcd rt-thread
scons --menuconfig
```

在配置中，确保选择了ARM架构，并配置了与Rockchip处理器对应的CPU选项。

#### 2.3 添加硬件抽象层（HAL）

如果RT-Thread官方没有提供对特定Rockchip芯片的支持，您需要自己编写或移植硬件抽象层（HAL）。HAL需要处理的部分包括：

- **时钟管理**
- **中断控制**
- **存储器映射**
- **外设初始化**

您可以参考RT-Thread对其他ARM Cortex-A系列芯片的移植来进行修改。

### 3. 驱动程序开发

为了让RT-Thread充分利用Rockchip的硬件功能，可能需要开发或移植一些驱动程序。关键驱动包括：

- **UART驱动**：用于串口调试输出。
- **定时器驱动**：用于实现系统时钟和定时器功能。
- **GPIO驱动**：支持通用输入输出控制。
- **其他外设驱动**：如I2C、SPI、网络接口等。

这些驱动程序通常在`drivers`目录下实现，您可以参考RT-Thread的标准驱动框架进行开发。

### 4. 编译与烧写

#### 4.1 编译RT-Thread

使用SCons编译RT-Thread内核及相关组件：

```
COPYscons
```

编译完成后，生成的固件文件通常为`rtthread.bin`或`rtthread.elf`。

#### 4.2 烧写固件

将生成的固件通过烧写工具烧录到Rockchip开发板中。对于Rockchip芯片，您可以使用工具如`rkflashtool`或`RKDevelopTool`来进行固件烧写。

### 5. 调试与运行

通过UART接口连接开发板，打开串口终端（如`minicom`或`Putty`），并重启开发板。您应该能够在终端中看到RT-Thread的启动日志。

### 6. 应用程序开发

在RT-Thread成功运行后，您可以开始编写自己的应用程序，充分利用RT-Thread的线程管理、内存管理等功能。应用程序可以直接在`application`目录下开发，编写完成后通过编译生成新的固件。

### 7. 优化与调试

最后，根据应用需求和性能目标，您可以进一步优化RT-Thread的配置和代码。使用RT-Thread的调试工具，进行性能分析、内存检测等工作，确保系统的稳定性和高效性。

------

通过上述步骤，您应该能够成功地在Rockchip平台上运行RT-Thread。这个过程需要对嵌入式系统、操作系统移植和驱动开发有一定的了解。如果在移植过程中遇到问题，欢迎继续讨论或咨询相关的开发社区。

# AMP源码编译

## 开发环境搭建

```
COPYsudo apt-get update
sudo apt-get install clang-format astyle libncurses5-dev build-essential scons
```

## SDK 编译

整体编译

```
COPY./build.sh all
```

![image-20240831130909780](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029337.png)image-20240831130909780

![image-20240831131002361](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029639.png)image-20240831131002361

![image-20240831131107616](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029218.png)image-20240831131107616

进行单独编译前需进行过全编译，各个镜像单独编译命令如下：

```
COPY./build.sh uboot  //单独编译 uboot
./build.sh kernel  //单独编译 内核
./build.sh amp  //单独编译 amp
./build.sh updateimg  //打包整体 update.img 镜像
```

烧写就正常的烧写即可。

# 裸机和Linux核心修改

然后现在用的是三个A55内核跑Linux一个A55内核跑裸机，具体现象是这样的，这是裸机核心：

![image-20240831131931925](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029243.png)image-20240831131931925

这是那一个Linux核心内容：

![image-20240831132009133](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029544.png)image-20240831132009133

可以看到现在只有三个核心被打印了出来。然后来看一下具体的修改，是怎样实现让这一个核心跑裸机的呢？

```
COPYvi device/rockchip/rk3568/rk3568_amp_linux.its
```

文件内容如下所示：

```
COPY
/dts-v1/;
/ {
        description = "FIT source file for rockchip AMP";
        #address-cells = <1>;

        images {
                /*amp1 {
                        description  = "bare-mental-core1";
                        data         = /incbin/("cpu1.bin");
                        type         = "firmware";
                        compression  = "none";
                        arch         = "arm";
                        cpu          = <0x100>;
                        thumb        = <0>;
                        hyp          = <0>;
                        load         = <0x01800000>;
                        udelay       = <10000>;
                        hash {
                                algo = "sha256";
                        };
                };

                amp2 {
                        description  = "bare-mental-core2";
                        data         = /incbin/("cpu2.bin");
                        type         = "firmware";
                        compression  = "none";
                        arch         = "arm";
                        cpu          = <0x200>;
                        thumb        = <0>;
                        hyp          = <0>;
                        load         = <0x02000000>;
                        udelay       = <10000>;
                        hash {
                                algo = "sha256";
                        };
                };*/

                amp3 {
                        description  = "bare-mental-core3";
                        data         = /incbin/("cpu3.bin");
                        type         = "firmware";
                        compression  = "none";
                        arch         = "arm";
                        cpu          = <0x300>;
                        thumb        = <0>;
                        hyp          = <0>;
                        load         = <0x02800000>;
                        udelay       = <10000>;
                        hash {
                                algo = "sha256";
                        };
                };
        };

        configurations {
                default = "conf";
                conf {
                        description = "Rockchip AMP images";
                        rollback-index = <0x0>;
                        //loadables = "amp1", "amp2", "amp3";
                        loadables = "amp3";

                        signature {
                                algo = "sha256,rsa2048";
                                padding = "pss";
                                key-name-hint = "dev";
                                sign-images = "loadables";
                        };

                        /* - run linux on cpu0
                         * - it is brought up by amp(that run on U-Boot)
                         * - it is boot entry depends on U-Boot
                         */
                        linux {
                                description  = "linux-os";
                                arch         = "arm64";
                                cpu          = <0x000>;
                                thumb        = <0>;
                                hyp          = <0>;
                                udelay       = <0>;
                        };
                };
        };
};
```

这个设备树描述文件用于生成一个 FIT（Flattened Image Tree）格式的映像文件，该文件可以包含多个固件、配置和元数据。FIT 文件格式通常用于嵌入式系统中，特别是在使用 U-Boot 引导加载器的系统中，以便管理多核处理器或多个固件的加载和执行。让我们详细解释一下这个设备树的结构和每个部分的作用。

### 1. 文件头部

```
COPY/dts-v1/;
/ {
    description = "FIT source file for rockchip AMP";
    #address-cells = <1>;
```

- **/dts-v1/**: 声明设备树的版本。
- **description**: 提供这个 FIT 文件的简要描述，表明它是为 Rockchip AMP（Asymmetric Multiprocessing）使用的。
- **#address-cells = <1>;**: 定义地址单元的大小为 1，通常在定义节点的地址时使用。

### 2. `images` 节点

```
COPYimages {
    /*amp1 {
        description  = "bare-mental-core1";
        data         = /incbin/("cpu1.bin");
        type         = "firmware";
        compression  = "none";
        arch         = "arm";
        cpu          = <0x100>;
        thumb        = <0>;
        hyp          = <0>;
        load         = <0x01800000>;
        udelay       = <10000>;
        hash {
            algo = "sha256";
        };
    };
```

- **images**: 包含所有固件映像的节点，每个映像表示要加载到特定处理器核心的一个固件。
- **amp1, amp2, amp3**: 这三个节点（其中 amp1 和 amp2 被注释掉了）代表三个不同的固件映像，分别用于不同的处理器核心。
  - **description**: 对应映像的描述。
  - **data**: 通过 `/incbin/("filename")` 指令包含一个二进制文件，这里是 `cpu1.bin`、`cpu2.bin` 和 `cpu3.bin`。
  - **type**: 映像的类型，这里是 `"firmware"`，表示这是一个固件映像。
  - **compression**: 指定映像的压缩类型，这里为 `"none"`，即未压缩。
  - **arch**: 目标架构，这里是 `"arm"`。
  - **cpu**: 指定目标 CPU 核心，这里 `0x100`、`0x200`、`0x300` 表示不同的 CPU 核心。
  - **thumb**: 指定是否使用 ARM 的 Thumb 模式，这里为 `<0>` 表示不使用。
  - **hyp**: 指定是否使用 Hypervisor 模式，这里为 `<0>` 表示不使用。
  - **load**: 指定映像在内存中的加载地址，例如 `0x01800000`。
  - **udelay**: 延迟加载时间，单位是微秒。
  - **hash**: 包含一个哈希节点，用于校验数据的完整性，`algo` 指定了使用的哈希算法，比如 `sha256`。

### 3. `configurations` 节点

```
COPYconfigurations {
    default = "conf";
    conf {
        description = "Rockchip AMP images";
        rollback-index = <0x0>;
        loadables = "amp3";

        signature {
            algo = "sha256,rsa2048";
            padding = "pss";
            key-name-hint = "dev";
            sign-images = "loadables";
        };

        linux {
            description  = "linux-os";
            arch         = "arm64";
            cpu          = <0x000>;
            thumb        = <0>;
            hyp          = <0>;
            udelay       = <0>;
        };
    };
};
```

- configurations

  : 包含配置的节点，用于定义如何加载和管理多个映像。

  - **default = “conf”;**: 指定默认的配置节点是 `conf`。
  - **conf**: 这是一个配置节点，定义了如何加载和管理映像。
    - **description**: 配置的描述，这里为 “Rockchip AMP images”。
    - **rollback-index**: 回滚索引，用于版本管理，通常用于确定是否需要回滚到以前的配置。
    - **loadables**: 指定要加载的映像列表，当前仅加载 `amp3`，但注释部分显示也可以加载 `amp1` 和 `amp2`。
    - **signature**: 包含签名信息，用于验证映像的完整性和来源。
      - **algo**: 指定签名算法，这里是 `"sha256,rsa2048"`，表示使用 SHA-256 和 RSA 2048 位的组合。
      - **padding**: 指定签名的填充方式，这里是 `"pss"`。
      - **key-name-hint**: 签名使用的密钥名称提示，这里是 `"dev"`。
      - **sign-images**: 指定要签名的映像，这里签名的是 `"loadables"`，即 amp3 映像。
    - **linux**: 定义了关于 Linux 操作系统的配置信息。
      - **description**: 描述是 `"linux-os"`。
      - **arch**: 指定目标架构，这里是 `"arm64"`。
      - **cpu**: 指定运行 Linux 的 CPU 核心，这里是 `<0x000>`。
      - **thumb**: 指定是否使用 ARM 的 Thumb 模式，这里为 `<0>` 表示不使用。
      - **hyp**: 指定是否使用 Hypervisor 模式，这里为 `<0>` 表示不使用。
      - **udelay**: 加载后的延迟时间，通常为 0。

### 总结

- **FIT 文件** 通过 `images` 节点打包多个固件或映像文件，并通过 `configurations` 节点指定如何加载和管理这些映像。
- **多核管理**: 这类配置特别适用于多核系统（AMP），每个核心可以加载和运行不同的固件或裸机程序。
- **签名和安全性**: 使用 `signature` 节点来签名和验证加载的映像，以确保安全性和完整性。
- **灵活的配置**: `configurations` 节点允许用户根据不同需求配置和加载不同的映像。

通过上述解释，你可以理解 FIT 文件如何用于多核处理器的固件加载和管理，以及如何通过设备树描述这种复杂的启动场景。

上面的fit 设备树总共有三个节点，分别对应amp0、amp1和amp2，默认情况下打开的是amp3这一个核心，如果想要打开另外两个只需要打开对应的注释即可。

除此之外还有另外一个内核设备树要改，不能只打开这里的注释，还需要关掉Linux CPU，不然也是无法生效的，具体的设备树为

```
COPYvi kernel/arch/arm64/boot/dts/rockchip/rk3568-evb1-ddr4-v10-linux-amp.dts
```

![image-20240831133651193](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029277.png)image-20240831133651193

默认情况下是打开了三个Linux核心，分别为CPU0 1 2，而CPU3被用在裸机，所以应用了delete node，删掉了cpu3，如果想要改为1个Linux核心，三个裸机核心，可以改成这个样子：

![image-20240831134320679](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029187.png)image-20240831134320679

![image-20240831134306646](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029108.png)image-20240831134306646

![image-20240831134245402](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029471.png)image-20240831134245402

现在已经确认裸机核心和Linux核心如何修改了，那他具体是如何运转的呢？我该如何利用这个裸机核心呢？这个裸机核心都能用来做什么呢？

# 裸机核心开发

在这段文档中，开发板上的各种硬件外设被测试和验证，包括GPIO、PWM、UART、SPI、以及多核控制。这些测试主要用于确保嵌入式系统中的不同外设功能正常工作。以下是对文档中各个部分的整理和简要说明：

### 1. GPIO 测试

- **目的**: 测试GPIO的功能，通过控制LED灯的亮灭来验证。

- 关键代码

  :

  - `HAL_PINCTRL_SetParam`: 配置GPIO引脚的复用功能。
  - `HAL_GPIO_SetPinDirection`: 设置GPIO引脚为输出模式。
  - `HAL_GPIO_GetPinLevel` 和 `HAL_GPIO_SetPinLevel`: 获取和设置GPIO引脚的电平状态。
  - **循环逻辑**: 每隔1秒读取GPIO引脚的状态并翻转其电平状态，达到闪烁LED的效果。

### 2. PWM 测试

- **目的**: 使用PWM控制LED灯实现呼吸灯效果。

- 关键代码

  :

  - `HAL_PWM_Init`: 初始化PWM控制器。
  - `HAL_IOMUX_PWM0_Config`: 配置PWM0的IOMUX。
  - `HAL_PWM_SetConfig` 和 `HAL_PWM_Enable`: 配置PWM信号的周期和占空比，并使能PWM输出。
  - **呼吸灯效果**: 通过增加和减少PWM的占空比，实现灯光的渐亮和渐暗效果。

### 3. UART 测试

- **目的**: 测试UART9的发送和接收功能。

- **硬件连接**: 使用两块开发板进行串口通信，或者使用USB转TTL模块进行电脑与开发板间的通信。

- 关键代码

  :

  - `HAL_UART_Init`: 初始化UART9配置。
  - `HAL_UART_SerialOut` 和 `HAL_UART_SerialIn`: 通过UART发送和接收数据。
  - `uart9_isr`: 中断处理函数，处理UART接收数据的中断。
  - **测试逻辑**: 定期发送数据并接收返回的数据，进行显示和验证。

### 4. SPI 测试

- **目的**: 通过回环测试验证SPI0的发送和接收功能。

- **硬件连接**: 短接SPI0的MOSI和MISO引脚。

- 关键代码

  :

  - `HAL_SPI_Init`: 初始化SPI设备。
  - `demo_spi_transfer`: 进行SPI数据的发送和接收。
  - **回环测试**: 发送一组数据，然后通过MISO接收并验证数据的正确性。

### 5. 开关核测试

- **目的**: 通过控制Linux中的命令，启用或关闭特定的CPU核，运行或停止裸机程序。

- 关键配置

  :

  - `boot-on`: 设置为1时，系统启动时自动运行裸机程序；设置为0时，开机不启动裸机程序。

- 操作命令

  :

  - `echo off 0x300 > /sys/rk_amp/boot_cpu`: 关闭已启动的核。
  - `echo on 0x300 > /sys/rk_amp/boot_cpu`: 启动已关闭的核。
  - `echo status 0x300 > /sys/rk_amp/boot_cpu`: 查看核的当前状态。

这些测试和操作演示了如何在iTOP-3568开发板上使用HAL库与硬件外设交互。这些代码片段和步骤为开发人员提供了调试和验证开发板功能的基础工具。

### 6.总结

每个裸机代码测试其实就是写了一个库而已，具体在/home/topeet/rk356x_amp/hal/project/rk3568/src目录，这里田创建了一个topeet_demo文件夹，具体如下所示：

![image-20240831140057163](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029222.png)image-20240831140057163

而在/home/topeet/rk356x_amp/hal/project/common/GCC/Cortex-A.mk配置文件中，加入了对应的目录，具体如下所示：

![image-20240831140026103](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029213.png)image-20240831140026103

然后来看这个主程序：

![image-20240831140240178](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029403.png)image-20240831140240178

这个主程序其实就是裸机核心要运行的，我们要看的代码呢，在这六行：

![image-20240831140447549](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029722.png)image-20240831140447549

 这里的四个测试是田自己加的，取消注释就代表着启动对应得测试，行了，AMP裸机运行的框架就讲解到这里，然后来思考一下RTT，RTT算是一个实时系统，当然他肯定也是运行在裸机核心上面的，但他的运行效果是怎样的呢，他这个系统又能有什么功能呢，这个不是很清楚，先去哔哩哔哩上学习一下具体的现象，对他有个大致的认识。

# RT-Thread编译

首先要确保一个CPU核心跑裸机核心，另外三个跑Linux，也就是默认的SDK配置，然后编译

```
COPY./build.sh rtthread 3
./build.sh ampimg
./build.sh updateimg
```

编译完成之后，然后在裸机的Uart4打印具体如下所示：

![image-20240831143351828](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051029869.png)image-20240831143351828

```
COPYscons --exec-path="aarch64-linux-gnu-"
```

风火轮测试视频：

https://www.douyin.com/video/7343275757080153356

rtthread官方推文

https://www.elecfans.com/d/2408719.html
