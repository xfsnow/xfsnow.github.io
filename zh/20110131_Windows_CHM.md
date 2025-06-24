# 在 Windows 2003 不能打开局域网共享的 CHM 文件的解决

发布时间: *2011-01-31 12:21:00*

简介: <br />有些朋友在局域网内既有 Windows 又有 Linux 机器，并且在 Linux 上部署了 Samba 共享后，发现从 Windows 机器不能打开 Samba 共享上的 CHM 文件。这其实不是 Samba 共享的问题，而是 Windows 自己的安全限制。如果有问题的 Windows 机器也不能打开其它 Windows 上的共享的 CHM 文件，则验证是此情况。<br /> <br />微软已经发布了具体而详细的解释<br /> <br />http://support.microsoft

原文链接: [https://snowpeak.blog.csdn.net/article/details/6170718](https://snowpeak.blog.csdn.net/article/details/6170718)

---------

有些朋友在局域网内既有 Windows 又有 Linux 机器，并且在 Linux 上部署了 Samba 共享后，发现从 Windows 机器不能打开 Samba 共享上的 CHM 文件。这其实不是 Samba 共享的问题，而是 Windows 自己的安全限制。如果有问题的 Windows 机器也不能打开其它 Windows 上的共享的 CHM 文件，则验证是此情况。

微软已经发布了具体而详细的解释

<http://support.microsoft.com/?kbid=896054>

这时记录下雪峰实际解决此问题的经验。我就是用 Windows 2003 Server 的，这次安装的是某个整合了更新的版本，所以出现上述不能打开共享上 CHM 文件的问题。按上述微软的解释，先在注册表里加了 MaxAllowedZone 的设置还是不行，后来加上了 UrlAllowList 才行，注意局域网的共享要分别写两种格式，如  
"UrlAllowList"="//productmanuals/helpfiles;file:productmanuals/helpfile"