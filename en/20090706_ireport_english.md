# Set iReport 3.5 to English UI

Published: *2009-07-06 17:41:00*

Category: __Backend__

Summary: This article discusses a specific scenario and solution for setting the iReport 3.5 interface to English.

---------

iReport is a graphical tool for editing JasperReport. Under Simplified Chinese operating systems, its localization feature makes the interface a mix of Chinese and English, which looks messy.

In older versions, the interface language could be easily changed to English through the options. However, in iReport-nb-3.5.2, I couldn't find the option to change the interface language after searching for a long time. Combining information from the official website Q&A and my own experiments, I finally found a way to set the interface to English:

In the etc/ireport.conf file under the iReport installation path, add startup parameters by changing this line:

```conf
default_options="-J-Xms256m -J-Xmx512m -J-Dfile.encoding=UTF-8 -J-Dorg.netbeans.ProxyClassLoader.level=1000"
```

to:

```conf
default_options="-J-Xms256m -J-Xmx512m -J-Dfile.encoding=UTF-8 -J-Dorg.netbeans.ProxyClassLoader.level=1000 -J-Duser.language=en"
```

After this change, when you start iReport again, the interface will be in English.

The principle is that under Simplified Chinese operating systems, the JVM typically detects the system property user.language=zh, and iReport uses this system property value at startup. By specifying -J-Duser.language=en as a startup parameter for iReport, I explicitly set the user language to English, thus making the interface appear in English.