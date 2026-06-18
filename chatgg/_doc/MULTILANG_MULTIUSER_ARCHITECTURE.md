# 后端驱动多语言与多用户系统架构方案

## 一、方案概述

本方案基于现有前端单用户本地版，规划后端驱动的多语言支持与多用户系统架构。核心目标是：

- **多语言支持**：通过后端统一管理语言包，支持中英文切换
- **多用户系统**：用户认证、对话存储、跨设备同步
- **画廊分享**：优秀图形作品的公开展示与社交互动

---

## 二、后端多语言的核心优势

| 对比项 | 纯前端方案 | 后端方案 |
|--------|-----------|---------|
| **文本管理** | 硬编码在 JS/JSON | 配置文件管理，支持版本控制 |
| **用户偏好** | 存在 localStorage | 持久化到数据库，跨设备同步 |
| **扩展性** | 添加新语言需改代码 | 后台配置即可，无需发版 |
| **安全性** | 所有文本暴露在前端 | 敏感内容可后端过滤 |
| **SEO** | 单页应用，搜索引擎难抓取 | 服务端渲染，利于 SEO |

---

## 三、前后端协作架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  UI 组件层   │  │  语言切换器   │  │  API 调用层      │  │
│  │  (原生 JS)   │  │  (下拉选择)   │  │  (fetch)         │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                        │                                    │
│                        ▼                                    │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP Request (带 lang 参数)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      PHP 后端                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  路由层      │  │  语言中间件   │  │  API 控制器      │  │
│  │  (路由分发)  │  │  (解析 lang)  │  │  (业务逻辑)      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              数据库                                    │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐  │   │
│  │  │ users   │ │ chats    │ │ drawings  │ │ i18n     │  │   │
│  │  │ 语言偏好 │ │ 对话记录 │ │ 图形作品   │ │ 语言包    │  │   │
│  │  └─────────┘ └──────────┘ └───────────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、语言包配置文件设计

### 4.1 目录结构

```
backend/
├── config/
│   └── lang/
│       ├── zh.php          # 中文语言包
│       ├── en.php          # 英文语言包
│       └── index.php       # 语言加载器
└── ...
```

### 4.2 语言包文件格式

**zh.php - 中文语言包**：

```php
<?php
return [
    // 欢迎区域
    'welcome' => [
        'title' => '欢迎使用AI数学绘图助手',
        'message' => '输入数学作图需求,AI会自动帮你生成GeoGebra XML并绘制图形',
        'examples' => [
            '画一个等边三角形',
            '构造圆的切线',
            '证明勾股定理'
        ]
    ],
    
    // 按钮
    'btn' => [
        'new_chat' => '新对话',
        'search_history' => '搜索历史',
        'export_history' => '保存历史',
        'import_history' => '导入历史',
        'send' => '发送',
        'settings' => '设置',
        'save' => '保存',
        'cancel' => '取消',
        'close' => '关闭',
        'confirm' => '确定',
        'delete' => '删除'
    ],
    
    // 消息提示
    'msg' => [
        'loading' => 'AI正在思考...',
        'error' => '抱歉，发生错误：',
        'success' => '操作成功',
        'confirm_delete' => '确定要删除这个对话吗？',
        'no_history' => '暂无历史记录',
        'no_search_results' => '未找到匹配的对话记录',
        'export_success' => '成功导出 %d 条历史记录',
        'import_success' => '成功导入 %d 条历史记录',
        'no_history_to_export' => '没有历史记录可以导出',
        'please_select_image' => '请选择图片文件',
        'settings_saved' => '设置已保存',
        'settings_save_failed' => '保存设置失败，请重试'
    ],
    
    // 模态框
    'modal' => [
        'search_title' => '搜索历史记录',
        'settings_title' => '设置',
        'api_endpoint' => 'API 端点',
        'api_key' => 'API Key',
        'model_name' => '模型名称',
        'language' => '语言',
        'use_default' => '使用默认设置'
    ],
    
    // 加载动画文案
    'loading_messages' => [
        'AI正在思考...',
        '正在和数学图形斗智斗勇，马上胜利！',
        '画师 AI 在线作图，草稿变成品 ing。',
        '正在把公式变成看得见的样子',
        '数学元素正在排队入场，请耐心围观。',
        '偷偷打磨图形细节，力求完美！',
        '正在处理复杂的几何关系...',
        '努力绘制精确的图形...'
    ],
    
    // 系统提示词（多语言版本）
    'system_prompt' => '你是GeoGebra几何绘图专家。根据用户的几何作图需求，分步生成XML命令。

格式要求：
1. label属性标识对象，不用name属性
2. 点使用齐次坐标 <coords x="0.0" y="0.0" z="1.0"/>
3. 公式用<expression label="名称" exp="公式" type="类型"/>
4. 几何命令用<command name="命令"><input a0="A" a1="B"/><output a0="结果"/></command>

分步规则：
1. 先分析题目，列出绘图步骤规划（不输出XML）
2. 每步只画1-2个相关元素，输出XML后等待用户确认
3. 用户说"继续"或"下一步"后再画下一步
4. 用户可随时要求调整
5. ⚠️ 重要：每一步输出的XML必须包含**之前所有步骤的完整命令**，不是只输出当前步骤的命令

示例：
用户：画等边三角形
助手：好的，分步绘制等边三角形。

步骤规划：
1. 定义底边端点A、B
2. 旋转得到顶点C
3. 连接成三角形

第1步：定义点A(0,0)和B(4,0)
```ggb-xml
<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
</construction>
```
请确认后说"继续"。'
];
```

