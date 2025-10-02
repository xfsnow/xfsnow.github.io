# 以嵌套集合模型实现树状结构的一点深入探讨

发布时间: *2012-06-25 21:39:00*

分类: __数据库__

简介: 本文深入探讨了使用嵌套集合模型(Nested Set Model)在关系型数据库中实现树状结构的方法。在Mike Hillyer经典模型基础上，通过增加节点深度字段优化查询性能，提供了完整的增删查改操作实现方案。

---------

以关系型数据库实现树状结构，除了大家熟悉和容易理解的"邻接表模型"，还有另一种"嵌套集合模型"，其基本理论在网上都可找到，比如：

Mike Hillyer 的原作

<http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/>

陈建平对上文的译作

<http://www.cnblogs.com/chinaontology/archive/2010/03/10/NestedSetModel.html>

以及刘敏的博客中有上述译文版整理的 PDF 文档可以下载

<http://www.liumin.name/20071117/acts_as_nested_set/>

该文详细讲解了左右界的核心理论，便于大家从零开始理解"嵌套集合模型"。但是此文的例子只使用了最经典左右界 2 个字段，在涉及节点深度时的嵌套查询太多，SQL 执行的性能大为降低。雪峰结合网上学来的其它一些变通方案，增加了一个冗余的节点深度字段，降低了查询的复杂提高了执行性能，从而可用于真正的开发和生产环境。

本文以上述文章为基础，并且阅读本文需要了解"嵌套集合模型"的基本原理，如果还不了解，建议先阅读上述文档。

我们使用的情景案例，是层级的地区数据。先看建表的 SQL 语句：

```sql
CREATE TABLE `geo` (
  `cid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `depth` int(11) NOT NULL,
  `lft` int(11) NOT NULL,
  `rgt` int(11) NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
```

我在Mike Hillyer 的表结构上只增加了一个 depth 字段，用以表示节点深度。

以下从树状结构使用的主要功能需求逐个介绍一下。

## 插入新节点

先插入一个根节点，我们约定根节点的 depth 为1，当只有一个根节点时，它的左右界当然是 1 和 2，所以：

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('根', 1, 1, 2);
```

我们再逐个插入几个子节点，来熟悉一下插入节点对已有节点的影响。

子节点的 depth 是当前节点 depth +1，根据"嵌套集合模型"的数学原理，子节点的左界是当前节点的右界，子节点的右界是当前节点的右界加1，并且所有在当前节点右侧的节点的左右界都加2。所以：

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('北京', 1+1, 2, 2+1);
UPDATE geo SET lft=lft+2 WHERE lft>2;
UPDATE geo SET rgt=rgt+2 WHERE rgt>=2;
```

再插入一个子节点，此时父节点仍是根节点，但它的 rgt 值已更新为 4，而它的 depth 仍为 1，所以：

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('天津', 1+1, 4, 4+1);
UPDATE geo SET lft=lft+2 WHERE lft>4;
UPDATE geo SET rgt=rgt+2 WHERE rgt>=4;
```

其实插入子节点，只需要知道当前节点的 rgt 和 depth，再加上新建子节点的名字，可以做成个存储过程。但 SQL 的逻辑也没有特别复杂，也可以用程序以事务方式执行。

下面我把范例的数据的 SQL 帖出来，大家可以直接导入。有兴趣的可以继续自己练习自己插入新节点。

```sql
INSERT INTO `geo`
 (`cid`, `name`, `depth`, `lft`, `rgt`)
 VALUES
(1, '根', 1, 1, 22),
(2, '北京', 2, 2, 13),
(3, '天津', 2, 14, 19),
(4, '上海', 2, 20, 21),
(5, '东城', 3, 3, 6),
(6, '西城', 3, 7, 8),
(7, '崇文', 3, 9, 10),
(8, '和平', 3, 15, 16),
(9, '宣武', 3, 11, 12),
(10, '南开', 3, 17, 18),
(11, '东华门', 4, 4, 5);
```

## 查询所有叶节点

根据此模型，叶节点就是右界比左界大1的那些节点，SQL语句很简单。

```sql
SELECT cid, name FROM geo WHERE rgt = lft + 1;
```

## 取得单条路径

