# IE6 和微软雅黑

发布时间: *2011-07-26 17:43:00*

分类: __客户端技术__

---------

## [IE6 和微软雅黑](/cn/article/detail/microsoft_yahei_in_ie6/)

分类: [客户端技术](/cn/article/category/client_side_technology/) 2011-07-26 17:43:00 阅读(5577)

经我实测让 IE6 支持微软雅黑的唯一办法是 HTML 页面使用 gb2312 字符集，而 CSS 文件的字符集则 gb2312 或 utf8 均可。即 HTML 的 head 里声明


    <meta http-equiv="Content-Type" content="text/html; charset=gb2312" />

然后在 CSS 里使用如下声明就可以了


    .yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
    }

如果 HTML 页面必须用 utf8 字符集，则 IE6 就是不支持微软雅黑，这时我觉得就没必要为了样式去改变 HTML 页面的字符集了，我喜欢的变通是把 IE6 环境 hack 成普通黑体，如


    .yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
    _font-family: SimHei, sans-serif;
    }

这样在 IE6 里就会显示成黑体，看上去也比不支持微软雅黑而使用默认的宋体好多了。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/microsoft_yahei_in_ie6/*
