# 用 JavaScript 清理干扰码

发布时间: *2011-03-06 21:21:00*

分类: __客户端技术__

---------

## [用 JavaScript 清理干扰码](/cn/article/detail/use_javascript_to_clear_interference_code/)

分类: [客户端技术](/cn/article/category/client_side_technology/) 2011-03-06 21:21:00 阅读(4811)

网上有些内容发布系统或者论坛的内容会掺杂进干扰码，即看上去是正常的文字，但是复制粘贴出来就会带有一些乱码以及网站网址等标志信息，目的是为了防止发布的内容太轻易被别人拷走。

这干扰码其实就是在 HTML 源码里加一些特定的标签如 font 和 span ，再用样式把它们做成不显示，但复制粘贴时里面的内容会被拷出来。有兴趣的看看带干扰码的 HTML 源文件就知道了。

这里介绍一下用 JavaScript 就能做到的方法，都不用动用什么服务器端之类的大语言。

其基本原理是以 javascript: 为协议，我们可以在 HTML 页面里执行一小段 JavaScript 代码，而这样的小段代码又可以收藏在收藏夹里，叫做 Bookmarklet，《JavaScript 权威指南》里也有介绍。

注意由于 bookmarklet 代码是要当作一行来解析的，所以不能用 // 的单行注释，必须用 /* */ 的块注释。

把下面这段 HTML 代码存成一个 HTML 文件，然后在链接上右击选保存到收藏夹，以后再遇到有干扰码的网页，选一下这个收藏，这段 JavaScript 代码会执行，把干扰码清理掉。


    <a href='javascript:
    (function() {
    var tamper = {
        "font":"font-size: 0px",
        "span":"display: none"
    };
    for (var t in tamper)
    {
        var doms = document.getElementsByTagName(t);
        var numAll = doms.length-1;
        for (var i=numAll; i>=0; i--)
        {
            var item = doms[i];
            if (item.style.cssText.toLowerCase().indexOf(tamper[t]) > -1)
            {
                item.parentNode.removeChild(item);
            }
        }
    };
    })();
    void 0;
    '>
    JavaScript 清理干扰字符
    </a>

现在已经测试 IE 和 Firefox 都支持这种做法。

其实雪峰觉着呢，既然在这个网站发出来，就是要分享给大家，让别人也帮忙去转载不是更能扩大影响力嘛，大家正常转载时也会带上原始的版权信息，大可不必费劲做干扰码之类的来增加麻烦。而且要清除掉干扰码，其实也很简单。所以做完上面这个小 bookmarklet ，想找网页来测试一下，都不大容易找到带干扰码的网站了。虽然某流行论坛程序支持干扰码，但现在使用论坛的人都不启用此功能了。欢迎有兴趣的同学多来推荐一些带干扰码的网站，帮我把这个小程序的功能测试一下吧。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/use_javascript_to_clear_interference_code/*
