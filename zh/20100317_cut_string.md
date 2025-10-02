# Java 按字节截取带有汉字的字符串的一种做法

发布时间: *2010-03-17 13:06:00*

分类: __后端技术__

简介: 在Java开发中，处理包含中文字符的字符串截取是一个常见但容易出错的问题。本文提供了一种解决方案，通过判断字节数中汉字字节的奇偶性来确保汉字不会被截断，从而实现按字节精确截取字符串的功能。

---------

Java 按字节截取带有汉字的字符串的解法，网上有不少讨论。这里我也给出一种我自己的处理，基本原理还是统计要截取的字节数中是表示汉字的字节数是否是偶数个，即是否刚好包括了完整的汉字。

## 源码

```java
/**
 * 编程：编写一个截取字符串的函数，输入为一个字符串和字节数，输出为按字节截取的字符串。 但是要保证汉字不被截半个，如"我ABC"4，应该截为"我AB"，输入"我ABC汉DEF"，6，应该输出为"我ABC"而不是"我ABC+汉的半个"。
 * 按上述规则，输入"我ABC汉DEF 1"，应返回空字符串，而不是"我"。
 */
public class CutMultibyte {

 public static String cutMultibyte(String splitStr, int extract) {
  byte[] bytes = splitStr.getBytes();
  //截取字节数不小于原始字节数时直接返回原字符串。注意字节数一定要用 bytes.length，用字符串的 length() 方法返回的是字符数！
  if (extract >= bytes.length) {
   return splitStr;
  }
  else {
   int result = 0;
   int cutLength = 0;
   //统计出在要截取的字节中有几个字节是负数
   for (int i = 0; i < extract; i++) {
    if (bytes[i] < 0) {
     cutLength++;
    }
   }
   //若负数字节数是偶数，即要截取的字节数中遇到刚好是若干完整的汉字，则截取字节数不变；否则负数字节数是奇数，表示遇到的不是完整汉字，截取字节数减 1。
   if (cutLength % 2 == 0) {
    result = extract;
   }
   else {
    result = extract - 1;
   }
   String substrx = new String(bytes, 0, result);
   return substrx;
  }
 }


 public static void main(String args[]) {
  String str = args[0];
  int num = Integer.valueOf(args[1]);
  str = cutMultibyte(str, num);
  System.out.println(str);
 }
}
```

## 实现原理

这个解决方案的核心思想是基于汉字在UTF-8编码中占用多个字节且每个字节都是负数的特点：

1. 将字符串转换为字节数组
2. 统计要截取的字节范围内负数字节的个数
3. 如果负数字节数为偶数，则表示截取范围内包含完整的汉字
4. 如果负数字节数为奇数，则表示截取范围内包含不完整的汉字，需要减去一个字节以确保汉字完整性

## 使用方法

1. 调用 `cutMultibyte(String splitStr, int extract)` 方法
2. 传入需要截取的字符串和字节数
3. 方法会返回按字节截取且不截断汉字的字符串

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/cut_string_with_chinese_by_byte_in_java/*