**en.php - 英文语言包**：

```php
<?php
return [
    'welcome' => [
        'title' => 'Welcome to AI Math Drawing Assistant',
        'message' => 'Enter math drawing requirements, AI will generate GeoGebra XML and draw the graph',
        'examples' => [
            'Draw an equilateral triangle',
            'Construct tangent to a circle',
            'Prove Pythagorean theorem'
        ]
    ],
    
    'btn' => [
        'new_chat' => 'New Chat',
        'search_history' => 'Search History',
        'export_history' => 'Export History',
        'import_history' => 'Import History',
        'send' => 'Send',
        'settings' => 'Settings',
        'save' => 'Save',
        'cancel' => 'Cancel',
        'close' => 'Close',
        'confirm' => 'Confirm',
        'delete' => 'Delete'
    ],
    
    'msg' => [
        'loading' => 'AI is thinking...',
        'error' => 'Sorry, an error occurred: ',
        'success' => 'Operation successful',
        'confirm_delete' => 'Are you sure you want to delete this chat?',
        'no_history' => 'No history records',
        'no_search_results' => 'No matching chat records found',
        'export_success' => 'Successfully exported %d history records',
        'import_success' => 'Successfully imported %d history records',
        'no_history_to_export' => 'No history records to export',
        'please_select_image' => 'Please select an image file',
        'settings_saved' => 'Settings saved',
        'settings_save_failed' => 'Failed to save settings, please try again'
    ],
    
    'modal' => [
        'search_title' => 'Search History',
        'settings_title' => 'Settings',
        'api_endpoint' => 'API Endpoint',
        'api_key' => 'API Key',
        'model_name' => 'Model Name',
        'language' => 'Language',
        'use_default' => 'Use Default Settings'
    ],
    
    'loading_messages' => [
        'AI is thinking...',
        'Solving math problems, almost there!',
        'AI artist is drawing, turning sketch into masterpiece.',
        'Transforming formulas into visual representations',
        'Math elements are queuing up, please wait.',
        'Polishing graphic details for perfection!',
        'Processing complex geometric relationships...',
        'Drawing precise figures...'
    ],
    
    'system_prompt' => 'You are a GeoGebra geometry drawing expert. Generate XML commands step by step based on user geometry drawing requirements.

Format Requirements:
1. Use label attribute to identify objects, do not use name attribute
2. Points use homogeneous coordinates <coords x="0.0" y="0.0" z="1.0"/>
3. Formulas use <expression label="Name" exp="Formula" type="Type"/>
4. Geometry commands use <command name="Command"><input a0="A" a1="B"/><output a0="Result"/></command>

Step Rules:
1. First analyze the problem, list the drawing step plan (do not output XML)
2. Draw only 1-2 related elements per step, output XML and wait for user confirmation
3. Draw the next step after user says "continue" or "next"
4. User can request adjustments at any time
5. ⚠️ Important: Each step\'s XML must contain **complete commands from all previous steps**, not just the current step

Example:
User: Draw an equilateral triangle
Assistant: OK, drawing an equilateral triangle step by step.

Step Plan:
1. Define base endpoints A and B
2. Rotate to get vertex C
3. Connect to form triangle

Step 1: Define points A(0,0) and B(4,0)
```ggb-xml
<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
</construction>
```
Please confirm and say "continue".'
];
```

