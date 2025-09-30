# Collation in MySQL

Published: *2008-09-05 15:01:00*

Category: __Database__

Summary: An in-depth analysis of MySQL collation, solving issues where Chinese data queries return inaccurate results.

---------

## Reference Article

<http://logzgh.itpub.net/post/3185/467401>

When using Oracle in the past, collation methods were rarely a concern. However, in MySQL, ignoring collation can lead to problems.

### Problem Description

A `test` table uses the `latin1` character set.

```sql
SELECT to_id FROM test WHERE to_id='cn象_王';
```

Result:

```plaintext
+---------------+
| to_id         |
+---------------+
| cn陶_陶       |
| cn象_王       |
+---------------+
2 rows in set (0.00 sec)
```

Querying for `cn象_王` also retrieves `cn陶_陶`, which is clearly incorrect.

### Checking Encoding

```sql
SELECT HEX('cn陶_陶');
```

Result:

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

Result:

```plaintext
+----------------+
| hex('cn象_王') |
+----------------+
| 636ECFF35FCDF5 |
+----------------+
1 row in set (0.00 sec)
```

The encodings are indeed different, so why does MySQL consider these two records identical?

### Identifying the Issue

The issue was traced to collation settings.

```sql
SHOW VARIABLES LIKE 'collation%';
```

Result:

```plaintext
| collation_connection | latin1_swedish_ci |
| collation_database   | latin1_swedish_ci |
| collation_server     | latin1_swedish_ci |
```

Manually changing these parameters to `latin1_bin` still produced the same result, which was puzzling.

### MySQL Collation Naming Rules

MySQL collation names follow these rules:

- They start with the associated character set name, often include a language name, and end with `_ci` (case-insensitive), `_cs` (case-sensitive), or `_bin` (binary).

For example, the `latin1` character set has the following collations:

| Collation          | Meaning               |
|--------------------|-----------------------|
| latin1_german1_ci  | German DIN-1         |
| latin1_swedish_ci  | Swedish/Finnish      |
| latin1_danish_ci   | Danish/Norwegian     |
| latin1_german2_ci  | German DIN-2         |
| latin1_bin         | Binary for latin1    |
| latin1_general_ci  | Multilingual (Western Europe) |
| latin1_general_cs  | Multilingual (Western Europe ISO), case-sensitive |
| latin1_spanish_ci  | Modern Spanish       |

### Solution

Rebuilding the table and explicitly setting the table-level collation to `latin1_bin` resolved the issue.

```sql
ALTER TABLE db_allot CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin;
```

### Recommendation

It is recommended to use the `_bin` type collation corresponding to the character set to avoid errors.

## Personal Insights

The `character set latin1 collate latin1_bin` is an improvement over the old `VARCHAR BINARY`. The new version first defines the character set using `character set` and then specifies the collation as binary using `_bin`, ensuring correct Chinese queries.

### Testing

Changing a field attribute to remove `BINARY`:

```sql
ALTER TABLE `comment_content_1_01` CHANGE `thread` `thread` VARCHAR(50) DEFAULT NULL;
```

Table structure becomes:

```plaintext
thread varchar(50) default NULL
```

This shows that `character set latin1 collate latin1_bin` is an improvement over the old `VARCHAR BINARY`.

Additionally, table-level collation can be set to `latin1_bin` without modifying individual field attributes.

### Example

```sql
ALTER TABLE comment_content_1_01 CONVERT TO CHARACTER SET latin1 COLLATE latin1_bin;
```

Exported table structure:

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

Even if individual fields were not previously defined with `collate`, they are now all `collate latin1_bin`.

---
*Original Link: https://www.snowpeak.fun/cn/article/detail/collation_in_mysql/*
