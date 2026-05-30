class ChatGGB {
  constructor() {
    this.currentChatId = null;
    this.messages = [];
    this.ggbInstances = new Map();
    this.currentGgbId = 0;
    this.maxRetryCount = 2;
    this.ggbReady = false;
    this.currentAssistantMessage = null;
    this.loadTimeout = null;
    
    this.initElements();
    // 尝试从 localStorage 加载已保存的 API/模型设置，优先应用，避免发送前提示错误
    this.loadSavedSettings();
    this.preloadGeoGebra();
    // 尝试创建固定画板（在 GeoGebra 库加载后创建）
    this.waitAndCreateFixedGgb();
    this.loadHistory();
    this.bindEvents();
  }

  // 从 localStorage 加载保存的设置并应用到 AiManager
  loadSavedSettings() {
    const settings = this.getSettings();
    if (settings && (settings.apiKey || settings.apiEndpoint || settings.modelName || settings.providerName)) {
      // 更新 AiManager 内部配置，供后续发送使用
      AiManager.updateSettings(settings);
      // 如果设置面板的输入存在，则同步显示（方便用户查看）
      try {
        if (document.getElementById('provider-name')) document.getElementById('provider-name').value = settings.providerName || '';
        if (document.getElementById('api-endpoint')) document.getElementById('api-endpoint').value = settings.apiEndpoint || '';
        if (document.getElementById('api-key')) document.getElementById('api-key').value = settings.apiKey || '';
        if (document.getElementById('model-name')) document.getElementById('model-name').value = settings.modelName || '';
      } catch (e) {
        // 忽略 DOM 操作错误
      }
    }
  }
  
  preloadGeoGebra() {
    this.showLoadingState();
    
    // 设置加载超时（10秒）
    this.loadTimeout = setTimeout(() => {
      this.showLoadTimeoutError();
    }, 10000);
    
    // If library already loaded (we added synchronous script in index.html), skip loading applet
    if (typeof GGBApplet !== 'undefined') {
      clearTimeout(this.loadTimeout);
      this.ggbReady = true;
      this.hideLoadingState();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      clearTimeout(this.loadTimeout);
      this.ggbReady = true;
      this.hideLoadingState();
    };
    script.onerror = () => {
      clearTimeout(this.loadTimeout);
      this.showLoadError('脚本加载失败，请检查网络连接');
    };
    document.head.appendChild(script);
  }

  waitAndCreateFixedGgb() {
    const self = this;
    let attempts = 0;
    const t = setInterval(() => {
      attempts++;
      if (typeof GGBApplet !== 'undefined') {
        clearInterval(t);
        try { self.createFixedGgb(); } catch (e) { console.warn('createFixedGgb failed', e && e.message); }
      } else if (attempts > 50) {
        clearInterval(t);
        console.warn('GeoGebra lib not available to create fixed applet');
      }
    }, 200);
  }

  createFixedGgb() {
    if (this.fixedGgbCreated) return;
    const self = this;
    const el = document.getElementById('ggb-fixed');
    if (!el) return;

    const options = {
      width: '100%',
      height: 360,
      showToolBar: true,
      showAlgebraInput: false,
      showMenuBar: true,
      allowStyleBar: true,
      language: 'zh',
      showAlgebraView: false,
      perspective: 'G',
      appName: 'classic',
      id: 'ggb-fixed-applet',
      appletOnLoad: function(applet) {
        try {
          self.fixedGgbInstance = applet || window.ggbApplet || null;
          window.ggbFixedApplet = self.fixedGgbInstance;
          console.log('Fixed GeoGebra instance ready', !!self.fixedGgbInstance);
        } catch (e) {}
      }
    };

    try {
      const ggbApp = new GGBApplet(options, true);
      ggbApp.inject('ggb-fixed');
      this.fixedGgbWrapper = ggbApp;
      this.fixedGgbCreated = true;
      console.log('Injected fixed GGB wrapper', ggbApp);
    } catch (e) {
      console.warn('Failed to inject fixed GeoGebra applet', e && e.message);
    }
  }
  
  initializePreloadGGB() {
    // Deprecated: we no longer create a hidden applet for preload because many browsers
    // prevent initialization in display:none. The library load itself is sufficient.
    this.ggbReady = true;
    this.hideLoadingState();
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
        <h3>欢迎使用AI数学绘图助手</h3>
        <p>输入数学作图需求，AI会自动帮你生成GeoGebra命令并绘制图形</p>
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
  
  showLoadError(message = '请检查网络连接或稍后重试') {
    this.chatContainer.innerHTML = `
      <div class="error-container">
        <div class="error-icon">❌</div>
        <p>GeoGebra 加载失败</p>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="retry-btn">🔄 刷新重试</button>
      </div>
    `;
  }
  
  showLoadTimeoutError() {
    this.chatContainer.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⏱️</div>
        <p>GeoGebra 加载超时</p>
        <p>加载时间超过10秒，可能是网络连接较慢或GeoGebra服务暂时不可用</p>
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
    // example-tag elements are dynamic; we will use event delegation in bindEvents
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
    
    // Use event delegation so example buttons work even after DOM replacements
    this.chatContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('example-tag')) {
        this.userInput.value = target.textContent;
        this.sendMessage();
      }
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
        <h3>欢迎使用AI数学绘图助手</h3>
        <p>输入数学作图需求，AI会自动帮你生成GeoGebra命令并绘制图形</p>
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
      // 如果错误是因为未配置 API 设置，则不要在聊天中插入那条错误提示，改为打开设置面板引导用户配置
      if (error && error.message && error.message.includes('请先配置API设置')) {
        // 移除流式占位的助手消息，避免在聊天中留下“正在思考...”占位
        try {
          if (this.currentAssistantMessage && this.currentAssistantMessage.remove) {
            this.currentAssistantMessage.remove();
          }
        } catch (e) {}
        this.openSettings();
      } else {
        this.updateAssistantMessage(`❌ 发送失败: ${error.message}`);
      }
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
    // 将Markdown标题转换为HTML标题（从大到小处理，避免冲突）
    content = content.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    content = content.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    content = content.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    content = content.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
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
    
    const contentDiv = messageDiv.querySelector('.message-content');

    // 如果固定画板存在，则优先在固定画板上执行命令
    if (this.fixedGgbInstance) {
      console.log('Executing commands on fixed GeoGebra applet');
      // 在消息中添加提示说明图形在上方固定画板显示
      const note = document.createElement('div');
      note.className = 'execution-note';
      note.textContent = '图形已在上方固定画板显示';
      contentDiv.appendChild(note);

      // 尝试执行命令
      try {
        await this.executeWithRetry(this.fixedGgbInstance, commands, 0, contentDiv);
      } catch (e) {
        console.warn('execute on fixed applet failed', e && e.message);
      }
      this.scrollToBottom();
      return;
    }

    // 回退：生成新的画板（按消息创建）
    const ggbId = `ggb-${this.currentGgbId++}`;
    console.log('Creating GGB container with id:', ggbId);
    
    const ggbContainer = document.createElement('div');
    ggbContainer.className = 'ggb-container';
    ggbContainer.innerHTML = `
      <div id="${ggbId}" style="width: 100%; height: 400px;"></div>
    `;
    
    // 在消息后面添加画板
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

    // Normalize content to string
    let html = String(content || '');

    // Try several strategies to extract code block content
    const tryPre = () => {
      const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (preMatch) return preMatch[1];
      // also try code-block wrapper
      const cbMatch = html.match(/<div[^>]*class=["']?code-block["']?[^>]*>[\s\S]*?<pre[^>]*>([\s\S]*?)<\/pre>[\s\S]*?<\/div>/i);
      if (cbMatch) return cbMatch[1];
      return null;
    };

    let raw = tryPre();

    // Fenced code block with ``` (allow CRLF and optional language tag)
    if (!raw) {
      const fenceMatch = html.match(/```(?:\s*\w+)?\r?\n([\s\S]*?)\r?\n```/);
      if (fenceMatch) raw = fenceMatch[1];
    }

    // Sometimes the content is plain text with fences but no newlines; try a loose match
    if (!raw) {
      const looseFence = html.match(/```([\s\S]*?)```/);
      if (looseFence) raw = looseFence[1];
    }

    // If still no code block, fall back to the whole text
    let text = raw || html;

    // Unescape common HTML entities and normalize <br> and block tags to newlines
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    text = text.replace(/<br\s*\/?>(\s*)/gi, '\n')
               .replace(/<\/p>/gi, '\n')
               .replace(/<\/div>\s*<div[^>]*>/gi, '\n');
    // remove remaining tags
    text = text.replace(/<[^>]+>/g, '');

    // Split into candidate lines (by newline or semicolon)
    const lines = text.split(/\r?\n|;/).map(l => l.trim()).filter(l => l);

    // Keywords commonly appearing in GeoGebra commands
    const keywords = ['Polygon', 'Circle', 'Segment', 'Tangent', 'Line', 'Point', 'Vector', 'Midpoint', 'Perpendicular', 'Intersect'];

    for (const line of lines) {
      // further split by commas if many commands are glued
      const parts = line.split(/\s*[,;]\s*/).map(s => s.trim()).filter(s => s);
      for (const part of parts) {
        if (!part) continue;
        // quick accept if matches valid command patterns or contains keyword or bracket-style expression
        if (this.isValidGgbCommand(part) || keywords.some(k => part.indexOf(k) !== -1) || /[A-Za-z0-9_]+\s*=\s*\([^)]+\)/.test(part) || /[A-Za-z]+\[[^\]]+\]/.test(part)) {
          commands.push(part);
        }
      }
    }

    // As a more lenient fallback, run a global regex to find potential command tokens
    if (commands.length === 0) {
      const globalRegex = /[A-Za-z0-9_]+\s*=\s*\([^\)]+\)|[A-Za-z]+\[[^\]]+\]|Polygon\([^\)]*\)|Polygon\[[^\]]+\]|Circle\([^\)]+\)|Segment\[[^\]]+\]/g;
      const found = text.match(globalRegex) || [];
      for (const f of found) {
        const s = f.trim();
        if (s && !commands.includes(s)) commands.push(s);
      }
    }

    // Final cleanup: trim trailing punctuation
    return commands.map(c => c.replace(/[\u200B\uFEFF]/g, '').trim()).filter(Boolean);
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
    
    // 检查 GGBApplet 是否已加载
    if (typeof GGBApplet === 'undefined') {
      console.log('GGBApplet not loaded, loading script...');
      this.loadGgbScript(() => {
        this.initAndExecute(ggbId, commands, container, resolve);
      });
      return;
    }
    
    // Prepare options with appletOnLoad to ensure we detect when the instance is ready
    const options = {
      "width": "100%",
      "height": 400,
      "showToolBar": true,
      "showAlgebraInput": false,
      "showMenuBar": true,
      "allowStyleBar": true,
      "language": "zh",
      "showAlgebraView": false,
      "perspective": "G",
      "appName": "classic",
      // appletOnLoad may receive the applet instance as an argument in many GeoGebra builds
      appletOnLoad: (applet) => {
        console.log('appletOnLoad callback triggered for', ggbId, 'applet param:', applet);
        const instance = applet || window.ggbApplet || null;
        console.log('Resolved GeoGebra instance:', !!instance);

        if (instance) {
          try {
            // 保存实例以便后续引用
            this.ggbInstances.set(ggbId, instance);
          } catch (e) {}

          this.executeWithRetry(instance, commands, 0, container)
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          // fallback: try again shortly
          setTimeout(() => {
            const fallback = window.ggbApplet || this.ggbInstances.get(ggbId) || null;
            if (fallback) {
              this.executeWithRetry(fallback, commands, 0, container)
                .then(() => resolve())
                .catch(() => resolve());
            } else {
              console.warn('无法找到 GeoGebra 实例的回退引用 for', ggbId);
              resolve();
            }
          }, 300);
        }
      }
    };

    // 指定 id 带到 options 中（部分 GeoGebra 版本会使用该 id）
    options.id = ggbId;

    const ggbApp = new GGBApplet(options, true);
    ggbApp.inject(ggbId);
    console.log('GGB applet injected for', ggbId, 'wrapper:', ggbApp);

    // After injection, wait a moment and verify the DOM structure; if the target div
    // height is collapsed, force it to match parent and call applet size APIs.
    setTimeout(() => {
      try {
        const target = document.getElementById(ggbId);
        if (!target) return;

        console.log('Post-inject target rect:', target.getBoundingClientRect());
        console.log('Post-inject target innerHTML length:', target.innerHTML && target.innerHTML.length);
        const kids = Array.from(target.children || []);
        console.log('Post-inject children count:', kids.length, kids.map(k=>k.tagName + ':' + k.className));

        const parent = target.parentElement;
        const parentH = parent ? parent.clientHeight : null;
        const currentH = target.clientHeight || target.getBoundingClientRect().height;

        // If inner target is much smaller than parent's allocated height, force-match it.
        if (parentH && currentH < Math.max(50, parentH * 0.5)) {
          try {
            target.style.height = parentH + 'px';
            target.style.minHeight = parentH + 'px';
            target.style.display = 'block';
            console.log('Forced target height to parent height:', parentH);
          } catch (e) { console.warn('force set height failed', e && e.message); }
        }

        // If the GeoGebra applet exposes setSize, call it to ensure internal canvas resized
        try {
          if (ggbApp && typeof ggbApp.setSize === 'function') {
            const w = target.clientWidth || target.getBoundingClientRect().width || 600;
            const h = target.clientHeight || parentH || 400;
            ggbApp.setSize(w, h);
            console.log('Called ggbApp.setSize', w, h);
          }
        } catch (e) {
          console.warn('ggbApp.setSize failed', e && e.message);
        }
        // 进一步修正：GeoGebra 有时会向内层添加 transform 缩放，我们尝试清除或修正它们
        try {
          const scaler = target.querySelector('.applet_scaler, .ggbTransform, .geogebra_applet');
          if (scaler) {
            console.log('Found scaler element:', scaler.tagName, scaler.className);
            // 清除内联 transform
            try { scaler.style.transform = 'none'; } catch (e) {}
            try { scaler.style.webkitTransform = 'none'; } catch (e) {}
            // 强制宽高为 100%
            try { scaler.style.width = '100%'; scaler.style.height = '100%'; } catch (e) {}
            // 如果存在内部 svg/canvas，确保其宽高属性为 100%
            const inner = scaler.querySelector('svg, canvas, iframe, embed, object');
            if (inner) {
              try { inner.style.width = '100%'; inner.style.height = '100%'; } catch (e) {}
              try { if (inner.setAttribute) { inner.setAttribute('width', '100%'); inner.setAttribute('height', '100%'); } } catch (e) {}
            }
          }
        } catch (e) { console.warn('scaler fix failed', e && e.message); }

        // 再次调用 ZoomFit 保证内容可见
        try { if (ggbApp && typeof ggbApp.evalCommand === 'function') { ggbApp.evalCommand('ZoomFit[]'); } } catch (e) {}
        try { if (window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function') { window.ggbApplet.evalCommand('ZoomFit[]'); } } catch (e) {}
      } catch (e) {
        console.warn('post-inject DOM check error', e && e.message);
      }
    }, 300);

    // Extra fallback polling: wait for window.ggbApplet to appear for up to 2s
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      const app = window.ggbApplet || null;
      if (app) {
        clearInterval(pollInterval);
        console.log('Polled and found window.ggbApplet for', ggbId);
      } else if (pollCount > 20) {
        clearInterval(pollInterval);
        console.warn('Polling for GeoGebra instance timed out for', ggbId);
      }
    }, 100);
  }
  
  loadGgbScript(callback) {
    // 检查是否已经在加载
    if (this.ggbScriptLoading) {
      setTimeout(() => this.loadGgbScript(callback), 100);
      return;
    }
    
    this.ggbScriptLoading = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    script.onload = () => {
      this.ggbScriptLoading = false;
      callback();
    };
    script.onerror = () => {
      this.ggbScriptLoading = false;
      console.error('Failed to load GeoGebra script');
      alert('无法加载 GeoGebra 脚本，请检查网络连接');
    };
    document.head.appendChild(script);
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
      // 尝试调整视图并输出调试信息，帮助定位对象不可见的问题
      try {
        if (typeof ggbApp !== 'undefined' && ggbApp && typeof ggbApp.evalCommand === 'function') {
          try { ggbApp.evalCommand('ZoomFit[]'); } catch (e) { /* ignore */ }
        }
      } catch (e) {}

      try {
        if (typeof ggbApp !== 'undefined' && ggbApp && typeof ggbApp.repaint === 'function') {
          try { ggbApp.repaint(); } catch (e) { /* ignore */ }
        }
      } catch (e) {}

      // 尝试列出已定义对象并获取部分坐标，用于判断对象是否存在但在视野外
      try {
        const apiCandidates = ['getObjectNames', 'getAllObjectNames', 'getObjectList', 'getDefinedObjectNames'];
        let objectNames = null;
        for (const name of apiCandidates) {
          if (typeof ggbApp !== 'undefined' && ggbApp && typeof ggbApp[name] === 'function') {
            try {
              const objs = ggbApp[name]();
              console.log('GeoGebra objects via', name, objs);
              if (Array.isArray(objs) && objs.length > 0) {
                objectNames = objs;
                break;
              }
            } catch (e) {
              console.log('调用', name, '报错', e && e.message);
            }
          }
        }

        // 如果获取到了对象名，尝试读取点坐标并计算边界
        if (objectNames && objectNames.length > 0) {
          const coords = [];
          for (const nm of objectNames) {
            try {
              const x = (typeof ggbApp.getXcoord === 'function') ? Number(ggbApp.getXcoord(nm)) : NaN;
              const y = (typeof ggbApp.getYcoord === 'function') ? Number(ggbApp.getYcoord(nm)) : NaN;
              if (!Number.isNaN(x) && !Number.isNaN(y)) {
                coords.push({ x, y, name: nm });
              }
            } catch (e) {
              // ignore individual failures
            }
          }

          if (coords.length > 0) {
            const xs = coords.map(c => c.x);
            const ys = coords.map(c => c.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            console.log('Computed object bbox:', { minX, minY, maxX, maxY });

            // 如果坐标范围明显偏离默认视图，调用 setCoordSystem 调整视图
            try {
              if (typeof ggbApp.setCoordSystem === 'function') {
                const paddingX = Math.max(1, (maxX - minX) * 0.2);
                const paddingY = Math.max(1, (maxY - minY) * 0.2);
                ggbApp.setCoordSystem(minX - paddingX, minY - paddingY, maxX + paddingX, maxY + paddingY);
                console.log('Called setCoordSystem to fit objects');
              }
            } catch (e) {
              console.log('setCoordSystem 调用失败', e && e.message);
            }
          }
        }
      } catch (e) {
        console.log('列出对象或获取坐标时出错', e && e.message);
      }

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