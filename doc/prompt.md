# GitHub Copilot
## 使用 GitHub Copilot Chat 解数学题

根据图片中的规律，有理数的加减混合运算：
\[
\frac{3}{17 \times 20} = \frac{1}{17} - \frac{1}{20}
\]

运用以上规律，回答下列问题：

### 第一个计算：
\[
\frac{3}{5 \times 8} + \frac{3}{8 \times 11} + \frac{3}{11 \times 14} + \frac{3}{14 \times 17} + \frac{3}{17 \times 20} + \frac{3}{20 \times 23} + \cdots + \frac{3}{98 \times 101}
\]

应用规律可以将每一项分解：
\[
\frac{3}{n(n+3)} = \frac{1}{n} - \frac{1}{n+3}
\]

所以整个和可以写成：
\[
\left( \frac{1}{5} - \frac{1}{8} \right) + \left( \frac{1}{8} - \frac{1}{11} \right) + \left( \frac{1}{11} - \frac{1}{14} \right) + \left( \frac{1}{14} - \frac{1}{17} \right) + \left( \frac{1}{17} - \frac{1}{20} \right) + \left( \frac{1}{20} - \frac{1}{23} \right) + \cdots + \left( \frac{1}{98} - \frac{1}{101} \right)
\]

从第2项到倒数第2项均相消，最后只剩下：
\[
\frac{1}{5} - \frac{1}{101}
\]

所以第一个计算结果为：
\[
\frac{1}{5} - \frac{1}{101} = \frac{101 - 5}{505} = \frac{96}{505}
\]

### 第二个计算：
\[
\frac{2}{4 \times 9} + \frac{2}{9 \times 14} + \frac{2}{14 \times 19} + \cdots + \frac{2}{79 \times 84}
\]

应用规律可以将每一项分解：
\[
\frac{2}{n(n+5)} = \frac{2}{5} \left( \frac{1}{n} - \frac{1}{n+5} \right)
\]

所以整个和可以写成：
\[
\frac{2}{5} \left( \left( \frac{1}{4} - \frac{1}{9} \right) + \left( \frac{1}{9} - \frac{1}{14} \right) + \left( \frac{1}{14} - \frac{1}{19} \right) + \cdots + \left( \frac{1}{79} - \frac{1}{84} \right) \right)
\]

从第2项到倒数第2项均相消，最后只剩下：
\[
\frac{2}{5} \left( \frac{1}{4} - \frac{1}{84} \right)
\]

所以第二个计算结果为：
\[
\frac{2}{5} \left( \frac{1}{4} - \frac{1}{84} \right) = \frac{2}{5} \times \frac{84 - 4}{336} = \frac{2}{5} \times \frac{80}{336} = \frac{2 \times 80}{5 \times 336} = \frac{160}{1680} = \frac{8}{84} = \frac{4}{42} = \frac{2}{21}
\]

最终结果：
第一个计算结果是：\(\frac{96}{505}\)
第二个计算结果是：\(\frac{2}{21}\)