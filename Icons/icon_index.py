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
    base = './Icons'
    output = """<!DOCTYPE html>
<html lang="zh-cn">
<head>
<meta charset="utf-8" />
<title>Azure Icon SVG</title>
</head>
<body>
<h1>Azure Icon SVG</h1><ul>
"""
    fileAll = findAllFile(base)
    for i in fileAll:
        i = i.replace('\\', '/')
        i = i.replace(' ', '%20')
        i = i.replace('+', '%2B')
        item = i.split('/')
        if (item[2].find('.py') < 0):
            # print(item[2].find('.py'))
            output += '<li><embed src="'+i + \
                '" width="80" height="80" type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/" /><br />' + \
                item[3].replace('-', ' ')+'</li> '

    output += '</ul></body></html>'
    with open('./azure_icon.html', 'w') as f:
        f.write(output)
    f.close


if __name__ == '__main__':
    main()
