# ASP 动态包含文件的改进

发布时间: *2006-11-23 16:33:00*

分类: __服务器端技术__

---------

## [ASP 动态包含文件的改进](/cn/article/detail/dynamically_including_asp_file_improved/)

分类: [服务器端技术](/cn/article/category/server_side_technology/) 2006-11-23 16:33:00 阅读(2536)

ASP 本身不支持动态包含文件，现在的动态包含是通过 FSO 把被包含的文件合并到主文件里再运行。以下也有把形如  的普通包含文件方式称作“传统引用”，用函数实现的动态包含文件称作“动态引用”。

常见的程序如下：


    Function include(filename)
     Dim re,content,fso,f,aspStart,aspEnd
     set fso=CreateObject("Scripting.FileSystemObject")
     set f=fso.OpenTextFile(server.mappath(filename))
     content=f.ReadAll
     f.close
     set f=nothing
     set fso=nothing
     set re=new RegExp
     re.pattern="^/s*="
     aspEnd=1
     aspStart=inStr(aspEnd,content,"<%")+2
     do while aspStart>aspEnd+1
      Response.write Mid(content,aspEnd,aspStart-aspEnd-2)
      aspEnd=inStr(aspStart,content,"%/>")+2
      Execute(re.replace(Mid(content,aspStart,aspEnd-aspStart-2),"Response.Write "))
      aspStart=inStr(aspEnd,content,"<%")+2
     loop
     Response.write Mid(content,aspEnd)
     set re=nothing
    End Function


使用范例：include("youinc.asp")

以上范例引自 <http://www.blueidea.com/tech/program/2003/101.asp>

但这处函数在处理补包含的文件中还有包含文件时就不灵了。我在以上函数的基础上改进出来如下函数，在被包含文件中还有普通的包含文件  也可正常运行。


    Function includeconvert(oRegExp, strFilename, strBlock)
     Dim incStart, incEnd, match, oMatches, str, code
     '用提取ASP代码的相同方式提取出include 部分的文件名，其余部分原样输出
     code = ""
     incEnd = 1
     incStart = InStr(incEnd,strBlock,"<--#，incStart是从")+3
      oRegExp.pattern="(/w+)=""([^""]+)""" '匹配 file="filename.ext" 或 virtual="virtualname.ext"，捕捉类型及文件名两个子串
      Set oMatches = oRegExp.Execute(Mid(strBlock,incStart,incEnd-incStart-3))
      Set match = oMatches(0) '确定只有一组捕捉时，要得到这一组匹配的子串，可以这样做，省去用 For Each match In oMatches …… Next
      code = code & include(Mid(strFilename, 1, InStrRev(strFilename, "/"))
    'Mid(filename, 1, InStrRev(filename, "/")) 是在被引用的子文件名有路径时,把路径提取出来,
    '加在子文件中传统引用的文件名前面,以找到正确的打开文件路径,因为动态引用时的文件路径是相对主文件而言的。
    '要第二个匹配子串用SubMatches(1)
    & match.SubMatches(1))
      incStart = InStr(incEnd,strBlock,"<!--#include ")+13
     Loop
     str = Mid(strBlock,incEnd)
     str = Replace(str, """", """""") '把单个双引号换成两个双引号
     str = Replace(str, VbCr, "")
     str = Replace(str, VbLf, "")
     str = Replace(str, VbCrLf, "")
     code = code & VbCrLf & "Response.Write """ & str & """"
     includeconvert = code
    End Function
    Function include(filename)
     Dim re, content, fso, f, aspStart, aspEnd, code
     Set fso=CreateObject("scripting.FileSystemObject")
     Set f=fso.OpenTextFile(Server.MapPath(filename))
     content=f.ReadAll
     f.close
     Set f=nothing
     Set fso=nothing

     code = ""
     aspEnd=1
     aspStart=InStr(aspEnd,content,"<%")+2
     Set re=new RegExp
     Do While aspStart>aspEnd+1
      '传统引用<!--#inclde 肯定是在ASP代码段以外的，所以先转。
      code = code & includeconvert (re, filename, Mid(content,aspEnd,aspStart-aspEnd-2))
      aspEnd=InStr(aspStart,content,"%/>")+2
      re.pattern="^/s*=" '这段正则替换原来是把 <% = str % > 换回成标准的 <%Response.Write str % >
    'ASP块前面再加回车换行，以避免连接块之间多个 Response.Write在同一行的错误
       code = code & VbCrLf & re.replace(Mid(content,aspStart,aspEnd-aspStart-2),"Response.Write ")
      aspStart=InStr(aspEnd,content,"<%")+2
     Loop
     code = code & includeconvert (re, filename, Mid(content,aspEnd))
     Set re=nothing
     include = codeEnd Function


方便起见，以上函数最终返回的是整合了包含文件的整个 ASP 代码，使用时还要再用 Execute 执行之，即使用时需要：Execute(include("file.asp"))。

以上函数对被包含文件与主文件同一路径时测试通过，未对被包含文件与主文件路径不同的情况做进一步容错，时间有限，欢迎有兴趣的朋友提出意见和改进。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/dynamically_including_asp_file_improved/*
