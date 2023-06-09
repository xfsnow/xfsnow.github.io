// 写一个函数，把阿拉伯数字转换成大写中文数字，中文使用繁体字，比如 
// 123456 转换成 壹拾贰万叁仟肆佰伍拾陆 
// 7890123 转换成 柒佰捌拾玖万零壹佰贰拾叁
// 1234567890123 转换成 壹仟贰佰叁拾肆亿伍仟陆佰柒拾捌万玖仟零壹佰贰拾叁
const numToChinese = function(num) {
    const numArr = num.toString().split('').reverse();
    const unit = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
    const numMap = {
        0: '零',
        1: '壹',
        2: '贰',
        3: '叁',
        4: '肆',
        5: '伍',
        6: '陆',
        7: '柒',
        8: '捌',
        9: '玖',
    };
    let result = '';
    numArr.forEach((item, index) => {
        result = numMap[item] + unit[index] + result;
    });
    return result;
    }