# Configure Tomcat 6 to Connect SQL Server 2000 and MySQL 5 with JDBC Pool

Published: *2007-12-07 15:23:00*

Category: __System__

Summary: Tomcat 6 Configuration for Connecting SQL Server 2000 and MySQL 5 via JDBC Pool.

---------

## [Configure Tomcat 6 to Connect SQL Server 2000 and MySQL 5 with JDBC Pool](/en/article/detail/configure_tomcat_6_to_connect_sql_server_2000_and_mysql_5_with_jdbc_pool/)

## Tomcat 6 Configuration for Connecting SQL Server 2000 and MySQL 5 via JDBC Pool

The Tomcat documentation and online resources can be quite confusing. After several days of testing, I successfully configured Tomcat 6 and would like to share the setup.

My environment:

- Windows XP SP2, Windows 2003 Server SP1
- Tomcat 6
- SQL Server 2000
- MySQL 5

### SQL Server 2000 Connection Pool Configuration

Follow these steps in order:

1. Download the SQL Server 2000 JDBC Driver and place `msbase.jar`, `mssqlserver.jar`, and `msutil.jar` in `/Tomcat6/lib`.

2. Create a folder under `Tomcat 6.0/webapps`, for example, `poolmssql`.

3. Inside the `poolmssql` folder, create a `META-INF` folder and then a `context.xml` file with the following content:

```xml
<Context path="/poolmssql" docBase="poolmssql" debug="5" reloadable="true" crossContext="true">
    <Resource name="pool_mssql" auth="Container" type="javax.sql.DataSource"
       maxActive="100" maxIdle="30" maxWait="10000"
       driverClassName="com.microsoft.jdbc.sqlserver.SQLServerDriver"
       url="jdbc:microsoft:sqlserver://xx.xx.xx.xx:1433;DatabaseName=somedb"
       username="someuser" password="somepassword"  />
</Context>
```

4. Create a test program page in the `poolmssql` folder with the following content:

```jsp
<%@ page language="java" contentType="text/html;charset=utf-8" import="java.sql.*, javax.sql.*, javax.naming.*" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head><meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>JDBC Connection Pool</title></head>
<body>
<%
   DataSource ds = null;
   InitialContext ctx = new InitialContext();
   // The value after java:comp/env/ corresponds to the name attribute in the Resource element of context.xml
   ds = (DataSource)ctx.lookup("java:comp/env/pool_mssql");
   Connection conn = ds.getConnection();
   Statement stmt = conn.createStatement();
   // Test with a valid SQL query
   String strSql = "SELECT TOP 10 CompanyName FROM Suppliers";
   ResultSet rs = stmt.executeQuery(strSql);
   while(rs.next()) {
       out.print(rs.getString(1)+"<br />");
   }
%>
</body>
</html>
```

**Notes:**

1. In the `page` declaration, import the packages `java.sql.*`, `javax.sql.*`, and `javax.naming.*` as they are required for object instantiation in the test program.
2. Ensure the `page` declaration includes `contentType="text/html;charset=utf-8"`, the `meta` tag in the HTML includes `content="text/html; charset=utf-8"`, and the program page itself is saved as a UTF-8 encoded text file. This is the simplest way to ensure proper display of non-Western characters.

---
*Original link: https://www.snowpeak.fun/cn/article/detail/configure_tomcat_6_to_connect_sql_server_2000_and_mysql_5_with_jdbc_pool/*