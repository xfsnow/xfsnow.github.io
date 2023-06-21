// 写一个函数，把阿拉伯数字转换成大写中文数字，中文使用繁体字，比如 
// 123456 转换成 壹拾贰万叁仟肆佰伍拾陆 
// 7890123 转换成 柒佰捌拾玖万零壹佰贰拾叁
// 1234567890123 转换成 壹仟贰佰叁拾肆亿伍仟陆佰柒拾捌万玖仟零壹佰贰拾叁
const numToChinese = function(num) {
    let str = num.toString();
    let len = str.length;
    let result = '';
    let numArr = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    let unitArr = ['','拾','佰','仟','万','拾','佰','仟','亿','拾','佰','仟','万'];
    for(let i = 0; i < len; i++) {
        result += numArr[parseInt(str[i])] + unitArr[len - i - 1];
    }
    return result;
}

/* 创建一个字典，包含北京各月的天气信息*/
// var beijing_weather = [
//     { month: 'January', high: 5, low: -15},

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