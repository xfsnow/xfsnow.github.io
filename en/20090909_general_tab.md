# Pure CSS+JS Universal Tab

Published: *2009-09-09 15:29:00*

Category: __Frontend__

Summary: A pure CSS+JS universal tab

---------

Please see the source code below, each section has detailed comments.

## Source Code

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
<title>Tabs</title>
<style type="text/css">
/*Core:
Tab page switching: First set each tab content block to display: none, then set the current tab's .tabOn .tabContentBox to display: block;
Since tab pages belong to different li elements, to position them at the same location, we need to use position: absolute. This is not absolute positioning relative to the window, but relative to the entire tab group ul, because we set position:relative; on .tabList .tabBox.
Learned from http://www.awflasher.com/blog/archives/731, to make a node absolutely positioned relative to its parent node rather than the window, set position:relative; on the reference parent node. From this tab example, we know that this parent node doesn't have to be the direct parent node, but can be several levels up. That is, after a node sets position:relative;, all its child nodes using position: absolute; will reference this node rather than the window.
The top value of 30px here is the height of the tab header .tabBox h4.
*/
.tabBox {
	height:100%;
	position:relative;
	background:#fff;
	border:1px solid #99F;
}
.tabBox .tabContentBox {
	margin:1px;
	padding: 10px;
	width:570px;
	height:60px;
	text-align: left;
	overflow: hidden;
	background: #fff;
	position: absolute;
	top: 30px;
	left: 0;
	display: none;
}

/*The original example switched on hover, but I want it to switch on click, so I don't use the .tabOption:hover cascade*/
.tabBox .tabOn .tabContentBox  {
	display: block;
}

/*Initialization*/
body {
	font: 12px/1 "宋体", SimSun, serif;
	background:#fff;
	color:#000;
}

/*Clear browser default margin and padding values*/
ul,li,dl,dt,dd {
	margin:0;
	padding:0;
}
ul,li {
	list-style:none outside;  /*Clear browser default placeholder for list items*/
}
a {
	text-decoration:none;
}
a:hover {
	text-decoration:underline;
}
/*Overall tab appearance definition*/
.tabBox {
	width:580px;
	height:115px;
	overflow:hidden;
}
/*Percentage width actually supports 2 decimal places, perfectly synthesizing a complete bar in FF, but still has some blank space in IE. It seems we have to calculate it into pixel values with JS, and put the last few pixels in the last one.
width:25%; is only used for the default 4 tabs. When the number of tabs is not 4, JS will evenly distribute the width. The left and right border styles of the tab headers are applied to the h4 tag under li. The benefit of this is that when JS calculates the width, it only needs to consider width, without worrying about borders and other minor numbers.*/
.tabBox li {
	float:left;
	width:25%;
	text-align:center;
}
/*Selected and unselected styles for tab headers. It seems padding cannot be used for vertical centering here, as it would make the borders exceed, so we have to use line-height with height. The tab style cleverly uses the h4 nested in li to implement: when unselected, the bottom border is the same color as the outer frame, and the left and right borders are the same color as the tab header background; when selected, the bottom border is the same color as the content background, and the left and right borders are the same color as the outer frame.*/
.tabBox  h4 {
	cursor:pointer;
	margin:0;
	padding: 0;
	height: 30px;
	line-height:30px;
	color:#036;
	font-size:12px;
	font-weight:normal;
	display:block;
	background:#edf2fa;
	border-bottom:1px solid #99F;
}
.tabBox .tabOn h4, .tabBox h4.tabOnFirst, .tabBox h4.tabOnFinal {
	color:#06f;
	background:#fff;
	border-left:1px solid #99F;
	border-right: 1px solid #99F;
	border-right: 1px solid #99F;
	border-bottom:1px solid #FFF;
}
.tabBox h4.tabOnFirst {
	border-left:1px solid #fff;
	border-bottom:1px solid #FFF;
}
.tabBox h4.tabOnFinal {
	border-right:1px solid #fff;
	border-bottom:1px solid #fff;
}
</style>
<script type="text/javascript" language="javascript">

</script>

</head>
<body>
<h1>Universal Tab Demo</h1>
  <ul class="tabBox">

	<li class="tabOption tabOn">
	  <h4 class="tabOnFirst">Tab 1</h4>
	  <div class="tabContentBox">
	  Content of 1<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
	<li class="tabOption">
	  <h4>Tab 2</h4>
	  <div class="tabContentBox">
	Content of 2<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
	<li class="tabOption">
	  <h4>Tab 3</h4>
	  <div class="tabContentBox">
		Content of 3<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
  </ul>


<br /><br /><br /><br /><br /><br />
  <ul class="tabBox">
	<li class="tabOption tabOn">
	  <h4 class="tabOnFirst">Tab 1</h4>
	  <div class="tabContentBox">
		Content of 1<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
	<li class="tabOption">
	  <h4>Tab 2</h4>
	  <div class="tabContentBox">
	Content of 2<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
	<li class="tabOption">
	  <h4>Tab 3</h4>
	  <div class="tabContentBox">
		Content of 3<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
	<li class="tabOption">
	  <h4>Tab 4</h4>
	  <div class="tabContentBox">
		Content of 4<br /><a href="http://www.snowpeak.org" target="_blank">www.snowpeak.org</a>
	  </div>
	</li>
  </ul>
</body>
</html>
```

---
*Original link: https://www.snowpeak.fun/en/article/detail/general_tab_with_pure_css_and_js/*