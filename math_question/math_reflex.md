# 中考数学条件反射手册·例题图解版（整合重排版）

## ★模块一：几何

### 1. 全等三角形

**看见边等角等，就想到找全等**

1. 已知两角，就找边（任意一边）
2. 已知一角一邻边，可找一角（任意一角）或另一邻边
3. 已知一角一对边，可找一角（任意一角）或一直角边
4. 已知两边，可找边或夹角
5. 缺条件时找隐藏：对顶角、公共边、公共角

**解题通法：找等角的途径**
1. 公共角相等；
2. 对顶角相等；
3. 等角加（或减）等角，其和（或差）仍相等；
4. 同角或等角的余（补）角相等；
5. 由角平分线的定义得到角相等；
6. 由垂直的定义得到直角相等；
7. 由平行线的性质得到同位角或内错角相等.
8. 构造全等三角形，对应角相等。
9. 直角三角形的两个锐角中只要有一组锐角相等，另一组余角也相等。
10. 另外，一些自然规律如“太阳光线可以看成是平行的”，“光的反射角等于入射角”等也是常见的隐含条件。

**解题通法：找等边的途径**

常见的隐含的相等的边有：
1. 公共边相等；
2. 等边加（或减）等边，其和（或差）仍相等；
3. 由中线的定义得出线段相等
4. 角平分线上的点到角的两端距离相等
5. 等腰三角形：等角对等边
6. 等边三角形：三边相等
7. 直角三角形：斜边中线等于斜边的一半，30度角所对的
8. 勾股定理，算出第三边，发现相等。
9. 垂直平分线上的点到线段两端的距离相等
10. 构造全等三角形，对应边相等、对应高、角平分线、中线相等。


#### 1.1 已知两角找边的例题
**题目**：如图，在\(\triangle ABC\)和\(\triangle DEF\)中，\(\angle A = \angle D\)，\(\angle B=\angle E\)，\(AB = DE\)，求证\(\triangle ABC\cong\triangle DEF\)。
**分析**：已知两角\(\angle A = \angle D\)，\(\angle B=\angle E\)，又给出了一边\(AB = DE\)，可根据“角角边（AAS）”判定全等。
**证明**：在\(\triangle ABC\)和\(\triangle DEF\)中，
\(\begin{cases}\angle A=\angle D \\ \angle B = \angle E \\ AB = DE\end{cases}\)
所以\(\triangle ABC\cong\triangle DEF(AAS)\) 。

#### 1.2 已知一角一邻边找一角的例题
**题目**：如图，在四边形\(ABCD\)中，\(AB = AD\)，\(\angle BAC=\angle DAC\)，求证\(\triangle ABC\cong\triangle ADC\)。
**分析**：已知一边\(AB = AD\)，一角\(\angle BAC=\angle DAC\)，这是一角一邻边的情况，又有公共边\(AC\)，可根据“边 - 角 - 边（SAS）”判定全等。这里从找角的角度，我们也可以利用公共角\(\angle BAC=\angle DAC\)来证明。
**证明**：在\(\triangle ABC\)和\(\triangle ADC\)中，
\(\begin{cases}AB = AD \\ \angle BAC=\angle DAC \\ AC = AC\end{cases}\)
所以\(\triangle ABC\cong\triangle ADC(SAS)\) 。

#### 1.3 已知一角一邻边找另一邻边的例题
**题目**：如图，在\(\triangle ABC\)中，\(D\)、\(E\)是\(BC\)边上的2点，\(AB = AC\)，\(BD = CE\)，求证\(\triangle ABD\cong\triangle ACE\)。
**分析**：本题主要涉及等腰三角形的性质以及全等三角形的判定定理。先利用等腰三角形两底角相等的性质得到一组角相等，再结合已知的边相等，根据全等三角形判定定理中的“边角边（SAS）”来证明两个三角形全等。
**详解**：
1. **证明\(\angle B = \angle C\)**
因为\(AB = AC\)，根据等腰三角形的性质：等腰三角形两底角相等，所以在\(\triangle ABC\)中，\(\angle B=\angle C\)。
2. **证明\(\triangle ABD\cong\triangle ACE\)**
在\(\triangle ABD\)和\(\triangle ACE\)中，
\[
\begin{cases}
AB = AC &(已知)\\
\angle B=\angle C &(已证)\\
BD = CE &(已知)
\end{cases}
\]
根据全等三角形判定定理中的“边角边（SAS）”，即两边及其夹角分别相等的两个三角形全等，所以\(\triangle ABD\cong\triangle ACE\)。

