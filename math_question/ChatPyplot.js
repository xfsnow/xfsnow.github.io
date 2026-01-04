// 动态加载 Pyodide
function loadPyodideScript() {
  // 获取当前域名
  const hostname = window.location.hostname;
  let pyodideScriptSrc = 'pyodide/pyodide.js';
  
  // 根据域名决定加载源
  if (hostname.startsWith('www.')) {
    pyodideScriptSrc = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js';
  }
  
  // 创建 script 标签并添加到页面
  const script = document.createElement('script');
  script.src = pyodideScriptSrc;
  document.head.appendChild(script);
  
  return script;
}

// 调用函数加载 Pyodide
loadPyodideScript();

// 等待页面加载完成
window.addEventListener("load", function() {
  // 为AiBase类添加Pyplot特定的格式化和提取方法
  AiBase.formatAIResponse = function(content) {
    // 首先提取并保存所有Python代码块
    const pythonBlocks = [];
    let placeholderContent = content.replace(/```(?:\s*python\s*|\s*python\s*\n)([\s\S]*?)```/gs, (match, p1) => {
      const cleanedCode = p1.trim(); // 清理首尾空白
      pythonBlocks.push(cleanedCode);
      return `{{PYTHON_BLOCK_${pythonBlocks.length - 1}}}`;
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

    // 最后，将保存的Python代码块替换为可执行的文本区域
    formattedContent = formattedContent.replace(/\{\{PYTHON_BLOCK_(\d+)\}\}/g, (match, index) => {
      const blockContent = pythonBlocks[index];
      const lines = Math.max(blockContent.split('\n').length, 3);
      return `<textarea class="pyplot-code-block" rows="${lines}">${blockContent}</textarea><div class="pyplot-execute-container"><button class="pyplot-execute-btn" data-pyplot-execute><span class="pyplot-execute-icon"></span>执行代码</button></div>`;
    });

    return formattedContent;
  };

  AiBase.extractPythonCode = function(response) {
    const regex = /```(?:\s*python\s*|\s*python\s*\n)([\s\S]*?)```/gs;
    const codes = [];
    let match;

    while ((match = regex.exec(response)) !== null) {
      codes.push(match[1].trim());
    }

    return codes;
  };
  
  // Pyodide管理类
  class PyodideManager {
    constructor() {
      this.fontPath = '/NotoSansSC-Regular.otf'; // 字体文件路径
      this.fontUrl = 'https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Regular.otf';
      this.pyodide = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
    
    async init() {
      if (this.initPromise) {
        return this.initPromise;
      }
      
      this.initPromise = new Promise(async (resolve, reject) => {
        try {
          // 显示初始化状态
          const matplotlibContainer = document.getElementById('matplotlib-output');
          if (matplotlibContainer) {
            matplotlibContainer.innerHTML = '<div class="matplotlib-placeholder"><p>正在初始化Python环境...</p></div>';
          }
          
          // 加载Pyodide
          this.pyodide = await loadPyodide();
          
          // 安装必要的包
          await this.pyodide.loadPackage(['numpy', 'matplotlib']);
          
          // 配置matplotlib
          // 先将字体文件写入Pyodide的虚拟文件系统
          const fontPath = this.fontPath;
          try {
            const fontResponse = await fetch(this.fontUrl);
            if (fontResponse.ok) {
              const fontArrayBuffer = await fontResponse.arrayBuffer();
              const fontData = new Uint8Array(fontArrayBuffer);
              this.pyodide.FS.writeFile(fontPath, fontData);
              console.log("字体文件已写入Pyodide文件系统");
            } else {
              console.log("无法获取字体文件，状态码:", fontResponse.status);
            }
          } catch (error) {
            console.error("字体文件加载失败:", error);
          }
          
          this.pyodide.runPython(`
from io import BytesIO, StringIO
import matplotlib
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import base64
import os
import sys
matplotlib.use('Agg')

try:
    print("检查字体文件是否存在...")
    # 检查字体文件是否存在于Pyodide的虚拟文件系统中
    if os.path.exists('${fontPath}'):
        print("字体文件存在，开始加载...")
        fm.fontManager.addfont('${fontPath}')
        font_name = fm.FontProperties(fname='${fontPath}').get_name()
        plt.rcParams['font.family'] = font_name
        print(f"成功加载本地中文字体: {font_name}")
except Exception as e:
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Bitstream Vera Sans', 'Arial Unicode MS', 'sans-serif']
    print(f"字体加载失败，使用默认字体: {e}")

plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示异常

# 设置图形背景为白色
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'
plt.rcParams['savefig.facecolor'] = 'white'

# 设置字体大小，确保清晰可读
plt.rcParams['font.size'] = 12
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12

# 重定向输出
import sys
sys.stdout = StringIO()
sys.stderr = StringIO()

# 自定义显示函数
def show_plot(fig=None):
    if fig is None:
        fig = plt.gcf()
    buf = BytesIO()
    # 保存图像时明确指定背景色和DPI
    fig.savefig(buf, format='png', bbox_inches='tight', facecolor='white', edgecolor='none', dpi=100)
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    return img_str`);
          
          this.isInitialized = true;
          
          // 显示初始化完成状态
          if (matplotlibContainer) {
            matplotlibContainer.innerHTML = '<div class="matplotlib-placeholder"><p>Python环境已就绪，可以执行代码了</p></div>';
          }
          
          resolve();
        } catch (error) {
          console.error('Pyodide初始化失败:', error);
          const matplotlibContainer = document.getElementById('matplotlib-output');
          if (matplotlibContainer) {
            matplotlibContainer.innerHTML = `<div class="matplotlib-placeholder"><p>Python环境初始化失败: ${error.message}</p></div>`;
          }
          reject(error);
        }
      });
      
      return this.initPromise;
    }
    
    async runCode(code) {
      if (!this.isInitialized) {
        await this.init();
      }
      
      try {
        const fontPath = this.fontPath;
        // 在执行用户代码前，确保字体设置正确
        this.pyodide.runPython(`
# 确保每次执行代码前都设置正确的中文字体
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import os

# 检查字体文件是否存在并设置字体
if os.path.exists('${fontPath}'):
    try:
        # 检查字体是否已注册
        font_files = [f.fname for f in fm.fontManager.ttflist]
        if '${fontPath}' not in font_files:
            fm.fontManager.addfont('${fontPath}')
        font_name = fm.FontProperties(fname='${fontPath}').get_name()
        plt.rcParams['font.family'] = font_name
    except Exception as e:
        print(f"设置中文字体时出错: {e}")
        plt.rcParams['font.family'] = 'DejaVu Sans'
else:
    plt.rcParams['font.family'] = 'DejaVu Sans'
        
plt.rcParams['axes.unicode_minus'] = False`);
        
        // 执行Python代码
        await this.pyodide.runPythonAsync(code);
        
        // 检查是否有图形需要显示
        const hasFig = this.pyodide.runPython('plt.get_fignums()');
        if (hasFig.length > 0) {
          // 获取图形并显示
          const imgStr = this.pyodide.runPython('show_plot()');
          return {
            success: true,
            image: `data:image/png;base64,${imgStr}`,
            message: '代码执行成功'
          };
        } else {
          return {
            success: true,
            message: '代码执行成功（无图形输出）'
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
      this.pyodideManager = new PyodideManager();
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
      this.initPyodide();
      this.initSettings();
      this.bindElements();
      this.bindEvents();
      this.loadSettings();
    }
    
    // 初始化Pyodide
    async initPyodide() {
      try {
        await this.pyodideManager.init();
      } catch (error) {
        console.error('Pyodide初始化失败:', error);
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
      
      // 绑定聊天容器的点击事件，用于处理Python代码执行按钮
      this.chatContainer.addEventListener('click', (e) => {
        // 检查点击的是否是代码执行按钮
        if (e.target && e.target.matches('[data-pyplot-execute]')) {
          this.handleCodeExecute(e.target);
        }
      });
    }
    
    // 处理Python代码执行
    async handleCodeExecute(buttonElement) {
      // 获取包含代码的textarea元素
      const textareaElement = buttonElement.closest('.pyplot-execute-container').previousElementSibling;
      if (textareaElement && textareaElement.classList.contains('pyplot-code-block')) {
        // 执行代码
        const code = textareaElement.value;
        await this.executePythonCode(code);
      }
    }
    
    // 执行Python代码
    async executePythonCode(code) {
      const matplotlibContainer = document.getElementById('matplotlib-output');
      if (!matplotlibContainer) {
        console.error('找不到matplotlib容器');
        return;
      }
      
      try {
        // 显示执行状态
        matplotlibContainer.innerHTML = '<div class="matplotlib-placeholder"><p>正在执行Python代码...</p></div>';
        
        // 执行代码
        const result = await this.pyodideManager.runCode(code);
        
        if (result.success) {
          if (result.image) {
            // 显示图形
            matplotlibContainer.innerHTML = `<img src="${result.image}" class="matplotlib-figure" style="display: block; max-width: 100%; max-height: 100%;">`;
          } else {
            // 显示成功消息（无图形）
            matplotlibContainer.innerHTML = '<div class="matplotlib-placeholder"><p>代码执行成功（无图形输出）</p></div>';
          }
        } else {
          // 显示错误消息
          matplotlibContainer.innerHTML = `<div class="matplotlib-placeholder"><p style="color: red;">${result.message}</p></div>`;
        }
      } catch (error) {
        console.error('执行Python代码时出错:', error);
        matplotlibContainer.innerHTML = `<div class="matplotlib-placeholder"><p style="color: red;">执行出错: ${error.message}</p></div>`;
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
        const codes = AiBase.extractPythonCode(response);
        if (codes.length > 0) {
          console.log('AI响应中提取到Python代码:', codes);
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
      localStorage.setItem('pyplotCurrentModel', selectedModel);
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
      localStorage.setItem('pyplotSettings', JSON.stringify(settings));
      alert('设置已保存！');
    }

    // 加载设置从localStorage
    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('pyplotSettings')) || {};
      this.deepSeekApiKeyInput.value = settings.deepseekApiKey || '';
      this.qwenApiKeyInput.value = settings.qwenApiKey || '';
      this.azureApiKeyInput.value = settings.azureApiKey || '';
      this.azureEndpointInput.value = settings.azureEndpoint || '';
      this.azureModelInput.value = settings.azureModel || '';
      this.systemPrompt.value = settings.systemPrompt || '';
      
      // 加载当前选择的模型
      const currentModel = localStorage.getItem('pyplotCurrentModel');
      if (currentModel) {
        this.modelSelect.value = currentModel;
      }
    }
  }
  
  // 创建AppManager实例
  const appManager = new AppManager();
});