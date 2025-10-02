# MySQL 一次查询插入多条的自增 ID

发布时间: *2012-03-08 21:24:42*

分类: __Database__

简介: 根据 Stack Overflow 上的问题和回答，探讨了 MySQL 一次性插入多条记录时自增 ID 的行为特性。在普通情况下，LAST_INSERT_ID() 函数返回插入的第一条记录的 ID，其余记录的 ID 通常是连续的。但在特定的复制多主库配置下，可能会出现奇偶数分布的情况。

原文链接: [https://snowpeak.blog.csdn.net/article/details/7334546](https://snowpeak.blog.csdn.net/article/details/7334546)

---------

根据   
http://stackoverflow.com/questions/6895679/mysqls-auto-increment-behavior-in-a-multiple-row-insert   
MySQL 可以一次性插入多条，LAST_INSERT_ID() 返回的是所插入条目的第一条的 ID。问题是其余的 ID 能否保证是连续的？   
  
下面有高手答复，在某种特殊的情况下，如果配置成 replicated multi-master setup 复制的多主库，则连接一个主库的插入会得到都是奇数，而另一个主库得到的都是偶数。对于普通情况，至少 InnoDB 的插入是原子的，并且同一个表的插入是队列的，保证两条插入所得的 ID 不会交错。但 MySQL 文档中并无明确说明。   
  
所以我想实现的一次性得到多个连续 ID 的方案，就是如下这样插入多条   
```sql
INSERT INTO seq_event_id (id) VALUES (NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL)
```   
然后用 LAST_INSERT_ID() 得到是所插入条目的第一条的 ID，再根据所插入的 ID 是连续的，就能知道每个 ID 了。