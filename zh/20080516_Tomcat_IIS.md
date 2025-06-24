# Tomcat 整合进 IIS

发布时间: *2008-05-16 17:35:00*

简介: 网上也有不少探讨，我结合各家介绍及查错，经过几天努力，也试通一种方案。我知道 Java 的东西鲜有“放之四海而皆准”的解决方案，分享在此，只为给大家提供多点思路。环境：Windox XP SP2 下的 IIS5.1, Windows Server 2003 下的 IIS6.0java version "1.6.0_03"Java(TM) SE Runtime Environment (build 

原文链接: [https://snowpeak.blog.csdn.net/article/details/2452480](https://snowpeak.blog.csdn.net/article/details/2452480)

---------

网上也有不少探讨，我结合各家介绍及查错，经过几天努力，也试通一种方案。我知道 Java 的东西鲜有“放之四海而皆准”的解决方案，分享在此，只为给大家提供多点思路。  
环境：  
Windox XP SP2 下的 IIS5.1, Windows Server 2003 下的 IIS6.0  
java version "1.6.0_03"  
Java(TM) SE Runtime Environment (build 1.6.0_03-b05)  
Apache Tomcat/5.5.25

简要步骤：  
IIS 和 Apache Tomcat 安装过程不再赘述，请自行测试保证IIS 和 Tomcat 已经正常运行，以下都建立在最常用的默认安装路径及设置基础之上，按惯例，我们用 $CATALINA_HOME 表示 Tomcat 安装路径。  
设置Windows 环境变量 :  
JAVA_HOME=c:/j2sdk1.4.0  
CLASSPATH=.;%JAVA_HOME%/lib;%JAVA_HOME%/jre/lib;  
PATH=%JAVA_HOME%/bin;%JAVA_HOME%/jre/bin;

1、下载最新版的jakarta-tomcat-connectors  
[http://archive.apache.org/dist/tomcat/tomcat-connectors/jk2/binaries/win32/?C=M;O=D/](<http://archive.apache.org/dist/tomcat/tomcat-connectors/jk2/binaries/win32/?C=M;O=D/>)  
找形如 jakarta-tomcat-connectors-jk2.0.4-win32-IIS.zip 最新版的文件  
解压出来 isapi_redirector2.dll，放到 $CATALINA_HOME/bin 文件夹下  
2、把 workers.properties 和 workers2.properties 文件放到 $CATALINA_HOME/conf 文件夹下  
这里有我用的2个范例文件，请根据你的具体安装情况更改相应的路径设置

workers.properties 文件

workers.tomcat_home=C:/Server/Tomcat5.5

# workers.java_home should point to your Java installation. Normally  
# you should have a bin and lib directories beneath it.  
#  
workers.java_home=C:/Program Files/Java/jre1.6.0_03

# You should configure your environment slash... ps=/ on NT and / on UNIX  
# and maybe something different elsewhere.  
#  
ps=/

# The workers that your plugins should create and work with  
#  
worker.list=neosmart

#------ DEFAULT ajp13 WORKER DEFINITION ------------------------------  
#---------------------------------------------------------------------  
# Defining a worker named ajp13 and of type ajp13  
# Note that the name and the type do not have to match.  
#  
worker.neosmart.port=8009  
worker.neosmart.host=localhost  
worker.neosmart.type=ajp13

workers2.properties 文件  
[shm]  
info=Scoreboard. Requried for reconfiguration and status with multiprocess servers.  
file=C:/Server/Tomcat5.5/work/workers.shm

# Defines a load balancer named lb. Use even if you only have one machine.  
[lb:lb]

# Example socket channel, override port and host.  
[channel.socket:localhost:8009]  
port=8009  
host=127.0.0.1

# define the worker  
[ajp13:localhost:8009]  
channel=channel.socket:localhost:8009  
group=lb

# Map the Tomcat examples webapp to the Web server uri space  
[uri:/examples/*]  
group=lb

[status:]  
info=Status worker, displays runtime information

[uri:/jkstatus/*]  
info=The Tomcat /jkstatus handler  
group=status:

# Map webapps to the Web server uri space  
[uri:/*.jsp]  
[uri:/*.do]

3、添加注册表  
最简单的方法是把如下内容存成一个注册表文件，扩展名为.reg，直接导入即可。

Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE/SOFTWARE/Apache Software Foundation/Jakarta Isapi Redirector/2.0]  
"serverRoot"="C://Server//Tomcat5.5//"  
"extensionUri"="/jakarta/isapi_redirector2.dll"  
"workersFile"="C://Server//Tomcat5.5//conf//workers2.properties"  
"logLevel"="INFO"

4、IIS设置  
（1）在 IIS 中“网站”右键属性，进入 ISAPI 筛选器，点击 添加 按钮，键入一个新的筛选器名称，名称可以随意起，再点击浏览按钮，选择刚才放在 $CATALINA_HOME/bin 文件夹下的isapi_redirector2.dll。新加完的筛选器状态会是未知，没关系，待会重启后就好了。  
（2）虚拟路径  
选择需要加载Tomcat 服务站点，右键选择新建 > 虚拟目录，创建虚拟目录，别名为jakarta。注意这个名字是固定值，不要拼写错误！  
指定目录为isapi_redirector2.dll 所在目录，即 $CATALINA_HOME/bin 文件夹，在允许权限下要选中“执行”。  
（3）添加映射文件  
IIS 中选中站点 右键点击选择属性，依次“主目录”选项页点“配置”，在“映射” 选项页点“添加”。  
可执行文件选择 isapi_redirector2.dll 所在目录，扩展名为.jsp；再加一个可执行文件相同，扩展名为.do。  
（4）如果是 IIS6.0，还要再添加一个网络服务扩展  
扩展名用 .jsp，需要的文件选isapi_redirector2.dll，然后设置为启用状态。  
5、为合作工作设置相同的虚拟目录  
$CATALINA_HOME/conf 中 server.xml 找到 <Host> 段，里面加一句  
<Context path="/jsp-examples" docBase="C:/Server/Tomcat5.5/webapps/jsp-examples"></Context>  
然后IIS中使用JSP的站点添加一个虚拟路径，名字和指向要和上面一致，即，路径名为 jsp-examples，也要指向 C:/Server/Tomcat5.5/webapps/jsp-examples。  
6、设置权限  
如果系统是 NTFS 区，要把以上isapi_redirector2.dll、各个配置文件所在路径和要运行JSP的路径以及其中的文件都赋给 IUSR_machinename（machinename是机器名，如我的机器名叫 ads，则这个用户就是 IUSR_ads） 用户读和写的权限。  
7、重启 IIS 和 Tomcat  
到ISAPI 筛选器查看，如果看到刚才新添加的ISAPI 筛选器显示为绿色箭头，说明它已经被成功加载了。再到workers2.properties 文件中[shm]段设置的文件路径查看，应该可以看到生成了那个文件，本例中是  
file=C:/Server/Tomcat5.5/work/workers.shm  
这时访问  
[http://localhost/jsp-examplest/](<http://localhost/jsp-examplest/>)  
若能看到结果，则成功完成，恭喜你！

网上说的一些设置，但我没做也能成，包括设系统变量 JAVA_HOME和TOMCAT_HOME。

问题：  
1、如果目录首页是 jsp 文件，有时 IIS 会不认，这没关系，可以通过 IIS 中已经设置的默认首页，如 index.html 页面跳转到首页 jsp 文件就，比如做个 index.html，代码用如下一行就够:  
<meta http-equiv="refresh" content="0; url=index.jsp">

2、我做的过程中主要遇到的是 NTFS 权限问题，常见到IIS报错  
HTTP 401.3 - Access denied by ACL on resource  
Windows XP 对 NTFS 权限非常麻烦，最后试成的就是要给isapi_redirector2.dll、各个配置文件所在路径和要运行JSP的路径以及其中的文件赋给 IUSR_machinename（machinename是机器名，如我的机器名叫 ads，则这个用户就是 IUSR_ads） 用户读和写的权限。  
如果还不行，注意看 Tomcat 的日志和 Windows 事件查看，结合再查。