# mysqldump 备份数据库中文乱码解决一法

发布时间: *2008-07-07 14:14:00*

分类: __数据库__

简介: 如果 MySQL 服务器上的字符集是 `latin1` 的，`mysqldump` 出来的中文都是乱码！一个简单的办法是加上默认字符集选项。

-----------------

如果 MySQL 服务器上的字符集是 `latin1` 的，`mysqldump` 出来的中文都是乱码！一个简单的办法是加上默认字符集选项。如：

```bash
mysqldump -h 127.0.0.1 -P 3307 -u username --default-character-set=gbk -p databasename > dumpfile.txt
```

参数说明：
`-h` 主机

`-P` 端口，必须单独用此选项，而不能连续写在主机地址后面

`-u` 用户名

`--default-character-set` 知道数据内容是中文时可以指定为 `gbk`，这样即使数据库本身设置字符集为 `latin1` 出来的文件中文也能正常！

`-p` 密码

`databasename` 数据库名

`>` 后面是输出文件的路径。

原文链接: [https://snowpeak.blog.csdn.net/article/details/2621265](https://snowpeak.blog.csdn.net/article/details/2621265)