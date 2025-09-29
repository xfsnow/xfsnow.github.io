# Further Discussion on Managing Hierarchical Data with Nested Set Model

Published: *2012-06-25 21:39:00*

Category: __Database__

---------

## [Further Discussion on Managing Hierarchical Data with Nested Set Model](/en/article/detail/further_discussion_on_managing_hierarchical_data_with_nested_set_model/)

Category: [Database](/en/article/category/database/) 2012-06-25 21:39:00 Read(8433)

When we manage hierarchical data with relational database, we can use the Nested Set Model besides our familiar "Adjacency List Model". The fundamental theories of the Nested Set Model are easily found on the Internet. For example:

Original article by Mike Hillyer:

<http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/>

A Chinese translation to the above article by Chen Jianping:

<http://www.cnblogs.com/chinaontology/archive/2010/03/10/NestedSetModel.html>

And a downloadable PDF version of the above translation by Liu Min:

<http://www.liumin.name/20071117/acts_as_nested_set/>

This article explains the core theories of left and right values and helps us to understand the Nested Set Model from scratch. However, the article only uses two fields of left and right values and entails too many nested queries when involving node depth and thus reduces performance of SQL execution. I add one redundant field of depth to simplify complicated queries and improve performance, so that make it easier to adopt the good model in development and production environment.

My article is based on the above article. You are recommended to understand the basic mechanism of the Nested Set Model. Please refer to the above links if you wish.

