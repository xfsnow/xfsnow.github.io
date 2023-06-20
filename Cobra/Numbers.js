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