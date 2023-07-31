// 写一个函数，把阿拉伯数字转换成大写中文数字，中文使用繁体字，比如 
// 123456 转换成 壹拾贰万叁仟肆佰伍拾陆 
// 7890123 转换成 柒佰捌拾玖万零壹佰贰拾叁
// 1234567890123 转换成 壹仟贰佰叁拾肆亿伍仟陆佰柒拾捌万玖仟零壹佰贰拾叁

/* 创建一个字典，包含北京各月的天气信息*/
// var beijing_weather = [


/* 创建一个字典，包含布宜诺斯艾利斯各月的天气信息*/

    
// 将以下组件重写为 React 组件
var input = document.createElement('input');
input.setAttribute('type', 'text');
document.body.appendChild(input);
var button = document.createElement('button');
button.innerHTML = 'Say Hello';
document.body.appendChild(button);
button.onclick = function() {
  var name = input.value;
  var hello = document.createElement('div');
  hello.innerHTML = 'Hello ' + name;
  document.body.appendChild(hello);
};
// React 版本: