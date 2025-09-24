// 等待 GeoGebra 应用加载完成
window.addEventListener("load", function() {
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
      
      this.init();
    }
    
    // 初始化方法
    init() {
      this.initGGBApplet();
      this.bindElements();
      this.bindEvents();
    }
    
    // 初始化GeoGebra应用
    initGGBApplet() {
      this.ggbApp = new GGBApplet({
        "width": 600,
        "height": 600,
        "showToolBar": true,
        "showAlgebraInput": true,
        "showMenuBar": true,
        "allowStyleBar": true,
        "language": "zh"
      }, true);
      this.ggbApp.inject('ggb-element');
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
          this.callAzureOpenAIAPI(message, apiKey, systemMessage, chatHistory, azureEndpoint, azureModel);
          break;
        case 'openai':
          this.callOpenAIAPI(message, apiKey, systemMessage, chatHistory);
          break;
        case 'deepseek':
        default:
          this.callDeepSeekAPI(message, apiKey, systemMessage, chatHistory);
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
      messageDiv.textContent = message;
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
          history.push({ role: 'assistant', content: messageDiv.textContent });
        }
      });
      
      return history;
    }
    
    // 调用DeepSeek API
    callDeepSeekAPI(userMessage, apiKey, systemMessage, chatHistory) {
      // 显示思考过程消息
      const thinkingMessage = this.displayMessage('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      
      // 添加历史对话
      messages.push(...chatHistory);
      
      // 添加当前用户消息
      messages.push({ role: 'user', content: userMessage });
      
      // 发送请求到DeepSeek API
      fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
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
                this.chatContainer.removeChild(thinkingMessage);
              }
              this.displayMessage(fullResponse, 'ai');
              
              // 提取GeoGebra命令并填充到命令区域
              this.extractAndFillGgbCommands(fullResponse);
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
                    // 更新思考消息内容
                    thinkingMessage.textContent = fullResponse;
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
              this.chatContainer.removeChild(thinkingMessage);
            }
            this.displayMessage('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          this.chatContainer.removeChild(thinkingMessage);
        }
        this.displayMessage('错误: ' + error.message, 'ai');
      });
    }
    
    // 调用OpenAI API
    callOpenAIAPI(userMessage, apiKey, systemMessage, chatHistory) {
      // 显示思考过程消息
      const thinkingMessage = this.displayMessage('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      
      // 添加历史对话
      messages.push(...chatHistory);
      
      // 添加当前用户消息
      messages.push({ role: 'user', content: userMessage });
      
      // 发送请求到OpenAI API
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
                this.chatContainer.removeChild(thinkingMessage);
              }
              this.displayMessage(fullResponse, 'ai');
              
              // 提取GeoGebra命令并填充到命令区域
              this.extractAndFillGgbCommands(fullResponse);
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
                    // 更新思考消息内容
                    thinkingMessage.textContent = fullResponse;
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
              this.chatContainer.removeChild(thinkingMessage);
            }
            this.displayMessage('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          this.chatContainer.removeChild(thinkingMessage);
        }
        this.displayMessage('错误: ' + error.message, 'ai');
      });
    }
    
    // 调用Azure OpenAI API
    callAzureOpenAIAPI(userMessage, apiKey, systemMessage, chatHistory, endpoint, deployment) {
      // 显示思考过程消息
      const thinkingMessage = this.displayMessage('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = [];
      if (systemMessage) {
        messages.push({ role: 'system', content: systemMessage });
      }
      
      // 添加历史对话
      messages.push(...chatHistory);
      
      // 添加当前用户消息
      messages.push({ role: 'user', content: userMessage });
      
      // 确保端点URL以斜杠结尾，并构建完整的API URL
      let fullEndpoint = endpoint;
      if (!endpoint.endsWith('/')) {
        fullEndpoint = endpoint + '/';
      }
      // 构建正确的Azure OpenAI API URL
      fullEndpoint += `openai/deployments/${deployment}/chat/completions?api-version=2025-01-01-preview`;
      
      // 发送请求到Azure OpenAI API
      fetch(fullEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
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
                this.chatContainer.removeChild(thinkingMessage);
              }
              this.displayMessage(fullResponse, 'ai');
              
              // 提取GeoGebra命令并填充到命令区域
              this.extractAndFillGgbCommands(fullResponse);
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
                    // 更新思考消息内容
                    thinkingMessage.textContent = fullResponse;
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
              this.chatContainer.removeChild(thinkingMessage);
            }
            this.displayMessage('错误: ' + error.message, 'ai');
          });
        };
        
        // 开始读取流
        readStream();
      })
      .catch(error => {
        // 移除思考消息
        if (thinkingMessage.parentNode) {
          this.chatContainer.removeChild(thinkingMessage);
        }
        this.displayMessage('错误: ' + error.message, 'ai');
      });
    }
    
    // 提取并填充GeoGebra命令
    extractAndFillGgbCommands(response) {
      // 使用正则表达式提取```geogebra和```之间的内容
      const regex = /```geogebra([\s\S]*?)```/g;
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
      
      if (commands.length > 0) {
        this.commandArea.value = commands.join('\n');
      }
    }
  }
  
  // 创建GGBManager实例
  const ggbManager = new GGBManager();
});