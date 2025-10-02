# IE6 和微软雅黑

发布时间: *2011-07-26 17:43:00*

分类: __前端技术__

简介: 本文介绍了在IE6浏览器中使用微软雅黑字体的方法，以及在必须使用UTF-8字符集时的替代解决方案。

---------

经我实测让 IE6 支持微软雅黑的唯一办法是 HTML 页面使用 gb2312 字符集，而 CSS 文件的字符集则 gb2312 或 utf8 均可。即 HTML 的 head 里声明：

```html
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
```

然后在 CSS 里使用如下声明就可以了：

```css
.yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
}
```

如果 HTML 页面必须用 utf8 字符集，则 IE6 就是不支持微软雅黑，这时我觉得就没必要为了样式去改变 HTML 页面的字符集了，我喜欢的变通是把 IE6 环境 hack 成普通黑体，如：

```css
.yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
    _font-family: SimHei, sans-serif;
}
```

这样在 IE6 里就会显示成黑体，看上去也比不支持微软雅黑而使用默认的宋体好多了。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/microsoft_yahei_in_ie6/*