# Dynamically including ASP File Improved

Published: *2006-11-23 16:33:00*

Category: __Backend__

Summary: This article introduces a new function for dynamically including ASP files.

---------

## Dynamically Including ASP Files: Enhancements

ASP itself does not support dynamic file inclusion. Current dynamic inclusion is achieved by merging the included file into the main file using FSO before execution. Below, the traditional inclusion method (e.g., `<--#include file="filename.asp">`) is referred to as "traditional reference," while dynamic file inclusion implemented via functions is referred to as "dynamic reference."

A common implementation is as follows:

```asp
Function include(filename)
    Dim re, content, fso, f, aspStart, aspEnd
    set fso = CreateObject("Scripting.FileSystemObject")
    set f = fso.OpenTextFile(server.mappath(filename))
    content = f.ReadAll
    f.close
    set f = nothing
    set fso = nothing
    set re = new RegExp
    re.pattern = "^/s*="
    aspEnd = 1
    aspStart = inStr(aspEnd, content, "<%") + 2
    do while aspStart > aspEnd + 1
        Response.write Mid(content, aspEnd, aspStart - aspEnd - 2)
        aspEnd = inStr(aspStart, content, "%>") + 2
        Execute(re.replace(Mid(content, aspStart, aspEnd - aspStart - 2), "Response.Write "))
        aspStart = inStr(aspEnd, content, "<%") + 2
    loop
    Response.write Mid(content, aspEnd)
    set re = nothing
End Function
```

Usage example: `include("youinc.asp")`

The above example is cited from <http://www.blueidea.com/tech/program/2003/101.asp>.

However, this function fails when the included file itself contains other included files. Based on the above function, I have developed the following improved function, which can handle cases where the included file contains traditional inclusion files.

```asp
Function includeconvert(oRegExp, strFilename, strBlock)
    Dim incStart, incEnd, match, oMatches, str, code
    'Extract the filename from the include section using the same method as extracting ASP code, and output the rest as is.
    code = ""
    incEnd = 1
    incStart = InStr(incEnd, strBlock, "<--#") + 3
    oRegExp.pattern = "(\w+)=""([^""]+)""" 'Matches file="filename.ext" or virtual="virtualname.ext", capturing type and filename as two substrings.
    Set oMatches = oRegExp.Execute(Mid(strBlock, incStart, incEnd - incStart - 3))
    Set match = oMatches(0) 'When there is only one match, this retrieves it, avoiding the need for For Each match In oMatches ... Next.
    code = code & include(Mid(strFilename, 1, InStrRev(strFilename, "/")) & match.SubMatches(1))
    'Mid(filename, 1, InStrRev(filename, "/")) extracts the path from the referenced subfile name if it has a path, appending it to the traditionally referenced filename in the subfile to find the correct file path. This is because the file path for dynamic references is relative to the main file.
    'To get the second captured substring, use SubMatches(1).
    incStart = InStr(incEnd, strBlock, "<!--#include ") + 13
    Loop
    str = Mid(strBlock, incEnd)
    str = Replace(str, """", """"") 'Replace single double quotes with two double quotes.
    str = Replace(str, VbCr, "")
    str = Replace(str, VbLf, "")
    str = Replace(str, VbCrLf, "")
    code = code & VbCrLf & "Response.Write """ & str & """"
    includeconvert = code
End Function

Function include(filename)
    Dim re, content, fso, f, aspStart, aspEnd, code
    Set fso = CreateObject("scripting.FileSystemObject")
    Set f = fso.OpenTextFile(Server.MapPath(filename))
    content = f.ReadAll
    f.close
    Set f = nothing
    Set fso = nothing

    code = ""
    aspEnd = 1
    aspStart = InStr(aspEnd, content, "<%") + 2
    Set re = new RegExp
    Do While aspStart > aspEnd + 1
        'Traditional references <!--#include are definitely outside ASP code blocks, so convert them first.
        code = code & includeconvert(re, filename, Mid(content, aspEnd, aspStart - aspEnd - 2))
        aspEnd = InStr(aspStart, content, "%>") + 2
        re.pattern = "^/s*=" 'This regex replaces <% = str %> with the standard <%Response.Write str %>.
        'Add a newline before ASP blocks to avoid errors caused by multiple Response.Write statements on the same line.
        code = code & VbCrLf & re.replace(Mid(content, aspStart, aspEnd - aspStart - 2), "Response.Write ")
        aspStart = InStr(aspEnd, content, "<%") + 2
    Loop
    code = code & includeconvert(re, filename, Mid(content, aspEnd))
    Set re = nothing
    include = code
End Function
```

For convenience, the above function ultimately returns the entire ASP code with the included files integrated. To use it, you need to execute it with `Execute(include("file.asp"))`.

The above function has been tested successfully when the included file and the main file are in the same path. Further error handling for cases where the included file and the main file are in different paths has not been implemented due to time constraints. Feedback and improvements are welcome.

---
*Original link: https://www.snowpeak.fun/cn/article/detail/dynamically_including_asp_file_improved/*
