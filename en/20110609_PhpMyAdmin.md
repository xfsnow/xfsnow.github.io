# A Solution to PhpMyAdmin Cannot Export Data

Published: *2011-06-09 14:06:00*

Category: __Backend Technology__

Summary: When PhpMyAdmin cannot export data, it can be resolved this way.

---------

Recently I encountered an issue where PhpMyAdmin could not export data. After clicking export, there was either a request failure or a blank page. After refreshing, it reported an error:
```
export.php: Missing parameter: what (FAQ 2.8)
export.php: Missing parameter: export_type (FAQ 2.8)
```

According to online resources, it was finally determined that the php.ini settings needed to be adjusted.

My original setting was `post_max_size = 8M`, and increasing it to `post_max_size = 20M` fixed the issue.

I haven't deeply examined the PhpMyAdmin source code, but I estimate that there are dependencies on the aforementioned PHP environment values in the program, and this value needs to be relatively large for proper operation.


---
*Original Link: https://www.snowpeak.fun/cn/article/detail/a_solution_to_phpmyadmin_cannot_export_data/*