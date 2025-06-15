# 无插件在Eclipse中配置Resin方法

发布时间: *2010-04-14 22:36:00*

分类: __服务器端技术__

---------

## [无插件在Eclipse中配置Resin方法](/cn/article/detail/support_resin_in_eclipse_without_plugin/)

分类: [服务器端技术](/cn/article/category/server_side_technology/) 2010-04-14 22:36:00 阅读(3077)

Eclipse 3.5 + Resin 2.1.17 或 Resin 3.1.10 测试通过。

### 一、配置 Resin

1\. Resin 安装路径下的 resin.conf 里 java compiler 改用 javac，这样可以使用系统 JDK 的编译器，方便在 Eclipse 里的配置，并且可以让编译的错误信息显示为中文。如 Resin 2 的用

<java compiler="javac" compiler-args=""/>

resin 3 用

<javac compiler="javac" args="-source 1.5"/>

如果运行 Resin 时报找不到编译路径，可以使用完整的路径，比如：

compiler="C:/jdk1.6.0_19/bin/javac"

2\. 然后在 resin.conf 里新建一个应用，如 Resin2 的配置文件在 </host> 前加一行

<web-app id="/resin2" app-dir="/path/to/resin2/WebRoot">

</web-app>

### 二、Eclipse 配置

为上面配置的 网站应用 resin2 新建一个工程。

然后配置 Eclipse，Run Configurations.. 在 Java Application 下新建一个，名字随便起，比如“Resin2”，然后在选项各页相应设置：

1\. Main

项目：我们选择刚刚新建的 resin2 项目。

Main类：Resin3 的填写 com.caucho.server.resin.Resin

Resin2 的填写 com.caucho.server.http.HttpServer

2\. Arguments

Program arguments:

-conf "C:/Server/resin-2.1.17/conf/resin.conf"

这里写 Resin 自己的配置文件完整路径。

VM arguments:

-Dresin.home="C:/Server/resin-3.1.10"

-DJava.util.logging.manager=com.caucho.log.LogManagerImpl

如果是开发Tapestry，需要page可以自动更新，那再添加：

-Dorg.apache.tapestry.enable-reset-service=true

-Dorg.apache.tapestry.disable-caching=true]

3\. JRE：选择自己系统安装的JRE。

4\. Classpath：添加Resin home的lib下的jar，为方便起见，可以把这些 jar 包做一个 User Library。

其它项目默认或根据情况自己定制即可。

配置好之后点击“应用”按钮，然后点击下面的“运行”按钮即可运行该项目。并且在工具栏的 Run 工具下会多出一个刚才配置的 Resin2 运行。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/support_resin_in_eclipse_without_plugin/*
