# 安装 PHP 的 PECL HTTP 扩展

发布时间: *2011-06-30 16:04:00*

分类: __系统__

简介: 我的环境是 Apache 2.2.19 + PHP 5.3.6 ，分别在 Fedora 14 Linux 和 Windows 2003 Server 下安装。

---------

我的环境是 Apache 2.2.19 + PHP 5.3.6 ，分别在 Fedora 14 Linux 和 Windows 2003 Server 下安装。

## Linux 安装

在 Linux 下编译安装即可，从以下地址找到 pecl_http：

http://pecl.php.net/packages.php

http://pecl.php.net/package/pecl_http

下载现在的稳定版：

```
1.7.1 stable 2011-05-05 pecl_http-1.7.1.tgz (170.0kB)
```

解压 pecl_http-1.7.1.tgz，然后执行以下命令：

```bash
phpize
./configure
make
make install
```

编译安装完成后，在 php.ini 里加上 `extension = "http.so"` 就行了，重启 Apache，phpinfo 会多出 http 段表示安装成功。

## Windows 安装

Windows 安装的话，自己编译安装不大可能，到 PHP 官网下载 php_http.dll 吧。

http://windows.php.net/download/

找到 PECL For Windows，但是现在还没有 Windows 版可以下载，找如下这行字：

```
In the meantime, some extensions can be found here.
```

去到：

http://downloads.php.net/pierre/

这里 php_http-5.3 开头的扩展有好多版，查看 phpinfo 中 PHP Extension Build 的值，我的版本此值是 `API20090626,TS,VC9`，所以我下载：

```
php_http-5.3-svn20091125-vc9-x86.zip
```

解压出来 php_http.dll 放到 PHP 扩展所在的目录下，如默认是 PHP 安装目录下的 ext 目录。在 php.ini 里加上 `extension=php_http.dll` 就行了，重启 Apache，phpinfo 会多出 http 段表示安装成功。