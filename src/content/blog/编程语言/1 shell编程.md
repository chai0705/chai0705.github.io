---
title: shell编程 第一次学习
date: 2023-12-18 20:41:19
categories:
  - 编程语言
link: 编程语言/1 shell编程
---

​	先说一下前提条件，其实shell编程我好早之前就知道了，其实吧，这个就跟法师最后让我录制的课程是差不多的，只是一个叫做Ubuntu基础，一个叫做shell编程，这两个其实是一个东西，而我对于ubuntu中的一些命令其实并不熟悉，我也并不能独立写出来一个脚本，所以我并不反感法师让我去录课，我的基础其实并不牢固，要学习的东西真的太多了，而我这一星期的重点就是戒掉小说，学生shell。

==弱小和无知并不是生存的障碍，傲慢才是==

# 	1.什么是shell和bash

​	近代以来，计算机操作系统都采用了某种形式的用户界面，借此指定需要操作系统执行的命令，但是很多操作系统当中命令是内建的，是同计算机交互的唯一方式，而shell无非也就是一个程序而已，这个程序的作用就是为用户执行其他程序，但他要做的并不只于此，一个只允许你输入命令的shell确实没有太大的意思，但如果你可以使用这些命令编程呢，是不是很酷。

​	Shell（壳层）是计算机科学中的一个概念。在操作系统中，Shell 是用户与操作系统内核之间的接口。它提供了一个命令行界面（CLI）或图形用户界面（GUI），使用户能够与操作系统进行交互、运行命令和访问系统资源。

​	bash也是一种shell，即命令解释器，bash的目的是让用户同计算机操作系统进行交互，从而完成想做的任务，当然这些任务可能是重复性的、要么非常的复杂，shell编程允许你对此任务进行自动化，以实现易用性、可靠性以及可重现性。

# 2.标准输出

## 2.1 输出到终端

​	使用内建命令echo，将命令行中的参数打印到屏幕上

~~~shell
echo hello shell
~~~

![image-20231218210955820](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182109865.png)

​	echo是最简单的bash命令之一，该命令可以将参数输出到屏幕上，需要注意的是shell会接续echo的命令行参数，即在输出之前，shell自动完成赋值、替换、等一系列操作，除此之外参数之间的空白字符会忽略，无论多少个空白字符，都会是一个字符，具体示例如下所示：

~~~shell
echo hello    shell !  !    !
~~~

![image-20231218211254225](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182112259.png)

​	但有些时候又需要空白字符，那要如何做呢？

## 2.2 保留空白字符

​	其实保留空白字符的方法十分简单，只需要在字符前后加上双引号或者单引号即可，具体示例如下所示：
~~~shell
echo "hello    shell !  !    !"
~~~

![image-20231218211953490](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182119526.png)

​	通过单引号和双引号可以指定为字符串，而shell不会对字符串进行干涉，双引号和单引号也是有区别的,单引号明确告诉不要干涉，而双引号仍旧会执行一些替换操作，包括变量扩展、算数运算、波浪号扩展等

![image-20231218213521502](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182135535.png)

## 2.3 在输出中加入更多的格式控制

​	就跟C语言里面的相同，仍旧可以使用printf命令打印这些，具体示例如下所示：
~~~shell
printf "%s = %d\n" lines $LINES
~~~

![image-20231218213848622](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182138655.png)

​	==我知道你想说，这个东西有什么用吗，没错我也是这样想的，但是你怎么知道你以后不用它呢，当你真的用的时候你还能想的起来吗==

## 2.4 消除换行符

​	认真观察的同学可能发现了，上面的echo命令自带换行，而printf命令默认不带换行，换行需要一个\n来完成，那echo如何不换行呢，其实可以加一个参数-n，具体示例如下所示：

~~~shell
echo -n lines
~~~

![image-20231218214603028](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182146056.png)	

除此之外还可以通过添加-e参数和\c转义序列来实现，具体示例如下所示：

~~~shell
echo -e 'lines\c'
~~~

![image-20231218214717809](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182147836.png)

## 2.5 保存命令输出

可以通过>符号来告诉shell将输出重定向到文件中，具体示例如下所示：

~~~shell
echo hello shell > 01_helloshell
~~~

![image-20231218214925317](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182149376.png)

​	上面用到了cat命令进行文件夹内容的查看，当然cat并不仅仅是用来查看文件夹内容的，cat的英文原型是concatenation（拼接），该命令会将出现在命令行上的文件的输出拼接在一起。后面会有章节对cat进行学习，这里先了解这么多。

## 2.6 追加输出

​	上面使用单括号进行了输出重定向，使用两个单括号进行追加输出。具体示例如下所示：

~~~shell
echo hello shell > 02_helloshell
echo hello shell too >> 02_helloshell
cat 02_helloshell
~~~

![image-20231218215813823](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20231218215813823.png)

## 2.7 获取文件的开始和结尾

​	使用head和tail命令输出指定文件的开始和结尾前10行或者后10行的内容，也可以加入-number参数指定默认行数：
~~~shell
head -1 02_helloshell
tail -1 02_helloshell
~~~

![image-20231218220159397](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182201446.png)

​	tail除了-number这一参数外，还可以有这样的格式 -n number，这样可以指定相对于文件末尾的行偏移。因此tail -n 10 file 会显示文件的最后10行，而如果以加号开头则表示文件起始的偏移数，例如tail -n +1 file会显示整个文件，tail -n +2 file会跳过第一行，以此类推。

## 2.8 丢弃输出

​	这个我还是很熟悉的，我前些日子搞了一下这个，通过将输出丢弃，从而起到了美化终端的作用。其实也挺简单的，就是输出重定向到/dev/null中。具体示例如下所示：

~~~shell
echo hello shell too > /dev/null
~~~

![image-20231218222037949](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182220976.png)

## 2.9 将输出作为输入(管道)

管道符 | ，可以将上一个命令的输出作为输入传给下一个命令，具体示例如下所示：
~~~shell
cat 02_helloshell | grep too
~~~

