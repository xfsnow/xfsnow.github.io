document.addEventListener('DOMContentLoaded', () => {
  // ==================== 图片上传相关变量 ====================
  let selectedImageData = null;
  let selectedImageUrl = null;

  // ==================== 工具函数 ====================
  
  function escapeHtmlForCommands(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createCommandsDisplay(container, commands) {
    if (!commands) return null;
    
    const isArray = Array.isArray(commands);
    const hasContent = isArray ? commands.length > 0 : commands.trim().length > 0;
    
    if (!hasContent) return null;
    
    const wrapper = container.parentElement;
    if (!wrapper) {
      console.warn('[createCommandsDisplay] 未找到容器包装器，无法创建命令显示区域');
      return null;
    }
    
    let commandsDiv = wrapper.querySelector('.ggb-commands-display');
    if (commandsDiv) {
      console.log('[createCommandsDisplay] 命令显示区域已存在，跳过创建');
      return commandsDiv;
    }
    
    commandsDiv = document.createElement('div');
    commandsDiv.className = 'ggb-commands-display';
    
    let commandItemsHtml = '';
    if (isArray) {
      commandItemsHtml = commands.map((cmd) => {
        const escapedCmd = escapeHtmlForCommands(cmd);
        return `<div class="ggb-command-item"><code>${escapedCmd}</code></div>`;
      }).join('');
    } else {
      const escapedXml = escapeHtmlForCommands(commands);
      commandItemsHtml = `<div class="ggb-command-item"><code>${escapedXml}</code></div>`;
    }
    
    const copyIconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
    
    commandsDiv.innerHTML = `
      <div class="ggb-commands-header">
        <div class="ggb-commands-title">GeoGebra 命令</div>
        <button class="copy-btn" onclick="copyGGBCommands(this)">
          ${copyIconSvg}
          <span>复制</span>
        </button>
      </div>
      <div class="ggb-commands-list">
        ${commandItemsHtml}
      </div>
    `;
    
    commandsDiv.dataset.commands = JSON.stringify(isArray ? commands : [commands]);
    wrapper.appendChild(commandsDiv);
    console.log('[createCommandsDisplay] ✓ 命令显示区域已创建');
    return commandsDiv;
  }
  
  window.copyGGBCommands = function(button) {
    const commandsDiv = button.closest('.ggb-commands-display');
    if (!commandsDiv) return;
    
    try {
      const commandsData = commandsDiv.dataset.commands;
      if (!commandsData) {
        alert('未找到命令数据');
        return;
      }
      
      const commands = JSON.parse(commandsData);
      const commandText = commands.join('\n');
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(commandText).then(() => {
          showCopySuccess(button);
        }).catch(err => {
          console.error('[copyGGBCommands] Clipboard API 失败:', err);
          fallbackCopyToClipboard(commandText, button);
        });
      } else {
        fallbackCopyToClipboard(commandText, button);
      }
    } catch (e) {
      console.error('[copyGGBCommands] 错误:', e);
      alert('复制出错：' + e.message);
    }
  };
  
  function showCopySuccess(button) {
    const originalHtml = button.innerHTML;
    
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="copy-success-text">已复制</span>
    `;
    
    setTimeout(() => {
      button.innerHTML = originalHtml;
    }, 2000);
  }
  
  function fallbackCopyToClipboard(text, button) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position: fixed; left: -9999px; top: -9999px; opacity: 0;';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showCopySuccess(button);
      } else {
        alert('复制失败，请手动选择并复制命令');
      }
    } catch (err) {
      console.error('[fallbackCopyToClipboard] 错误:', err);
      alert('复制失败，请手动选择并复制命令');
    }
  }
  
  window.ggbLibLoaded = false;
  window.ggbLibLoading = false;
  window.ggbLoadPromise = null;
  
  function ensureGeoGebraLoaded() {
    if (window.ggbLibLoaded) {
      return Promise.resolve(true);
    }
    
    if (window.ggbLoadPromise) {
      return window.ggbLoadPromise;
    }
    
    window.ggbLoadPromise = new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 20000;
      
      const checkInterval = setInterval(() => {
        const ggbLoaded = typeof GGBApplet !== 'undefined' && 
                          typeof GGBApplet === 'function';
        
        if (ggbLoaded) {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          window.ggbLoadPromise = null;
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          window.ggbLoadPromise = null;
          console.error('[GeoGebra] 库加载超时');
          reject(new Error('GeoGebra 库加载超时'));
        }
      }, 200);
    });
    
    return window.ggbLoadPromise;
  }
  
  ensureGeoGebraLoaded().catch(() => {});

  let ggbAppletQueue = [];
  let ggbAppletProcessing = false;
  
  function processGGBAppletQueue() {
    if (ggbAppletProcessing || ggbAppletQueue.length === 0) return;
    
    ggbAppletProcessing = true;
    const { containerId, commands, viewRange, xmlContent, resolve } = ggbAppletQueue.shift();
    
    createGGBAppletInternal(containerId, commands, viewRange, xmlContent).then(result => {
      resolve(result);
      ggbAppletProcessing = false;
      setTimeout(() => processGGBAppletQueue(), 300);
    }).catch(err => {
      console.error('[GeoGebra Queue] 创建失败:', err);
      resolve(null);
      ggbAppletProcessing = false;
      setTimeout(() => processGGBAppletQueue(), 300);
    });
  }
  
  function queueGGBApplet(containerId, commands, viewRange, xmlContent = null) {
    return new Promise(resolve => {
      ggbAppletQueue.push({ containerId, commands, viewRange, xmlContent, resolve });
      processGGBAppletQueue();
    });
  }

  function waitForAppletReady(api, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let consecutiveSuccesses = 0;
      const requiredSuccesses = 3;
      
      const checkReady = () => {
        try {
          if (api && typeof api.evalCommand === 'function') {
            api.evalCommand('testPoint=(0,0)');
            api.evalCommand('Delete[testPoint]');
            consecutiveSuccesses++;
            
            if (consecutiveSuccesses >= requiredSuccesses) {
              resolve(true);
              return;
            }
          } else {
            consecutiveSuccesses = 0;
          }
        } catch (e) {
          consecutiveSuccesses = 0;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error('Applet 就绪超时'));
          return;
        }
        
        setTimeout(checkReady, 200);
      };
      
      checkReady();
    });
  }

  function hideGGBAlgebraPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const selectors = [
      '.gwt-SplitLayoutPanel > div:first-child',
      '[class*="algebra"]',
      '[class*="Algebra"]', 
      '[id*="algebra"]',
      '[id*="Algebra"]'
    ];
    
    selectors.forEach(sel => {
      try {
        const el = container.querySelector(sel);
        if (el && el.offsetWidth < container.offsetWidth * 0.4) {
          el.style.display = 'none';
        }
      } catch(e) {}
    });

    const allDivs = container.querySelectorAll('div');
    allDivs.forEach(div => {
      const cls = div.className || '';
      const id = div.id || '';
      if ((cls.match(/algebra/i) || id.match(/algebra/i)) && div.offsetWidth < container.offsetWidth * 0.4) {
        div.style.display = 'none';
      }
    });
  }

  const sidebar = document.querySelector('.sidebar');
  const SIDEBAR_BREAKPOINT = 768;

  // 窗口变窄时自动折叠侧边栏
  function checkSidebarAutoCollapse() {
    if (window.innerWidth <= SIDEBAR_BREAKPOINT) {
      sidebar?.classList.add('collapsed');
    }
  }
  checkSidebarAutoCollapse();
  window.addEventListener('resize', checkSidebarAutoCollapse);

  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });

  const chatTitle = document.getElementById('chat-title');
  const chatContainer = document.getElementById('chat-container');

  function resetChat() {
    saveCurrentChat();
    
    currentChatId = null;
    messageHistory = [];
    selectedImageData = null;
    selectedImageUrl = null;
    hideImagePreview();
    
    if (chatContainer) {
      chatContainer.innerHTML = `
        <div class="welcome-message">
          <h3>欢迎使用AI数学绘图助手</h3>
          <p>输入数学作图需求,AI会自动帮你生成GeoGebra命令并绘制图形</p>
          <div class="welcome-examples">
            <button type="button" class="example-tag">画一个等边三角形</button>
            <button type="button" class="example-tag">构造圆的切线</button>
            <button type="button" class="example-tag">证明勾股定理</button>
          </div>
        </div>
      `;
      bindExampleTags();
    }
    if (chatTitle) chatTitle.textContent = '新对话';
    renderHistoryList();
  }

  [document.getElementById('new-chat-header-btn'), document.getElementById('new-chat-btn')].forEach(btn => {
    btn?.addEventListener('click', resetChat);
  });

  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  
  const settingsElements = {
    endpoint: document.getElementById('api-endpoint'),
    apiKey: document.getElementById('api-key'),
    modelName: document.getElementById('model-name')
  };
  
  const SETTINGS_KEY = 'chatgg_settings';
  const HISTORY_KEY = 'chatgg_history';
  const MAX_HISTORY = 50;
  let currentChatId = null;
  
  const defaultSettings = {
    endpoint: 'https://api.openai.com/v1',
    apiKey: '',
    modelName: 'gpt-4o'
  };
  
  function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    let settings = defaultSettings;
    if (saved) {
      try {
        settings = { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('加载设置失败:', e);
      }
    }
    Object.keys(settingsElements).forEach(key => {
      if (settingsElements[key]) {
        settingsElements[key].value = settings[key] || '';
      }
    });
  }
  
  function useDefaultSettings() {
    Object.keys(settingsElements).forEach(key => {
      if (settingsElements[key]) {
        settingsElements[key].value = defaultSettings[key] || '';
      }
    });
  }
  
  function saveSettings() {
    const settings = {};
    Object.keys(settingsElements).forEach(key => {
      if (settingsElements[key]) {
        settings[key] = settingsElements[key].value;
      }
    });
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      alert('设置已保存');
      closeSettingsModal();
    } catch (e) {
      console.error('保存设置失败:', e);
      alert('保存设置失败，请重试');
    }
  }
  
  function openSettingsModal() {
    loadSettings();
    settingsModal?.classList.add('active');
  }
  
  function closeSettingsModal() {
    settingsModal?.classList.remove('active');
  }
  
  settingsBtn?.addEventListener('click', openSettingsModal);
  closeSettingsBtn?.addEventListener('click', closeSettingsModal);
  document.getElementById('cancel-settings-btn')?.addEventListener('click', closeSettingsModal);
  saveSettingsBtn?.addEventListener('click', saveSettings);

  // ==================== 历史记录管理 ====================
  
  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('加载历史记录失败:', e);
      return [];
    }
  }
  
  function saveHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('保存历史记录失败:', e);
    }
  }
  
  function generateChatTitle(messages) {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return '新对话';
    const content = firstUserMsg.content;
    const text = typeof content === 'object' ? (content.find(c => c.type === 'text')?.text || '') : content;
    const trimmed = text.trim();
    return trimmed.length > 20 ? trimmed.substring(0, 20) + '...' : trimmed || '新对话';
  }
  
  function saveCurrentChat() {
    if (!currentChatId || messageHistory.length === 0) return;
    
    const history = loadHistory();
    const chatIndex = history.findIndex(c => c.id === currentChatId);
    
    const chatData = {
      id: currentChatId,
      title: generateChatTitle(messageHistory),
      messages: messageHistory,
      updatedAt: Date.now()
    };
    
    if (chatIndex >= 0) {
      history[chatIndex] = chatData;
    } else {
      history.unshift(chatData);
    }
    
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }
    
    saveHistory(history);
    renderHistoryList();
  }
  
  function loadChat(chatId) {
    const history = loadHistory();
    const chat = history.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chat.id;
    messageHistory = chat.messages;
    
    if (chatTitle) chatTitle.textContent = chat.title;
    
    chatContainer.innerHTML = '';
    
    messageHistory.forEach(msg => {
      addMessageToUI(msg.content, msg.role, false);
    });
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    renderHistoryList();
  }
  
  function deleteChat(chatId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!confirm('确定要删除这个对话吗？')) return;
    
    let history = loadHistory();
    history = history.filter(c => c.id !== chatId);
    saveHistory(history);
    
    if (currentChatId === chatId) {
      currentChatId = null;
      messageHistory = [];
      resetChat();
    }
    
    renderHistoryList();
  }
  
  function renderHistoryList() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = loadHistory();
    
    if (history.length === 0) {
      historyList.innerHTML = '<div style="padding: 12px; color: #999; font-size: 13px; text-align: center;">暂无历史记录</div>';
      return;
    }
    
    historyList.innerHTML = history.map(chat => `
      <div class="history-item ${chat.id === currentChatId ? 'active' : ''}" data-chat-id="${chat.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="history-item-title">${escapeHtml(chat.title)}</span>
        <button class="history-delete-btn" data-chat-id="${chat.id}" title="删除">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');
    
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.dataset.chatId;
        loadChat(chatId);
      });
    });
    
    historyList.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chatId = btn.dataset.chatId;
        deleteChat(chatId, e);
      });
    });
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== 图片上传功能 ====================

  function showImagePreview(imageUrl) {
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const previewImage = document.getElementById('image-preview');
    
    previewImage.src = imageUrl;
    previewWrapper.style.display = 'block';
  }

  function hideImagePreview() {
    const previewWrapper = document.getElementById('image-preview-wrapper');
    const previewImage = document.getElementById('image-preview');
    
    previewImage.src = '';
    previewWrapper.style.display = 'none';
    selectedImageData = null;
    selectedImageUrl = null;
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageData = e.target.result;
      selectedImageUrl = e.target.result;
      showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  // 绑定图片上传事件
  const imageInput = document.getElementById('image-input');
  const imageAttachmentBtn = document.getElementById('image-attachment-btn');
  const closePreviewBtn = document.getElementById('close-preview');

  imageInput?.addEventListener('change', handleImageUpload);
  imageAttachmentBtn?.addEventListener('click', () => {
    imageInput?.click();
  });
  closePreviewBtn?.addEventListener('click', hideImagePreview);

  // ==================== 对话处理逻辑 ====================
  
  const systemPrompt = `你是一个GeoGebra几何绘图专家。请根据用户的几何作图需求，生成正确的GeoGebra XML命令。

重要规则：GeoGebra 的 evalXML 引擎非常死板，标签、属性名或嵌套结构错误会被静默忽略。

XML 格式铁律：
1. **对象标识**：使用 label="..." 而不是 name="..."
2. **点定义**：必须使用齐次坐标，平面点包含 z="1.0"
3. **公式表达式**：使用 <expression> 标签，公式写在 exp="..." 属性里，用方括号 []
4. **几何构造**：使用 <command name="命令"> 块，参数用 a0, a1, a2...

构造规则：
- **固定点/数值**：<element type="point" label="名称"><coords x="0.0" y="0.0" z="1.0"/></element>
- **公式计算**：<expression label="名称" exp="公式" type="类型"/>
- **几何作图**：<command name="命令"><input a0="A" a1="B"/><output a0="结果"/></command>

输出格式：
1. 先用自然语言简要解释绘图思路和步骤
2. 然后将所有GeoGebra命令放在一个 \`\`\`ggb-xml\`\`\` 代码块中
3. 最后补充说明或注意事项

正确示例：

我来画一个等边三角形。

首先定义点A和B，然后通过旋转得到点C，最后用Polygon命令连接成三角形。

\`\`\`ggb-xml
<construction>
  <element type="point" label="A">
    <coords x="0.0" y="0.0" z="1.0"/>
  </element>

  <element type="point" label="B">
    <coords x="4.0" y="0.0" z="1.0"/>
  </element>

  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  <element type="point" label="C">
    <coords x="2.0" y="3.4641" z="1.0"/>
  </element>

  <command name="Polygon">
    <input a0="A" a1="B" a2="C"/>
    <output a0="triangle"/>
  </command>
  <element type="polygon" label="triangle">
    <show object="true" label="false"/>
    <objColor r="0" g="100" b="0" alpha="0.1"/>
  </element>
</construction>
\`\`\`

这样就完成了等边三角形的绘制。`;

  let messageHistory = [];

  function getSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  }

  function addMessageToUI(content, role, skipScroll) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // 处理多模态消息内容
    if (typeof content === 'object' && content !== null) {
      const textParts = content.filter(c => c.type === 'text').map(c => c.text).join('\n');
      const imageParts = content.filter(c => c.type === 'image_url');
      
      let htmlContent = '';
      if (imageParts.length > 0) {
        imageParts.forEach(img => {
          htmlContent += `<img src="${img.image_url.url}" alt="图片" class="message-image" style="max-width: 300px; max-height: 300px; border-radius: 8px; margin-bottom: 8px;">`;
        });
      }
      htmlContent += parseMarkdown(textParts);
      contentDiv.innerHTML = htmlContent;
    } else {
      const formatted = formatMessage(content);
      contentDiv.innerHTML = formatted.text;
      
      if (formatted.hasGGB && role === 'assistant') {
        const ggbContainerId = 'ggb-' + Date.now() + Math.random();
        const ggbWrapper = document.createElement('div');
        ggbWrapper.className = 'ggb-container-wrapper';
        ggbWrapper.innerHTML = `
          <div id="${ggbContainerId}" class="ggb-container"></div>
        `;
        contentDiv.appendChild(ggbWrapper);
        
        setTimeout(() => {
          createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange, formatted.xmlContent);
        }, 100);
      }
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    if (!skipScroll) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    return contentDiv;
  }

  function extractGGBCommands(content) {
    // 处理多模态内容
    if (typeof content === 'object') {
      const textContent = content.find(c => c.type === 'text')?.text || '';
      return extractGGBCommandsFromText(textContent);
    }
    return extractGGBCommandsFromText(content);
  }

  function extractGGBCommandsFromText(text) {
    const xmlMatch = text.match(/```ggb-xml\s*([\s\S]*?)```/);
    if (xmlMatch) {
      try {
        const xmlContent = xmlMatch[1].trim();
        if (xmlContent.includes('<construction') && xmlContent.includes('</construction>')) {
          return {
            success: true,
            commands: null,
            xmlContent: xmlContent,
            viewRange: null
          };
        }
      } catch (e) {
        console.error('XML 解析失败:', e);
      }
    }
    
    const jsonMatch = text.match(/```ggb-json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        return {
          success: true,
          commands: jsonData.commands || [],
          xmlContent: null,
          viewRange: jsonData.viewRange || null
        };
      } catch (e) {
        console.error('JSON 解析失败:', e);
      }
    }
    
    const codeMatch = text.match(/```(?:\s*ggb(?!-json)(?!-xml)\s*|\s*geogebra\s*|\s*plaintext\s*)([\s\S]*?)```/);
    if (codeMatch) {
      const commands = codeMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
      return {
        success: true,
        commands: commands,
        xmlContent: null,
        viewRange: null
      };
    }
    
    return {
      success: false,
      commands: [],
      xmlContent: null,
      viewRange: null
    };
  }

  async function createGGBAppletInternal(containerId, commands, viewRange, xmlContent = null) {
    try {
      await ensureGeoGebraLoaded();
    } catch (e) {
      console.error('[GeoGebra] 库加载失败:', e);
      return null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[createGGBApplet] 容器不存在！');
      return null;
    }

    const initWidth = Math.max(container.clientWidth || 600, 320);
    const initHeight = Math.max(container.clientHeight || 400, 240);

    const params = {
        id: containerId,
        width: initWidth,
        height: initHeight,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        
        appName: "classic", 
        
        language: "en",
        enableLabelDrags: false,
        enableShiftDragZoom: true,
        showZoomButtons: true,
        capturingThreshold: null,
        useBrowserForJS: false,
    };

    if (viewRange) {
      params["xmin"] = viewRange.xMin || -10;
      params["xmax"] = viewRange.xMax || 10;
      params["ymin"] = viewRange.yMin || -10;
      params["ymax"] = viewRange.yMax || 10;
    }

    try {
      const applet = new GGBApplet(params, '5.0', containerId);
      
      let ggbApi = null;
      
      params.appletOnLoad = function(api) {
        ggbApi = api;
        try {
          if (typeof api.setErrorDialogsActive === 'function') api.setErrorDialogsActive(false);
        } catch(e) {}
        
        const containerEl = document.getElementById(containerId);
        const wrapperEl = containerEl ? containerEl.parentElement : null;
        
        if (wrapperEl && typeof ResizeObserver !== 'undefined') {
          const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
              const newWidth = entry.contentRect.width;
              const newHeight = 500; 
              
              if (newWidth > 100) {
                api.setSize(newWidth, newHeight);
              }
            }
          });
          
          resizeObserver.observe(wrapperEl);
        }
      };
      
      applet.inject(containerId, 'preferHTML5');

      const hasCommands = commands && commands.length > 0;
      const hasXml = xmlContent && xmlContent.trim().length > 0;
      
      if (hasCommands || hasXml) {
        const displayCommands = hasCommands ? commands : xmlContent;
        createCommandsDisplay(container, displayCommands);
        
        await new Promise((resolve) => {
          const startTime = Date.now();
          const checkInterval = setInterval(() => {
            if (!ggbApi) return;
            
            try {
              ggbApi.evalCommand('testReady=(0,0)');
              ggbApi.evalCommand('Delete[testReady]');
              clearInterval(checkInterval);
              
              setTimeout(async () => {
                if (hasXml) {
                  try {
                    ggbApi.evalXML(xmlContent);
                  } catch (e) {
                    console.error('[GeoGebra] XML 执行失败:', e);
                  }
                } else {
                  for (let i = 0; i < commands.length; i++) {
                    const cmd = commands[i];
                    try {
                      ggbApi.evalCommand(cmd);
                      await new Promise(r => setTimeout(r, 150));
                    } catch (e) {
                      console.error('[GeoGebra] 命令 ' + (i + 1) + ' 执行失败:', cmd, e);
                    }
                  }
                }
                
                setTimeout(function() {
                  try {
                    if (typeof ggbApi.evalCommand === 'function') {
                      ggbApi.evalCommand("SetAxesRatio[1, 1]");
                    }

                    if (viewRange && ggbApi.setCoordSystem) {
                      let xMin = viewRange.xMin || -10;
                      let xMax = viewRange.xMax || 10;
                      let yMin = viewRange.yMin || -10;
                      let yMax = viewRange.yMax || 10;

                      const containerEl = document.getElementById(containerId);
                      if (containerEl) {
                        const canvasWidth = containerEl.clientWidth || 600;
                        const canvasHeight = containerEl.clientHeight || 500;
                        const canvasRatio = canvasWidth / canvasHeight;

                        const desiredWidth = xMax - xMin;
                        const desiredHeight = yMax - yMin;
                        const desiredRatio = desiredWidth / desiredHeight;

                        if (canvasRatio > desiredRatio) {
                          const adjustedWidth = desiredHeight * canvasRatio;
                          const xCenter = (xMin + xMax) / 2;
                          xMin = xCenter - adjustedWidth / 2;
                          xMax = xCenter + adjustedWidth / 2;
                        } else {
                          const adjustedHeight = desiredWidth / canvasRatio;
                          const yCenter = (yMin + yMax) / 2;
                          yMin = yCenter - adjustedHeight / 2;
                          yMax = yCenter + adjustedHeight / 2;
                        }
                      }

                      ggbApi.setCoordSystem(xMin, xMax, yMin, yMax);
                      
                      if (typeof ggbApi.evalCommand === 'function') {
                        ggbApi.evalCommand("SetAxesRatio[1, 1]");
                      }
                    } else if (typeof ggbApi.zoomTo === 'function') {
                      ggbApi.zoomTo(200);
                    }
                    
                    if (typeof ggbApi.refreshViews === 'function') ggbApi.refreshViews();
                  } catch (e) {
                    console.error('[GeoGebra] 调整视图失败:', e);
                  }
                }, 300);
                
                resolve();
              }, 200);
            } catch (e) {
            }
            
            if (Date.now() - startTime > 20000) {
              clearInterval(checkInterval);
              console.error('[GeoGebra] 等待 applet 就绪超时');
              resolve();
            }
          }, 250);
        });
      }

      return applet;
    } catch (e) {
      console.error('[GeoGebra] 创建画板失败:', e);
      return null;
    }
  }

  function createGGBApplet(containerId, commands, viewRange, xmlContent = null) {
    return queueGGBApplet(containerId, commands, viewRange, xmlContent);
  }

  function parseMarkdown(text) {
    if (!text) return '';
    
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, (m, p1) => {
      codeBlocks.push(p1);
      return `@@CODEBLOCK${codeBlocks.length - 1}@@`;
    });

    const lines = text.split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const next = lines[i + 1] || '';

      const looksLikeTableHeader = line.indexOf('|') >= 0;
      const looksLikeSeparator = /^(\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*)$/.test(next);

      if (looksLikeTableHeader && looksLikeSeparator) {
        const headerCells = line.split('|').map(s => s.trim()).filter((v, idx, arr) => !(v === '' && (idx === 0 || idx === arr.length -1)));
        i += 2;

        const rows = [];
        while (i < lines.length && lines[i].indexOf('|') >= 0) {
          const rowCells = lines[i].split('|').map(s => s.trim()).filter((v, idx, arr) => !(v === '' && (idx === 0 || idx === arr.length -1)));
          if (rowCells.length === 0) break;
          rows.push(rowCells);
          i++;
        }

        let tableHtml = '<table class="ggb-markdown-table"><thead><tr>';
        headerCells.forEach(cell => {
          tableHtml += `<th>${escapeHtml(cell)}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        rows.forEach(r => {
          tableHtml += '<tr>';
          r.forEach(cell => {
            tableHtml += `<td>${escapeHtml(cell)}</td>`;
          });
          tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';

        out.push(tableHtml);
        continue;
      }

      out.push(line);
      i++;
    }

    text = out.join('\n');

    text = text
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    text = text.replace(/\n/g, '<br>');

    text = text.replace(/@@CODEBLOCK(\d+)@@/g, (m, idx) => {
      const code = codeBlocks[Number(idx)] || '';
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    });

    return text;
  }

  function formatMessage(content, streaming) {
    if (typeof content === 'object') {
      const textContent = content.find(c => c.type === 'text')?.text || '';
      return formatMessageFromText(textContent, streaming);
    }
    return formatMessageFromText(content, streaming);
  }

  function formatMessageFromText(content, streaming) {
    const extracted = extractGGBCommandsFromText(content);
    
    const hasCommands = extracted.commands && extracted.commands.length > 0;
    const hasXml = extracted.xmlContent && extracted.xmlContent.trim().length > 0;
    
    if (extracted.success && (hasCommands || hasXml)) {
      const displayContent = content
        .replace(/```ggb-xml\s*[\s\S]*?```/g, '')
        .replace(/```ggb-json\s*[\s\S]*?```/g, '')
        .replace(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)[\s\S]*?```/g, '');
      
      return {
        text: parseMarkdown(displayContent).trim(),
        hasGGB: true,
        commands: extracted.commands,
        xmlContent: extracted.xmlContent,
        viewRange: extracted.viewRange
      };
    }
    
    if (streaming) {
      const openIdx = content.indexOf('```ggb-xml');
      if (openIdx >= 0) {
        const beforeBlock = content.substring(0, openIdx);
        return {
          text: parseMarkdown(beforeBlock).trim() + '<div class="ggb-stream-loading"><span class="ggb-stream-spinner"></span> 正在生成 GeoGebra 命令...</div>',
          hasGGB: false
        };
      }
      const jsonOpenIdx = content.indexOf('```ggb-json');
      if (jsonOpenIdx >= 0) {
        const beforeBlock = content.substring(0, jsonOpenIdx);
        return {
          text: parseMarkdown(beforeBlock).trim() + '<div class="ggb-stream-loading"><span class="ggb-stream-spinner"></span> 正在生成 GeoGebra 命令...</div>',
          hasGGB: false
        };
      }
    }
    
    return {
      text: parseMarkdown(content),
      hasGGB: false
    };
  }

  async function sendMessage(text) {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const message = typeof text === 'string' ? text.trim() : userInput?.value?.trim();
    
    // 检查是否有图片或文字输入
    if (!message && !selectedImageData) {
      alert('请输入文字或添加图片');
      return;
    }
    
    const settings = getSettings();
    if (!settings.apiKey || !settings.endpoint || !settings.modelName) {
      alert('请先在设置中配置 API');
      return;
    }

    if (!currentChatId) {
      currentChatId = 'chat-' + Date.now();
    }

    if (sendBtn) sendBtn.disabled = true;
    if (userInput && typeof text !== 'string') userInput.value = '';
    
    // 构建多模态消息内容
    const messageContent = [];
    
    if (selectedImageData) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: selectedImageData
        }
      });
    }
    
    if (message) {
      messageContent.push({
        type: 'text',
        text: message
      });
    }
    
    // 如果只有图片，添加提示文字
    if (messageContent.length === 1 && messageContent[0].type === 'image_url') {
      messageContent.push({
        type: 'text',
        text: '根据这张图片画出数学图形'
      });
    }
    
    const finalContent = messageContent.length === 1 && messageContent[0].type === 'text' 
      ? messageContent[0].text 
      : messageContent;
    
    messageHistory.push({ role: 'user', content: finalContent });
    addMessageToUI(finalContent, 'user');
    
    // 清空图片预览
    hideImagePreview();
    
    const aiClient = new AiClient(settings.endpoint, settings.apiKey, settings.modelName);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory
    ];
    
    const aiContentDiv = addMessageToUI('', 'assistant');
    let fullResponse = '';
    let lastRenderTime = 0;
    const RENDER_INTERVAL = 60;
    
    await aiClient.stream(
      messages,
      (content) => {
        fullResponse = content;
        const now = Date.now();
        if (now - lastRenderTime < RENDER_INTERVAL) return;
        lastRenderTime = now;
        
        const formatted = formatMessage(content, true);
        aiContentDiv.innerHTML = formatted.text + '<span class="ggb-cursor-blink">▌</span>';
        chatContainer.scrollTop = chatContainer.scrollHeight;
      },
      (content) => {
        fullResponse = content || fullResponse;
        messageHistory.push({ role: 'assistant', content: fullResponse });
        
        const formatted = formatMessage(fullResponse);
        aiContentDiv.innerHTML = formatted.text;
        
        if (formatted.hasGGB && (formatted.commands && formatted.commands.length > 0 || formatted.xmlContent)) {
          const ggbContainerId = 'ggb-' + Date.now();
          const ggbWrapper = document.createElement('div');
          ggbWrapper.className = 'ggb-container-wrapper';
          
          const ggbContainer = document.createElement('div');
          ggbContainer.id = ggbContainerId;
          ggbContainer.className = 'ggb-container';
          ggbWrapper.appendChild(ggbContainer);
          
          const displayCommands = formatted.commands && formatted.commands.length > 0 ? formatted.commands : formatted.xmlContent;
          const commandsDiv = createCommandsDisplay(ggbContainer, displayCommands);
          aiContentDiv.appendChild(ggbWrapper);
          
          const container = document.getElementById(ggbContainerId);
          if (container) {
            createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange, formatted.xmlContent)
              .then(() => {
                console.log('[onComplete] 画板创建成功');
              })
              .catch(err => {
                console.error('[onComplete] 画板创建失败:', err);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'ggb-error-box';
                errorDiv.textContent = '⚠️ 画板加载失败，但您可以复制下方命令在 GeoGebra 中使用';
                commandsDiv?.appendChild(errorDiv);
              });
          }
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        sendBtn.disabled = false;
        saveCurrentChat();
      },
      (error) => {
        aiContentDiv.innerHTML = `<span class="ggb-error-text">错误: ${error}</span>`;
        sendBtn.disabled = false;
      }
    );
  }

  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  
  sendBtn?.addEventListener('click', sendMessage);
  userInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function bindExampleTags() {
    document.querySelectorAll('.example-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        sendMessage(tag.textContent);
      });
    });
  }

  bindExampleTags();

  renderHistoryList();
});