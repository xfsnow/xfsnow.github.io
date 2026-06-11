var ggbApp;

function initGeoGebra() {
    try {
        var container = document.getElementById('ggb-element');
        var height = container.offsetHeight || 500;
        
        var parameters = {
            "appName": "classic",
            "width": container.offsetWidth,
            "height": height,
            "borderColor": "#FFFFFF",
            "borderRadius": "8px",
            "showToolBar": true,
            "showAlgebraInput": false,
            "showMenuBar": true,
            "allowStyleBar": true,
            "enable3d": false,
            "perspective": "D",
            "appletOnLoad": function(api) {
                window.ggbApp = api;
                console.log("GeoGebra applet loaded successfully");
                logMessage("GeoGebra 画板初始化完成");
                
                setTimeout(function() {
                    api.evalCommand('SetViewDirection(Vector((0, 0, 1)))');
                    api.evalCommand('ZoomIn(1.5)');
                }, 500);
            },
            "errorDialogsActive": true,
            "language": "zh-CN"
        };
        
        var applet = new GGBApplet(parameters, true);
        applet.inject('ggb-element');
        
    } catch (error) {
        logMessage("初始化失败: " + error.message);
    }
}

function logMessage(message) {
    var outputLog = document.getElementById('outputLog');
    var timestamp = new Date().toLocaleTimeString();
    outputLog.innerHTML += "[" + timestamp + "] " + message + "<br>";
    outputLog.scrollTop = outputLog.scrollHeight;
}

function clearLog() {
    document.getElementById('outputLog').innerHTML = "";
}

function executeXML() {
    var xmlInput = document.getElementById('xmlInput').value;
    
    if (!xmlInput.trim()) {
        logMessage("错误：请输入 XML 命令");
        return;
    }
    
    try {
        ggbApp.evalXML(xmlInput);
        logMessage("XML 命令执行成功");
    } catch (error) {
        logMessage("执行失败: " + error.message);
    }
}

function clearCanvas() {
    try {
        ggbApp.reset();
        logMessage("画布已清空");
    } catch (error) {
        logMessage("清空失败: " + error.message);
    }
}

function loadExample() {
    var xmlContent = `
<construction>
  <!-- 1. 创建等边三角形ABC -->
  <element type="point" label="A"><coords x="-3.0" y="-2.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="3.0" y="-2.0" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  
  <!-- 2. 创建外侧直线AP -->
  <element type="point" label="P"><coords x="0.0" y="-5.0" z="1.0"/></element>
  <command name="Line"><input a0="A" a1="P"/><output a0="lineAP"/></command>
  
  <!-- 3. 创建对称点D -->
  <command name="Reflection"><input a0="C" a1="lineAP"/><output a0="D"/></command>
  
  <!-- 4. 连接线段AD、BD、CE -->
  <command name="Segment"><input a0="A" a1="D"/><output a0="segAD"/></command>
  <command name="Segment"><input a0="B" a1="D"/><output a0="segBD"/></command>
  
  <!-- 5. 求交点E -->
  <command name="Intersection"><input a0="segBD" a1="lineAP"/><output a0="E"/></command>
  
  <!-- 6. 连接CE -->
  <command name="Segment"><input a0="C" a1="E"/><output a0="segCE"/></command>
  
  <!-- 美化设置 -->
  <element type="polygon" label="triangle1">
    <show object="true" label="true"/>
    <objColor r="0" g="0" b="255"/>
  </element>
  <element type="segment" label="segAD">
    <show object="true" label="true"/>
    <objColor r="255" g="0" b="0"/>
  </element>
  <element type="segment" label="segBD">
    <show object="true" label="true"/>
    <objColor r="255" g="165" b="0"/>
  </element>
  <element type="segment" label="segCE">
    <show object="true" label="true"/>
    <objColor r="0" g="128" b="0"/>
    <lineStyle type="dashed"/>
  </element>
  <element type="line" label="lineAP">
    <show object="true" label="true"/>
    <objColor r="128" g="128" b="128"/>
    <lineStyle type="dashed"/>
  </element>
  
  <!-- 设置视图范围 -->
  <view>
    <boundingBox xmin="-8" xmax="8" ymin="-8" ymax="8"/>
  </view>
</construction>
    `.trim();
    
    document.getElementById('xmlInput').value = xmlContent;
    clearLog();
    
    try {
        ggbApp.reset();
        ggbApp.evalXML(xmlContent);
        logMessage("示例图形加载成功");
        logMessage("已创建：等边三角形ABC、直线AP、对称点D、线段AD、BD、CE");
    } catch (error) {
        logMessage("加载示例失败: " + error.message);
    }
}

function setupEventListeners() {
    document.getElementById('executeBtn').addEventListener('click', executeXML);
    document.getElementById('loadExample').addEventListener('click', loadExample);
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
}

function onWindowLoad() {
    setTimeout(function() {
        initGeoGebra();
        setupEventListeners();
    }, 100);
}

if (document.readyState === 'loading') {
    window.addEventListener('load', onWindowLoad);
} else {
    onWindowLoad();
}