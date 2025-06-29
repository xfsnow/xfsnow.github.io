# 用位操作实现按子集筛选

发布时间: *2010-06-10 18:09:00*

简介: SQL 数据库也支持位操作，位操作平时看似不常用，但可以用来简便地解决一些难题，比如按子集筛选。

原文链接: [https://snowpeak.blog.csdn.net/article/details/5662053](https://snowpeak.blog.csdn.net/article/details/5662053)

---------

最近做用户权限控制，遇到一个需求，可以抽象为用户的城市属性都是多城市的，需要列出某城市集合的子集的用户。

最初的用户-城市关系表有如下范例数据，前一列为用户ID，后一列是城市

1 anshan  
1 beijing  
1 baotou  
1 baoding  
1 beihai  
1 baoji  
1 chongqing  
1 chengdu  
2 anshan  
2 beijing  
3 baotou  
3 baoding  
3 beihai  
4 baoji  
4 shanghai

比如一个城市集合是 [anshan, beijing, baotou, baoding, beihai, baoji]，筛选出城市属性是此集合子集的用户，就是要城市属性是 anshan 或 beijing 之类的，但没有此集合以外城市的用户。比如用户 2 的城市是anshan 和 beijing，用户 3 的城市是 baotou, baoding, beihai，都符合条件。用户 4 虽然有 baoji，但还有 shanghai，是指定集合以外的城市，所以不符合。

经过试验可以使用位操作，先把城市分离出单独的表，城市 ID 先用二进制数表示，每个城市把不同的位置为 1 ，即城市 ID 是 2 的幂

000000001 anshan  
000000010 beijing  
000000100 baotou  
000001000 baoding  
000010000 beihai  
000100000 baoji  
001000000 chongqing  
010000000 chengdu  
100000000 shanghai

然后用户-城市关系改为某用户所有城市的城市ID之和  
ID 二进制   
1 000111111   
2 000000011 

3 000011100   
4 100100000   
5 110000001 

这里集合 [anshan, beijing, baotou, baoding, beihai, baoji] 就可以表示成 111111，筛选时取当前用户按位与的结果与前用户值相同的为符合。

上述演示数据中的整数都是二进制表示，实际存储在数据库里的是它们的十进制数，以下为筛选出城市集合为 111111 的具体 SQL 语句范例，这里 111111 已转换成普通十进制数 63：

  
select user_id, city_sum from user_city where (city_sum & 63)=city_sum;

此方案城市 ID 是2的幂， 要求字段长度比较大，MySQL 无符号 BIGINT 最大是18446744073709551615。所以 城市ID 和用户的城市属性都用无符号 BIGINT。

最后列出此例子可用的实际 SQL 语句，这是 MySQL 数据库的，其它数据库可依理类推：

CREATE TABLE `city` (  
`city_id` bigint(20) unsigned NOT NULL default '0',  
`city_name` varchar(20) NOT NULL,  
PRIMARY KEY (`city_id`)  
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='城市,城市ID是按位递增的二进制数';  
  
INSERT INTO `city` VALUES (1, 'anshan');  
INSERT INTO `city` VALUES (2, 'beijing');  
INSERT INTO `city` VALUES (4, 'baotou');  
INSERT INTO `city` VALUES (8, 'baoding');  
INSERT INTO `city` VALUES (16, 'beihai');  
INSERT INTO `city` VALUES (32, 'baoji');  
INSERT INTO `city` VALUES (64, 'chongqing');  
INSERT INTO `city` VALUES (128, 'chengdu');  
INSERT INTO `city` VALUES (256, 'shanghai');  
  
CREATE TABLE `user_city` (  
`user_id` int(11) NOT NULL,  
`city_sum` bigint(20) unsigned default '0',  
PRIMARY KEY (`user_id`)  
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='用户-城市关系';  
  
INSERT INTO `user_city` VALUES (1, 63);  
INSERT INTO `user_city` VALUES (2, 3);  
INSERT INTO `user_city` VALUES (3, 28);  
INSERT INTO `user_city` VALUES (4, 288);  
INSERT INTO `user_city` VALUES (5, 385);