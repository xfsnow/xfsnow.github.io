# JavaScript Compressor and Formatter

Published: *2008-12-30 14:00:00*

Category: __Frontend__

Summary: This article introduces two JavaScript compressor and formatter programs.

---------

I had previously found a program for compressing JavaScript code and had been using it consistently, feeling that the effect was quite good.

<http://javascriptcompressor.com/>

Online JavaScript Source Compression

It simply cleans up spaces, line breaks, redundant comments, and so on. Especially when "Shrink variables" is selected, it will reduce long variable names to single-letter variable names. The compression ratio can usually reach 50% or even smaller. With AJAX becoming prevalent and JavaScript files getting larger, using this compression should significantly reduce traffic burden. Moreover, although the program isn't encrypted after reducing variable names, it makes the program difficult to understand, which can protect copyrights to some extent.

Today I found a program to format the code

<http://jsbeautifier.org/>

It can reformat compressed JS code into a readable format. Of course, if javascriptcompressor.com reduced variable names during compression, there's no way to restore the original meaningful variable names.

When encountering particularly large JS files, browsers may report excessive execution time. If you choose not to stop, it will eventually complete execution.

Both of these programs are written purely in JavaScript and can be downloaded for offline use, which is very convenient.

---
*Original link: https://www.snowpeak.fun/cn/article/detail/javascript_compressor_and_formatter/*