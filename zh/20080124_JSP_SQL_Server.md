# JSP 读取 SQL Server 2000 中 image 型数据生成图片文件

发布时间: *2008-01-24 20:03:00*

简介: 环境：Windows XPTomcat 6.0jre1.6.0_03SQL Server 2000任务：数据库表中user_id是用户ID， photo 字段存储着照片的二进制数据，用如下代码可以把所有用户的照片二进制数据读出，写成图片文件并以用户ID作为文件名。代码：//建立连接对象Class.forName("com.microsoft.jdbc.sqlserver.SQLServer

原文链接: [https://snowpeak.blog.csdn.net/article/details/2063989](https://snowpeak.blog.csdn.net/article/details/2063989)

---------

环境：  
Windows XP  
Tomcat 6.0  
jre1.6.0_03  
SQL Server 2000

任务：  
数据库表中user_id是用户ID， photo 字段存储着照片的二进制数据，用如下代码可以把所有用户的照片二进制数据读出，写成图片文件并以用户ID作为文件名。


```
代码：<%@ page language="java" import="java.sql.*, java.io.*" %><%//建立连接对象Class.forName("com.microsoft.jdbc.sqlserver.SQLServerDriver").newInstance();String url="jdbc:microsoft:sqlserver://dbserver:1433;DatabaseName=dbname", user="user", password="password";Connection conn= DriverManager.getConnection(url,user,password);Statement stmt = conn.createStatement();ResultSet rs;
```


```
String strSql  = "select user_id, photo FROM tablename";
```


```
InputStream   in   =   null;FileOutputStream   fileOutStream   =   null;rs=stmt.executeQuery(strSql);while(rs.next()){  //Windows 系统下存储路径用2个反斜杠  DataOutputStream sos = new DataOutputStream(new BufferedOutputStream(new FileOutputStream("X://filesavepathh//"+ rs.getString("user_id") +".jpg")));  //读出流用getBinaryStream()方法。  in = rs.getBinaryStream("photo");  //用缓存数组逐渐输出流 int len = 0; byte[] b = new byte[1024]; while ((len = in.read(b)) != -1) {  sos.write(b,0,len); } sos.close(); in.close();}rs.close();conn.close();%>
```

玄机：  
这里的 SQL 查询语句是 select user_id, photo FROM tablename，注意字段名的顺序，如果有更多字段要读取，二进制数据的字段名 photo 一定要排在最后一个！因为使用 SQL Server 2000 的 JDBC 数据库驱动程序时，在 getXXX 返回字段值时必须按照SQL查询语句中字段名出现的顺序返回，这一点是大家都知道的。但玄妙地方在于如果 photo 字段不排在最后一个，就得先 getBinaryStream("photo") 来返回二进制数据，然后再返回其它类型字段值时会遇到一个奇怪的报错：  
java.io.IOException: [Microsoft][SQLServer 2000 Driver for JDBC]Object has been closed.  
我费了很多时间才搞清楚，只要把字段名 photo 一定要排在最后一个就可以，而不排在最后一个就不行。原因上网查了据说是SQL Server 2000 的 JDBC 数据库驱动程序的问题。

希望能为别人帮点忙，欢迎了解此事的朋友一起探讨。