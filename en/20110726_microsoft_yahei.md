# IE6 and Microsoft YaHei

Published: *2011-07-26 17:43:00*

Category: __Frontend__

Summary: This article introduces methods for using Microsoft YaHei font in IE6 browser, as well as alternative solutions when UTF-8 character set is required.

---------

Through my testing, the only way to make IE6 support Microsoft YaHei is to use gb2312 character set in HTML pages, while CSS files can use either gb2312 or utf8. That is, declare in the HTML head:

```html
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
```

Then use the following declaration in CSS:

```css
.yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
}
```

If the HTML page must use utf8 character set, then IE6 will not support Microsoft YaHei. In this case, I think it's not necessary to change the HTML page character set for styling. My preferred workaround is to hack the IE6 environment to use regular SimHei font, like:

```css
.yahei {
    font-family: "Microsoft YaHei", SimHei, sans-serif;
    _font-family: SimHei, sans-serif;
}
```

This way, SimHei will be displayed in IE6, which looks much better than the default SimSun when Microsoft YaHei is not supported.


---
*Original Link: https://www.snowpeak.fun/en/article/detail/microsoft_yahei_in_ie6/*