![image-20231218222447569](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182224603.png)

tee可以保留输出前的副本，上面的管道可以省略步骤，但是呢，如果想要查看中间步骤的结果要怎么办呢，那就是tee命令了，tee可以将管道分成两个一模一样的流，一个用来写入文件，一个用来继续向下传递，具体示例如下所示：

~~~shell
 cat 02_helloshell | tee 03_tee | grep too
~~~

![image-20231218223034147](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312182230184.png)

## 2.10 以输出为参数连接两个程序

​	![image-20231219073617761](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312190736817.png)	如上图所示，可以通过find命令查找上面的三个文件，那如何将这些输入引入rm 从而删除呢，rm只能以命令行参数的形式获取文件名，所以像下面这种方式是不对的

~~~shell
find -name '0*' | rm 
~~~

​	那应该如何操作呢，其实也不难，只需使用$()即可，$()会被替换成所包含的命令输出，具体示例如下所示

~~~shell
echo $(find -name '0*')
~~~

![image-20231219074243540](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312190742576.png)

可以看到输出就变成了命令行参数，所以可以通过下面的命令来删除：
~~~
rm $(find -name '0*')
~~~

# 3 标准输入

## 	3.1获取文件输入

​	这个其实比较简单，标准输出的符号是>，那相对的标准输入的符号肯定就是<了，但是我目前并不理解这个<的实际用法是什么，以后如果学习到了再来进行弥补。

## 3.2 获得脚本输入

​	使用<<两个箭头来从命令行，而非文件重定向输入文本，如果放在shell脚本中，可以同时包含数据和代码，一个具体示例如下所示：

~~~shell
grep $1 <<EOF
111 1
222 2
333 3
444 4
555 5
EOF
~~~

![image-20231219202905867](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312192029903.png)

​		上面这个shell脚本有两个地方要注意的，第一个是$1。这个表示脚本输入的第一个参数，而后面的<<表示我们想要创建一个临时的输入源，==EOF是上面最重要的一个点，我之前一直以为他是开始和结束的标志，而实际上并不是，在<<后面可以是任意的字符串，只要最后的结束也是这个字符串即可==。

​	仍旧需要注意的是，在<<内部的这些内容，都是可以被解释的，例如如果内部输入了一个$1，那就会被转换为输入的第一个字符，那要如何避免这个情况呢，其实也很简单，那就是给EOF加上‘’单引号，表示不用执行扩展。

## 3.3 获取用户输入

![image-20231219203837889](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312192038960.png)

​	可以通过read命令进行用户输入的获取，就比如上面的RPE变量，通过输入之后再读取出来。

# 4 执行命令

## 4.1 运行程序

​	bash的基本操作就是载入并运行程序，其他都是一些准备工作，除了shell的变量之外还有循环控制语句、判断以及各种控制输入和输出的方法，但是上面的这些描述仅仅只是锦上添花而已，所以这时候就应该想一些内容了，程序到底是从哪里开始运行的呢。

​	bash使用名为￥PATH的shell变量来定位这些可执行文件，￥PATH变量包含了一个目录列表，各个目录之间以冒号：进行分割，bash在这些目录中查找命令行上指定的可执行文件，目录的顺序很重要，会根据PATH变量中定义的顺序依次查找，选择所找到的第一个同名的可执行文件。

![image-20231221073336242](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312210733311.png)

​	赋予可执行权限的命令

~~~shell
chmod +x name
~~~

## 4.2 执行多个命令

​	方法一：不停的输入，Linux系统足够先进，在运行上一个命令的同时允许你继续输入，因此可以将命令依次输入进去即可。

​	方法二：将多个命令写入脚本中，运行这个脚本即可

​	方法三：依次执行这些命令，只需要使用分号将这些命令分隔开然后输入即可：
~~~
long ; medium ; short
~~~

​	这样无论前面的程序是否运行成功，都会继续执行后面的命令，如果想要确保前面的命令运行成功，可以用下面这种写法

~~~
long && medium && short
~~~

## 4.3 同时执行多个命令

​	可以在命令行的末尾加上一个&符号，在后台运行起来，这样一来，就能够快速的同时执行三个命令了。

~~~
long &
medium &
short 
~~~

或者也可以将他们放在一个单行，具体如下所示：
~~~
long & medium & short 
~~~

这里提一下bg命令,一个示例如下所示：
![image-20231221075105359](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312210751415.png)

​	这个脚本的作用很简单就是睡眠10秒钟，在睡眠的过程中使用ctrl+z暂停，需要注意的是这里是暂停，而不是中断或者停止，暂停是可以回复的，可以使用两个命令进行恢复命令，也就是fg和bg，这两个命令从名字就可以看出fg是放到前台，而bg是放到后台，但每个命令都能继续运行相应的脚本。

## 4.4 了解命令是否成功运行

​	shell变量中$?中保存着命令的退出状态，其取值范围为0-255，在编写shell脚本的时候，正确的做法是，如果一切正常，退出时候就会返回0，如果运行的过程中出错了，就会返回非0值，一个具体示例如下所示：

![image-20231221075735514](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312210757591.png)

​	可以看到睡眠十秒的程序被打断了，然后它的返回值为148，为非零值就表示没有正常退出，但要注意的是，退出状态的机会只有一次。

## 4.5 无人值守下运行耗时作业

​	这个很重要呀，就比如，我在我的电脑上运行服务器编译，当我的本地终端关掉之后，服务器的命令我想让他仍旧可以继续运行，放到后台当然也是一个很好的办法，但是终端关掉之后这个仍旧是退出了，所以本小节的nohup命令很是重要，nohup命令的效果只是设置子进程忽略hangup信号，但其仍旧可以被kail杀死，这当然是两回事。

~~~
nohup ./06_bg &
~~~

​	这样运行06进行睡眠，然后关掉终端，这个程序仍旧是在运行的。

# 5 shell变量

​	无论是什么编程语言，变量都是必不可少的一个，shell编程中也不例外，一般情况下，shell中的变量采用全大写的方式，变量不需要进行声明，直接使用即可，由于命令的区分困难，所以赋值语句前后都不能有空格，当然在文件名字中也不能出现=等于号。引用变量的时候要使用$美元符号，而赋值的时候不需要加上引用符。

## 5.1 注释

​	在shell中使用#作为注释，在#后面的一行不会被解释。

## 5.2 提高脚本可读性

1. ​	以四个空格为一个等级，不要使用tab指标符号。
2. 尽可能的不要省略变量名称，利于后期的维护
3. 每行的内容描述不完时可以使用\进行断行


## 5.3 变量的导出

​	如果在一个脚本中定义了一个变量，其他脚本中是不能共享该变量的，如果想要共享这个变量需要使用export进行变量的导出。

## 5.4查看所有的变量

​	可以使用set或者env对变量进行查看，set可以查看定义的所有变量和值，而env是查看所有导出的变量。

## 5.5在shell脚本中使用参数

​	 使用$1 $2 来代替脚本中所使用的参数，当然要是有很多个，超过了十个以上的参数，那么需要用双括号引起来${10}

## 5.6 获取参数的数量

​	使用$#来获取脚本输入的数量，在限定输入参数的一些脚本中有用。

# 6 shell逻辑和运算

## 6.1 算数运算

​	使用$(())或者let进行算数运算，例如

~~~
COUNT=$((COUNT + 5 + MAX * 2))
let COUNT+='5+MAX*2'
~~~

​	需要注意等于号两边不能有任何的空格，举一个反面例子：
~~~
COUNT = $((COUNT + 5 + MAX * 2))
~~~

​	那么shell会解析成COUNT这个命令第一个参数是等于号，后面是运算。

## 6.2 分支条件

~~~
if [$# -lt 3 ]
then
	printf "xxx"
elif [$# > 3 ]
then 
	printf "xxx"
else
    printf "xxx"
fi
~~~

上面使用的是换行符号，其实也可以使用分号来替代上面的换行符。

## 6.3 测试文件特性

~~~shell
-b # 块设备文件
-c # 字符设备文件
-d # 目录文件
-e # 文件是否存在
-f # 普通文件
-h # 链接符号文件
-r # 可读文件
-s # 文件大小不为空
-w # 可写文件
-x # 可执行文件
~~~

也可以使用-a或者-o参数在判断内进行逻辑判断的组合，-a表示逻辑与，-o表示逻辑或

## 6.4 多路分支

​	如果有多个比较，如果只是简单的使用if elif else 则会显得非常啰嗦和重复，而更好的解决办法是case，一个case的示例如下所示：
~~~
case $FN in
	1）xxx;;
	2) xxx;;
	3) xxx;;
esac
~~~

​	case语句会扩展case和in之间的单词，然后依次匹配多种模式

# 7 中级shell工具

## 7.1 在文件中查找字符串

​	使用grep命令在文件中查找相关的字符串，一个具体示例如下所示：
~~~shell
grep printf *.c
~~~

​	这段shell代码的作用就是在本地的C程序中查找printf语句。

​	如果一个文件中出现了很多次的printtf，那会将这个文件打印很多遍，要如何只打印一遍呢，这个只需要-l参数即可，具体如下所示：
~~~
grep -l printf *.c
~~~

​	如果只是想知道在某个文件中是否有这个字符，只需要使用-q参数即可，该参数的作用是将输入结果丢弃到/dev/null，然后通过$?查看即可。

不区分大小写的话要使用-i参数，具体示例如下所示：

~~~、
grep -i printf *.c
~~~

​	那如何在压缩文件中搜索呢，其实也只能搜索是不是有这个文件，但不能得到相应的信息，就比如下面这样

![image-20231222213204345](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312222132396.png)

​	我还以为能有好东西了，原来只是简单的搜索。

## 7.2 保留部分行

​	使用awk命令从命令行上指定的文件中读取数据，例如默认情况下ls -l的打印如下所示：
![image-20231222213709584](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312222137695.png)	可以通过下面这个命令只打印第一行

~~~
ls -l | awk '{print $1}'
~~~

![image-20231222213756694](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312222137811.png)

​	而现在得到的结果也并不好，因为并没有相应的文件名，上面的$1是第一行，那文件名是第几行呢，是最后一行，我们并不知道最后一行是多少，不要着急，有内建命令，在awk中$NF表示最后一行的元素。所以这个命令可以这样写：
~~~
ls -l | awk '{print $1,$NF}'
~~~

![image-20231222214203181](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312222142312.png)

## 7.3 压缩文件

tar这个命令我用过很多次了，但好像我一直都不解其意，tar的英文全程是tape archive翻译成中文也就是磁带归档。

## 7.4 find

好像find并不是我想象中的那么简单，一个具体的示例如下所示：
~~~shell
 find . -name *gz -print -exec mv '{}' /home/topeet/ \;
~~~

​	上面这句脚本前面很用以理解，那就是查找以gz结尾的文件，后面是print是必须要有的，打印正确，而-exec是找到文件之后要执行的命令，这里是mv，而后面的‘{}’就表示前面查找到的内容，再后面是移动到的位置，最后是\；这个不能缺少

​	可如果是软链接或者硬链接呢，上面的find查找到的只是文件名，并没有找到文件的根本位置，其实也很见到那，只需要加入一个-L参数即可，具体示例如下：
~~~
 find -L . -name *gz -print -exec mv '{}' /home/topeet/ \;
~~~

​	那如何不区分大小写进行查找呢，其实也简单只需要将上面的-name 换位-iname即可，具体示例如下所示：
~~~
 find -L . -iname *gz -print -exec mv '{}' /home/topeet/ \;
~~~

## 7.5 函数

​	三种不同的函数编写方法

~~~
function usage ()
{
	printf xxx
}

function usage {
	printf xxx
}

usage ()
{
	printf xxx
}
~~~

​	可以注意到保留字function或者（）必须出现，如果使用了function，那么（）就是可选的，一般情况下都使用第一种情况

## 7.6 别名

​	可以通过alias对一些常用命令进行重命名，默认情况下其实已经有一些别名了，如下所示：

![image-20231223071432992](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312230714153.png)

​	一个具体的示例如下所示：

~~~
alias h=’ls -’
~~~

## 7.7 计算时间

​	不建议使用time，建议使用bash内建的SECONDS变量，可以记录时间，具体如下所示：
![image-20231223072615391](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312230726458.png)	

# 8 简单的图形界面

~~~shell
#/bin/bash 
titlestr="选择一个选项"  # 标题字符串
backtitle="iTOP-RK3568构建脚本，http://www.topeet.com"  # 返回标题，网站链接
menustr="Compile image | uboot| kernel| recovery| buildroot | debian | yocto | all"  # 菜单字符串
TTY_X=$(($(stty size | awk '{print $2}')-6))                    # 确定终端宽度
TTY_Y=$(($(stty size | awk '{print $1}')-6))                    # 确定终端高度

# 选项数组，包含选项和对应的函数名
choose+=("uboot" "build_uboot")
choose+=("kernel" "build_kernel")
choose+=("recovery" "build_recovery")
choose+=("buildroot" "build_rootfs buildroot")
choose+=("debian" "build_rootfs debian")
choose+=("yocto" "build_rootfs yocto")
choose+=("save" "build_save")
choose+=("all" "build_all")

# 使用whiptail创建菜单，保存用户选择的选项到变量OPTIONS中
OPTIONS=$(whiptail --title "${titlestr}" --backtitle "${backtitle}" --notags \
                            --menu "${menustr}" "${TTY_Y}" "${TTY_X}" $((TTY_Y - 8))  \
                            --cancel-button Exit --ok-button Select "${choose[@]}" \
                            3>&1 1>&2 2>&3)
echo $OPTIONS
~~~

​	图像示例如下所示：
![image-20231225073426133](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312250734246.png)	然后进行简单的修改将脚本修改为两页。具体脚本内容如下所示：

~~~shell
#/bin/bash 
titlestr="选择一个选项"  # 标题字符串
backtitle="iTOP-RK3568构建脚本，http://www.topeet.com"  # 返回标题，网站链接
menustr="Compile image | uboot| kernel| recovery| buildroot | debian | yocto | all"  # 菜单字符串
TTY_X=$(($(stty size | awk '{print $2}')-6))                    # 确定终端宽度
TTY_Y=$(($(stty size | awk '{print $1}')-6))                    # 确定终端高度

# 第一页选项数组，包含选项和对应的函数名
choose_page1+=("uboot" "build_uboot")
choose_page1+=("kernel" "build_kernel")
choose_page1+=("recovery" "build_recovery")
choose_page1+=("save" "build_save")
choose_page1+=("all" "build_all")
choose_page1+=("rootfs" "build_rootfs")

# 第二页选项数组，包含选项和对应的函数名
choose_page2+=("buildroot" "build_rootfs buildroot")
choose_page2+=("debian" "build_rootfs debian")
choose_page2+=("yocto" "build_rootfs yocto")

# 使用whiptail创建第一页菜单，保存用户选择的选项到变量OPTIONS中
OPTIONS=$(whiptail --title "${titlestr}" --backtitle "${backtitle}" --notags \
                    --menu "${menustr}" "${TTY_Y}" "${TTY_X}" $((TTY_Y - 8))  \
                    --cancel-button Exit --ok-button Select "${choose_page1[@]}" \
                    3>&1 1>&2 2>&3)

# 根据用户选择的选项，判断是否需要显示第二页菜单
if [[ $OPTIONS == "rootfs" ]]; then
    # 使用whiptail创建第二页菜单，保存用户选择的选项到变量OPTIONS中
    OPTIONS=$(whiptail --title "${titlestr}" --backtitle "${backtitle}" --notags \
                        --menu "${menustr}" "${TTY_Y}" "${TTY_X}" $((TTY_Y - 8))  \
                        --cancel-button Exit --ok-button Select "${choose_page2[@]}" \
                        3>&1 1>&2 2>&3)
fi

echo $OPTIONS
~~~

这是第一页的内容：
![image-20231225074324294](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312250743408.png)	这是第二页的内容：
![image-20231225074424898](https://chai-1301855619.cos.ap-beijing.myqcloud.com/202312250744974.png)	还有许多要改的内容，就比如上面的标题，然后那个提示文字等等，这些都需要改，慢慢来吧，最后对该命令的介绍进行总结：当我们需要在终端界面中创建交互式的对话框和菜单时，Whiptail是一个非常有用的命令行工具。它提供了一种简单的方式来创建和显示对话框、消息框、输入框、菜单等，并且可以捕获用户的选择和输入。下面我将详细介绍Whiptail命令及其使用方法。

Whiptail命令的基本语法如下：

```
whiptail [选项] [标题] [高度] [宽度] [默认值]
```

选项可以用来配置对话框的外观和行为，标题是对话框的标题栏文本，高度和宽度指定对话框的尺寸，而默认值是可选的，用于设置输入框的默认值。

下面是Whiptail命令中常用的选项：

- `--title <文本>`：设置对话框的标题。
- `--backtitle <文本>`：设置对话框的返回标题，通常用来显示相关的信息或链接。
- `--yesno <文本> <高度> <宽度>`：显示一个简单的是/否对话框，用户可以选择是或否。
- `--msgbox <文本> <高度> <宽度>`：显示一个简单的消息框，只用于显示信息，没有用户选择。
- `--inputbox <文本> <高度> <宽度> [默认值]`：显示一个输入框，用户可以输入文本。
- `--passwordbox <文本> <高度> <宽度>`：显示一个密码输入框，用户输入的内容会被隐藏。
- `--menu <文本> <高度> <宽度> <菜单项1> <菜单项2> ...`：显示一个菜单，用户可以从选项中选择一个。
- `--checklist <文本> <高度> <宽度> <菜单项1> <菜单项2> ...`：显示一个复选框菜单，用户可以选择多个选项。
- `--radiolist <文本> <高度> <宽度> <菜单项1> <菜单项2> ...`：显示一个单选框菜单，用户可以从选项中选择一个。
- `--textbox <文件> <高度> <宽度>`：显示一个只读文本框，用于显示文件中的内容。

除了上述选项之外，Whiptail还提供了其他一些选项和功能，例如`--yes-button`、`--no-button`、`--defaultno`、`--nocancel`等，用于自定义对话框的按钮和默认行为。

使用Whiptail命令创建对话框时，用户的选择和输入可以通过标准输出返回，可以使用命令替换或重定向来捕获这些值。例如，可以将用户选择的选项保存到变量中：

```
OPTIONS=$(whiptail --menu "请选择一个选项" 10 40 3 \
           "1" "选项1" \
           "2" "选项2" \
           "3" "选项3" \
           3>&1 1>&2 2>&3)
```

在上面的例子中，用户选择的选项将保存在变量`OPTIONS`中。使用`3>&1 1>&2 2>&3`的重定向语法可以将标准输出和标准错误输出互换，这样可以将用户的选择输出到标准输出。

Whiptail还提供了一些辅助功能，例如获取终端的尺寸可以使用`stty size`命令，并结合算术运算来动态计算对话框的尺寸。这对于使对话框在不同终端上具有良好的可移植性非常有用。

总结一下，Whiptail是一个功能强大的命令行工具，用于创建交互式的对话框和菜单。它提供了当我们需要在终端界面中创建交互式的对话框和菜单时，Whiptail是一个非常有用的命令行工具。它提供了一种简单的方式来创建和显示对话框、消息框、输入框、菜单等，并且可以捕获用户的选择和输入。下面我将详细介绍Whiptail命令及其使用方法。

# 9 实战

~~~bash
set tabstop=4 "设置tab按键为四个字符
set shiftwidth=4 "设置缩进为四个字符
~~~



## 9.1 在PATH 中查找程序

~~~shell
#!/bin/bash

# in_path 函数用于检查给定命令是否在指定路径中可执行
in_path()
{
    cmd=$1 ourpath=$2 result=1
    oldIFS=$IFS IFS=":"
    for directory in $ourpath
    do
        if [ -x $directory/$cmd ] ; then
            result=0
        fi
    done
    IFS=$oldIFS
    return $result
}

# checkForCmdInPath 函数用于检查指定命令是否在环境变量 PATH 中可执行
checkForCmdInPath()
{
    var=$1
    if [ "$var" != "" ] ; then
        if [ "${var:0:1}" = "/" ] ; then
            if [ ! -x $var ] ; then
                return 1
            fi
        elif ! in_path $var "$PATH" ; then
            return 2
        fi
    fi
}

# 检查参数数量是否正确
if [ $# -ne 1 ] ; then
    echo "使用方法: $0 命令" >&2
    exit 1
fi

# 调用 checkForCmdInPath 函数检查命令是否在 PATH 中
checkForCmdInPath "$1"
case $? in
    0 ) echo "$1 在 PATH 中找到" ;;
    1 ) echo "$1 未找到或不可执行" ;;
    2 ) echo "$1 未在 PATH 中找到" ;;
esac

exit 0
~~~

​	**知识点1：$用法**

1. `$1`：表示脚本中的第一个参数。在这个脚本中，`$1` 用于获取传递给脚本的命令参数。
2. `$2`：表示脚本中的第二个参数。在 `in_path` 函数中，`$2` 用于获取传递给该函数的第二个参数，即路径。
3. `$IFS`：表示内部字段分隔符（Internal Field Separator）。在脚本中，`$IFS` 用于保存原始的字段分隔符，并在后续代码中修改为 `:`，以便在路径中进行分隔。
4. `${var:0:1}`：表示对变量 `var` 进行字符串截取。`${var:0:1}` 表示从字符串的第一个字符开始，截取长度为 1 的子字符串。在脚本中，`${var:0:1}` 用于检查给定的命令是否是以 `/` 开头。
5. `"$var"`：表示对变量进行引用。在脚本中，`"$var"` 用于将变量 `var` 的值作为字符串进行引用，以便在条件语句中进行判断。
6. `$?`：表示上一个命令的退出状态。在脚本中，`$?` 用于获取 `checkForCmdInPath` 函数的返回值，即命令是否在 PATH 中可执行的状态。
7. `$#` ：表示传递给脚本的参数数量。

​	**知识点2：if语法**

​		在Shell脚本中，`if`语句是用于执行条件判断的控制结构。它的基本语法如下：

```bash
if [ condition ]; then
    # 执行条件为真时的代码块
else
    # 执行条件为假时的代码块
fi
```

`if`语句的工作原理如下：

1. 首先，`if`关键字标识条件语句的开始。
2. 紧接着是一个条件表达式，用于判断条件的真假。条件表达式通常使用方括号 `[ ]` 来包裹，且表达式与方括号之间需要有空格。
3. 如果条件表达式的结果为真（非零），则执行`then`关键字后面的代码块。代码块可以是单行命令或多行代码块，可以包含任何Shell支持的命令。
4. 如果条件表达式的结果为假（零），则跳过`then`代码块，执行`else`关键字后面的代码块（可选）。如果没有`else`部分，整个`if`语句结束。
5. 最后，通过`fi`关键字结束整个`if`语句块。

在条件表达式中，可以使用各种条件判断运算符和Shell的内置命令来进行条件判断。常用的条件判断运算符包括：

- `-eq`：等于
- `-ne`：不等于
- `-gt`：大于
- `-lt`：小于
- `-ge`：大于等于
- `-le`：小于等于
- `-z`：判断字符串是否为空
- `-n`：判断字符串是否非空
- `-f`：判断文件是否存在且为普通文件
- `-d`：判断路径是否存在且为目录
- `-x`：判断文件或路径是否可执行

**知识点3：case语句**

在Shell脚本中，`case`语句是一种用于多重条件判断的控制结构。它的基本语法如下：

```bash
case expression in
    pattern1)
        # 匹配 pattern1 执行的代码块
        ;;
    pattern2)
        # 匹配 pattern2 执行的代码块
        ;;
    pattern3)
        # 匹配 pattern3 执行的代码块
        ;;
    *)
        # 默认情况（即未匹配任何模式）执行的代码块
        ;;
esac
```

`case`语句的工作原理如下：

1. 首先，`case`关键字标识多重条件语句的开始。
2. `expression`是要进行匹配的表达式或变量。通常，`expression`是一个变量，你希望根据其值进行多重条件判断。
3. 接下来，使用`in`关键字表示要开始进行模式匹配。
4. 然后，每个模式使用圆括号`()`包括起来，并在每个模式后面加上`)`。
5. 对于每个模式，如果`expression`的值与模式相匹配，则执行与该模式对应的代码块。代码块可以是单行命令或多行代码块，可以包含任何Shell支持的命令。
6. 每个代码块的结尾需要使用两个分号`;;`表示结束。
7. 如果`expression`的值未匹配任何模式，则执行`*)`后面的代码块（即默认情况）。这部分代码块是可选的。
8. 最后，通过`esac`关键字结束整个`case`语句块。

以下是一个具体的示例：

```bash
#!/bin/bash

fruit="apple"

case $fruit in
    "apple")
        echo "这是一个苹果"
        ;;
    "orange")
        echo "这是一个橘子"
        ;;
    "banana")
        echo "这是一个香蕉"
        ;;
    *)
        echo "未知的水果"
        ;;
esac
```

在上述示例中，我们使用变量`fruit`作为匹配表达式。根据`$fruit`的值，`case`语句会依次进行模式匹配。如果`$fruit`的值匹配到某个模式（例如，"apple"），则执行与该模式对应的代码块（输出"这是一个苹果"）。如果`$fruit`的值未匹配到任何模式，则执行默认情况下的代码块（输出"未知的水果"）。

## 9.2 验证输入：仅限字母和数字

~~~bash
#!/bin/bash

# 定义函数，用于验证字符串是否仅由字母和数字组成
volidAlphaNum()
{
    # 通过sed命令将输入的字符串中的非字母和数字字符替换为空字符串
    validchars="$(echo $1 | sed 's/[^[:alnum:]]//g')"
    
    # 比较替换后的字符串与原始输入的字符串是否相等
    # 如果相等，说明输入的字符串仅由字母和数字组成，返回0
    if [ "$validchars" = "$1" ] ; then
        return 0
    else
        # 如果不相等，说明输入的字符串包含非字母和数字字符，返回1
        return 1
    fi
}

# 输出提示并读取用户输入
echo -n "请输入输入内容:"
read input

# 调用验证函数检查输入的内容是否仅由字母和数字组成
if ! volidAlphaNum "$input" ; then
    # 如果验证函数返回非0，说明输入的内容包含非字母和数字字符
    echo "错误：输入内容必须仅包含字母和数字" >&2
    exit 1
else
    # 如果验证函数返回0，说明输入的内容仅由字母和数字组成
    echo "输入内容有效"
fi

# 脚本正常结束，退出状态码为0
exit 0
~~~

**知识点**1 **read**

在Shell脚本中，`read` 是一个用于读取用户输入的命令。它允许脚本暂停执行，等待用户从标准输入（通常是键盘）输入一行文本，并将输入的内容保存到一个或多个变量中。

`read` 命令的基本语法如下：

```bash
read [options] [variable ...]
```

其中，`options` 是一些可选的参数，用于控制 `read` 命令的行为。`variable` 是一个或多个变量名，用于保存用户输入的值。

以下是一些常用的 `read` 命令选项：

- `-p prompt`：显示一个提示符，提示用户输入。`prompt` 是要显示的提示信息，可以是字符串或变量。示例：`read -p "Enter your name: " name`
- `-s`：静默模式，用户输入内容时不回显在终端上，适用于输入密码等敏感信息。示例：`read -s password`
- `-n num`：读取指定数量的字符后立即返回，而不需要等待用户按下回车键。`num` 是要读取的字符数。示例：`read -n 1 key` 读取一个字符。
- `-t timeout`：设置等待用户输入的超时时间（秒），如果超过指定时间没有输入，则 `read` 命令返回一个非零的退出状态码。示例：`read -t 5 input` 设置等待时间为5秒。

**知识点2 sed**

​	在Shell脚本中，`sed`（Stream Editor）是一种流式文本编辑器，用于处理和转换文本流。它可以读取输入流中的文本，根据指定的编辑命令对文本进行修改，并将结果输出到标准输出流。

`sed` 命令的基本语法如下：

```bash
sed [options] 'command' file
```

其中，`options` 是一些可选的参数，用于控制 `sed` 命令的行为。`'command'` 是一个或多个编辑命令，用于指定要对文本进行的操作。`file` 是要处理的输入文件。

以下是一些常用的 `sed` 命令选项：

- `-n`：禁止默认输出，只输出经过编辑处理后的结果。如果没有使用 `-n`，则 `sed` 会默认将每一行的结果输出到标准输出。
- `-e script`：指定要执行的编辑命令。可以在一个 `sed` 命令中指定多个编辑命令，使用 `-e` 分隔它们。
- `-i`：原地编辑，直接修改输入文件，而不是将结果输出到标准输出。使用 `-i` 选项时可以指定备份文件的扩展名，备份文件会保留原始文件的副本。
- `-r`（或 `-E`）：启用扩展的正则表达式语法，可以使用更强大的正则表达式功能。

`sed` 命令的编辑命令由一个或多个操作组成，每个操作由一个地址和一个命令组成。地址指定了要应用命令的行范围，命令指定了要对行执行的操作。

以下是一些常用的 `sed` 命令操作：

