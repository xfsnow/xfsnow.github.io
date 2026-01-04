// 等待 GeoGebra 应用加载完成
window.addEventListener("load", function() {
  // 为AiBase类添加GeoGebra特定的格式化和提取方法
  AiBase.formatAIResponse = function(content) {
    // 先处理GeoGebra代码块，将其替换为占位符
    const ggbBlocks = [];
    let placeholderContent = content.replace(/```(?:\s*geogebra\s*|\s*geogebra\s*\n)([\s\S]*?)```/g, (match, p1) => {
      // 去除代码块内容前后的空白字符，但保留内部结构和换行符
      const trimmedContent = p1.trim();
      ggbBlocks.push(trimmedContent);
      return `{{GGB_BLOCK_${ggbBlocks.length - 1}}}`;
    });
    
    // 转义HTML特殊字符
    let formattedContent = placeholderContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 处理普通代码块 ``` ... ```（在GeoGebra代码块恢复之前）
    formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理行内代码 `...`
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 处理加粗 **...**
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理换行（在恢复GeoGebra代码块之前应用）
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // 恢复GeoGebra代码块为textarea（在所有格式化之后）
    formattedContent = formattedContent.replace(/\{\{GGB_BLOCK_(\d+)\}\}/g, (match, index) => {
      const blockContent = ggbBlocks[index];
      // 计算行数以设置合适的行高
      const lines = blockContent.split('\n').length;
      // 直接将内容放入textarea的value中，确保命令立即显示
      return `<textarea class="ggb-code-block" rows="${Math.max(lines, 3)}">${blockContent}</textarea><div class="ggb-execute-container"><button class="ggb-execute-btn" data-ggb-execute><span class="ggb-execute-icon"></span>执行命令</button></div>`;
    });
    
    return formattedContent;
  };
  
  // 提取GeoGebra命令
  AiBase.extractGgbCommands = function(response) {
    // 使用正则表达式提取```geogebra和```之间的内容，允许geogebra关键字和代码块标记之间有换行符
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
  
  // GeoGebra应用管理类
  class GGBManager {
    constructor() {
      this.ggbApp = null;
      this.executeBtn = null;
      this.commandArea = null;
      this.sendBtn = null;
      this.userInput = null;
      this.chatContainer = null;
      this.apiKeyInput = null;
      this.modelSelect = null;
      this.systemPrompt = null;
      this.azureEndpointInput = null;
      this.azureModelInput = null;
      this.qwenEndpointInput = null;
      this.qwenModelInput = null;
      this.settingsBtn = null;
      this.settingsPanel = null;
      this.closeSettingsBtn = null;
      this.saveSettingsBtn = null;
      this.imageAttachmentBtn = null;
      
      this.init();
    }
    
    // 初始化方法
    init() {
      this.initGGBApplet();
      this.initSettings();
      this.bindElements();
      this.bindEvents();
      this.loadSettings();
    }
    
    // 初始化GeoGebra应用
    initGGBApplet() {
      // 默认视图不显示"代数区"
      this.ggbApp = new GGBApplet({
        "width": 600,
        "height": 600,
        "showToolBar": true,
        "showAlgebraInput": false,
        "showMenuBar": true,
        "allowStyleBar": true,
        "language": "zh",
        "showAlgebraView": false,  // 明确隐藏代数视图
        "perspective": "G"  // 只显示图形视图(Geometry)
      }, true);
      this.ggbApp.inject('ggb-element');
    }

    // 初始化设置面板
    initSettings() { 
      // 获取设置面板相关元素
      const settingsBtn = document.getElementById('settings-btn');
      const closeSettingsBtn = document.getElementById('close-settings');
      const settingsPanel = document.getElementById('settings-panel');
      
      // 显示设置面板
      settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('active');
      });
      
      // 隐藏设置面板
      closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
      });
    }
    
    // 绑定DOM元素
    bindElements() {
      this.executeBtn = document.getElementById('execute-btn');
      this.commandArea = document.getElementById('ggb-commands');
      this.sendBtn = document.getElementById('send-btn');
      this.userInput = document.getElementById('user-input');
      this.chatContainer = document.getElementById('chat-container');
      this.modelSelect = document.getElementById('model-select');
      this.systemPrompt = document.getElementById('system-prompt');
      
      // 各模型专用API密钥输入框
      this.deepSeekApiKeyInput = document.getElementById('deepseek-api-key');
      this.qwenApiKeyInput = document.getElementById('qwen-api-key');
      this.azureApiKeyInput = document.getElementById('azure-api-key');
      
      // Azure OpenAI特定输入框
      this.azureEndpointInput = document.getElementById('azure-endpoint');
      this.azureModelInput = document.getElementById('azure-model');
      
      // 通义千问特定输入框
      this.qwenEndpointInput = document.getElementById('qwen-endpoint');
      this.qwenModelInput = document.getElementById('qwen-model');
      
      this.settingsBtn = document.getElementById('settings-btn');
      this.settingsPanel = document.getElementById('settings-panel');
      this.closeSettingsBtn = document.getElementById('close-settings');
      this.saveSettingsBtn = document.getElementById('save-settings');
      this.imageAttachmentBtn = document.getElementById('image-attachment-btn');
    }
    
    // 绑定事件
    bindEvents() {
      // 图片附件按钮事件
      if (this.imageAttachmentBtn) {
        // 创建隐藏的文件输入元素
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        // 绑定图片附件按钮点击事件
        this.imageAttachmentBtn.addEventListener('click', () => {
          this.fileInput.click();
        });

        // 处理文件选择
        this.fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // 校验图片格式和大小 (最大10MB)
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

          // 读取图片并转为Base64
          const reader = new FileReader();
          reader.onload = (event) => {
            // 存储选中的图片Base64编码到AiBase类中
            AiBase.prototype.selectedImageBase64 = event.target.result;
            // 显示图片预览
            this.showImagePreview(AiBase.prototype.selectedImageBase64);
          };
          reader.readAsDataURL(file);
        });
      }

      // 绑定关闭预览按钮事件
      const closePreviewBtn = document.getElementById('close-preview');
      if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
          this.hideImagePreview();
          if (this.fileInput) {
            this.fileInput.value = '';
          }
        });
      }

      this.sendBtn = document.getElementById('send-btn');
      this.sendBtn.addEventListener('click', () => this.sendMessage());

      // 修改为支持多行文本框的回车发送逻辑
      this.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // 设置面板事件
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
      
      // 绑定聊天容器的点击事件，用于处理GeoGebra执行按钮
      this.chatContainer.addEventListener('click', (e) => {
        // 检查点击的是否是GeoGebra执行按钮
        if (e.target && e.target.matches('[data-ggb-execute]')) {
          this.handleGgbExecute(e.target);
        }
      });
    }
    
    // 处理GeoGebra命令执行
    handleGgbExecute(buttonElement) {
      // 获取包含代码的textarea元素
      const textareaElement = buttonElement.closest('.ggb-execute-container').previousElementSibling;
      if (textareaElement && textareaElement.classList.contains('ggb-code-block')) {
        // 直接执行 textarea 中的命令，而不是先填充到主命令区域
        this.executeCommandsFromTextarea(textareaElement);
      }
    }
    
    // 从指定的 textarea 执行 GeoGebra 命令
    executeCommandsFromTextarea(textareaElement) {
      // 获取 GeoGebra 应用实例
      const app = window.ggbApplet;
      
      // 清空画板上的所有对象
      if (app) {
        try {
          app.reset();
        } catch (e) {
          // 如果reset方法不可用，尝试使用其他方式清空
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }
      
      // 从 textarea 获取命令并执行
      const commands = textareaElement.value.split('\n');
      
      // 逐行执行命令
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
    
    // 执行GeoGebra命令（从主命令区域）
    executeCommands() {
      // 检查主命令区域是否存在
      if (!this.commandArea) {
        console.warn('主命令区域不存在');
        return;
      }
      
      // 获取 GeoGebra 应用实例
      const app = window.ggbApplet;
      
      // 清空画板上的所有对象
      if (app) {
        try {
          app.reset();
        } catch (e) {
          // 如果reset方法不可用，尝试使用其他方式清空
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }
      
      // 执行新命令
      const commands = this.commandArea.value.split('\n');
      
      // 逐行执行命令
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
    
    // 显示图片预览
    showImagePreview(imageData) {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      const previewImage = document.getElementById('image-preview');
      
      if (imageData && previewWrapper && previewImage) {
        previewImage.src = imageData;
        previewWrapper.classList.add('active');
      }
    }
    
    // 隐藏图片预览
    hideImagePreview() {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      if (previewWrapper) {
        previewWrapper.classList.remove('active');
      }
    }
    
    // 发送消息到AI
    sendMessage() {
      const message = this.userInput.value.trim();
      // 注意：这里暂时保留原来的图片检查逻辑，实际图片处理已移至AI类中
      if (!message && !AiBase.prototype.selectedImageBase64) return; // 文本和图片都为空时不发送
      
      // 显示用户消息到界面（包含图片）
      this.displayUserMessage(message, AiBase.prototype.selectedImageBase64);
      
      // 清空输入框和图片选择
      this.userInput.value = '';
      const tempImage = AiBase.prototype.selectedImageBase64; // 临时存储图片
      AiBase.prototype.selectedImageBase64 = null;
      this.hideImagePreview(); // 隐藏图片预览
      if (this.fileInput) {
        this.fileInput.value = '';
      }
      
      // 获取当前选择的模型
      const selectedModel = this.modelSelect.value;
      
      // 根据选择的模型获取对应的API密钥
      let apiKey = '';
      switch (selectedModel) {
        case 'deepseek':
          apiKey = this.deepSeekApiKeyInput.value.trim();
          break;
        case 'qwen-max':
          apiKey = this.qwenApiKeyInput.value.trim();
          break;
        case 'azure-openai':
          apiKey = this.azureApiKeyInput.value.trim();
          break;
        default:
          apiKey = this.apiKeyInput.value.trim(); // 备用通用API密钥输入框
      }
      
      if (!apiKey) {
        this.displayMessage('请先输入API密钥', 'ai');
        return;
      }
      
      // 获取系统提示语
      const systemMessage = this.systemPrompt.value.trim();
      
      // 构造对话历史（不包含刚刚发送的用户消息）
      const chatHistory = this.getChatHistory();
      
      // 移除最后一条用户消息（因为这是刚刚添加的，避免重复发送）
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
        chatHistory.pop();
      }
      
      // 根据选择的模型调用相应的API
      switch (selectedModel) {
        case 'azure-openai':
          // 检查Azure OpenAI必需的参数
          const azureEndpoint = this.azureEndpointInput.value.trim();
          const azureModel = this.azureModelInput.value.trim();
          if (!azureEndpoint) {
            this.displayMessage('请先输入Azure OpenAI访问端点', 'ai');
            return;
          }
          if (!azureModel) {
            this.displayMessage('请先输入模型名称', 'ai');
            return;
          }
          
          const azureAI = new AiAzureOpenAI(apiKey, systemMessage, chatHistory, azureEndpoint, azureModel);
          azureAI.callAPI(
            message,
            (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
            (response) => {
              this.displayMessage(response, 'ai');
              // 提取GeoGebra命令并填充到命令区域
              const commands = AiBase.extractGgbCommands(response);
              if (commands.length > 0) {
                // 不再需要填充主命令区域
                console.log('GeoGebra commands extracted:', commands);
              }
            },
            (error) => this.displayMessage(error, 'ai'),
            tempImage // 传递图片数据
          );
          break;
        case 'qwen-max':
          const qwenAI = new AiQwen(apiKey, systemMessage, chatHistory);
          qwenAI.callAPI(
            message,
            (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
            (response) => {
              this.displayMessage(response, 'ai');
              console.log('API response:', response);
              // 提取GeoGebra命令并填充到命令区域
              const commands = AiBase.extractGgbCommands(response);
              console.log('GeoGebra commands parsed:', commands);
            },
            (error) => this.displayMessage(error, 'ai'),
            tempImage // 传递图片数据
          );
          break;
        case 'deepseek':
        default:
          const deepSeekAI = new AiDeepSeek(apiKey, systemMessage, chatHistory);
          deepSeekAI.callAPI(
            message,
            (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
            (response) => {
              this.displayMessage(response, 'ai');
              // 提取GeoGebra命令并填充到命令区域
              const commands = AiBase.extractGgbCommands(response);
              if (commands.length > 0) {
                // 不再需要填充主命令区域
                console.log('GeoGebra命令提取完成:', commands);
              }
            },
            (error) => this.displayMessage(error, 'ai')
          );
          break;
      }
      
      // 保存当前选择的模型
      localStorage.setItem('ggbCurrentModel', selectedModel);
    }
    
    // 显示用户消息（包括可能的图片）
    displayUserMessage(text, imageBase64 = null) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'user-message');
      
      // 拼接内容：文本 + 图片（如有）
      let content = `<p>${text || "(无文本消息)"}</p>`;
      if (imageBase64) {
        content += `<img src="${imageBase64}" class="image-preview" alt="用户上传图片" style="max-width: 200px; max-height: 200px; margin-top: 10px; border-radius: 4px;">`;
      }
      
      messageDiv.innerHTML = content;
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }
    
    // 显示消息
    displayMessage(message, sender, isThinking = false) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender + '-message');
      if (isThinking) {
        messageDiv.classList.add('ai-thinking');
      }
      
      // 如果是AI消息且不是思考中状态，则格式化内容
      if (sender === 'ai' && !isThinking) {
        messageDiv.innerHTML = AiBase.formatAIResponse(message);
      } else {
        messageDiv.textContent = message;
      }
      
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }
    
    // 获取对话历史
    getChatHistory() {
      const messages = this.chatContainer.querySelectorAll('.message');
      const history = [];
      
      messages.forEach((messageDiv) => {
        // 不包含正在思考中的消息
        if (messageDiv.classList.contains('ai-thinking')) {
          return;
        }
        
        if (messageDiv.classList.contains('user-message')) {
          // 对于用户消息，我们需要检查是否包含图片
          const textContent = messageDiv.querySelector('p').textContent;
          const imgElement = messageDiv.querySelector('img');
          
          // 构造用户消息内容
          let content = [{ type: "text", text: textContent }];
          if (imgElement) {
            // 注意：由于历史记录中的图片无法恢复原始Base64数据，这里仅保留文本
            // 在实际应用中，可能需要将图片数据存储在其他地方
          }
          
          // 如果只包含文本，则简化为字符串形式（保持与原来兼容）
          if (content.length === 1 && content[0].type === "text") {
            history.push({ role: 'user', content: content[0].text });
          } else {
            history.push({ role: 'user', content: content });
          }
        } else if (messageDiv.classList.contains('ai-message')) {
          // 对于AI消息，获取纯文本内容（去除HTML标签）
          const textContent = messageDiv.textContent;
          history.push({ role: 'assistant', content: textContent });
        }
      });
      
      return history;
    }
    
    // 保存设置到localStorage
    saveSettings() {
      const settings = {
        deepseekApiKey: this.deepSeekApiKeyInput.value,
        qwenApiKey: this.qwenApiKeyInput.value,
        azureApiKey: this.azureApiKeyInput.value,
        azureEndpoint: this.azureEndpointInput.value,
        azureModel: this.azureModelInput.value,
        systemPrompt: this.systemPrompt.value
      };
      localStorage.setItem('ggbSettings', JSON.stringify(settings));
      alert('设置已保存！');
    }

    // 加载设置从localStorage
    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('ggbSettings')) || {};
      this.deepSeekApiKeyInput.value = settings.deepseekApiKey || '';
      this.qwenApiKeyInput.value = settings.qwenApiKey || '';
      this.azureApiKeyInput.value = settings.azureApiKey || '';
      this.azureEndpointInput.value = settings.azureEndpoint || '';
      this.azureModelInput.value = settings.azureModel || '';
      this.systemPrompt.value = settings.systemPrompt || '';
      
      // 加载当前选择的模型
      const currentModel = localStorage.getItem('ggbCurrentModel');
      if (currentModel) {
        this.modelSelect.value = currentModel;
      }
    }
  }
  
  // 创建GGBManager实例
  const ggbManager = new GGBManager();
});