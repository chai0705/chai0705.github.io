---
title: repo学习
date: 2024-01-01 00:00:00
categories:
  - 编程语言
link: 编程语言/11_repo学习
---

1|---
2|title: repo学习
3|date: 2024-01-01 00:00:00
4|categories:
5|  - 编程语言
6|link: 编程语言/11_repo学习
7|---
8|
9|1|1|---
10|2|2|description: "> 说一下前因后果，之前学了一段时间的git，但是无论如何也没用起来，这一点让我很是不爽,为了实现能常用git我甚至还搞了一个完全的Linux系统，但还是没有用起来，这还是让我很不爽，最近开始研究野火的SDK了，发现野火是用repo来进行代码管理的，其实更上层的瑞芯微也是这样管理代码的，但我们也不知"
11|3|3|cover: /img/cover/1.webp
12|4|4|
13|5|5|title: repo的学习
14|6|6|date: 2024-08-19 06:50:19
15|7|7|categories:
16|8|8|  - 编程语言
17|9|9|link: 工具配置/11_repo学习
18|10|10|---
19|11|11|
20|12|12|> 说一下前因后果，之前学了一段时间的git，但是无论如何也没用起来，这一点让我很是不爽,为了实现能常用git我甚至还搞了一个完全的Linux系统，但还是没有用起来，这还是让我很不爽，最近开始研究野火的SDK了，发现野火是用repo来进行代码管理的，其实更上层的瑞芯微也是这样管理代码的，但我们也不知道为了什么起见，可能对应的客户不同吧，就一个板子一套镜像，我认为这是有问题的，但我并没有什么话语权，只能听安排，但是我可以自己维护一个主线，我甚至可以搞一个千兆的宽带，这一点在理，但让我搞一个新机器我又不愿意，这个以后再说，先来研究理论基础。
21|13|13|
22|14|14|# repo理论基础
23|15|15|
24|16|16|## repo是什么？
25|17|17|
26|18|18|**Repo是一个高级的版本库管理工具，主要用于管理Android项目的多个Git仓库**。下面将非常详细地讲解Repo的各个方面：
27|19|19|
28|20|20|1. **起源与用途**：
29|21|21|   - Repo是由Google开发并广泛使用于Android开源项目（AOSP）中的工具。
30|22|22|   - 它旨在简化对包含多个Git仓库的大型项目的管理工作。
31|23|23|   - 在Android项目中，Repo帮助开发者同步、管理和更新分布在多个Git仓库中的代码。
32|24|24|2. **核心功能与特点**：
33|25|25|   - **仓库管理**：Repo能够初始化一个仓库清单（manifest），该清单描述了项目所需的所有Git仓库的位置和分支信息。
34|26|26|   - **同步操作**：通过`repo sync`命令，Repo可以自动地克隆或更新所有列在清单中的Git仓库。
35|27|27|   - **分支管理**：Repo支持在多个仓库之间切换分支，确保整个项目的一致性。
36|28|28|   - **状态查看**：使用`repo status`可以查看所有仓库的当前状态，包括哪些文件被修改、新增或删除。
37|29|29|   - **上传与审查**：Repo集成了Git的上传（`git push`）和代码审查（Gerrit）的功能，便于开发者提交更改并进行代码审查。
38|30|30|3. **工作原理**：
39|31|31|   - Repo本身是一个Python脚本，它利用Git命令来管理多个Git仓库。
40|32|32|   - 当Repo初始化一个项目时，它会首先克隆一个特殊的Git仓库（通常称为manifest仓库），该仓库包含了项目的manifest文件。
41|33|33|   - Manifest文件是一个XML文件，它定义了项目中所有其他Git仓库的位置、分支和复制条件。
42|34|34|   - 随后，Repo根据manifest文件的信息，逐一克隆或更新每个Git仓库到本地工作目录。
43|35|35|4. **优势**：
44|36|36|   - **简化管理**：对于包含数百个Git仓库的大型项目来说，手动管理这些仓库将非常繁琐且容易出错。Repo提供了自动化的管理工具，大大简化了这一过程。
45|37|37|   - **保持一致性**：Repo确保所有仓库都按照manifest文件的规定处于正确的分支和版本，从而保证了整个项目的一致性。
46|38|38|   - **提高开发效率**：通过集成代码上传和审查的功能，Repo帮助开发者更快地完成开发流程。
47|39|39|5. **使用场景**：
48|40|40|   - Repo特别适用于大型、复杂且包含多个相互依赖的组件或模块的项目。
49|41|41|   - 在Android开源项目中，Repo是不可或缺的工具，用于管理数以百计的Git仓库。
50|42|42|   - 类似的项目，如Chrome OS和Linux内核项目，也可能使用Repo或其类似工具来管理多个Git仓库。
51|43|43|6. **安装与配置**：
52|44|44|   - Repo通常需要通过特定的脚本来安装，因为它本身是一个Python脚本。
53|45|45|   - 安装后，需要通过Repo的`init`命令来初始化一个项目，该命令会克隆manifest仓库并设置项目的本地环境。
54|46|46|   - 配置Repo通常涉及编辑manifest文件，以更改项目的仓库列表、分支和复制条件。
55|47|47|
56|48|48|通过以上详细的讲解，你应该对Repo有了全面而深入的理解。Repo是一个强大的工具，它简化了大型项目中多个Git仓库的管理，提高了开发效率和项目一致性。
57|49|49|
58|50|50|## repo的安装
59|51|51|
60|52|52|repo 其实就是个python脚本，所以只需要拉取下来放到某个路径就好了，但在此之前需要先安装git，git的安装方法不再讲解，可以看前面的文档。
61|53|53|
62|54|54|```
63|55|55|wget https://storage.googleapis.com/git-repo-downloads/repo .
64|56|56|wget https://raw.githubusercontent.com/esrlabs/git-repo/stable/repo .
65|57|57|```
66|58|58|
67|59|59|![image-20240817170916119](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043063.png)image-20240817170916119
68|60|60|
69|61|61|然后赋予可执行权限，拷贝到/usr/bin/目录：
70|62|62|
71|63|63|![image-20240817171016635](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043962.png)image-20240817171016635
72|64|64|
73|65|65|![image-20240817171038551](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043016.png)image-20240817171038551
74|66|66|
75|67|67|## repo常用命令
76|68|68|
77|69|69|### repo常用命令
78|70|70|
79|71|71|1. **初始化repo**
80|72|72|
81|73|73|   ```
82|74|74|   repo --trace init -u https://android.googlesource.com/platform/manifest -b branch_name -m default.xml
83|75|75|   ```
84|76|76|
85|77|77|2. **同步代码**
86|78|78|
87|79|79|   ```
88|80|80|   repo sync
89|81|81|   ```
90|82|82|
91|83|83|3. **上传代码到远程仓库**
92|84|84|
93|85|85|   ```
94|86|86|   COPYrepo upload dev
95|87|87|   ```
96|88|88|
97|89|89|4. **列出分支**
98|90|90|
99|91|91|   ```
100|92|92|   COPYrepo branch  # 或者 repo branches
101|93|93|   ```
102|94|94|
103|95|95|5. **状态查询**
104|96|96|
105|97|97|   ```
106|98|98|   COPYrepo status
107|99|99|   ```
108|100|100|
109|101|101|6. **查看修改**
110|102|102|
111|103|103|   ```
112|104|104|   COPYrepo diff
113|105|105|   ```
114|106|106|
115|107|107|7. **撤销整个工程的本地修改**
116|108|108|
117|109|109|   ```
118|110|110|   COPYrepo forall -c 'git reset --hard HEAD; git clean -df; git rebase --abort'
119|111|111|   ```
120|112|112|
121|113|113|8. **切换整个工程模块的分支**
122|114|114|
123|115|115|   ```
124|116|116|   COPYrepo forall -c 'git branch master'
125|117|117|   ```
126|118|118|
127|119|119|9. **更新整个工程模块的代码**
128|120|120|
129|121|121|   ```
130|122|122|   COPYrepo forall -c 'git pull projectname'
131|123|123|   ```
132|124|124|
133|125|125|### repo与git命令对照表
134|126|126|
135|127|127|| repo命令      | 等同git命令             | 备注             |
136|128|128|| ------------- | ----------------------- | ---------------- |
137|129|129|| repo init -u  | 无                      | 初始化           |
138|130|130|| repo sync     | git pull                | 同步代码         |
139|131|131|| repo upload   | git push                | 上传代码         |
140|132|132|| repo forall   | 无                      | 多仓执行         |
141|133|133|| repo start    | git checkout -b         | 创建并切换分支   |
142|134|134|| repo checkout | git checkout            | 切换分支         |
143|135|135|| repo status   | git status              | 状态查询         |
144|136|136|| repo branches | git branch              | 分支查询         |
145|137|137|| repo diff     | git diff                | 文件对比         |
146|138|138|| repo prune    | git remote prune origin | 删除合并分支     |
147|139|139|| repo stage –i | git add --interactive   | 添加文件到暂存区 |
148|140|140|| repo abandon  | git branch -D           | 删除分支         |
149|141|141|| repo version  | 无                      | 查看版本号       |
150|142|142|
151|143|143|### repo 脚本参数
152|144|144|
153|145|145|- `--repo-url=URL`: repo 工具本身的 git 库地址。缺省为：`git://android.git.kernel.org/tools/repo.git`
154|146|146|- `--repo-branch=REVISION`: 使用repo的版本库，即repo git库的分支或者里程碑名称。缺省为`caf-stable`
155|147|147|- `--no-repo-verify`: 设定不要对repo的里程碑签名进行严格的验证。
156|148|148|- `-u` 或 `--manifest-url`: 设定清单库的Git服务器地址。
157|149|149|- `-b` 或 `--manifest-branch`: 检出清单库的特定分支。
158|150|150|- `--mirror`: 只在repo第一次初始化的时候使用，建立本地镜像。
159|151|151|- `-m` 或 `--manifest-name`: 指定清单库中的某个清单为有效的清单文件。默认为`default.xml`。
160|152|152|- `--no-tags`: 不获取标签（tags）。
161|153|153|- `--trace`: 显示repo命令的执行过程。
162|154|154|
163|155|155|### repo help
164|156|156|
165|157|157|- `repo help`：查看 `repo` 的帮助文档。
166|158|158|- `repo help sync`：查看 `sync` 命令的帮助文档。
167|159|159|
168|160|160|### repo init
169|161|161|
170|162|162|- `repo init` 主要用于初始化 `repo` 工具，执行的 `repo` 脚本是一个引导工具，而非下载代码的脚本。
171|163|163|- 该命令会克隆 `manifest.git` 到 `.repo/manifests/` 目录下（地址由 `-u` 参数指定），并在 `.repo/` 目录中生成符号链接 `manifest.xml`，指向 `.repo/manifests/default.xml`。
172|164|164|- 如果 `.repo/manifests/` 目录中有多个 `xml` 文件，可通过 `repo init -m` 参数指定要使用的 `manifest` 文件，默认是 `default.xml`。
173|165|165|
174|166|166|**示例：**
175|167|167|
176|168|168|```
177|169|169|COPYbash
178|170|170|复制代码
179|171|171|repo --trace init -u https://android.googlesource.com/platform/manifest -b branch_name -m default.xml && repo sync && repo start branch_name --all
180|172|172|```
181|173|173|
182|174|174|- `--trace`：查看 `repo` 背后的具体操作。
183|175|175|- `-u`：指定 `Manifest` 库的 Git 访问路径。
184|176|176|- `-m`：指定使用的 `Manifest` 文件。
185|177|177|- `-b`：指定使用 `Manifest` 仓库中的某个特定分支。
186|178|178|
187|179|179|**初始化完成后生成的 `.repo` 目录结构：**
188|180|180|
189|181|181|```
190|182|182|COPYbash复制代码tree .repo -L 1
191|183|183|.repo
192|184|184|├── manifest.xml -> manifests/default.xml
193|185|185|├── manifests
194|186|186|├── manifests.git
195|187|187|├── project-objects
196|188|188|├── project.list
197|189|189|├── projects
198|190|190|└── repo
199|191|191|```
200|192|192|
201|193|193|**各文件夹的用途：**
202|194|194|
203|195|195|- `manifests`：清单文件的仓库。
204|196|196|- `manifests.git`：清单文件的 Git 裸仓库，不带工作区。
205|197|197|- `manifest.xml`：符号链接，指向用于初始化工作区的清单文件。
206|198|198|- `project.list`：包含所有项目名称的列表。
207|199|199|- `projects`：包含所有 `git project` 的裸仓库，文件夹的层次结构与工作区布局一致。
208|200|200|- `repo`：`repo` 命令的主体，推荐使用其中的 `repo` 命令。
209|201|201|
210|202|202|### repo sync
211|203|203|
212|204|204|- **首次运行**：相当于 `git clone`，会将服务器的内容完全拷贝到本地。
213|205|205|- **后续运行**：若项目已同步，则相当于执行 `git remote update && git rebase origin/<branch>`。
214|206|206|
215|207|207|`repo sync` 不会更新 `.repo/repo` 仓库。
216|208|208|
217|209|209|**参数说明：**
218|210|210|
219|211|211|- `-j`：开启多线程同步，加快同步速度，默认使用4个线程。
220|212|212|- `-c, --current-branch`：仅同步指定的远程分支，默认同步所有远程分支。
221|213|213|- `-d, --detach`：脱离当前本地分支，切换到 `manifest.xml` 中设定的分支。第一次 `sync` 后通常会切换到 `dev` 分支开发，若不带此参数，可能导致本地 `dev` 分支与 `manifest` 远程分支合并，可能引发同步失败。
222|214|214|- `-f, --force-broken`：当某些 `git` 库同步失败时，不中断同步操作，继续同步其他 `git` 库。
223|215|215|
224|216|216|### repo upload
225|217|217|
226|218|218|- 类似于 `git push`。
227|219|219|- **用法**：`repo upload [--re --cc] [项目列表]`
228|220|220|- 若无参数，`repo upload` 会搜索所有项目中的更改以进行上传。
229|221|221|
230|222|222|### repo start
231|223|223|
232|224|224|- `repo start` 是 `git checkout -b` 的封装，但 `repo start` 是基于 `manifest` 中设定的分支创建特性分支。
233|225|225|
234|226|226|**示例：**
235|227|227|
236|228|228|- `repo start stable --all`：假设 `manifest` 文件中设定的分支为 `gingerbread-stable`，则会在所有项目上基于该分支创建特性分支 `stable`。
237|229|229|- `repo start stable platform/build platform/bionic`：可以指定项目。
238|230|230|
239|231|231|### repo forall
240|232|232|
241|233|233|- `repo forall [<PROJECT_LIST>] -c <COMMAND>`：在每个项目中运行指定的 Shell 命令。
242|234|234|
243|235|235|**可用的环境变量：**
244|236|236|
245|237|237|- `REPO_PROJECT`：项目的唯一名称。
246|238|238|- `REPO_PATH`：客户端根目录的相对路径。
247|239|239|- `REPO_REMOTE`：清单中远程系统的名称。
248|240|240|- `REPO_LREV`：清单中的修订版本名称，已转换为本地跟踪分支。
249|241|241|- `REPO_RREV`：清单中的修订版本名称，与清单中的名称一致。
250|242|242|
251|243|243|**常用参数：**
252|244|244|
253|245|245|- `-c`：运行指定的命令。
254|246|246|- `-p`：输出命令结果前显示项目标头。
255|247|247|- `-v`：显示命令向 `stderr` 写入的消息。
256|248|248|
257|249|249|### manifest 文件
258|250|250|
259|251|251|- `manifest` 文件是 `repo` 工具的核心，记录所有 `git` 仓库的地址和分支。
260|252|252|- 官方文档参考：[manifest 文件格式](https://github.com/GerritCodeReview/git-repo/blob/main/docs/manifest-format.md)。
261|253|253|
262|254|254|**manifest 文件示例：**
263|255|255|
264|256|256|```
265|257|257|COPY<?xml version="1.0" encoding="UTF-8"?>
266|258|258|<manifest>
267|259|259|    <remote />
268|260|260|    <default remote="origin" revision="master" sync-j="4" />
269|261|261|    <project />
270|262|262|    <project />
271|263|263|    <project />
272|264|264|</manifest>
273|265|265|```
274|266|266|
275|267|267|**元素说明：**
276|268|268|
277|269|269|- `remote`：指定使用 `repo upload` 时提交到哪个服务器，可定义一个或多个 `remote`。
278|270|270|- default：包含一些缺省属性，如果 project中未指定，则使用这些属性。
279|271|271|  - `revision`：Git 分支的名称，可为 `branch`、`tag` 或 `commit id`。
280|272|272|  - `sync-j`：同步时并行任务数。
281|273|273|  - `sync-c`：为 `true` 时，仅同步 `project` 中指定的分支。
282|274|274|- project：定义一个或多个 git 仓库。
283|275|275|  - `name`：`git project` 的名字。
284|276|276|  - `path`：本地工作区路径。
285|277|277|  - `revision`：与 `default` 标签中的 `revision` 含义相同。
286|278|278|
287|279|279|# repo实际用法
288|280|280|
289|281|281|> 我之前只用过野火的repo，今天就继续用野火的repo，使用一下
290|282|282|
291|283|283|```
292|284|284|COPY# 创建目录
293|285|285|mkdir ~/LubanCat_SDK
294|286|286|
295|287|287|cd ~/LubanCat_SDK
296|288|288|
297|289|289|# 配置姓名和邮箱
298|290|290|git config --global user.email "you@example.com"
299|291|291|git config --global user.name "Your Name"
300|292|292|  
301|293|293|# 拉取LubanCat-RK356x系列Linux_SDK
302|294|294|repo init --depth=1 -u https://github.com/LubanCat/manifests.git -b linux -m rk356x_linux_release.xml
303|295|295|
304|296|296|
305|297|297|# 拉取LubanCat-RK3588系列Linux_SDK
306|298|298|repo init --depth=1 -u https://github.com/LubanCat/manifests.git -b linux -m rk3588_linux_release.xml
307|299|299|
308|300|300|#如果运行以上命令失败，提示：fatal: Cannot get https://gerrit.googlesource.com/git-repo/clone.bundle
309|301|301|#则可以在以上命令中添加选项 --repo-url https://mirrors.tuna.tsinghua.edu.cn/git/git-repo
310|302|302|```
311|303|303|
312|304|304|![image-20240819093048396](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043976.png)image-20240819093048396
313|305|305|
314|306|306|> - `repo init`: 初始化 Repo 客户端。
315|307|307|> - `--depth=1`: 进行浅克隆（shallow clone），即只克隆最近的提交历史。这可以加速克隆过程，因为你不会获取整个项目的历史记录，只会获取最近的提交。这对于大型项目特别有用，可以节省时间和带宽。
316|308|308|> - `-u https://github.com/LubanCat/manifests.git`: 指定清单仓库（manifest repository）的 URL。这是包含项目清单文件的 Git 仓库，清单文件定义了项目中包含的所有其他仓库。
317|309|309|> - `-b linux`: 指定要检出的分支名。在这个例子中，`linux` 是清单仓库中的一个分支名，该分支包含了特定于该项目的清单文件。
318|310|310|> - `-m rk3588_linux_release.xml`: 指定要使用的清单文件名。在这个例子中，`rk3588_linux_release.xml` 是清单仓库中的一个文件，它定义了项目的具体结构和配置。
319|311|311|>
320|312|312|> 这个命令的作用是初始化一个 Repo 工作环境，从指定的 URL 克隆清单仓库的 `linux` 分支，并使用 `rk3588_linux_release.xml` 清单文件来配置项目。这个清单文件将包含项目中所有其他 Git 仓库的信息，以及这些仓库应该如何被检出和配置。在 `repo init` 完成之后，你通常会使用 `repo sync` 命令来同步（即克隆或更新）清单文件中定义的所有仓库。
321|313|313|
322|314|314|```
323|315|315|.repo/repo/repo sync -c -j20
324|316|316|```
325|317|317|
326|318|318|![image-20240819100404978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043968.png)image-20240819100404978
327|319|319|
328|320|320|这个命令主要做了以下几件事情：
329|321|321|
330|322|322|1. **同步代码**：`repo sync` 命令的主要目的是从远程仓库同步代码到本地。它会拉取所有在 `manifest` 文件中定义的项目的最新代码。
331|323|323|2. **-c 选项**：这个选项表示只同步当前分支。也就是说，它只会同步 manifest 文件中定义的当前分支的最新代码，而不会同步其他分支的代码。
332|324|324|3. **-j20 选项**：这个选项指定了同步过程中的并发任务数。`-j20` 表示会同时运行 20 个任务来同步代码，这可以加速同步过程，但也可能增加网络和 CPU 的负载。你需要根据你的机器和网络环境来合理设置这个值。
333|325|325|
334|326|326|同步完成之后如下图所示：
335|327|327|![image-20240819100736704](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043001.png)image-20240819100736704
336|328|328|
337|329|329|而实际的代码同步凭靠的是这个rk3588_linux5.10_stable.xml文件，该文件的内容如下所示：
338|330|330|
339|331|331|```
340|332|332|COPY<?xml version="1.0" encoding="UTF-8"?>
341|333|333|<manifest>
342|334|334|  <!-- <remote name="origin" fetch="ssh://git@gitlab.ebf.local/rockchip/linux/"/> -->
343|335|335|  <remote name="origin" fetch="https://github.com/LubanCat"/>  
344|336|336|
345|337|337|  <default remote="origin" sync-j="4"/>
346|338|338|  
347|339|339|  <project name="debian11" path="debian" revision="refs/tags/stable-5.10.160" clone-depth="1"/>
348|340|340|  <project name="device_rockchip" path="device/rockchip" revision="a85039a1513b2debd79f8e7ecc59c5cca01d1530" upstream="master" dest-branch="master">
349|341|341|    <linkfile src="common/mkfirmware.sh" dest="mkfirmware.sh"/>
350|342|342|    <linkfile src="common/build.sh" dest="build.sh"/>
351|343|343|    <linkfile src="common/rkflash.sh" dest="rkflash.sh"/>
352|344|344|    <linkfile src="rk3588" dest="device/rockchip/.target_product"/>
353|345|345|  </project>
354|346|346|  <project name="gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" path="prebuilts/gcc/linux-x86/aarch64/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" revision="adbb295a970c4b39dc487c95226fe84d2c460072" upstream="master" dest-branch="master"/>
355|347|347|  <project name="kernel" revision="4124065a2763eb8097806289b4825c8933b82efc" upstream="stable-5.10-rk3588" dest-branch="stable-5.10-rk3588"/>
356|348|348|  <project name="lubancat-bin" revision="da4446576b196334590e59a9ec4cb2a094980bdf" upstream="rk3588" dest-branch="rk3588"/>
357|349|349|  <project name="rkbin" revision="2dde28de6e47f5003683cd3a20b4243c63e6b2fb" upstream="main" dest-branch="main"/>
358|350|350|  <project name="tools" revision="210be81d659a6bc4e7a648744ae77837f394be0f" upstream="master" dest-branch="master">
359|351|351|    <linkfile src="windows/RKDevTool/RKDevTool_Release/rk3588-config.cfg" dest="tools/windows/RKDevTool/RKDevTool_Release/config.cfg"/>
360|352|352|    <linkfile src="windows/RKDevTool/rockdev/rk3588-package-file" dest="tools/windows/RKDevTool/rockdev/package-file"/>
361|353|353|    <linkfile src="windows/RKDevTool/rockdev/rk3588-mkupdate.bat" dest="tools/windows/RKDevTool/rockdev/mkupdate.bat"/>
362|354|354|    <linkfile src="linux/Linux_Pack_Firmware/rockdev/rk3588-mkupdate.sh" dest="tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh"/>
363|355|355|    <linkfile src="linux/Linux_Pack_Firmware/rockdev/rk3588-package-file" dest="tools/linux/Linux_Pack_Firmware/rockdev/package-file"/>
364|356|356|  </project>
365|357|357|  <project name="u-boot" revision="refs/tags/lbc-gen-rkr7.1" clone-depth="1"/>
366|358|358|  <project name="ubuntu" revision="refs/tags/stable-5.10-rk3588" clone-depth="1"/>
367|359|359|</manifest>
368|360|360|```
369|361|361|
370|362|362|在这个 `XML` 文件中，包含了一个 Android `repo` 工具所使用的 `manifest` 文件。它定义了多个项目的来源、分支、路径、文件链接等关键信息。下面我会详细解释这个 XML 文件的结构及各个元素的作用。
371|363|363|
372|364|364|**整体结构**
373|365|365|
374|366|366|```
375|367|367|COPY<?xml version="1.0" encoding="UTF-8"?>
376|368|368|<manifest>
377|369|369|  ...
378|370|370|</manifest>
379|371|371|```
380|372|372|
381|373|373|- `<?xml version="1.0" encoding="UTF-8"?>`: 这是 XML 文件的声明，表示该文件是 XML 1.0 版本，字符编码是 `UTF-8`。
382|374|374|- `<manifest>`: 这是 XML 文件的根元素，所有项目的配置信息都在这个根元素之内。Manifest 是 `repo` 工具的核心配置文件，用于描述多 Git 仓库如何被同步、管理。
383|375|375|
384|376|376|**元素**
385|377|377|
386|378|378|```
387|379|379|COPY<remote name="origin" fetch="https://github.com/LubanCat"/>
388|380|380|```
389|381|381|
390|382|382|- **作用**：定义远程仓库的位置。
391|383|383|
392|384|384|- **属性**：
393|385|385|
394|386|386|  - `name`: 为远程仓库命名为 `origin`，这个名字将在其他地方引用到，比如 `<default>` 和 `<project>`。
395|387|387|  - `fetch`: 指定远程仓库的 URL。在这个例子中，代码会从 `https://github.com/LubanCat` 获取。
396|388|388|
397|389|389|  > 注释 `<!-- ... -->` 表示注释掉的部分，实际上在文件解析时会被忽略。这里可以看到原本使用的是 `ssh://` 的 URL 被注释掉，改用了 `https` 的 URL。
398|390|390|
399|391|391|**`<default>` 元素**
400|392|392|
401|393|393|```
402|394|394|<default remote="origin" sync-j="4"/>
403|395|395|```
404|396|396|
405|397|397|- **作用**：设置默认的同步和远程仓库配置，适用于该清单中所有项目（除非项目本身有覆盖配置）。
406|398|398|
407|399|399|- 属性
408|400|400|
409|401|401|  ：
410|402|402|
411|403|403|  - `remote`: 使用前面定义的 `origin` 作为默认远程仓库。
412|404|404|  - `sync-j`: 指定在同步代码时使用的并行线程数。在这个例子中，使用 `4` 个线程并发同步，可以提高同步速度。
413|405|405|
414|406|406|**元素**
415|407|407|
416|408|408|项目的核心定义，描述要同步的 Git 仓库。可以有多个 `<project>` 元素，每一个都代表一个独立的 Git 仓库。
417|409|409|
418|410|410|示例 1:
419|411|411|
420|412|412|```
421|413|413|<project name="debian11" path="debian" revision="refs/tags/stable-5.10.160" clone-depth="1"/>
422|414|414|```
423|415|415|
424|416|416|- **作用**：定义一个名为 `debian11` 的项目，这个项目是一个 Git 仓库。
425|417|417|
426|418|418|- 属性
427|419|419|
428|420|420|  ：
429|421|421|
430|422|422|  - `name`: 仓库名，指向仓库的名称为 `debian11`。
431|423|423|  - `path`: 项目的本地路径。在这个例子中，同步的代码将存放在 `debian/` 目录下。
432|424|424|  - `revision`: 指定要检出的特定分支、标签或提交 ID。这里使用的是 `refs/tags/stable-5.10.160`，这意味着会同步 `stable-5.10.160` 标签的内容。
433|425|425|  - `clone-depth`: 指定浅克隆的深度（即保留最近的 n 个提交）。这里是 `1`，表示只克隆最近一次提交历史。
434|426|426|
435|427|427|示例 2:
436|428|428|
437|429|429|```
438|430|430|COPY<project name="device_rockchip" path="device/rockchip" revision="a85039a1513b2debd79f8e7ecc59c5cca01d1530" upstream="master" dest-branch="master">
439|431|431|  <linkfile src="common/mkfirmware.sh" dest="mkfirmware.sh"/>
440|432|432|  <linkfile src="common/build.sh" dest="build.sh"/>
441|433|433|  <linkfile src="common/rkflash.sh" dest="rkflash.sh"/>
442|434|434|  <linkfile src="rk3588" dest="device/rockchip/.target_product"/>
443|435|435|</project>
444|436|436|```
445|437|437|
446|438|438|- **作用**：定义名为 `device_rockchip` 的项目，并为其指定多个文件的链接（`linkfile` 元素）。
447|439|439|
448|440|440|- **属性**：
449|441|441|
450|442|442|  - `name`: 仓库名 `device_rockchip`。
451|443|443|  - `path`: 项目的本地路径为 `device/rockchip`。
452|444|444|  - `revision`: 同步到特定的提交，这里是 `a85039a1513b2debd79f8e7ecc59c5cca01d1530`。
453|445|445|  - `upstream`: 指定该项目的上游分支是 `master`。
454|446|446|  - `dest-branch`: 指定目标分支为 `master`。
455|447|447|
456|448|448|- **`<linkfile>` 元素**：为本地项目中的某些文件创建符号链接。
457|449|449|
458|450|450|  - `src`: 链接的源文件位置（在仓库中的路径）。
459|451|451|  - `dest`: 链接的目标文件位置（在本地项目中的路径）。
460|452|452|
461|453|453|  例如，`<linkfile src="common/mkfirmware.sh`
462|454|454|
463|455|455|# 搭建自己的repo仓库
464|456|456|
465|457|457|> v2ray wsl翻墙
466|458|458|>
467|459|459|> https://ivpsr.com/2484.html
468|460|460|
469|461|461|首先，在服务端只需要建立一个仓库名为`manifest`，构建完成如下图所示：
470|462|462|
471|463|463|![image-20240819162611044](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043339.png)image-20240819162611044
472|464|464|
473|465|465| 然后在本地拉取该仓库，拉取完成如下所示：
474|466|466|
475|467|467|![image-20240819162649607](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043360.png)image-20240819162649607
476|468|468|
477|469|469|然后创建一个xml文件，这个文件名可以随意取例如rk3588_linux_release.xml，内容填充如下所示：
478|470|470|
479|471|471|```
480|472|472|COPY<?xml version="1.0" encoding="UTF-8"?>
481|473|473|<manifest>
482|474|474|  <remote  name="origin" fetch="https://github.com/chai0705" />
483|475|475|  <default remote="origin" sync-j="8" />
484|476|476|  <project name="rootfs-build" path="rootfs-build" revision="main" />
485|477|477|</manifest>
486|478|478|```
487|479|479|
488|480|480|remote: 远程服务端，name为repo仓库名称，fetch 为 仓库url
489|481|481|
490|482|482|default:设置每个项目默认的仓库和分支，remote指定了使用哪一个远程服务端
491|483|483|
492|484|484|project: 每个项目的git仓库，path会指向下载后的仓库放在那个路径
493|485|485|
494|486|486|name: 服务端git仓库名称，指向的是在fetch在已有的仓库名。
495|487|487|
496|488|488|revision: 分支名称或者commit id
497|489|489|
498|490|490|然后推送出去，即可，如下图所示：
499|491|491|
500|492|492|![image-20240819163952002](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043547.png)image-20240819163952002
501|