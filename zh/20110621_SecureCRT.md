# SecureCRT 正常显示中文及显示颜色的配置

发布时间: *2011-06-21 15:10:00*

简介: 1. 让 SecureCRT 正常显示中文先要让远程的 Linux 启用 UTF-8 编码，编辑 /etc/sysconfig/i18nLANG="en_US.UTF-8"或LANG="zh_CN.UTF-8"其实现在新版 Linux 大多已经默认是 LANG="en_US.UTF-8" 了。然后在 SecureCRT 选项->会话选项->外观 选择字体时选择支持汉字的字体，如“新宋体”，尤其

原文链接: [https://snowpeak.blog.csdn.net/article/details/6558772](https://snowpeak.blog.csdn.net/article/details/6558772)

---------

#### 1\. 让 SecureCRT 正常显示中文

  
先要让远程的 Linux 启用 UTF-8 编码，编辑 /etc/sysconfig/i18n  
LANG="en_US.UTF-8"  
或  
LANG="zh_CN.UTF-8"  
其实现在新版 Linux 大多已经默认是 LANG="en_US.UTF-8" 了。然后在 SecureCRT 选项->会话选项->外观 选择字体时选择支持汉字的字体，如“新宋体”，尤其注意在弹出的字体选择对话框里还要选择字符集是 CHINESE_GB2312 这样才行。  
再把字符集选成“UTF-8” 就可以了。

#### 2\. 显示颜色

  
选项->会话选项->仿真，终端类型选哪个都行，只要勾选中“ANSI 颜色”就能有颜色了。这时背景就变成黑色了，如果不喜欢黑色背景。可以调整 ANSI 配色方案，选项->全局选项，终端->外观->ANSI颜色，把第一个的黑色改成白色，最末一个灰色改成黑色即可。