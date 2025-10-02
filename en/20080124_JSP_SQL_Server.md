# Create Images with JSP Reading Image data in SQL Server 2000

Published: *2008-01-24 20:03:00*

Category: __Development__

---------

## [Create Images with JSP Reading Image data in SQL Server 2000](/en/article/detail/create_images_with_jsp_reading_image_data_in_sql_server_2000/)

### Environment

Windows XP
Tomcat 6.0
jre1.6.0_03
SQL Server 2000

### Task

In the database table, user_id is the user ID, and the photo field stores the binary data of the photo. The following code can read all users' photo binary data, write it as image files, and use the user ID as the file name.


### Code

```jsp
<%@ page language="java" import="java.sql.*, java.io.*" %>
<%
// Connect to DB
Class.forName("com.microsoft.jdbc.sqlserver.SQLServerDriver").newInstance();
String url = "jdbc:microsoft:sqlserver://dbserver:1433;DatabaseName=dbname";
String user = "user";
String password = "password";
Connection conn = DriverManager.getConnection(url, user, password);
Statement stmt = conn.createStatement();
ResultSet rs;

String strSql = "select user_id, photo FROM tablename";

InputStream in = null;
FileOutputStream fileOutStream = null;
rs = stmt.executeQuery(strSql);

while(rs.next()) {
    // On Windows systems, use double backslashes for storage paths
    DataOutputStream sos = new DataOutputStream(
        new BufferedOutputStream(
            new FileOutputStream("X://filesavepath//" + rs.getString("user_id") + ".jpg")
        )
    );
    
    // Use the getBinaryStream() method to read the stream
    in = rs.getBinaryStream("photo");
    
    // Gradually output the stream using a buffer array
    int len = 0;
    byte[] b = new byte[1024];
    while ((len = in.read(b)) != -1) {
        sos.write(b, 0, len);
    }
    
    sos.close();
    in.close();
}

rs.close();
conn.close();
%>
```

### Secret
SQL query used here is

```sql
select user_id, photo FROM tablename;
```

Note the order of field names. If there are more fields to retrieve, the binary data field name "photo" must be placed last! When using the JDBC database driver for SQL Server 2000, when getXXX returns field values, they must be returned in the order the field names appear in the SQL query statement, which is well known. But the tricky part is that if the photo field is not placed last, you have to first use getBinaryStream("photo") to return the binary data, and then when returning other type field values, you will encounter a strange error:

```java
java.io.IOException: [Microsoft][SQLServer 2000 Driver for JDBC]Object has been closed.
```

I spent a lot of time figuring out that as long as the field name photo is placed last, it will work, but it won't work if it's not placed last. According to online research, the reason is said to be a problem with the JDBC database driver for SQL Server 2000.

I hope this can help others. Friends who understand this matter are welcome to discuss it together.



---
*Original link: https://www.snowpeak.fun/en/article/detail/create_images_with_jsp_reading_image_data_in_sql_server_2000/*