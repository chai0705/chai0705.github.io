---
description: "一、准备知识  1.1 C++的编译过程 - -E 仅预处理；不编译、汇编或链接。 - -S 仅编译；不汇编或链接。 - -c 编译和汇编，但不链接。 - -o <file> 将输出放入<file>中。 **C++源代码的编译过程** 1. **预处理**：在预处理阶段，C++源代码中的预处理指令"
cover: /img/cover/4.webp

title: cmake 基础课
date: 2023-09-03 17:50:19
categories:
  - 编程语言
link: 编程语言/01 cmake-基础课
---

# 一、准备知识

## 1.1 C++的编译过程

- -E 仅预处理；不编译、汇编或链接。
- -S 仅编译；不汇编或链接。
- -c 编译和汇编，但不链接。
- -o <file> 将输出放入<file>中。

**C++源代码的编译过程**

1. **预处理**：在预处理阶段，C++源代码中的预处理指令会被处理，包括宏展开和条件编译等。在此阶段，需要添加所有头文件的引用路径。

   ~~~shell
   # 将xx.cpp源文件预处理为xx.i文件（文本文件）
   g++ -E main.cpp -o main.i
   ```
   ~~~

2. **编译**：编译阶段会对预处理后的代码进行语法检查和编译，将代码翻译为汇编语言文件。

   ~~~shell
   # 将xx.i文件编译为xx.s的汇编文件（文本文件）
   g++ -S main.i -o main.s
   ```
   ~~~

3. **汇编**：汇编阶段将汇编语言文件转换为二进制格式的目标文件。

   ~~~shell
   # 将xx.s文件汇编为xx.o的二进制目标文件
   g++ -c main.s -o main.o
   ```
   ~~~

4. **链接**：链接阶段将目标文件与所依赖的库文件进行关联或组装，生成可执行文件。

   ~~~shell
   # 将目标文件进行链接，生成可执行程序
   g++ main.o -o main
   ```
   ~~~

## 1.2 静态链接库和动态链接库

静态链接库和动态链接库的区别在于链接的阶段不同。

**静态链接库**的名称通常以`.a`结尾（表示archive library），它在编译阶段进行链接。如果一个工程依赖于静态链接库，那么生成的可执行文件或库会将静态链接库`.a`打包到输出文件中，因此生成的文件比较大。在运行时，不再需要单独的库文件。

**动态链接库**的链接发生在程序的执行过程中，它在编译阶段仅进行链接检查，而不进行真正的链接过程。动态链接库的后缀名通常为`.so`（表示shared object，在Linux上）或`.dylib`（在macOS上）。动态链接库在加载后，在内存中只保存一份拷贝。多个程序依赖于它时，不会重复加载和拷贝，节省了内存空间。

