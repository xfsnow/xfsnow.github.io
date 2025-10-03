# MySQL Auto-increment ID in Multiple Row Insert

Published: *2012-03-08 21:24:42*

Category: __Database__

Summary: Based on a question and answer from Stack Overflow, this article explores the behavior characteristics of auto-increment IDs when inserting multiple records at once in MySQL. In normal circumstances, the LAST_INSERT_ID() function returns the ID of the first inserted record, and the IDs of other records are usually consecutive. However, in a specific replicated multi-master setup configuration, odd and even number distributions may occur.

Original link: [https://snowpeak.blog.csdn.net/article/details/7334546](https://snowpeak.blog.csdn.net/article/details/7334546)

---------

Based on   
http://stackoverflow.com/questions/6895679/mysqls-auto-increment-behavior-in-a-multiple-row-insert   
MySQL can insert multiple rows at once, and LAST_INSERT_ID() returns the ID of the first inserted item. The question is whether the remaining IDs can be guaranteed to be consecutive?   
  
There's an expert answer below, that in a special case, if configured as a replicated multi-master setup, inserts connected to one master will get odd numbers, while the other master gets even numbers. For normal situations, at least InnoDB inserts are atomic, and inserts to the same table are queued, ensuring that IDs from two inserts won't interleave. However, MySQL documentation does not explicitly state this.   
  
So the solution I want to implement to get multiple consecutive IDs at once is to insert multiple rows like this:   
```sql
INSERT INTO seq_event_id (id) VALUES (NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL),(NULL)
```   
Then use LAST_INSERT_ID() to get the ID of the first inserted item, and based on the fact that the inserted IDs are consecutive, we can know each ID.