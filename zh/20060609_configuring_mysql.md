# JRun 使用 Connector/J 驱动程序连接 MySQL 数据库

发布时间: *2006-06-09 11:15:00*

分类: __综合开发__

---------

## [JRun 使用 Connector/J 驱动程序连接 MySQL 数据库](/cn/article/detail/configuring_mysql_41_with_jrun_4_using_the_connectorj_driver/)

分类: [综合开发](/cn/article/category/comprehensive_development/) 2006-06-09 11:15:00 阅读(2743)

MySQL 推出新版 JDBC 驱动程序叫 Connector/J ，原有的 JRun 中 JDBC 数据源使用 MySQL 的配置就不灵了，我参考了Macromedia 的官方 TechNote，结合自己实践，配置成功，把我的配置分享如下。

以下配置方法测试通过，环境：Windows 2000 Advanced Server (SP4) + JRun 4.0.5.27373 + MySQL 4.0.16，MySQL Connector/J JDBC 驱动程序使用的是 mysql-connector-java-3.1.12-bin.jar。

1、下载最新版MySQL Connector/J JDBC 驱动程序，解压后把 mysql-connector-java-3.{n}-bin.jar 放在 JRun-home/servers/lib 文件夹下

2、重启 JRun 服务器

3、在admin站点中，配置了admin站点，所以 JRun 的站点都可以用这个配置了，点选 Resources 下的 JDBC Data Sources，新建一个 JDBC Data Source，Data Source Name 可以自己起个意义明确的名字，如 Mysql，Database Driver 菜单选Not-Listed，然后点 Add。

4、在然后出现的详情页，Driver Class填写：com.mysql.jdbc.Driver，URL 填写 MySQL 的标准地址，如：
jdbc:mysql://localhost/northwind
如需要，填写用户名、密码及其它数据源设置。点Actions 下的 Verify按钮测试数据源，这时正常的话应该显示“Connected to Mysql successfully.
（成功连接Mysql）”，如果不行，可以重启JRun 服务器再试。

翻译自 Macromedia 的官方 TechNote

原文地址：[http://kb2.adobe.com/cps/000/5fa26cba.html](http://www.adobe.com/go/5fa26cba)





---
*原文链接: https://www.snowpeak.fun/cn/article/detail/configuring_mysql_41_with_jrun_4_using_the_connectorj_driver/*
