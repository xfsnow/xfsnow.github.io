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
  
  function preloadGeoGebraLib() {
    if (window.ggbLibLoaded || window.ggbLibLoading) {
      return;
    }
    
    window.ggbLibLoading = true;
    
    const preloadContainer = document.getElementById('ggb-preload-container');
    if (!preloadContainer) {
      console.error('[GeoGebra] 预加载容器不存在');
      window.ggbLibLoading = false;
      return;
    }
    
    try {
      const preloadParams = {
        "id": "ggb-preload-applet",
        "width": 1,
        "height": 1,
        "showToolBar": false,
        "showAlgebraInput": false,
        "showMenuBar": false,
        "showToolBarHelp": false,
        "showResetIcon": false,
        "enableLabelDrags": false,
        "enableShiftDragZoom": false,
        "enableRightClick": false,
        "showZoomButtons": false,
        "showFullscreenButton": false,
        "scale": 0.01,
        "appletOnLoad": function(api) {
        }
      };
      
      const preloadApplet = new GGBApplet(preloadParams, '5.0', 'ggb-preload-applet');
      preloadApplet.inject('ggb-preload-container', 'preferHTML5');
      
      const checkInterval = setInterval(() => {
        if (typeof GGBApplet !== 'undefined') {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          window.ggbLibLoading = false;
        }
      }, 200);
      
      setTimeout(() => {
        if (!window.ggbLibLoaded) {
          clearInterval(checkInterval);
          window.ggbLibLoading = false;
          console.error('[GeoGebra] 库预加载超时');
        }
      }, 15000);
      
    } catch (e) {
      console.error('[GeoGebra] 预加载失败:', e);
      window.ggbLibLoading = false;
    }
  }
  
  preloadGeoGebraLib();

  const sidebar = document.querySelector('.sidebar');
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });

  const chatTitle = document.getElementById('chat-title');
  const chatContainer = document.getElementById('chat-container');

  function resetChat() {
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
    messageHistory = [];
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

  function addMessageToUI(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const formatted = formatMessage(content);
    contentDiv.innerHTML = formatted.text;
    
    if (formatted.hasGGB && role === 'assistant') {
      const ggbContainerId = 'ggb-' + Date.now();
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
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return contentDiv;
  }

  function extractGGBCommands(content) {
    console.log('[extractGGBCommands] 开始提取，内容长度:', content.length);
    
    const jsonMatch = content.match(/```ggb-json\s*([\s\S]*?)```/);
    
    if (jsonMatch) {
      console.log('[extractGGBCommands] 找到 ggb-json 代码块');
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        console.log('[extractGGBCommands] 解析成功，命令数量:', jsonData.commands ? jsonData.commands.length : 0);
        return {
          success: true,
          commands: jsonData.commands || [],
          viewRange: jsonData.viewRange || null,
          explanation: content.replace(/```ggb-json[\s\S]*?```/g, '').trim()
        };
      } catch (e) {
        console.error('JSON 解析失败:', e);
        return { 
          success: false, 
          error: 'JSON 格式错误',
          rawContent: content 
        };
      }
    }
    
    console.log('[extractGGBCommands] 未找到 ggb-json，尝试旧格式');
    return parseOldFormat(content);
  }

  function parseOldFormat(content) {
    const codeMatch = content.match(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)([\s\S]*?)```/);
    
    if (codeMatch) {
      console.log('[parseOldFormat] 找到代码块');
      const commands = codeMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
      
      console.log('[parseOldFormat] 提取到命令数量:', commands.length);
      
      return {
        success: true,
        commands: commands,
        viewRange: null,
        explanation: content.replace(/```[\s\S]*?```/g, '').trim()
      };
    }
    
    console.log('[parseOldFormat] 未找到任何代码块');
    return {
      success: false,
      error: '未找到 GeoGebra 命令',
      rawContent: content
    };
  }

  function waitForGeoGebraLib(timeout = 15000) {
    return new Promise((resolve, reject) => {
      if (window.ggbLibLoaded) {
        resolve(true);
        return;
      }

      const canUseGGB = typeof GGBApplet !== 'undefined' || 
                        (window.GGBApplet && typeof window.GGBApplet === 'function');
      
      if (canUseGGB) {
        window.ggbLibLoaded = true;
        resolve(true);
        return;
      }
      
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const ggbLoaded = typeof GGBApplet !== 'undefined' || 
                          (window.GGBApplet && typeof window.GGBApplet === 'function');
        
        if (ggbLoaded) {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          console.error('[GeoGebra] 库加载超时，请检查网络连接');
          console.error('[GeoGebra] CDN 地址: https://cdn.geogebra.org/apps/deployggb.js');
          reject(new Error('GeoGebra 库加载超时，请检查网络连接'));
        }
      }, 200);
    });
  }

  async function createGGBApplet(containerId, commands, viewRange) {
    console.log('[createGGBApplet] 开始创建，容器ID:', containerId);
    console.log('[createGGBApplet] 命令数量:', commands ? commands.length : 0);
    console.log('[createGGBApplet] 视图范围:', viewRange);
    
    try {
      await waitForGeoGebraLib();
      console.log('[createGGBApplet] GeoGebra库已加载');
    } catch (e) {
      console.error('[GeoGebra] 库加载失败:', e);
      return null;
    }

    const params = {
      "id": containerId,
      "width": 600,
      "height": 400,
      "showToolBar": false,
      "showAlgebraInput": false,
      "showMenuBar": false,
      "appName": "graphing",
      "language": "zh-CN",
      "scale": 0.9,
      "enableLabelDrags": false,
      "enableShiftDragZoom": true,
      "showZoomButtons": true,
      "capturingThreshold": null,
      "useBrowserForJS": false,
      "appletOnLoad": function(api) {
        console.log('[createGGBApplet] appletOnLoad 回调触发');
        
        if (commands && commands.length > 0) {
          console.log('[createGGBApplet] 开始执行', commands.length, '条命令');
          commands.forEach((cmd, index) => {
            try {
              api.evalCommand(cmd);
              console.log('[createGGBApplet] 命令', index + 1, '执行成功:', cmd);
            } catch (e) {
              console.error('[GeoGebra] 命令 ' + (index + 1) + ' 执行失败:', cmd, e);
            }
          });
          
          setTimeout(function() {
            try {
              if (viewRange) {
                api.setCoordSystem(
                  viewRange.xMin || -10,
                  viewRange.xMax || 10,
                  viewRange.yMin || -10,
                  viewRange.yMax || 10
                );
                console.log('[createGGBApplet] 已设置视图范围');
              } else {
                if (typeof api.zoomTo === 'function') {
                  api.zoomTo(200); // 默认缩放级别
                  console.log('[createGGBApplet] 已调用zoomTo');
                }
              }
              
              if (typeof api.refreshViews === 'function') {
                api.refreshViews();
                console.log('[createGGBApplet] 已刷新视图');
              }
            } catch (e) {
              console.error('[GeoGebra] 调整视图失败:', e);
            }
          }, 500);
        }
      }
    };

    if (viewRange) {
      params["xmin"] = viewRange.xMin || -10;
      params["xmax"] = viewRange.xMax || 10;
      params["ymin"] = viewRange.yMin || -10;
      params["ymax"] = viewRange.yMax || 10;
    }

    try {
      console.log('[createGGBApplet] 开始注入画板到容器:', containerId);
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('[createGGBApplet] 容器不存在！');
        return null;
      }
      console.log('[createGGBApplet] 容器存在，尺寸:', container.clientWidth, 'x', container.clientHeight);
      
      const applet = new GGBApplet(params, '5.0', containerId);
      applet.inject(containerId, 'preferHTML5');
      console.log('[createGGBApplet] 画板注入完成');
      
      if (commands && commands.length > 0) {
        createCommandsDisplay(container, commands);
      }
      
      return applet;
    } catch (e) {
      console.error('[GeoGebra] 创建画板失败:', e);
      return null;
    }
  }

  function formatMessage(content) {
    console.log('[formatMessage] 开始处理，内容长度:', content.length);
    
    const extracted = extractGGBCommands(content);
    console.log('[formatMessage] 提取结果:', extracted.success ? '成功' : '失败', '命令数量:', extracted.commands ? extracted.commands.length : 0);
    
    if (extracted.success && extracted.commands.length > 0) {
      let displayContent = content;
      
      displayContent = displayContent.replace(/```ggb-json\s*[\s\S]*?```/g, '');
      displayContent = displayContent.replace(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)[\s\S]*?```/g, '');
      
      console.log('[formatMessage] 移除代码块后内容长度:', displayContent.length);
      
      displayContent = displayContent.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
      displayContent = displayContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      displayContent = displayContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      displayContent = displayContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
      
      displayContent = displayContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      displayContent = displayContent.replace(/\n/g, '<br>');
      
      console.log('[formatMessage] 最终HTML长度:', displayContent.length);
      
      return {
        text: displayContent.trim(),
        hasGGB: true,
        commands: extracted.commands,
        viewRange: extracted.viewRange
      };
    }
    
    let formatted = content;
    
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formatted = formatted.replace(/\n/g, '<br>');
    
    return {
      text: formatted,
      hasGGB: false
    };
  }

  async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    const settings = getSettings();
    if (!settings.apiKey || !settings.endpoint || !settings.modelName) {
      alert('请先在设置中配置 API');
      return;
    }

    sendBtn.disabled = true;
    userInput.value = '';
    
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
      const message = tag.textContent;
      
      const settings = getSettings();
      if (!settings.apiKey || !settings.endpoint || !settings.modelName) {
        alert('请先在设置中配置 API');
        return;
      }
      
      const sendBtn = document.getElementById('send-btn');
      const userInput = document.getElementById('user-input');
      
      sendBtn.disabled = true;
      
      messageHistory.push({ role: 'user', content: message });
      addMessageToUI(message, 'user');
      
      const aiClient = new AiClient(settings.endpoint, settings.apiKey, settings.modelName);
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...messageHistory
      ];
      
      const aiContentDiv = addMessageToUI('', 'assistant');
      let fullResponse = '';
      
      aiClient.sendMessage(
        messages,
        (content) => {
          fullResponse = content;
          const formatted = formatMessage(content);
          aiContentDiv.innerHTML = formatted.text;
          
          chatContainer.scrollTop = chatContainer.scrollHeight;
        },
        (content) => {
          fullResponse = content || fullResponse;
          messageHistory.push({ role: 'assistant', content: fullResponse });
          
          const formatted = formatMessage(fullResponse);
          aiContentDiv.innerHTML = formatted.text;
          
          if (formatted.hasGGB) {
            const ggbContainerId = 'ggb-' + Date.now();
            const ggbWrapper = document.createElement('div');
            ggbWrapper.className = 'ggb-container-wrapper';
            ggbWrapper.innerHTML = `
              <div id="${ggbContainerId}" class="ggb-container"></div>
            `;
            aiContentDiv.appendChild(ggbWrapper);
            
            createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange);
          }
          
          chatContainer.scrollTop = chatContainer.scrollHeight;
          sendBtn.disabled = false;
        },
        (error) => {
          aiContentDiv.innerHTML = `<span class="ggb-error-text">错误: ${error}</span>`;
          sendBtn.disabled = false;
        }
      );
    });
  });
});

// ==================== 全局辅助函数 ====================

window.rerenderGGB = function(containerId) {
  // TODO: 实现重绘逻辑
};

