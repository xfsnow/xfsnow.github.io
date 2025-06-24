# PhpMyAdmin 不能导出数据的一种解决

发布时间: *2011-06-09 14:06:00*

简介: 最近遇到 PhpMyAdmin 不能导出数据的问题，点击导出后先是一个请求失败或者白页，重新刷新后就报错 export.php: Missing parameter: what (FAQ 2.8)export.php: Missing parameter: export_type (FAQ 2.8) 根据网上查的资料，最后确定是 php.ini 设置要调整一下我原来的 

原文链接: [https://snowpeak.blog.csdn.net/article/details/6533929](https://snowpeak.blog.csdn.net/article/details/6533929)

---------

最近遇到 PhpMyAdmin 不能导出数据的问题，点击导出后先是一个请求失败或者白页，重新刷新后就报错

export.php: Missing parameter: what (FAQ 2.8)

export.php: Missing parameter: export_type (FAQ 2.8)

根据网上查的资料，最后确定是 php.ini 设置要调整一下

我原来的 post_max_size = 8M ，改大到 post_max_size = 20M 就好了。

还没有深入查看 PhpMyAdmin 的源代码，但估计是其程序中有依赖上述 PHP 环境值之处，并且需要此值比较大才能正常运行。