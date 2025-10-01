# CSS+JavaScript Universal Scrolling Bar

Published: *2009-10-01 17:01:00*

Category: __Frontend__

Summary: A universal scrolling bar implemented with pure CSS+JS, which can be used in scenarios that require dynamic content display such as news lists and announcements. Seamless scrolling effect is achieved through absolute positioning and timer control.

---------

Here's the source code:

## Source Code

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">  
<html xmlns="http://www.w3.org/1999/xhtml">  
<head>  
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />  
<title>Scrolling Board</title>  
<style type="text/css">  
/* Initialization */  
body {  
font: 12px/1 "宋体", SimSun, serif;  
background:#fff;  
color:#000;  
}  
/* The core is position:relative;, which allows its internal ul to be absolutely positioned, and the position can be moved upward by changing the top value. */  
.scrollUl {  
overflow:hidden;  
position:relative;  
}  
/* Demonstrating multiple scrolling boards used at the same time, here it is unified to 20px per line, the first one has 4 lines per screen, and the 2nd one has 6 lines per screen. In fact, the line height can also be different in each group. The scrolling speed is independent of the specific line height. */  
#scrollUlTest1 {height:80px;}  
#scrollUlTest2 {height:120px;}  
/* Clear browser default margin and padding values */  
.scrollUl ul, .scrollUl li {  
margin:0;  
padding:0;  
list-style:none outside; /* Clear browser default placeholder for list items */  
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
<h1>Universal Scrolling Board Demo</h1>  
<h4>Group 1</h4>  
<div class="scrollUl" id="scrollUlTest1">  
<ul>  
<li>Content 1</li>  
<li>Content 2</li>  
<li>Content 3</li>  
<li>Content 4</li>  
<li>Content 5</li>  
<li>Content 6</li>  
<li>Content 7</li>  
<li>Content 8</li>  
<li>Content 9</li>  
<li>Content 10</li>  
<li>Content 11</li>  
<li>Content 12</li>  
<li>Content 13</li>  
<li>Content 14</li>  
<li>Content 15</li>  
<li>Content 16</li>  
<li>Content 17</li>  
<li>Content 18</li>  
<li>Content 19</li>  
<li>Content 20</li>  
</ul>  
</div>  
<br /><br /><br /><br /><br /><br />  
<h4>Group 2</h4>  
<div class="scrollUl" id="scrollUlTest2">  
<ul>  
<li>Content 1</li>  
<li>Content 2</li>  
<li>Content 3</li>  
<li>Content 4</li>  
<li>Content 5</li>  
<li>Content 6</li>  
<li>Content 7</li>  
<li>Content 8</li>  
<li>Content 9</li>  
<li>Content 10</li>  
<li>Content 11</li>  
<li>Content 12</li>  
<li>Content 13</li>  
<li>Content 14</li>  
<li>Content 15</li>  
<li>Content 16</li>  
<li>Content 17</li>  
<li>Content 18</li>  
<li>Content 18</li>  
</ul>  
</div>  
</body>  
</html>
```

## Implementation Principle

The implementation principle of this universal scrolling bar is based on the following points:

1. Use `position:relative` to create a relatively positioned container, and the internal `ul` element uses `position:absolute` for absolute positioning
2. Continuously change the `top` value of the `ul` element through a timer to achieve the upward movement effect
3. When scrolling to the last item, reposition to the starting position to form a cyclic scrolling effect
4. Hide the content that exceeds the container by setting the `overflow:hidden` property of the container

## Usage

1. Include the provided CSS styles
2. Write HTML code according to the example structure
3. Adjust the container height and list item styles as needed
4. Add JavaScript code to control the scrolling effect

---
*Original link: https://www.snowpeak.fun/en/article/detail/css_javascript_universal_scrolling_bar/*