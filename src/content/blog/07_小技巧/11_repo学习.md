---
title: repo的学习
date: 2024-08-19 06:50:19
categories:
  - 小技巧
link: 07_小技巧/11_repo学习
---

> 说一下前因后果，之前学了一段时间的git，但是无论如何也没用起来，这一点让我很是不爽,为了实现能常用git我甚至还搞了一个完全的Linux系统，但还是没有用起来，这还是让我很不爽，最近开始研究野火的SDK了，发现野火是用repo来进行代码管理的，其实更上层的瑞芯微也是这样管理代码的，但我们也不知道为了什么起见，可能对应的客户不同吧，就一个板子一套镜像，我认为这是有问题的，但我并没有什么话语权，只能听安排，但是我可以自己维护一个主线，我甚至可以搞一个千兆的宽带，这一点在理，但让我搞一个新机器我又不愿意，这个以后再说，先来研究理论基础。

# repo理论基础

## repo是什么？

**Repo是一个高级的版本库管理工具，主要用于管理Android项目的多个Git仓库**。下面将非常详细地讲解Repo的各个方面：

1. **起源与用途**：
   - Repo是由Google开发并广泛使用于Android开源项目（AOSP）中的工具。
   - 它旨在简化对包含多个Git仓库的大型项目的管理工作。
   - 在Android项目中，Repo帮助开发者同步、管理和更新分布在多个Git仓库中的代码。
2. **核心功能与特点**：
   - **仓库管理**：Repo能够初始化一个仓库清单（manifest），该清单描述了项目所需的所有Git仓库的位置和分支信息。
   - **同步操作**：通过`repo sync`命令，Repo可以自动地克隆或更新所有列在清单中的Git仓库。
   - **分支管理**：Repo支持在多个仓库之间切换分支，确保整个项目的一致性。
   - **状态查看**：使用`repo status`可以查看所有仓库的当前状态，包括哪些文件被修改、新增或删除。
   - **上传与审查**：Repo集成了Git的上传（`git push`）和代码审查（Gerrit）的功能，便于开发者提交更改并进行代码审查。
3. **工作原理**：
   - Repo本身是一个Python脚本，它利用Git命令来管理多个Git仓库。
   - 当Repo初始化一个项目时，它会首先克隆一个特殊的Git仓库（通常称为manifest仓库），该仓库包含了项目的manifest文件。
   - Manifest文件是一个XML文件，它定义了项目中所有其他Git仓库的位置、分支和复制条件。
   - 随后，Repo根据manifest文件的信息，逐一克隆或更新每个Git仓库到本地工作目录。
4. **优势**：
   - **简化管理**：对于包含数百个Git仓库的大型项目来说，手动管理这些仓库将非常繁琐且容易出错。Repo提供了自动化的管理工具，大大简化了这一过程。
   - **保持一致性**：Repo确保所有仓库都按照manifest文件的规定处于正确的分支和版本，从而保证了整个项目的一致性。
   - **提高开发效率**：通过集成代码上传和审查的功能，Repo帮助开发者更快地完成开发流程。
5. **使用场景**：
   - Repo特别适用于大型、复杂且包含多个相互依赖的组件或模块的项目。
   - 在Android开源项目中，Repo是不可或缺的工具，用于管理数以百计的Git仓库。
   - 类似的项目，如Chrome OS和Linux内核项目，也可能使用Repo或其类似工具来管理多个Git仓库。
6. **安装与配置**：
   - Repo通常需要通过特定的脚本来安装，因为它本身是一个Python脚本。
   - 安装后，需要通过Repo的`init`命令来初始化一个项目，该命令会克隆manifest仓库并设置项目的本地环境。
   - 配置Repo通常涉及编辑manifest文件，以更改项目的仓库列表、分支和复制条件。

通过以上详细的讲解，你应该对Repo有了全面而深入的理解。Repo是一个强大的工具，它简化了大型项目中多个Git仓库的管理，提高了开发效率和项目一致性。

## repo的安装

repo 其实就是个python脚本，所以只需要拉取下来放到某个路径就好了，但在此之前需要先安装git，git的安装方法不再讲解，可以看前面的文档。

```
wget https://storage.googleapis.com/git-repo-downloads/repo .
wget https://raw.githubusercontent.com/esrlabs/git-repo/stable/repo .
```

![image-20240817170916119](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043063.png)image-20240817170916119

