# Cut String with Chinese by Byte in Java

Published: *2010-03-17 13:06:00*

Category: __Backend__

Summary: In Java development, handling string truncation that contains Chinese characters is a common but error-prone task. This article provides a solution that ensures Chinese characters are not broken by checking the parity of Chinese character bytes, thus achieving precise byte-based string truncation.

---------

There are many discussions online about solutions for truncating strings containing Chinese characters by bytes. Here I present my own approach. The basic principle is still to count whether the number of bytes representing Chinese characters in the bytes to be extracted is even, i.e., whether it exactly includes complete Chinese characters.

## Source Code

```java
/**
 * Programming: Write a function to truncate a string, taking a string and byte count as input, and outputting the byte-truncated string. However, ensure that Chinese characters are not half-truncated. For example, "我ABC" with 4 bytes should be truncated to "我AB", and "我ABC汉DEF" with 6 bytes should output "我ABC" rather than "我ABC+half of 汉".
 * According to the above rules, input "我ABC汉DEF 1" should return an empty string, not "我".
 */
public class CutMultibyte {

 public static String cutMultibyte(String splitStr, int extract) {
  byte[] bytes = splitStr.getBytes();
  //If the number of bytes to extract is not less than the original bytes, return the original string directly. Note that the byte count must use bytes.length, using the string's length() method returns the character count!
  if (extract >= bytes.length) {
   return splitStr;
  }
  else {
   int result = 0;
   int cutLength = 0;
   //Count how many bytes in the bytes to be extracted are negative
   for (int i = 0; i < extract; i++) {
    if (bytes[i] < 0) {
     cutLength++;
    }
   }
   //If the number of negative bytes is even, meaning the bytes to extract contain exactly complete Chinese characters, the extraction byte count remains unchanged; otherwise, if the number of negative bytes is odd, it means incomplete Chinese characters are encountered, and the extraction byte count is reduced by 1.
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

## Implementation Principle

The core idea of this solution is based on the characteristic that Chinese characters in UTF-8 encoding occupy multiple bytes and each byte is negative:

1. Convert the string to a byte array
2. Count the number of negative bytes in the byte range to be extracted
3. If the number of negative bytes is even, it indicates that the extraction range contains complete Chinese characters
4. If the number of negative bytes is odd, it indicates that the extraction range contains incomplete Chinese characters, and one byte needs to be subtracted to ensure character integrity

## Usage

1. Call the `cutMultibyte(String splitStr, int extract)` method
2. Pass in the string to be truncated and the byte count
3. The method will return a byte-truncated string without breaking Chinese characters
