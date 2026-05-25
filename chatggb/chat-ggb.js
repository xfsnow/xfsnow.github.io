class ChatGGB {
  constructor() {
    this.currentChatId = null;
    this.messages = [];
    this.ggbInstances = new Map();
    this.currentGgbId = 0;
    this.maxRetryCount = 2;
    this.ggbReady = false;
    this.currentAssistantMessage = null;
    
    this.initElements();
    this.preloadGeoGebra();
    this.loadHistory();
    this.bindEvents();
  }
  
  preloadGeoGebra() {
    this.showLoadingState();
    
    const script = document.createElement('script');
    script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      this.initializePreloadGGB();
    };
    script.onerror = () => {
      this.showLoadError();
    };
    document.head.appendChild(script);
  }
  
  initializePreloadGGB() {
    // 创建预加载画板实例
    const preloadApp = new GGBApplet({
      "width": 100,
      "height": 100,
      "showToolBar": false,
      "showAlgebraInput": false,
      "showMenuBar": false,
      "allowStyleBar": false,
      "language": "zh",
      "showAlgebraView": false,
      "perspective": "G",
      "appName": "classic"
    }, true);
    
    preloadApp.onLoad = () => {
      // 预加载完成，销毁临时画板
      setTimeout(() => {
        try {
          const container = document.getElementById('ggb-preload-container');
          if (container) {
            container.innerHTML = '';
          }
        } catch (e) {
          console.log('清理预加载容器失败:', e);
        }
        
        this.ggbReady = true;
        this.hideLoadingState();
      }, 500);
    };
    
    preloadApp.inject('ggb-preload');
  }
  
  showLoadingState() {
    this.chatContainer.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载 GeoGebra...</p>
        <p class="loading-hint">这可能需要几秒钟，请耐心等待</p>
      </div>
    `;
    this.sendBtn.disabled = true;
    this.userInput.disabled = true;
  }
  
  hideLoadingState() {
    this.chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🎨</div>
        <h3>欢迎使用AI几何绘图助手</h3>
        <p>输入几何作图需求，AI会自动帮你生成GeoGebra命令并绘制图形</p>
        <div class="welcome-examples">
          <span class="example-tag">画一个等边三角形</span>
          <span class="example-tag">构造圆的切线</span>
          <span class="example-tag">证明勾股定理</span>
        </div>
      </div>
    `;
    this.sendBtn.disabled = false;
    this.userInput.disabled = false;
  }
  
  showLoadError() {
    this.chatContainer.innerHTML = `
      <div class="error-container">
        <div class="error-icon">❌</div>
        <p>GeoGebra 加载失败</p>
        <p>请检查网络连接或稍后重试</p>
        <button onclick="window.location.reload()" class="retry-btn">🔄 刷新重试</button>
      </div>
    `;
  }
  
  initElements() {
    this.chatContainer = document.getElementById('chat-container');
    this.userInput = document.getElementById('user-input');
    this.sendBtn = document.getElementById('send-btn');
    this.chatTitle = document.getElementById('chat-title');
    this.historyList = document.getElementById('history-list');
    this.newChatBtn = document.getElementById('new-chat-btn');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsPanel = document.getElementById('settings-panel');
    this.closeSettingsBtn = document.getElementById('close-settings');
    this.saveSettingsBtn = document.getElementById('save-settings');
    this.exampleTags = document.querySelectorAll('.example-tag');
  }
  
  bindEvents() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.newChatBtn.addEventListener('click', () => this.newChat());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    
    this.exampleTags.forEach(tag => {
      tag.addEventListener('click', () => {
        this.userInput.value = tag.textContent;
        this.sendMessage();
      });
    });
    
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
  }
  
  newChat() {
    this.currentChatId = null;
    this.messages = [];
    this.chatTitle.textContent = '新对话';
    this.chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-icon">🎨</div>
        <h3>欢迎使用AI几何绘图助手</h3>
        <p>输入几何作图需求，AI会自动帮你生成GeoGebra命令并绘制图形</p>
        <div class="welcome-examples">
          <span class="example-tag">画一个等边三角形</span>
          <span class="example-tag">构造圆的切线</span>
          <span class="example-tag">证明勾股定理</span>
        </div>
      </div>
    `;
    
    // 移除所有历史项的active状态
    document.querySelectorAll('.history-item').forEach(item => {
      item.classList.remove('active');
    });
  }
  
  async sendMessage() {
    if (!this.ggbReady) {
      alert('GeoGebra 正在加载中，请稍候...');
      return;
    }
    
    const message = this.userInput.value.trim();
    if (!message) return;
    
    // 清空输入框
    this.userInput.value = '';
    
    // 如果是新对话，生成标题
    if (!this.currentChatId) {
      this.currentChatId = Date.now().toString();
      const title = this.generateTitle(message);
      this.chatTitle.textContent = title;
      
      // 移除欢迎消息
      this.chatContainer.innerHTML = '';
    }
    
    // 添加用户消息
    this.addMessage('user', message);
    
    // 发送到AI（使用流式响应）
    this.sendToAIStream(message);
  }
  
  generateTitle(message) {
    // 规则提取标题
    const keywords = ['画', '绘制', '构造', '证明', '求', '计算', '作', '做', '创建'];
    for (const kw of keywords) {
      if (message.includes(kw)) {
        const idx = message.indexOf(kw);
        const title = message.substring(idx, Math.min(idx + 15, message.length));
        return title.replace(/[。，,、]/g, '');
      }
    }
    return message.substring(0, Math.min(10, message.length)) + '...';
  }
  
  async sendToAIStream(message) {
    // 添加助手消息容器（用于流式更新）
    this.currentAssistantMessage = this.addAssistantMessageContainer();
    
    try {
      // 调用AI（带流式回调）
      const response = await AiManager.sendMessage(
        message, 
        this.messages,
        (partialContent) => {
          // 实时更新消息内容
          this.updateAssistantMessage(partialContent);
        }
      );
      
      // 消息完成后提取命令并执行
      const lastMessage = this.currentAssistantMessage;
      const content = lastMessage.querySelector('.message-content').innerHTML;
      await this.processGgbCommands(content, lastMessage);
      
      // 更新消息历史（保存纯文本版本）
      const plainContent = content.replace(/<[^>]*>/g, '');
      this.messages.push({
        role: 'user',
        content: message
      }, {
        role: 'assistant',
        content: plainContent
      });
      
      // 保存到历史
      this.saveChat();
      
    } catch (error) {
      this.updateAssistantMessage(`❌ 发送失败: ${error.message}`);
    } finally {
      this.currentAssistantMessage = null;
    }
  }
  
  addAssistantMessageContainer() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="message-content"><span class="typing-indicator">正在思考...</span></div>
    `;
    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
    return messageDiv;
  }
  
  updateAssistantMessage(content) {
    if (!this.currentAssistantMessage) return;
    
    const contentDiv = this.currentAssistantMessage.querySelector('.message-content');
    contentDiv.innerHTML = this.formatContent(content);
    this.scrollToBottom();
  }
  
  addLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="message-content">
        <div class="loading-indicator">
          <span>正在思考</span>
          <div class="loading-dots">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
        </div>
      </div>
    `;
    this.chatContainer.appendChild(loadingDiv);
    this.scrollToBottom();
    return loadingDiv;
  }
  
  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    
    // 处理内容中的代码块
    let formattedContent = this.formatContent(content);
    
    messageDiv.innerHTML = `
      <div class="avatar">${avatar}</div>
      <div class="message-content">${formattedContent}</div>
    `;
    
    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
    return messageDiv;
  }
  
  formatContent(content) {
    // 将代码块转换为带样式的格式
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block"><pre>${code.trim()}</pre></div>`;
    });
    
    // 将行内代码转换
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 将换行转换为<br>
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }
  
  async processGgbCommands(content, messageDiv) {
    console.log('Processing GGB commands...');
    
    // 提取GeoGebra命令
    const commands = this.extractGgbCommands(content);
    console.log('Extracted commands:', commands);
    
    if (commands.length === 0) {
      console.log('No commands found');
      return;
    }
    
    // 生成新的画板
    const ggbId = `ggb-${this.currentGgbId++}`;
    console.log('Creating GGB container with id:', ggbId);
    
    const ggbContainer = document.createElement('div');
    ggbContainer.className = 'ggb-container';
    ggbContainer.innerHTML = `
      <div id="${ggbId}" style="width: 100%; height: 400px;"></div>
    `;
    
    // 在消息后面添加画板
    const contentDiv = messageDiv.querySelector('.message-content');
    contentDiv.appendChild(ggbContainer);
    console.log('GGB container added to DOM');
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证容器存在
    const containerElement = document.getElementById(ggbId);
    console.log('Container element exists:', !!containerElement);
    
    // 创建GeoGebra实例并执行命令
    await this.executeGgbCommands(ggbId, commands, contentDiv);
    
    this.scrollToBottom();
  }
  
  extractGgbCommands(content) {
    const commands = [];
    
    // 匹配代码块中的命令
    const codeBlockMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      const codeContent = codeBlockMatch[2];
      const lines = codeContent.split('\n').filter(line => line.trim());
      commands.push(...lines);
    }
    
    // 如果代码块中没有命令，尝试匹配单行命令
    if (commands.length === 0) {
      const regex = /(?:^|\s)([A-Za-z]+\[.*?\]|[A-Za-z]+\([^)]+\)|[A-Za-z]+\s*=\s*.+)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const cmd = match[1].trim();
        if (this.isValidGgbCommand(cmd)) {
          commands.push(cmd);
        }
      }
    }
    
    return commands;
  }
  
  isValidGgbCommand(cmd) {
    const validPatterns = [
      /^[A-Za-z]+\[.*\]$/,
      /^[A-Za-z]+\s*=\s*\(.+\)$/,
      /^[A-Za-z]+\s*=\s*".*"$/,
      /^[A-Za-z]+\s*=\s*[\d.]+$/
    ];
    
    return validPatterns.some(pattern => pattern.test(cmd));
  }
  
  async executeGgbCommands(ggbId, commands, container) {
    return new Promise((resolve) => {
      this.initAndExecute(ggbId, commands, container, resolve);
    });
  }
  
  initAndExecute(ggbId, commands, container, resolve) {
    console.log('Initializing GGB applet with id:', ggbId);
    
    const ggbApp = new GGBApplet({
      "width": "100%",
      "height": 400,
      "showToolBar": true,
      "showAlgebraInput": false,
      "showMenuBar": true,
      "allowStyleBar": true,
      "language": "zh",
      "showAlgebraView": false,
      "perspective": "G",
      "appName": "classic"
    }, true);
    
    ggbApp.onLoad = () => {
      console.log('GGB applet loaded successfully');
      this.executeWithRetry(ggbApp, commands, 0, container)
        .then(() => resolve())
        .catch(() => resolve());
    };
    
    ggbApp.inject(ggbId);
    console.log('GGB applet injected');
  }
  
  async executeWithRetry(ggbApp, commands, retryCount, container) {
    // 清空画板
    try {
      ggbApp.evalCommand('Clear[]');
    } catch (e) {
      // 忽略清空错误
    }
    
    // 执行命令并收集错误
    const errors = [];
    for (const cmd of commands) {
      try {
        ggbApp.evalCommand(cmd);
      } catch (e) {
        errors.push({ command: cmd, error: e.message || 'Unknown error' });
      }
    }
    
    if (errors.length > 0 && retryCount < this.maxRetryCount) {
      // 显示错误并反馈给AI
      this.showExecutionResult(container, false, errors);
      
      // 构建反馈消息
      const feedback = `以下GeoGebra命令执行失败，请修正：\n${errors.map(e => `- ${e.command}: ${e.error}`).join('\n')}`;
      
      // 发送反馈给AI
      const loadingDiv = this.addLoadingIndicator();
      
      try {
        const response = await AiManager.sendMessage(feedback, this.messages);
        loadingDiv.remove();
        
        const messageDiv = this.addMessage('assistant', response.content);
        this.messages.push({
          role: 'user',
          content: feedback
        }, {
          role: 'assistant',
          content: response.content
        });
        
        // 提取新命令并重试
        const newCommands = this.extractGgbCommands(response.content);
        if (newCommands.length > 0) {
          await this.executeWithRetry(ggbApp, newCommands, retryCount + 1, container);
        }
      } catch (e) {
        loadingDiv.remove();
        this.showExecutionResult(container, false, [{ error: 'AI反馈失败: ' + e.message }]);
      }
    } else if (errors.length > 0) {
      // 达到最大重试次数
      this.showExecutionResult(container, false, errors);
    } else {
      // 执行成功
      this.showExecutionResult(container, true, null);
    }
  }
  
  showExecutionResult(container, success, errors) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `execution-result ${success ? 'success' : 'error'}`;
    
    if (success) {
      resultDiv.textContent = '✅ 命令执行成功！';
    } else {
      resultDiv.innerHTML = `
        ❌ 命令执行失败：
        <br>
        ${errors.map(e => e.command ? `${e.command}: ${e.error}` : e.error).join('<br>')}
      `;
    }
    
    container.appendChild(resultDiv);
    this.scrollToBottom();
  }
  
  scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 100);
  }
  
  saveChat() {
    if (!this.currentChatId) return;
    
    const chatData = {
      id: this.currentChatId,
      title: this.chatTitle.textContent,
      messages: this.messages,
      createdAt: Date.now()
    };
    
    // 保存到localStorage
    const histories = this.getHistories();
    histories.unshift(chatData);
    
    // 只保留最近50条历史
    if (histories.length > 50) {
      histories.pop();
    }
    
    localStorage.setItem('chatggb_histories', JSON.stringify(histories));
    
    // 更新历史列表
    this.loadHistory();
  }
  
  loadHistory() {
    const histories = this.getHistories();
    
    if (histories.length === 0) {
      this.historyList.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">暂无历史记录</p>';
      return;
    }
    
    this.historyList.innerHTML = histories.map((chat, index) => `
      <div class="history-item ${this.currentChatId === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
        <div class="history-icon">${this.getIconByIndex(index)}</div>
        <div class="history-content">
          <div class="history-title-text">${chat.title}</div>
          <div class="history-time">${this.formatTime(chat.createdAt)}</div>
        </div>
      </div>
    `).join('');
    
    // 绑定历史点击事件
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => this.loadChat(item.dataset.chatId));
    });
  }
  
  getIconByIndex(index) {
    const icons = ['📐', '📊', '🔺', '⚫', '📈', '🔷', '🔶', '💎', '🔲', '⭐'];
    return icons[index % icons.length];
  }
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }
  
  getHistories() {
    try {
      return JSON.parse(localStorage.getItem('chatggb_histories') || '[]');
    } catch {
      return [];
    }
  }
  
  loadChat(chatId) {
    const histories = this.getHistories();
    const chat = histories.find(c => c.id === chatId);
    
    if (!chat) return;
    
    this.currentChatId = chatId;
    this.messages = chat.messages;
    this.chatTitle.textContent = chat.title;
    
    // 清空聊天容器
    this.chatContainer.innerHTML = '';
    
    // 渲染消息
    chat.messages.forEach(msg => {
      const messageDiv = this.addMessage(msg.role, msg.content);
      
      // 如果是助手消息，尝试生成画板
      if (msg.role === 'assistant') {
        const commands = this.extractGgbCommands(msg.content);
        if (commands.length > 0) {
          const ggbId = `ggb-${this.currentGgbId++}`;
          const ggbContainer = document.createElement('div');
          ggbContainer.className = 'ggb-container';
          ggbContainer.innerHTML = `<div id="${ggbId}" style="width: 100%; height: 400px;"></div>`;
          
          const contentDiv = messageDiv.querySelector('.message-content');
          contentDiv.appendChild(ggbContainer);
          
          // 延迟初始化画板
          setTimeout(() => {
            this.executeGgbCommands(ggbId, commands, contentDiv);
          }, 200);
        }
      }
    });
    
    // 更新历史列表active状态
    document.querySelectorAll('.history-item').forEach(item => {
      item.classList.toggle('active', item.dataset.chatId === chatId);
    });
  }
  
  openSettings() {
    // 加载保存的设置
    const settings = this.getSettings();
    document.getElementById('provider-name').value = settings.providerName || '';
    document.getElementById('api-endpoint').value = settings.apiEndpoint || '';
    document.getElementById('api-key').value = settings.apiKey || '';
    document.getElementById('model-name').value = settings.modelName || '';
    
    this.settingsPanel.classList.add('active');
  }
  
  closeSettings() {
    this.settingsPanel.classList.remove('active');
  }
  
  saveSettings() {
    const settings = {
      providerName: document.getElementById('provider-name').value,
      apiEndpoint: document.getElementById('api-endpoint').value,
      apiKey: document.getElementById('api-key').value,
      modelName: document.getElementById('model-name').value
    };
    
    localStorage.setItem('chatggb_settings', JSON.stringify(settings));
    
    // 更新AiManager配置
    AiManager.updateSettings(settings);
    
    alert('设置已保存！');
    this.closeSettings();
  }
  
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('chatggb_settings') || '{}');
    } catch {
      return {};
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.chatGGB = new ChatGGB();
});