# Enabling SSL Support for PHP Sockets

Published: *2012-05-21 20:00:41*

Category: __System__

Introduction: This article describes how to enable SSL support for PHP socket functionality in a Windows environment, resolving the "Unable to find the socket transport "ssl"" error.

---------

When using PHP sockets to access SSL, you may encounter the following error:

```
Unable to find the socket transport "ssl" - did you forget to enable it when you configured PHP?
```

I found a method for configuring Apache on Windows and am sharing it here:

1. Stop the Apache service.

2. Locate `libeay32.dll` and `ssleay32.dll` in the PHP installation directory and copy them to the `bin` directory under the Apache installation directory.

3. Edit the PHP configuration file php.ini, find the line `;extension=php_openssl.dll` and remove the semicolon at the beginning; if this line doesn't exist, add a line `extension=php_openssl.dll`.

4. Start the Apache service.