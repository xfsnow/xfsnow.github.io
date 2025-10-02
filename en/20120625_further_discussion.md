# A Further Discussion on Implementing Tree Structures with Nested Set Model

Published: *2012-06-25 21:39:00*

Category: __Database__

Introduction: This article delves into the implementation of tree structures in relational databases using the Nested Set Model. Based on Mike Hillyer's classic model, performance is optimized by adding a node depth field, providing a complete implementation scheme for CRUD operations.

---------

To implement tree structures in relational databases, besides the familiar and easily understood "Adjacency List Model", there is another "Nested Set Model". The basic theory can be found online, such as:

Mike Hillyer's original work:

<http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/>

Chen Jianping's translation of the above article:

<http://www.cnblogs.com/chinaontology/archive/2010/03/10/NestedSetModel.html>

And Liu Min's blog has a PDF document整理 of the above translated version that can be downloaded:

<http://www.liumin.name/20071117/acts_as_nested_set/>

This article provides a detailed explanation of the core theory of left and right boundaries, making it easy for everyone to understand the "Nested Set Model" from scratch. However, the example in this article only uses the classic two fields of left and right boundaries. When it comes to node depth, there are too many nested queries, which greatly reduces the performance of SQL execution. Xuefeng combines some workaround solutions learned online and adds a redundant node depth field, reducing query complexity and improving execution performance, making it suitable for real development and production environments.

This article is based on the above articles, and reading this article requires understanding the basic principles of "Nested Set Model". If you don't understand yet, it is recommended to read the above documents first.

The scenario case we use is hierarchical regional data. First, let's look at the SQL statement for creating the table:

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

I only added a depth field to Mike Hillyer's table structure to represent the node depth.

The following will introduce the main functional requirements of tree structures one by one.

## Inserting New Nodes

First insert a root node. We agree that the depth of the root node is 1. When there is only one root node, its left and right boundaries are naturally 1 and 2, so:

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('根', 1, 1, 2);
```

Let's insert a few child nodes one by one to familiarize ourselves with how inserting nodes affects existing nodes.

The depth of a child node is the current node's depth + 1. According to the mathematical principle of the "Nested Set Model", the left boundary of a child node is the right boundary of the current node, and the right boundary of a child node is the right boundary of the current node plus 1. Also, the left and right boundaries of all nodes to the right of the current node are increased by 2. So:

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('北京', 1+1, 2, 2+1);
UPDATE geo SET lft=lft+2 WHERE lft>2;
UPDATE geo SET rgt=rgt+2 WHERE rgt>=2;
```

Insert another child node. At this time, the parent node is still the root node, but its rgt value has been updated to 4, while its depth is still 1, so:

```sql
INSERT INTO geo (name, depth, lft, rgt) VALUES ('天津', 1+1, 4, 4+1);
UPDATE geo SET lft=lft+2 WHERE lft>4;
UPDATE geo SET rgt=rgt+2 WHERE rgt>=4;
```

Actually, to insert a child node, you only need to know the current node's rgt and depth, plus the name of the new child node, which can be made into a stored procedure. But the SQL logic is not particularly complex, and it can also be executed in a program as a transaction.

Below I'll post the SQL for the sample data, which everyone can import directly. Those interested can continue to practice inserting new nodes themselves.

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

## Querying All Leaf Nodes

According to this model, leaf nodes are those nodes whose right boundary is 1 greater than their left boundary. The SQL statement is simple.

```sql
SELECT cid, name FROM geo WHERE rgt = lft + 1;
```

## Getting a Single Path

That is, querying a node and all its parent nodes. I uniformly replace the BETWEEN keyword with greater than or less than comparison operators. When including equals, it includes itself; when not including equals, it doesn't include itself.

```sql
SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.name = '东华门'
	ORDER BY parent.lft;
```

Or more accurately using the primary key:

```sql
SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.cid = 11
	ORDER BY parent.lft;
```

## Querying Node Depth

Now we can directly use the redundant depth field instead of complex nested queries.