![image-20230903175645024](https://chai-1301855619.cos.ap-beijing.myqcloud.com/image-20230903175645024.png)



## 1.3 为什么需要CMake

### 1.3.1 g++命令行编译

当编译hello_world.cpp`文件时，可以使用以下命令进行编译和运行：

```shell
g++ main.cpp -o main
```

如果需要引入外部库可以使用以下方法进行编译：

方法一：使用`-lgflags`参数进行链接**

首先，需要安装`gflags`库：

~~~shell
sudo apt-get install libgflags-dev libgflags2.2
```

然后，使用以下命令进行编译：

````bash
g++ main.cpp -lgflags -o main
```
~~~

方法二：使用`pkg-config`进行库文件和头文件路径查找**

首先，需要安装`pkg-config`工具：

~~~shell
sudo apt-get install pkg-config
```

然后，使用以下命令进行编译：

````bash
g++ main.cpp `pkg-config --cflags --libs gflags` -o main
```

这里，`pkg-config --cflags --libs gflags`命令用于查找`gflags`库的头文件和库文件路径。
~~~

编译完成后，可以使用以下命令运行可执行文件：

```shell
./main --age 31 --name alice
```

有时候，在编译时不需要手动添加头文件或链接库路径，因为`g++`可以在默认的查询路径中找到这些库。然而，当项目文件和引入的外部库变得较多时，使用命令行编译会变得冗长且不便于调试和编辑。通常，在测试单个文件时可以使用命令行编译，但不推荐在实际项目中使用命令行编译方式。

### 1.3.2 CMake简介

在实际工作中，推荐使用CMake来构建C++项目。CMake是一个开源的跨平台工具，用于构建、测试和软件打包。

CMake具有以下特性：

- **自动搜索依赖项**：CMake具有自动搜索可能需要的程序、库和头文件的能力，可以简化依赖项的配置过程。
- **独立的构建目录**：CMake支持使用独立的构建目录（例如`build`目录），这样可以安全地清理构建产生的中间文件和输出文件，不会污染源代码目录。
- **自定义命令**：CMake支持定义复杂的自定义命令，例如下载文件、生成各种文件等，可以满足项目构建过程中的特定需求。
- **自定义配置**：CMake支持根据需求进行自定义配置，可以选择性地启用或禁用特定的组件或功能。
- **文本文件生成工作区和项目**：CMake使用简单的文本文件（`CMakeLists.txt`）来描述项目的配置和构建规则，可以根据这些文件自动生成工作区和项目。
- **文件依赖项自动生成和并行构建**：CMake可以在主流平台上自动生成文件之间的依赖关系，从而使构建过程更高效。同时，CMake支持并行构建，可以加快构建速度。
- **支持多种IDE**：CMake几乎支持所有主流的集成开发环境（IDE），包括Visual Studio、Xcode、Eclipse等，可以方便地在不同的开发环境中进行项目开发和调试。

# 二、CMake基础知识

## 2.1 安装

在Ubuntu上安装CMake可以使用以下命令：

```shell
sudo apt install cmake -y
```

这将使用apt包管理器自动安装CMake。

如果你想编译安装特定版本的CMake，可以按照以下步骤操作：

克隆CMake的源代码库：

```shell
git clone -b v3.25.1 https://github.com/Kitware/CMake.git
cd CMake

这里以安装版本3.25.1为例，你可以将`v3.25.1`替换为你想要安装的特定版本。
```

配置和编译CMake：

```shell
./bootstrap --prefix=<安装路径>
make

你可以使用`--prefix`选项来指定安装路径，或者省略`--prefix`以安装到默认路径。
```

安装CMake：

```shell
sudo make install

这将以管理员权限安装CMake到系统中。
```

安装完成后，你可以验证CMake的安装版本：

```shell
cmake --version
```

该命令将显示CMake的版本信息，确认安装成功与否。

## 2.2 第一个CMake例子

**配置：** 使用`cmake`命令进行配置，其中`-S`选项指定源码目录，`-B`选项指定构建目录。在终端中执行以下命令：

```
cmake -S . -B build

这将在当前目录下执行CMake配置，并将生成的构建系统文件放在名为`build`的目录中。
```

**生成：** 使用`cmake --build`命令进行生成，其中`--build`选项指定构建目录。在终端中执行以下命令：

```
cmake --build build

这将在`build`目录中执行构建步骤，生成可执行文件。
```

**运行：** 使用以下命令运行生成的可执行文件：

```
./build/first_cmake

这将执行生成的可执行文件。
```

## 2.3 语法基础

### 2.3.1 指定版本

在CMake中，可以使用`cmake_minimum_required`命令指定当前项目所需的最低CMake版本。它的语法如下：

```cmake
cmake_minimum_required(VERSION <version_number>)
```

其中，`<version_number>`是所需的最低CMake版本号。在这个命令之后，CMake将会检查系统中安装的CMake版本是否满足这个要求，如果不满足则会产生错误。

例如，如果要指定最低的CMake版本为3.10，可以在CMakeLists.txt文件中添加以下命令：

```cmake
cmake_minimum_required(VERSION 3.10)
```

这样，CMake将会检查系统中的CMake版本是否大于等于3.10。

除了`cmake_minimum_required`命令，CMake中还有其他类似的命令，它们不区分大小写，并且有许多关键字来引导命令的参数输入，类似于函数的参数传递。这些命令使用的关键字在CMake中是不区分大小写的。

### 2.3.2 设置项目

在CMakeLists.txt文件的开头，通常会使用`project`命令来指定项目的名称、版本、描述和所使用的语言。`project`命令的语法如下：

```cmake
project(ProjectName
    [VERSION <version_number>]
    [DESCRIPTION "project_description"]
    [LANGUAGES <language>]
)
```

其中，`ProjectName`是项目的名称，在例子中使用的是"first_cmake"。`VERSION`关键字后面是项目的版本号，可以是任意格式的版本号，例如"1.0.0"。`DESCRIPTION`关键字后面是项目的描述，可以是一个字符串。`LANGUAGES`关键字后面是项目所使用的语言，这里使用的是"Cxx"，表示C++。

示例中的`project`命令：

```cmake
project(first_cmake
    VERSION 1.0.0
    DESCRIPTION "项目描述"
    LANGUAGES Cxx
)
```

这样，通过`project`命令，可以在CMakeLists.txt中指定项目的基本信息，方便管理和描述项目。

### 2.3.3 添加可执行文件目标

使用了`add_executable`命令来定义一个可执行文件。该命令的语法如下：

```cmake
add_executable(<target_name> <source_files>)
```

其中，`<target_name>`是最终生成的可执行文件名，也是在CMake中定义的目标（Target）名。`<source_files>`是编译目标所使用的源文件。

在你提供的例子中，使用了`add_executable`命令来定义一个名为`first_cmake`的目标，并指定了一个源文件`main.cpp`。这意味着在编译时，会将`main.cpp`编译为一个可执行文件，该文件的名称将是`first_cmake`。

示例中的`add_executable`命令：

```cmake
add_executable(first_cmake main.cpp)
```

通过`add_executable`命令，可以在CMakeLists.txt中定义编译目标，并指定相应的源文件。这样，CMake将会根据这些定义生成相应的构建规则和编译指令。

### 2.3.4 生成静态库并链接

A. 生成静态库：

在`account_dir/CMakeLists.txt`中，使用`add_library`命令来生成静态库。该命令的语法如下：

```
add_library(<library_name> <library_type> <source_files>)
```

其中，`<library_name>`是最终生成的库文件名，例如在Linux下会生成`libAccount.a`。

`<library_type>`用于指定链接库的类型，可以是动态链接库（`SHARED`）或静态链接库（`STATIC`）。

`<source_files>`是需要用到的源文件。

例如，在`account_dir/CMakeLists.txt`中，使用`add_library`命令生成一个名为`Account`的静态库，其包含了`Account.cpp`和`Account.h`两个源文件。示例命令如下：

```cmake
add_library(Account STATIC Account.cpp Account.h)
```

这将生成一个静态库文件`libAccount.a`。

B. 链接：

在`test_account/CMakeLists.txt`中，可以通过`target_link_libraries`命令将生成的静态库链接到目标可执行文件中。该命令的语法如下：

```cmake
target_link_libraries(<target_name> <library_name>)
```

其中，`<target_name>`是目标可执行文件的名称，`<library_name>`是要链接的库文件名。

例如，在`test_account/CMakeLists.txt`中，假设有一个目标可执行文件名为`test_account`，需要链接生成的静态库`Account`。示例命令如下：

```cmake
target_link_libraries(test_account Account)
```

这样，生成的可执行文件`test_account`将会链接静态库`Account`。

### 2.3.5 生成动态库并连接

A. 生成动态库：

在`account_dir/CMakeLists.txt`中，使用`add_library`命令来生成动态库。与生成静态库不同的是，需要将`<library_type>`参数设置为`SHARED`，表示生成动态链接库。

示例命令如下：

```cmake
add_library(Account SHARED Account.cpp Account.h)
```

这将生成一个动态库文件`libAccount.so`。

B. 链接：

链接过程与生成静态库时的操作相同，使用`target_link_libraries`命令将动态库链接到目标可执行文件中。

示例命令如下：

```cmake
target_link_libraries(test_account Account)
```

这样，生成的可执行文件`test_account`将会链接动态库`Account`。

### 2.3.6 CMake中的PUBLIC、PRIVATE、INTERFACE

在CMake中，可以使用`target_...()`系列命令来操作目标（Target）。这些命令通常支持通过`PUBLIC`、`PRIVATE`、`INTERFACE`关键字来控制属性的传播。

以`target_link_libraries(A B)`为例，下面是对这些关键字的理解：

- `PRIVATE`：依赖项B仅链接到目标A。如果有目标C链接了目标A，目标C不会链接目标B。
- `INTERFACE`：依赖项B并不链接到目标A。如果有目标C链接了目标A，目标C会链接目标B。
- `PUBLIC`：依赖项B链接到目标A。如果有目标C链接了目标A，目标C也会链接目标B。

可以将其类比为一个散烟的比方：

- `PRIVATE`：就是自己抽烟，不给别人抽。
- `INTERFACE`：就是自己不抽烟，给别人抽。
- `PUBLIC`：就是自己抽烟，也给别人抽。

从使用的角度来看，假设有目标C链接了目标A：

- 如果目标B仅用于目标A的实现，并且不在头文件中提供给目标C使用，可以使用`PRIVATE`。
- 如果目标B不用于目标A的实现，仅在头文件中作为接口给目标C使用，可以使用`INTERFACE`。
- 如果目标B既用于目标A的实现，也在头文件中提供给目标C使用，可以使用`PUBLIC`。

以下是一个示例：

```cmake
# 创建库
add_library(c c.cpp)
add_library(D d.cpp)
add_library(B b.cpp)

# 使用target_link_libraries命令进行链接
target_link_libraries(A PRIVATE B)
target_link_libraries(A INTERFACE C)
target_link_libraries(A PUBLIC D)
```

在上述示例中，目标`A`通过`target_link_libraries`命令链接了目标`B`、`C`和`D`，使用了不同的传播属性。具体属性的选择取决于目标之间的关系和使用需求。

### 2.3.7 变量

在CMake中，你可以使用`message`命令输出消息并进行变量的操作和设置。

以下是一些常见的用法：

1.输出消息：使用`message`命令可以输出消息到CMake的输出。

```cmake
message("输出消息")
```

2.消息拼接：使用`message`命令可以将多个消息进行拼接输出。

```cmake
message("输出1" "输出2" "输出3")  # 会进行拼接输出
```

3.设置变量：使用`set`命令可以设置变量的值。

```cmake
set(VAR1 "变量1")
message("VAR1=" ${VAR1})  # 外部访问
message("输出变量VAR1:${VAR1}")  # 内部拼接
message("\${VAR1}=${VAR1}")  # 使用\转义
```

4.删除变量：使用`unset`命令可以删除变量。

```cmake
unset(VAR1)  # 删除变量
message("\${VAR1}=${VAR1}")  # 删除变量后，输出为空
```

5.设置变量缓存：使用`set`命令的`CACHE`选项可以设置一个变量的缓存，可以通过命令行的`-D`参数来修改该变量的值。

```cmake
set(CACHE_VARIABLE_TEST "原始值" CACHE STRING "变量缓存的描述")
message("变量缓存的值:${CACHE_VARIABLE_TEST}")
```

6.常见的内置变量：CMake提供了一些内置的变量，用于获取构建系统的信息和配置

第一类: 提供信息的变量

- `PROJECT_NAME`：项目名称，表示当前CMake项目的名称。

```cmake
message("${PROJECT_NAME}")
```

- `CMAKE_SOURCE_DIR`：源码目录，表示当前CMake项目的根源码目录。

```cmake
message("${CMAKE_SOURCE_DIR}")
```

- `CMAKE_BINARY_DIR`：编译目录，表示当前CMake项目的编译输出目录。

```cmake
message("${CMAKE_BINARY_DIR}")
```

- `CMAKE_CURRENT_LIST_FILE`：当前CMakeLists.txt文件路径，表示当前正在处理的CMakeLists.txt文件的完整路径。

```cmake
message("${CMAKE_CURRENT_LIST_FILE}")
```

这些变量提供了与项目、目录结构和文件相关的信息。

----------

第二类: 控制CMake运行的变量

CMake中的变量通常是根据构建选项进行命名的，例如`BUILD_SHARED_LIBS`。这些变量用于控制CMake的运行和构建过程。

-----------

第三类: 描述系统的变量

- `WIN32`：表示当前操作系统是否为Windows。

```cmake
message("是否是Windows系统: ${WIN32}")
```

- `UNIX`：表示当前操作系统是否为类Unix（包括Linux、macOS等）。

```cmake
message("是否是Unix系统: ${UNIX}")
```

- `CMAKE_SYSTEM_NAME`：系统名称，表示当前操作系统的名称。

```cmake
message("系统名称: ${CMAKE_SYSTEM_NAME}")
```

这些变量用于描述当前操作系统的一些信息，以便在构建过程中进行条件判断和配置。

### 2.3.8 include引入其他代码

### 2.3.9 条件控制

CMake提供了条件控制的语法和关键词，使得你可以根据条件来控制构建过程中的行为。以下是一些常用的条件控制关键词和语法：

- `if (variable)`：当变量的值为真时，执行相应的代码块。

```cmake
if (MY_VARIABLE)
    # 当MY_VARIABLE为真时执行的代码块
endif()
```

- `else()`：在if条件为假时执行的代码块。

```cmake
if (MY_VARIABLE)
    # 当MY_VARIABLE为真时执行的代码块
else()
    # 当MY_VARIABLE为假时执行的代码块
endif()
```

- 真值常量：`ON`、`YES`、`TRUE`、`Y`、`1`、非零数字等。

```cmake
if (MY_VARIABLE STREQUAL "ON")
    # 当MY_VARIABLE的值为真时执行的代码块
endif()
```

- 假值常量：`OFF`、`NO`、`FALSE`、`N`、`0`、空字符串、`NOTFOUND`等。

```cmake
if (MY_VARIABLE STREQUAL "OFF")
    # 当MY_VARIABLE的值为假时执行的代码块
endif()
```

- 关键词：`NOT`、`TARGET`、`EXISTS (file)`、`DEFINED`等，可以与条件一起使用。

```cmake
if (NOT TARGET MyTarget)
    # 当MyTarget不存在时执行的代码块
endif()
```

- 逻辑运算符：`AND`、`OR`用于组合多个条件。

```cmake
if (CONDITION1 AND CONDITION2)
    # 当CONDITION1和CONDITION2同时为真时执行的代码块
endif()

if (CONDITION1 OR CONDITION2)
    # 当CONDITION1或CONDITION2至少一个为真时执行的代码块
endif()
```

- `MATCHES (regular expression)`：使用正则表达式进行匹配。

```cmake
if (MY_VARIABLE MATCHES "^prefix.*")
    # 当MY_VARIABLE以"prefix"开头时执行的代码块
endif()
```

- `VERSION LESS`、`VERSION LESS_EQUAL`：用于比较版本号。

```cmake
if (MY_VERSION VERSION LESS 2.0)
    # 当MY_VERSION小于2.0时执行的代码块
endif()
```

通过这些条件控制关键词和语法，你可以根据不同的条件来执行不同的代码块，从而实现更灵活和可配置的构建过程。你可以根据具体的需求选择适当的条件控制方式，并结合变量、关键词和运算符来编写CMake脚本。

### 2.3.10 CMake分步编译

首先，你使用以下命令查看所有的目标：

```shell
cmake --build . --target help
```

这将列出项目中可用的目标列表，包括默认目标"all"、"clean"、"depend"、"rebuild_cache"、"edit_cache"以及其他一些目标。

接下来，你执行以下命令进行预处理：

```shell
cmake --build . --target main.i
```

这将对"main.cpp"源文件进行预处理，并将预处理结果保存在"CMakeFiles/steps_demo.dir/main.cpp.i"文件中。

然后，你执行以下命令进行编译：

```shell
cmake --build . --target main.sI
```

这将将"main.cpp"源文件编译为汇编代码，并将汇编代码保存在"CMakeFiles/steps_demo.dir/main.cpp.s"文件中。

接着，你执行以下命令进行汇编：

```shell
cmake --build . --target main.o
```

这将将汇编代码编译为目标文件，并将目标文件保存为"CMakeFiles/steps_demo.dir/main.cpp.o"。

最后，你执行以下命令进行链接：

```shell
cmake --build .
```

这将扫描依赖项并链接生成最终的可执行文件"steps_demo"。

最后，你执行以下命令运行可执行文件：

```shell
./steps_demo
```

这将运行生成的可执行文件。

### 2.3.11 生成器表达式

生成器表达式是CMake中一种用于在生成构建系统时根据不同配置动态生成特定内容的表达式。它可以让代码更加精简和灵活。下面是几种常用的生成器表达式类型：

条件表达式：`$<condition:true_string>`。当条件为真时，返回`true_string`，否则返回空字符串。

```cmake
$<0:TEST>           # 返回空字符串
$<1:TEST>           # 返回"TEST"
$<$<BOOL:TRUE>:TEST>  # 返回"TEST"
```

变量查询（Variable-Query）：通过查询变量来获取动态的值。

```cmake
$<TARGET_EXISTS:target>             # 判断目标是否存在
$<CONFIG:Debug>                     # 判断当前构建类型是否为Debug
```

目标查询（Target-Query）：通过查询目标来获取相关的信息。

```cmake
$<TARGET_FILE:target>               # 获取目标的文件路径
$<TARGET_FILE_NAME:target>          # 获取目标的文件名
```

输出相关表达式：用于在不同的构建环节使用不同的参数。比如，在`install`和`build`阶段使用不同的参数。

```cmake
add_library(Foo ...)
target_include_directories(Foo
    PUBLIC
        $<$<CONFIG:Debug>:${DEBUG_INCLUDES}>
        $<$<CONFIG:Release>:${RELEASE_INCLUDES}>
)
```

在上述示例中，根据不同的构建配置（Debug或Release），生成器表达式选择性地包含不同的头文件路径。

需要注意的是，生成器表达式在生成构建系统时被展开，因此无法通过`message`命令直接打印。你可以使用类似`file(GENERATE OUTPUT "./generator_test.txt" CONTENT "$<$<BOOL:TRUE>:TEST>")`的方式将生成器表达式的结果写入文件，以间接测试生成器表达式的值。

### 2.3.12 函数和宏

```cmake
# 定义一个宏
macro(my_macro)
    message("宏内部的信息")
    set(macro_var "宏内部变量test")
endmacro()

# 定义一个函数
function(second_func arg1 arg2)
    message("第一个参数: ${arg1}，第二个参数: ${arg2}")
endfunction()
```

在这个示例中，`my_macro`是一个没有参数的宏，它在宏内部输出一条信息，并设置了一个变量`macro_var`的值。

`second_func`是一个函数，它有两个参数`arg1`和`arg2`。在函数内部，它输出了两个参数的值。

你可以在CMakeLists.txt文件中使用这些宏和函数，例如：

```cmake
# 调用宏
my_macro()

# 调用函数
second_func("Hello" "World")
```

当你运行CMake生成构建系统时，你将看到宏内部的信息输出，并且可以访问在宏或函数内部定义的变量。函数将输出参数的值。

请注意，宏和函数的定义需要在CMakeLists.txt文件的适当位置进行，并且在调用它们之前必须先定义它们。

### 2.3.13 设置安装

`install`命令用于设置安装规则，将目标文件和文件夹安装到指定的位置。下面是你提供的代码的解释：

```cmake
install(TARGETS instal_demo slib dlib
    RUNTIME DESTINATION bin     # 可执行文件安装路径
    LIBRARY DESTINATION lib     # 动态库安装路径
    ARCHIVE DESTINATION lib     # 静态库安装路径
    PUBLIC_HEADER DESTINATION include   # 公共头文件安装路径
)
```

在上述代码中，`install`命令指定了要安装的目标文件列表，其中包括`instal_demo`、`slib`和`dlib`。

接下来，通过指定不同的`DESTINATION`参数，定义了目标文件在安装过程中的安装路径：

- `RUNTIME DESTINATION bin`：指定可执行文件的安装路径为`bin`目录。
- `LIBRARY DESTINATION lib`：指定动态库的安装路径为`lib`目录。
- `ARCHIVE DESTINATION lib`：指定静态库的安装路径为`lib`目录。
- `PUBLIC_HEADER DESTINATION include`：指定公共头文件的安装路径为`include`目录。

根据你的需求，这些目标文件将被安装到指定的目录中。

请注意，安装路径是相对于安装目录的，因此你需要确保安装目录在运行`make install`时正确设置。

要解决在安装后无法找到动态库的问题，可以使用`set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)`和`set(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")`来设置RPATH。

下面是相应的代码：

```cmake
set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)
set(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")
```

`set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)`指示在构建过程中使用与安装RPATH相同的RPATH。这样，在构建时就可以正确地查找和链接动态库。

`set(CMAKE_INSTALL_RPATH "${CMAKE_INSTALL_PREFIX}/lib")`将安装RPATH设置为`${CMAKE_INSTALL_PREFIX}/lib`，其中`${CMAKE_INSTALL_PREFIX}`是安装目录的路径。这将导致在安装时设置RPATH，使得安装后的可执行文件可以在`${CMAKE_INSTALL_PREFIX}/lib`目录中正确地查找和加载动态库。

通过使用这两个设置，你可以解决在安装后无法找到动态库的问题。确保将其放置在CMakeLists.txt文件中的合适位置，并根据实际情况调整`${CMAKE_INSTALL_PREFIX}/lib`路径，以匹配你的安装目录结构。

### 2.3.14 寻找依赖find_package

对于大多数支持CMake的项目来说，可以使用`find_package`命令来查找对应的依赖库。通常情况下，如果找到了库，会设置以下变量（这些变量由库的作者设置）：

- `<LibaryName>_FOUND`：表示是否找到库。
- `<LibaryName>_INCLUDE_DIR`：表示库的头文件目录。
- `<LibaryName>_LIBRARIES`：表示库的库文件目录。

如果你编写了一个新的函数库，并希望其他项目可以通过`find_package`引用它，你可以使用以下两种方法：

1. 编写一个`Find<LibraryName>.cmake`文件：适用于导入非CMake安装的项目。

   你可以编写一个名为`Find<LibraryName>.cmake`的文件，并将其放置在CMake的`Modules`目录或项目的特定目录中。该文件应包含查找和设置相关变量的逻辑。其他项目可以通过`find_package`命令来引用这个自定义的查找文件，从而找到并使用你的库。

   附件: 15.custom_find

2. 使用`install`安装并生成`<LibraryName>Config.cmake`文件：适用于导入你自己开发的CMake项目。

   在你的库项目中，可以使用`install`命令将库文件安装到指定位置，并生成`<LibraryName>Config.cmake`文件。该文件应包含设置变量和导出目标的逻辑。其他项目可以通过`find_package`命令找到并使用你的库。



==现在只是简单的写了一下学习的内容，但是对于很多内容还并不是很熟悉，一切都要等到最后实战的时候==