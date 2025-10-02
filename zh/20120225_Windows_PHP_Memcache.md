# 在 Windows 下安装配置 PHP + Memcache

发布时间: *2012-02-25 18:03:26*

分类: __系统__

简介: Windows下Memcache安装随着时间的推移，网上现在能找到的在 Windows下安装 Memcache 的文档大多已经过时。雪峰这里再简要介绍一下当下最新版的安装和配置方法。

---------

## Windows下Memcache安装

随着时间的推移，网上现在能找到的在 Windows下安装 Memcache 的文档大多已经过时。雪峰这里再简要介绍一下当下最新版的安装和配置方法。

Memcached 在其官网是不断更新的，可惜只有源码，没有 windows 编译版。

<http://memcached.org/>

找到当下最新的 Windows 编译版，在

<http://code.jellycan.com/memcached/>

找到 win32 binary: memcached-1.2.6-win32-bin.zip 直接下载即可。（当然这里也介绍了在 Windows 下编译地具体方法，有兴趣的可以自己试试。）安装和其它版本没有区别：

解压到一个目录下，如 C:\memcached，

在命令行状态下输入：

```cmd
C:\memcached\memcached.exe -d install
```

至此memcached已经安装成windows服务，可以用 `memcached.exe -d start` 启动memcached服务，也可以在 windows 服务中启动。

## 配置 PHP

PHP 的官网也没有提供 Windows 版的 memcached 扩展，还好有

<http://downloads.php.net/pierre/>

在此页搜 memcache 会找到如下几条文件：

```
php_memcache-2.2.6-5.3-nts-vc9-x86.zip (2010-10-03 13:46 -0700)
MD5 (php_memcache-2.2.6-5.3-nts-vc9-x86.zip) = de463ea7271c357f2e317128a5370bfb
php_memcache-2.2.6-5.3-vc9-x86.zip (2010-10-03 13:45 -0700)
MD5 (php_memcache-2.2.6-5.3-vc9-x86.zip) = 2021ceb248dabae438796c9ccfa1c2e3
```

根据自己的 PHP 环境选择相应的版，请查看 phpinfo() 返回的 PHP 信息，找到 PHP Extension Build 一项，我这里的值是 "API20090626,TS,VC9"，我选择 php_memcache-2.2.6-5.3-vc9-x86.zip。

下载解压后，放到 PHP 的扩展的目录下，如我这里就是 PHP 安装目录下的 ext 文件夹，然后在 php.ini 里增加一项：

```ini
extension=php_memcache.dll
```

重启 HTTP 服务，如 Apache ，再回来看 phpinfo() 里多了 memcache 一段，就表示扩展已经安装成功。如果在重启 HTTP 服务时报错，通常是 PHP 扩展选择的版本不对，换用其它版本再试一下即可。

最后用 PHP 手册里的范例代码测试一下，功能正常就安装完成了。