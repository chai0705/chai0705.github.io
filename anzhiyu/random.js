var posts=["2024/12/31/规矩/","2024/12/31/工作记录/","2024/12/31/反思/","2024/01/02/23 嵌入式C语言的自我修养/","2024/01/02/27 CPU里的C和C++/","2023/12/25/25 ubuntu环境搭建/","2023/12/25/26_vim学习/","2023/12/23/24 VScode学习/","2023/12/18/19 shell编程/","2023/12/10/22 tabby的使用/","2023/12/10/22 git的学习/","2023/12/09/11-opencv的学习/","2023/12/03/20 ubuntu和debian源/","2023/12/02/16-香橙派文件系统构建脚本分析/","2023/11/20/10 debian和ubuntu文件系统构建详解/","2023/11/19/9 显示硬件发展与视频开发知识点扫盲/","2023/11/19/8 音视频编解码相关知识学习/","2023/11/14/7 rk deb包的制作/","2023/11/12/6 ad学习/","2023/11/09/5 docker学习/","2023/10/26/4 音视频测试/","2023/10/19/14 构建deb包.md/","2023/10/16/2 buildroot的学习/","2023/10/08/18 挂载镜像文件/","2023/09/27/17 适配瑞芯微官方SDK/","2023/09/10/15 U-Boot编译过程浅析/","2023/09/10/13 bootloader引导流程/","2023/09/10/12 瑞芯微build-sh脚本分析/","2023/09/03/21 cmake-基础课/","2023/09/03/0 windows搭建hexo/","2023/09/01/1markdown语法学习/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };