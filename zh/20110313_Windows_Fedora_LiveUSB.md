# Windows 版的 Fedora LiveUSB Creator 找不到 7z 的问题及解决办法

发布时间: *2011-03-13 15:42:00*

简介: <br />Fedora 有个 LiveUSB Creator 小工具，可以方便地把 Fedora 系统安装镜像制作成一个 USB 启动盘。注意请仅从以下官方网站下载，其它网站上的可能含有病毒！<br /><br />https://fedorahosted.org/liveusb-creator/<br /><br />这个工具程序其实很简单，尽管下载下来的是个安装程序，但可以不用运行安装，直接用 Winrar 之类的解压工具解压出来，然后运行 liveusb-creator.exe 就行了。问题

原文链接: [https://snowpeak.blog.csdn.net/article/details/6246435](https://snowpeak.blog.csdn.net/article/details/6246435)

---------

Fedora 有个 LiveUSB Creator 小工具，可以方便地把 Fedora 系统安装镜像制作成一个 USB 启动盘。注意请仅从以下官方网站下载，其它网站上的可能含有病毒！  
  
https://fedorahosted.org/liveusb-creator/  
  
这个工具程序其实很简单，尽管下载下来的是个安装程序，但可以不用运行安装，直接用 Winrar 之类的解压工具解压出来，然后运行 liveusb-creator.exe 就行了。问题这样解压出来的虽然可以运行，但运行时会报错  
  
Cannot find 7z.  
Make sure to extract the entire liveusb-creator zip file before running this program.  
LiveUSB creation failed!  
  
后来查了 Fedora 自己的网站反馈  
https://fedorahosted.org/liveusb-creator/ticket/473  
  
原来是现在这版 Windows 的对路径有限制，即整套程序必须放在  
  
C:/Program Files/LiveUSB Creator/  
  
目录下，才能正常运行。所以不论是自己解压来运行，还是运行安装程序的，都要保证它装到上述路径下，其它路径都不行。