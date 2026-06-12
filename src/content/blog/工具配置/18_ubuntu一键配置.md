---
title: ubuntu一键配置
date: 2024-09-13 06:50:19
categories:
  - 工具配置
link: 小技巧/18_ubuntu一键配置
---
8|
9|____
10|
11|> 先说一下心路历程，每次创建一个新的wsl的时候，我都要重新配置一遍，但这样也太费劲了，所以我就打算搞一个一体的脚本，来进行配置，我现在的要求是换源、安装编译需要的软件包，设置python，设置vim
12|
13|## 	整合脚本
14|
15|~~~shell
16|#!/bin/bash
17|
18|# 获取当前系统版本代号
19|HOSTRELEASE=$(grep VERSION_CODENAME /etc/os-release | cut -d"=" -f2)
20|echo -e "\e[33m当前运行的系统为 $HOSTRELEASE.\e[0m"
21|
22|# 错误处理函数
23|error_exit() {
24|    echo -e "\e[31m$1\e[0m"  # 输出红色错误信息
25|    exit 1  # 退出脚本
26|}
27|
28|# 设置 chsrc
29|setup_chsrc() {
30|    echo "设置 chsrc..."
31|    curl -L https://github.com/RubyMetric/chsrc/releases/download/pre/chsrc-x64-linux -o chsrc || error_exit "chsrc 下载失败。"
32|    chmod +x ./chsrc
33|    sudo ./chsrc  set ubuntu || error_exit "chsrc 设置失败。"
34|    rm -rf chsrc nul
35|    echo "chsrc 设置完成。"
36|}
37|
38|# 安装编译所需的依赖包
39|install_package() {
40|    HOSTRELEASE=$(grep VERSION_CODENAME /etc/os-release | cut -d"=" -f2)
41|    echo -e "\e[33m当前运行的系统为 $HOSTRELEASE.\e[0m"
42|
43|    # 通用必需依赖包列表，适用于内核、Buildroot、U-Boot、设备树等
44|    COMMON_PACKAGES=(
45|        whiptail dialog psmisc acl uuid uuid-runtime curl gpg gnupg gawk git
46|        aptly aria2 bc binfmt-support bison btrfs-progs build-essential
47|        ca-certificates ccache cpio cryptsetup debian-archive-keyring
48|        debian-keyring debootstrap device-tree-compiler dirmngr dosfstools
49|        dwarves f2fs-tools fakeroot flex gcc-arm-linux-gnueabihf gdisk imagemagick
50|        jq kmod libbison-dev libc6-dev-armhf-cross libelf-dev libfdt-dev
51|        libfile-fcntllock-perl libfl-dev liblz4-tool libncurses-dev libssl-dev
52|        libusb-1.0-0-dev linux-base locales lzop ncurses-base ncurses-term
53|        nfs-kernel-server ntpdate p7zip-full parted patchutils pigz pixz pkg-config
54|        pv python3-dev qemu-user-static rsync swig systemd-container u-boot-tools
55|        udev unzip uuid-dev wget zip zlib1g-dev distcc lib32ncurses-dev
56|        lib32stdc++6 libc6-i386 python3 expect expect-dev cmake vim openssh-server
57|        net-tools texinfo libgmp-dev libmpc-dev
58|    )
59|
60|    # Ubuntu 18.04 特定的依赖包（去除了与 COMMON_PACKAGES 重复的包）
61|    UBUNTU_18_PACKAGES=(
62|        liblz-dev liblzo2-2 liblzo2-dev mtd-utils squashfs-tools schedtool
63|        g++-multilib lib32z1-dev lib32ncurses5-dev lib32readline-dev gcc-multilib
64|        patchelf chrpath texinfo diffstat python3-pip subversion sed binutils
65|        bzip2 patch gzip perl tar file bc tcl android-tools-fsutils openjdk-8-jdk
66|        libsdl1.2-dev libesd-java libwxgtk3.0-dev repo bzr cvs mercurial pngcrush xsltproc
67|        gperf libc6-dev libgmp-dev libmpc-dev
68|    )
69|
70|    # Ubuntu 20.04 和 22.04 特定的依赖包
71|    UBUNTU_20_22_PACKAGES=(
72|        python2 python3-distutils libpython2.7-dev
73|    )
74|
75|    if [ "$HOSTRELEASE" == "bionic" ]; then
76|        echo -e "\e[33m正在安装 Ubuntu 18.04 编译所需依赖包...\e[0m"
77|        sudo apt-get update
78|        sudo apt-get -y upgrade
79|        sudo apt-get install -y --no-install-recommends "${COMMON_PACKAGES[@]}" "${UBUNTU_18_PACKAGES[@]}"
80|        echo -e "\e[32m依赖包安装完成。\e[0m"
81|    elif [ "$HOSTRELEASE" == "focal" ] || [ "$HOSTRELEASE" == "jammy" ]; then
82|        echo -e "\e[33m正在安装 Ubuntu 20.04 / 22.04 编译所需依赖包...\e[0m"
83|        sudo apt-get update
84|        sudo apt-get -y upgrade
85|        sudo apt-get install -y --no-install-recommends "${COMMON_PACKAGES[@]}" "${UBUNTU_20_22_PACKAGES[@]}"
86|        echo -e "\e[32m依赖包安装完成。\e[0m"
87|    elif [ "$HOSTRELEASE" == "noble" ]; then
88|        echo -e "\e[33m正在安装 Ubuntu 24.04 编译所需依赖包...\e[0m"
89|        sudo apt-get update
90|        sudo apt-get -y upgrade
91|        sudo apt-get install -y --no-install-recommends "${COMMON_PACKAGES[@]}"
92|        echo -e "\e[32m依赖包安装完成。\e[0m"
93|    else
94|        echo -e "\e[33m您的系统不是 Ubuntu 18.04 / 20.04 / 22.04 / 24.04，请自行安装依赖包。\e[0m"
95|    fi
96|}
97|
98|# 设置Python版本
99|set_python() {
100|    echo -e "\e[32m正在设置 Python 版本...\e[0m"
101|    if [ "$HOSTRELEASE" == "bionic" ] ||  "$HOSTRELEASE" == "focal" ] || [ "$HOSTRELEASE" == "jammy" ]; then
102|        sudo ln -fs /usr/bin/python2.7 /usr/bin/python
103|        sudo ln -fs /usr/bin/python2.7 /usr/bin/python2
104|        echo -e "\e[32mPython 版本已设置为 Python 2.7。\e[0m"
105|    elif [ "$HOSTRELEASE" == "noble" ]; then
106|        sudo ln -fs /usr/bin/python3 /usr/bin/python
107|        sudo ln -fs /usr/bin/python3 /usr/bin/python2
108|        echo -e "\e[32mPython 版本已设置为 Python 3。\e[0m"
109|    else
110|        echo -e "\e[33m未知系统版本，无法设置 Python 版本。\e[0m"
111|    fi
112|}
113|
114|# 定义函数：为当前用户设置 sudo 免密码
115|enable_sudo_nopasswd() {
116|    CURRENT_USER=$(whoami)  # 获取当前用户名
117|
118|    echo "正在为用户 $CURRENT_USER 设置 sudo 免密码权限..."
119|
120|    # 备份当前的 sudoers 文件
121|    sudo cp /etc/sudoers /etc/sudoers.bak
122|
123|    # 添加当前用户的 NOPASSWD 权限
124|    echo "$CURRENT_USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$CURRENT_USER
125|
126|    # 验证 sudoers 文件是否正确（使用 visudo 进行检查）
127|    sudo visudo -cf /etc/sudoers.d/$CURRENT_USER
128|    if [ $? -eq 0 ]; then
129|        echo "sudo 免密码配置已成功应用。"
130|    else
131|        echo "sudoers 文件格式错误，正在恢复备份..."
132|        sudo mv /etc/sudoers.bak /etc/sudoers
133|    fi
134|}
135|# 安装并配置 Vim 和相关插件
136|install_vim_and_configure() {
137|    echo "检查是否已安装 Vim..."
138|    if ! command -v vim &> /dev/null; then
139|        echo "Vim 未安装，正在安装 Vim..."
140|        sudo apt-get install -y vim || error_exit "Vim 安装失败。"
141|    else
142|        echo "Vim 已安装。"
143|    fi
144|
145|    echo "检查是否已安装 curl..."
146|    if ! command -v curl &> /dev/null; then
147|        echo "curl 未安装，正在安装 curl..."
148|        sudo apt-get install -y curl || error_exit "curl 安装失败。"
149|    fi
150|
151|    echo "安装 vim-plug 插件管理器..."
152|    curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
153|        https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim || error_exit "vim-plug 安装失败。"
154|
155|    echo "安装 vim-plug 插件管理器..."
156|    curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
157|        https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim || error_exit "vim-plug 安装失败。"
158|
159|    echo "配置 .vimrc 文件..."
160|    cat > ~/.vimrc <<EOL
161|" 基本 Vim 配置
162|syntax on                     " 启用语法高亮
163|set cursorline                " 高亮显示当前行
164|set tabstop=4                 " 设置 Tab 键的宽度为 4 个空格
165|set shiftwidth=4              " 设置自动缩进时使用 4 个空格
166|set hlsearch                  " 搜索时高亮显示匹配的文本
167|set incsearch                 " 启用增量搜索（输入时即显示匹配结果）
168|set laststatus=2              " 始终显示状态栏
169|set showmatch                 " 高亮显示匹配的括号
170|set nocompatible              " 禁用 Vi 兼容模式，使用 Vim 的增强功能
171|filetype plugin indent on     " 启用基于文件类型的插件和自动缩进
172|set history=25                " 设置命令历史的条数为 25
173|set ignorecase                " 搜索时忽略大小写
174|set smartcase                 " 搜索时智能区分大小写（只有输入大写字母时才区分大小写）
175|set foldmethod=indent         " 根据缩进层级自动折叠代码块
176|set foldlevel=99              " 设置默认不折叠代码（最大折叠层级）
177|set backupdir=~/.vim/backup    " 设置备份文件的存储目录
178|set background=dark           " 设置背景为深色模式
179|
180|nnoremap <C-s> :w!<CR>    " Ctrl + S 快速保存
181|nnoremap <C-q> :q!<CR>    " Ctrl + Q 快速退出
182|
183|autocmd BufWritePre * :%s/\s\+$//e
184|
185|" 自动补全括号和引号
186|inoremap ( ()<Left>
187|inoremap [ []<Left>
188|inoremap { {}<Left>
189|inoremap " ""<Left>
190|inoremap ' ''<Left>
191|
192|" NERDTree 基础配置
193|nnoremap <C-n> :NERDTreeToggle<CR> | wincmd p   " 使用 Ctrl + n 切换 NERDTree 并自动聚焦到编辑窗口
194|
195|" 当 NERDTree 是唯一窗口时关闭 Vim，但不在关闭其他窗口时退出
196|autocmd bufenter * if tabpagenr('$') == 1 && winnr('$') == 1 && exists('t:NERDTreeBufName') && bufname() == t:NERDTreeBufName | quit | endif
197|
198|" 禁用 NERDTree 窗口中的行号
199|autocmd FileType nerdtree setlocal nonumber norelativenumber
200|
201|" 文件保存后自动刷新 NERDTree
202|autocmd BufWritePost * NERDTreeRefreshRoot
203|
204|
205|" 调整 NERDTree 窗口宽度
206|let g:NERDTreeWinSize = 35
207|
208|" 自动关闭 NERDTree
209|autocmd bufenter * if tabpagenr('$') == 1 && winnr('$') == 1 && exists('t:NERDTreeBufName') && bufname() == t:NERDTreeBufName | quit | endif
210|
211|" vim-airline 配置
212|let g:airline_powerline_fonts = 1
213|let g:airline#extensions#tabline#enabled = 1
214|let g:airline#extensions#tabline#fnamemod = ':t'
215|
216|" 插件管理器配置
217|call plug#begin('~/.vim/plugged')
218|Plug 'preservim/nerdtree'
219|Plug 'vim-airline/vim-airline'
220|Plug 'vim-airline/vim-airline-themes'
221|Plug 'dense-analysis/ale'
222|Plug 'tpope/vim-commentary'
223|Plug 'tpope/vim-surround'
224|Plug 'Xuyuanp/nerdtree-git-plugin'              " 显示 Git 状态
225|call plug#end()
226|
227|
228|" Git 状态显示
229|let g:NERDTreeGitStatusUseNerdFonts = 1         " 使用 Nerd 字体显示 Git 状态
230|
231|EOL
232|
233|    echo "安装 Vim 插件..."
234|    vim +PlugInstall +qall || error_exit "Vim 插件安装失败。"
235|    echo "Vim 配置和插件安装已完成！"
236|
237|}
238|
239|# 定义函数以写入 SSH 秘钥并配置 Git 用户信息
240|setup_ssh_and_git_config() {
241|    # 定义私钥和公钥内容
242|    setup_ssh_and_git_config() {
243|        # 定义私钥和公钥内容（示例，请替换为你自己的密钥）
244|        PRIVATE_KEY="[此处应填写你的私钥内容，格式为 -----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----]"
247|
248|        PUBLIC_KEY="ssh-rsa [此处应填写你的公钥内容] user@example.com"
249|
250|    # 创建 .ssh 目录（如果不存在）
251|    mkdir -p ~/.ssh
252|
253|    # 将私钥写入 id_rsa 文件
254|    echo "$PRIVATE_KEY" > ~/.ssh/id_rsa
255|
256|    # 设置 id_rsa 的权限为 600
257|    chmod 600 ~/.ssh/id_rsa
258|
259|    # 将公钥写入 id_rsa.pub 文件
260|    echo "$PUBLIC_KEY" > ~/.ssh/id_rsa.pub
261|
262|    # 配置 Git 用户名和电子邮件
263|    git config --global user.name "chai0705"
264|    git config --global user.email "1361382269@qq.com"
265|
266|    # 提示操作完成
267|    echo "秘钥已写入 ~/.ssh/id_rsa 和 ~/.ssh/id_rsa.pub，并已设置权限为 600。"
268|    echo "Git 用户信息已配置为 chai0705 (1361382269@qq.com)"
269|}
270|
271|#!/bin/bash
272|
273|# 函数: 安装 Docker 并设置环境
274|install_docker_and_setup() {
275|    echo "开始安装 GCC 和 G++ 环境..."
276|    # 安装 gcc 和 g++
277|    sudo apt-get update
278|    sudo apt-get -y install gcc g++
279|
280|    echo "确保之前的 Docker 相关环境已被删除..."
281|    # 删除之前安装的 Docker 相关软件包
282|    for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
283|        sudo apt-get remove -y $pkg
284|    done
285|
286|    echo "安装 Docker 所需的依赖环境..."
287|    # 安装必要的证书工具和 curl
288|    sudo apt-get update
289|    sudo apt-get install -y ca-certificates curl gnupg
290|
291|    # 设置 Docker GPG 密钥
292|    sudo install -m 0755 -d /etc/apt/keyrings
293|    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
294|    sudo chmod a+r /etc/apt/keyrings/docker.gpg
295|
296|    # 添加 Docker 官方仓库
297|    echo \
298|      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
299|      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
300|      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
301|
302|    # 更新 apt 包列表
303|    sudo apt-get update
304|
305|    echo "开始安装 Docker..."
306|    # 安装 Docker 及相关组件
307|    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
308|
309|    echo "Docker 安装完成，验证 Docker 是否正常运行..."
310|    # 启动 Docker 并检查是否成功运行
311|    sudo systemctl enable docker
312|    sudo systemctl start docker
313|
314|    # 检查 Docker 状态
315|    sudo systemctl status docker --no-pager
316|
317|    echo "Docker 安装和配置已完成。"
318|}
319|
320|# 执行所有操作
321|setup_chsrc
322|install_package
323|set_python
324|install_vim_and_configure
325|#setup_ssh_and_git_config
326|#install_docker_and_setup
327|enable_sudo_nopasswd
328|~~~
329|
330|==不知道为啥会有空格的问题很奇怪，需要用下面的命令临时去掉空格==
331|
332|~~~shell
333| export PATH=$(echo "$PATH" | tr -d ' \t\n')
334| export PATH=$(echo "$PATH" | sed -e 's|:.:||g' -e 's|::||g')
335|~~~
336|
337|
338|
339|## 换源
340|
341|~~~shell
342|curl -L https://github.com/RubyMetric/chsrc/releases/download/pre/chsrc-x64-linux -o chsrc; chmod +x ./chsrc
343|sudo ./chsrc set ubuntu
344|~~~
345|
346|## 代码编译配置
347|
348|~~~shell
349|#!/bin/bash
350|
351|# 获取当前系统版本代号
352|HOSTRELEASE=$(grep VERSION_CODENAME /etc/os-release | cut -d"=" -f2)
353|echo -e "\e[33m当前运行的系统为 $HOSTRELEASE.\e[0m"
354|
355|# 安装编译需要的软件包
356|install_package() {
357|    if [ "$HOSTRELEASE" == "focal" ] || [ "$HOSTRELEASE" == "jammy" ]; then
358|        echo -e "\e[33m正在为 Ubuntu 20.04/22.04 安装编译所需依赖包...\e[0m"
359|        sudo apt-get install -y --no-install-recommends \
360|            whiptail dialog psmisc acl uuid uuid-runtime curl gpg gnupg gawk git acl \
361|            aptly aria2 bc binfmt-support bison btrfs-progs build-essential \
362|            ca-certificates ccache cpio cryptsetup curl debian-archive-keyring \
363|            debian-keyring debootstrap device-tree-compiler dialog dirmngr \
364|            dosfstools dwarves f2fs-tools fakeroot flex gawk gcc-arm-linux-gnueabihf \
365|            gdisk gpg imagemagick jq kmod libbison-dev libc6-dev-armhf-cross libelf-dev \
366|            libfdt-dev libfile-fcntllock-perl libfl-dev liblz4-tool libncurses-dev \
367|            libpython2.7-dev libssl-dev libusb-1.0-0-dev linux-base locales lzop \
368|            ncurses-base ncurses-term nfs-kernel-server ntpdate p7zip-full parted \
369|            patchutils pigz pixz pkg-config pv python3-dev python3-distutils \
370|            qemu-user-static rsync swig systemd-container u-boot-tools udev unzip \
371|            uuid-dev wget whiptail zip zlib1g-dev distcc lib32ncurses-dev lib32stdc++6 \
372|            libc6-i386 python2 python3 expect expect-dev cmake vim openssh-server \
373|            net-tools
374|        echo -e "\e[32m依赖包安装完成.\e[0m"
375|    elif [ "$HOSTRELEASE" == "noble" ]; then
376|        echo -e "\e[33m正在为 Ubuntu 24.04 安装编译所需依赖包...\e[0m"
377|        sudo apt-get install -y --no-install-recommends \
378|            whiptail dialog psmisc acl uuid uuid-runtime curl gpg gnupg gawk git acl \
379|            aptly aria2 bc binfmt-support bison btrfs-progs build-essential \
380|            ca-certificates ccache cpio cryptsetup curl debian-archive-keyring \
381|            debian-keyring debootstrap device-tree-compiler dialog dirmngr \
382|            dosfstools dwarves f2fs-tools fakeroot flex gawk gcc-arm-linux-gnueabihf \
383|            gdisk gpg imagemagick jq kmod libbison-dev libc6-dev-armhf-cross libelf-dev \
384|            libfdt-dev libfile-fcntllock-perl libfl-dev liblz4-tool libncurses-dev \
385|            libssl-dev libusb-1.0-0-dev linux-base locales lzop ncurses-base \
386|            ncurses-term nfs-kernel-server ntpdate p7zip-full parted patchutils pigz \
387|            pixz pkg-config pv python3-dev qemu-user-static rsync swig \
388|            systemd-container u-boot-tools udev unzip uuid-dev wget whiptail zip \
389|            zlib1g-dev distcc lib32ncurses-dev lib32stdc++6 libc6-i386 python3 \
390|            expect expect-dev cmake vim openssh-server net-tools
391|        echo -e "\e[32m依赖包安装完成.\e[0m"
392|    else
393|        echo -e "\e[33m您的系统不是 Ubuntu 20/22/24，请自行安装依赖包。\e[0m"
394|    fi
395|}
396|
397|# 设置Python版本
398|set_python() {
399|    echo -e "\e[32m正在设置 Python 版本...\e[0m"
400|    if [ "$HOSTRELEASE" == "focal" ] || [ "$HOSTRELEASE" == "jammy" ]; then
401|        # Ubuntu 20.04/22.04 使用 Python 2.7
402|        if [ "$(readlink /usr/bin/python)" != "/usr/bin/python2.7" ]; then
403|            sudo ln -fs /usr/bin/python2.7 /usr/bin/python
404|        fi
405|        if [ "$(readlink /usr/bin/python2)" != "/usr/bin/python2.7" ]; then
406|            sudo ln -fs /usr/bin/python2.7 /usr/bin/python2
407|        fi
408|        echo -e "\e[32mPython 版本已设置为 Python 2.7.\e[0m"
409|    elif [ "$HOSTRELEASE" == "noble" ]; then
410|        # Ubuntu 24.04 使用 Python 3
411|        sudo ln -fs /usr/bin/python3 /usr/bin/python
412|        sudo ln -fs /usr/bin/python3 /usr/bin/python2
413|        echo -e "\e[32mPython 版本已设置为 Python 3.\e[0m"
414|    else
415|        echo -e "\e[33m未知系统版本，无法设置 Python 版本。\e[0m"
416|    fi
417|}
418|
419|# 执行函数
420|install_package
421|set_python
422|
423|~~~
424|
425|
426|
427|## vim 配置
428|
429|~~~shell
430|#!/bin/bash
431|
432|# 安装并配置 Vim 和相关插件
433|install_vim_and_configure() {
434|    # 检查并安装 Vim
435|    echo "检查是否已安装 Vim..."
436|    if ! command -v vim &> /dev/null; then
437|        echo "Vim 未安装，正在安装 Vim..."
438|        sudo apt update && sudo apt install -y vim  # 更新软件包列表并安装 Vim
439|    else
440|        echo "Vim 已安装。"
441|    fi
442|
443|    # 检查并安装 curl
444|    echo "检查是否已安装 curl..."
445|    if ! command -v curl &> /dev/null; then
446|        echo "curl 未安装，正在安装 curl..."
447|        sudo apt install -y curl  # 如果 curl 未安装，则安装 curl
448|    fi
449|
450|    # 安装 vim-plug 插件管理器
451|    echo "安装 vim-plug..."
452|    curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
453|        https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
454|
455|    # 配置 .vimrc 文件
456|    echo "配置 .vimrc 文件..."
457|    cat > ~/.vimrc <<EOL
458|" 基本 Vim 配置
459|syntax on                         " 启用语法高亮
460|set number                        " 显示行号
461|set cursorline                    " 高亮显示当前行
462|set linebreak                     " 自动换行不切断单词
463|set tabstop=4                     " 设置 Tab 键宽度为 4 个空格
464|set shiftwidth=4                  " 自动缩进时使用 4 个空格
465|set expandtab                     " 将 Tab 转换为空格
466|set hlsearch                      " 搜索时高亮显示匹配
467|set incsearch                     " 启用增量搜索
468|set wrap                          " 启用自动换行
469|set laststatus=2                  " 始终显示状态栏
470|set showmatch                     " 高亮匹配的括号
471|set nocompatible                  " 禁用兼容模式
472|filetype plugin indent on         " 启用文件类型插件和自动缩进
473|set history=25                    " 设置命令历史条数为 25
474|nnoremap <C-s> :w<CR>             " Ctrl + S 快速保存
475|nnoremap <C-q> :q<CR>             " Ctrl + Q 快速退出
476|set foldmethod=indent             " 根据缩进自动折叠代码
477|set foldlevel=99                  " 默认不折叠
478|nnoremap <space> za               " 空格键展开/折叠代码块
479|Plug 'morhetz/gruvbox'            " 使用 gruvbox 配色方案插件
480|colorscheme gruvbox               " 启用 gruvbox 配色方案
481|set background=dark               " 设置背景为深色
482|autocmd BufWritePre * :%s/\s\+$//e  " 自动删除行尾多余空格
483|
484|" NERDTree 配置
485|autocmd bufenter * if (winnr('$') == 1 && exists('t:NERDTreeBufName')) | q | endif
486|                                  " 如果 NERDTree 是唯一窗口，关闭 Vim
487|autocmd FileType nerdtree setlocal nonumber norelativenumber
488|                                  " 禁用 NERDTree 窗口的行号显示
489|
490|" vim-airline 配置
491|let g:airline_powerline_fonts = 1  " 启用 Powerline 字体支持
492|let g:airline#extensions#tabline#enabled = 1  " 启用标签页显示
493|let g:airline#extensions#tabline#fnamemod = ':t'  " 仅显示文件名
494|let g:airline_theme='solarized'    " 使用 solarized 主题
495|
496|" 插件管理器配置
497|call plug#begin('~/.vim/plugged')  " 指定插件安装目录
498|
499|" 插件列表
500|Plug 'preservim/nerdtree'          " 文件浏览器插件 NERDTree
501|