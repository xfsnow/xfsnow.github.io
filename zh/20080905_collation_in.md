# MySQL 的 collation

发布时间: *2008-09-05 15:01:00*

分类: __数据库__

---------

## [MySQL 的 collation](/cn/article/detail/collation_in_mysql/)

分类: [数据库](/cn/article/category/database/) 2008-09-05 15:01:00 阅读(2606)

### 先转一别人的学习文章做个引子和基础

<http://logzgh.itpub.net/post/3185/467401>

在以前用oracle的时候，很少关于它的collation方法，但是在mysql中，这点不加注意的话，却有可能会出现问题。

问题是这样的：

一张test的表，字符集采用的latin1。


    select to_id from test where to_id='cn象_王';


+---------------+
| to_id |
+---------------+
| cn陶_陶 |
| cn象_王 |
+---------------+
2 rows in set (0.00 sec)

取cn象_王的数据,居然把cn陶_陶的数据也取回来了。这显然是不允许的。

查看它们的编码：


(root@im_offlog1a)[test]> select hex('cn陶_陶');
+----------------+
| hex('cn陶_陶') |
+----------------+
| 636ECCD55FCCD5 |
+----------------+
1 row in set (0.00 sec)

(root@im_offlog1a)[test]> select hex('cn象_王');
+----------------+
| hex('cn象_王') |
+----------------+
| 636ECFF35FCDF5 |
+----------------+
1 row in set (0.00 sec)


编码的确是不一样的，但是为什么mysql会认为这两条记录是一样的呢？

一开始我们就把问题定位于collation引起的问题。

show variables查看

| collation_connection | latin1_swedish_ci

| collation_database | latin1_swedish_ci

| collation_server | latin1_swedish_ci

手工把这些参数修改为latin1_bin，结果居然一样。这下感觉真是奇怪了。

这里先解释一下mysql collation的命名规则：

它们以其相关的字符集名开始，通常包括一个语言名，并且以_ci（大小写不敏感）、_cs（大小写敏感）或_bin（二元）结束

比如latin1字符集有以下几种校正规则：

校对规则 含义

latin1_german1_ci 德国DIN-1

latin1_swedish_ci 瑞典/芬兰

latin1_danish_ci 丹麦/挪威

latin1_german2_ci 德国 DIN-2

latin1_bin 符合latin1编码的二进制

latin1_general_ci 多种语言(西欧)

latin1_general_cs 多种语言(西欧ISO),大小写敏感

latin1_spanish_ci 现代西班牙

最后我们将表格重建，手工指定表格级别的collation为latin1_bin。

这个问题就得到了解决。

那么问题又来了，为什么我前面手工测试latin1_bin时不生效呢？

原来MySQL按照下面的方式选择表字符集和 校对规则：

如果指定了CHARACTER SET X和COLLATE Y，那么采用CHARACTER SET X和COLLATE Y。

如果指定了CHARACTER SET X而没有指定COLLATE Y，那么采用CHARACTER SET X和CHARACTER SET X的默认校对规则。否则，采用服务器字符集和服务器校对规则。

而我们在建表的时候指定了character set，所以它永远是采用对应的默认的校对规则。

当然我们其实也没必要重建表格，只需要alter table db_allot CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin这样转换即可。

另外建议collation都尽量采用字符集相应的bin类型的校对规则，这样不容易出错。

### 再说说我自己的体会

觉得 character set latin1 collate latin1_bin 就是老版的 VARCHAR BINARY 的改进，只是新版的先用 character set 定字符集，再用此字符集名字加 _bin 定校对规则为二进制的，从而确保中文查询正确。

再测试了一下，把此字段属性改为不带 BINARY 的


    ALTER TABLE `comment_content_1_01` CHANGE `thread` `thread` VARCHAR( 50 ) DEFAULT NULL;

然后再看表结构确实变成 `thread` varchar(50) default NULL, 即不带 character set latin1 collate latin1_bin 了，可见character set latin1 collate latin1_bin 就是老版的 VARCHAR BINARY 的改进。

此外还读到更方便的做法，不用逐个改字段属性，而只要表格级别的collation为latin1_bin就行了。

测试：


    alter table comment_content_1_01 CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin;

后，再导出表结构


    CREATE TABLE comment_content_1_01 (
    content_id int(11) NOT NULL auto_increment,
    thread varchar(50) collate latin1_bin default NULL,
    uname varchar(100) collate latin1_bin default NULL,
    nick varchar(100) collate latin1_bin default NULL,
    uid int(11) unsigned default NULL,
    content text collate latin1_bin,
    post_time datetime default NULL,
    post_ip int(10) unsigned default NULL,
    `status` enum('unaudit','normal','deleted') collate latin1_bin NOT NULL default 'unaudit',
    PRIMARY KEY (content_id)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_bin;


即便原来没定各字段的 collate，现在也全都是 collate latin1_bin 了。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/collation_in_mysql/*
