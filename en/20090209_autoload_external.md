# Autoload External JavaScript Files

Published: *2009-02-09 17:29:00*

Category: __Frontend__

---------

Although the title is "Autoload External JavaScript Files", it hasn't reached the level of PHP where class definition files are automatically loaded when new class names are encountered in the program. It still requires specifying file names to load external JavaScript files, but this should be sufficient for JavaScript. When there are many external JavaScript files, this is quite convenient. For detailed instructions on usage, please see the comments in the source code.

## Source Code

File name: autoload.js

```javascript
/* Copyright 2009 Snowpeak.org
* File name: autoload.js
* Abstract: Batch load external JS files
* Author: snowpeak
Usage:
Add the following in the head section of an HTML page:
<script type="text/javascript" src="autoload.js?a,js/b,other/c"></script>
List the external JS file paths as parameters after autoload.js?, separated by commas, without adding the .js suffix. These paths should be relative to the HTML page that references them, not to the autoload.js file.
This will create the corresponding script tags:
<script type="text/javascript" src="a.js"/>
<script type="text/javascript" src="js/b.js"/>
<script type="text/javascript" src="other/c.js"/>
Notes:
1. Pure anonymous function, does not add any global variables.
2. IE and Firefox generate the same DOM node order after loading JS files. For example, autoload.js?a,b,c generates 3 script tags in the order a, b, c, but their execution order is different. IE executes them in order, while Firefox executes them in reverse order, i.e., c, b, a.
*/
(function(){
 var scripts = document.getElementsByTagName("script");
 // A for loop must be used to iterate through the elements of the scripts array. A for-in loop would get the array's own properties.
 for (var i=0;i<scripts.length;i++)
 {
  if (scripts[i].src)
  {
   // Match src values containing autoload.js? and remember the parameters after it, such as a,ch04get in src="autoload.js?a,ch04get"
   var jsArgs = scripts[i].src.match(/autoload.js/?(/S+)/);
  }
 }
 if (jsArgs)
 {
  var jsFiles = jsArgs[1].split(',');
  var oHead = document.getElementsByTagName('head')[0];

  for (i=0; i<jsFiles.length;i++)
  {
   var oScript = document.createElement('script');
   oScript.type = "text/javascript";
   // The default path for external JS files should be relative to the HTML page that calls this autoload.js. Add the .js extension to the filename.
   oScript.src = jsFiles[i]+'.js';
   oHead.appendChild(oScript);
  }
 }
}
)()
```

---
*Original link: https://www.snowpeak.fun/cn/article/detail/autoload_external_javascript_files/*