### 4.3 语言加载器

**config/lang/index.php**：

```php
<?php

class LangLoader {
    private static $instance = null;
    private $currentLang = 'zh';
    private $translations = [];
    
    private function __construct() {
        $this->loadLang($this->currentLang);
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function setLang($lang) {
        if ($lang !== $this->currentLang) {
            $this->currentLang = $lang;
            $this->loadLang($lang);
        }
    }
    
    public function getLang() {
        return $this->currentLang;
    }
    
    private function loadLang($lang) {
        $langFile = __DIR__ . "/{$lang}.php";
        if (file_exists($langFile)) {
            $this->translations = require $langFile;
        } else {
            $this->translations = require __DIR__ . '/zh.php';
        }
    }
    
    public function get($key, $params = []) {
        $value = $this->getNestedValue($this->translations, $key);
        
        if ($value === null) {
            return $key;
        }
        
        if (!empty($params)) {
            $value = vsprintf($value, $params);
        }
        
        return $value;
    }
    
    private function getNestedValue($array, $key) {
        $keys = explode('.', $key);
        $value = $array;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return null;
            }
        }
        
        return $value;
    }
    
    public function getAll() {
        return $this->translations;
    }
}

function t($key, $params = []) {
    return LangLoader::getInstance()->get($key, $params);
}
```

### 4.4 使用方式

```php
// 设置语言
LangLoader::getInstance()->setLang('en');

// 获取翻译
echo t('welcome.title');           // Welcome to AI Math Drawing Assistant
echo t('btn.new_chat');            // New Chat
echo t('msg.export_success', [5]); // Successfully exported 5 history records

// 获取完整语言包（用于传递给前端）
$translations = LangLoader::getInstance()->getAll();
echo json_encode($translations);
```

### 4.5 配置文件方案优势

| 对比项 | 数据库方案 | 配置文件方案 |
|--------|-----------|-------------|
| **性能** | 需要数据库查询 | 直接读取文件，性能更好 |
| **版本控制** | 难以追踪变更 | 天然支持 Git 版本控制 |
| **部署** | 需要数据库迁移 | 随代码一起部署 |
| **修改流程** | 后台编辑或 SQL | 修改文件，提交代码 |
| **适合场景** | 频繁变更、多管理员 | 稳定、可控的翻译内容 |

---

## 五、语言切换流程

### 5.1 语言优先级

1. URL 参数：`?lang=en`
2. 用户偏好（登录后）：从数据库读取
3. 请求头：`Accept-Language`
4. 默认值：`zh`

### 5.2 三种切换模式

#### 模式 A：URL 参数模式（推荐）

```
# 访问时通过 URL 指定语言
https://yourdomain.com/?lang=en

# PHP 解析
$lang = $_GET['lang'] ?? $_SESSION['lang'] ?? 'zh';
```

#### 模式 B：Header 模式

```
# 请求头携带语言信息
Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8

# PHP 解析
$lang = parseAcceptLanguage($_SERVER['HTTP_ACCEPT_LANGUAGE']);
```

#### 模式 C：用户偏好模式（登录后）

```
# 用户登录后，从数据库读取语言偏好
$lang = $user->language_preference ?? 'zh';
```

---

## 六、前端与后端的衔接方式

### 6.1 方式一：后端渲染模板（最简单）

```php
<!-- chat.php -->
<div class="welcome-message">
  <h3><?= t('welcome.title') ?></h3>
  <p><?= t('welcome.message') ?></p>
</div>
```

**优点**：前端零改动，后端直接输出本地化 HTML
**缺点**：前后端耦合，不利于前端独立开发

### 6.2 方式二：API 返回语言包

```javascript
// 前端调用 API 获取语言包
fetch('/api/i18n?lang=en')
  .then(res => res.json())
  .then(data => {
    window.I18N = data;
    initApp();
  });

// 使用时
function t(key) {
  return window.I18N[key] || key;
}
```

