// 等待页面加载完成
window.addEventListener("load", function() {
  // AI基类
  class AiBase {
    constructor(apiKey, systemMessage, chatHistory) {
      this.apiKey = apiKey;
      this.systemMessage = systemMessage;
      this.chatHistory = chatHistory;
      this.selectedImageBase64 = null; // 存储选中的图片Base64编码
    }
    
    // 将图片文件转换为 base64 字符串
    imageFileToBase64(imageFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // 移除 Data URL 的前缀 "data:image/...;base64," 只保留纯 base64 编码
          resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
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
    
    // 构造用户消息内容（支持文本和图片）
    constructUserContent(userMessage, imageBase64 = null) {
      if (imageBase64) {
        // 如果有图片，则创建多部分消息
        return [
          { type: "text", text: userMessage },
          { 
            type: "image_url", 
            image_url: {
              url: imageBase64
            }
          }
        ];
      } else {
        // 没有图片，就是纯文本
        return userMessage;
      }
    }
    
    // 格式化AI响应内容
    static formatAIResponse(content) {
      // 首先提取并保存所有SVG代码块
      const svgBlocks = [];
      let placeholderContent = content.replace(/```(?:\s*svg\s*|\s*svg\s*\n)([\s\S]*?)```/gs, (match, p1) => {
        const cleanedCode = p1.trim(); // 清理首尾空白
        svgBlocks.push(cleanedCode);
        return `{{SVG_BLOCK_${svgBlocks.length - 1}}}`;
      });

      // 对非代码部分进行HTML转义
      let formattedContent = placeholderContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // 处理其他Markdown语法
      formattedContent = formattedContent
        .replace(/```([\s\S]*?)```/gs, '<pre><code>$1</code></pre>') // 普通代码块
        .replace(/`([^`]+)`/g, '<code>$1</code>') // 行内代码
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
        .replace(/\n/g, '<br>'); // 换行

      // 最后，将保存的SVG代码块替换为可执行的文本区域
      formattedContent = formattedContent.replace(/\{\{SVG_BLOCK_(\d+)\}\}/g, (match, index) => {
        const blockContent = svgBlocks[index];
        const lines = Math.max(blockContent.split('\n').length, 3);
        return `<textarea class="svg-code-block" rows="${lines}">${blockContent}</textarea><div class="svg-execute-container"><button class="svg-execute-btn" data-svg-execute><span class="svg-execute-icon"></span>执行代码</button></div>`;
      });

      return formattedContent;
    }

    // 提取SVG代码
    static extractSvgCode(response) {
      const regex = /```(?:\s*svg\s*|\s*svg\s*\n)([\s\S]*?)```/gs;
      const codes = [];
      let match;

      while ((match = regex.exec(response)) !== null) {
        codes.push(match[1].trim());
      }

      return codes;
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
    constructor(apiKey, systemMessage, chatHistory) {
      super(apiKey, systemMessage, chatHistory);
      this.endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1";
      this.model = "qwen3-vl-plus";
    }
    
    async callAPI(userMessage, onUpdate, onComplete, onError, imageBase64 = null) {
      // 显示思考过程消息
      const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = this.constructMessages();

      // 准备用户消息内容
      let userContent;
      if (imageBase64) {
        userContent = this.constructUserContent(userMessage, imageBase64);
      } else {
        userContent = this.constructUserContent(userMessage);
      }
      messages.push({ role: 'user', content: userContent });
      
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
    
    callAPI(userMessage, onUpdate, onComplete, onError, imageBase64 = null) {
      // 显示思考过程消息
      const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
      
      // 构造消息数组
      const messages = this.constructMessages();
      
      // 准备用户消息内容
      const userContent = this.constructUserContent(userMessage, imageBase64);
      messages.push({ role: 'user', content: userContent });
      
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
          model: "gpt-4o", // 指定模型名称
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
                  let content = '';
                  if (parsed.choices && parsed.choices.length > 0) {
                    const choice = parsed.choices[0];
                    if (choice.delta && choice.delta.content) {
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
  
  // SVG管理类
  class SvgManager {
    constructor() {
      this.svgContainer = null;
      this.isInitialized = false;
    }
    
    init() {
      this.svgContainer = document.getElementById('svg-output');
      if (this.svgContainer) {
        this.svgContainer.innerHTML = '<div class="svg-placeholder"><p>SVG环境已就绪，可以执行代码了</p></div>';
        this.isInitialized = true;
      }
    }
    
    runCode(code) {
      if (!this.isInitialized) {
        this.init();
      }
      
      try {
        // 显示执行状态
        this.svgContainer.innerHTML = '<div class="svg-placeholder"><p>正在执行SVG代码...</p></div>';
        
        // 创建一个临时的div来解析SVG代码
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = code;
        
        // 检查是否包含有效的SVG元素
        const svgElement = tempDiv.querySelector('svg');
        if (svgElement) {
          // 清空容器并添加SVG元素
          this.svgContainer.innerHTML = '';
          this.svgContainer.appendChild(svgElement);
          return {
            success: true,
            message: '代码执行成功'
          };
        } else {
          return {
            success: false,
            message: '代码中未找到有效的SVG元素'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: `代码执行出错: ${error.message}`
        };
      }
    }
  }
  
  // 应用管理类
  class AppManager {
    constructor() {
      this.svgManager = new SvgManager();
      this.executeBtn = null;
      this.sendBtn = null;
      this.userInput = null;
      this.chatContainer = null;
      this.modelSelect = null;
      this.systemPrompt = null;
      this.azureEndpointInput = null;
      this.azureModelInput = null;
      this.settingsBtn = null;
      this.settingsPanel = null;
      this.closeSettingsBtn = null;
      this.saveSettingsBtn = null;
      this.imageAttachmentBtn = null;
      
      this.init();
    }
    
    // 初始化方法
    init() {
      this.initSvg();
      this.initSettings();
      this.bindElements();
      this.bindEvents();
      this.loadSettings();
    }
    
    // 初始化SVG
    initSvg() {
      try {
        this.svgManager.init();
      } catch (error) {
        console.error('SVG初始化失败:', error);
      }
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
      
      // 绑定聊天容器的点击事件，用于处理SVG代码执行按钮
      this.chatContainer.addEventListener('click', (e) => {
        // 检查点击的是否是代码执行按钮
        if (e.target && e.target.matches('[data-svg-execute]')) {
          this.handleCodeExecute(e.target);
        }
      });
    }
    
    // 处理SVG代码执行
    handleCodeExecute(buttonElement) {
      // 获取包含代码的textarea元素
      const textareaElement = buttonElement.closest('.svg-execute-container').previousElementSibling;
      if (textareaElement && textareaElement.classList.contains('svg-code-block')) {
        // 执行代码
        const code = textareaElement.value;
        this.executeSvgCode(code);
      }
    }
    
    // 执行SVG代码
    executeSvgCode(code) {
      const svgContainer = document.getElementById('svg-output');
      if (!svgContainer) {
        console.error('找不到SVG容器');
        return;
      }
      
      try {
        // 显示执行状态
        svgContainer.innerHTML = '<div class="svg-placeholder"><p>正在执行SVG代码...</p></div>';
        
        // 执行代码
        const result = this.svgManager.runCode(code);
        
        if (result.success) {
          // 成功执行，图形已显示
          console.log('SVG代码执行成功');
        } else {
          // 显示错误消息
          svgContainer.innerHTML = `<div class="svg-placeholder"><p style="color: red;">${result.message}</p></div>`;
        }
      } catch (error) {
        console.error('执行SVG代码时出错:', error);
        svgContainer.innerHTML = `<div class="svg-placeholder"><p style="color: red;">执行出错: ${error.message}</p></div>`;
      }
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
      
      // 创建通用的API调用完成回调函数
      const handleApiComplete = (response) => {
        this.displayMessage(response, 'ai');
        const codes = AiBase.extractSvgCode(response);
        if (codes.length > 0) {
          console.log('AI响应中提取到SVG代码:', codes);
        }
      };

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
            handleApiComplete,
            (error) => this.displayMessage(error, 'ai'),
            tempImage // 传递图片数据
          );
          break;
        case 'qwen-max':
          const qwenAI = new AiQwen(apiKey, systemMessage, chatHistory);
          qwenAI.callAPI(
            message,
            (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
            handleApiComplete,
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
            handleApiComplete,
            (error) => this.displayMessage(error, 'ai')
          );
          break;
      }
      
      // 保存当前选择的模型
      localStorage.setItem('svgCurrentModel', selectedModel);
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
      } else if (sender === 'ai' && isThinking) {
        // 对于思考中的消息，也进行格式化处理
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
      localStorage.setItem('svgSettings', JSON.stringify(settings));
      alert('设置已保存！');
    }

    // 加载设置从localStorage
    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('svgSettings')) || {};
      this.deepSeekApiKeyInput.value = settings.deepseekApiKey || '';
      this.qwenApiKeyInput.value = settings.qwenApiKey || '';
      this.azureApiKeyInput.value = settings.azureApiKey || '';
      this.azureEndpointInput.value = settings.azureEndpoint || '';
      this.azureModelInput.value = settings.azureModel || '';
      this.systemPrompt.value = settings.systemPrompt || '';
      
      // 加载当前选择的模型
      const currentModel = localStorage.getItem('svgCurrentModel');
      if (currentModel) {
        this.modelSelect.value = currentModel;
      }
    }
  }
  
  // 创建AppManager实例
  const appManager = new AppManager();
});