- `s/regexp/replacement/`：替换操作，将与正则表达式 `regexp` 匹配的文本替换为 `replacement`。例如：`sed 's/apple/orange/' file` 将文件中的 "apple" 替换为 "orange"。
- `p`：打印操作，输出指定范围内的行。例如：`sed -n '1,10p' file` 打印文件中的前10行。
- `d`：删除操作，删除指定范围内的行。例如：`sed '5,10d' file` 删除文件中的第5到第10行。
- `i\text`：插入操作，向指定行之前插入文本。例如：`sed '3i\This is a new line.' file` 在文件的第3行之前插入一行文本。
- `a\text`：追加操作，向指定行之后追加文本。例如：`sed '3a\This is a new line.' file` 在文件的第3行之后追加一行文本。

`sed 's/[^[:alnum:]]//g'`：这是 `sed` 命令的一部分，用于对输入的文本进行替换操作。

1. `s/[^[:alnum:]]//g` 是一个替换命令，用于将输入中的非字母数字字符替换为空字符串。
2. `[^[:alnum:]]` 是一个正则表达式，表示匹配任何非字母数字字符。
3. `//` 是替换命令的分隔符，用于指定要替换的文本为空字符串。
4. `g` 是替换命令的标志，表示要替换所有匹配项，而不是只替换第一个匹配项。

## 9.3 规范日期格式

~~~bash
#!/bin/bash

mounthNumToName()
{
    case $1 in
        1 ) month="Jan";; 2 ) month="Feb" ;;
        3 ) month="Mar";; 4 ) month="Apr";;
        5 ) month="May";; 6 ) month="Jun";;
        7 ) month="Jul";; 8 ) month="Aug";;
        9 ) month="Sep";; 10 ) month="Oct";;
        11 ) month="Nov";; 12 ) month="Dec";;
        * ) echo "$0: 未知的月份数值 $1" >&2
            exit 1
    esac
    return 0
}

