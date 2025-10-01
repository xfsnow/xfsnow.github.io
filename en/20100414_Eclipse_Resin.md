# Support Resin in Eclipse without Plugin

Published: *2010-04-14 22:36:00*

Category: __Backend__

Summary: Eclipse 3.5 + Resin 2.1.17 or Resin 3.1.10 has been tested.

## I. Resin Configuration

1. Change the java compiler in resin.conf under the Resin installation path to javac, so that the system JDK compiler can be used, which facilitates configuration in Eclipse, and allows compilation error messages to be displayed in Chinese.

   - Resin 2 configuration:
     ```xml
     <java compiler="javac" compiler-args=""/>
     ```

   - Resin 3 configuration:
     ```xml
     <javac compiler="javac" args="-source 1.5"/>
     ```

   If Resin reports that it cannot find the compilation path when running, you can use the full path, for example:
   ```xml
   compiler="C:/jdk1.6.0_19/bin/javac"
   ```

2. Then create a new application in resin.conf. For Resin2, add a line before `</host>`:

   ```xml
   <web-app id="/resin2" app-dir="/path/to/resin2/WebRoot">
   </web-app>
   ```

## II. Eclipse Configuration

Create a new project for the website application resin2 configured above.

Then configure Eclipse, Run Configurations... Create a new one under Java Application, you can name it anything, such as "Resin2", and then set the options on each page accordingly:

1. **Main**
   - Project: Select the resin2 project we just created.
   - Main class:
     - For Resin3, fill in `com.caucho.server.resin.Resin`
     - For Resin2, fill in `com.caucho.server.http.HttpServer`

2. **Arguments**
   - Program arguments:
     ```
     -conf "C:/Server/resin-2.1.17/conf/resin.conf"
     ```
     Write the full path of Resin's own configuration file here.

   - VM arguments:
     ```
     -Dresin.home="C:/Server/resin-3.1.10"
     -Djava.util.logging.manager=com.caucho.log.LogManagerImpl
     ```

   If you are developing Tapestry and need pages to be automatically updated, add:
   ```
   -Dorg.apache.tapestry.enable-reset-service=true
   -Dorg.apache.tapestry.disable-caching=true
   ```

3. **JRE**: Select the JRE installed on your system.

4. **Classpath**: Add the jars under Resin home's lib. For convenience, you can create a User Library for these jar packages.

Other items can be default or customized according to the situation.

After the configuration is complete, click the "Apply" button, and then click the "Run" button below to run the project. And a Resin2 run configuration will be added to the Run tool in the toolbar.