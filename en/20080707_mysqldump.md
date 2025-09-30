# Solution for mysqldump Backup Chinese Garbled Text

Published: *2008-07-07 14:14:00*

Category: __Database__

Summary: If the character set on the MySQL server is `latin1`, the Chinese characters in the `mysqldump` output will be garbled! A simple solution is to add the default character set option.

-----------------

If the character set on the MySQL server is `latin1`, the Chinese characters in the `mysqldump` output will be garbled! A simple solution is to add the default character set option. For example:

```bash
mysqldump -h 127.0.0.1 -P 3307 -u username --default-character-set=gbk -p databasename > dumpfile.txt
```

Parameter explanation:

- `-h` Host

- `-P` Port, must be specified separately and cannot be written continuously after the host address

- `-u` Username

- `--default-character-set` When you know the data content is in Chinese, you can specify it as `gbk`. This way, even if the database itself is set to the `latin1` character set, the output file will display Chinese characters correctly!

- `-p` Password

- `databasename` Database name

- `>` The path of the output file follows this symbol.

Original Link: [https://snowpeak.blog.csdn.net/article/details/2621265](https://snowpeak.blog.csdn.net/article/details/2621265)