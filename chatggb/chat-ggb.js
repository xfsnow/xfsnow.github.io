window.addEventListener("load", function() {
  AiBase.formatAIResponse = function(content) {
    const ggbBlocks = [];
    let placeholderContent = content.replace(/```(?:\s*geogebra\s*|\s*geogebra\s*\n)([\s\S]*?)```/g, (match, p1) => {
      const trimmedContent = p1.trim();
      ggbBlocks.push(trimmedContent);
      return `{{GGB_BLOCK_${ggbBlocks.length - 1}}}`;
    });

    let formattedContent = placeholderContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');

    formattedContent = formattedContent.replace(/\{\{GGB_BLOCK_(\d+)\}\}/g, (match, index) => {
      const blockContent = ggbBlocks[index];
      const lines = blockContent.split('\n').length;
      return `<textarea class="ggb-code-block" rows="${Math.max(lines, 3)}">${blockContent}</textarea><div class="ggb-execute-container"><button class="ggb-execute-btn" data-ggb-execute><span class="ggb-execute-icon"></span>执行命令</button></div>`;
    });

    return formattedContent;
  };

  AiBase.extractGgbCommands = function(response) {
    const regex = /```(?:\s*geogebra\s*|\s*geogebra\s*\n)([\s\S]*?)```/g;
    let match;
    const commands = [];

    while ((match = regex.exec(response)) !== null) {
      const commandBlock = match[1].trim();
      const commandLines = commandBlock.split('\n');
      commandLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          commands.push(trimmedLine);
        }
      });
    }

    return commands;
  };

  const SYSTEM_PROMPT = `你是一个几何学助手，可以通过GeoGebra绘制几何图形和动画。

当用户请求绘制图形或动画时，请提供：
1. 友好的解释，包括数学概念和原理
2. 清晰的GeoGebra命令

规范：
1. 将GeoGebra命令放在\`\`\`geogebra和\`\`\`标记之间，每行一个命令。
2. 不要在GeoGebra命令行添加任何注释！
3. 命令应该按照逻辑顺序排列，从基本元素到复杂构造。
4. 数学公式应该包裹在$$中
5. 只使用GeoGebra Web版本支持的英文命令名称

GeoGebra Web API支持的命令类型包括：

## 基本元素
- 点：A = (2, 3)
- 向量：v = Vector[A, B] 或 v = (1, 2)
- 线段：Segment(A, B)
- 直线：Line(A, B)
- 射线：Ray(A, B)
- 圆：Circle(A, r) 或 Circle(A, B) 或 Circle(A, B, C)
- 椭圆：Ellipse(F1, F2, a)
- 多边形：Polygon(A, B, C, …)
- 中点：Midpoint(A, B)
- 垂直平分线：PerpendicularBisector(A, B)
- 角平分线：AngleBisector(A, B, C)
- 交点：Intersection(object1, object2)
- 垂线：Perpendicular(line, point)
- 平行线：Parallel(line, point)
- 距离：Distance(point1, point2)
- 角度：Angle(A, B, C)
- 三角形中心：TriangleCenter(A, B, C, n)，其中n是Kimberling数字

## 三角形中心Kimberling数字：
- X(1) = Incenter（内心，内切圆圆心）
- X(2) = Centroid（重心）
- X(3) = Circumcenter（外心，外接圆圆心）
- X(4) = Orthocenter（垂心）
- X(5) = Nine-point center（九点圆圆心）

## 函数和曲线
- 斜率：Slope(line)
- 函数：f(x) = x^2 + 2x + 1

## 动画和交互
- 滑块：a = Slider[0, 10, 0.1]
- 启动/停止动画：StartAnimation[a, true] 或 StartAnimation[a, false]
- 设置动画速度：SetAnimationSpeed(object, speed)
- 条件显示对象：SetConditionToShowObject(object, condition)
- 设置轨迹：SetTrace(object, true) 或 SetTrace(object, false)
- 轨迹曲线：Locus(point, parameter)

## 高级功能
- 序列：Sequence(expression, variable, from, to, step)
- 列表：{a, b, c}
- 条件表达式：If(condition, then, else)
- 文本对象：Text("文本", (x, y))

## 常用几何构造示例

### 1. 构造三角形及其外心和外接圆：
  A = (1, 2)
  B = (-2, -1)
  C = (4, 0)
  Polygon(A, B, C)
  O = TriangleCenter(A, B, C, 3)
  c1 = Circle(O, A)

### 2. 构造三角形的内心和内切圆：
  A = (1, 2)
  B = (-2, -1)
  C = (4, 0)
  Polygon(A, B, C)
  I = TriangleCenter(A, B, C, 1)
  c2 = Circle(I, Distance(I, Segment(A, B)))

### 3. 同时绘制三角形的外心和内心：
  A = (1, 2)
  B = (-2, -1)
  C = (4, 0)
  Polygon(A, B, C)
  O = TriangleCenter(A, B, C, 3)
  I = TriangleCenter(A, B, C, 1)
  Circle(O, A)
  Circle(I, Distance(I, Segment(A, B)))

### 4. 创建滑块并用于动画：
  a = Slider[0, 10, 0.1]
  P = (a, 0)
  StartAnimation[a, true]

### 5. 圆上运动的点：
  a = Slider[0, 2π, 0.01]
  P = (5 cos(a), 5 sin(a))
  Circle((0, 0), 5)
  StartAnimation[a, true]

### 6. 函数图像的动态变化：
  a = Slider[0, 5, 0.1]
  f(x) = a x^2
  StartAnimation[a, true]

## 重要提示：
- 使用 TriangleCenter(A, B, C, n) 获取三角形中心，n为Kimberling数字
- X(1)用于内心，X(3)用于外心
- 内切圆半径通过 Distance(I, Segment(A, B)) 计算
- 所有命令必须使用英文名称

请确保命令语法正确，并在解释中提及每个命令的目的。
如果用户的请求不明确，请提出澄清问题。
用户的请求可能与之前提出的请求相关。`;

  class GGBManager {
    constructor() {
      this.ggbApp = null;
      this.sendBtn = null;
      this.userInput = null;
      this.chatContainer = null;
      this.providerNameInput = null;
      this.apiEndpointInput = null;
      this.apiKeyInput = null;
      this.modelNameInput = null;
      this.settingsBtn = null;
      this.settingsPanel = null;
      this.closeSettingsBtn = null;
      this.saveSettingsBtn = null;
      this.imageAttachmentBtn = null;

      this.init();
    }

    init() {
      this.initGGBApplet();
      this.initSettings();
      this.bindElements();
      this.bindEvents();
      this.loadSettings();
    }

    initGGBApplet() {
      this.ggbApp = new GGBApplet({
        "width": 600,
        "height": 600,
        "showToolBar": true,
        "showAlgebraInput": false,
        "showMenuBar": true,
        "allowStyleBar": true,
        "language": "zh",
        "showAlgebraView": false,
        "perspective": "G"
      }, true);
      this.ggbApp.inject('ggb-element');
    }

    initSettings() {
      const settingsBtn = document.getElementById('settings-btn');
      const closeSettingsBtn = document.getElementById('close-settings');
      const settingsPanel = document.getElementById('settings-panel');

      settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('active');
      });

      closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
      });
    }

    bindElements() {
      this.sendBtn = document.getElementById('send-btn');
      this.userInput = document.getElementById('user-input');
      this.chatContainer = document.getElementById('chat-container');

      this.providerNameInput = document.getElementById('provider-name');
      this.apiEndpointInput = document.getElementById('api-endpoint');
      this.apiKeyInput = document.getElementById('api-key');
      this.modelNameInput = document.getElementById('model-name');

      this.settingsBtn = document.getElementById('settings-btn');
      this.settingsPanel = document.getElementById('settings-panel');
      this.closeSettingsBtn = document.getElementById('close-settings');
      this.saveSettingsBtn = document.getElementById('save-settings');
      this.imageAttachmentBtn = document.getElementById('image-attachment-btn');
    }

    bindEvents() {
      if (this.imageAttachmentBtn) {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        this.imageAttachmentBtn.addEventListener('click', () => {
          this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            alert('仅支持 JPG/PNG/GIF/WEBP 格式图片！');
            this.fileInput.value = '';
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            alert('图片大小不能超过10MB！');
            this.fileInput.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            AiBase.prototype.selectedImageBase64 = event.target.result;
            this.showImagePreview(AiBase.prototype.selectedImageBase64);
          };
          reader.readAsDataURL(file);
        });
      }

      const closePreviewBtn = document.getElementById('close-preview');
      if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
          this.hideImagePreview();
          if (this.fileInput) {
            this.fileInput.value = '';
          }
        });
      }

      this.sendBtn.addEventListener('click', () => this.sendMessage());

      this.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.settingsBtn.addEventListener('click', () => {
        this.settingsPanel.classList.add('active');
      });

      this.closeSettingsBtn.addEventListener('click', () => {
        this.settingsPanel.classList.remove('active');
      });

      this.saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
        this.settingsPanel.classList.remove('active');
      });

      this.chatContainer.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[data-ggb-execute]')) {
          this.handleGgbExecute(e.target);
        }
      });
    }

    handleGgbExecute(buttonElement) {
      const textareaElement = buttonElement.closest('.ggb-execute-container').previousElementSibling;
      if (textareaElement && textareaElement.classList.contains('ggb-code-block')) {
        this.executeCommandsFromTextarea(textareaElement);
      }
    }

    executeCommandsFromTextarea(textareaElement) {
      const app = window.ggbApplet;

      if (app) {
        try {
          app.reset();
        } catch (e) {
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }

      const commands = textareaElement.value.split('\n');

      commands.forEach((command) => {
        command = command.trim();
        if (command) {
          try {
            app.evalCommand(command);
          } catch (e) {
            console.error('执行命令出错: ' + command, e);
          }
        }
      });
    }

    executeCommands() {
      const app = window.ggbApplet;

      if (app) {
        try {
          app.reset();
        } catch (e) {
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }

      const commands = this.commandArea.value.split('\n');

      commands.forEach((command) => {
        command = command.trim();
        if (command) {
          try {
            app.evalCommand(command);
          } catch (e) {
            console.error('执行命令出错: ' + command, e);
          }
        }
      });
    }

    showImagePreview(imageData) {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      const previewImage = document.getElementById('image-preview');

      if (imageData && previewWrapper && previewImage) {
        previewImage.src = imageData;
        previewWrapper.classList.add('active');
      }
    }

    hideImagePreview() {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      if (previewWrapper) {
        previewWrapper.classList.remove('active');
      }
    }

    sendMessage() {
      const message = this.userInput.value.trim();
      if (!message && !AiBase.prototype.selectedImageBase64) return;

      this.displayUserMessage(message, AiBase.prototype.selectedImageBase64);

      this.userInput.value = '';
      const tempImage = AiBase.prototype.selectedImageBase64;
      AiBase.prototype.selectedImageBase64 = null;
      this.hideImagePreview();
      if (this.fileInput) {
        this.fileInput.value = '';
      }

      const providerName = this.providerNameInput.value.trim();
      const apiEndpoint = this.apiEndpointInput.value.trim();
      const apiKey = this.apiKeyInput.value.trim();
      const modelName = this.modelNameInput.value.trim();

      if (!providerName) {
        this.displayMessage('请先输入模型供应方', 'ai');
        return;
      }
      if (!apiEndpoint) {
        this.displayMessage('请先输入接入端点', 'ai');
        return;
      }
      if (!apiKey) {
        this.displayMessage('请先输入API密钥', 'ai');
        return;
      }
      if (!modelName) {
        this.displayMessage('请先输入模型名称', 'ai');
        return;
      }

      const chatHistory = this.getChatHistory();

      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
        chatHistory.pop();
      }

      console.log('创建流式消息');
      const streamingMessageDiv = this.createStreamingMessage();
      console.log('流式消息创建成功:', streamingMessageDiv);

      console.log('创建AI客户端');
      const aiClient = new OpenAICompatibleAI(apiKey, SYSTEM_PROMPT, chatHistory, apiEndpoint, modelName, providerName);
      aiClient.callAPI(
        message,
        (content, sender, isThinking) => {
          this.updateStreamingMessage(streamingMessageDiv, content);
        },
        (response) => {
          if (streamingMessageDiv) {
            streamingMessageDiv.classList.remove('ai-thinking');
          }
          const commands = AiBase.extractGgbCommands(response);
          if (commands.length > 0) {
            console.log('GeoGebra commands extracted:', commands);
          }
        },
        (error) => {
          if (streamingMessageDiv && streamingMessageDiv.parentNode) {
            streamingMessageDiv.parentNode.removeChild(streamingMessageDiv);
            streamingMessageDiv = null;
          }
          this.displayMessage(error, 'ai');
        },
        tempImage
      );
    }

    createStreamingMessage() {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'ai-message', 'ai-thinking');
      messageDiv.innerHTML = '<div class="typing-indicator">AI正在思考...</div>';
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }

    updateStreamingMessage(messageDiv, content) {
      console.log('更新流式消息, 内容长度:', content.length);
      messageDiv.innerHTML = AiBase.formatAIResponse(content);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    displayUserMessage(text, imageBase64 = null) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'user-message');

      let content = `<p>${text || "(无文本消息)"}</p>`;
      if (imageBase64) {
        content += `<img src="${imageBase64}" class="image-preview" alt="用户上传图片" style="max-width: 200px; max-height: 200px; margin-top: 10px; border-radius: 4px;">`;
      }

      messageDiv.innerHTML = content;
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }

    displayMessage(message, sender, isThinking = false) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender + '-message');
      if (isThinking) {
        messageDiv.classList.add('ai-thinking');
      }

      if (sender === 'ai') {
        messageDiv.innerHTML = AiBase.formatAIResponse(message);
      } else {
        messageDiv.textContent = message;
      }

      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }

    getChatHistory() {
      const messages = this.chatContainer.querySelectorAll('.message');
      const history = [];

      messages.forEach((messageDiv) => {
        if (messageDiv.classList.contains('ai-thinking')) {
          return;
        }

        if (messageDiv.classList.contains('user-message')) {
          const textContent = messageDiv.querySelector('p').textContent;

          let content = [{ type: "text", text: textContent }];

          if (content.length === 1 && content[0].type === "text") {
            history.push({ role: 'user', content: content[0].text });
          } else {
            history.push({ role: 'user', content: content });
          }
        } else if (messageDiv.classList.contains('ai-message')) {
          const textContent = messageDiv.textContent;
          history.push({ role: 'assistant', content: textContent });
        }
      });

      return history;
    }

    saveSettings() {
      const settings = {
        providerName: this.providerNameInput.value,
        apiEndpoint: this.apiEndpointInput.value,
        apiKey: this.apiKeyInput.value,
        modelName: this.modelNameInput.value
      };
      localStorage.setItem('ggbOpenAISettings', JSON.stringify(settings));
      alert('设置已保存！');
    }

    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('ggbOpenAISettings')) || {};
      this.providerNameInput.value = settings.providerName || '';
      this.apiEndpointInput.value = settings.apiEndpoint || '';
      this.apiKeyInput.value = settings.apiKey || '';
      this.modelNameInput.value = settings.modelName || '';
    }
  }

  const ggbManager = new GGBManager();
});