```sql
SELECT depth FROM geo WHERE name='南开';
```

## The Entire Tree and Depth

```sql
SELECT depth, name FROM depth;
```

With some formatting:

```sql
SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo ORDER BY lft;
```

## Subtree and Depth

First, use the left and right boundaries of the subtree's starting point as conditions. For example, Beijing's lft=2, rgt=11. Nested queries are not needed, but an additional query may be required.

```sql
SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo WHERE lft>=2 AND rgt<=11 ORDER BY lft;
```

Using nested queries, with the subtree's starting point ID as the condition, such as Tianjin's cid=3:

```sql
SELECT n.depth, CONCAT( REPEAT('- ', n.depth - 1), n.name) AS name
FROM geo AS n , geo AS s
WHERE s.cid=3 AND n.lft>=s.lft AND n.rgt<=s.rgt ORDER BY n.lft;
```

## Direct Child Nodes

That is, the direct subordinates of a node. Also use the redundant depth field to simplify the query.

First, use the node's left and right boundaries and depth as conditions. For example, the root's lft=1, rgt=20, depth=1. Nested queries are not needed, but an additional query may be required.

```sql
SELECT cid, depth, name FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1 ORDER BY lft;
```

Using nested queries, with the subtree's starting point ID as the condition, such as the root's cid=1, Beijing's cid=2:

```sql
SELECT n.cid, n.depth, n.name
FROM geo AS n, geo AS s
WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1 ORDER BY n.lft;
```

## Direct Parent Node

It's essentially LIMIT 1 of a single path. Of course, not including itself, use < instead of <=. Using the primary key ID is still the fastest.

```sql
SELECT parent.cid, parent.name FROM geo AS node, geo AS parent
	WHERE parent.lft < node.lft AND node.lft < parent.rgt AND node.cid = 11
	ORDER BY parent.lft DESC LIMIT 1;
```

## Total Number of Child Nodes

Calculate using the node's own lft and rgt. According to the nested model, each child node uses two numbers, so the total number of child nodes is (rgt-lft-1)/2. For example, Beijing's rgt=13, lft=2, so its total number of child nodes is (13-2-1)/2 = 5.

## Number of Direct Child Nodes and Whether There Are Child Nodes

First, use the node's left and right boundaries and depth as conditions. For example, the root's lft=1, rgt=20. Nested queries are not needed, but an additional query may be required.

```sql
SELECT count(1) AS num FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1;
```

Using nested queries, with the node ID as the condition, such as Beijing's cid=2:

```sql
SELECT count(1) AS num
FROM geo AS n , geo AS s
WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1;
```

## Deleting Nodes

To simplify the logic, I only handle deleting leaf nodes or entire subtrees, not handling the problem of orphaned nodes caused by deleting middle-level nodes. In actual business, usually more nodes are added and fewer are deleted, and many projects don't delete nodes at all.

First, calculate the offset caused by deleting related nodes. For example, to delete Xicheng, lft=7, rgt=8, offset = 8-7+1 = 2:

```sql
//Delete the current node and its child nodes to be deleted
DELETE FROM geo WHERE lft>=7 AND rgt<=8;

//Recalibrate the left boundary of all nodes whose left boundary is greater than the deleted node's right boundary
UPDATE geo SET lft=lft-2 WHERE lft>8;

//Same as above, recalibrate the right boundary of all nodes whose right boundary is greater than the deleted node's right boundary
UPDATE geo SET rgt=rgt-2 WHERE rgt>8;
```

## Sibling Node Reordering

Generally, sibling node reordering doesn't require write operations. We only handle the sorting of the retrieved results. The above SQL is all sorted by lft, that is, sorted by the order of addition. However, usually when displaying sibling child nodes, they need to be sorted alphabetically or phonetically. The solution is: if the display is in English, sort directly by English; if the display is in Chinese, add a redundant field to store the pinyin when adding records, and sort by pinyin when retrieving.


---
*Original Link: https://www.snowpeak.fun/en/article/detail/further_discussion_on_managing_hierarchical_data_with_nested_set_model/*