# 检查参数数量是否正确
if [ $# -ne 3 ] ; then
    echo "用法: $0 月份 日  年份" >&2
    exit 1
fi

# 检查年份是否为4位数字
if [ $3 -le 99 ] ; then
    echo "$0: 预期为4位数字的年份" >&2
    exit 1
fi

# 检查月份是否为纯数字
if [ -z $(echo $1|sed 's/[[:digit:]]//g') ] ; then
    # 如果是纯数字，则调用函数将月份转换为对应的名称
    mounthNumToName $1
else
    # 如果不是纯数字，则将首字母大写，后续字母小写
    month="$(echo $1| cut -c1|tr '[:lower:]' '[:upper:]')"
    month="$month$(echo $1|cut -c2-3 | tr '[:upper:]' '[:lower:]')"
fi

echo $month $2 $3
~~~

## 9.4 美化多位数字

~~~shell
#!/bin/bash
# nicenumber--给定一个数字，以逗号分隔的形式显示它。
#   需要DD（小数点分隔符）和TD（千位分隔符）被实例化。如果指定了第二个参数，
#   则将输出回显到标准输出。

nicenumber()
{
  # 注意，我们假设“.”是此脚本输入值中的小数分隔符。
  # 输出值中的小数分隔符是“.”，除非用户使用-d标志指定。

  integer=$(echo $1 | cut -d. -f1)        # 小数点左边
  decimal=$(echo $1 | cut -d. -f2)        # 小数点右边

  # 检查我们的数字是否除了整数部分之外还有其他部分。
  if [ "$decimal" != "$1" ]; then
    # 存在小数部分，因此将其包含在内。
    result="${DD:= '.'}$decimal"
  fi

  thousands=$integer

  while [ $thousands -gt 999 ]; do
    remainder=$(($thousands % 1000))    # 三个最低有效位
    
    # 我们需要“remainder”是三位数。我们需要添加零吗？
    while [ ${#remainder} -lt 3 ] ; do  # 强制前导零
      remainder="0$remainder"
    done

    result="${TD:=","}${remainder}${result}"    # 从右向左构建
    thousands=$(($thousands / 1000))    # 如果有余数，则向左移动
  done

  nicenum="${thousands}${result}"
  if [ ! -z $2 ] ; then
    echo $nicenum
  fi
}

DD="."  # 小数点分隔符，用于分隔整数和小数部分
TD=","  # 千位分隔符，用于每三位数分隔

# 开始主脚本
# =================

while getopts "d:t:" opt; do
  case $opt in
    d ) DD="$OPTARG"    ;;
    t ) TD="$OPTARG"    ;;
  esac
done
shift $(($OPTIND - 1))

# 输入验证
if [ $# -eq 0 ] ; then
  echo "Usage: $(basename $0) [-d c] [-t c] numeric_value"
  echo "  -d 指定小数点分隔符（默认为'.'）"
  echo "  -t 指定千位分隔符（默认为','）"
  exit 0
fi

nicenumber $1 1         # 第二个参数强制nicenumber将输出回显。

exit 0
~~~

**重点1：**
	`getopts` 是一个用于处理命令行选项的 Bash 内置命令。它可以帮助你解析和处理脚本或命令的命令行参数。`getopts` 在循环中使用，每次循环处理一个选项，并将其与相应的参数关联起来。

`getopts` 命令的语法如下：

```bash
getopts optstring variable [args]
```

- `optstring`：定义了脚本支持的选项列表，每个选项由一个字母表示。如果选项后面带有冒号（`:`），则表示该选项需要附加参数。
- `variable`：用于存储当前解析的选项的变量名。
- `args`：可选参数，用于指定要解析的命令行参数列表。如果省略，则默认使用脚本的命令行参数。

在使用 `getopts` 时，你需要在脚本中使用一个 `while` 循环来处理每个选项。在循环中，`getopts` 会将当前解析的选项存储在 `variable` 变量中，并将附加的参数存储在特殊变量 `OPTARG` 中。

以下是一个简单的示例，展示了如何使用 `getopts` 处理命令行选项：

```bash
#!/bin/bash

while getopts "a:b:" opt; do
  case $opt in
    a)
      echo "选项 -a，参数为 $OPTARG"
      ;;
    b)
      echo "选项 -b，参数为 $OPTARG"
      ;;
    \?)
      echo "无效的选项： -$OPTARG"
      ;;
  esac
done

# 运行脚本并传递选项和参数
# ./script.sh -a value1 -b value2

# 输出：
# 选项 -a，参数为 value1
# 选项 -b，参数为 value2
```

在这个示例中，脚本使用 `getopts` 解析了两个选项 `-a` 和 `-b`，并将它们的参数打印出来。如果脚本遇到无效的选项，则会打印出错误信息。

总之，`getopts` 命令是一个用于处理命令行选项的工具，可以帮助你编写更灵活和可配置的脚本。

**重点2：**

- `-z string`：判断给定的字符串是否为空。如果字符串为空，则条件为真。
- `-n string`：判断给定的字符串是否非空。如果字符串非空，则条件为真。
- `string1 = string2`：判断两个字符串是否相等。如果相等，则条件为真。
- `string1 != string2`：判断两个字符串是否不相等。如果不相等，则条件为真。
- `file1 -eq file2`：判断两个文件是否具有相同的设备号和 inode 号。如果相同，则条件为真。
- `file1 -nt file2`：判断文件 1 是否比文件 2 更新（修改时间更晚）。如果是，则条件为真。
- `file1 -ot file2`：判断文件 1 是否比文件 2 更旧（修改时间更早）。如果是，则条件为真。
- `num1 -eq num2`：判断两个数字是否相等。如果相等，则条件为真。
- `num1 -ne num2`：判断两个数字是否不相等。如果不相等，则条件为真。
- `num1 -lt num2`：判断 num1 是否小于 num2。如果是，则条件为真。
- `num1 -le num2`：判断 num1 是否小于等于 num2。如果是，则条件为真。
- `num1 -gt num2`：判断 num1 是否大于 num2。如果是，则条件为真。
- `num1 -ge num2`：判断 num1 是否大于等于 num2。如果是，则条件为真。

## 9.5 验证整数输入

~~~shell
#!/bin/bash
# validint--验证整数输入，允许负数。

validint()
{
  # 验证第一个字段，并将其与提供的最小值 $2 和/或最大值 $3 进行比较：
  # 如果值不在范围内或不仅由数字组成，则失败。

  number="$1";      min="$2";      max="$3"

  if [ -z $number ] ; then
    echo "您未输入任何内容。请输入一个数字。" >&2 ; return 1
  fi

  # 第一个字符是否为 '-' 符号？
  if [ "${number%${number#?}}" = "-" ] ; then
    testvalue="${number#?}" # 提取除第一个字符外的所有字符进行测试。
  else
    testvalue="$number"
  fi
  
  # 创建一个没有数字的版本，用于测试。
  nodigits="$(echo $testvalue | sed 's/[[:digit:]]//g')"
  
  # 检查是否存在非数字字符。
  if [ ! -z $nodigits ] ; then
    echo "无效的数字格式！只允许数字，不允许逗号、空格等。" >&2
    return 1
  fi
  
  if [ ! -z $min ] ; then
    # 输入值是否小于最小值？
    if [ "$number" -lt "$min" ] ; then
      echo "$number 太小了：最小可接受值为 $min" >&2
      return 1
    fi
  fi
  if [ ! -z $max ] ; then
    # 输入值是否大于最大值？
    if [ "$number" -gt "$max" ] ; then
      echo "您的值太大了：最大可接受值为 $max" >&2
      return 1
    fi
  fi
  return 0
}

# 输入验证
if validint "$1" "$2" "$3" ; then
  echo "输入是一个在您约束条件内的有效整数"
fi
~~~

## 9.6 验证浮点数输入

~~~shell
#!/bin/bash
# validfloat--检测一个数字是否是有效的浮点数。
#   注意，此脚本无法接受科学计数法（1.304e5）表示的浮点数。

# 为了测试输入值是否是有效的浮点数，我们需要将该值拆分为两部分：整数部分和小数部分。
# 我们可以测试第一部分，看它是否是有效的整数，然后再测试第二部分是否是有效的 >=0 整数。
# 因此，-30.5 被认为是有效的，但 -30.-8 不是。

# 要在此脚本中包含另一个 shell 脚本作为一部分，可以使用 "." 来源符号。非常简单。

. validint   # Bourne shell 的方式，引入 validint 函数

validfloat()
{
  fvalue="$1"

  # 检查输入的数字是否有小数点。
  if [ ! -z $(echo $fvalue | sed 's/[^.]//g') ] ; then

    # 提取小数点前的部分（比如 '3.14' 中的 '3'）。
    decimalPart="$(echo $fvalue | cut -d. -f1)"

    # 提取小数点后的数字部分（比如 '3.14' 中的 '14'）。
    fractionalPart="${fvalue#*\.}"

    # 首先测试小数部分，即小数点左边的部分。

    if [ ! -z $decimalPart ] ; then
      # "!" 反转了测试逻辑，所以下面的条件表示 "如果不是有效的整数"
      if ! validint "$decimalPart" "" "" ; then
        return 1
      fi 
    fi

    # 现在测试小数部分（小数点右边的值）。
    # 首先，小数点后面不能有负号，比如 33.-11，所以我们要检查小数部分是否包含负号。
    if [ "${fractionalPart%${fractionalPart#?}}" = "-" ] ; then
      echo "无效的浮点数：小数点后面不允许有负号" >&2  # >&2 将输出发送到 stderr。
      return 1
    fi 
    if [ "$fractionalPart" != "" ] ; then 
      # 如果小数部分不是有效的整数...
      if ! validint "$fractionalPart" "0" "" ; then
        return 1
      fi
    fi
  else 
    # 如果整个值只是 "-"，也是不允许的。
    if [ "$fvalue" = "-" ] ; then
      echo "无效的浮点格式。" >&2 ; return 1
    fi

    # 最后，检查剩余的数字是否是有效的整数。
    if ! validint "$fvalue" "" "" ; then
      return 1
    fi
  fi

  return 0
}

if validfloat $1 ; then
  echo "$1 是一个有效的浮点数"
fi

exit 0
~~~

