# Resin 报错乱码解决

发布时间: *2008-12-30 13:56:00*

分类: __服务器端技术__

---------

## [Resin 报错乱码解决](/cn/article/detail/a_solution_to_garbled_error_message_by_resin/)

分类: [服务器端技术](/cn/article/category/server_side_technology/) 2008-12-30 13:56:00 阅读(2430)

Windows 2003 Server 简体中文版安装 resin-pro-3.1.8，报错信息都是乱码

改了 resin 安装目录下的 resin.conf


    <javac compiler="internal" args="-source 1.5"/>

改成


    <javac compiler="javac" args="-source 1.5"/>

就好了，而且由于我本地安装的 JDK 是中文版，这时编译错误还成了 javac 返回的中文呢！


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/a_solution_to_garbled_error_message_by_resin/*
