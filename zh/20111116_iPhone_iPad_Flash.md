# 无需越狱或安装应用在 iPhone 和 iPad 上打开 Flash 视频

发布时间: *2011-11-16 22:36:29*

分类: __软件工具__

简介: iPhone 和 iPad 本身不支持 Flash，有一种办法是安装支持 Flash 的 App，如 Frash。我看到国外朋友介绍的一种方法，可以不用越狱或安装应用，这里翻译出来分享一下。

---------

iPhone 和 iPad 本身不支持 Flash，有一种办法是安装支持 Flash 的 App，如 Frash。我看到国外朋友介绍的一种方法，可以不用越狱或安装应用，这里翻译出来分享一下。

## 方法：

用 iPad 或 iPhone 的浏览器如 Safari 访问：

<http://code.google.com/p/itransmogrify/>

点击页面接近末尾的 "right from your iPhone" 链接。

到达这个新页面，其实就是一个详细的介绍，这里把重点操作说一下：

1. 把当前的网址添加到 Safari 收藏夹里，名字可以用默认的 iTransmogrify。

2. 编辑刚刚添加的这个书签，点击第二行的网址栏，用 iPad 的文本选择功能，一直拖到整行的最左边，看上去像下面这样：

   ```
   http://joemaller.com/___?javascript:if%28typ ...
   ```

3. 然后选中从最左边开始直到 javascript 之前的问号，不包括 javascript 字样，把选中的文字删掉，这样书签就编辑好了。

4. 然后访问带有 Flash 内容的网站，此时 Flash 内容不能显示，点击刚刚添加的 iTransmogrify 书签，当前的网址不会改变，但是 Flash 内容会显示出来。顺利的话，再打开其它带 Flash 内容的网站应该也能显示，如果再遇到不能显示 Flash 的，只需再点击一下 iTransmogrify 书签就行了。

## 原理分析

下面再简单探讨一下它的原理，本质上这是以书签方式运行的一小段 JavaScript 代码，它的完整代码如下：

```javascript
http://joemaller.com/___?javascript:if%28typeof%28iTransmogrify%29%3D%3D%27undefined%27%29%7Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.src%3D%27http%3A%2F%2Fjoemaller.com%2FiTransmogrify-latest.js%3Fq%3D%27%2B%28new%20Date%29.getTime%28%29%3Bdocument.getElementsByTagName%28%27head%27%29%5B0%5D.appendChild%28s%29%7Dvoid%280%29
```

它的作用就是在当前页面加载进来一个外部 js 文件，其地址是：

http://joemaller.com/iTransmogrify-latest.js

我们可以把这个 js 文件下载下来再仔细看，雪峰大体看了一下，它的原理似乎是把播放 Flash 的插件仿冒成 iPad 本身支持的插件，如 QuickTime，当然为了实现此仿冒还要做很多接口控件映射等等。可能个别 Flash 的控件不能完全映射到 QuickTime 上，所以用上述方法看 Flash 时有个别小功能没有，比如土豆视频的主视频可以看，但是两侧的广告都不显示。