**优点**：前后端分离，前端灵活性高
**缺点**：需要额外请求，首次加载稍慢

### 6.3 方式三：混合模式（推荐）

```php
<!-- 服务端输出语言包到全局变量 -->
<script>
window.I18N = <?= json_encode(getTranslations($lang)) ?>;
</script>
```

**优点**：无需额外请求，前端仍保持灵活性
**缺点**：页面初始加载体积稍大

---

## 七、多用户系统数据库设计

### 7.1 用户表

```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `language` varchar(10) DEFAULT 'zh',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### 7.2 对话表

```sql
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `messages` longtext COMMENT 'JSON 格式消息记录',
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
);
```

### 7.3 图形作品表（画廊）

```sql
CREATE TABLE `drawings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `chat_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `xml_content` longtext NOT NULL COMMENT 'GeoGebra XML',
  `preview_image` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `is_public` (`is_public`)
);
```

---

## 八、画廊分享功能设计

### 8.1 画廊页面布局

```
┌───────────────────────────────────────────────────────┐
│                    画廊页面                            │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  作品卡片   │  │  作品卡片   │  │  作品卡片   │   │
│  │  预览图     │  │  预览图     │  │  预览图     │   │
│  │  标题       │  │  标题       │  │  标题       │   │
│  │  作者       │  │  作者       │  │  作者       │   │
│  │  👍 👁️     │  │  👍 👁️     │  │  👍 👁️     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                       │
│  筛选：[最新] [最热] [我的收藏] [分类标签]              │
└───────────────────────────────────────────────────────┘
```

### 8.2 作品详情页功能

- 嵌入 GeoGebra 画板展示图形
- 显示完整对话上下文
- 提供 XML 代码复制
- 支持点赞、收藏、评论

---

## 九、系统架构演进路线

### 阶段一：单用户本地版（当前）

```
├── 前端：原生 JS + CSS
├── 数据存储：localStorage
└── AI 调用：直接调用 API
```

### 阶段二：多用户基础版

```
├── 前端：保持现有架构，增加 API 调用层
├── 后端：PHP + MySQL
├── 核心功能：用户认证、对话存储
└── 多语言：后端 API 返回本地化数据
```

### 阶段三：画廊分享版

```
├── 前端：增加画廊页面、作品详情页
├── 后端：作品管理、社交互动
└── 数据同步：定期备份到后端
```

### 阶段四：高级功能版

```
├── 前端：Vue/React 重构，组件化开发
├── 后端：Redis 缓存、消息队列
└── 增值功能：AI 绘图模板、协作编辑
```

---

## 十、关键建议

### 10.1 渐进式迁移

先保持前端不变，后端提供 API 接口，逐步将 localStorage 数据迁移到数据库。

### 10.2 语言包缓存

后端将语言包缓存到 Redis，避免每次请求都查数据库。

### 10.3 模板引擎

PHP 端使用 Twig 模板引擎，方便实现条件渲染和语言切换。

### 10.4 前端兼容

初期保留前端 `APP_CONFIG` 作为 fallback，确保后端服务不可用时仍能正常运行。

### 10.5 国际化细节

- 数字格式、日期格式根据语言自动调整
- RTL 语言（如阿拉伯语）需要特殊处理布局
- 系统提示词（systemPrompt）也需要多语言版本

### 10.6 安全考虑

- 用户密码使用 bcrypt 加密存储
- API 请求添加 CSRF 保护
- 图形作品 XML 内容需进行安全过滤，防止 XSS 攻击

---

## 十一、实施优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 用户认证系统 | 注册、登录、会话管理 |
| P0 | 对话存储 API | 将 localStorage 迁移到数据库 |
| P1 | 语言包数据库 | 创建 i18n 表，导入现有文本 |
| P1 | 语言切换接口 | 后端提供语言切换 API |
| P2 | 画廊基础功能 | 作品发布、展示、浏览 |
| P2 | 社交互动功能 | 点赞、收藏、评论 |
| P3 | 性能优化 | Redis 缓存、图片懒加载 |
| P3 | 高级功能 | AI 绘图模板、协作编辑 |
