document.addEventListener('DOMContentLoaded', () => {
  // ==================== 工具函数 ====================
  
  function escapeHtmlForCommands(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function createCommandsDisplay(container, commands) {
    if (!commands || commands.length === 0) return null;
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
    
    const commandItemsHtml = commands.map((cmd) => {
      const escapedCmd = escapeHtmlForCommands(cmd);
      return `<div class="ggb-command-item"><code>${escapedCmd}</code></div>`;
    }).join('');
    
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
    
    commandsDiv.dataset.commands = JSON.stringify(commands);
    wrapper.appendChild(commandsDiv);
    console.log('[createCommandsDisplay] ✓ 命令显示区域已创建，包含', commands.length, '条命令');
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
    const { containerId, commands, viewRange, resolve } = ggbAppletQueue.shift();
    
    createGGBAppletInternal(containerId, commands, viewRange).then(result => {
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
  
  function queueGGBApplet(containerId, commands, viewRange) {
    return new Promise(resolve => {
      ggbAppletQueue.push({ containerId, commands, viewRange, resolve });
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
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });

  const chatTitle = document.getElementById('chat-title');
  const chatContainer = document.getElementById('chat-container');

  function resetChat() {
    saveCurrentChat();
    
    currentChatId = null;
    messageHistory = [];
    
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
    provider: document.getElementById('model-provider'),
    endpoint: document.getElementById('api-endpoint'),
    apiKey: document.getElementById('api-key'),
    modelName: document.getElementById('model-name')
  };
  
  const SETTINGS_KEY = 'chatgg_settings';
  const HISTORY_KEY = 'chatgg_history';
  const MAX_HISTORY = 50;
  let currentChatId = null;
  
  const defaultSettings = {
    provider: 'zhipu',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    modelName: 'glm-5v-turbo'
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
  saveSettingsBtn?.addEventListener('click', saveSettings);
  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });

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
    const text = firstUserMsg.content.trim();
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
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

  // ==================== 对话处理逻辑 ====================
  
  const systemPrompt = `你是一个GeoGebra几何绘图专家。请根据用户的几何作图需求，生成正确的GeoGebra命令。

规则：
1. 先用自然语言简要解释绘图思路和步骤
2. 然后将所有GeoGebra命令放在一个 \`\`\`ggb-json\`\`\` 代码块中，使用JSON格式：
   {
     "commands": ["命令1", "命令2", ...],
     "viewRange": {"xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10}
   }
3. commands 数组中的每个命令使用GeoGebra脚本格式，如 Circle[A, B]
4. viewRange 指定合适的视图范围（可选，默认 -10 到 10）
5. 最后在代码块后补充说明或注意事项

示例：

我来画一个等边三角形。

首先定义三个顶点，然后连接它们。

\`\`\`ggb-json
{
  "commands": [
    "A = (0, 0)",
    "B = (4, 0)",
    "C = Rotate[B, 60°, A]",
    "triangle = Polygon[A, B, C]"
  ],
  "viewRange": {
    "xMin": -1,
    "xMax": 5,
    "yMin": -1,
    "yMax": 4
  }
}
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
        createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange);
      }, 100);
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    if (!skipScroll) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    return contentDiv;
  }

  function extractGGBCommands(content) {
    const jsonMatch = content.match(/```ggb-json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        return {
          success: true,
          commands: jsonData.commands || [],
          viewRange: jsonData.viewRange || null
        };
      } catch (e) {
        console.error('JSON 解析失败:', e);
      }
    }
    
    const codeMatch = content.match(/```(?:\s*ggb(?!-json)\s*|\s*geogebra\s*|\s*plaintext\s*)([\s\S]*?)```/);
    if (codeMatch) {
      const commands = codeMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
      return {
        success: true,
        commands: commands,
        viewRange: null
      };
    }
    
    return {
      success: false,
      commands: [],
      viewRange: null
    };
  }

  async function createGGBAppletInternal(containerId, commands, viewRange) {
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
      "id": containerId,
      "width": initWidth,
      "height": initHeight,
      "showToolBar": false,
      "showAlgebraInput": false,
      "showMenuBar": false,
      "appName": "geometry",
      "language": "en",
      "enableLabelDrags": false,
      "enableShiftDragZoom": true,
      "showZoomButtons": true,
      "capturingThreshold": null,
      "useBrowserForJS": false
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
        
        setTimeout(() => {
          try { hideGGBAlgebraPanel(containerId); } catch(e) {}
        }, 500);
      };
      
      applet.inject(containerId, 'preferHTML5');

      if (commands && commands.length > 0) {
        createCommandsDisplay(container, commands);
        
        await new Promise((resolve) => {
          const startTime = Date.now();
          const checkInterval = setInterval(() => {
            if (!ggbApi) return;
            
            try {
              ggbApi.evalCommand('testReady=(0,0)');
              ggbApi.evalCommand('Delete[testReady]');
              clearInterval(checkInterval);
              
              setTimeout(async () => {
                for (let i = 0; i < commands.length; i++) {
                  const cmd = commands[i];
                  try {
                    ggbApi.evalCommand(cmd);
                    await new Promise(r => setTimeout(r, 150));
                  } catch (e) {
                    console.error('[GeoGebra] 命令 ' + (i + 1) + ' 执行失败:', cmd, e);
                  }
                }
                
                setTimeout(function() {
                  try {
                    if (viewRange && ggbApi.setCoordSystem) {
                      ggbApi.setCoordSystem(
                        viewRange.xMin || -10, viewRange.xMax || 10,
                        viewRange.yMin || -10, viewRange.yMax || 10
                      );
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

  function createGGBApplet(containerId, commands, viewRange) {
    return queueGGBApplet(containerId, commands, viewRange);
  }

  function parseMarkdown(text) {
    return text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function formatMessage(content) {
    const extracted = extractGGBCommands(content);
    
    if (extracted.success && extracted.commands.length > 0) {
      const displayContent = content
        .replace(/```ggb-json\s*[\s\S]*?```/g, '')
        .replace(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)[\s\S]*?```/g, '');
      
      return {
        text: parseMarkdown(displayContent).trim(),
        hasGGB: true,
        commands: extracted.commands,
        viewRange: extracted.viewRange
      };
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
    
    if (!message) return;
    
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
    
    messageHistory.push({ role: 'user', content: message });
    addMessageToUI(message, 'user');
    
    const aiClient = new AiClient(settings.endpoint, settings.apiKey, settings.modelName);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory
    ];
    
    const aiContentDiv = addMessageToUI('', 'assistant');
    let fullResponse = '';
    

    
    await aiClient.sendMessage(
      messages,
      (content) => {
        fullResponse = content;
        const formatted = formatMessage(content);
        aiContentDiv.innerHTML = formatted.text;
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
      },
      (content) => {
        console.log('\n\n');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║           [onComplete] 回调被触发了！                    ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('\n');
        
        fullResponse = content || fullResponse;
        messageHistory.push({ role: 'assistant', content: fullResponse });
        
        console.log('[onComplete] ========== 开始处理最终响应 ==========');
        console.log('[onComplete] 响应内容长度:', fullResponse.length);
        console.log('[onComplete] 响应前200字符:', fullResponse.substring(0, 200));
        
        const formatted = formatMessage(fullResponse);
        console.log('[onComplete] 解析结果:');
        console.log('  - hasGGB:', formatted.hasGGB);
        console.log('  - 命令数量:', formatted.commands ? formatted.commands.length : 0);
        if (formatted.commands && formatted.commands.length > 0) {
          console.log('  - 命令列表:', formatted.commands);
          console.log('  - 视图范围:', formatted.viewRange);
        }
        
        aiContentDiv.innerHTML = formatted.text;
        console.log('[onComplete] 已设置文本内容，HTML长度:', formatted.text.length);
        
        if (formatted.hasGGB && formatted.commands && formatted.commands.length > 0) {
          console.log('[onComplete] ✓ 检测到 GeoGebra 命令，开始创建画板和命令显示区域');
          const ggbContainerId = 'ggb-' + Date.now();
          console.log('[onComplete] 画板ID:', ggbContainerId);
          
          const ggbWrapper = document.createElement('div');
          ggbWrapper.className = 'ggb-container-wrapper';
          
          const ggbContainer = document.createElement('div');
          ggbContainer.id = ggbContainerId;
          ggbContainer.className = 'ggb-container';
          ggbWrapper.appendChild(ggbContainer);
          console.log('[onComplete] 画板容器已创建');
          
          const commandsDiv = createCommandsDisplay(ggbContainer, formatted.commands);
          
          aiContentDiv.appendChild(ggbWrapper);
          console.log('[onComplete] ✓ 画板和命令显示区域已添加到DOM');
          
          const container = document.getElementById(ggbContainerId);
          if (container) {
            console.log('[onComplete] ✓ 容器元素验证通过');
            
            createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange)
              .then(() => {
                console.log('[onComplete] ✓✓✓ 画板创建成功！');
              })
              .catch(err => {
                console.error('[onComplete] ✗ 画板创建失败:', err);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'ggb-error-box';
                errorDiv.textContent = '⚠️ 画板加载失败，但您可以复制下方命令在 GeoGebra 中使用';
                commandsDiv?.appendChild(errorDiv);
              });
          } else {
            console.error('[onComplete] ✗ 容器元素验证失败！');
          }
        } else {
          console.log('[onComplete] ℹ 没有GeoGebra命令或命令为空');
          if (!formatted.hasGGB) {
            console.log('[onComplete]   原因: formatMessage 返回 hasGGB=false');
          }
          if (!formatted.commands || formatted.commands.length === 0) {
            console.log('[onComplete]   原因: commands 数组为空或不存在');
          }
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        sendBtn.disabled = false;
        saveCurrentChat();
        console.log('[onComplete] ========== 处理完成 ==========');
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

  const exampleTags = document.querySelectorAll('.example-tag');
  exampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      sendMessage(tag.textContent);
    });
  });

  renderHistoryList();
});

