# CSS+JavaScript 通用循环滚动条

发布时间: *2009-10-01 17:01:00*

简介: 直接上源码啦：  http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">http://www.w3.org/1999/xhtml">滚动板/* 初始化 */body { font: 12px/1 "宋体", SimSun, serif; background:#fff; color:#000;}/*核心是 position:r

原文链接: [https://snowpeak.blog.csdn.net/article/details/4625584](https://snowpeak.blog.csdn.net/article/details/4625584)

---------

直接上源码啦：

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "<http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd>">  
<html xmlns="<http://www.w3.org/1999/xhtml>">  
<head>  
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />  
<title>滚动板</title>  
<style type="text/css">  
/* 初始化 */  
body {  
font: 12px/1 "宋体", SimSun, serif;  
background:#fff;  
color:#000;  
}  
/*核心是 position:relative;，才能让其内部的 ul 以绝对定位，通过改变 top 值实现向上移位置。*/  
.scrollUl {  
overflow:hidden;  
position:relative;  
}  
/*演示多个滚动板同时使用，这里是统一按每行按 20px 高，第一个每屏 4 行，第 2 个每屏 6 行。其实每组中行高也可不同。滚动速度与具体行高无关。*/  
#scrollUlTest1 {height:80px;}  
#scrollUlTest2 {height:120px;}  
/* 清除浏览器默认的margin和padding值 */  
.scrollUl ul, .scrollUl li {  
margin:0;  
padding:0;  
list-style:none outside; /* 清除浏览器中列表项默认的占位 */  
}  
.scrollUl ul {  
position:absolute;  
}  
.scrollUl li {  
height:20px;  
}

</style>  
<script type="text/javascript" language="javascript">  
  
</script>

</head>  
<body>  
<h1>通用滚动板演示</h1>  
<h4>第1组</h4>  
<div class="scrollUl" id="scrollUlTest1">  
<ul>  
<li>第 1 条内容</li>  
<li>第 2 条内容</li>  
<li>第 3 条内容</li>  
<li>第 4 条内容</li>  
<li>第 5 条内容</li>  
<li>第 6 条内容</li>  
<li>第 7 条内容</li>  
<li>第 8 条内容</li>  
<li>第 9 条内容</li>  
<li>第 10 条内容</li>  
<li>第 11 条内容</li>  
<li>第 12 条内容</li>  
<li>第 13 条内容</li>  
<li>第 14 条内容</li>  
<li>第 15 条内容</li>  
<li>第 16 条内容</li>  
<li>第 17 条内容</li>  
<li>第 18 条内容</li>  
<li>第 19 条内容</li>  
<li>第 20 条内容</li>  
</ul>  
</div>  
<br /><br /><br /><br /><br /><br />  
<h4>第2组</h4>  
<div class="scrollUl" id="scrollUlTest2">  
<ul>  
<li>第 1 条内容</li>  
<li>第 2 条内容</li>  
<li>第 3 条内容</li>  
<li>第 4 条内容</li>  
<li>第 5 条内容</li>  
<li>第 6 条内容</li>  
<li>第 7 条内容</li>  
<li>第 8 条内容</li>  
<li>第 9 条内容</li>  
<li>第 10 条内容</li>  
<li>第 11 条内容</li>  
<li>第 12 条内容</li>  
<li>第 13 条内容</li>  
<li>第 14 条内容</li>  
<li>第 15 条内容</li>  
<li>第 16 条内容</li>  
<li>第 17 条内容</li>  
<li>第 18 条内容</li>  
</ul>  
</div>  
</body>  
</html>