# Firefox 中 display为 block 时 tbody 失去宽度

发布时间: *2010-12-02 18:08:00*

分类: __客户端技术__

---------

## [Firefox 中 display为 block 时 tbody 失去宽度](/cn/article/detail/firefox_lost_width_when_setting_display_of_tbody_to_block/)

分类: [客户端技术](/cn/article/category/client_side_technology/) 2010-12-02 18:08:00 阅读(2739)

用 JavaScript 动态设置一个表格的显示和隐藏，先是直接设置此 table 的 display 为 block，发现整个表格宽度仍维持正常，但各表格行的边框线不能撑满了。下面示例在非 IE 浏览器中可见问题的效果。


    table.displayBlock {
     width: 90%;
     border:2px solid #999;
        display:block;
    }
    table.displayBlock  td{
     border:1px solid #fcc;
    }


    <table border="0" cellpadding="0" cellspacing="0" class="displayBlock">
      <tr>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
      </tr>
      <tr>
        <td>2</td>
        <td>2</td>
        <td>2</td>
        <td>2</td>
      </tr>
      <tr>
        <td>3</td>
        <td>3</td>
        <td>3</td>
        <td>3</td>
      </tr>
    </table>

原因是当 table 的 display 为 block 时，不论是否在 HTML 里显式地写了 tbody 标签，Firefox 解析出的 tbody 都不再和 table 等宽，而是适应表格行的宽度。

### 解决：

要使 tbody 宽度正常，必须设置 display:table。或者更通用的变通是用 JavaScript 控制表格的显示隐藏时不直接调协此 table 的 display 属性，而是给 table 包裹一层 div，然后设置该 div 的display 属性为 block 或 none。

###  更简单的解决：

后来看 John Resig 的《Pro JavaScript Techniques》又学了一招更简单的处理，不用给 table 外包括 div 了，只要在恢复显示时设置 display 属性为空字符串即可。如：


    elem.style.display = '';


---
*原文链接: https://www.snowpeak.fun/cn/article/detail/firefox_lost_width_when_setting_display_of_tbody_to_block/*
