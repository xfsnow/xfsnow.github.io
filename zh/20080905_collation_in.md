# MySQL 的 collation

发布时间: *2008-09-05 15:01:00*

分类: __数据库__

简介: 深入剖析 MySQL 的 collation，解决数据库查询时查询中文数据时，中文数据查询结果不准确的问题。

---------

## 先转一别人的学习文章做个引子和基础

<http://logzgh.itpub.net/post/3185/467401>

在以前用 Oracle 的时候，很少关注它的 collation 方法，但是在 MySQL 中，如果不注意这点，可能会出现问题。

### 问题描述

一张 `test` 表，字符集采用的是 `latin1`。

```sql
SELECT to_id FROM test WHERE to_id='cn象_王';
```

结果：

```plaintext
+---------------+
| to_id         |
+---------------+
| cn陶_陶       |
| cn象_王       |
+---------------+
2 rows in set (0.00 sec)
```

取 `cn象_王` 的数据，居然把 `cn陶_陶` 的数据也取回来了。这显然是不允许的。

### 查看编码

```sql
SELECT HEX('cn陶_陶');
```

结果：

```plaintext
+----------------+
| hex('cn陶_陶') |
+----------------+
| 636ECCD55FCCD5 |
+----------------+
1 row in set (0.00 sec)
```

```sql
SELECT HEX('cn象_王');
```

结果：

```plaintext
+----------------+
| hex('cn象_王') |
+----------------+
| 636ECFF35FCDF5 |
+----------------+
1 row in set (0.00 sec)
```

编码的确是不一样的，但是为什么 MySQL 会认为这两条记录是一样的呢？

### 定位问题

一开始我们就把问题定位于 collation 引起的问题。

```sql
SHOW VARIABLES LIKE 'collation%';
```

结果：

```plaintext
| collation_connection | latin1_swedish_ci |
| collation_database   | latin1_swedish_ci |
| collation_server     | latin1_swedish_ci |
```

手工把这些参数修改为 `latin1_bin`，结果居然一样。这下感觉真是奇怪了。

### MySQL collation 命名规则

MySQL collation 的命名规则如下：

- 它们以其相关的字符集名开始，通常包括一个语言名，并且以 `_ci`（大小写不敏感）、`_cs`（大小写敏感）或 `_bin`（二元）结束。

例如，`latin1` 字符集有以下几种校正规则：

| 校对规则          | 含义               |
|-------------------|--------------------|
| latin1_german1_ci | 德国 DIN-1        |
| latin1_swedish_ci | 瑞典/芬兰         |
| latin1_danish_ci  | 丹麦/挪威         |
| latin1_german2_ci | 德国 DIN-2        |
| latin1_bin        | 符合 latin1 编码的二进制 |
| latin1_general_ci | 多种语言（西欧）  |
| latin1_general_cs | 多种语言（西欧 ISO），大小写敏感 |
| latin1_spanish_ci | 现代西班牙        |

### 解决问题

最后我们将表格重建，手工指定表格级别的 collation 为 `latin1_bin`。这个问题就得到了解决。

```sql
ALTER TABLE db_allot CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin;
```

### 建议

建议 collation 都尽量采用字符集相应的 `_bin` 类型的校对规则，这样不容易出错。

## 再说说我自己的体会

觉得 `character set latin1 collate latin1_bin` 就是老版的 `VARCHAR BINARY` 的改进，只是新版的先用 `character set` 定字符集，再用此字符集名字加 `_bin` 定校对规则为二进制的，从而确保中文查询正确。

### 测试

把字段属性改为不带 `BINARY` 的：

```sql
ALTER TABLE `comment_content_1_01` CHANGE `thread` `thread` VARCHAR(50) DEFAULT NULL;
```

表结构变为：

```plaintext
thread varchar(50) default NULL
```

可见 `character set latin1 collate latin1_bin` 就是老版的 `VARCHAR BINARY` 的改进。

此外，还可以通过表格级别的 collation 设置为 `latin1_bin`，而不用逐个改字段属性。

### 示例

```sql
ALTER TABLE comment_content_1_01 CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin;
```

导出表结构：

```sql
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
```

即便原来没定各字段的 `collate`，现在也全都是 `collate latin1_bin` 了。

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/collation_in_mysql/*