We use hierarchical geographical data as our scenario. Let's look at SQL to create the table.


    CREATE TABLE  `geo` (

      `cid` int(11) NOT NULL AUTO_INCREMENT,

      `name` varchar(20) NOT NULL,

      `depth` int(11) NOT NULL,

      `lft` int(11) NOT NULL,

      `rgt` int(11) NOT NULL,

      PRIMARY KEY (`cid`),

      KEY `lft` (`lft`),

      KEY `rgt` (`rgt`)

    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 ;

I add only one more field to indicate node depth based on the table structure of Mike Hillyer.

Now let's see how we can achieve major needs for hierarchical data.

#### Adding a new node

Let's add a root node, and we indicate our root node use 1 as depth. When we have only one root node, its left and right value are 1 and 2.


    INSERT INTO geo (name, depth, lft, rgt) VALUES ('root', 1, 1, 2);

Now let's add a few more nodes and familiarize us with how newly added nodes influence existing nodes.

The depth of the child node is 1 more than the depth of the current node. According to the mathematical theory of the Nested Set Model, left value of the node equals right value of the current node, right value of the child node equals right value of the current node plus 1. All the nodes that located right to the current node increase their left and right nodes by 2.


    INSERT INTO geo (name, depth, lft, rgt) VALUES ('Beijing', 1+1, 2, 2+1);

    UPDATE geo SET lft=lft+2 WHERE lft>2;

    UPDATE geo SET rgt=rgt+2 WHERE rgt>=2;

Let's add one more child node. Now current node is still the root node, but its right value is 4 now and its depth is still 1.


    INSERT INTO geo (name, depth, lft, rgt) VALUES ('Tianjin', 1+1, 4, 4+1);
    UPDATE geo SET lft=lft+2 WHERE lft>4;
    UPDATE geo SET rgt=rgt+2 WHERE rgt>=4;


Actually, we only need to know the right value and depth of the current node and the name of new node. We can make a stored procedure, but the logic of the SQL is not very complicated, so we can also execute the statements within transaction.

Below is the SQL of our sample table. If you are interested, you can continue to add more nodes as an exercise.


    INSERT INTO `geo`

     (`cid`, `name`, `depth`, `lft`, `rgt`)

     VALUES

    (1, 'root', 1, 1, 22),

    (2, 'Beijing', 2, 2, 13),

    (3, 'Tianjin', 2, 14, 19),

    (4, 'Shanghai', 2, 20, 21),

    (5, 'Dongcheng', 3, 3, 6),

    (6, 'Xicheng', 3, 7, 8),

    (7, 'Chongwen', 3, 9, 10),

    (8, 'Heping', 3, 15, 16),

    (9, 'Xuanwu', 3, 11, 12),

    (10, 'Nankai', 3, 17, 18),

    (11, 'Donghuamen', 4, 4, 5);

#### Finding all the Leaf Nodes

According to the model, leaf nodes are the node that have right value 1 bigger than its left value. So the SQL is very simple.。


    SELECT cid, name FROM geo WHERE rgt = lft + 1;

#### Retrieving a Single Path

Let's find one node with all its superior nodes. Here I use comparative operands instead of BETWEEN keyword. The result will include the current node itself if we use equal sign and will not include the current node if not.


    SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
    	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.name = 'Donghuamen'
    	ORDER BY parent.lft;

Or we can use primary key for more accurate query.


    SELECT parent.cid, parent.name FROM geo  AS node, geo AS parent
    	WHERE parent.lft <= node.lft AND node.lft <= parent.rgt AND node.cid = 11
    	ORDER BY parent.lft;

#### Finding the Depth of the Nodes

Now we can use our redundant field, depth, without complicated nested queries.


    SELECT depth FROM geo WHERE name='Nankai';

#### Retrieving the whole tree with Depth


    SELECT depth, name FROM depth;

Let's make it with format.


    SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo ORDER BY lft;

#### Depth of a Sub-Tree

We use left and right of the starting node as condition, for example, Beijing with lft=2 and rgt=11. Thus, we can avoid nested query, but we need one more query to know the left and right.


    SELECT depth, CONCAT( REPEAT('- ', depth - 1), name) AS name FROM geo WHERE lft>=2 AND rgt<=11 ORDER BY lft;

We use primary key, for example, Tianjin with cid=3, as condition with nested query.


    SELECT n.depth, CONCAT( REPEAT('- ', n.depth - 1), n.name) AS name

    FROM geo AS n , geo AS s

    WHERE s.cid=3 AND n.lft>=s.lft AND n.rgt<=s.rgt ORDER BY n.lft;

#### The Immediate Subordinates of a Node

We are finding direct children of one node. We can still use depth field to simplify query.

We use left, right and depth of the starting node as condition, for example, root with lft=1, rgt=20, depth=1. Thus, we can avoid nested query, but we need one more query to know the left and right.


    SELECT cid, depth, name FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1 ORDER BY lft;

We use primary key, for example, Beijing with cid=2, as condition with nested query.


    SELECT n.cid, n.depth, n.name

    FROM geo AS n, geo AS s

    WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1 ORDER BY n.lft;

#### The Immediate Parent Node

We add LIMIT 1 after querying the single path. Of course the result should exclude the node itself, so we use < instead of <= . It's fast to use primary key.


    SELECT parent.cid, parent.name FROM geo AS node, geo AS parent
    	WHERE parent.lft < node.lft AND node.lft < parent.rgt AND node.cid = 11
    	ORDER BY parent.lft DESC LIMIT 1;

#### Number of All Subordinates

We can calculate with left and right of the current node. According to the Nested Set Model, each node uses two integers, so the number of all subordinates equals (right-left-1) / 2. For example, Beijing with rgt=13 and lft=2, its all subordinates accounts to (13-2-1)/2 = 5.

#### Number of Immediate Subordinates

We use left, right and depth of the starting node as condition, for example, root with lft=1, rgt=20, depth=1. Thus, we can avoid nested query, but we need one more query to know the left and right.


    SELECT count(1) AS num FROM geo WHERE lft>1 AND rgt<22 AND depth=1+1;

We use primary key, for example, Beijing with cid=2, as condition with nested query.


    SELECT count(1) AS num

    FROM geo AS n , geo AS s

    WHERE s.cid=2 AND n.lft>=s.lft AND n.rgt<=s.rgt AND n.depth=s.depth+1;


#### Deleting a Node

In order to simplify logic, we only delete leaf node, or delete a sub-tree entirely. We don't deal with deleting middle nodes which can cause orphan nodes. In real production, we usually add nodes and rarely delete nodes. We even don't need to delete nodes in some projects.

We first calculate the offset caused by deleting a node. We use Xicheng as an example its lft=7, rgt=8, and its offset = 8-7+1 = 2.


    //Delete current node and its all subordinates

    DELETE FROM geo WHERE lft>=7 AND rgt<=8;

    //Readjust left value of all nodes with left value larger than the deleted node
    UPDATE geo SET lft=lft-2 WHERE lft>8;

    //Readjust right value of all nodes with right value larger than the deleted node

    UPDATE geo SET rgt=rgt-2 WHERE rgt>8;

#### Moving nodes of the Same Depth

We manage to deal with sorting when reading data while we don't change the order of nodes with writing. Basically, all the above SQL statements are ordered by lft, i.e., ordered by the time when they are added. Quite often we need to display nodes of same depth ordered by their letters or Chinese phonetic alphabet. The solution is simple. If we deal with English data, we just order the nodes by name. If we deal with Chinese, we use one more redundant field to store Chinese phonetic alphabet and order result by it when reading.


---
*原文链接: https://www.snowpeak.fun/en/article/detail/further_discussion_on_managing_hierarchical_data_with_nested_set_model/*
