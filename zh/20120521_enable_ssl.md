# 为 PHP 的 socket 启用 SSL 支持

发布时间: *2012-05-21 20:00:00*

分类: __服务器端技术__

---------

## [为 PHP 的 socket 启用 SSL 支持](/cn/article/detail/enable_ssl_for_socket_in_php/)

分类: [服务器端技术](/cn/article/category/server_side_technology/) 2012-05-21 20:00:00 阅读(5998)

使用 PHP 的 socket 访问 SSL 时可能遇到如下报错：

Unable to find the socket transport "ssl" - did you forget to enable it when you configured PHP?

我上网查到了在 Windows 下配置 Apache 的方法，分享出来：

  1. 停止 Apache 服务。
  2. 找到 PHP 安装目录下的 libeay32.dll 和 ssleay32.dll，把它们拷贝到 Apache 安装目录下的 bin 目录里。
  3. 编辑 PHP 配置文件 php.ini，找到 “;extension=php_openssl.dll” 这行，把前面的分号去掉；如果没有这行，就添加一行 “extension=php_openssl.dll”。
  4. 启动 Apache 服务。



---
*原文链接: https://www.snowpeak.fun/cn/article/detail/enable_ssl_for_socket_in_php/*
