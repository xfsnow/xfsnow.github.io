### 独立公式块写法
$$
\boxed{
\begin{cases}
A(x_a, y_a) \\
B(x_b, y_b) \\
C(x_c, y_c)
\end{cases}
}
$$

$$ S_{\triangle ABC} = \frac{1}{2} \times 底 \times 高 $$

<!-- 三角形ABC -->
<polygon points="0,0 4,0 1,3" fill="#d3e5ff" stroke="#0066cc" stroke-width="0.05"/>

<!-- 坐标点标注（含下标） -->
<g transform="scale(1,-1)">
  <text x="0" y="-0.2">
    <tspan>A(</tspan>
    <tspan>x<tspan baseline-shift="sub" font-size="70%">a</tspan>,</tspan>
    <tspan>y<tspan baseline-shink="sub" font-size="70%">a</tspan>)</tspan>
  </text>
  <text x="4" y="0.3">
    <tspan>B(</tspan>
    <tspan>x<tspan baseline-shift="sub" font-size="70%">b</tspan>,</tspan>
    <tspan>y<tspan baseline-shift="sub" font-size="70%">b</tspan>)</tspan>
  </text>
  <text x="1.1" y="-3.1">
    <tspan>C(</tspan>
    <tspan>x<tspan baseline-shift="sub" font-size="70%">c</tspan>,</tspan>
    <tspan>y<tspan baseline-shift="sub" font-size="70%">c</tspan>)</tspan>
  </text>
</g>

<!-- 行列式公式推导 -->
<g transform="translate(2, -2) scale(1,-1)">
  <text class="formula" x="0" y="0">
    <tspan x="0" dy="1.2em">面积公式推导：</tspan>
    <tspan x="0" dy="1.2em">S = ½ | (x<tspan baseline-shift="sub">b</tspan> - x<tspan baseline-shift="sub">a</tspan>)(y<tspan baseline-shift="sub">c</tspan> - y<tspan baseline-shift="sub">a</tspan>)</tspan>
    <tspan x="0" dy="1.2em">    - (x<tspan baseline-shift="sub">c</tspan> - x<tspan baseline-shift="sub">a</tspan>)(y<tspan baseline-shift="sub">b</tspan> - y<tspan baseline-shift="sub">a</tspan>) |</tspan>
    <tspan x="0" dy="1.2em">展开行列式可得：</tspan>
    <tspan x="0" dy="1.2em">S = ½ |x<tspan baseline-shift="sub">a</tspan>y<tspan baseline-shift="sub">b</tspan> + x<tspan baseline-shift="sub">b</tspan>y<tspan baseline-shift="sub">c</tspan> + x<tspan baseline-shift="sub">c</tspan>y<tspan baseline-shift="sub">a</tspan></tspan>
    <tspan x="0" dy="1.2em">    - x<tspan baseline-shift="sub">b</tspan>y<tspan baseline-shift="sub">a</tspan> - x<tspan baseline-shift="sub">c</tspan>y<tspan baseline-shift="sub">b</tspan> - x<tspan baseline-shift="sub">a</tspan>y<tspan baseline-shift="sub">c</tspan>|</tspan>
  </text>
</g>