即查询出某节点到及其各级上级节点我统一把 BETWEEN 关键字都换成大于或小于的比较运算符了，带等于时包括自身，不带等于时不包括自身。

```sql
SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.name = '东华门'
	ORDER BY parent.lft;
```

或更准确的使用主键

```sql
SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.cid = 11
	ORDER BY parent.lft;
```

## 查询节点的深度

现在可以直接用冗余的字段 depth 而不用复杂的嵌套查询了。

```sql
SELECT depth FROM geo WHERE name='南开';
```

## 整个树及深度

```sql
SELECT depth, name FROM depth;
```

带点格式

```sql
SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo ORDER BY lft;
```

## 子树及深度

先用子树的起点的左右界做条件，如北京的 lft=2, rgt=11，可以不用嵌套查询，但可能要多一次查询

```sql
SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo WHERE lft>=2 AND rgt<=11 ORDER BY lft;
```

用嵌套查询，以子树的起点 ID 作条件，如天津的 cid=3

```sql
SELECT n.depth, CONCAT( REPEAT('- ', n.depth - 1), n.name) AS name
FROM geo AS n , geo AS s
WHERE s.cid=3 AND n.lft>=s.lft AND n.rgt<=s.rgt ORDER BY n.lft;
```

## 直接的子节点

即某节点的直接下属。也用冗余的 depth 字段来简化查询。

先用该节点的左右界和 depth 做条件，如根的 lft=1, rgt=20, depth=1，可以不用嵌套查询，但可能要多一次查询

```sql
SELECT cid, depth, name FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1 ORDER BY lft;
```

用嵌套查询，以子树的起点 ID 作条件，如根的 cid=1，北京的 cid=2

```sql
SELECT n.cid, n.depth, n.name
FROM geo AS n, geo AS s
WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1 ORDER BY n.lft;
```

## 直接的父节点

其实就是把单条路径 LIMIT 1，当然不包括自身用 < 替代 <= 即可。还是以主键ID查最快。

```sql
SELECT parent.cid, parent.name FROM geo AS node, geo AS parent
	WHERE parent.lft < node.lft AND node.lft < parent.rgt AND node.cid = 11
	ORDER BY parent.lft DESC LIMIT 1;
```

## 全部子节点个数

用当前节点自己的 lft 和 rgt 算出来即可，其实就是根据嵌套模型直观得来的，每个子节点用两个数，全部子节点数就是 (rgt-lft-1)/2，如北京的 rgt=13, lft=2，则其全部子节点数是 (13-2-1)/2 = 5。

## 直接子节点个数，及是否有子节点

先用该节点的左右界和 depth 做条件，如根的 lft=1, rgt=20，可以不用嵌套查询，但可能要多一次查询

```sql
SELECT count(1) AS num FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1;
```

用嵌套查询，以该节点 ID 作条件，如北京的 cid=2

```sql
SELECT count(1) AS num
FROM geo AS n , geo AS s
WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1;
```

## 删除节点

为了简化逻辑，我这里只处理删除叶子节点，或者一个子树整个删掉，不处理删除中层节点而造成孤儿节点的问题。实际业务中通常也是添加节点多，删除节点少，很多项目根本都不删除节点。

先计算出删除有关节点造成的偏移量，以删除西城为例，lft=7, rgt=8, 偏移 offset = 8-7+1 = 2

```sql
//删除当前要删除节点及其子节点
DELETE FROM geo WHERE lft>=7 AND rgt<=8;

//重新校正所有左界大于被删除节点右界的节点的左界
UPDATE geo SET lft=lft-2 WHERE lft>8;

//同上，重新校正所有右界大于被删除节点右界的节点的右界
UPDATE geo SET rgt=rgt-2 WHERE rgt>8;
```

## 同级节点平移

同级节点平移一般就不需要写操作了，我们只处理读取出来的结果排序的问题。上述 SQL 都是按 lft 排序，即按添加的先后顺序排序，而通常的情况是同级子节点显示时需要按字母或音序排序，解决办法是如果显示的是英文，直接按英文排序，如果显示的是中文，再冗余一个字段，在添加记录时存储好拼音，读取时按拼音排序。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/further_discussion_on_managing_hierarchical_data_with_nested_set_model/*