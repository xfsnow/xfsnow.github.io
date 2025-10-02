# JRun Connecting to MySQL Database Using Connector/J JDBC Driver

Published: *2006-06-09 11:15:00*

Category: __Database__

Introduction: MySQL has released a new JDBC driver called Connector/J. The previous MySQL configuration for JDBC data sources in JRun no longer works. The following configuration method has been tested successfully. Environment: Windows 2000 Advanced Server (SP4) + JRun 4.0.5.27373 + MySQL 4.0.16. The MySQL Connector/J JDBC driver used is mysql-connector-j.

Original link: [https://snowpeak.blog.csdn.net/article/details/782259](https://snowpeak.blog.csdn.net/article/details/782259)

---------

MySQL has released a new JDBC driver called Connector/J. The previous MySQL configuration for JDBC data sources in JRun no longer works. The following configuration method has been tested successfully. Environment: Windows 2000 Advanced Server (SP4) + JRun 4.0.5.27373 + MySQL 4.0.16. The MySQL Connector/J JDBC driver used is mysql-connector-java-3.1.12-bin.jar.

1. Download the latest MySQL Connector/J JDBC driver, after extracting, put mysql-connector-java-3.{n}-bin.jar in the JRun-home/servers/lib folder  
2. Restart the JRun server  
3. In the admin site, since the admin site is configured, all JRun sites can use this configuration. Click on JDBC Data Sources under Resources, create a new JDBC Data Source. You can give the Data Source Name a meaningful name, such as Mysql. Select Not-Listed from the Database Driver menu, then click Add.  
4. On the details page that appears, fill in Driver Class: com.mysql.jdbc.Driver, and fill in the standard MySQL address for URL, such as:  
   jdbc:mysql://localhost/northwind  
   If needed, fill in the username, password and other data source settings. Click the Verify button under Actions to test the data source. If normal, it should display "Connected to Mysql successfully.  
   (Successfully connected to Mysql)". If not, you can restart the JRun server and try again.

Translated from Macromedia's official TechNote

Original address: <http://www.adobe.com/go/5fa26cba>