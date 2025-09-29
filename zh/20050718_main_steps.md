# DVD提取字幕的主要流程及工具

发布时间: *2005-07-18 18:19:00*

分类: __软件工具__

---------

## [DVD提取字幕的主要流程及工具](/cn/article/detail/main_steps_and_tools_to_extract_subtitle_from_dvd/)


制做字幕到现在为止，我没发现一个包括所有功能的一体化的大型程序，这可能和制做字幕涉及的流程比较复杂、情况多种多样也有一定关系。不过理清了思路，找准每个步骤需要的工具，做出好的字幕其实并不难。而且由于各个步骤的工具功能都很专一，所以这些程序往往体积小巧，安装简便，使用也很方便。

下面简单介绍一下各步骤以及使用的工具软件。

  1. DVD拷盘

用 DVD Decrypter，得到VOB文件

  2. 从VOB中提取图形型字幕

用 VobSub，得到 idx和sub配对的图形字幕文件

  3. 图形型字幕转换成文本型

用 SubOCR，得到 srt 字幕文件

  4. 校对字幕

用 Subtitle Workshop，得到翻译精准的 srt 字幕文件

  5. 如果要加上字幕效果

把 srt 字幕文件转换成 SSA 或 ASS 字幕，还可以用Subtitle Workshop去转换文件格式，而做字幕效果我都是用一个文本编辑程序自己手写的。
文本编辑程序推荐 UltraEdit。



---
*原文链接: https://www.snowpeak.fun/cn/article/detail/main_steps_and_tools_to_extract_subtitle_from_dvd/*
