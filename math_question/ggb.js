// 等待 GeoGebra 应用加载完成
window.addEventListener("load", function() {
  // AI基类
  class AiBase {
    constructor(apiKey, systemMessage, chatHistory) {
      this.apiKey = apiKey;
      this.systemMessage = systemMessage;
      this.chatHistory = chatHistory;
    }
    
    // 构造消息数组
    constructMessages() {
      const messages = [];
      if (this.systemMessage) {
        messages.push({ role: 'system', content: this.systemMessage });
      }
      messages.push(...this.chatHistory);
      return messages;
    }
    
    // 格式化AI响应内容
    static formatAIResponse(content) {
      // 先处理GeoGebra代码块，将其替换为占位符
      const ggbBlocks = [];
      let placeholderContent = content.replace(/```geogebra([\s\S]*?)```/g, (match, p1) => {
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
      
      // 处理普通代码块 ``` ... ```
      formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
      
      // 处理行内代码 `...`
      formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // 处理加粗 **...**
      formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // 处理换行
      formattedContent = formattedContent.replace(/\n/g, '<br>');
      
      // 恢复GeoGebra代码块为textarea
      formattedContent = formattedContent.replace(/\{\{GGB_BLOCK_(\d+)\}\}/g, (match, index) => {
        const blockContent = ggbBlocks[index];
        return `<textarea class="ggb-code-block" rows="5">${blockContent}</textarea><div class="ggb-execute-container"><button class="ggb-execute-btn" data-ggb-execute><span class="ggb-execute-icon"></span>执行全部命令</button></div>`;
      });
      
      return formattedContent;
    }
    
    // 提取GeoGebra命令
    static extractGgbCommands(response) {
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
    }
  }
  
  // DeepSeek AI类
  class AiDeepSeek extends AiBase {
    callAPI(userMessage, onUpdate, onComplete, onError) {
      // 显示思考过程消息
      const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = this.constructMessages();
      messages.push({ role: 'user', content: userMessage });
      
      // 发送请求到DeepSeek API
      fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          stream: true  // 启用流式传输
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('API请求失败: ' + response.status);
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';
        
        // 递归读取流数据
        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，移除思考消息，显示完整响应
              if (thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
              }
              onComplete(fullResponse, 'ai');
              return;
            }
            
            // 解码数据
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            // 处理每个数据行
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    fullResponse += content;
                    // 更新思考消息内容，使用innerHTML来支持HTML格式
                    thinkingMessage.innerHTML = AiBase.formatAIResponse(fullResponse);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            });
            
            // 继续读取流
            readStream();
          }).catch(error => {
            // 移除思考消息
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onError('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          thinkingMessage.parentNode.removeChild(thinkingMessage);
        }
        onError('错误: ' + error.message, 'ai');
      });
    }
  }
  
  // 通义千问 AI类
  class AiQwen extends AiBase {
    constructor(apiKey, systemMessage, chatHistory, endpoint, model) {
      super(apiKey, systemMessage, chatHistory);
      this.endpoint = endpoint;
      this.model = model;
    }
    
    callAPI(userMessage, onUpdate, onComplete, onError) {
      // 显示思考过程消息
      const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = this.constructMessages();
      messages.push({ role: 'user', content: userMessage });
      
      // 发送请求到通义千问 API
      fetch(this.endpoint + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey,
          'X-DashScope-SSE': 'enable'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('API请求失败: ' + response.status);
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';
        
        // 递归读取流数据
        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，移除思考消息，显示完整响应
              if (thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
              }
              onComplete(fullResponse, 'ai');
              return;
            }
            
            // 解码数据
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            // 处理每个数据行
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  // 修复：正确提取Qwen模型的内容，兼容不同响应格式
                  let content = '';
                  if (parsed.choices && parsed.choices[0]) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content !== undefined) {
                      content = choice.delta.content;
                    } else if (choice.message && choice.message.content) {
                      content = choice.message.content;
                    }
                  }
                  
                  if (content) {
                    fullResponse += content;
                    // 更新思考消息内容，使用innerHTML来支持HTML格式
                    thinkingMessage.innerHTML = AiBase.formatAIResponse(fullResponse);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            });
            
            // 继续读取流
            readStream();
          }).catch(error => {
            // 移除思考消息
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onError('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          thinkingMessage.parentNode.removeChild(thinkingMessage);
        }
        onError('错误: ' + error.message, 'ai');
      });
    }
  }
  
  // Azure OpenAI AI类
  class AiAzureOpenAI extends AiBase {
    constructor(apiKey, systemMessage, chatHistory, endpoint, deployment) {
      super(apiKey, systemMessage, chatHistory);
      this.endpoint = endpoint;
      this.deployment = deployment;
    }
    
    callAPI(userMessage, onUpdate, onComplete, onError) {
      // 显示思考过程消息
      const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = this.constructMessages();
      messages.push({ role: 'user', content: userMessage });
      
      // 确保端点URL以斜杠结尾，并构建完整的API URL
      let fullEndpoint = this.endpoint;
      if (!this.endpoint.endsWith('/')) {
        fullEndpoint = this.endpoint + '/';
      }
      // 构建正确的Azure OpenAI API URL
      fullEndpoint += `openai/deployments/${this.deployment}/chat/completions?api-version=2025-01-01-preview`;
      
      // 发送请求到Azure OpenAI API
      fetch(fullEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: messages,
          max_tokens: 6553,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
          stream: true  // 启用流式传输
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('API请求失败: ' + response.status);
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';
        
        // 递归读取流数据
        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 流结束，移除思考消息，显示完整响应
              if (thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
              }
              onComplete(fullResponse, 'ai');
              return;
            }
            
            // 解码数据
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            // 处理每个数据行
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
                  if (content) {
                    fullResponse += content;
                    // 更新思考消息内容，使用innerHTML来支持HTML格式
                    thinkingMessage.innerHTML = AiBase.formatAIResponse(fullResponse);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            });
            
            // 继续读取流
            readStream();
          }).catch(error => {
            // 移除思考消息
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onError('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          thinkingMessage.parentNode.removeChild(thinkingMessage);
        }
        onError('错误: ' + error.message, 'ai');
      });
    }
  }
  
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
      
      // 模型选择变化时的处理逻辑
      document.getElementById('model-select').addEventListener('change', function() {
        const azureSection = document.getElementById('azure-section');
        const qwenSection = document.getElementById('qwen-section');
        
        // 隐藏所有特定模型的输入区域
        azureSection.style.display = 'none';
        qwenSection.style.display = 'none';
        
        // 根据选择显示相应的输入区域
        if (this.value === 'azure-openai') {
          azureSection.style.display = 'block';
        } else if (this.value === 'qwen-max') {
          qwenSection.style.display = 'block';
        }
      });
      
      // 保存设置按钮点击事件
      document.getElementById('save-settings').addEventListener('click', () => {
        // 这里可以添加保存设置的逻辑，例如存储到 localStorage
        alert('设置已保存！');
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
      this.apiKeyInput = document.getElementById('api-key');
      this.modelSelect = document.getElementById('model-select');
      this.systemPrompt = document.getElementById('system-prompt');
      this.azureEndpointInput = document.getElementById('azure-endpoint');
      this.azureModelInput = document.getElementById('azure-model');
      this.qwenEndpointInput = document.getElementById('qwen-endpoint');
      this.qwenModelInput = document.getElementById('qwen-model');
      this.settingsBtn = document.getElementById('settings-btn');
      this.settingsPanel = document.getElementById('settings-panel');
      this.closeSettingsBtn = document.getElementById('close-settings');
      this.saveSettingsBtn = document.getElementById('save-settings');
    }
    
    // 绑定事件
    bindEvents() {
      this.executeBtn.addEventListener('click', () => this.executeCommands());
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
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
      
      // 模型选择变化时的处理逻辑
      this.modelSelect.addEventListener('change', () => {
        const azureSection = document.getElementById('azure-section');
        const qwenSection = document.getElementById('qwen-section');
        
        // 隐藏所有特定模型的输入区域
        azureSection.style.display = 'none';
        qwenSection.style.display = 'none';
        
        // 根据选择显示相应的输入区域
        if (this.modelSelect.value === 'azure-openai') {
          azureSection.style.display = 'block';
        } else if (this.modelSelect.value === 'qwen-max') {
          qwenSection.style.display = 'block';
        }
        
        // 加载当前模型的配置
        this.loadModelSettings(this.modelSelect.value);
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
        // 将代码填充到主命令区域
        this.commandArea.value = textareaElement.value;
        
        // 执行命令
        this.executeCommands();
      }
    }
    
    // 执行GeoGebra命令
    executeCommands() {
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
    
    // 发送消息到AI
    sendMessage() {
      const message = this.userInput.value.trim();
      if (!message) return;
      
      // 显示用户消息
      this.displayMessage(message, 'user');
      this.userInput.value = '';
      
      // 获取API密钥
      const apiKey = this.apiKeyInput.value.trim();
      if (!apiKey) {
        this.displayMessage('请先输入API密钥', 'ai');
        return;
      }
      
      // 获取系统提示语
      const systemMessage = this.systemPrompt.value.trim();
      
      // 构造对话历史
      const chatHistory = this.getChatHistory();
      
      // 根据选择的模型调用相应的API
      const selectedModel = this.modelSelect.value;
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
                this.commandArea.value = commands.join('\n');
              }
            },
            (error) => this.displayMessage(error, 'ai')
          );
          break;
        case 'qwen-max':
          // 检查通义千问必需的参数
          const qwenEndpoint = this.qwenEndpointInput.value.trim();
          const qwenModel = this.qwenModelInput.value.trim();
          if (!qwenEndpoint) {
            this.displayMessage('请先输入通义千问访问端点', 'ai');
            return;
          }
          if (!qwenModel) {
            this.displayMessage('请先输入模型名称', 'ai');
            return;
          }
          
          const qwenAI = new AiQwen(apiKey, systemMessage, chatHistory, qwenEndpoint, qwenModel);
          qwenAI.callAPI(
            message,
            (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
            (response) => {
              this.displayMessage(response, 'ai');
              console.log('response:', response);
              // 提取GeoGebra命令并填充到命令区域
              const commands = AiBase.extractGgbCommands(response);
              console.log('commands:', commands);
              if (commands.length > 0) {
                this.commandArea.value = commands.join('\n');
              }
            },
            (error) => this.displayMessage(error, 'ai')
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
                this.commandArea.value = commands.join('\n');
              }
            },
            (error) => this.displayMessage(error, 'ai')
          );
          break;
      }
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
          history.push({ role: 'user', content: messageDiv.textContent });
        } else if (messageDiv.classList.contains('ai-message')) {
          // 对于AI消息，获取纯文本内容（去除HTML标签）
          const textContent = messageDiv.textContent;
          history.push({ role: 'assistant', content: textContent });
        }
      });
      
      return history;
    }
    
    // 保存当前模型设置到localStorage
    saveSettings() {
      const currentModel = this.modelSelect.value;
      const modelSettings = {
        apiKey: this.apiKeyInput.value,
        systemPrompt: this.systemPrompt.value
      };
      
      // 根据模型类型保存特定设置
      switch (currentModel) {
        case 'azure-openai':
          modelSettings.azureEndpoint = this.azureEndpointInput.value;
          modelSettings.azureModel = this.azureModelInput.value;
          break;
        case 'qwen-max':
          modelSettings.qwenEndpoint = this.qwenEndpointInput.value;
          modelSettings.qwenModel = this.qwenModelInput.value;
          break;
      }
      
      // 获取现有的模型设置
      let allSettings = {};
      const existingSettings = localStorage.getItem('ggbModelSettings');
      if (existingSettings) {
        try {
          allSettings = JSON.parse(existingSettings);
        } catch (e) {
          console.error('解析现有设置失败:', e);
        }
      }
      
      // 更新当前模型的设置
      allSettings[currentModel] = modelSettings;
      
      // 保存到localStorage
      localStorage.setItem('ggbModelSettings', JSON.stringify(allSettings));
      
      // 保存当前选择的模型
      localStorage.setItem('ggbCurrentModel', currentModel);
    }
    
    // 加载指定模型的设置
    loadModelSettings(model) {
      const settingsStr = localStorage.getItem('ggbModelSettings');
      if (settingsStr) {
        try {
          const allSettings = JSON.parse(settingsStr);
          const modelSettings = allSettings[model];
          
          if (modelSettings) {
            // 加载通用设置
            if (modelSettings.apiKey) this.apiKeyInput.value = modelSettings.apiKey;
            if (modelSettings.systemPrompt) this.systemPrompt.value = modelSettings.systemPrompt;
            
            // 根据模型类型加载特定设置
            switch (model) {
              case 'azure-openai':
                if (modelSettings.azureEndpoint) this.azureEndpointInput.value = modelSettings.azureEndpoint;
                if (modelSettings.azureModel) this.azureModelInput.value = modelSettings.azureModel;
                break;
              case 'qwen-max':
                if (modelSettings.qwenEndpoint) this.qwenEndpointInput.value = modelSettings.qwenEndpoint;
                if (modelSettings.qwenModel) this.qwenModelInput.value = modelSettings.qwenModel;
                break;
            }
          }
        } catch (e) {
          console.error('加载模型设置失败:', e);
        }
      }
    }
    
    // 从localStorage加载设置（页面初始化时调用）
    loadSettings() {
      // 先加载上次选择的模型
      const lastSelectedModel = localStorage.getItem('ggbCurrentModel');
      if (lastSelectedModel) {
        this.modelSelect.value = lastSelectedModel;
      }
      
      const currentModel = this.modelSelect.value;
      this.loadModelSettings(currentModel);
      
      // 触发模型选择变化事件，显示对应的输入区域
      const event = new Event('change');
      this.modelSelect.dispatchEvent(event);
    }
  }
  
  // 创建GGBManager实例
  const ggbManager = new GGBManager();
});