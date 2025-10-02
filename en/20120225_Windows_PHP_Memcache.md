# Installing and Configuring PHP + Memcache on Windows

Published: *2012-02-25 18:03:26*

Category: __System__

Introduction: As time goes by, most of the documentation available online for installing Memcache on Windows has become outdated. Here Xuefeng briefly introduces the installation and configuration methods for the latest version.

---------

## Installing Memcache on Windows

As time goes by, most of the documentation available online for installing Memcache on Windows has become outdated. Here Xuefeng briefly introduces the installation and configuration methods for the latest version.

Memcached is continuously updated on its official website, but unfortunately only source code is provided, without Windows compiled versions.

<http://memcached.org/>

Find the latest Windows compiled version at:

<http://code.jellycan.com/memcached/>

Find the win32 binary: memcached-1.2.6-win32-bin.zip and download it directly. (Of course, this page also introduces the specific methods for compiling on Windows, which interested users can try themselves.) Installation is no different from other versions:

Extract to a directory, such as C:\memcached,

In command line mode, enter:

```cmd
C:\memcached\memcached.exe -d install
```

At this point, memcached has been installed as a Windows service. You can start the memcached service with `memcached.exe -d start`, or start it in Windows services.

## Configuring PHP

The PHP official website does not provide Windows versions of the memcached extension, but fortunately there is:

<http://downloads.php.net/pierre/>

Search for memcache on this page to find the following files:

```
php_memcache-2.2.6-5.3-nts-vc9-x86.zip (2010-10-03 13:46 -0700)
MD5 (php_memcache-2.2.6-5.3-nts-vc9-x86.zip) = de463ea7271c357f2e317128a5370bfb
php_memcache-2.2.6-5.3-vc9-x86.zip (2010-10-03 13:45 -0700)
MD5 (php_memcache-2.2.6-5.3-vc9-x86.zip) = 2021ceb248dabae438796c9ccfa1c2e3
```

Choose the appropriate version according to your PHP environment. Please check the PHP information returned by phpinfo() and find the PHP Extension Build item. The value here is "API20090626,TS,VC9", so I chose php_memcache-2.2.6-5.3-vc9-x86.zip.

After downloading and extracting, place it in the PHP extensions directory. In my case, it's the ext folder under the PHP installation directory. Then add the following line to php.ini:

```ini
extension=php_memcache.dll
```

Restart the HTTP service, such as Apache, and check phpinfo() again. If there's an additional memcache section, it means the extension has been successfully installed. If an error occurs when restarting the HTTP service, it's usually because the wrong PHP extension version was selected. Try using another version.

Finally, test with the example code from the PHP manual. If the functionality works properly, the installation is complete.