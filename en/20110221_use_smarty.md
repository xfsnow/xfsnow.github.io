# Using Smarty Template Engine with magic_quotes_gpc Enabled in PHP Environment

Published: *2011-02-21 17:00:00*

Category: __Backend__

Summary: Although it is not recommended to set magic_quotes_gpc to ON, some legacy programs have already depended on this environment configuration and cannot be turned off temporarily. By default, Smarty template parsing requires magic_quotes_gpc to be disabled, otherwise templates cannot be parsed correctly.

---------

## Solution

To solve this issue, you can override the fetch method in your own class that extends the Smarty base class. If the PHP environment has magic_quotes_gpc enabled, temporarily disable this setting, and re-enable it after Smarty's functionality is executed. Of course, if the environment already has it disabled, simply call the parent class's original fetch method.

```php
<?php
class MySmarty extends Smarty
{
    /**
     * My own method overriding default method. To make it work under PHP environment with magic_quotes_gpc ON.
     * We can simply comment out this method if one day PHP environment is changed to magic_quotes_gpc Off.
     * @see Smarty::fetch()
     */
    function fetch($template, $cache_id = null, $compile_id = null, $parent = null, $display = false)
    {
        if (get_magic_quotes_gpc())
        {
            set_magic_quotes_runtime (false);
            $result = parent::fetch($template, $cache_id, $compile_id, $parent, $display);
            set_magic_quotes_runtime (true);
            return $result;
        }
        else
        {
            return parent::fetch($template, $cache_id, $compile_id, $parent, $display);
        }
    }
}
```

Note: There was a logical error in the original code. The line `set_magic_quotes_runtime (true);` would never execute because it was after the `return` statement. I have fixed this issue in the modified code.
