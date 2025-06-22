# xfsnow.github.io
This is Snowpeak's WIKI website on GitHub.
Miscellaneous technical contents and codes are also stored here.

这是 snowpeak 的 WIKI 网站，存放在 GitHub 上。
各种技术内容和代码也存放在这里。


TODO
- [ ] 整理文章结构，区分出 en 和 zh 2大目录，分别放置英文和中文文章。
- [ ] 所有文章原文放在 doc 目录下，原文统一使用 markdown 格式，前缀加yyyy-mm-dd 的日期，后续加 .en 或 .zh 后缀。
- [ ] 所有图片统一放在 assets 目录下，这样从 doc 目录引用图片时和从 en、zh 目录引用图片都是一样的相对路径。
- [ ] 从源文档的 markdown 渲染成 HTML 时源代码部分要解析成 `<pre><code>` 的形式，以便于后续对接 highlightjs 用来分色显示 。
- [ ] HTML 模板文件也放在 doc 目录下。
- [ ] article_index.js 里给每片文章再加上文章的日期
- [ ] 导航链接增加接分类的列表和按日期的列表，以及没有任何筛选的全部文章列表，这些列表都可以通过 article_index.js 实现。
- [ ] 把 CSDN 博客、微信公众号等各处的文章统一抓取回来，原文件保存成 markdown 格式，放在 doc 目录下。
- [ ] 再用HTML模板重新生成文章详情页，以及重新生成 article_index.js 文章索引数据。