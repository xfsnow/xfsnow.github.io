# Integrate Tomcat Into IIS

Published: *2008-05-16 17:35:00*

Category: __System Operation__

Summary: This article introduces the main methods and steps to integrate Tomcat 5.5.25 into IIS 5.1.

---------

There are many discussions online. After combining various introductions and debugging, I successfully tested a solution after several days of effort. Knowing that Java solutions are often versatile, I share this to provide more ideas for everyone.

## Environment:

- IIS5.1 on Windows XP SP2, IIS6.0 on Windows Server 2003
- java version "1.6.0_03"
- Java(TM) SE Runtime Environment (build 1.6.0_03-b05)
- Apache Tomcat/5.5.25

## Steps:

### 1. Set Windows Environment Variables:

```plaintext
JAVA_HOME=c:/j2sdk1.4.0
CLASSPATH=.;%JAVA_HOME%/lib;%JAVA_HOME%/jre/lib;
PATH=%JAVA_HOME%/bin;%JAVA_HOME%/jre/bin;
```

### 2. Download the Latest `jakarta-tomcat-connectors`:

Download the latest version from:
<http://archive.apache.org/dist/tomcat/tomcat-connectors/jk2/binaries/win32/?C=M;O=D/>

Find a file like `jakarta-tomcat-connectors-jk2.0.4-win32-IIS.zip`. Extract `isapi_redirector2.dll` and place it in the `$CATALINA_HOME/bin` directory.

### 3. Configure `workers.properties` and `workers2.properties`:

Place these files in the `$CATALINA_HOME/conf` directory. Below are example configurations:

**workers.properties**

```properties
workers.tomcat_home=C:/Server/Tomcat5.5
workers.java_home=C:/Program Files/Java/jre1.6.0_03
worker.list=neosmart
worker.neosmart.port=8009
worker.neosmart.host=localhost
worker.neosmart.type=ajp13
```

**workers2.properties**

```properties
[shm]
info=Scoreboard. Required for reconfiguration and status with multiprocess servers.
file=C:/Server/Tomcat5.5/work/workers.shm

[lb:lb]

[channel.socket:localhost:8009]
port=8009
host=127.0.0.1

[ajp13:localhost:8009]
channel=channel.socket:localhost:8009
group=lb

[uri:/examples/*]
group=lb

[status:]
info=Status worker, displays runtime information

[uri:/jkstatus/*]
info=The Tomcat /jkstatus handler
group=status:

[uri:/*.jsp]
[uri:/*.do]
```

### 4. Add Registry Entries:

Save the following content as a `.reg` file and import it:

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE/SOFTWARE/Apache Software Foundation/Jakarta Isapi Redirector/2.0]
"serverRoot"="C://Server//Tomcat5.5//"
"extensionUri"="/jakarta/isapi_redirector2.dll"
"workersFile"="C://Server//Tomcat5.5//conf//workers2.properties"
"logLevel"="INFO"
```

### 5. IIS Configuration:

- **ISAPI Filters**: Add `isapi_redirector2.dll` as a filter in IIS.
- **Virtual Directory**: Create a virtual directory named `jakarta` pointing to `$CATALINA_HOME/bin`.
- **Add Mappings**: Map `.jsp` and `.do` extensions to `isapi_redirector2.dll`.

### 6. Restart IIS and Tomcat:

Check the ISAPI filter status in IIS. If it shows a green arrow, the configuration is successful. Test the setup by accessing:

<http://localhost/jsp-examples/>

If successful, congratulations!

---
*Original Chinese article link: https://www.snowpeak.fun/cn/article/detail/integrate_tomcat_into_iis/*
