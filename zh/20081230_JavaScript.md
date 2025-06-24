# JavaScript 压缩和格式化

发布时间: *2008-12-30 14:00:00*

简介: 以前在找到过压缩 Javascript 代码的程序，一直在用，感觉效果不错。http://javascriptcompressor.com/在线压缩 Javascript 源码只是把空格、换行、多余的注释等等清理掉，尤其选中 Shrink variables 时，会把长的变量名缩减成单个字母的变量名，压缩比通常能达到50%甚至更小。现在 AJAX 大行其道，JavaScript 文件越来越大，用此

原文链接: [https://snowpeak.blog.csdn.net/article/details/3646910](https://snowpeak.blog.csdn.net/article/details/3646910)

---------

以前在找到过压缩 Javascript 代码的程序，一直在用，感觉效果不错。  
<http://javascriptcompressor.com/>  
在线压缩 Javascript 源码  
只是把空格、换行、多余的注释等等清理掉，尤其选中 Shrink variables 时，会把长的变量名缩减成单个字母的变量名，压缩比通常能达到50%甚至更小。现在 AJAX 大行其道，JavaScript 文件越来越大，用此压缩应该能减轻不少流量负担。而且缩减变量名后，程序并没有加密，但会使程序变得很难看懂，一定程度上也能保护一下版权吧。

今天又找到了把代码格式化的程序  
<http://jsbeautifier.org/>[](<http://elfz.laacz.lv/beautify/>)  
可以把压缩过的 JS 代码重新格式化成容易阅读的样子。当然如果是 javascriptcompressor.com 压缩时缩减变量名了，是没法恢复原来有意义的变量名的。  
遇到特别大的 JS 文件时，浏览器会报耗时过长，选不停止，最终它能完成执行。

这两套程序都是用纯 JavaScript 写的，可以下载下来离线使用，很方便。