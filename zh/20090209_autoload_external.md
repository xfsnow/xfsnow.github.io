# 自动加载外部 JavaScript 文件

发布时间: *2009-02-09 17:29:00*

分类: __前端技术__

简介: 指定文件名加载外部 JavaScript 文件。

---------

虽说标题叫《自动加载外部 JavaScript 文件》，其实还未达到 PHP 那样在程序中只要遇到新的类名就自动加载类定义文件的程度，还需要指定文件名才能加载外部 JavaScript 文件，但是这对 JavaScript 应该已经够了。如果外部 JavaScript 文件比较多时，用这个还是比较方便的。详细说明用使用方法请见源码中的注释。

## 源码

文件名: autoload.js

```javascript
/* Copyright 2009 Snowpeak.org
* 文件名: autoload.js
* 摘  要: 批量加载外部 JS 文件
* 作  者: snowpeak
使用方法:
在 HTML 页的 head 段内加上形如:
<script type="text/javascript" src="autoload.js?a,js/b,other/c"></script>
外部 JS 文件路径罗列作 autoload.js? 后面的参数，用逗号分隔开，不用加 .js 后缀，这些路径应该是相对于引用它们的 HTML 页的，而非 autoload.js 这个文件。
即可创建出相应的 script 标记:
<script type="text/javascript" src="a.js"/>
<script type="text/javascript" src="js/b.js"/>
<script type="text/javascript" src="other/c.js"/>
说明:
1. 纯匿名函数，不添加任何全局变量。
2. IE 和 Firefox 在加载 JS 文件后生成的 DOM 节点顺序都一样，如 autoload.js?a,b,c 生成的3个 script 标记顺序也是 a、b、c，但是相同它们执行的顺序却不同，IE 是顺序执行的，而 Firefox 是倒序执行，即 c、b、a 的顺序。
*/
(function(){
 var scripts = document.getElementsByTagName("script");
 //必须用 for 循环才能循环得到 scripts 数组的各个元素，用 for in 循环得到的是 scripts 数组自身的属性。
 for (var i=0;i<scripts.length;i++)
 {
  if (scripts[i].src)
  {
   //匹配 src 值带 autoload.js? 字样的，并记住其后的参数，如 src="autoload.js?a,ch04get" 中的 a,ch04get
   var jsArgs = scripts[i].src.match(/autoload.js/?(/S+)/);
  }
 }
 if (jsArgs)
 {
  var jsFiles = jsArgs[1].split(',');
  var oHead = document.getElementsByTagName('head')[0];

  for (i=0; i<jsFiles.length;i++)
  {
   var oScript = document.createElement('script');
   oScript.type = "text/javascript";
   //默认外部 JS 文件的路径应该是相对于调用此 autoload.js 的 HTML 页的相对路径。再给文件名加上 .js 的后缀。
   oScript.src = jsFiles[i]+'.js';
   oHead.appendChild(oScript);
  }
 }
}
)()
```

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/autoload_external_javascript_files/*