然后赋予可执行权限，拷贝到/usr/bin/目录：

![image-20240817171016635](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043962.png)image-20240817171016635

![image-20240817171038551](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043016.png)image-20240817171038551

## repo常用命令

### repo常用命令

1. **初始化repo**

   ```
   repo --trace init -u https://android.googlesource.com/platform/manifest -b branch_name -m default.xml
   ```

2. **同步代码**

   ```
   repo sync
   ```

3. **上传代码到远程仓库**

   ```
   COPYrepo upload dev
   ```

4. **列出分支**

   ```
   COPYrepo branch  # 或者 repo branches
   ```

5. **状态查询**

   ```
   COPYrepo status
   ```

6. **查看修改**

   ```
   COPYrepo diff
   ```

7. **撤销整个工程的本地修改**

   ```
   COPYrepo forall -c 'git reset --hard HEAD; git clean -df; git rebase --abort'
   ```

8. **切换整个工程模块的分支**

   ```
   COPYrepo forall -c 'git branch master'
   ```

9. **更新整个工程模块的代码**

   ```
   COPYrepo forall -c 'git pull projectname'
   ```

### repo与git命令对照表

| repo命令      | 等同git命令             | 备注             |
| ------------- | ----------------------- | ---------------- |
| repo init -u  | 无                      | 初始化           |
| repo sync     | git pull                | 同步代码         |
| repo upload   | git push                | 上传代码         |
| repo forall   | 无                      | 多仓执行         |
| repo start    | git checkout -b         | 创建并切换分支   |
| repo checkout | git checkout            | 切换分支         |
| repo status   | git status              | 状态查询         |
| repo branches | git branch              | 分支查询         |
| repo diff     | git diff                | 文件对比         |
| repo prune    | git remote prune origin | 删除合并分支     |
| repo stage –i | git add --interactive   | 添加文件到暂存区 |
| repo abandon  | git branch -D           | 删除分支         |
| repo version  | 无                      | 查看版本号       |

### repo 脚本参数

- `--repo-url=URL`: repo 工具本身的 git 库地址。缺省为：`git://android.git.kernel.org/tools/repo.git`
- `--repo-branch=REVISION`: 使用repo的版本库，即repo git库的分支或者里程碑名称。缺省为`caf-stable`
- `--no-repo-verify`: 设定不要对repo的里程碑签名进行严格的验证。
- `-u` 或 `--manifest-url`: 设定清单库的Git服务器地址。
- `-b` 或 `--manifest-branch`: 检出清单库的特定分支。
- `--mirror`: 只在repo第一次初始化的时候使用，建立本地镜像。
- `-m` 或 `--manifest-name`: 指定清单库中的某个清单为有效的清单文件。默认为`default.xml`。
- `--no-tags`: 不获取标签（tags）。
- `--trace`: 显示repo命令的执行过程。

### repo help

- `repo help`：查看 `repo` 的帮助文档。
- `repo help sync`：查看 `sync` 命令的帮助文档。

### repo init

- `repo init` 主要用于初始化 `repo` 工具，执行的 `repo` 脚本是一个引导工具，而非下载代码的脚本。
- 该命令会克隆 `manifest.git` 到 `.repo/manifests/` 目录下（地址由 `-u` 参数指定），并在 `.repo/` 目录中生成符号链接 `manifest.xml`，指向 `.repo/manifests/default.xml`。
- 如果 `.repo/manifests/` 目录中有多个 `xml` 文件，可通过 `repo init -m` 参数指定要使用的 `manifest` 文件，默认是 `default.xml`。

**示例：**

```
COPYbash
复制代码
repo --trace init -u https://android.googlesource.com/platform/manifest -b branch_name -m default.xml && repo sync && repo start branch_name --all
```

- `--trace`：查看 `repo` 背后的具体操作。
- `-u`：指定 `Manifest` 库的 Git 访问路径。
- `-m`：指定使用的 `Manifest` 文件。
- `-b`：指定使用 `Manifest` 仓库中的某个特定分支。

**初始化完成后生成的 `.repo` 目录结构：**

```
COPYbash复制代码tree .repo -L 1
.repo
├── manifest.xml -> manifests/default.xml
├── manifests
├── manifests.git
├── project-objects
├── project.list
├── projects
└── repo
```

**各文件夹的用途：**

