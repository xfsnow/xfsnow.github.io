# JavaScript URL Parameter Parsing - Improved Version

Published: *2008-10-24 17:41:00*

Category: __Frontend__

Summary: The previous version of the JavaScript URL parser avoided using loops but relied heavily on regular expressions for replacements. While this approach might not necessarily improve performance compared to loops, it made the code overly complex. This time, we attempt a more concise method that avoids both loops and regular expressions.

---------

The previous version of the JavaScript URL parser avoided using loops but relied heavily on regular expressions for replacements. While this approach might not necessarily improve performance compared to loops, it made the code overly complex. Here's an example learned from the book *JavaScript: The Definitive Guide*:

```javascript
/* A simpler method for extracting URL parameters introduced in *JavaScript: The Definitive Guide*. It avoids regular expressions and uses a single loop. The advantage of returning an object is that you only need to call this function once, and all parameters and their values are stored in an object. You can then access any parameter's value without calling the function again.
 * Usage:
 * var args = getArgs(); // Parse parameters from the URL
 * var q = args.q || ""; // Use the parameter value if defined, otherwise assign a default value
 * var n = args.n ? parseInt(args.n) : 10;
 */
var getArgs = function () {
    var args = new Object(); // Declare an empty object
    var query = window.location.search.substring(1); // Extract the query string, e.g., "a1=v1&a2=&a3=v3" from "http://www.snowpeak.org/testjs.htm?a1=v1&a2=&a3=v3#anchor".
    var pairs = query.split("&"); // Split into an array by "&"
    for (var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('='); // Find the "name=value" pair
        if (pos == -1) continue; // Skip if not a valid pair
        var argname = pairs[i].substring(0, pos); // Extract parameter name
        var value = pairs[i].substring(pos + 1); // Extract parameter value
        value = decodeURIComponent(value); // Decode if necessary
        args[argname] = value; // Store as an object property
    }
    return args; // Return the object
}
```

The standout advantage of this method is that the program only needs to execute once to extract all parameters. Subsequent accesses to parameter values do not require re-execution. Parsing URL parameters this way is simpler, more convenient, and easier to understand. Below is the "no loop" but "overly complex" version I previously published:

```javascript
// Extract parameter values from a URL using pure regular expressions without loops. The core technique is the replace() method of strings, which can use a function as the second argument to replace matches according to user-defined rules.
// If the parameter name exists but has no value, return an empty string; if the parameter name does not exist, return undefined.
var getArg = function (argname) {
    var str = location.href;
    var submatch;
    // Extract the query string between "?" and "#", e.g., "a1=v1&a2=&a3=v3" from "http://www.snowpeak.org/testjs.htm?a1=v1&a2=&a3=v3#anchor".
    if (submatch = str.match(/\?([^#]*)#?/)) {
        var argstr = '&' + submatch[1]; // Add "&" to the front for easier replacement
        var returnPattern = function (str) {
            return str.replace(/&([^=]+)=([^&]*)/, '$1:"$2",'); // Replace "&name=value" with "name:"value",".
        }
        argstr = argstr.replace(/&([^=]+)=([^&]*)/g, returnPattern); // Perform global replacement
        eval('var retvalue = {' + argstr.substr(0, argstr.length - 1) + '};'); // Declare an object, e.g., "var retvalue = {a1:"v1",a2:"",a3:"v3"};"
        return retvalue[argname]; // Return the value of the specified parameter
    }
}

// Test
document.write('a1=' + getArg('a1') + ', a2=' + getArg('a2') + ', a3=' + getArg('a3'));
```

Original Link: [https://snowpeak.blog.csdn.net/article/details/3137375](https://snowpeak.blog.csdn.net/article/details/3137375)