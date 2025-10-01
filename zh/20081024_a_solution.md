# PHP 中 `syntax error, unexpected $end` 错误的一种原因及解决

发布时间: *2008-10-24 17:35:00*

分类: __后端技术__

---------

当 PHP 遇到 `syntax error, unexpected $end` 错误时，排查思路如下：

1. 检查文件中 PHP 的开始标记 `<?php` 和结束标记 `?>` 是否配对。
2. 额外注意注释中是否出现过 `?>`。

错误示例：

```plaintext
Parse error: syntax error, unexpected $end in script.php on line xx
```

调试后发现，错误的行位于文件中间某行：

```php
//$str .= "?>\n";
```

## 问题分析

PHP 解释器允许在结束标记前使用单行注释。例如：

```php
//$str .= "?>\n";
```

被解释为：

- 结束标记前有注释，注释的内容是 `//$str .= "`。
- 而 `?>` 后面的 `\n";` 会被解释为 PHP 块外的内容，并按 HTML 输出。

结果是，给 `$str .= "?>\n";` 这行添加 `//` 成注释后，反而多了一个 `?>` 的结束标记，导致原来的真正结束标记变成了意料之外的（`unexpected`）。

## 解决办法

- 直接删除问题行：

```php
//$str .= "?>\n";
```

- 遵循良好的编码习惯：
  - PHP 开始和结束标记所在行不要写其他内容。

- 修改 `php.ini` 配置：
  - 设置 `short_open_tag = On`。