- `manifests`：清单文件的仓库。
- `manifests.git`：清单文件的 Git 裸仓库，不带工作区。
- `manifest.xml`：符号链接，指向用于初始化工作区的清单文件。
- `project.list`：包含所有项目名称的列表。
- `projects`：包含所有 `git project` 的裸仓库，文件夹的层次结构与工作区布局一致。
- `repo`：`repo` 命令的主体，推荐使用其中的 `repo` 命令。

### repo sync

- **首次运行**：相当于 `git clone`，会将服务器的内容完全拷贝到本地。
- **后续运行**：若项目已同步，则相当于执行 `git remote update && git rebase origin/<branch>`。

`repo sync` 不会更新 `.repo/repo` 仓库。

**参数说明：**

- `-j`：开启多线程同步，加快同步速度，默认使用4个线程。
- `-c, --current-branch`：仅同步指定的远程分支，默认同步所有远程分支。
- `-d, --detach`：脱离当前本地分支，切换到 `manifest.xml` 中设定的分支。第一次 `sync` 后通常会切换到 `dev` 分支开发，若不带此参数，可能导致本地 `dev` 分支与 `manifest` 远程分支合并，可能引发同步失败。
- `-f, --force-broken`：当某些 `git` 库同步失败时，不中断同步操作，继续同步其他 `git` 库。

### repo upload

- 类似于 `git push`。
- **用法**：`repo upload [--re --cc] [项目列表]`
- 若无参数，`repo upload` 会搜索所有项目中的更改以进行上传。

### repo start

- `repo start` 是 `git checkout -b` 的封装，但 `repo start` 是基于 `manifest` 中设定的分支创建特性分支。

**示例：**

- `repo start stable --all`：假设 `manifest` 文件中设定的分支为 `gingerbread-stable`，则会在所有项目上基于该分支创建特性分支 `stable`。
- `repo start stable platform/build platform/bionic`：可以指定项目。

### repo forall

- `repo forall [<PROJECT_LIST>] -c <COMMAND>`：在每个项目中运行指定的 Shell 命令。

**可用的环境变量：**

- `REPO_PROJECT`：项目的唯一名称。
- `REPO_PATH`：客户端根目录的相对路径。
- `REPO_REMOTE`：清单中远程系统的名称。
- `REPO_LREV`：清单中的修订版本名称，已转换为本地跟踪分支。
- `REPO_RREV`：清单中的修订版本名称，与清单中的名称一致。

**常用参数：**

- `-c`：运行指定的命令。
- `-p`：输出命令结果前显示项目标头。
- `-v`：显示命令向 `stderr` 写入的消息。

### manifest 文件

