# “Apache2 服务无法启动。发生服务特定错误: 1.”的一种情况及解决

发布时间: *2008-06-18 11:12:00*

分类: __系统管理__

---------

## [“Apache2 服务无法启动。发生服务特定错误: 1.”的一种情况及解决](/cn/article/detail/a_solution_to_apache_2_specific_error_1/)

分类: [系统管理](/cn/article/category/system_operation/) 2008-06-18 11:12:00 阅读(2709)

Windows 系统下配置 Apache 服务有时会遇到

Apache2 服务无法启动。

发生服务特定错误: 1.

请键入 NET HELPMSG 3547 以获得更多的帮助。

的错误，这种错误可能有多种原因引起。我今天发现配置文件注释用得不对也是造成这个错误的一个原因：配置文件 httpd.conf 中如果写注释，注释以 # 开头必须单独放在一行中。而在某个配置项同一行写了 # 注释，就会造成以上无法启动的问题。解决办法就是把注释都单独放在一行。这只是无法启动的一个可能的原因，希望给遇到这个问题的朋友多一点思路，多一点帮助。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/a_solution_to_apache_2_specific_error_1/*
