# 查看 winmail.dat 附件及避免此问题的配置

发布时间: *2011-03-13 21:42:00*

简介: <br />有时我们的邮件会收到一个名叫 winmail.dat 的大附件，但又没有程序能打开它。原来这是 Microsoft Exchange 的一个“功能”。 Exchange 支持富文本邮件，即包含字体格式等的邮件，但其它邮件系统不支持，于是从 Exchange 发到非 Exchange 的邮箱后，这个邮件就变成了一个附件，通常叫 winmail.dat，偶尔有其它名字。如果你以纯文本方式打开它，会在文件头看到类似 IPM.Microsoft Mail.Note 的文件格式声明。如果你也用 Excha

原文链接: [https://snowpeak.blog.csdn.net/article/details/6246929](https://snowpeak.blog.csdn.net/article/details/6246929)

---------

有时我们的邮件会收到一个名叫 winmail.dat 的大附件，但又没有程序能打开它。原来这是 Microsoft Exchange 的一个“功能”。 Exchange 支持富文本邮件，即包含字体格式等的邮件，但其它邮件系统不支持，于是从 Exchange 发到非 Exchange 的邮箱后，这个邮件就变成了一个附件，通常叫 winmail.dat，偶尔有其它名字。如果你以纯文本方式打开它，会在文件头看到类似 IPM.Microsoft Mail.Note 的文件格式声明。如果你也用 Exchange 你当然能正常收到邮件，并且没有这个附件，但如果你不用 Exchange，正如绝大多数网友那样，收到的是一个附件，并且想看到它不容易。  
  
先说说查看这个文件的方法。我在 CSDN 下载上传了查看此文件的专用工具。是绿色版的 Windows 程序，解压即可使用。  
  
<http://download.csdn.net/source/3088167>   
  
非 Windows 用户，或者不想使用此程序的，还可以去如下的免费在线服务网站：  
  
<http://www.winmaildat.com/>   
  
此网站的限制是上传文件不能大于 5MB。  
  
最后建议一下 MS Outlook 和 Outlook Express 用户，请做如下设置，以避免邮件发给别人时变成 winmail.dat 的大附件。  
在工具菜单选选项，然后选到“邮件格式”或“发送”选项卡。在邮件发送格式处，选择纯文本或者 HTML，但千万不要选 Rich Text 或富文本格式。这样就行了。