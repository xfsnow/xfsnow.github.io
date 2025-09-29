# xfsnow.github.io
This is Snowpeak's WIKI website on GitHub.
Miscellaneous technical contents and codes are also stored here.

这是 snowpeak 的 WIKI 网站，存放在 GitHub 上。
各种技术内容和代码也存放在这里。

## Word 文件转换成引用图片的 markdown 文件
安装 Pandoc，然后
```bash
pandoc Azure_DevOps_Pipeline_Combine_Repos_Cn_1.docx --extract-media=../assets/img/ -o Azure_DevOps_Pipeline_Combine_Repos_1.md
```

## 清理优化 CSS 和 JS
简单学习了一下，目前选择轻量级的 Gulp，对 CSS 和 JS 进行优化。配置文件放在项目根目录的  [gulpfile.js](gulpfile.js) 中。当然要安装 Node.js，以及配合 [package.json](package.json) 文件的依赖。

运行命令：
```bash
gulp
```
就可以了。在 Windows 下运行这个命令有可能遇到报错:
```
gulp : 无法加载文件 C:\Users\user\AppData\Roaming\npm\gulp.ps1，因为在此系统上禁止运行脚本。有关详
细信息，请参阅 https:/go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。        
所在位置 行:1 字符: 1
+ gulp
+ ~~~~
    + CategoryInfo          : SecurityError: (:) []，PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```    
这个错误是由于 Windows 系统的 PowerShell 执行策略限制导致的（默认禁止运行脚本文件）。解决方法如下：


### 步骤1：以管理员身份打开 PowerShell
1. 在 Windows 搜索栏输入 `PowerShell`
2. 右键点击「Windows PowerShell」，选择「以管理员身份运行」

### 步骤2：查看当前执行策略
在管理员 PowerShell 中执行：
```powershell
Get-ExecutionPolicy
```
通常默认会显示 `Restricted`（严格限制，禁止运行任何脚本）。

### 步骤3：修改执行策略
执行以下命令，将策略修改为 `RemoteSigned`（允许运行本地脚本，远程脚本需要签名）：
```powershell
Set-ExecutionPolicy RemoteSigned
```
此时会提示确认，输入 `Y` 并回车（Yes）。

### 步骤4：验证修改是否生效
再次执行：
```powershell
Get-ExecutionPolicy
```
如果显示 `RemoteSigned`，说明修改成功。

### 步骤5：重新运行 Gulp 命令
关闭之前的终端，重新打开一个普通终端（无需管理员），进入项目目录后执行：
```bash
gulp
```
此时应该可以正常运行了。

最后会把我的CSS文件压缩生成 style.min.css，体积压缩到原来的 70%，JS文件生成 blog.min.js，体积压缩到原来 50%。

TODO
- [x] 整理文章结构，区分出 en 和 zh 2大目录，分别放置英文和中文文章。
- [x] 所有文章原文放在 doc 目录下，原文统一使用 markdown 格式，前缀加yyyy-mm-dd 的日期，后续加 .en 或 .zh 后缀。
- [x] 所有图片统一放在 assets 目录下，这样从 doc 目录引用图片时和从 en、zh 目录引用图片都是一样的相对路径。
- [x] 从源文档的 markdown 渲染成 HTML 时源代码部分要解析成 `<pre><code>` 的形式，以便于后续对接 highlightjs 用来分色显示 。
- [x] HTML 模板文件也放在 doc 目录下。
- [x] article_index.js 里给每片文章再加上文章的日期
- [x] 导航链接增加接分类的列表和按日期的列表，以及没有任何筛选的全部文章列表，这些列表都可以通过 article_index.js 实现。
- [x] 把 CSDN 博客、微信公众号等各处的文章统一抓取回来，原文件保存成 markdown 格式，放在 doc 目录下。
- [x] 再用HTML模板重新生成文章详情页，以及重新生成 article_index.js 文章索引数据。
- [x] /doc 目录下的 word 文件已经生成 /zh 下的 markdown 了，还要再校对和细化。然后再生成到 /en 目录下去。
- [ ] /doc 目录下的 markdown 文件逐个确认统一整理到 /zh，再生成到 /en 去。