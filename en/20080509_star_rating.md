# A Simple Star Rating

Published: *2008-05-09 10:44:00*

Category: __Frontend__

Summary: Star rating is a commonly used feature in surveys. Most implementations online dynamically call images to achieve this functionality. By combining CSS, I came up with a simpler method.

-------------------

Star rating is a commonly used feature in surveys. Most implementations online dynamically call images to achieve this functionality. By combining CSS, I came up with a simpler method. This approach makes the functionality easier to use, simplifies the HTML page source code and JavaScript statements, and further separates content from design using CSS layout.

Using CSS with a single image as the background has an additional benefit: once the page is downloaded, the background image is already loaded. When dynamically switching the class name of the object, since the same image file is used, there is no display delay. Traditional methods that use different images to show different states may experience delays when loading new images unless JavaScript is used to pre-download all images.

**Basic Idea**:
The star rating area is an independent `div` block. Based on the horizontal position of the mouse within this block, the position is converted into a ratio of the block's width, which is then translated into a value between 1 and 5. For example, in the following example, the block width is 80 pixels. When the mouse's horizontal coordinate is 27, `(27/80)*5`, rounded up, results in a rating of 2.

## HTML Example

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Star Rating</title>
<link href="css.css" rel="stylesheet" type="text/css" />
<script language="JavaScript" src="star.js" type="text/JavaScript"></script>
</head>
<body>
Star rating. Here, the input is initially set as a text type for easier debugging. In actual use, it can be changed to a hidden type.
<form name="qn" method="post" action="#">
<input type="text" name="field0" id="field0" />
<div class="ratingstar" id="field0_star"
onClick="page.starSet(this, 'field0');"
onmousemove="page.starHover(this);"
onmouseout="page.starOut(this, 'field0');">
<div id="field0_star_hover"></div></div>
</form>
</body>
</html>
```

## CSS Example

```css
.ratingstar, .ratingstar_hover, .ratingstar_set {
  height: 16px;
  width: 80px;
  cursor: pointer;
  background-image: url(ratingstar.gif);
  background-repeat: repeat-x;
  position: relative; /* Fixes mouse position inaccuracies in Firefox */
}
.ratingstar_hover {
  background-position: 0 -32px;
}
.ratingstar_set {
  background-position: 0 -16px;
}
```

![ratingstar.gif](../assets/img/20080509_a_simple_01.gif)

The `ratingstar.gif` image is shown above. It is 16 pixels wide and 48 pixels high, with three vertically stacked stars of different colors. The CSS uses `background-repeat: repeat-x;` to tile it horizontally. Combined with a block width of `width: 80px;`, it displays 5 stars. The block width must be defined as 5 times the image width.

## JavaScript Example

```javascript
function getEvent() // Compatible with both IE and Firefox
{
  if (document.all) return window.event;
  func = getEvent.caller;
  while (func != null) {
    var arg0 = func.arguments[0];
    if (arg0) {
      if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof(arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
        return arg0;
      }
    }
    func = func.caller;
  }
  return null;
}

function getMouseWithinX() {
  e = getEvent();
  var mouseX = 0;
  // Firefox uses layerX for horizontal position
  if (navigator.userAgent.indexOf("Firefox") != -1) {
    return e.layerX;
  }
  // IE uses offsetX for mouse position relative to the element
  else {
    return e.offsetX;
  }
}

var page = {
  $: function (el) {
    return document.getElementById(el);
  },
  starHover: function (obj) {
    var mousex = getMouseWithinX();
    var intStar = Math.ceil(5 * (mousex / obj.clientWidth));
    var widthStar = intStar * obj.clientWidth / 5;
    var hover = obj.id + '_hover';
    obj.title = intStar + '/5';
    var objHover = this.$(hover);
    objHover.className = "ratingstar_hover";
    objHover.style.width = widthStar + 'px';
  },
  starOut: function (obj, container) {
    if (this.$(container))
      var intStar = this.$(container).value;
    var widthStar = intStar * obj.clientWidth / 5;
    var hover = obj.id + '_hover';
    var objHover = this.$(hover);
    objHover.className = "ratingstar_set";
    objHover.style.width = widthStar + 'px';
  },
  starSet: function (obj, container) {
    var mousex = getMouseWithinX();
    var intStar = Math.ceil(5 * (mousex / obj.clientWidth));
    var widthStar = intStar * obj.clientWidth / 5;
    var hover = obj.id + '_hover';
    var objHover = this.$(hover);
    objHover.className = "ratingstar_set";
    objHover.style.width = widthStar + 'px';
    if (this.$(container))
      this.$(container).value = intStar;
  }
};
```

**Explanation**:
The first two functions are used to get the mouse position within an element. The core algorithm is in the `starHover` function, which has been explained earlier. Other details are documented in the function comments.

A few days ago, I tried to simplify the HTML by keeping only:

```html
<div class="ratingstar" id="field0_star" onClick="page.starSet(this, 'field0');" onmousemove="page.starHover(this);" onmouseout="page.starOut(this, 'field0');"></div>
```

And dynamically generating the inner:

```html
<div id="field0_star_hover"></div>
```

using JavaScript. However, a strange issue occurred: moving the mouse within the `field0_star` area seemed to continuously trigger `onmousemove` and `onmouseout` events, causing the styles to switch rapidly and resulting in a flickering effect. Therefore, I decided to stick with the current approach.

**Remaining Issues**:
The CSS property `position:relative;` is used to fix mouse position inaccuracies in Firefox. Without this, `getMouseWithinX()` in Firefox seems to return the mouse position relative to the page instead of the `field0_star` element, resulting in values that are too large. The effect is that more than 5 stars are displayed when the mouse hovers over the area. Further investigation is needed to fully understand the relationship between events, elements, and the mouse in both IE and Firefox. If anyone has insights, feel free to share in the comments.

---
*Original link: https://www.snowpeak.fun/cn/article/detail/a_simple_star_rating/*
