1|---
2|description: "一、准备知识 1.1 C++的编译过程 - -E 仅预处理；不编译、汇编或链接。 - -S 仅编译；不汇编或链接。 - -c 编译和汇编，但不链接。 - -o <file> 将输出放入<file>中。 **C++源代码的编译过程** 1. **预处理**：在预处理阶段，C++源代码中的预处理指令"
3|cover: /img/cover/4.webp
4|
5|title: cmake 基础课
6|date: 2023-09-03 17:50:19
7|categories:
8|  - 编程语言
9|link: 编程语言/01 cmake-基础课
10|---
11|
12|# 一、准备知识
13|
14|## 1.1 C++的编译过程
15|
16|- -E 仅预处理；不编译、汇编或链接。
17|- -S 仅编译；不汇编或链接。
18|- -c 编译和汇编，但不链接。
19|- -o <file> 将输出放入<file>中。
20|
21|**C++源代码的编译过程**
22|
23|1. **预处理**：在预处理阶段，C++源代码中的预处理指令会被处理，包括宏展开和条件编译等。在此阶段，需要添加所有头文件的引用路径。
24|
25|   ~~~shell
26|   # 将xx.cpp源文件预处理为xx.i文件（文本文件）
27|   g++ -E main.cpp -o main.i
28|   ```
29|   ~~~
30|
31|2. **编译**：编译阶段会对预处理后的代码进行语法检查和编译，将代码翻译为汇编语言文件。
32|
33|   ~~~shell
34|   # 将xx.i文件编译为xx.s的汇编文件（文本文件）
35|   g++ -S main.i -o main.s
36|   ```
37|   ~~~
38|
39|3. **汇编**：汇编阶段将汇编语言文件转换为二进制格式的目标文件。
40|
41|   ~~~shell
42|   # 将xx.s文件汇编为xx.o的二进制目标文件
43|   g++ -c main.s -o main.o
44|   ```
45|   ~~~
46|
47|4. **链接**：链接阶段将目标文件与所依赖的库文件进行关联或组装，生成可执行文件。
48|
49|   ~~~shell
50|   # 将目标文件进行链接，生成可执行程序
51|   g++ main.o -o main
52|   ```
53|   ~~~
54|
55|## 1.2 静态链接库和动态链接库
56|
57|静态链接库和动态链接库的区别在于链接的阶段不同。
58|
59|**静态链接库**的名称通常以`.a`结尾（表示archive library），它在编译阶段进行链接。如果一个工程依赖于静态链接库，那么生成的可执行文件或库会将静态链接库`.a`打包到输出文件中，因此生成的文件比较大。在运行时，不再需要单独的库文件。
60|
61|**动态链接库**的链接发生在程序的执行过程中，它在编译阶段仅进行链接检查，而不进行真正的链接过程。动态链接库的后缀名通常为`.so`（表示shared object，在Linux上）或`.dylib`（在macOS上）。动态链接库在加载后，在内存中只保存一份拷贝。多个程序依赖于它时，不会重复加载和拷贝，节省了内存空间。
62|
63|![image-20230903175645024](https://chai-1301855619.cos.ap-beijing.myqcloud.com/image-20230903175645024.png)
64|
65|
66|
67|## 1.3 为什么需要CMake
68|
69|### 1.3.1 g++命令行编译
70|
71|当编译hello_world.cpp`文件时，可以使用以下命令进行编译和运行：
72|
73|```shell
74|g++ main.cpp -o main
75|```
76|
77|如果需要引入外部库可以使用以下方法进行编译：
78|
79|方法一：使用`-lgflags`参数进行链接**
80|
81|首先，需要安装`gflags`库：
82|
83|~~~shell
84|sudo apt-get install libgflags-dev libgflags2.2
85|```
86|
87|然后，使用以下命令进行编译：
88|
89|````bash
90|g++ main.cpp -lgflags -o main
91|```
92|~~~
93|
94|方法二：使用`pkg-config`进行库文件和头文件路径查找**
95|
96|首先，需要安装`pkg-config`工具：
97|
98|~~~shell
99|sudo apt-get install pkg-config
100|```
101|
102|然后，使用以下命令进行编译：
103|
104|````bash
105|g++ main.cpp `pkg-config --cflags --libs gflags` -o main
106|```
107|
108|这里，`pkg-config --cflags --libs gflags`命令用于查找`gflags`库的头文件和库文件路径。
109|~~~
110|
111|编译完成后，可以使用以下命令运行可执行文件：
112|
113|```shell
114|./main --age 31 --name alice
115|```
116|
117|有时候，在编译时不需要手动添加头文件或链接库路径，因为`g++`可以在默认的查询路径中找到这些库。然而，当项目文件和引入的外部库变得较多时，使用命令行编译会变得冗长且不便于调试和编辑。通常，在测试单个文件时可以使用命令行编译，但不推荐在实际项目中使用命令行编译方式。
118|
119|### 1.3.2 CMake简介
120|
121|在实际工作中，推荐使用CMake来构建C++项目。CMake是一个开源的跨平台工具，用于构建、测试和软件打包。
122|
123|CMake具有以下特性：
124|
125|- **自动搜索依赖项**：CMake具有自动搜索可能需要的程序、库和头文件的能力，可以简化依赖项的配置过程。
126|- **独立的构建目录**：CMake支持使用独立的构建目录（例如`build`目录），这样可以安全地清理构建产生的中间文件和输出文件，不会污染源代码目录。
127|- **自定义命令**：CMake支持定义复杂的自定义命令，例如下载文件、生成各种文件等，可以满足项目构建过程中的特定需求。
128|- **自定义配置**：CMake支持根据需求进行自定义配置，可以选择性地启用或禁用特定的组件或功能。
129|- **文本文件生成工作区和项目**：CMake使用简单的文本文件（`CMakeLists.txt`）来描述项目的配置和构建规则，可以根据这些文件自动生成工作区和项目。
130|- **文件依赖项自动生成和并行构建**：CMake可以在主流平台上自动生成文件之间的依赖关系，从而使构建过程更高效。同时，CMake支持并行构建，可以加快构建速度。
131|- **支持多种IDE**：CMake几乎支持所有主流的集成开发环境（IDE），包括Visual Studio、Xcode、Eclipse等，可以方便地在不同的开发环境中进行项目开发和调试。
132|
133|# 二、CMake基础知识
134|
135|## 2.1 安装
136|
137|在Ubuntu上安装CMake可以使用以下命令：
138|
139|```shell
140|sudo apt install cmake -y
141|```
142|
143|这将使用apt包管理器自动安装CMake。
144|
145|如果你想编译安装特定版本的CMake，可以按照以下步骤操作：
146|
147|克隆CMake的源代码库：
148|
149|```shell
150|git clone -b v3.25.1 https://github.com/Kitware/CMake.git
151|cd CMake
152|
153|这里以安装版本3.25.1为例，你可以将`v3.25.1`替换为你想要安装的特定版本。
154|```
155|
156|配置和编译CMake：
157|
158|```shell
159|./bootstrap --prefix=<安装路径>
160|make
161|
162|你可以使用`--prefix`选项来指定安装路径，或者省略`--prefix`以安装到默认路径。
163|```
164|
165|安装CMake：
166|
167|```shell
168|sudo make install
169|
170|这将以管理员权限安装CMake到系统中。
171|```
172|
173|安装完成后，你可以验证CMake的安装版本：
174|
175|```shell
176|cmake --version
177|```
178|
179|该命令将显示CMake的版本信息，确认安装成功与否。
180|
181|## 2.2 第一个CMake例子
182|
183|**配置：** 使用`cmake`命令进行配置，其中`-S`选项指定源码目录，`-B`选项指定构建目录。在终端中执行以下命令：
184|
185|```
186|cmake -S . -B build
187|
188|这将在当前目录下执行CMake配置，并将生成的构建系统文件放在名为`build`的目录中。
189|```
190|
191|**生成：** 使用`cmake --build`命令进行生成，其中`--build`选项指定构建目录。在终端中执行以下命令：
192|
193|```
194|cmake --build build
195|
196|这将在`build`目录中执行构建步骤，生成可执行文件。
197|```
198|
199|**运行：** 使用以下命令运行生成的可执行文件：
200|
201|```
202|./build/first_cmake
203|
204|这将执行生成的可执行文件。
205|```
206|
207|## 2.3 语法基础
208|
209|### 2.3.1 指定版本
210|
211|在CMake中，可以使用`cmake_minimum_required`命令指定当前项目所需的最低CMake版本。它的语法如下：
212|
213|```cmake
214|cmake_minimum_required(VERSION <version_number>)
215|```
216|
217|其中，`<version_number>`是所需的最低CMake版本号。在这个命令之后，CMake将会检查系统中安装的CMake版本是否满足这个要求，如果不满足则会产生错误。
218|
219|例如，如果要指定最低的CMake版本为3.10，可以在CMakeLists.txt文件中添加以下命令：
220|
221|```cmake
222|cmake_minimum_required(VERSION 3.10)
223|```
224|
225|这样，CMake将会检查系统中的CMake版本是否大于等于3.10。
226|
227|除了`cmake_minimum_required`命令，CMake中还有其他类似的命令，它们不区分大小写，并且有许多关键字来引导命令的参数输入，类似于函数的参数传递。这些命令使用的关键字在CMake中是不区分大小写的。
228|
229|### 2.3.2 设置项目
230|
231|在CMakeLists.txt文件的开头，通常会使用`project`命令来指定项目的名称、版本、描述和所使用的语言。`project`命令的语法如下：
232|
233|```cmake
234|project(ProjectName
235|    [VERSION <version_number>]
236|    [DESCRIPTION "project_description"]
237|    [LANGUAGES <language>]
238|)
239|```
240|
241|其中，`ProjectName`是项目的名称，在例子中使用的是"first_cmake"。`VERSION`关键字后面是项目的版本号，可以是任意格式的版本号，例如"1.0.0"。`DESCRIPTION`关键字后面是项目的描述，可以是一个字符串。`LANGUAGES`关键字后面是项目所使用的语言，这里使用的是"Cxx"，表示C++。
242|
243|示例中的`project`命令：
244|
245|```cmake
246|project(first_cmake
247|    VERSION 1.0.0
248|    DESCRIPTION "项目描述"
249|    LANGUAGES Cxx
250|)
251|```
252|
253|这样，通过`project`命令，可以在CMakeLists.txt中指定项目的基本信息，方便管理和描述项目。
254|
255|### 2.3.3 添加可执行文件目标
256|
257|使用了`add_executable`命令来定义一个可执行文件。该命令的语法如下：
258|
259|```cmake
260|add_executable(<target_name> <source_files>)
261|```
262|
263|其中，`<target_name>`是最终生成的可执行文件名，也是在CMake中定义的目标（Target）名。`<source_files>`是编译目标所使用的源文件。
264|
265|在你提供的例子中，使用了`add_executable`命令来定义一个名为`first_cmake`的目标，并指定了一个源文件`main.cpp`。这意味着在编译时，会将`main.cpp`编译为一个可执行文件，该文件的名称将是`first_cmake`。
266|
267|示例中的`add_executable`命令：
268|
269|```cmake
270|add_executable(first_cmake main.cpp)
271|```
272|
273|通过`add_executable`命令，可以在CMakeLists.txt中定义编译目标，并指定相应的源文件。这样，CMake将会根据这些定义生成相应的构建规则和编译指令。
274|
275|### 2.3.4 生成静态库并链接
276|
277|A. 生成静态库：
278|
279|在`account_dir/CMakeLists.txt`中，使用`add_library`命令来生成静态库。该命令的语法如下：
280|
281|```
282|add_library(<library_name> <library_type> <source_files>)
283|```
284|
285|其中，`<library_name>`是最终生成的库文件名，例如在Linux下会生成`libAccount.a`。
286|
287|`<library_type>`用于指定链接库的类型，可以是动态链接库（`SHARED`）或静态链接库（`STATIC`）。
288|
289|`<source_files>`是需要用到的源文件。
290|
291|例如，在`account_dir/CMakeLists.txt`中，使用`add_library`命令生成一个名为`Account`的静态库，其包含了`Account.cpp`和`Account.h`两个源文件。示例命令如下：
292|
293|```cmake
294|add_library(Account STATIC Account.cpp Account.h)
295|```
296|
297|这将生成一个静态库文件`libAccount.a`。
298|
299|B. 链接：
300|
301|在`test_account/CMakeLists.txt`中，可以通过`target_link_libraries`命令将生成的静态库链接到目标可执行文件中。该命令的语法如下：
302|
303|```cmake
304|target_link_libraries(<target_name> <library_name>)
305|```
306|
307|其中，`<target_name>`是目标可执行文件的名称，`<library_name>`是要链接的库文件名。
308|
309|例如，在`test_account/CMakeLists.txt`中，假设有一个目标可执行文件名为`test_account`，需要链接生成的静态库`Account`。示例命令如下：
310|
311|```cmake
312|target_link_libraries(test_account Account)
313|```
314|
315|这样，生成的可执行文件`test_account`将会链接静态库`Account`。
316|
317|### 2.3.5 生成动态库并连接
318|
319|A. 生成动态库：
320|
321|在`account_dir/CMakeLists.txt`中，使用`add_library`命令来生成动态库。与生成静态库不同的是，需要将`<library_type>`参数设置为`SHARED`，表示生成动态链接库。
322|
323|示例命令如下：
324|
325|```cmake
326|add_library(Account SHARED Account.cpp Account.h)
327|```
328|
329|这将生成一个动态库文件`libAccount.so`。
330|
331|B. 链接：
332|
333|链接过程与生成静态库时的操作相同，使用`target_link_libraries`命令将动态库链接到目标可执行文件中。
334|
335|示例命令如下：
336|
337|```cmake
338|target_link_libraries(test_account Account)
339|```
340|
341|这样，生成的可执行文件`test_account`将会链接动态库`Account`。
342|
343|### 2.3.6 CMake中的PUBLIC、PRIVATE、INTERFACE
344|
345|在CMake中，可以使用`target_...()`系列命令来操作目标（Target）。这些命令通常支持通过`PUBLIC`、`PRIVATE`、`INTERFACE`关键字来控制属性的传播。
346|
347|以`target_link_libraries(A B)`为例，下面是对这些关键字的理解：
348|
349|- `PRIVATE`：依赖项B仅链接到目标A。如果有目标C链接了目标A，目标C不会链接目标B。
350|- `INTERFACE`：依赖项B并不链接到目标A。如果有目标C链接了目标A，目标C会链接目标B。
351|- `PUBLIC`：依赖项B链接到目标A。如果有目标C链接了目标A，目标C也会链接目标B。
352|
353|可以将其类比为一个散烟的比方：
354|
355|- `PRIVATE`：就是自己抽烟，不给别人抽。
356|- `INTERFACE`：就是自己不抽烟，给别人抽。
357|- `PUBLIC`：就是自己抽烟，也给别人抽。
358|
359|从使用的角度来看，假设有目标C链接了目标A：
360|
361|- 如果目标B仅用于目标A的实现，并且不在头文件中提供给目标C使用，可以使用`PRIVATE`。
362|- 如果目标B不用于目标A的实现，仅在头文件中作为接口给目标C使用，可以使用`INTERFACE`。
363|- 如果目标B既用于目标A的实现，也在头文件中提供给目标C使用，可以使用`PUBLIC`。
364|
365|以下是一个示例：
366|
367|```cmake
368|# 创建库
369|add_library(c c.cpp)
370|add_library(D d.cpp)
371|add_library(B b.cpp)
372|
373|# 使用target_link_libraries命令进行链接
374|target_link_libraries(A PRIVATE B)
375|target_link_libraries(A INTERFACE C)
376|target_link_libraries(A PUBLIC D)
377|```
378|
379|在上述示例中，目标`A`通过`target_link_libraries`命令链接了目标`B`、`C`和`D`，使用了不同的传播属性。具体属性的选择取决于目标之间的关系和使用需求。
380|
381|### 2.3.7 变量
382|
383|在CMake中，你可以使用`message`命令输出消息并进行变量的操作和设置。
384|
385|以下是一些常见的用法：
386|
387|1.输出消息：使用`message`命令可以输出消息到CMake的输出。
388|
389|```cmake
390|message("输出消息")
391|```
392|
393|2.消息拼接：使用`message`命令可以将多个消息进行拼接输出。
394|
395|```cmake
396|message("输出1" "输出2" "输出3")  # 会进行拼接输出
397|```
398|
399|3.设置变量：使用`set`命令可以设置变量的值。
400|
401|```cmake
402|set(VAR1 "变量1")
403|message("VAR1=" ${VAR1})  # 外部访问
404|message("输出变量VAR1:${VAR1}")  # 内部拼接
405|message("\${VAR1}=${VAR1}")  # 使用\转义
406|```
407|
408|4.删除变量：使用`unset`命令可以删除变量。
409|
410|```cmake
411|unset(VAR1)  # 删除变量
412|message("\${VAR1}=${VAR1}")  # 删除变量后，输出为空
413|```
414|
415|5.设置变量缓存：使用`set`命令的`CACHE`选项可以设置一个变量的缓存，可以通过命令行的`-D`参数来修改该变量的值。
416|
417|```cmake
418|set(CACHE_VARIABLE_TEST "原始值" CACHE STRING "变量缓存的描述")
419|message("变量缓存的值:${CACHE_VARIABLE_TEST}")
420|```
421|
422|6.常见的内置变量：CMake提供了一些内置的变量，用于获取构建系统的信息和配置
423|
424|第一类: 提供信息的变量
425|
426|- `PROJECT_NAME`：项目名称，表示当前CMake项目的名称。
427|
428|```cmake
429|message("${PROJECT_NAME}")
430|```
431|
432|- `CMAKE_SOURCE_DIR`：源码目录，表示当前CMake项目的根源码目录。
433|
434|```cmake
435|message("${CMAKE_SOURCE_DIR}")
436|```
437|
438|- `CMAKE_BINARY_DIR`：编译目录，表示当前CMake项目的编译输出目录。
439|
440|```cmake
441|message("${CMAKE_BINARY_DIR}")
442|```
443|
444|- `CMAKE_CURRENT_LIST_FILE`：当前CMakeLists.txt文件路径，表示当前正在处理的CMakeLists.txt文件的完整路径。
445|
446|```cmake
447|message("${CMAKE_CURRENT_LIST_FILE}")
448|```
449|
450|这些变量提供了与项目、目录结构和文件相关的信息。
451|
452|----------
453|
454|第二类: 控制CMake运行的变量
455|
456|CMake中的变量通常是根据构建选项进行命名的，例如`BUILD_SHARED_LIBS`。这些变量用于控制CMake的运行和构建过程。
457|
458|-----------
459|
460|第三类: 描述系统的变量
461|
462|- `WIN32`：表示当前操作系统是否为Windows。
463|
464|```cmake
465|message("是否是Windows系统: ${WIN32}")
466|```
467|
468|- `UNIX`：表示当前操作系统是否为类Unix（包括Linux、macOS等）。
469|
470|```cmake
471|message("是否是Unix系统: ${UNIX}")
472|```
473|
474|- `CMAKE_SYSTEM_NAME`：系统名称，表示当前操作系统的名称。
475|
476|```cmake
477|message("系统名称: ${CMAKE_SYSTEM_NAME}")
478|```
479|
480|这些变量用于描述当前操作系统的一些信息，以便在构建过程中进行条件判断和配置。
481|
482|### 2.3.8 include引入其他代码
483|
484|### 2.3.9 条件控制
485|
486|CMake提供了条件控制的语法和关键词，使得你可以根据条件来控制构建过程中的行为。以下是一些常用的条件控制关键词和语法：
487|
488|- `if (variable)`：当变量的值为真时，执行相应的代码块。
489|
490|```cmake
491|if (MY_VARIABLE)
492|    # 当MY_VARIABLE为真时执行的代码块
493|endif()
494|```
495|
496|- `else()`：在if条件为假时执行的代码块。
497|
498|```cmake
499|if (MY_VARIABLE)
500|    # 当MY_VARIABLE为真时执行的代码块
501|