# Simplified and Traditional Chinese Converter by JavaScript

Published: *2008-03-27 09:30:00*

Category: __Frontend__

Summary: A simplified and traditional Chinese converter written in JavaScript.

---------
Recently, I came across many simplified-to-traditional Chinese conversion programs online. However, most of them only cover around 3,000 commonly used characters. Here, I have organized the characters more comprehensively and clarified the logic. The main idea is to create two strings containing the simplified and traditional versions of the main Chinese characters and find the corresponding character by position.

Based on suggestions from Lang Tao <https://blog.csdn.net/lt1129lt>, I removed characters that are identical in both simplified and traditional forms and added a filter to exclude non-Chinese characters. This optimization reduced runtime to about 30% of the original. The new source code can be found here:

<https://github.com/xfsnow/xfsnow.github.io/blob/master/simtra.htm>

Below is the archived version of the old program:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="author" content="snowpeak" />
<title>Simplified and Traditional Chinese Converter</title>
<script type="text/javascript">
// The basic idea is to create two strings containing a complete library of simplified and corresponding traditional characters, and find the match by position.
// Thanks to Zhe Si Luo for providing the GB2312 list of Chinese characters <http://www.chinadiy.net/bbs/196761p1p1>

var cnConvert = {
    var str = '';
    for (var i = 0; i < cc.length; i++) {
        if (this.strFT.indexOf(cc.charAt(i)) != -1)
            str += this.strPY.charAt(this.strFT.indexOf(cc.charAt(i)));
        else
            str += cc.charAt(i);
    }
    return str;
};
</script>
</head>
<body>
<h1>Online Simplified and Traditional Chinese Converter</h1>
<div class="container">
<input type="radio" name="r1" value="0" onclick="val = cnConvert.$('txt');val.value=cnConvert.tra2sim(val.value)" checked="checked" />
Simplified
<input type="radio" name="r1" value="1" onclick="val = cnConvert.$('txt');val.value=cnConvert.sim2tra(val.value)" />
Traditional
<br/>
<textarea id="txt" rows="15" cols="65"></textarea>
<br/>
<input type="hidden" name="h1" value="0" />
</div>
</body>
</html>
```

Original link: [https://snowpeak.blog.csdn.net/article/details/2221935](https://snowpeak.blog.csdn.net/article/details/2221935)
