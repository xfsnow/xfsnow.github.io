# Playing Flash Videos on iPhone and iPad Without Jailbreaking or Installing Apps

Published: *2011-11-16 22:36:29*

Category: __Tools__

Summary: iPhone and iPad do not natively support Flash. One approach is to install Flash-supporting apps like Frash. I came across a method introduced by foreign friends that allows Flash playback without jailbreaking or installing applications, and I'm translating it here to share with everyone.

---------

iPhone and iPad do not natively support Flash. One approach is to install Flash-supporting apps like Frash. I came across a method introduced by foreign friends that allows Flash playback without jailbreaking or installing applications, and I'm translating it here to share with everyone.

## Method:

Use Safari browser on iPad or iPhone to visit:

<http://code.google.com/p/itransmogrify/>

Click the "right from your iPhone" link near the end of the page.

When you reach this new page, it's actually a detailed introduction. Here are the key steps:

1. Add the current URL to Safari bookmarks, and you can use the default name iTransmogrify.

2. Edit the bookmark you just added. Click on the URL bar in the second line, and use iPad's text selection feature to drag all the way to the leftmost of the line. It should look something like this:

   ```
   http://joemaller.com/___?javascript:if%28typ ...
   ```

3. Select from the leftmost position to the question mark before javascript, excluding the javascript text itself, and delete the selected text. The bookmark is now edited.

4. Visit websites with Flash content. At this point, Flash content won't display. Click the iTransmogrify bookmark you just added. The current URL won't change, but the Flash content will be displayed. If successful, other websites with Flash content should also display properly. If you encounter Flash content that doesn't display again, simply click the iTransmogrify bookmark once more.

## Principle Analysis

Let's briefly discuss how it works. Essentially, this is a small piece of JavaScript code that runs via a bookmark. Its complete code is as follows:

```javascript
http://joemaller.com/___?javascript:if%28typeof%28iTransmogrify%29%3D%3D%27undefined%27%29%7Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.src%3D%27http%3A%2F%2Fjoemaller.com%2FiTransmogrify-latest.js%3Fq%3D%27%2B%28new%20Date%29.getTime%28%29%3Bdocument.getElementsByTagName%28%27head%27%29%5B0%5D.appendChild%28s%29%7Dvoid%280%29
```

Its function is to load an external JavaScript file into the current page, located at:

http://joemaller.com/iTransmogrify-latest.js

We can download this js file and examine it carefully. After a general look, Xuefeng found that its principle seems to be mimicking Flash player plugins as plugins natively supported by iPad, such as QuickTime. Of course, many interface control mappings are needed to achieve this mimicry. Some individual Flash controls may not be fully mapped to QuickTime, so when viewing Flash with the above method, some minor functions may be missing. For example, you can watch the main video on Tudou, but the ads on both sides won't display.