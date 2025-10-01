# iReport 3.5 版设置英文界面

发布时间: *2009-07-06 17:41:00*

分类: __后器端技术__

简介: iReport 3.5 版设置英文界面

---------

iReport 是图形界面编辑 JasperReport 的工具，在简体中文的操作系统下，它的本地化功能把界面弄得又有中文又有英文，很乱。

以前的旧版可以在选项中方便地修改界面成英文，但是到了 iReport-nb-3.5.2 版，我找了半天也没在选项中找到修改界面的地方。结合其官网上的问答，加上自己的尝试，终于找到把界面设置成英文的方法：

在 iReport 安装路径下的 etc/ireport.conf 里增加启动参数，把这行

```conf
default_options="-J-Xms256m -J-Xmx512m -J-Dfile.encoding=UTF-8 -J-Dorg.netbeans.ProxyClassLoader.level=1000"
```

改成

```conf
default_options="-J-Xms256m -J-Xmx512m -J-Dfile.encoding=UTF-8 -J-Dorg.netbeans.ProxyClassLoader.level=1000 -J-Duser.language=en"
```

再启动就成英文界面了。

原理在于，通常咱们简体中文的操作系统下，JVM 会检测到系统属性 user.language=zh，而 iReport 启动时就使用这个系统属性值，我用 -J-Duser.language=en 指定了 iReport 启动时的参数，把用户语言明确为英文，界面就成英文的了。

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/set_ireport_35_to_english_ui/*