# 用 TigerVNC 实现 Linux 远程桌面

发布时间: *2011-11-28 17:40:00*

简介: tigervnc 配置1. 确认 SSH 在运行2. 安装 TigerVNC Serveryum install tigervnc-server已经安装过的yum info tigervnc-server可以查看已安装的情况3. 配置显示分辨率、商品和用户编辑 /etc/sysconfig/vncservers参考注释掉的最后两行，添加 2 行

原文链接: [https://snowpeak.blog.csdn.net/article/details/7020452](https://snowpeak.blog.csdn.net/article/details/7020452)

---------

tigervnc 配置   
1\. 确认 SSH 在运行   
2\. 安装 TigerVNC Server   
yum install tigervnc-server   
  
  
已经安装过的   
yum info tigervnc-server   
可以查看已安装的情况   
  
  
3\. 配置显示分辨率、商品和用户   
编辑 /etc/sysconfig/vncservers   
参考注释掉的最后两行，添加 2 行   
  
  
VNCSERVERS="2:myname"   
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp"   
  
  
这一步先把 -localhost 去掉。   
  
  
4\. 配置 VNC 桌面环境及密码   
以前述配置的用户名登录 Linux，再启动 vncserver ，这时 vncserver 加载相应用户的本地路径和环境信息等，从而把此用户的 VNC 认证、日志等存储到相应的路径下。   
命令行执行：   
$ vncserver   
首次执行时会提示设置密码，按提示输入好即可。   
  
  
You will require a password to access your desktops.   
  
  
Password:   
Verify:   
  
  
xauth: creating new authority file /home/xf/.Xauthority   
  
  
New 'xf:1 (xf)' desktop is xf:1   
  
  
Creating default startup script /home/xf/.vnc/xstartup   
Starting applications specified in /home/xf/.vnc/xstartup   
Log file is /home/xf/.vnc/xf:1.log   
  
  
如上所示，在当前用户目录下生成了 .vnc 目录及若干文件。   
  
  
5\. 启动 VNC Server 服务   
以管理员身份登录，先停止服务   
# service vncserver stop   
如果看到错误信息，没关系，只是说明此服务尚未启动。   
  
  
启动服务   
# service vncserver start   
  
  
原文的第 6 步 SELinux 和第 7 步防火墙我没用到，因为已经直接把它们都关闭了。   
  
  
8\. 配置路由器的端口转发   
我这里没有路由器，跳过   
  
  
9\. 安装 VNC 客户端   
Windows 系统可以用 VNC Viewer，Fedora Linux 有系统自带的 Remote Desktop Viewer，还可以自己选择安装其它很好的客户端软件，如 TightVNC 客户端等。   
  
  
10\. 连接 VNC 服务器   
这时应该可以连接了，从另一台机器访问一下。   
在连接地址输入远程机器的名字或IP地址，默认端口是 5902，如：   
10.0.10.208:5092   
按提示输入前面该用户自己登录时用 vncserver 设置的密码，正常的话应该可以看到远程的桌面了。注意 VNC 启动的是完全不同的第二个桌面，和用户自己直接在 Linux 机器上登录看到的桌面不同，桌面喜好可以分别配置。   
  
  
11\. 通过 SSH Tunnel (SSH 隧道) 连接   
SecureCRT 先创建好到目标 Linux 服务器的连接，然后选项菜单->会话选项->连接->端口转发，在“本地端口转发”点“添加”，在名称里写一个描述性的名字，如“VNC”，然后在本地的端口和远程的端口都写上远程 VNC 服务器使用的端口，这里都是 5902。退出再重新连接。   
  
  
  
  
12\. 服务器端设置安全   
以管理员身份登录   
编辑 /etc/sysconfig/vncservers   
把   
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp"   
加上   
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp -localhost"   
然后再   
# service vncserver restart   
然后必须保持 SecureCRT 连接状态，再打开 VNC 客户端，此时连接服务器的地址要从之前的 ip地址:5902 改成 localhost:5902 ，就可以连接了。