# PHP 中 syntax error, unexpected $end 错误的一种原因及解决

发布时间: *2008-10-24 17:35:00*

分类: __服务器端技术__

---------

## [PHP 中 syntax error, unexpected $end 错误的一种原因及解决](/cn/article/detail/a_solution_to_unexpected_end_in_php/)

分类: [服务器端技术](/cn/article/category/server_side_technology/) 2008-10-24 17:35:00 阅读(2355)

Parse error: syntax error, unexpected $end in script.php on line xx

调试了一会后发现产生错误的行是文件中间某行


    //$str .= "?>/n";

想起来了 PHP 解释器允许的结尾标记那行还可以用单行注释，即 //$str .= "?>/n"; 被解释成结尾标记前有注释，注释的内容是 //$str .= "，而 ?> 后面的 /n"; 会被解释作 PHP 块外的内容按 HTML 输出出去！结果是给 $str .= "?>/n"; 这行添加 // 成注释后，反而多了个 ?> 的结束标记，造成原来真正的结束标记成了意料之外的（unexpected）了。

解决办法就是直接删掉这一行即可。

PHP 开始和结束标记所在行别写其它东西，是个好习惯。


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/a_solution_to_unexpected_end_in_php/*
