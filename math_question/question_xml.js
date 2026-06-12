var question_xml = {
  "exportTime": "2026-06-12T00:00:00.000Z",
  "description": "GeoGebra XML 绘图命令",
  "questions": [
    {
      "id": 1772024076546,
      "title": "初二数学基础练习9-第28题",
      "xml": `<construction>
  <element type="point" label="A"><coords x="-2.0" y="-1.732" z="1.0"/></element>
  <element type="point" label="B"><coords x="2.0" y="-1.732" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  <element type="point" label="C"><coords x="0.0" y="1.732" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="B" a2="C"/><output a0="triangle"/></command>
  <element type="polygon" label="triangle">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="0" alpha="0.1"/>
  </element>
  <element type="point" label="P"><coords x="0.0" y="-3.464" z="1.0"/></element>
  <command name="Line"><input a0="A" a1="P"/><output a0="lineAP"/></command>
  <element type="line" label="lineAP">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="128" g="128" b="128" alpha="255"/>
  </element>
  <command name="Reflect"><input a0="C" a1="lineAP"/><output a0="D"/></command>
  <element type="point" label="D"><coords x="0.0" y="-6.928" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="D"/><output a0="segmentAD"/></command>
  <command name="Segment"><input a0="B" a1="D"/><output a0="segmentBD"/></command>
  <command name="Intersect"><input a0="segmentBD" a1="lineAP"/><output a0="E"/></command>
  <element type="point" label="E"><coords x="0.0" y="-3.464" z="1.0"/></element>
  <command name="Segment"><input a0="C" a1="E"/><output a0="segmentCE"/></command>
</construction>`
    },
    {
      "id": 1769223095655,
      "title": "2026年1月海淀区八上数学期末第26题",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="0.0" y="3.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <command name="AngleBisector"><input a0="B" a1="A" a2="C"/><output a0="bisector"/></command>
  <command name="Intersect"><input a0="bisector" a1="segmentBC"/><output a0="D"/></command>
  <element type="point" label="D"><coords x="1.2" y="2.4" z="1.0"/></element>
  <command name="Line"><input a0="A" a1="D"/><output a0="lineAD"/></command>
  <element type="line" label="lineAD">
    <show object="true" label="false"/>
    <objColor r="255" g="0" b="0" alpha="255"/>
  </element>
  <command name="PerpendicularLine"><input a0="A" a1="lineAD"/><output a0="perpLine"/></command>
  <command name="Line"><input a0="B" a1="C"/><output a0="lineBC"/></command>
  <command name="Intersect"><input a0="perpLine" a1="lineBC"/><output a0="E"/></command>
  <element type="point" label="E"><coords x="-1.8" y="3.6" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <element type="line" label="segmentAE">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="0" g="0" b="255" alpha="255"/>
  </element>
</construction>`
    },
    {
      "id": 1765804056384,
      "title": "等边三角形加轴对称",
      "xml": `<construction>
  <element type="point" label="A"><coords x="-2.0" y="-1.732" z="1.0"/></element>
  <element type="point" label="B"><coords x="2.0" y="-1.732" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  <element type="point" label="C"><coords x="0.0" y="1.732" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="B" a2="C"/><output a0="triangle"/></command>
  <element type="polygon" label="triangle">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="0" alpha="0.1"/>
  </element>
  <element type="point" label="P"><coords x="1.0" y="0.0" z="1.0"/></element>
  <command name="Line"><input a0="A" a1="P"/><output a0="lineAP"/></command>
  <element type="line" label="lineAP">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="128" g="128" b="128" alpha="255"/>
  </element>
  <command name="Reflect"><input a0="B" a1="lineAP"/><output a0="D"/></command>
  <element type="point" label="D"><coords x="0.5" y="2.598" z="1.0"/></element>
  <command name="Line"><input a0="D" a1="C"/><output a0="lineDC"/></command>
  <command name="Intersect"><input a0="lineDC" a1="lineAP"/><output a0="E"/></command>
  <element type="point" label="E"><coords x="0.0" y="1.155" z="1.0"/></element>
  <command name="Segment"><input a0="B" a1="E"/><output a0="segmentBE"/></command>
  <command name="Segment"><input a0="D" a1="E"/><output a0="segmentDE"/></command>
  <element type="line" label="segmentDE">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="128" g="128" b="128" alpha="255"/>
  </element>
</construction>`
    },
    {
      "id": 1765594225221,
      "title": "对角和为180度的四边形中三角形的周长",
      "xml": `<construction>
  <element type="point" label="A"><coords x="-2.0" y="2.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="2.0" y="2.0" z="1.0"/></element>
  <element type="point" label="D"><coords x="-2.0" y="-1.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="3.0" y="-1.5" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="B" a2="C" a3="D"/><output a0="quadrilateral"/></command>
  <element type="polygon" label="quadrilateral">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="200" alpha="0.1"/>
  </element>
  <element type="point" label="E"><coords x="2.5" y="0.5" z="1.0"/></element>
  <element type="point" label="F"><coords x="-0.5" y="-1.25" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="A" a1="F"/><output a0="segmentAF"/></command>
  <command name="Segment"><input a0="C" a1="E"/><output a0="segmentCE"/></command>
  <command name="Segment"><input a0="C" a1="F"/><output a0="segmentCF"/></command>
  <command name="Segment"><input a0="E" a1="F"/><output a0="segmentEF"/></command>
  <element type="polygon" label="triangleCEF">
    <show object="true" label="false"/>
    <objColor r="255" g="100" b="0" alpha="0.2"/>
  </element>
</construction>`
    },
    {
      "id": 1764742968821,
      "title": "2个等边三角形中的全等",
      "xml": `<construction>
  <element type="point" label="A"><coords x="-4.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="0.0" y="0.0" z="1.0"/></element>
  <expression label="F" exp="Rotate[A, 60°, C]" type="point"/>
  <element type="point" label="F"><coords x="-2.0" y="3.464" z="1.0"/></element>
  <expression label="E" exp="Rotate[B, 60°, C]" type="point"/>
  <element type="point" label="E"><coords x="2.0" y="3.464" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="C" a2="F"/><output a0="triangleACF"/></command>
  <command name="Polygon"><input a0="B" a1="C" a2="E"/><output a0="triangleBCE"/></command>
  <element type="polygon" label="triangleACF">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="0" alpha="0.1"/>
  </element>
  <element type="polygon" label="triangleBCE">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="200" alpha="0.1"/>
  </element>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="B" a1="F"/><output a0="segmentBF"/></command>
  <element type="point" label="M"><coords x="-1.0" y="1.732" z="1.0"/></element>
  <element type="point" label="N"><coords x="3.0" y="1.732" z="1.0"/></element>
  <command name="Segment"><input a0="C" a1="M"/><output a0="segmentCM"/></command>
  <command name="Segment"><input a0="C" a1="N"/><output a0="segmentCN"/></command>
  <command name="Segment"><input a0="M" a1="N"/><output a0="segmentMN"/></command>
</construction>`
    },
    {
      "id": 1764123730840,
      "title": "求证：AD平分∠BAE",
      "xml": `<construction>
  <element type="point" label="B"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="6.0" y="0.0" z="1.0"/></element>
  <element type="point" label="D"><coords x="3.0" y="0.0" z="1.0"/></element>
  <element type="point" label="A"><coords x="4.5" y="2.598" z="1.0"/></element>
  <command name="Midpoint"><input a0="D" a1="C"/><output a0="E"/></command>
  <element type="point" label="E"><coords x="4.5" y="0.0" z="1.0"/></element>
  <command name="Reflect"><input a0="A" a1="E"/><output a0="G"/></command>
  <element type="point" label="G"><coords x="4.5" y="-2.598" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <command name="Segment"><input a0="A" a1="D"/><output a0="segmentAD"/></command>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="E" a1="G"/><output a0="segmentEG"/></command>
  <command name="Segment"><input a0="D" a1="G"/><output a0="segmentDG"/></command>
  <element type="line" label="segmentAE">
    <show object="true" label="false"/>
    <objColor r="255" g="0" b="0" alpha="255"/>
  </element>
  <element type="line" label="segmentDG">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="128" g="128" b="128" alpha="255"/>
  </element>
</construction>`
    },
    {
      "id": 1758631842055,
      "title": "等腰三角形中的等腰三角形",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="5.0" y="0.0" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 30°, A]" type="point"/>
  <element type="point" label="C"><coords x="4.33" y="2.5" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <element type="point" label="D"><coords x="2.5" y="0.0" z="1.0"/></element>
  <element type="point" label="E"><coords x="3.665" y="1.25" z="1.0"/></element>
  <command name="Line"><input a0="D" a1="E"/><output a0="lineDE"/></command>
  <element type="line" label="lineDE">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="128" g="128" b="128" alpha="255"/>
  </element>
</construction>`
    },
    {
      "id": 1758592971518,
      "title": "求∠EAN的度数",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="6.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="2.0" y="4.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <command name="PerpendicularBisector"><input a0="A" a1="B"/><output a0="perpAB"/></command>
  <command name="Intersect"><input a0="perpAB" a1="segmentBC"/><output a0="E"/></command>
  <element type="point" label="E"><coords x="3.0" y="2.0" z="1.0"/></element>
  <command name="PerpendicularBisector"><input a0="A" a1="C"/><output a0="perpAC"/></command>
  <command name="Intersect"><input a0="perpAC" a1="segmentBC"/><output a0="N"/></command>
  <element type="point" label="N"><coords x="1.0" y="2.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="A" a1="N"/><output a0="segmentAN"/></command>
  <element type="line" label="segmentAE">
    <show object="true" label="false"/>
    <objColor r="255" g="0" b="0" alpha="255"/>
  </element>
  <element type="line" label="segmentAN">
    <show object="true" label="false"/>
    <objColor r="0" g="0" b="255" alpha="255"/>
  </element>
</construction>`
    },
    {
      "id": 1758186154839,
      "title": "面积为2.5的三角形",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="5.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="2.0" y="4.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <command name="AngleBisector"><input a0="C" a1="B" a2="A"/><output a0="bisectorB"/></command>
  <command name="AngleBisector"><input a0="B" a1="C" a2="A"/><output a0="bisectorC"/></command>
  <command name="Intersect"><input a0="bisectorB" a1="bisectorC"/><output a0="F"/></command>
  <element type="point" label="F"><coords x="2.5" y="1.5" z="1.0"/></element>
  <command name="AngleBisector"><input a0="B" a1="F" a2="C"/><output a0="bisectorBFC"/></command>
  <element type="line" label="bisectorBFC">
    <show object="true" label="false"/>
    <lineStyle style="9"/>
    <objColor r="255" g="0" b="0" alpha="255"/>
  </element>
  <element type="point" label="D"><coords x="3.5" y="0.0" z="1.0"/></element>
  <element type="point" label="E"><coords x="1.0" y="0.0" z="1.0"/></element>
  <command name="Segment"><input a0="B" a1="D"/><output a0="segmentBD"/></command>
  <command name="Segment"><input a0="C" a1="E"/><output a0="segmentCE"/></command>
</construction>`
    },
    {
      "id": 1758024799784,
      "title": "四边形中等腰直角三角形之外的2个三角形面积相等",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="3.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="0.0" y="3.0" z="1.0"/></element>
  <element type="point" label="D"><coords x="-2.0" y="0.0" z="1.0"/></element>
  <element type="point" label="E"><coords x="0.0" y="-2.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="D"/><output a0="segmentCD"/></command>
  <command name="Segment"><input a0="D" a1="A"/><output a0="segmentDA"/></command>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="D" a1="E"/><output a0="segmentDE"/></command>
  <command name="Segment"><input a0="B" a1="E"/><output a0="segmentBE"/></command>
  <element type="point" label="F"><coords x="3.0" y="0.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="F"/><output a0="segmentAF"/></command>
  <command name="Segment"><input a0="F" a1="E"/><output a0="segmentFE"/></command>
  <element type="polygon" label="triangleACD">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="200" alpha="0.2"/>
  </element>
  <element type="polygon" label="triangleABE">
    <show object="true" label="false"/>
    <objColor r="255" g="100" b="0" alpha="0.2"/>
  </element>
</construction>`
    },
    {
      "id": 1757678060835,
      "title": "利用全等三角形求角的度数",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="2.0" y="3.464" z="1.0"/></element>
  <element type="point" label="D"><coords x="-1.0" y="1.732" z="1.0"/></element>
  <element type="point" label="E"><coords x="5.0" y="1.732" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="A"/><output a0="segmentCA"/></command>
  <command name="Segment"><input a0="A" a1="D"/><output a0="segmentAD"/></command>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="Segment"><input a0="C" a1="D"/><output a0="segmentCD"/></command>
  <command name="Segment"><input a0="C" a1="E"/><output a0="segmentCE"/></command>
  <command name="Intersect"><input a0="segmentCD" a1="segmentBE"/><output a0="F"/></command>
  <element type="point" label="F"><coords x="2.0" y="1.732" z="1.0"/></element>
  <command name="Segment"><input a0="B" a1="E"/><output a0="segmentBE"/></command>
  <command name="Segment"><input a0="D" a1="F"/><output a0="segmentDF"/></command>
  <element type="polygon" label="triangleADC">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="200" alpha="0.1"/>
  </element>
  <element type="polygon" label="triangleABE">
    <show object="true" label="false"/>
    <objColor r="255" g="100" b="0" alpha="0.1"/>
  </element>
</construction>`
    },
    {
      "id": 1757656292855,
      "title": "求四边形面积",
      "xml": `<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="3.0" y="4.0" z="1.0"/></element>
  <element type="point" label="D"><coords x="-3.0" y="4.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="B"/><output a0="segmentAB"/></command>
  <command name="Segment"><input a0="B" a1="C"/><output a0="segmentBC"/></command>
  <command name="Segment"><input a0="C" a1="D"/><output a0="segmentCD"/></command>
  <command name="Segment"><input a0="D" a1="A"/><output a0="segmentDA"/></command>
  <command name="Segment"><input a0="A" a1="C"/><output a0="segmentAC"/></command>
  <element type="point" label="E"><coords x="-5.0" y="0.0" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="E"/><output a0="segmentAE"/></command>
  <command name="PerpendicularLine"><input a0="A" a1="segmentAC"/><output a0="perpLine"/></command>
  <command name="Line"><input a0="B" a1="C"/><output a0="lineBC"/></command>
  <command name="Intersect"><input a0="perpLine" a1="lineBC"/><output a0="E2"/></command>
  <element type="point" label="E2"><coords x="4.5" y="1.5" z="1.0"/></element>
  <command name="Segment"><input a0="A" a1="E2"/><output a0="segmentAE2"/></command>
  <command name="Segment"><input a0="E" a1="E2"/><output a0="segmentEE2"/></command>
  <element type="polygon" label="quadrilateralABCD">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="200" alpha="0.15"/>
  </element>
  <element type="polygon" label="triangleACE">
    <show object="true" label="false"/>
    <objColor r="255" g="100" b="0" alpha="0.2"/>
  </element>
</construction>`
    }
  ]
};