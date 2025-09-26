# 铅笔题库
一个题库应用系统，主要功能是使用AI拍照解题，尤其是数学题调用AI和 GeoGebra 画出清晰准确的图形，最后把题目分门别类保存起来。
由于 **题库** 的英文叫 **question bank**，取首字母 QB 想到中文名字叫 **铅笔**。

想使用一个前端框架来把现有的 math_question 系统化一下，先选了 Svelte 但是看了半天没看懂。回来用 VUE 再试试。


# 参考
[学习 GeoGebra 经典应用-官方教程] (https://www.geogebra.org/m/cxqnngwx)

[GeoGebra官方手册] (https://geogebra.github.io/docs/manual/en/Predefined_Functions_and_Operators?redirect=zh-CN)

[ggb优化版本](https://kz16.top/ggb/ggbpptReadMe.html)
原来还可以直接把GGB 画图文件嵌入 markdown 以及 HTML ，研究一下，后续可以替代图形图片。


```
A = (1, 2)
B = (3, 4)
f = x^0.2
```

## 测试用提示语

* 支持你的AI模型是什么？
* 画一个直角三角形
* 请为此题画图：在三角形ABC 中,AB 边的垂直平分线交 AB 于点 D,交 BC 于点 E.AC 边的垂直平分线交 AC 于点 M,交 BC 于点 N. 角BAC=96度，求 角EAN度数。
