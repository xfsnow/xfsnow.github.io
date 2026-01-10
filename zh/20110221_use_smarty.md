# 在开启 magic_quotes_gpc 的 PHP 环境下使用 Smarty 模板引擎

发布时间: *2011-02-21 17:00:00*

分类: __后端技术__

简介: 尽管不建议设置 magic_quotes_gpc 为 ON，但有些早期的程序已经依赖此环境配置，一时不能关闭它，而默认情况下 Smarty 模板的解析功能又要求必须关闭 magic_quotes_gpc，否则不能正常解析模板文件。

---------

## 解决方案

要解决此问题，可以在扩展 Smarty 基类的自己的类里覆盖一下 fetch 方法，如果 PHP 环境是开启 magic_quotes_gpc 的，就临时把此配置关闭一下，待 Smarty 的功能执行完毕再重新打开。那当然如果环境就是关闭的，则原样调用父类本来的 fetch 方法。

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
            set_magic_quotes_runtime(false);
            $result = parent::fetch($template, $cache_id, $compile_id, $parent, $display);
            set_magic_quotes_runtime(true);
            return $result;
        }
        else
        {
            return parent::fetch($template, $cache_id, $compile_id, $parent, $display);
        }
    }
}
```

注意：原代码中存在一个逻辑错误。`set_magic_quotes_runtime (true); `这一行永远不会执行，因为它位于 `return` 语句之后。我在修改后的代码中修复了这个问题。