# SecureCRT Configuration for Displaying Chinese and Colors

Published: *2011-06-21 15:10:00*

Category: __Software Tools__

Introduction: SecureCRT is a commonly used remote access tool for Windows, but it needs to be configured properly to display Chinese correctly.

---------

## 1. Configuring SecureCRT to Display Chinese

First, enable UTF-8 encoding on the remote Linux system by editing /etc/sysconfig/i18n:

```bash
LANG="en_US.UTF-8"
```

or

```bash
LANG="zh_CN.UTF-8"
```

Actually, most modern Linux distributions already default to `LANG="en_US.UTF-8"`. Then in SecureCRT, go to Options -> Session Options -> Appearance. When selecting a font, choose one that supports Chinese characters, such as "SimSun". Pay special attention to selecting the character set CHINESE_GB2312 in the font selection dialog.

Finally, set the character encoding to "UTF-8".

## 2. Displaying Colors

Go to Options -> Session Options -> Emulation. You can select any terminal type, just make sure to check "ANSI Color" to enable colored display. At this point, the background will turn black. If you don't like the black background, you can adjust the ANSI color scheme: Options -> Global Options -> Terminal -> Appearance -> ANSI Color. Change the first black color to white, and the last gray color to black.