# JavaScript抽奖小程序

发布时间: *2008-02-21 14:37:00*

简介: 任务：公司春节前办联欢会，有抽奖环节，抽奖共有若干轮，每次抽出几人不等，抽中的人不参与后面的抽奖。分析：由于开发用自己的电脑，而在联欢会现场要放在专门接投影仪的机器上，所以要跨平台性；参加联欢会的员工可能经常要调整直到当天才能确认下来，所以还要方便对接员工源数据，最后选择了 JavaScript 这个纯客户端的语言，只要有IE就能运行，而且显示效果可以完全交由CSS去支持，界面

原文链接: [https://snowpeak.blog.csdn.net/article/details/2111398](https://snowpeak.blog.csdn.net/article/details/2111398)

---------

任务：   
公司春节前办联欢会，有抽奖环节，抽奖共有若干轮，每次抽出几人不等，抽中的人不参与后面的抽奖。   
  
分析：   
由于开发用自己的电脑，而在联欢会现场要放在专门接投影仪的机器上，所以要跨平台性；参加联欢会的员工可能经常要调整直到当天才能确认下来，所以还要方便对接员工源数据，最后选择了 JavaScript 这个纯客户端的语言，只要有IE就能运行，而且显示效果可以完全交由CSS去支持，界面也可以做得很美观。   
  
环境：   
IE 6+   
  
思路：   
把员工数据单独存成文本文件，用 IE 的 Scripting.FileSystemObject 来读取；   
员工数据还要显示三项，ID、人名和部门名称，所以文本文件是从 Excel 中另存成跳格键分隔的数据，而用 JavaScript 列成表格输出；   
因为是投影显示，所以全做成了按键盘控制的，捕捉按键事件用 document.onkeypress；   
数组随机排序，JavaScript 有非常方便的现成做法 array.sort(function(){return Math.random()>0.5?-1:1;});   
  
  
  
代码：   
employ.txt   
外部员工数据形如：   
12009 姓名1 部门1   
15971 姓名2 部门2   
7815 姓名3 部门3   
9483 姓名4 部门4   
9507 姓名5 部门5   
10589 姓名6 部门6   
17212 姓名7 部门7   
15487 姓名8 部门8   
14934 姓名9 部门9   
  
程序页   
lottery.htm   
  
  

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf8" />
<title>随机抽奖</title>
<style type="text/css">
   body {
   overflow: hidden;
   background-image: url(bg.jpg);
   background-repeat: no-repeat;
   font-family: Arial, sans-serif;
   }
   h1 {
   margin-top: 130px;
   font-size: 40px;
   color: #FF0000;
   }
   #showlot {
   font-size: 30px;
   font-weight: bold;
   color: #FF0000;
   }
   #showlot td {
   width: 200px;
   }
   </style>
<script type="text/javascript">
</script>
</head>
<body>
<h1 align="center">恭喜发财 好运全来</h1>
<div id="showlot"></div>
<script language="JavaScript" type="text/javascript">
   //查找数组里是否有某元素
   function inArray(arr,key)
   {
   re = new RegExp(key,[""]);
   return (arr.toString().replace(re,"┢").replace(/[^,┢]/g,"")).indexOf("┢");
   }
   //JavaScritp 实现随机抽奖小程序。从外部文本文件读入到数组里，
   //随机排序数组后显示在把用CSS去掉边框的input格里，
   // 用按钮控制启动和停止，每次循环显示到数组结尾都会重新随机排序从头开始继续循环。
   //因为用 setInterval 控制函数，基本全用全局变量了
   var fso, ts, str;
   var arrayUser = new Array();
   //每次抽中的人数记到一个数组里
   var arrayBatch = new Array(10, 10, 10, 10, 10, 10, 10, 10,10, 10, 10, 10, 4, 2, 1, 1, 1, 1, 1, 1, 1);
   var indexBatch = 0;
   var ForReading = 1;
   //需要文本文件物理路径，必须使用双反斜线是因为 JavaScript 里字符串用/作转义字符，必须用//表示/。
   str = 'D://lucky//employ.txt';
   fso = new ActiveXObject("Scripting.FileSystemObject");
   ts = fso.OpenTextFile(str, ForReading);
   var i = 0;
   //把文件内容逐行读到数组里
   while (!ts.AtEndOfStream)
   {
   arrayUser[i++] = ts.ReadLine();
   }
   // 关闭文件
   ts.Close();
   //上来先乱序排一下
   arrayUser.sort(function(){return Math.random()>0.5?-1:1;});
   
   //timer是用来控制循环的指针变量。实际乱序的是数组元素，即每次循环数组都会重排一次从而值对应的键都会重排！而 time 始终是从0到数组长度。
   timer = 0;
   str = "";
   var arrayLine = new Array();
   var arrayNow = new Array();
   function lottery()
   {
   //剩下的数组元素个数不够此批人数时就重头再循环（这会让每次最后剩下的几个人机会稍微少一些），每次重新循环时都重新乱序排一下。需要用 >= 判断
   if (timer >= (arrayUser.length-arrayBatch[indexBatch]) )
   {
   timer = 0;
   //让 sort 的比较函数随机传回-1或1就可以了。如果其它排序方法可以使用其它的比较函数，
   // http: //webuc.net/dotey/archive/2004/12/06/2354.aspx 和 http://blog.iyi.cn/hily/archives/2005/09/javascript.html
   arrayUser.sort(function(){return Math.random()>0.5?-1:1;});
   }
   else
   {
   str="";
   arrayNow = new Array();
   for (i = 0; i < arrayBatch[indexBatch]; i++)
   {
   arrayLine = arrayUser[timer].split("/t");//arrayUser[0][0]是员工号, arrayUser[0][1]是姓名,arrayUser[0][2]是部门
   arrayNow[i] = arrayUser[timer]; //记下当前显示的中奖人
   str+="<tr><td>"+arrayLine[0]+"</td><td>"+arrayLine[1]+"</td><td>"+arrayLine[2]+"</td></tr>";
   timer++;
   }
   str = '<table align="center">'+str+'</table>';
   document.getElementById("showlot").innerHTML = str;
   }
   }
   //数字越大速度越慢
   var speed=50; 
   //把抽中的人记录下来
   var winIndex = 0;
   var arrayWin = new Array();
   document.οnkeypress=function()
   {
   //c 键是99，清空显示；p 键是112，开始；s键是115，停止。
   if (window.event.keyCode == 99)
   {
   //因为是各批人数多少不一，所以要清空现有批次显示，以免前一批人多时后几个人总显示在后面的格里
   for (i = 0; i < 10; i++)
   {
   str= "";
   document.getElementById("showlot").innerHTML ="";
   }
   }
   else if (window.event.keyCode == 112)
   {
   //因为是各批人数多少不一，所以要清空现有批次显示，以免前一批人多时后几个人总显示在后面的格里
   for (i = 0; i < 10; i++)
   {
   str= "";
   document.getElementById("showlot").innerHTML ="";
   }
   MyMar=setInterval(lottery, speed);
   }
   else if (window.event.keyCode == 115)
   {
   //先停止运行
   clearInterval(MyMar);
   //把当前抽中的人记入到总体获奖人数组中。
   //其实可以简化成每次停止时从全体用户数组中删除当前中奖的人，
   //但现在还记录到总体获奖人数组，是方便以后可以扩展成最后再显示出所有中奖的人。
   for (i = 0; i < arrayBatch[indexBatch]; i++)
   {
   arrayWin[winIndex] = arrayNow[i];
   winIndex++;
   }
   // JavaScript 没有现成的去掉数组元素的函数，由于每次都乱序排列数组，所以数组键是没准的，所以干脆自己用值判断循环一下就把抽出的那人的值去掉了。
   //循环一次，遇到抽中的人的值时就跳过，其余的记录下来。
   var j = 0;
   var arrayNextpool = new Array();
   for (i=0; i< arrayUser.length; i++)
   {
   //从总名单中去除已获奖人
   if (inArray(arrayWin, arrayUser[i]) >= 0)
   {
   continue;
   }
   else
   arrayNextpool[j++] = arrayUser[i];
   }
   arrayUser = arrayNextpool;
   indexBatch++;//进到下一批次
   timer = 0; //停止后就准备重新开始循环
   }
   }
   </script>
</body>
</html>
```