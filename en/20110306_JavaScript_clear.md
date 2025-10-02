# Cleaning Interference Codes with JavaScript

Published: *2011-03-06 21:21:00*

Category: __Frontend__

Summary: Create a bookmarklet with JavaScript to easily clean interference codes from web pages.

---------

## Background

Some content publishing systems or forums on the internet mix interference codes into their content. These appear as normal text when viewing, but when copied and pasted, they include garbled characters and website URLs or other identifying information. The purpose is to prevent the content from being easily copied by others.

These interference codes are actually specific tags like `<font>` and `<span>` added to the HTML source code, styled to be invisible, but their content gets copied when users copy and paste text. Those interested can examine the HTML source of pages with interference codes to see this.

## Solution

Here's a method that can be accomplished with JavaScript, without needing server-side languages.

The basic principle is to use `javascript:` as a protocol, allowing us to execute a small piece of JavaScript code on an HTML page. Such code snippets can be saved in bookmarks, called Bookmarklets, which are also mentioned in "JavaScript: The Definitive Guide".

Note that since bookmarklet code is parsed as a single line, single-line comments with `//` cannot be used; block comments with `/* */` must be used instead.

Save the following HTML code as an HTML file, then right-click on the link and choose to save it to bookmarks/favorites. When encountering web pages with interference codes in the future, simply select this bookmark, and the JavaScript code will execute to clean the interference codes.

```html
<a href='javascript:
(function() {
var tamper = {
    "font":"font-size: 0px",
    "span":"display: none"
};
for (var t in tamper)
{
    var doms = document.getElementsByTagName(t);
    var numAll = doms.length-1;
    for (var i=numAll; i>=0; i--)
    {
        var item = doms[i];
        if (item.style.cssText.toLowerCase().indexOf(tamper[t]) > -1)
        {
            item.parentNode.removeChild(item);
        }
    }
};
})();
void 0;
'>
JavaScript Clean Interference Characters
</a>
```

This approach has been tested and works in both IE and Firefox.

## Conclusion

Personally, I think if content is published on a website, it's meant to be shared. Having others help repost it can expand its influence even more. When people normally repost, they also include the original copyright information, so there's no need to go through the trouble of adding interference codes to create obstacles. Moreover, removing interference codes is actually quite simple. After creating the above small bookmarklet, it's difficult to find websites with interference codes for testing. Although a popular forum program supports interference codes, forum users don't enable this feature anymore. Interested readers are welcome to recommend some websites with interference codes to help test this small program's functionality.