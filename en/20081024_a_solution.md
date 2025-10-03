# A Solution to `syntax error, unexpected $end` in PHP

Published: *2008-10-24 17:35:00*

Category: __Backend__

Summary: This article describes a solution to the PHP error `syntax error, unexpected $end`.

---------

When PHP encounters the error `syntax error, unexpected $end`, the debugging steps are as follows:

1. Check whether the PHP opening tag `<?php` and closing tag `?>` are properly paired in the file.
2. Pay extra attention to whether `?>` appears within comments.

Error example:

```plaintext
Parse error: syntax error, unexpected $end in script.php on line xx
```

After debugging, it was found that the error occurred in the middle of the file on the following line:

```php
//$str .= "?>\n";
```

## Problem Analysis

The PHP interpreter allows single-line comments before the closing tag. For example:

```php
//$str .= "?>\n";
```

This is interpreted as:

- A comment before the closing tag, with the content `//$str .= ".
- The `?>` and the subsequent `\n";` are interpreted as content outside the PHP block and output as HTML.

As a result, adding `//` to `$str .= "?>\n";` to make it a comment inadvertently introduces an extra `?>` closing tag, causing the original valid closing tag to become unexpected (`unexpected`).

## Solution

- Directly delete the problematic line:

```php
//$str .= "?>\n";
```

- Follow good coding practices:
  - Do not write other content on the same line as PHP opening and closing tags.

- Modify the `php.ini` configuration:
  - Set `short_open_tag = On`.