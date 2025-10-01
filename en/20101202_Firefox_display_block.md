# Firefox tbody Loses Width When Display is Set to Block

Published: *2010-12-02 18:08:00*

Category: __Frontend__

Summary: When using JavaScript to dynamically show and hide a table, initially setting the table's display property to block caused the entire table width to remain normal, but the borders of each table row could not be fully stretched. This article investigates the cause of this issue and provides some simple solutions.

---

## Problem Description

When using JavaScript to dynamically show and hide a table, initially setting the table's display property to block caused the entire table width to remain normal, but the borders of each table row could not be fully stretched. The example below shows the issue in non-IE browsers.

```css
table.displayBlock { 
  width: 90%; 
  border:2px solid #999; 
  display:block; 
}

table.displayBlock td{ 
  border:1px solid #fcc; 
}
```

```html
<table border="0" cellpadding="0" cellspacing="0" class="displayBlock"> 
  <tr> 
    <td>1</td> 
    <td>1</td> 
    <td>1</td> 
    <td>1</td> 
  </tr> 
  <tr> 
    <td>2</td> 
    <td>2</td> 
    <td>2</td> 
    <td>2</td> 
  </tr> 
  <tr> 
    <td>3</td> 
    <td>3</td> 
    <td>3</td> 
    <td>3</td> 
  </tr> 
</table>
```

## Root Cause

When a table's display property is set to block, regardless of whether the tbody tag is explicitly written in the HTML, Firefox parses the tbody to no longer be the same width as the table, but instead adapts to the width of the table rows.

## Solutions

### Solution 1: Set display:table

To make the tbody width normal, you must set display:table. A more universal workaround is to not directly set the table's display property when using JavaScript to control the table's visibility, but instead wrap the table with a div and set the div's display property to block or none.

### Solution 2: Set display to Empty String

Later, while reading John Resig's "Pro JavaScript Techniques", I learned an even simpler approach - there's no need to wrap the table with a div. Just set the display property to an empty string when restoring visibility, like this:

```javascript
elem.style.display = '';
```

The principle is that when set to an empty string, the element will typically revert to its original display property value, eliminating the need to manually distinguish between table and block.