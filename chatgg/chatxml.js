document.addEventListener('DOMContentLoaded', () => {
  let selectedImageData = null;
  let selectedImageUrl = null;

  // ==================== 应用常量 ====================
  const APP_CONFIG = {
    welcomeTitle: '欢迎使用AI数学绘图助手',
    welcomeMessage: '输入数学作图需求,AI会自动帮你生成GeoGebra XML并绘制图形',
    defaultChatTitle: '新对话',
    exampleQuestions: [
      '画一个等边三角形',
      '构造圆的切线',
      '证明勾股定理'
    ]
  };

  function escapeHtmlForCommands(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createCommandsDisplay(container, xmlContent) {
    if (!xmlContent || !xmlContent.trim()) return null;
    
    const wrapper = container.parentElement;
    if (!wrapper) {
      console.warn('[createCommandsDisplay] 未找到容器包装器');
      return null;
    }
    
    let commandsDiv = wrapper.querySelector('.ggb-commands-display');
    if (commandsDiv) {
      console.log('[createCommandsDisplay] 命令显示区域已存在');
      return commandsDiv;
    }
    
    commandsDiv = document.createElement('div');
    commandsDiv.className = 'ggb-commands-display';
    
    const escapedXml = escapeHtmlForCommands(xmlContent);
    const commandItemsHtml = `<div class="ggb-command-item"><code>${escapedXml}</code></div>`;
    
    const copyIconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
    
    commandsDiv.innerHTML = `
      <div class="ggb-commands-header">
        <div class="ggb-commands-title">GeoGebra XML</div>
        <button class="copy-btn" onclick="copyGGBCommands(this)">
          ${copyIconSvg}
          <span>复制</span>
        </button>
      </div>
      <div class="ggb-commands-list">
        ${commandItemsHtml}
      </div>
    `;
    
    commandsDiv.dataset.xmlContent = xmlContent;
    wrapper.appendChild(commandsDiv);
    console.log('[createCommandsDisplay] ✓ XML显示区域已创建');
    return commandsDiv;
  }

  window.copyGGBCommands = function(button) {
    const commandsDiv = button.closest('.ggb-commands-display');
    if (!commandsDiv) return;
    
    try {
      const xmlContent = commandsDiv.dataset.xmlContent;
      if (!xmlContent) {
        alert('未找到XML数据');
        return;
      }
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(xmlContent).then(() => {
          showCopySuccess(button);
        }).catch(err => {
          console.error('[copyGGBCommands] Clipboard API 失败:', err);
          fallbackCopyToClipboard(xmlContent, button);
        });
      } else {
        fallbackCopyToClipboard(xmlContent, button);
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
        alert('复制失败，请手动选择并复制');
      }
    } catch (err) {
      console.error('[fallbackCopyToClipboard] 错误:', err);
      alert('复制失败，请手动选择并复制');
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
        const ggbLoaded = typeof GGBApplet !== 'undefined' && typeof GGBApplet === 'function';
        
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
    const { containerId, xmlContent, viewRange, resolve } = ggbAppletQueue.shift();
    
    createGGBAppletInternal(containerId, xmlContent, viewRange).then(result => {
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

  function queueGGBApplet(containerId, xmlContent, viewRange) {
    return new Promise(resolve => {
      ggbAppletQueue.push({ containerId, xmlContent, viewRange, resolve });
      processGGBAppletQueue();
    });
  }

  function createGGBApplet(containerId, xmlContent, viewRange) {
    return queueGGBApplet(containerId, xmlContent, viewRange);
  }

  async function createGGBAppletInternal(containerId, xmlContent, viewRange) {
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

      if (xmlContent && xmlContent.trim()) {
        createCommandsDisplay(container, xmlContent);
        
        await new Promise((resolve) => {
          const startTime = Date.now();
          const checkInterval = setInterval(() => {
            if (!ggbApi) return;
            
            try {
              ggbApi.evalCommand('testReady=(0,0)');
              ggbApi.evalCommand('Delete[testReady]');
              clearInterval(checkInterval);
              
              setTimeout(async () => {
                try {
                  ggbApi.evalXML(xmlContent);
                } catch (e) {
                  console.error('[GeoGebra] XML 执行失败:', e);
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
      
      return { success: true };
    } catch (error) {
      console.error('[GeoGebra] 创建失败:', error);
      return null;
    }
  }

  const sidebar = document.querySelector('.sidebar');
  const SIDEBAR_BREAKPOINT = 768;

  function checkSidebarAutoCollapse() {
    if (window.innerWidth <= SIDEBAR_BREAKPOINT) {
      sidebar?.classList.add('collapsed');
    } else {
      sidebar?.classList.remove('collapsed');
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
          <h3>${APP_CONFIG.welcomeTitle}</h3>
          <p>${APP_CONFIG.welcomeMessage}</p>
          <div class="welcome-examples">
            ${APP_CONFIG.exampleQuestions.map(q => `<button type="button" class="example-tag">${q}</button>`).join('')}
          </div>
        </div>
      `;
      bindExampleTags();
    }
    if (chatTitle) chatTitle.textContent = APP_CONFIG.defaultChatTitle;
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
  
  const SETTINGS_KEY = 'chatxml_settings';
  const HISTORY_KEY = 'chatxml_history';
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

  // ==================== 搜索历史记录功能 ====================
  
  function highlightSearchTerm(text, term) {
    if (!term) return escapeHtml(text);
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-result-highlight">$1</span>');
  }
  
  function searchHistory(keyword) {
    const history = loadHistory();
    if (!keyword.trim()) return [];
    
    const results = history.filter(chat => {
      const titleMatch = chat.title.toLowerCase().includes(keyword.toLowerCase());
      const messagesMatch = chat.messages.some(msg => {
        const content = typeof msg.content === 'object' 
          ? msg.content.find(c => c.type === 'text')?.text || ''
          : msg.content;
        return content.toLowerCase().includes(keyword.toLowerCase());
      });
      return titleMatch || messagesMatch;
    });
    
    return results;
  }
  
  function openSearchModal() {
    const searchModal = document.getElementById('search-modal');
    searchModal?.classList.add('active');
  }
  
  function closeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    searchModal?.classList.remove('active');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchClearBtn) searchClearBtn.style.display = 'none';
  }
  
  function renderSearchResults(keyword) {
    const resultsContainer = document.getElementById('search-results');
    const results = searchHistory(keyword);
    
    if (!resultsContainer) return;
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-no-results">未找到匹配的对话记录</div>';
      return;
    }
    
    resultsContainer.innerHTML = results.map(chat => {
      const firstUserMsg = chat.messages.find(m => m.role === 'user');
      const preview = firstUserMsg 
        ? (typeof firstUserMsg.content === 'object' 
            ? firstUserMsg.content.find(c => c.type === 'text')?.text || ''
            : firstUserMsg.content)
        : '';
      
      return `
        <div class="search-result-item" data-chat-id="${chat.id}">
          <div class="search-result-title">${highlightSearchTerm(chat.title, keyword)}</div>
          <div class="search-result-preview">${highlightSearchTerm(preview.substring(0, 100) + (preview.length > 100 ? '...' : ''), keyword)}</div>
        </div>
      `;
    }).join('');
    
    // 绑定点击事件
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.dataset.chatId;
        loadChat(chatId);
        closeSearchModal();
      });
    });
  }
  
  // ==================== 导出历史记录功能 ====================
  
  function exportHistory() {
    const history = loadHistory();
    if (history.length === 0) {
      alert('没有历史记录可以导出');
      return;
    }
    
    const dataStr = `// ChatGG 历史记录导出文件
// 导出时间: ${new Date().toLocaleString('zh-CN')}
// 记录数量: ${history.length}

const chatggHistoryData = ${JSON.stringify(history, null, 2)};`;
    
    const blob = new Blob([dataStr], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatgg_history_${Date.now()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`成功导出 ${history.length} 条历史记录`);
  }
  
  // ==================== 导入历史记录功能 ====================
  
  function importHistory(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        // 尝试解析 JavaScript 文件（提取 JSON 数据）
        let data;
        
        // 尝试匹配 const chatggHistoryData = ... 格式
        const match = content.match(/chatggHistoryData\s*=\s*(\[.*\]);/s);
        if (match) {
          data = JSON.parse(match[1]);
        } else {
          // 尝试直接解析为 JSON
          data = JSON.parse(content);
        }
        
        if (!Array.isArray(data)) {
          throw new Error('数据格式错误，应为数组');
        }
        
        const existingHistory = loadHistory();
        const newHistory = [...existingHistory];
        
        // 合并历史记录（去重）
        data.forEach(newChat => {
          const existingIndex = newHistory.findIndex(c => c.id === newChat.id);
          if (existingIndex >= 0) {
            newHistory[existingIndex] = newChat;
          } else {
            newHistory.unshift(newChat);
          }
        });
        
        // 限制最大数量
        if (newHistory.length > MAX_HISTORY) {
          newHistory.length = MAX_HISTORY;
        }
        
        saveHistory(newHistory);
        renderHistoryList();
        alert(`成功导入 ${data.length} 条历史记录`);
        
      } catch (err) {
        console.error('导入历史记录失败:', err);
        alert('导入失败：' + err.message);
      }
    };
    
    reader.readAsText(file);
  }
  
  // ==================== 绑定搜索和导入导出事件 ====================
  
  const openSearchBtn = document.getElementById('open-search-btn');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const exportHistoryBtn = document.getElementById('export-history-btn');
  const importHistoryBtn = document.getElementById('import-history-btn');
  const historyImportFile = document.getElementById('history-import-file');
  
  // 打开搜索弹窗
  openSearchBtn?.addEventListener('click', () => {
    openSearchModal();
    searchInput?.focus();
  });
  
  // 搜索输入事件
  searchInput?.addEventListener('input', (e) => {
    const keyword = e.target.value;
    if (searchClearBtn) searchClearBtn.style.display = keyword ? 'block' : 'none';
    
    if (keyword.length >= 2) {
      renderSearchResults(keyword);
    } else {
      renderSearchResults('');
    }
  });
  
  // 搜索输入回车键
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      renderSearchResults(e.target.value);
    }
  });
  
  // 清除搜索按钮
  searchClearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    renderSearchResults('');
  });
  
  // 关闭搜索弹窗
  closeSearchBtn?.addEventListener('click', closeSearchModal);
  
  // 点击弹窗背景关闭
  document.getElementById('search-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'search-modal') {
      closeSearchModal();
    }
  });
  
  // 导出历史按钮
  exportHistoryBtn?.addEventListener('click', exportHistory);
  
  // 导入历史按钮
  importHistoryBtn?.addEventListener('click', () => {
    historyImportFile?.click();
  });
  
  // 文件选择事件
  historyImportFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importHistory(file);
      e.target.value = ''; // 重置文件选择
    }
  });

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

  const imageInput = document.getElementById('image-input');
  const imageAttachmentBtn = document.getElementById('image-attachment-btn');
  const closePreviewBtn = document.getElementById('close-preview');

  imageInput?.addEventListener('change', handleImageUpload);
  imageAttachmentBtn?.addEventListener('click', () => {
    imageInput?.click();
  });
  closePreviewBtn?.addEventListener('click', hideImagePreview);

  const systemPrompt = `你是GeoGebra几何绘图专家。根据用户的几何作图需求，分步生成XML命令。

格式要求：
1. label属性标识对象，不用name属性
2. 点使用齐次坐标 <coords x="0.0" y="0.0" z="1.0"/>
3. 公式用<expression label="名称" exp="公式" type="类型"/>
4. 几何命令用<command name="命令"><input a0="A" a1="B"/><output a0="结果"/></command>

分步规则：
1. 先分析题目，列出绘图步骤规划（不输出XML）
2. 每步只画1-2个相关元素，输出XML后等待用户确认
3. 用户说"继续"或"下一步"后再画下一步
4. 用户可随时要求调整
5. ⚠️ 重要：每一步输出的XML必须包含**之前所有步骤的完整命令**，不是只输出当前步骤的命令

示例：
用户：画等边三角形
助手：好的，分步绘制等边三角形。

步骤规划：
1. 定义底边端点A、B
2. 旋转得到顶点C
3. 连接成三角形

第1步：定义点A(0,0)和B(4,0)
\`\`\`ggb-xml
<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
</construction>
\`\`\`
请确认后说"继续"。

用户：继续
助手：第2步：以A为中心旋转B 60°得到C
\`\`\`ggb-xml
<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  <element type="point" label="C"><coords x="2.0" y="3.4641" z="1.0"/></element>
</construction>
\`\`\`
请确认后说"继续"。

用户：继续
助手：第3步：连接A、B、C成三角形
\`\`\`ggb-xml
<construction>
  <element type="point" label="A"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="B"><coords x="4.0" y="0.0" z="1.0"/></element>
  <expression label="C" exp="Rotate[B, 60°, A]" type="point"/>
  <element type="point" label="C"><coords x="2.0" y="3.4641" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="B" a2="C"/><output a0="tri"/></command>
</construction>
\`\`\`
完成！`;

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
          createGGBApplet(ggbContainerId, formatted.xmlContent, formatted.viewRange);
        }, 100);
      }
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise([contentDiv]).catch(err => {
        console.warn('[MathJax] 渲染失败:', err);
      });
    }
    
    if (!skipScroll) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    return contentDiv;
  }

  function extractGGBCommands(content) {
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
            xmlContent: xmlContent,
            viewRange: null
          };
        }
      } catch (e) {
        console.error('XML 解析失败:', e);
      }
    }
    
    return {
      success: false,
      xmlContent: null,
      viewRange: null
    };
  }

  function formatMessage(content) {
    return formatMessageFromText(content);
  }

  function escapeHtmlForStreaming(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    let html = div.innerHTML;
    html = html.replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  function createLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant loading';
    loadingDiv.dataset.startTime = Date.now().toString();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const messages = [
      'AI正在思考...',
      '正在和数学图形斗智斗勇，马上胜利！',
      '画师 AI 在线作图，草稿变成品 ing。',
      '正在把公式变成看得见的样子',
      '数学元素正在排队入场，请耐心围观。',
      '偷偷打磨图形细节，力求完美！'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'thinking-text';
    thinkingDiv.innerHTML = `
      <span class="thinking-message">${randomMessage}</span>
      <span class="thinking-cursor">|</span>
      <span class="thinking-timer">0秒</span>
    `;
    
    contentDiv.appendChild(thinkingDiv);
    loadingDiv.appendChild(contentDiv);
    
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // 启动计时器更新
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timerSpan = loadingDiv.querySelector('.thinking-timer');
      if (timerSpan) {
        if (elapsed < 60) {
          timerSpan.textContent = `${elapsed}秒`;
        } else {
          const minutes = Math.floor(elapsed / 60);
          const seconds = elapsed % 60;
          timerSpan.textContent = `${minutes}分${seconds}秒`;
        }
      }
    }, 1000);
    
    loadingDiv.dataset.timerInterval = timerInterval;
    
    return loadingDiv;
  }

  function removeLoadingAnimation(loadingDiv) {
    if (loadingDiv && loadingDiv.parentNode) {
      // 清除计时器
      const timerInterval = loadingDiv.dataset.timerInterval;
      if (timerInterval) {
        clearInterval(parseInt(timerInterval));
      }
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
  }

  function formatMessageFromText(content) {
    const extracted = extractGGBCommandsFromText(content);
    
    if (extracted.success && extracted.xmlContent && extracted.xmlContent.trim()) {
      const displayContent = content.replace(/```ggb-xml\s*[\s\S]*?```/g, '');
      
      return {
        text: parseMarkdown(displayContent).trim(),
        hasGGB: true,
        xmlContent: extracted.xmlContent,
        viewRange: extracted.viewRange
      };
    }
    
    return {
      text: parseMarkdown(content),
      hasGGB: false
    };
  }

  function parseMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // 先提取代码块和行内代码，用占位符替换
    const codeBlocks = [];
    const inlineCodes = [];
    
    // 提取代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      codeBlocks.push({ lang, code: code.trim() });
      return `[[CODE_BLOCK_${codeBlocks.length - 1}]]`;
    });
    
    // 提取行内代码
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      inlineCodes.push(code);
      return `[[INLINE_CODE_${inlineCodes.length - 1}]]`;
    });
    
    // 对普通文本进行HTML转义
    html = escapeHtml(html);
    
    // 恢复代码块
    html = html.replace(/\[\[CODE_BLOCK_(\d+)\]\]/g, (match, idx) => {
      const block = codeBlocks[parseInt(idx)];
      return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
    });
    
    // 恢复行内代码
    html = html.replace(/\[\[INLINE_CODE_(\d+)\]\]/g, (match, idx) => {
      return `<code>${escapeHtml(inlineCodes[parseInt(idx)])}</code>`;
    });
    
    // 处理表格
    html = parseMarkdownTable(html);
    
    // 处理标题
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // 处理加粗和斜体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 处理段落和换行
    html = html.replace(/^\s*\n/g, '');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = `<p>${html}</p>`;
    
    return html;
  }

  function parseMarkdownTable(text) {
    if (!text.includes('|')) return text;
    
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

    return out.join('\n');
  }

  // 创建带超时和进度指示的请求
  function createRequestWithProgress(url, options, onProgress) {
    return new Promise((resolve, reject) => {
      const abortController = new AbortController();
      const timeout = 600000; // 10分钟超时
      
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error('请求超时，请重试'));
      }, timeout);
      
      // 定期检测请求状态
      const progressInterval = setInterval(() => {
        if (onProgress) {
          onProgress('in_progress');
        }
      }, 5000); // 每5秒更新一次状态
      
      fetch(url, {
        ...options,
        signal: abortController.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
          }).catch(() => {
            throw new Error(`HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        reject(error);
      });
    });
  }

  async function sendMessage() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!input || !sendBtn) {
      console.error('[sendMessage] 未找到输入框或发送按钮');
      return;
    }
    
    const content = input.value.trim();
    if (!content && !selectedImageData) {
      return;
    }
    
    input.value = '';
    sendBtn.disabled = true;
    
    const userContent = [];
    if (content) {
      userContent.push({ type: 'text', text: content });
    }
    if (selectedImageData) {
      userContent.push({ type: 'image_url', image_url: { url: selectedImageData } });
      hideImagePreview();
    }
    
    messageHistory.push({ role: 'user', content: userContent.length > 1 ? userContent : content });
    
    const userMsg = addMessageToUI(userContent.length > 1 ? userContent : content, 'user', false);
    
    if (!currentChatId) {
      currentChatId = Date.now().toString();
    }
    
    const settings = getSettings();
    
    const messagesForAPI = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    const loadingDiv = createLoadingAnimation();
    
    // 更新加载状态的函数
    const updateProgress = (status) => {
      const statusSpan = loadingDiv.querySelector('.thinking-message');
      if (statusSpan) {
        const messages = [
          'AI正在思考...',
          '正在和数学图形斗智斗勇，马上胜利！',
          '画师 AI 在线作图，草稿变成品 ing。',
          '正在把公式变成看得见的样子',
          '数学元素正在排队入场，请耐心围观。',
          '偷偷打磨图形细节，力求完美！',
          '正在处理复杂的几何关系...',
          '努力绘制精确的图形...'
        ];
        // 每5秒随机换一条消息，让用户知道还在工作
        if (status === 'in_progress') {
          const randomIndex = Math.floor(Math.random() * messages.length);
          statusSpan.textContent = messages[randomIndex];
        }
      }
    };
    
    try {
      const result = await createRequestWithProgress(
        `${settings.endpoint}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
          },
          body: JSON.stringify({
            model: settings.modelName,
            messages: messagesForAPI,
            stream: false,
            max_tokens: 4096,
            temperature: 0.3,
            top_p: 0.9,
            presence_penalty: 0,
            frequency_penalty: 0
          })
        },
        updateProgress
      );
      
      const aiContent = result.choices?.[0]?.message?.content || '';
      
      removeLoadingAnimation(loadingDiv);
      
      if (aiContent) {
        messageHistory.push({ role: 'assistant', content: aiContent });
        const aiContentDiv = addMessageToUI(aiContent, 'assistant', false);
        
        const formatted = formatMessage(aiContent);
        aiContentDiv.innerHTML = formatted.text;
        
        if (typeof MathJax !== 'undefined') {
          MathJax.typesetPromise([aiContentDiv]).catch(err => {
            console.warn('[MathJax] 渲染失败:', err);
          });
        }
        
        if (formatted.hasGGB && formatted.xmlContent && formatted.xmlContent.trim()) {
          const ggbContainerId = 'ggb-' + Date.now();
          const ggbWrapper = document.createElement('div');
          ggbWrapper.className = 'ggb-container-wrapper';
          
          const ggbContainer = document.createElement('div');
          ggbContainer.id = ggbContainerId;
          ggbContainer.className = 'ggb-container';
          ggbWrapper.appendChild(ggbContainer);
          
          createCommandsDisplay(ggbContainer, formatted.xmlContent);
          aiContentDiv.appendChild(ggbWrapper);
          
          const container = document.getElementById(ggbContainerId);
          if (container) {
            createGGBApplet(ggbContainerId, formatted.xmlContent, formatted.viewRange)
              .then(() => {
                console.log('[onComplete] 画板创建成功');
              })
              .catch(err => {
                console.error('[onComplete] 画板创建失败:', err);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'ggb-error-box';
                errorDiv.textContent = '⚠️ 画板加载失败，但您可以复制下方XML在 GeoGebra 中使用';
                ggbWrapper.appendChild(errorDiv);
              });
          }
        }
      }
      
      saveCurrentChat();
    } catch (error) {
      removeLoadingAnimation(loadingDiv);
      console.error('发送消息失败:', error);
      const errorMsg = {
        role: 'assistant',
        content: `抱歉，发生错误：${error.message}`
      };
      messageHistory.push(errorMsg);
      addMessageToUI(errorMsg.content, 'assistant', false);
    } finally {
      sendBtn.disabled = false;
    }
  }

  const messageInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');

  messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn?.addEventListener('click', sendMessage);

  function bindExampleTags() {
    document.querySelectorAll('.example-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (messageInput) {
          messageInput.value = tag.textContent;
          messageInput.focus();
        }
      });
    });
  }

  bindExampleTags();
  renderHistoryList();
  loadSettings();
});
