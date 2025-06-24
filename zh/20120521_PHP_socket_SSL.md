# 为 PHP 的 socket 启用 SSL 支持

发布时间: *2012-05-21 20:00:41*

简介: 使用 PHP 的 socket 访问 SSL 时可能遇到如下报错：Unable to find the socket transport "ssl" - did you forget to enable it when you configured PHP?我上网查到了在 Windows 下配置 Apache 的方法，分享出来：停止 Apache 服务。找到 PHP 安装目录下的

原文链接: [https://snowpeak.blog.csdn.net/article/details/7588515](https://snowpeak.blog.csdn.net/article/details/7588515)

---------

使用 PHP 的 socket 访问 SSL 时可能遇到如下报错：

Unable to find the socket transport "ssl" - did you forget to enable it when you configured PHP?

我上网查到了在 Windows 下配置 Apache 的方法，分享出来：

停止 Apache 服务。  
找到 PHP 安装目录下的 libeay32.dll 和 ssleay32.dll，把它们拷贝到 Apache 安装目录下的 bin 目录里。  
编辑 PHP 配置文件 php.ini，找到 “;extension=php_openssl.dll” 这行，把前面的分号去掉；如果没有这行，就添加一行 “extension=php_openssl.dll”。  
启动 Apache 服务。