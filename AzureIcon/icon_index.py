"""把 Azure Icon 的 SVG 图标文件生成一个总体展示的静态页面。
图标文件包下载自 https://docs.microsoft.com/en-us/azure/architecture/icons/
把下载的压缩包解压，然后运行这个脚本即可生成一个静态页面。
"""
import os


def findAllFile(base):
    for root, ds, fs in os.walk(base):
        for f in fs:
            fullname = os.path.join(root, f)
            yield fullname


def main():
    basePath = './AzureIcon'
    output = """<!DOCTYPE html>
<html lang="zh-cn">
<head>
<meta charset="utf-8" />
<link href='azureicon.css' rel='stylesheet' type='text/css'/>
<title>Azure Icon SVG</title>
</head>
<body>
<h1>Azure Icon Index / Azure  图标展示页</h1>
<p>Azure 的图标可以从微软官网下载 <a href="https://docs.microsoft.com/en-us/azure/architecture/icons/"  target="_blank">https://docs.microsoft.com/en-us/azure/architecture/icons/</a>。但是这里下载的是个压缩包，解压后都是SVG文件，预览和查找都不太方便。
   我使用这个简单的 <a href="https://github.com/xfsnow/xfsnow.github.io/blob/master/AzureIcon/icon_index.py" target="_blank">Python 脚本</a>，遍历这些子目录和文件，生成一个静态 HTML 文件，就可以简单明了地展示和用服务名称查找了。</p>
<p>The Azure icon can be downloaded for <a href="https://docs.microsoft.com/en-us/azure/architecture/icons/"  target="_blank">https://docs.microsoft.com/en-us/azure/architecture/icons/</a> from Microsoft's website.
However the file downloaded here is a compression package which contains a large number of SVG files. It is not very convenient to preview and search so many SVG files.
This simple Python script goes through the subdirectories and files to generate a static HTML file that include all the SVG images. We can simply preview all the icon images and search icon by service names. </p>
<ul class="icons">
"""
    fileAll = findAllFile(basePath)
    for i in fileAll:
        i = i.replace('\\', '/')
        i = i.replace(' ', '%20')
        i = i.replace('+', '%2B')
        i = i.replace(basePath+'/', '')
        item = i.split('/')
        if (i.find('.svg') > 1):
            itemSrc = item[1]
            fileName = item[1].replace('.svg', '')
            fileName = fileName.replace('-', ' ')
            fileName = fileName.replace('icon service', ' ')
            output += '<li><embed src="' + i + \
                '" width="80" height="80" type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/" /><br />' + \
                fileName+'</li> '
    output += '</ul></body></html>'
    with open(basePath + '/index.html', 'w', encoding='utf-8') as f:
        f.write(output)
    f.close


if __name__ == '__main__':
    main()
