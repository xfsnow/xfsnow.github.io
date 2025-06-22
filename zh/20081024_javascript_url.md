# JavaScript 读 URL 参数改进版

发布时间: *2008-10-24 17:41:00*

简介: 此前发表的那一版确实能不用循环，但是总用正则表达式的替换，不一定比用循环提高性能，而且把程序搞得有些太复杂了。从《JavaScript权威指南》上学到的范例如下，/* 《JavaScript权威指南》介绍的更简洁的取 URL 参数的方法，不用正则表达式，用一次循环。一次性返回一个对象的好处是只需要调用一次此函数，参数和值对可以存在一个对象里，以后再取其它参数的值就不用再调用此函数了，只要取对象

原文链接: [https://snowpeak.blog.csdn.net/article/details/3137375](https://snowpeak.blog.csdn.net/article/details/3137375)

---------

此前发表的那一版确实能不用循环，但是总用正则表达式的替换，不一定比用循环提高性能，而且把程序搞得有些太复杂了。从《JavaScript权威指南》上学到的范例如下，


```
/* 《JavaScript权威指南》介绍的更简洁的取 URL 参数的方法，不用正则表达式，用一次循环。一次性返回一个对象的好处是只需要调用一次此函数，参数和值对可以存在一个对象里，以后再取其它参数的值就不用再调用此函数了，只要取对象的属性就行了。
 * 用法：
 * var args = getArgs( );  // 从 URL 解析出参数
 * var q = args.q || "";  // 如果定义了某参数，则使用其值，否则给它一个默认值
 * var n = args.n ? parseInt(args.n) : 10;
 */
var getArgs = function ()
{
    var args = new Object( );  //声明一个空对象
    var query = window.location.search.substring(1);     // 取查询字符串，如从 http://www.snowpeak.org/testjs.htm?a1=v1&a2=&a3=v3#anchor 中截出 a1=v1&a2=&a3=v3。
    var pairs = query.split("&");                 // 以 & 符分开成数组
    for(var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');          // 查找 "name=value" 对
        if (pos == -1) continue;                  // 若不成对，则跳出循环继续下一对
        var argname = pairs[i].substring(0,pos);  // 取参数名
        var value = pairs[i].substring(pos+1);    // 取参数值
        value = decodeURIComponent(value);        // 若需要，则解码
        args[argname] = value;                    // 存成对象的一个属性
    }
    return args;                                  // 返回此对象
}
```

它的突出优点就是程序只用执行一次提取操作，以后再重复取参数值，都不用再执行程序了。取 URL 参数还是这样比较简便易行，又好理解。下面是我此前发表的“不用循环”但“有些太复杂”的版本：


```
//不用循环纯用正则实现从 URL 中取参数的值。取代循环的核心技术是字符串的 replace() 方法可以用函数作第二参数，按用户定义的方式去替换。
//若有此参数名但无值，则返回空字符串；若无此参数名，返回 undefined。
var getArg = function(argname)
{
 var str = location.href;
 var submatch;
 //先从 URL 中取出问号和井口与之间的查询字符串，如从 http://www.snowpeak.org/testjs.htm?a1=v1&a2=&a3=v3#anchor 中截出 a1=v1&a2=&a3=v3。
 //问号是模式的特殊字符，所以要写成 /?；井号可有可无，所以模式结尾是 #?
 if (submatch = str.match(//?([^#]*)#?/))
 {
  //取到捕捉的子匹配形如 a1=v1&a2=&a3=v3，在前面加个 & 做成规则的 &a1=v1&a2=&a3=v3 便于下一步替换
  var argstr = '&'+submatch[1];
  //做个替换用的函数，把找到的每组形如 &a1=v1 替换成 a1:"v1", 这样的对象定义用的属性声明
  var returnPattern = function(str)
  {
   //$1 和 $2 代表捕捉到的第1个和第2个子匹配，必须用在字符串里
   return str.replace(/&([^=]+)=([^&]*)/, '$1:"$2",');
  }
  //执行一个全局的正则替换，第二参数就是刚才定义的替换函数，把 a1=v1&a2=&a3=v3 替换成 a1:"v1",a2:"",a3:"v3",
  argstr = argstr.replace(/&([^=]+)=([^&]*)/g, returnPattern);
  //最后再执行一个对象的声明，需要形如 var retvalue = {a1:"v1",a2:"",a3:"v3"}; 的对象声明，而刚才替换完的字符串结尾还有个逗号，把结尾的逗号用 substr 截掉即可
  eval('var retvalue = {'+argstr.substr(0, argstr.length-1)+'};');
  //现在就得到了一个对象，URL 中每个参数名是其属性名，参数值是对应的属性值
  return retvalue[argname];
 }
}

//测试
document.write('a1='+getArg('a1')+', a2='+getArg('a2')+', a3='+getArg('a3'));
```