#### 1.4 已知一角一对边找一角的例题
**题目**：如图，在\(\triangle ABC\)和\(\triangle A'B'C'\)中，\(\angle C=\angle C' = 90^{\circ}\)，\(AB = A'B'\)，\(\angle A=\angle A'\)，求证\(\triangle ABC\cong\triangle A'B'C'\)。
**分析**：已知\(\angle C=\angle C' = 90^{\circ}\)（一角），\(AB = A'B'\)（一对边），又给出\(\angle A=\angle A'\)（另一角），可根据“角 - 角 - 边（AAS）”判定全等。
**证明**：在\(\triangle ABC\)和\(\triangle A'B'C'\)中，
\(\begin{cases}\angle A=\angle A' \\ \angle C=\angle C' \\ AB = A'B'\end{cases}\)
所以\(\triangle ABC\cong\triangle A'B'C'(AAS)\) 。


### 2. 角平分线四大模型

#### 2.1 角平分线+垂直→双垂（角平分线性质）
**例题**：如图（下方SVG图示：AD平分∠BAC，D在BC上，DB⊥AB于B，DC⊥AC于C，标注DB=3），△ABC中AD平分∠BAC，DB⊥AB于B，DC⊥AC于C，若DB=3，求DC的长度。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 角平分线AD -->
  <line x1="150" y1="60" x2="150" y2="180" stroke="#000" stroke-width="2"/>
  <!-- DB⊥AB、DC⊥AC（双垂） -->
  <line x1="150" y1="120" x2="80" y2="180" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="120" x2="220" y2="180" stroke="#000" stroke-width="2"/>
  <!-- 直角符号（DB⊥AB） -->
  <line x1="95" y1="175" x2="105" y2="175" stroke="#000" stroke-width="2"/>
  <line x1="105" y1="175" x2="105" y2="185" stroke="#000" stroke-width="2"/>
  <!-- 直角符号（DC⊥AC） -->
  <line x1="205" y1="175" x2="215" y2="175" stroke="#000" stroke-width="2"/>
  <line x1="205" y1="175" x2="205" y2="185" stroke="#000" stroke-width="2"/>
  <!-- 点D -->
  <circle cx="150" cy="120" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="145" y="110" font-size="12">D</text>
  <text x="90" y="140" font-size="10">DB=3</text>
  <text x="130" y="80" font-size="10">AD平分∠BAC</text>
</svg></div>


**解析**：
- 手册反射："看见角平分线+垂直，就想到双垂"；
- 角平分线性质：角平分线上的点到角两边的距离相等→AD平分∠BAC，DB⊥AB，DC⊥AC→DC=DB=3。

**答案**：DC=3。

### 3. 等腰三角形

#### 3.1 三线合一，知二推一（中线+角平分线→高线）
**例题**：如图（下方SVG图示：等腰△ABC中AB=AC，AD平分∠BAC且D是BC中点，连接AD，标注AB=AC、∠BAD=∠CAD、BD=DC），△ABC中，AB=AC，AD平分∠BAC，且BD=DC，求证：AD⊥BC。
<div><svg width="300" height="220" xmlns="http://www.w3.org/2000/svg">
  <!-- 等腰△ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 角平分线+中线AD -->
  <line x1="150" y1="60" x2="150" y2="180" stroke="#000" stroke-width="2"/>
  <!-- 点D（BC中点） -->
  <circle cx="150" cy="180" r="3" fill="#000"/>
  <!-- 垂直符号（待证，用虚线示意） -->
  <line x1="145" y1="120" x2="155" y2="120" stroke="#000" stroke-width="2" stroke-dasharray="3,2"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="145" y="195" font-size="12">D</text>
  <text x="120" y="100" font-size="10">AB=AC</text>
  <text x="170" y="100" font-size="10">∠BAD=∠CAD</text>
  <text x="130" y="160" font-size="10">BD=DC</text>
</svg></div>

**解析**：
- 手册反射："知二推一，如果角平分线和中线重合→可推出是垂直的高"；
- 直接用三线合一：AB=AC（等腰），AD是角平分线（∠BAD=∠CAD），AD是中线（BD=DC）→AD也是高线，故AD⊥BC（或证△ABD≌△ACD：AB=AC，∠BAD=∠CAD，AD=AD，SAS全等得∠ADB=∠ADC=90°）。

**答案**：AD⊥BC得证。

#### 3.2 等腰存在性→两圆一线模型
**例题**：已知线段AB=4，在平面内找一点C，使△ABC为等腰三角形，求点C的轨迹。（下方SVG图示：以A、B为圆心4为半径的两圆，及AB的垂直平分线）
<div><svg width="350" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 线段AB -->
  <line x1="100" y1="150" x2="200" y2="150" stroke="#000" stroke-width="2"/>
  <circle cx="100" cy="150" r="3" fill="#000"/> <!-- A -->
  <circle cx="200" cy="150" r="3" fill="#000"/> <!-- B -->

  <!-- 两圆：以A、B为圆心，AB为半径 -->
  <circle cx="100" cy="150" r="100" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 圆A -->
  <circle cx="200" cy="150" r="100" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 圆B -->

  <!-- 一线：AB的垂直平分线 -->
  <line x1="150" y1="50" x2="150" y2="250" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
  <line x1="145" y1="100" x2="155" y2="100" stroke="#000" stroke-width="2"/> <!-- 垂直符号 -->

  <!-- 标注文字 -->
  <text x="95" y="140" font-size="12">A</text>
  <text x="205" y="140" font-size="12">B</text>
  <text x="120" y="80" font-size="10">圆A（半径AB=4）</text>
  <text x="180" y="80" font-size="10">圆B（半径AB=4）</text>
  <text x="155" y="120" font-size="10">AB的垂直平分线</text>
  <text x="140" y="160" font-size="10">AB=4</text>
</svg></div>

**解析**：
- 手册反射："等腰三角形存在性问题→两圆一线模型"；
- 分类构建轨迹：
  1. **圆A**：以A为圆心、AB为半径→圆上任意点C满足AC=AB（等腰△ABC，AB=AC为腰）；
  2. **圆B**：以B为圆心、AB为半径→圆上任意点C满足BC=AB（等腰△ABC，AB=BC为腰）；
  3. **垂直平分线**：AB的垂直平分线上任意点C满足AC=BC（等腰△ABC，AC=BC为腰）；
- 注意：需排除与AB共线的重合点（避免三点共线无法构成三角形）。

**答案**：点C的轨迹是"以A、B为圆心4为半径的两个圆"和"线段AB的垂直平分线"（除去与AB共线的重合点）。

### 4. 等边三角形

#### 4.1 旋转手拉手模型
**例题**：如图（下方SVG图示：△ABC和△ADE均为等边三角形，A在上，AD在AB右侧，AE在AC左侧，连接BD、CE交于一点），△ABC和△ADE均为等边三角形，连接BD、CE，求证：BD=CE。
<div><svg width="300" height="220" xmlns="http://www.w3.org/2000/svg">
  <!-- 等边△ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 等边△ADE（绕A旋转60°） -->
  <polygon points="150,60 180,100 120,100" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 手拉手线段BD、CE -->
  <line x1="80" y1="180" x2="180" y2="100" stroke="#000" stroke-width="2"/> <!-- BD -->
  <line x1="220" y1="180" x2="120" y2="100" stroke="#000" stroke-width="2"/> <!-- CE -->
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="185" y="95" font-size="12">D</text>
  <text x="115" y="95" font-size="12">E</text>
  <text x="100" y="140" font-size="10">△ABC为等边</text>
  <text x="170" y="140" font-size="10">△ADE为等边</text>
  <text x="140" y="110" font-size="10">∠BAC=∠DAE=60°</text>
</svg></div>

**解析**：
- 手册反射："等边三角形结合60°角旋转，考察手拉手模型"；
- 旋转关键：等边三角形三边相等、三角为60°→AB=AC，AD=AE，∠BAC=∠DAE=60°；
- 推夹角相等：∠BAC+∠CAD=∠DAE+∠CAD→∠BAD=∠CAE；
- 证全等：△BAD≌△CAE（SAS）→对应边BD=CE。

**答案**：BD=CE得证。

### 5. 垂直平分线

#### 5.1 中点+垂直→垂直平分线→等腰
**例题**：如图（下方SVG图示：△ABC中BC为底边，D是BC中点，DE⊥BC交AB于E，连接CE，标注BE=5、∠B=30°），在△ABC中，D是BC中点，DE⊥BC交AB于E，若BE=5，∠B=30°，求CE的长度及∠ECB的度数。
<div><svg width="300" height="220" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- BC中点D -->
  <circle cx="150" cy="180" r="3" fill="#000"/>
  <!-- DE⊥BC（垂直平分线） -->
  <line x1="150" y1="180" x2="150" y2="120" stroke="#000" stroke-width="2"/>
  <!-- 垂直符号 -->
  <line x1="145" y1="125" x2="150" y2="130" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="130" x2="155" y2="125" stroke="#000" stroke-width="2"/>
  <!-- 点E（DE与AB交点） -->
  <circle cx="115" cy="120" r="3" fill="#000"/>
  <!-- 线段CE -->
  <line x1="115" y1="120" x2="220" y2="180" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="145" y="195" font-size="12">D</text>
  <text x="105" y="110" font-size="12">E</text>
  <text x="90" y="150" font-size="10">BE=5</text>
  <text x="100" y="130" font-size="10">∠B=30°</text>
</svg></div>

**解析**：
- 手册反射："看见中点上出现垂直，就想到垂直平分线出等腰"；
- 连两端：D是BC中点（BD=DC），DE⊥BC→DE是BC的垂直平分线，故CE=BE（垂直平分线上的点到线段两端距离相等）；
- 计算：BE=5→CE=5；△BEC是等腰（CE=BE），∠B=∠ECB=30°。

**答案**：CE=5，∠ECB=30°。

### 6. 中点四大模型

#### 6.1 中点+直角三角形→斜边中线=1/2斜边
**例题**：如图（下方SVG图示：Rt△ABC中∠C=90°，A左、C在原点、B右，AC=6、BC=8，D是AB中点，连接CD），Rt△ABC中，∠ACB=90°，D是AB中点，若AC=6，BC=8，求CD的长度。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠C=90°） -->
  <line x1="50" y1="150" x2="50" y2="70" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="50" y1="150" x2="190" y2="150" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="50" y1="70" x2="190" y2="150" stroke="#000" stroke-width="2"/> <!-- AB -->
  <line x1="45" y1="145" x2="55" y2="155" stroke="#000" stroke-width="2"/> <!-- 直角符号 -->
  <!-- 斜边AB中点D -->
  <circle cx="120" cy="110" r="3" fill="#000"/>
  <!-- 斜边中线CD -->
  <line x1="50" y1="150" x2="120" y2="110" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 虚线辅助线 -->
  <!-- 标注文字 -->
  <text x="40" y="65" font-size="12">A</text>
  <text x="195" y="160" font-size="12">B</text>
  <text x="40" y="160" font-size="12">C</text>
  <text x="125" y="105" font-size="12">D</text>
  <text x="30" y="110" font-size="10">AC=6</text>
  <text x="120" y="160" font-size="10">BC=8</text>
</svg></div>

**解析**：
- 手册反射："看见直角三角形中点，就想到斜边中线=1/2斜边"；
- 连两端：D是AB中点（AD=DB），故CD是斜边AB的中线；
- 计算：AB=10（勾股定理），CD=1/2AB=5。

**答案**：CD=5。

#### 6.2 中点+平行→中位线→平行且1/2
**例题**：如图（下方SVG图示：△ABC中，D、E分别是AB、AC中点，连接DE），△ABC中，D、E分别是AB、AC中点，求DE与BC的关系。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- AB中点D -->
  <circle cx="115" cy="120" r="3" fill="#000"/>
  <!-- AC中点E -->
  <circle cx="185" cy="120" r="3" fill="#000"/>
  <!-- 线段DE -->
  <line x1="115" y1="120" x2="185" y2="120" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="110" y="110" font-size="12">D</text>
  <text x="180" y="110" font-size="12">E</text>
</svg></div>

**解析**：
- 手册反射："看见中点+平行，就想到中位线"；
- 连两端：D、E分别是AB、AC中点，故DE是△ABC的中位线；
- 计算：DE∥BC，DE=1/2BC。

**答案**：DE∥BC，DE=1/2BC。

#### 6.3 中点+平行→中位线→平行且1/2
**例题**：如图（下方SVG图示：△ABC中，D、E分别是AB、AC中点，连接DE），△ABC中，D、E分别是AB、AC中点，求DE与BC的关系。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- AB中点D -->
  <circle cx="115" cy="120" r="3" fill="#000"/>
  <!-- AC中点E -->
  <circle cx="185" cy="120" r="3" fill="#000"/>
  <!-- 线段DE -->
  <line x1="115" y1="120" x2="185" y2="120" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="110" y="110" font-size="12">D</text>
  <text x="180" y="110" font-size="12">E</text>
</svg></div>

**解析**：
- 手册反射："看见中点+平行，就想到中位线"；
- 连两端：D、E分别是AB、AC中点，故DE是△ABC的中位线；
- 计算：DE∥BC，DE=1/2BC。

**答案**：DE∥BC，DE=1/2BC。

#### 6.4 中点+平行→中位线→平行且1/2
**例题**：如图（下方SVG图示：△ABC中，D、E分别是AB、AC中点，连接DE），△ABC中，D、E分别是AB、AC中点，求DE与BC的关系。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,60 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- AB中点D -->
  <circle cx="115" cy="120" r="3" fill="#000"/>
  <!-- AC中点E -->
  <circle cx="185" cy="120" r="3" fill="#000"/>
  <!-- 线段DE -->
  <line x1="115" y1="120" x2="185" y2="120" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="150" y="50" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="110" y="110" font-size="12">D</text>
  <text x="180" y="110" font-size="12">E</text>
</svg></div>

</svg></div>

**解析**：
- 手册反射："看见直角三角形+斜边中点，就想到斜边中线等于斜边一半"；
- 先算斜边：Rt△ABC中，AB=$\sqrt{AC^2+BC^2}$=$\sqrt{6^2+8^2}$=10；
- 求中线：D是AB中点，CD=1/2 AB=5。

**答案**：CD=5。

#### 6.1 中点+直角三角形→斜边中线=1/2斜边
**例题**：如图（下方SVG图示：Rt△ABC中∠C=90°，A左、C在原点、B右，AC=6、BC=8，D是AB中点，连接CD），Rt△ABC中，∠ACB=90°，D是AB中点，若AC=6，BC=8，求CD的长度。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠C=90°） -->
  <line x1="50" y1="150" x2="50" y2="70" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="50" y1="150" x2="190" y2="150" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="50" y1="70" x2="190" y2="150" stroke="#000" stroke-width="2"/> <!-- AB -->
  <!-- 直角符号 -->
  <line x1="50" y1="140" x2="60" y2="140" stroke="#000" stroke-width="2"/>
  <line x1="60" y1="140" x2="60" y2="150" stroke="#000" stroke-width="2"/>
  <!-- 斜边AB中点D -->
  <circle cx="120" cy="110" r="3" fill="#000"/>
  <!-- 斜边中线CD -->
  <line x1="50" y1="150" x2="120" y2="110" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 虚线辅助线 -->
  <!-- 标注文字 -->
  <text x="40" y="65" font-size="12">A</text>
  <text x="195" y="160" font-size="12">B</text>
  <text x="40" y="160" font-size="12">C</text>
  <text x="125" y="105" font-size="12">D</text>
  <text x="30" y="110" font-size="10">AC=6</text>
  <text x="120" y="160" font-size="10">BC=8</text>
</svg></div>


#### 6.3 中点+面积→等面积法
**例题**：如图（下方SVG图示：△ABC中BC为底边，D是BC中点，过A作BC的高AH，标注△ABD与△ADC同高、BD=DC），△ABC中，D是BC中点，若△ABD的面积为6，求△ABC的面积。
<div><svg width="300" height="220" xmlns="http://www.w3.org/2000/svg">
  <!-- △ABC -->
  <polygon points="150,70 80,180 220,180" fill="none" stroke="#000" stroke-width="2"/>
  <!-- BC中点D -->
  <circle cx="150" cy="180" r="3" fill="#000"/>
  <!-- 高AH（垂直BC） -->
  <line x1="150" y1="70" x2="150" y2="180" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 虚线高 -->
  <!-- 垂直符号 -->
  <line x1="145" y1="175" x2="150" y2="180" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="180" x2="155" y2="175" stroke="#000" stroke-width="2"/>
  <!-- 线段AD（分△ABC为两部分） -->
  <line x1="150" y1="70" x2="150" y2="180" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="150" y="60" font-size="12">A</text>
  <text x="70" y="190" font-size="12">B</text>
  <text x="225" y="190" font-size="12">C</text>
  <text x="145" y="195" font-size="12">D</text>
  <text x="130" y="120" font-size="10">AH为高（公共高）</text>
  <text x="90" y="150" font-size="10">S△ABD=6</text>
  <text x="180" y="150" font-size="10">BD=DC</text>
</svg></div>

**解析**：
- 手册反射："中点+面积→等面积法"；
- 等面积核心：三角形面积=1/2×底×高，△ABD与△ADC共享高AH（从A到BC的垂线段），且D是BC中点→BD=DC；
- 计算：S△ABD=1/2×BD×AH=6，S△ADC=1/2×DC×AH=1/2×BD×AH=6→S△ABC=6+6=12。

**答案**：△ABC的面积为12.



### 7. 直角三角形

#### 7.1 直角+30°→30°对边=1/2斜边
**例题**：如图（下方SVG图示：Rt△ABC中∠C=90°，∠A=30°，BC为短直角边标注4，A左、C下、B右），Rt△ABC中，∠C=90°，∠A=30°，BC=4，求AB的长度。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠C=90°） -->
  <line x1="50" y1="150" x2="120" y2="70" stroke="#000" stroke-width="2"/> <!-- AB -->
  <line x1="50" y1="150" x2="200" y2="150" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="200" y1="150" x2="120" y2="70" stroke="#000" stroke-width="2"/> <!-- AC -->
  <!-- 直角符号 -->
  <line x1="190" y1="140" x2="190" y2="150" stroke="#000" stroke-width="2"/>
  <line x1="190" y1="150" x2="200" y2="150" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="40" y="160" font-size="12">B</text>
  <text x="205" y="160" font-size="12">C</text>
  <text x="115" y="65" font-size="12">A</text>
  <text x="140" y="160" font-size="10">BC=4</text>
  <text x="130" y="90" font-size="10">∠A=30°</text>
</svg></div>

**解析**：
- 手册反射："看见直角三角形+30°，就想到30°角所对的直角边是斜边的一半"；
- 直接应用：∠A=30°，对边是BC→BC=1/2 AB→AB=2BC=8。

**答案**：AB=8。

#### 7.2 双高模型→角相等
**例题**：如图（下方SVG图示：Rt△ABC中∠ACB=90°，CD⊥AB于D，标注∠ACB=90°、CD⊥AB），Rt△ABC中，∠ACB=90°，CD⊥AB于D，求证：∠A=∠BCD。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠ACB=90°） -->
  <line x1="80" y1="160" x2="80" y2="80" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="80" y1="160" x2="220" y2="160" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="80" y1="80" x2="220" y2="160" stroke="#000" stroke-width="2"/> <!-- AB -->
  <!-- 直角符号（∠C） -->
  <line x1="80" y1="150" x2="90" y2="150" stroke="#000" stroke-width="2"/>
  <line x1="90" y1="150" x2="90" y2="160" stroke="#000" stroke-width="2"/>
  <!-- 双高CD（CD⊥AB） -->
  <line x1="80" y1="160" x2="140" y2="120" stroke="#000" stroke-width="2"/> <!-- CD -->
  <!-- 直角符号（CD⊥AB） -->
  <line x1="135" y1="125" x2="140" y2="130" stroke="#000" stroke-width="2"/>
  <line x1="140" y1="130" x2="145" y2="125" stroke="#000" stroke-width="2"/>
  <!-- 点D -->
  <circle cx="140" cy="120" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="75" y="75" font-size="12">A</text>
  <text x="225" y="170" font-size="12">B</text>
  <text x="75" y="170" font-size="12">C</text>
  <text x="145" y="115" font-size="12">D</text>
  <text x="50" y="120" font-size="10">∠ACB=90°</text>
  <text x="150" y="140" font-size="10">CD⊥AB</text>
  <text x="100" y="100" font-size="10">求证∠A=∠BCD</text>
</svg></div>

**解析**：
- 手册反射："看见两个直角三角形的锐角相等，想到互余的角对应相等（双高模型）"；
- 互余推导：①∠ACB=90°→∠A+∠B=90°（直角三角形两锐角互余）；②CD⊥AB→∠CDB=90°→∠BCD+∠B=90°；
- 同角的余角相等：∠A=∠BCD。

**答案**：∠A=∠BCD得证。

### 8. 特殊平行四边形

#### 8.1 正方形：十字架模型→垂直
**例题**：如图（下方SVG图示：正方形ABCD中A左上、B右上、C右下、D左下，E在BC、F在CD上且BE=CF，连接AE、BF交于G），正方形ABCD中，E、F分别在BC、CD上，且BE=CF，连接AE、BF交于G，求证：AE⊥BF。
<div><svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 正方形ABCD -->
  <rect x="50" y="50" width="150" height="150" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 点E（BC上）、点F（CD上） -->
  <circle cx="125" cy="200" r="3" fill="#000"/>
  <circle cx="200" cy="125" r="3" fill="#000"/>
  <!-- 十字架AE、BF -->
  <line x1="50" y1="50" x2="125" y2="200" stroke="#000" stroke-width="2"/>
  <line x1="200" y1="50" x2="200" y2="125" stroke="#000" stroke-width="2"/>
  <!-- 交点G -->
  <circle cx="115" cy="140" r="3" fill="#000"/>
  <!-- 垂直符号 -->
  <line x1="110" y1="135" x2="115" y2="140" stroke="#000" stroke-width="2"/>
  <line x1="115" y1="140" x2="120" y2="135" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="45" y="45" font-size="12">A</text>
  <text x="205" y="45" font-size="12">B</text>
  <text x="205" y="210" font-size="12">C</text>
  <text x="45" y="210" font-size="12">D</text>
  <text x="120" y="210" font-size="12">E</text>
  <text x="205" y="120" font-size="12">F</text>
  <text x="110" y="130" font-size="10">G</text>
  <text x="110" y="180" font-size="10">BE=CF</text>
</svg></div>

**解析**：
- 手册反射："正方形十字架模型，弦图全等"；
- 证全等：△ABE≌△BCF（SAS：AB=BC，∠ABE=∠BCF=90°，BE=CF）→∠BAE=∠CBF；
- 推垂直：∠BAE+∠AEB=90°→∠CBF+∠AEB=90°→∠BGE=90°→AE⊥BF。

**答案**：AE⊥BF得证。

#### 8.2 矩形：连对角线得相等
**例题**：如图（下方SVG图示：矩形ABCD中A左上、B右上、C右下、D左下，对角线AC=10交于O，标注AC=10），矩形ABCD中，对角线AC、BD交于O，若AC=10，求BO的长度。
<div><svg width="280" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 矩形ABCD -->
  <rect x="60" y="60" width="160" height="100" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 对角线AC、BD -->
  <line x1="60" y1="60" x2="220" y2="160" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="220" y1="60" x2="60" y2="160" stroke="#000" stroke-width="2"/> <!-- BD -->
  <!-- 对角线交点O -->
  <circle cx="140" cy="110" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="55" y="55" font-size="12">A</text>
  <text x="225" y="55" font-size="12">B</text>
  <text x="225" y="170" font-size="12">C</text>
  <text x="55" y="170" font-size="12">D</text>
  <text x="135" y="105" font-size="12">O</text>
  <text x="100" y="90" font-size="10">AC=10</text>
  <text x="160" y="90" font-size="10">BO=?</text>
</svg></div>

**解析**：
- 手册反射："矩形一连接对角线，得相等"；
- 矩形性质：对角线相等且互相平分→AC=BD=10，O是BD中点→BO=1/2 BD=5。

**答案**：BO=5。

#### 8.3 菱形：连对角线得垂直
**例题**：如图（下方SVG图示：菱形ABCD中对角线AC=6、BD=8交于O，标注AO=3、BO=4、∠AOB=90°），菱形ABCD中，对角线AC⊥BD交于O，AC=6，BD=8，求菱形边长。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 菱形ABCD（对角线垂直） -->
  <line x1="150" y1="60" x2="150" y2="140" stroke="#000" stroke-width="2"/> <!-- BD -->
  <line x1="110" y1="100" x2="190" y2="100" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="110" y1="100" x2="150" y2="60" stroke="#000" stroke-width="2"/> <!-- AB -->
  <line x1="150" y1="60" x2="190" y2="100" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="190" y1="100" x2="150" y2="140" stroke="#000" stroke-width="2"/> <!-- CD -->
  <line x1="150" y1="140" x2="110" y2="100" stroke="#000" stroke-width="2"/> <!-- DA -->
  <!-- 垂直符号（∠AOB） -->
  <line x1="145" y1="95" x2="150" y2="100" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="100" x2="155" y2="95" stroke="#000" stroke-width="2"/>
  <!-- 交点O -->
  <circle cx="150" cy="100" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="155" y="55" font-size="12">A</text>
  <text x="195" y="105" font-size="12">B</text>
  <text x="155" y="150" font-size="12">C</text>
  <text x="105" y="105" font-size="12">D</text>
  <text x="145" y="105" font-size="12">O</text>
  <text x="120" y="90" font-size="10">AO=3</text>
  <text x="165" y="80" font-size="10">BO=4</text>
</svg></div>

**解析**：
- 手册反射："菱形一连接对角线，得垂直"；
- 菱形性质：对角线互相垂直平分→AO=1/2 AC=3，BO=1/2 BD=4，∠AOB=90°；
- 勾股定理：边长AB=$\sqrt{AO^2+BO^2}$=$\sqrt{3^2+4^2}$=5。

**答案**：菱形边长为5。

### 9. 圆

#### 9.1 切线+半径→垂直
**例题**：如图（下方SVG图示：圆O中OA为半径，PA是切线且A为切点，连接PA、OA），PA是⊙O的切线，A是切点，OA是半径，求证：PA⊥OA。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 圆O -->
  <circle cx="150" cy="100" r="50" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 半径OA -->
  <line x1="150" y1="100" x2="200" y2="100" stroke="#000" stroke-width="2"/>
  <!-- 切线PA -->
  <line x1="200" y1="100" x2="250" y2="50" stroke="#000" stroke-width="2"/>
  <line x1="195" y1="95" x2="205" y2="105" stroke="#000" stroke-width="2"/> <!-- 垂直符号 -->
  <!-- 标注文字 -->
  <text x="145" y="95" font-size="12">O</text>
  <text x="205" y="95" font-size="12">A</text>
  <text x="255" y="45" font-size="12">P</text>
  <text x="170" y="80" font-size="10">OA为半径</text>
  <text x="220" y="70" font-size="10">PA是切线</text>
</svg></div>

**解析**：
- 手册反射："看见圆+切线，就连半径，得垂直"；
- 切线性质：圆的切线垂直于过切点的半径→PA是切线，A是切点，OA是半径→PA⊥OA。

**答案**：PA⊥OA得证。

#### 9.2 弦+弦心距→铁三角（勾股定理）
**例题**：如图（下方SVG图示：圆O中弦AB=8，OD⊥AB于D（D为AB中点），OA=5，连接OA、OD，标注AB=8、OA=5、OD⊥AB），⊙O的半径为5，弦AB=8，求圆心O到AB的距离（弦心距OD）。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 圆O -->
  <circle cx="150" cy="100" r="70" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 弦AB -->
  <line x1="80" y1="150" x2="220" y2="150" stroke="#000" stroke-width="2"/> <!-- AB -->
  <!-- 弦心距OD（OD⊥AB） -->
  <line x1="150" y1="100" x2="150" y2="150" stroke="#000" stroke-width="2"/> <!-- OD -->
  <!-- 垂直符号 -->
  <line x1="145" y1="145" x2="150" y2="150" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="150" x2="155" y2="145" stroke="#000" stroke-width="2"/>
  <!-- 半径OA -->
  <line x1="150" y1="100" x2="80" y2="150" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 虚线OA -->
  <!-- 点D（AB中点） -->
  <circle cx="150" cy="150" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="155" y="95" font-size="12">O</text>
  <text x="75" y="145" font-size="12">A</text>
  <text x="225" y="145" font-size="12">B</text>
  <text x="145" y="160" font-size="12">D</text>
  <text x="140" y="120" font-size="10">AB=8</text>
  <text x="100" y="120" font-size="10">OA=5（半径）</text>
  <text x="160" y="130" font-size="10">OD=?</text>
</svg></div>

**解析**：
- 手册反射："看见圆+弦，就作弦心距，得铁三角"；
- 弦心距性质：垂直于弦的直径平分弦→OD⊥AB→AD=1/2 AB=4；
- 勾股定理：在Rt△AOD中，OD=$\sqrt{OA^2-AD^2}$=$\sqrt{5^2-4^2}$=3。

**答案**：弦心距OD=3.



### 10. 其他几何技巧

#### 10.1 审题反射技巧：无图→分类讨论（等腰三角形）
**例题**：已知等腰△ABC中，AB=5，BC=3，求AC的长度。（下方SVG图示：左图AB=AC=5、BC=3；右图BC=AC=3、AB=5）
<div><svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 左图：AB=AC=5，BC=3 -->
  <polygon points="100,60 60,160 140,160" fill="none" stroke="#000" stroke-width="2"/>
  <text x="100" y="50" font-size="12">A</text>
  <text x="55" y="170" font-size="12">B</text>
  <text x="145" y="170" font-size="12">C</text>
  <text x="70" y="120" font-size="10">AB=AC=5</text>
  <text x="90" y="175" font-size="10">BC=3</text>

  <!-- 右图：BC=AC=3，AB=5 -->
  <polygon points="300,60 250,160 330,160" fill="none" stroke="#000" stroke-width="2"/>
  <text x="300" y="50" font-size="12">A</text>
  <text x="245" y="170" font-size="12">B</text>
  <text x="335" y="170" font-size="12">C</text>
  <text x="260" y="120" font-size="10">AB=5</text>
  <text x="300" y="175" font-size="10">BC=AC=3</text>
</svg></div>

**解析**：
- 手册反射："无图一分类讨论""等腰三角形一分类讨论（腰VS底边）"；
- 分类1：AB为腰→AC=AB=5（三边5、5、3，满足三角形三边关系：5+5>3，5+3>5）；
- 分类2：BC为腰→AC=BC=3（三边3、3、5，满足三角形三边关系：3+3>5，3+5>3）；
- 结论：AC=5或3。

**答案**：AC=5或3。

#### 10.2 平面直角坐标系面积→铅垂法
**例题**：如图（下方SVG图示：平面直角坐标系中，△ABC的顶点坐标为A(1,3)、B(4,1)、C(2,-1)，用铅垂法分割三角形，标注水平线段长度），求△ABC的面积。
<div><svg width="350" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标系 -->
  <line x1="50" y1="200" x2="300" y2="200" stroke="#000" stroke-width="2"/> <!-- x轴 -->
  <line x1="50" y1="200" x2="50" y2="50" stroke="#000" stroke-width="2"/>   <!-- y轴 -->
  <!-- 刻度标注（x轴：50=0，每50单位=1；y轴：200=0，每30单位=1） -->
  <text x="295" y="210" font-size="12">x</text>
  <text x="45" y="60" font-size="12">y</text>
  <text x="95" y="210" font-size="10">1</text>
  <text x="145" y="210" font-size="10">2</text>
  <text x="195" y="210" font-size="10">3</text>
  <text x="245" y="210" font-size="10">4</text>
  <text x="45" y="170" font-size="10">1</text>
  <text x="45" y="140" font-size="10">2</text>
  <text x="45" y="110" font-size="10">3</text>

  <!-- 顶点A(1,3)、B(4,1)、C(2,-1)（坐标转换：x=50+50x，y=200-30y） -->
  <circle cx="100" cy="110" r="3" fill="#000"/> <!-- A(1,3)：x=50+50×1=100，y=200-30×3=110 -->
  <circle cx="250" cy="170" r="3" fill="#000"/> <!-- B(4,1)：x=50+50×4=250，y=200-30×1=170 -->
  <circle cx="150" cy="230" r="3" fill="#000"/> <!-- C(2,-1)：x=50+50×2=150，y=200-30×(-1)=230 -->
  <polygon points="100,110 250,170 150,230" fill="none" stroke="#000" stroke-width="2"/> <!-- △ABC -->

  <!-- 铅垂法分割：过C作x轴平行线（铅垂高），交AB于D -->
  <line x1="150" y1="230" x2="200" y2="230" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- 水平线段（铅垂高的底） -->
  <circle cx="200" cy="230" r="3" fill="#000"/> <!-- D点（AB与水平线交点） -->
  <line x1="100" y1="110" x2="250" y2="170" stroke="#000" stroke-width="2"/> <!-- AB -->

  <!-- 标注文字 -->
  <text x="95" y="100" font-size="12">A(1,3)</text>
  <text x="255" y="160" font-size="12">B(4,1)</text>
  <text x="145" y="240" font-size="12">C(2,-1)</text>
  <text x="195" y="220" font-size="10">D</text>
  <text x="120" y="220" font-size="10">铅垂高：CD=2（y差）</text>
  <text x="120" y="190" font-size="10">水平宽：4-1=3（x差）</text>
  <text x="100" y="195" font-size="12">面积=1/2×3×2=3</text>
</svg></div>

**解析**：
- 手册反射："平面直角坐标系面积→面积→横平竖直线段→点的坐标→解析式（铅垂法）"；
- 铅垂法步骤：
  1. 定水平宽：取A、B两点横坐标差的绝对值→水平宽=4-1=3；
  2. 定铅垂高：过C作与x轴平行的直线（铅垂线方向），交AB于D，取C、D两点纵坐标差的绝对值→铅垂高=|-1 - 1|=2（简化计算：用两点y坐标差）；
  3. 算面积：面积=1/2×水平宽×铅垂高=1/2×3×2=3。

**答案**：△ABC的面积为3。

## ★模块二：函数

### 1. 抛物线与对称轴

#### 1.1 抛物线两点纵坐标相等→对称轴
**例题**：如图（下方SVG图示：平面直角坐标系中，抛物线过(2,4)和(6,4)，虚线标注对称轴x=4），已知抛物线y=ax²+bx+c过点(2,4)和(6,4)，求抛物线的对称轴。
<div><svg width="350" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标系 -->
  <line x1="50" y1="150" x2="300" y2="150" stroke="#000" stroke-width="2"/> <!-- x轴 -->
  <line x1="50" y1="150" x2="50" y2="50" stroke="#000" stroke-width="2"/>   <!-- y轴 -->
  <!-- 抛物线（示意） -->
  <path d="M80,120 Q170,50 260,120" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 点(2,4)、(6,4)（坐标转换：x=50+50*横坐标，y=150-20*纵坐标） -->
  <circle cx="150" cy="70" r="3" fill="#000"/> <!-- (2,4)：x=50+50*2=150，y=150-20*4=70 -->
  <circle cx="350" cy="70" r="3" fill="#000"/> <!-- (6,4)：x=50+50*6=350→调整为300（适配画布），y=70 -->
  <!-- 对称轴x=4（虚线） -->
  <line x1="250" y1="60" x2="250" y2="140" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
  <!-- 标注文字 -->
  <text x="145" y="65" font-size="10">(2,4)</text>
  <text x="295" y="65" font-size="10">(6,4)</text>
  <text x="255" y="80" font-size="10">x=4</text>
  <text x="295" y="160" font-size="12">x</text>
  <text x="45" y="60" font-size="12">y</text>
</svg></div>

**解析**：
- 手册反射："抛物线上两点的纵坐标相等→关于对称轴对称，用中点公式求对称轴"；
- 中点横坐标：对称轴为两点横坐标的中点→x=$\frac{2+6}{2}$=4。

**答案**：对称轴为直线x=4。

### 2. 直线的平行与垂直

#### 2.1 两直线平行/垂直→k的关系
**例题**：如图（下方SVG图示：平面直角坐标系中，l₁：y=2x+3过一、二、三象限，l₂过(1,2)且与l₁垂直），已知直线l₁：y=2x+3，求过点(1,2)且与l₁垂直的直线l₂的解析式。
<div><svg width="350" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标系 -->
  <line x1="50" y1="200" x2="300" y2="200" stroke="#000" stroke-width="2"/> <!-- x轴 -->
  <line x1="50" y1="200" x2="50" y2="50" stroke="#000" stroke-width="2"/>   <!-- y轴 -->
  <!-- 直线l₁：y=2x+3（取两点：(0,3)→(50,130)，(1,5)→(60,140)） -->
  <line x1="50" y1="170" x2="100" y2="70" stroke="#000" stroke-width="2"/> <!-- 转换：y=200-20y，x=50+20x → (0,3)→x=50,y=200-60=140；(2,7)→x=90,y=200-140=60，调整为适配画布 -->
  <!-- 直线l₂（过(1,2)，与l₁垂直，k=-1/2） -->
  <line x1="70" y1="160" x2="170" y2="110" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- (1,2)→x=50+20*1=70,y=200-40=160；(3,1)→x=90,y=180，调整为适配 -->
  <!-- 点(1,2) -->
  <circle cx="70" cy="160" r="3" fill="#000"/>
  <!-- 垂直符号 -->
  <line x1="80" y1="140" x2="90" y2="150" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="300" y="210" font-size="12">x</text>
  <text x="45" y="60" font-size="12">y</text>
  <text x="110" y="80" font-size="10">l₁:y=2x+3</text>
  <text x="180" y="115" font-size="10">l₂:y=-1/2x+b</text>
  <text x="65" y="150" font-size="10">(1,2)</text>
</svg></div>

**解析**：
- 手册反射："两条直线垂直→k₁k₂=-1"；
- 求l₂的k值：l₁的k₁=2→2×k₂=-1→k₂=-1/2；
- 设l₂解析式：y=-1/2 x+b，代入点(1,2)→2=-1/2×1+b→b=5/2；
- 结论：l₂的解析式为y=-1/2 x + 5/2。

**答案**：y=-1/2 x + 5/2。

### 3. 函数最值

#### 3.1 函数最值→垂线段最短
**例题**：如图（下方SVG图示：平面直角坐标系中，A(3,0)在x轴上，过A作y轴垂线段，垂足(0,0)，标注长度3），已知点A(3,0)，点B在y轴上，求AB的最小值。
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 坐标系 -->
  <line x1="50" y1="150" x2="250" y2="150" stroke="#000" stroke-width="2"/> <!-- x轴 -->
  <line x1="50" y1="150" x2="50" y2="50" stroke="#000" stroke-width="2"/>   <!-- y轴 -->
  <!-- 点A(3,0)（转换：x=50+50*3=200，y=150） -->
  <circle cx="200" cy="150" r="3" fill="#000"/>
  <!-- 垂线段（A到y轴的最短距离） -->
  <line x1="200" y1="150" x2="50" y2="150" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/>
  <!-- 垂足O(0,0) -->
  <circle cx="50" cy="150" r="3" fill="#000"/>
  <!-- 标注文字 -->
  <text x="250" y="160" font-size="12">x</text>
  <text x="45" y="60" font-size="12">y</text>
  <text x="205" y="145" font-size="12">A(3,0)</text>
  <text x="45" y="160" font-size="12">O(0,0)</text>
  <text x="120" y="160" font-size="10">长度=3（最小值）</text>
</svg></div>

**解析**：
- 手册反射："求最值→垂线段最短"；
- 几何意义：点到直线的距离中，垂线段最短→点A到y轴（直线x=0）的最短距离是水平垂线段AO；
- 计算：A(3,0)到y轴的距离=横坐标的绝对值=3→AB最小值=3。

**答案**：AB的最小值为3。

## ★模块三：其他部分

### 1. 多项式与配方

#### 1.1 多项式=0→配方（0+0+0模型）
**例题**：已知a²+b²-2a+4b+5=0，求a+b的值。（无图，多项式配方示意）
**解析**：
- 手册反射："多个字母多项式=0→配方，利用0+0+0=0模型"；
- 配方步骤：
  1. 分组：(a²-2a) + (b²+4b) + 5=0；
  2. 补全平方：(a²-2a+1) + (b²+4b+4) =0→(a-1)² + (b+2)²=0；
- 非负性：平方数≥0，故(a-1)²=0且(b+2)²=0→a=1，b=-2；
- 计算：a+b=1+(-2)=-1。

**答案**：a+b=-1。

### 2. 阴影面积

#### 2.1 阴影面积→大减小
**例题**：如图（下方SVG图示：正方形ABCD边长4，A左上，以A为圆心4为半径画弧BD，阴影为正方形减扇形），正方形ABCD边长为4，以A为圆心4为半径画弧BD，求阴影部分（正方形减扇形）的面积。
<div><svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 正方形ABCD -->
  <rect x="50" y="50" width="120" height="120" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 扇形BAD（以A为圆心，半径=正方形边长） -->
  <path d="M50,50 L50,170 A120,120 0 0,0 170,50" fill="none" stroke="#000" stroke-width="2"/>
  <!-- 阴影部分（正方形内除扇形外，用灰色填充示意） -->
  <path d="M50,50 L50,170 L170,170 L170,50 Z M50,50 L50,170 A120,120 0 0,0 170,50 Z" fill="#eee" stroke="#000" stroke-width="2"/>
  <!-- 标注文字 -->
  <text x="45" y="45" font-size="12">A</text>
  <text x="175" y="45" font-size="12">B</text>
  <text x="175" y="180" font-size="12">C</text>
  <text x="45" y="180" font-size="12">D</text>
  <text x="80" y="100" font-size="10">边长=4</text>
  <text x="90" y="130" font-size="10">阴影面积</text>
</svg></div>

**解析**：
- 手册反射："求阴影面积→从大减小下手"；
- 计算大图形（正方形）面积：4×4=16；
- 计算小图形（扇形）面积：扇形BAD是1/4圆（∠BAD=90°），面积=1/4×π×4²=4π；
- 阴影面积：16-4π。

**答案**：16-4π。

### 3. 循环规律

#### 3.1 循环规律→找周期
**例题**：观察数列：1，3，2，-1，-3，-2，1，3，2，-1…，求第2023项的值。（下方SVG图示：数列前6项为一个周期，列表展示周期及余数对应关系）
<div><svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
  <!-- 周期示意表格 -->
  <line x1="50" y1="50" x2="350" y2="50" stroke="#000" stroke-width="2"/> <!-- 表头线 -->
  <line x1="50" y1="50" x2="50" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="100" y1="50" x2="100" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="150" y1="50" x2="150" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="200" y1="50" x2="200" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="250" y1="50" x2="250" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="300" y1="50" x2="300" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="350" y1="50" x2="350" y2="120" stroke="#000" stroke-width="2"/>
  <line x1="50" y1="80" x2="350" y2="80" stroke="#000" stroke-width="2"/> <!-- 分隔线 -->

  <!-- 表头文字 -->
  <text x="60" y="70" font-size="12">项数</text>
  <text x="110" y="70" font-size="12">1</text>
  <text x="160" y="70" font-size="12">2</text>
  <text x="210" y="70" font-size="12">3</text>
  <text x="260" y="70" font-size="12">4</text>
  <text x="310" y="70" font-size="12">5</text>
  <text x="360" y="70" font-size="12">6</text>

  <!-- 数列值 -->
  <text x="60" y="100" font-size="12">数值</text>
  <text x="110" y="100" font-size="12">1</text>
  <text x="160" y="100" font-size="12">3</text>
  <text x="210" y="100" font-size="12">2</text>
  <text x="260" y="100" font-size="12">-1</text>
  <text x="310" y="100" font-size="12">-3</text>
  <text x="360" y="100" font-size="12">-2</text>

  <!-- 周期标注 -->
  <text x="180" y="40" font-size="12">周期=6（前6项重复）</text>
  <text x="50" y="140" font-size="12">2023÷6=337余1→第2023项=第1项=1</text>
</svg></div>

**解析**：
- 手册反射："循环规律→列出前几个找周期，总数除以周期看余数"；
- 步骤：
  1. 找周期：观察数列，前6项"1，3，2，-1，-3，-2"重复出现→周期=6；
  2. 算余数：2023÷6=337（商）……1（余数）→余数为1，说明第2023项与周期内第1项相同；
  3. 定结果：周期内第1项为1→第2023项=1。

**答案**：第2023项的值为1。

### 4. 概率问题

#### 4.1 概率问题→树状图/列表法
**例题**：一个不透明的袋子中装有2个红球（记为红1、红2）和1个白球，从中随机摸出1个球后放回，再随机摸出1个球，求两次摸出的球都是红球的概率。（下方SVG图示：树状图展示所有可能结果）
<div><svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- 树状图主干 -->
  <line x1="80" y1="80" x2="80" y2="120" stroke="#000" stroke-width="2"/> <!-- 起点到第一次摸球 -->
  <text x="60" y="70" font-size="12">第一次摸球</text>

  <!-- 第一次摸球分支（红1、红2、白） -->
  <line x1="80" y1="120" x2="130" y2="150" stroke="#000" stroke-width="2"/> <!-- 红1 -->
  <line x1="80" y1="120" x2="180" y2="150" stroke="#000" stroke-width="2"/> <!-- 红2 -->
  <line x1="80" y1="120" x2="230" y2="150" stroke="#000" stroke-width="2"/> <!-- 白 -->
  <text x="110" y="140" font-size="12">红1</text>
  <text x="160" y="140" font-size="12">红2</text>
  <text x="210" y="140" font-size="12">白</text>

  <!-- 第二次摸球分支（每个第一次结果对应3个分支） -->
  <!-- 红1的第二次分支 -->
  <line x1="130" y1="150" x2="110" y2="180" stroke="#000" stroke-width="2"/> <!-- 红1→红1 -->
  <line x1="130" y1="150" x2="130" y2="180" stroke="#000" stroke-width="2"/> <!-- 红1→红2 -->
  <line x1="130" y1="150" x2="150" y2="180" stroke="#000" stroke-width="2"/> <!-- 红1→白 -->
  <text x="95" y="175" font-size="10">红1</text>
  <text x="125" y="175" font-size="10">红2</text>
  <text x="145" y="175" font-size="10">白</text>

  <!-- 红2的第二次分支 -->
  <line x1="180" y1="150" x2="160" y2="180" stroke="#000" stroke-width="2"/> <!-- 红2→红1 -->
  <line x1="180" y1="150" x2="180" y2="180" stroke="#000" stroke-width="2"/> <!-- 红2→红2 -->
  <line x1="180" y1="150" x2="200" y2="180" stroke="#000" stroke-width="2"/> <!-- 红2→白 -->
  <text x="145" y="175" font-size="10">红1</text>
  <text x="175" y="175" font-size="10">红2</text>
  <text x="195" y="175" font-size="10">白</text>

  <!-- 白的第二次分支 -->
  <line x1="230" y1="150" x2="210" y2="180" stroke="#000" stroke-width="2"/> <!-- 白→红1 -->
  <line x1="230" y1="150" x2="230" y2="180" stroke="#000" stroke-width="2"/> <!-- 白→红2 -->
  <line x1="230" y1="150" x2="250" y2="180" stroke="#000" stroke-width="2"/> <!-- 白→白 -->
  <text x="195" y="175" font-size="10">红1</text>
  <text x="225" y="175" font-size="10">红2</text>
  <text x="245" y="175" font-size="10">白</text>

  <!-- 概率计算标注 -->
  <text x="50" y="195" font-size="12">总结果=3×3=9种，两次红球=4种→概率=4/9</text>
</svg></div>

**解析**：
- 手册反射："遇到概率问题→设计树状图或列表格"；
- 步骤：
  1. 画树状图：第一次摸球有3种结果（红1、红2、白），放回后第二次摸球仍有3种结果，共3×3=9种等可能结果；
  2. 找符合条件的结果：两次都是红球的情况为（红1,红1）、（红1,红2）、（红2,红1）、（红2,红2）→共4种；
  3. 算概率：概率=符合条件的结果数/总结果数=4/9。

**答案**：两次摸出的球都是红球的概率为$\frac{4}{9}$。

### 5. 其他技巧

#### 5.1 半角问题→旋转重组
**例题**：如图（下方SVG图示：Rt△ABC中∠C=90°、AC=BC，∠DCE=45°，将△BCE绕C顺时针旋转90°至△CAF，连接DF），在Rt△ABC中，∠C=90°，AC=BC，∠DCE=45°，D在AC上，E在BC上，求证：DE²=AD²+BE²。
<div><svg width="350" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠C=90°，AC=BC） -->
  <line x1="100" y1="200" x2="100" y2="80" stroke="#000" stroke-width="2"/> <!-- AC -->
  <line x1="100" y1="200" x2="220" y2="200" stroke="#000" stroke-width="2"/> <!-- BC -->
  <line x1="100" y1="80" x2="220" y2="200" stroke="#000" stroke-width="2"/> <!-- AB -->
  <line x1="90" y1="140" x2="110" y2="140" stroke="#000" stroke-width="2"/> <!-- 直角符号 -->

  <!-- 点D（AC上）、点E（BC上） -->
  <circle cx="100" cy="140" r="3" fill="#000"/> <!-- D -->
  <circle cx="160" cy="200" r="3" fill="#000"/> <!-- E -->

  <!-- 旋转△BCE至△CAF（F在左侧） -->
  <line x1="100" y1="200" x2="40" y2="200" stroke="#000" stroke-width="2" stroke-dasharray="5,3"/> <!-- AF=BE -->
  <circle cx="40" cy="200" r="3" fill="#000"/> <!-- F -->
  <line x1="40" y1="200" x2="100" y2="140" stroke="#000" stroke-width="2"/> <!-- DF -->

  <!-- 半角∠DCE=45° -->
  <line x1="100" y1="140" x2="160" y2="200" stroke="#000" stroke-width="2"/> <!-- CE -->
  <text x="120" y="170" font-size="10">∠DCE=45°</text>

  <!-- 标注文字 -->
  <text x="95" y="75" font-size="12">A</text>
  <text x="225" y="210" font-size="12">B</text>
  <text x="95" y="210" font-size="12">C</text>
  <text x="95" y="130" font-size="12">D</text>
  <text x="165" y="210" font-size="12">E</text>
  <text x="35" y="210" font-size="12">F</text>
  <text x="50" y="180" font-size="10">AF=BE</text>
  <text x="70" y="160" font-size="10">DF=DE</text>
</svg></div>

**解析**：
- 手册反射："半角问题→利用旋转重组图形，证2次全等"；
- 旋转步骤：将△BCE绕C顺时针旋转90°至△CAF，使BC与AC重合→CF=CE，AF=BE，∠FCA=∠BCE；
- 证第一次全等（旋转后）：∠FCD=∠FCA+∠ACD=∠BCE+∠ACD=90°-45°=45°=∠DCE，结合CF=CE、CD=CD→△FCD≌△ECD（SAS）→DF=DE；
- 证直角三角形：∠CAF=∠B=45°，∠CAD=45°→∠FAD=90°→△FAD是Rt△，由勾股定理得DF²=AD²+AF²；
- 替换等量：DF=DE，AF=BE→DE²=AD²+BE²。

**答案**：DE²=AD²+BE²得证。

#### 5.2 半角问题→旋转重组（补充完整）
**例题**：如图（下方SVG图示：Rt△ABC中∠C=90°，AC=BC=5，∠DCE=45°，D在AC上（AD=2），E在BC上，将△BCE绕C顺时针旋转90°至△CAF，连接DF），求DE的长度。
<div><svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
  <!-- Rt△ABC（∠C=90°，AC=BC=5） -->
  <line x1="80" y1="200" x2="80" y2="70" stroke="#000" stroke-width="2"/> <!-- AC=5（y差130，对应实际5） -->
  <line x1="80" y1="200" x2="210" y2="200" stroke="#000" stroke-width="2"/> <!-- BC=5（x差130，对应实际5） -->
  <line x1="80" y1="70" x2="210" y2="200" stroke="#000" stroke-width="2"/> <!-- AB -->
  <line x1="70" y1="135" x2="90" y2="135" stroke="#000" stroke-width="2"/> <!-- 直角符号 -->

  <!-- 顶点标注 -->
  <text x="75" y="65" font-size="12">A</text>
  <text x="215" y="210" font-size="12">B</text>
  <text x="75" y="210" font-size="12">C</text>

  <!-- 点D（AC上，AD=2→DC=3） -->
  <circle cx="80" cy="130" r="3" fill="#000"/> <!-- D：y=70+30×2=130（每30单位=1） -->
  <text x="75" y="120" font-size="12">D</text>
  <text x="50" y="100" font-size="10">AD=2，DC=3</text>

  <!-- 旋转△BCE至△CAF（F在左侧，CF=CE，AF=BE） -->
  <circle cx="80" cy="200" r="3" fill="#000"/> <!-- C -->
  <circle cx="20" cy="200" r="3" fill="#000"/> <!-- F（AF=BE，CF=CE） -->
  <line x1="20" y1="200" x2="80" y2="130" stroke="#000" stroke-width="2"/> <!-- DF -->
  <text x="15" y="210" font-size="12">F</text>
  <text x="30" y="180" font-size="10">AF=BE</text>

  <!-- 半角∠DCE=45°及DE -->
  <line x1="80" y1="130" x2="150" y2="200" stroke="#000" stroke-width="2"/> <!-- CE -->
  <line x1="150" y1="200" x2="80" y2="130" stroke="#000" stroke-width="2"/> <!-- DE -->
  <circle cx="150" cy="200" r="3" fill="#000"/> <!-- E -->
  <text x="155" y="210" font-size="12">E</text>
  <text x="110" y="160" font-size="10">∠DCE=45°</text>

  <!-- 计算标注 -->
  <text x="50" y="230" font-size="12">DF=DE，△ADF为Rt△→DF²=AD²+AF²→DE²=2²+BE²，结合BE=5-CE=5-CD=5-3=2→DE=√(2²+2²)=2√2</text>
</svg></div>

**解析**：
- 手册反射："半角问题→利用旋转重组图形，证2次全等"；
- 关键步骤：
  1. 旋转：将△BCE绕C顺时针旋转90°至△CAF→CF=CE，AF=BE=5-CE=2（因AC=BC=5，DC=3，所以CE=DC=3，BE=BC-CE=5-3=2），∠FCD=45°=∠DCE；
  2. 证全等：△FCD≌△ECD（SAS）→DF=DE；
  3. 勾股定理：∠FAD=90°（∠CAF=∠B=45°，∠CAD=45°）→DF²=AD²+AF²=2²+2²=8→DE=√8=2√2。

**答案**：DE的长度为$2\sqrt{2}$。

