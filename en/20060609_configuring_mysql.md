# Configuring MySQL 4.1 with JRun 4 using the Connector/J driver

Published: *2006-06-09 11:15:00*

Category: __Backend__

Summary: This article describes how to configure MySQL 4.1 with JRun 4 using the Connector/J driver.

---------

## [Configuring MySQL 4.1 with JRun 4 using the Connector/J driver](/en/article/detail/configuring_mysql_41_with_jrun_4_using_the_connectorj_driver/)

MySQL has released a new version of its JDBC driver called Connector/J, which renders the previous JRun JDBC data source configuration for MySQL obsolete. I followed Macromedia's official TechNote, combined it with my own practice, and successfully configured it. I'm sharing my configuration below.

The following configuration method has been tested and works in this environment: Windows 2000 Advanced Server (SP4) + JRun 4.0.5.27373 + MySQL 4.0.16, using the mysql-connector-java-3.1.12-bin.jar for the MySQL Connector/J JDBC driver.

1.  Download the latest version of the MySQL Connector/J JDBC driver. After unzipping, place the `mysql-connector-java-3.{n}-bin.jar` file in the `JRun-home/servers/lib` folder.

2.  Restart the JRun server.

3.  In the admin site, once the admin site is configured, all JRun sites can use this configuration. Click on JDBC Data Sources under Resources, and create a new JDBC Data Source. You can give the Data Source Name a meaningful name, such as `Mysql`. In the Database Driver menu, select `Not-Listed`, and then click Add.

4.  On the details page that appears, fill in the Driver Class with: `com.mysql.jdbc.Driver`. For the URL, enter the standard MySQL address, for example:
    `jdbc:mysql://localhost/northwind`
    If necessary, fill in the username, password, and other data source settings. Click the Verify button under Actions to test the data source. If everything is correct, it should display "Connected to Mysql successfully." If it doesn't work, you can try restarting the JRun server.

Translated from Macromedia's official TechNote.

Original URL: [http://kb2.adobe.com/cps/000/5fa26cba.html](http://www.adobe.com/go/5fa26cba)

---
*link: https://www.snowpeak.fun/en/article/detail/configuring_mysql_41_with_jrun_4_using_the_connectorj_driver/*
