# MySQL 一次查询插入多条的自增 ID

发布时间: *2012-03-08 21:24:00*

分类: __数据库__

---------

## [MySQL 一次查询插入多条的自增 ID](/cn/article/detail/get_multiple_auto_increment_id_with_one_query_in_mysql/)

分类: [数据库](/cn/article/category/database/) 2012-03-08 21:24:00 阅读(7068)

根据

<http://stackoverflow.com/questions/6895679/mysqls-auto-increment-behavior-in-a-multiple-row-insert>

MySQL 可以一次性插入多条，LAST_INSERT_ID() 返回的是所插入条目的第一条的 ID。问题是其余的 ID 能否保证是连续的？

下面有高手答复，在某种特殊的情况下，如果配置成 replicated multi-master setup 复制的多主库，则连接一个主库的插入会得到都是奇数，而另一个主库得到的都是偶数。对于普通情况，至少 InnoDB 的插入是原子的，并且同一个表的插入是队列的，保证两条插入所得的 ID 不会交错。但 MySQL 文档中并无明确说明。

所以我想实现的一次性得到多个连续 ID 的方案，就是如下这样插入多条


    INSERT INTO seq_event_id (id) VALUES (NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL)

然后用 LAST_INSERT_ID() 得到是所插入条目的第一条的 ID，再根据所插入的 ID 是连续的，就能知道每个 ID 了。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/get_multiple_auto_increment_id_with_one_query_in_mysql/*
