# Installing PHP PECL HTTP Extension

Published: *2011-06-30 16:04:00*

Category: __System__

Summary: My environment is Apache 2.2.19 + PHP 5.3.6, installed on both Fedora 14 Linux and Windows 2003 Server.

---------

My environment is Apache 2.2.19 + PHP 5.3.6, installed on both Fedora 14 Linux and Windows 2003 Server.

## Linux Installation

To install on Linux, compile from source:

http://pecl.php.net/packages.php - Find pecl_http

http://pecl.php.net/package/pecl_http

Download the current stable version:

```
1.7.1 stable 2011-05-05 pecl_http-1.7.1.tgz (170.0kB)
```

Extract pecl_http-1.7.1.tgz, then execute the following commands:

```bash
phpize
./configure
make
make install
```

After compilation and installation, add `extension = "http.so"` to php.ini. Restart Apache, and the phpinfo output will show an http section indicating successful installation.

## Windows Installation

For Windows installation, compiling from source is not practical. Download php_http.dll from the PHP official website:

http://windows.php.net/download/

Find PECL For Windows, but there is currently no Windows version available for download. Look for the following text:

```
In the meantime, some extensions can be found here.
```

Go to:

http://downloads.php.net/pierre/

There are many versions of extensions starting with php_http-5.3. Check the PHP Extension Build value in phpinfo. My version has the value `API20090626,TS,VC9`, so I downloaded:

```
php_http-5.3-svn20091125-vc9-x86.zip
```

Extract php_http.dll and place it in the PHP extensions directory, typically the ext directory under the PHP installation directory. Add `extension=php_http.dll` to php.ini. Restart Apache, and the phpinfo output will show an http section indicating successful installation.