- `manifest` 文件是 `repo` 工具的核心，记录所有 `git` 仓库的地址和分支。
- 官方文档参考：[manifest 文件格式](https://github.com/GerritCodeReview/git-repo/blob/main/docs/manifest-format.md)。

**manifest 文件示例：**

```
COPY<?xml version="1.0" encoding="UTF-8"?>
<manifest>
    <remote />
    <default remote="origin" revision="master" sync-j="4" />
    <project />
    <project />
    <project />
</manifest>
```

**元素说明：**

- `remote`：指定使用 `repo upload` 时提交到哪个服务器，可定义一个或多个 `remote`。
- default：包含一些缺省属性，如果 project中未指定，则使用这些属性。
  - `revision`：Git 分支的名称，可为 `branch`、`tag` 或 `commit id`。
  - `sync-j`：同步时并行任务数。
  - `sync-c`：为 `true` 时，仅同步 `project` 中指定的分支。
- project：定义一个或多个 git 仓库。
  - `name`：`git project` 的名字。
  - `path`：本地工作区路径。
  - `revision`：与 `default` 标签中的 `revision` 含义相同。

# repo实际用法

> 我之前只用过野火的repo，今天就继续用野火的repo，使用一下

```
COPY# 创建目录
mkdir ~/LubanCat_SDK

cd ~/LubanCat_SDK

# 配置姓名和邮箱
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
  
# 拉取LubanCat-RK356x系列Linux_SDK
repo init --depth=1 -u https://github.com/LubanCat/manifests.git -b linux -m rk356x_linux_release.xml


# 拉取LubanCat-RK3588系列Linux_SDK
repo init --depth=1 -u https://github.com/LubanCat/manifests.git -b linux -m rk3588_linux_release.xml

#如果运行以上命令失败，提示：fatal: Cannot get https://gerrit.googlesource.com/git-repo/clone.bundle
#则可以在以上命令中添加选项 --repo-url https://mirrors.tuna.tsinghua.edu.cn/git/git-repo
```

![image-20240819093048396](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043976.png)image-20240819093048396

> - `repo init`: 初始化 Repo 客户端。
> - `--depth=1`: 进行浅克隆（shallow clone），即只克隆最近的提交历史。这可以加速克隆过程，因为你不会获取整个项目的历史记录，只会获取最近的提交。这对于大型项目特别有用，可以节省时间和带宽。
> - `-u https://github.com/LubanCat/manifests.git`: 指定清单仓库（manifest repository）的 URL。这是包含项目清单文件的 Git 仓库，清单文件定义了项目中包含的所有其他仓库。
> - `-b linux`: 指定要检出的分支名。在这个例子中，`linux` 是清单仓库中的一个分支名，该分支包含了特定于该项目的清单文件。
> - `-m rk3588_linux_release.xml`: 指定要使用的清单文件名。在这个例子中，`rk3588_linux_release.xml` 是清单仓库中的一个文件，它定义了项目的具体结构和配置。
>
> 这个命令的作用是初始化一个 Repo 工作环境，从指定的 URL 克隆清单仓库的 `linux` 分支，并使用 `rk3588_linux_release.xml` 清单文件来配置项目。这个清单文件将包含项目中所有其他 Git 仓库的信息，以及这些仓库应该如何被检出和配置。在 `repo init` 完成之后，你通常会使用 `repo sync` 命令来同步（即克隆或更新）清单文件中定义的所有仓库。

```
.repo/repo/repo sync -c -j20
```

![image-20240819100404978](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043968.png)image-20240819100404978

这个命令主要做了以下几件事情：

1. **同步代码**：`repo sync` 命令的主要目的是从远程仓库同步代码到本地。它会拉取所有在 `manifest` 文件中定义的项目的最新代码。
2. **-c 选项**：这个选项表示只同步当前分支。也就是说，它只会同步 manifest 文件中定义的当前分支的最新代码，而不会同步其他分支的代码。
3. **-j20 选项**：这个选项指定了同步过程中的并发任务数。`-j20` 表示会同时运行 20 个任务来同步代码，这可以加速同步过程，但也可能增加网络和 CPU 的负载。你需要根据你的机器和网络环境来合理设置这个值。

同步完成之后如下图所示：
![image-20240819100736704](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043001.png)image-20240819100736704

而实际的代码同步凭靠的是这个rk3588_linux5.10_stable.xml文件，该文件的内容如下所示：

```
COPY<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <!-- <remote name="origin" fetch="ssh://git@gitlab.ebf.local/rockchip/linux/"/> -->
  <remote name="origin" fetch="https://github.com/LubanCat"/>  

  <default remote="origin" sync-j="4"/>
  
  <project name="debian11" path="debian" revision="refs/tags/stable-5.10.160" clone-depth="1"/>
  <project name="device_rockchip" path="device/rockchip" revision="a85039a1513b2debd79f8e7ecc59c5cca01d1530" upstream="master" dest-branch="master">
    <linkfile src="common/mkfirmware.sh" dest="mkfirmware.sh"/>
    <linkfile src="common/build.sh" dest="build.sh"/>
    <linkfile src="common/rkflash.sh" dest="rkflash.sh"/>
    <linkfile src="rk3588" dest="device/rockchip/.target_product"/>
  </project>
  <project name="gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" path="prebuilts/gcc/linux-x86/aarch64/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" revision="adbb295a970c4b39dc487c95226fe84d2c460072" upstream="master" dest-branch="master"/>
  <project name="kernel" revision="4124065a2763eb8097806289b4825c8933b82efc" upstream="stable-5.10-rk3588" dest-branch="stable-5.10-rk3588"/>
  <project name="lubancat-bin" revision="da4446576b196334590e59a9ec4cb2a094980bdf" upstream="rk3588" dest-branch="rk3588"/>
  <project name="rkbin" revision="2dde28de6e47f5003683cd3a20b4243c63e6b2fb" upstream="main" dest-branch="main"/>
  <project name="tools" revision="210be81d659a6bc4e7a648744ae77837f394be0f" upstream="master" dest-branch="master">
    <linkfile src="windows/RKDevTool/RKDevTool_Release/rk3588-config.cfg" dest="tools/windows/RKDevTool/RKDevTool_Release/config.cfg"/>
    <linkfile src="windows/RKDevTool/rockdev/rk3588-package-file" dest="tools/windows/RKDevTool/rockdev/package-file"/>
    <linkfile src="windows/RKDevTool/rockdev/rk3588-mkupdate.bat" dest="tools/windows/RKDevTool/rockdev/mkupdate.bat"/>
    <linkfile src="linux/Linux_Pack_Firmware/rockdev/rk3588-mkupdate.sh" dest="tools/linux/Linux_Pack_Firmware/rockdev/mkupdate.sh"/>
    <linkfile src="linux/Linux_Pack_Firmware/rockdev/rk3588-package-file" dest="tools/linux/Linux_Pack_Firmware/rockdev/package-file"/>
  </project>
  <project name="u-boot" revision="refs/tags/lbc-gen-rkr7.1" clone-depth="1"/>
  <project name="ubuntu" revision="refs/tags/stable-5.10-rk3588" clone-depth="1"/>
</manifest>
```

在这个 `XML` 文件中，包含了一个 Android `repo` 工具所使用的 `manifest` 文件。它定义了多个项目的来源、分支、路径、文件链接等关键信息。下面我会详细解释这个 XML 文件的结构及各个元素的作用。

**整体结构**

```
COPY<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  ...
</manifest>
```

- `<?xml version="1.0" encoding="UTF-8"?>`: 这是 XML 文件的声明，表示该文件是 XML 1.0 版本，字符编码是 `UTF-8`。
- `<manifest>`: 这是 XML 文件的根元素，所有项目的配置信息都在这个根元素之内。Manifest 是 `repo` 工具的核心配置文件，用于描述多 Git 仓库如何被同步、管理。

**元素**

```
COPY<remote name="origin" fetch="https://github.com/LubanCat"/>
```

- **作用**：定义远程仓库的位置。

- **属性**：

  - `name`: 为远程仓库命名为 `origin`，这个名字将在其他地方引用到，比如 `<default>` 和 `<project>`。
  - `fetch`: 指定远程仓库的 URL。在这个例子中，代码会从 `https://github.com/LubanCat` 获取。

  > 注释 `<!-- ... -->` 表示注释掉的部分，实际上在文件解析时会被忽略。这里可以看到原本使用的是 `ssh://` 的 URL 被注释掉，改用了 `https` 的 URL。

**`<default>` 元素**

```
<default remote="origin" sync-j="4"/>
```

- **作用**：设置默认的同步和远程仓库配置，适用于该清单中所有项目（除非项目本身有覆盖配置）。

- 属性

  ：

  - `remote`: 使用前面定义的 `origin` 作为默认远程仓库。
  - `sync-j`: 指定在同步代码时使用的并行线程数。在这个例子中，使用 `4` 个线程并发同步，可以提高同步速度。

**元素**

项目的核心定义，描述要同步的 Git 仓库。可以有多个 `<project>` 元素，每一个都代表一个独立的 Git 仓库。

示例 1:

```
<project name="debian11" path="debian" revision="refs/tags/stable-5.10.160" clone-depth="1"/>
```

- **作用**：定义一个名为 `debian11` 的项目，这个项目是一个 Git 仓库。

- 属性

  ：

  - `name`: 仓库名，指向仓库的名称为 `debian11`。
  - `path`: 项目的本地路径。在这个例子中，同步的代码将存放在 `debian/` 目录下。
  - `revision`: 指定要检出的特定分支、标签或提交 ID。这里使用的是 `refs/tags/stable-5.10.160`，这意味着会同步 `stable-5.10.160` 标签的内容。
  - `clone-depth`: 指定浅克隆的深度（即保留最近的 n 个提交）。这里是 `1`，表示只克隆最近一次提交历史。

示例 2:

```
COPY<project name="device_rockchip" path="device/rockchip" revision="a85039a1513b2debd79f8e7ecc59c5cca01d1530" upstream="master" dest-branch="master">
  <linkfile src="common/mkfirmware.sh" dest="mkfirmware.sh"/>
  <linkfile src="common/build.sh" dest="build.sh"/>
  <linkfile src="common/rkflash.sh" dest="rkflash.sh"/>
  <linkfile src="rk3588" dest="device/rockchip/.target_product"/>
</project>
```

- **作用**：定义名为 `device_rockchip` 的项目，并为其指定多个文件的链接（`linkfile` 元素）。

- **属性**：

  - `name`: 仓库名 `device_rockchip`。
  - `path`: 项目的本地路径为 `device/rockchip`。
  - `revision`: 同步到特定的提交，这里是 `a85039a1513b2debd79f8e7ecc59c5cca01d1530`。
  - `upstream`: 指定该项目的上游分支是 `master`。
  - `dest-branch`: 指定目标分支为 `master`。

- **`<linkfile>` 元素**：为本地项目中的某些文件创建符号链接。

  - `src`: 链接的源文件位置（在仓库中的路径）。
  - `dest`: 链接的目标文件位置（在本地项目中的路径）。

  例如，`<linkfile src="common/mkfirmware.sh`

# 搭建自己的repo仓库

> v2ray wsl翻墙
>
> https://ivpsr.com/2484.html

首先，在服务端只需要建立一个仓库名为`manifest`，构建完成如下图所示：

![image-20240819162611044](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043339.png)image-20240819162611044

 然后在本地拉取该仓库，拉取完成如下所示：

![image-20240819162649607](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043360.png)image-20240819162649607

然后创建一个xml文件，这个文件名可以随意取例如rk3588_linux_release.xml，内容填充如下所示：

```
COPY<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <remote  name="origin" fetch="https://github.com/chai0705" />
  <default remote="origin" sync-j="8" />
  <project name="rootfs-build" path="rootfs-build" revision="main" />
</manifest>
```

remote: 远程服务端，name为repo仓库名称，fetch 为 仓库url

default:设置每个项目默认的仓库和分支，remote指定了使用哪一个远程服务端

project: 每个项目的git仓库，path会指向下载后的仓库放在那个路径

name: 服务端git仓库名称，指向的是在fetch在已有的仓库名。

revision: 分支名称或者commit id

然后推送出去，即可，如下图所示：

![image-20240819163952002](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043547.png)image-20240819163952002

到这里就关于repo就搭建完成了，然后开始测试，输入以下命令，这里的repo可以指定一下国内源，不然太慢了，或者使用本地的repo也是可以的。

> –repo-url https://mirrors.tuna.tsinghua.edu.cn/git/git-repo

```
repo init -u https://github.com/chai0705/manifest -b master -m rk3588_linux_release.xml --repo-url 

repo init -u git@github.com:chai0705/manifest.git -b master -m rk3588_linux_release.xml --repo-url 
```

![image-20240819165255782](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043403.png)image-20240819165255782

这样就初始化成功了，然后就可以进行同步了，同步过程如下所示：

```
repo sync -j32
```

![image-20240819165407859](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043455.png)image-20240819165407859

同步完成如下所示：

![image-20240819165611921](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202409051043610.png)image-20240819165611921

不错啊，这个，我感觉很不错，

小修改

```
COPY<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <remote  name="origin" fetch="https://github.com/chai0705" />
  <default remote="origin" sync-j="8" />
  <project name="rootfs-build" path="rootfs-build" revision="master" />
  <project name="u-boot" path="u-boot" revision="master" />
  <project name="kernel" path="kernel" revision="master" />
  <project name="rkbin" path="rkbin" revision="master" />
  <project name="gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" path="prebuilts/gcc/linux-x86/aarch64/gcc-arm-10.3-2021.07-x86_64-aarch64-none-linux-gnu" revision="adbb295a970c4b39dc487c95226fe84d2c460072" upstream="master" dest-branch="master"/>
</manifest>
COPY
git remote add origin https://github.com/chai0705/u-boot.git
git clone https://github.com/chai0705/kernel.git
git push -u origin master
COPYgit branch -m main master
git fetch origin
git branch -u origin/master master
git remote set-head origin -a
COPYexport windows_host=`cat /etc/resolv.conf|grep nameserver|awk '{print $2}'`
export ALL_PROXY=socks5://$windows_host:10810
export HTTP_PROXY=$ALL_PROXY
export http_proxy=$ALL_PROXY
export HTTPS_PROXY=$ALL_PROXY
export https_proxy=$ALL_PROXY

if [ "`git config --global --get proxy.https`" != "socks5://$windows_host:10810" ]; then
            git config --global proxy.https socks5://$windows_host:10810
fi
```

