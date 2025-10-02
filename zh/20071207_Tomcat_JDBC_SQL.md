# Tomcat 6 通过 JDBC 连接池连接 SQL Server 2000 和 MySQL 5 的设置

发布时间: *2007-12-07 15:23:00*

分类: __后端技术__

简介: Tomcat 文档及网上看到的说明都挺乱的，我经过几天尝试现在测试成功的 Tomcat 6 设置分享一下。

---------------

## Tomcat 6 通过 JDBC 连接池连接 SQL Server 2000 和 MySQL 5 的设置

Tomcat 文档及网上看到的说明都挺乱的，我经过几天尝试现在测试成功的Tomcat 6 设置分享一下。

我的环境是:

- Windows XP SP2, Windows 2003 Server SP1
- Tomcat 6
- SQL Server 2000
- MySQL 5

## SQL Server 2000 连接池配置

方法按顺序操作如下：

1. 下载 SQL Server 2000 JDBC Driver 放在 `/Tomcat6/lib`，我现在使用的是 `msbase.jar`、`mssqlserver.jar`、`msutil.jar` 这3个文件。

2. 在 `Tomcat 6.0/webapps` 下建立文件夹，比如 `poolmssql`。

3. `poolmssql` 文件夹内建 `META-INF` 文件夹，再建 `context.xml` 文件，内容：

```xml
<Context path="/poolmssql" docBase="poolmssql" debug="5" reloadable="true" crossContext="true">
    <Resource name="pool_mssql" auth="Container" type="javax.sql.DataSource"
       maxActive="100" maxIdle="30" maxWait="10000"
       driverClassName="com.microsoft.jdbc.sqlserver.SQLServerDriver"
       url="jdbc:microsoft:sqlserver://xx.xx.xx.xx:1433;DatabaseName=somedb"
       username="someuser" password="somepassword"  />
</Context>
```

4. 在 `poolmssql` 文件夹下建立测试程序页，内容：

```jsp
<%@ page language="java" contentType="text/html;charset=utf-8" import="java.sql.*, javax.sql.*, javax.naming.*" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head><meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>JDBC 连接池</title></head>
<body>
<%
   DataSource ds = null;
   InitialContext ctx = new InitialContext();
   //这里 java:comp/env/ 后面的值就是context.xml 文件里 Resource 项下 name 的值 "jdbc/pool_mssql"
   ds = (DataSource)ctx.lookup("java:comp/env/pool_mssql");
   Connection conn = ds.getConnection();
   Statement stmt = conn.createStatement();
   //找个能运行的 SQL 语句试试即可
   String strSql = "SELECT TOP 10 CompanyName FROM Suppliers";
   ResultSet rs = stmt.executeQuery(strSql);
   while(rs.next()) {
       out.print(rs.getString(1)+"<br />");
   }
%>
</body>
</html>
```

**注意：**

1. 在 `page` 声明里要 `import java.sql.*, javax.sql.*, javax.naming.*` 这3个包，因为这时测试程序中声明对象实例要用到的。
2. `page` 声明里要 `contentType="text/html;charset=utf-8"`，网页 `meta` 里要 `content="text/html; charset=utf-8"`，最后程序页本身还要存成 `utf-8` 编码的文本文件，这是我找到的最简单的保证非西文能正常显示的方法。

## MySQL 5 连接池配置方法

与 MSSQL Server 大同小异：

1. 下载 `Connector/J` 放在 `/Tomcat6/lib`，我现在使用的是 `mysql-connector-java-5.0.4-bin.jar`。

2. 在 `Tomcat 6.0/webapps` 下建立文件夹，比如 `mysql`。

3. `mysql` 文件夹内建 `META-INF` 文件夹，再建 `context.xml` 文件，内容：

```xml
<Context path="/mymymy" docBase="mymymy" debug="5" reloadable="true" crossContext="true">
    <Resource name="pool_mysql" auth="Container" type="javax.sql.DataSource"
       maxActive="100" maxIdle="30" maxWait="10000"
       driverClassName="com.mysql.jdbc.Driver"
       url="jdbc:mysql://localhost:3306/dbname?autoReconnect=true"
       username="someuser" password="somepassword" />
</Context>
```

4. 在 `mysql` 文件夹下建立测试程序页，内容：

```jsp
<%@ page language="java" contentType="text/html;charset=utf-8" import="java.sql.*, javax.sql.*, javax.naming.*" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head><meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>JDBC 连接池</title></head>
<body>
<%
   DataSource ds = null;
   InitialContext ctx = new InitialContext();
   //这里 java:comp/env/ 后面的值就是context.xml 文件里 Resource 项下 name 的值 "jdbc/pool_mysql"
   ds = (DataSource)ctx.lookup("java:comp/env/jdbc/pool_mysql");
   Connection conn = ds.getConnection();
   Statement stmt = conn.createStatement();
   //找个能运行的 SQL 语句试试即可
   String strSql = "SELECT TOP 10 CompanyName FROM Suppliers";
   ResultSet rs = stmt.executeQuery(strSql);
   while(rs.next()) {
       out.print(rs.getString(1)+"<br />");
   }
%>
</body>
</html>
```

**注意：**

1. 在 `page` 声明里要 `import java.sql.*, javax.sql.*, javax.naming.*` 这3个包，因为这时测试程序中声明对象实例要用到的。
2. 以下的程序页文件本身要使用 `utf-8` 编码，而且 MySQL 数据库也需要先设置成 `utf-8` 编码的，具体方法这里不赘述，建议参见 [http://unix-cd.com/vc/www/26/2007-07/6214.html](http://unix-cd.com/vc/www/26/2007-07/6214.html)。

## 其它备注

我这里没有做以下工作，但仍能正常运行：

- 把 `aspectjrt.jar` 放在 `lib` 下。
- 在 `mssql` 文件夹内建 `WEB-INF` 文件夹，再建 `web.xml` 文件。

## 常见报错

1. `org.apache.tomcat.dbcp.dbcp.SQLNestedException: Cannot create PoolableConnectionFactory (Communications link failure due to underlying exception:`

字面意思是连接 MySQL 服务被拒绝，通常是 MySQL 服务未启动造成的。

2. `java.sql.SQLException: [Microsoft][SQLServer 2000 Driver for JDBC]Error establishing socket.`

SQLServer 2000 服务未启动会报这样的错。

3. `type Status report message /poolmysql.jsp description The requested resource (/xxx.jsp) is not available.`

通常是 `context.xml` 里 `url` 的值写得不对。

刚入门，很多还不很理解，如有不周，欢迎交流与指正！

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/configure_tomcat_6_to_connect_sql_server_2000_and_mysql_5_with_jdbc_pool/*
