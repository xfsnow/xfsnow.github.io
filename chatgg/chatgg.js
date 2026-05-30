document.addEventListener('DOMContentLoaded', () => {
  // ==================== 工具函数 ====================
  
  // HTML 转义函数（全局可用）
  function escapeHtmlForCommands(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 复制 GeoGebra 命令到剪贴板（全局函数，供 onclick 调用）
  window.copyGGBCommands = function(button) {
    const commandsDiv = button.closest('.ggb-commands-display');
    if (!commandsDiv) return;
    
    try {
      const commandsData = commandsDiv.dataset.commands;
      if (!commandsData) {
        console.warn('[copyGGBCommands] 未找到命令数据');
        alert('未找到命令数据');
        return;
      }
      
      const commands = JSON.parse(commandsData);
      const commandText = commands.join('\n');
      
      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(commandText).then(() => {
          showCopySuccess(button);
          console.log('[copyGGBCommands] ✓ 命令已复制到剪贴板');
        }).catch(err => {
          console.error('[copyGGBCommands] ✗ Clipboard API 失败:', err);
          fallbackCopyToClipboard(commandText, button);
        });
      } else {
        // 降级方案：使用传统方法
        console.log('[copyGGBCommands] 使用降级复制方案');
        fallbackCopyToClipboard(commandText, button);
      }
    } catch (e) {
      console.error('[copyGGBCommands] ✗ 错误:', e);
      alert('复制出错：' + e.message);
    }
  };
  
  // 显示复制成功提示
  function showCopySuccess(button) {
    const originalHtml = button.innerHTML;
    
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="color: #52c41a;">已复制</span>
    `;
    
    // 2秒后恢复原状
    setTimeout(() => {
      button.innerHTML = originalHtml;
    }, 2000);
  }
  
  // 降级复制方案（兼容旧浏览器和非HTTPS环境）
  function fallbackCopyToClipboard(text, button) {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      
      // 选择并复制
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showCopySuccess(button);
        console.log('[fallbackCopyToClipboard] ✓ 命令已复制（降级方案）');
      } else {
        console.error('[fallbackCopyToClipboard] ✗ 复制失败');
        alert('复制失败，请手动选择并复制命令');
      }
    } catch (err) {
      console.error('[fallbackCopyToClipboard] ✗ 错误:', err);
      alert('复制失败，请手动选择并复制命令');
    }
  }
  
  // GeoGebra 加载状态
  window.ggbLibLoaded = false;
  window.ggbLibLoading = false;
  
  // 预加载 GeoGebra 库
  function preloadGeoGebraLib() {
    if (window.ggbLibLoaded || window.ggbLibLoading) {
      return;
    }
    
    window.ggbLibLoading = true;
    
    // 尝试在隐藏容器中初始化 GeoGebra
    const preloadContainer = document.getElementById('ggb-preload-container');
    if (!preloadContainer) {
      console.error('[GeoGebra] 预加载容器不存在');
      window.ggbLibLoading = false;
      return;
    }
    
    // 创建一个超小的 applet 来触发库加载
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
          // 预加载完成
        }
      };
      
      const preloadApplet = new GGBApplet(preloadParams, '5.0', 'ggb-preload-applet');
      preloadApplet.inject('ggb-preload-container', 'preferHTML5');
      
      // 轮询检查库是否完全加载
      const checkInterval = setInterval(() => {
        if (typeof GGBApplet !== 'undefined') {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          window.ggbLibLoading = false;
        }
      }, 200);
      
      // 15秒后超时
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
  
  // 立即开始预加载
  preloadGeoGebraLib();

  // 点击 id="toggle-sidebar-btn" 的按钮时,切换 .sidebar 的 collapsed 状态
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const sidebar = document.querySelector('.sidebar');

  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // 新建对话按钮功能
  const newChatHeaderBtn = document.getElementById('new-chat-header-btn');
  const newChatSidebarBtn = document.getElementById('new-chat-btn');
  const chatTitle = document.getElementById('chat-title');
  const chatContainer = document.getElementById('chat-container');

  function resetChat() {
    // 清空聊天内容
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
    
    // 重置标题
    if (chatTitle) {
      chatTitle.textContent = '新对话';
    }
    
    // 清空消息历史
    messageHistory = [];
  }

  if (newChatHeaderBtn) {
    newChatHeaderBtn.addEventListener('click', resetChat);
  }

  if (newChatSidebarBtn) {
    newChatSidebarBtn.addEventListener('click', resetChat);
  }

  // 设置面板功能
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  
  // 设置项元素
  const modelProvider = document.getElementById('model-provider');
  const apiEndpoint = document.getElementById('api-endpoint');
  const apiKey = document.getElementById('api-key');
  const modelName = document.getElementById('model-name');
  
  // localStorage 键名
  const SETTINGS_KEY = 'chatgg_settings';
  
  // 默认配置
  const defaultSettings = {
    provider: 'zhipu',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    modelName: 'glm-5v-turbo'
  };
  
  // 加载设置
  function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        modelProvider.value = settings.provider || defaultSettings.provider;
        apiEndpoint.value = settings.endpoint || defaultSettings.endpoint;
        apiKey.value = settings.apiKey || defaultSettings.apiKey;
        modelName.value = settings.modelName || defaultSettings.modelName;
      } catch (e) {
        console.error('加载设置失败:', e);
        useDefaultSettings();
      }
    } else {
      useDefaultSettings();
    }
  }
  
  // 使用默认设置
  function useDefaultSettings() {
    modelProvider.value = defaultSettings.provider;
    apiEndpoint.value = defaultSettings.endpoint;
    apiKey.value = defaultSettings.apiKey;
    modelName.value = defaultSettings.modelName;
  }
  
  // 保存设置
  function saveSettings() {
    const settings = {
      provider: modelProvider.value,
      endpoint: apiEndpoint.value,
      apiKey: apiKey.value,
      modelName: modelName.value
    };
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      alert('设置已保存');
      closeSettingsModal();
    } catch (e) {
      console.error('保存设置失败:', e);
      alert('保存设置失败，请重试');
    }
  }
  
  // 打开设置弹窗
  function openSettingsModal() {
    if (settingsModal) {
      loadSettings();
      settingsModal.classList.add('active');
    }
  }
  
  // 关闭设置弹窗
  function closeSettingsModal() {
    if (settingsModal) {
      settingsModal.classList.remove('active');
    }
  }
  
  // 绑定事件
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsModal);
  }
  
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettingsModal);
  }
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // 点击遮罩层关闭
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettingsModal();
      }
    });
  }

  // ==================== 对话处理逻辑 ====================
  
  // 系统提示语
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

  // 消息历史
  let messageHistory = [];

  // 获取设置
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

  // 添加消息到界面
  function addMessageToUI(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // 格式化消息
    const formatted = formatMessage(content);
    contentDiv.innerHTML = formatted.text;
    
    // 如果有 GeoGebra 命令，创建画板
    if (formatted.hasGGB && role === 'assistant') {
      const ggbContainerId = 'ggb-' + Date.now();
      const ggbWrapper = document.createElement('div');
      ggbWrapper.className = 'ggb-container-wrapper';
      ggbWrapper.innerHTML = `
        <div id="${ggbContainerId}" class="ggb-container"></div>
        <div class="ggb-actions">
          <button class="ggb-btn" onclick="rerenderGGB('${ggbContainerId}')">重新绘制</button>
          <button class="ggb-btn" onclick="copyGGBCommands(${JSON.stringify(formatted.commands).replace(/"/g, '&quot;')})">复制命令</button>
        </div>
      `;
      contentDiv.appendChild(ggbWrapper);
      
      // 延迟创建画板（确保 DOM 已插入）
      setTimeout(() => {
        createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange);
      }, 100);
    }
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return contentDiv;
  }

  // 从 AI 响应中提取 GeoGebra 命令（JSON格式）
  function extractGGBCommands(content) {
    console.log('[extractGGBCommands] 开始提取，内容长度:', content.length);
    
    // 尝试匹配 ggb-json 代码块
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
    
    // 回退到旧的解析方式（兼容旧格式）
    console.log('[extractGGBCommands] 未找到 ggb-json，尝试旧格式');
    return parseOldFormat(content);
  }

  // 旧的解析方式（向后兼容）
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
    
    // 没有找到命令
    console.log('[parseOldFormat] 未找到任何代码块');
    return {
      success: false,
      error: '未找到 GeoGebra 命令',
      rawContent: content
    };
  }

  // 等待 GeoGebra 库加载
  function waitForGeoGebraLib(timeout = 15000) {
    return new Promise((resolve, reject) => {
      // 如果已经加载，直接返回
      if (window.ggbLibLoaded) {
        resolve(true);
        return;
      }

      // 检查是否可以直接使用
      const canUseGGB = typeof GGBApplet !== 'undefined' || 
                        (window.GGBApplet && typeof window.GGBApplet === 'function');
      
      if (canUseGGB) {
        window.ggbLibLoaded = true;
        resolve(true);
        return;
      }
      
      // 轮询检查库是否加载
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

  // 创建 GeoGebra 画板
  async function createGGBApplet(containerId, commands, viewRange) {
    console.log('[createGGBApplet] 开始创建，容器ID:', containerId);
    console.log('[createGGBApplet] 命令数量:', commands ? commands.length : 0);
    console.log('[createGGBApplet] 视图范围:', viewRange);
    
    try {
      // 等待 GeoGebra 库加载
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
      // 添加 applet 加载完成的回调
      "appletOnLoad": function(api) {
        console.log('[createGGBApplet] appletOnLoad 回调触发');
        
        // 执行所有命令
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
          
          // 自动调整视图（使用 setCoordSystem 替代 zoomFit）
          setTimeout(function() {
            try {
              // 如果指定了 viewRange，使用它来设置视图
              if (viewRange) {
                api.setCoordSystem(
                  viewRange.xMin || -10,
                  viewRange.xMax || 10,
                  viewRange.yMin || -10,
                  viewRange.yMax || 10
                );
                console.log('[createGGBApplet] 已设置视图范围');
              } else {
                // 没有指定范围，尝试自动缩放
                if (typeof api.zoomTo === 'function') {
                  api.zoomTo(200); // 默认缩放级别
                  console.log('[createGGBApplet] 已调用zoomTo');
                }
              }
              
              // 强制刷新画板
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

    // 设置视图范围
    if (viewRange) {
      params["xmin"] = viewRange.xMin || -10;
      params["xmax"] = viewRange.xMax || 10;
      params["ymin"] = viewRange.yMin || -10;
      params["ymax"] = viewRange.yMax || 10;
    }

    try {
      console.log('[createGGBApplet] 开始注入画板到容器:', containerId);
      // 验证容器存在
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('[createGGBApplet] 容器不存在！');
        return null;
      }
      console.log('[createGGBApplet] 容器存在，尺寸:', container.clientWidth, 'x', container.clientHeight);
      
      // 创建并注入画板
      const applet = new GGBApplet(params, '5.0', containerId);
      applet.inject(containerId, 'preferHTML5');
      console.log('[createGGBApplet] 画板注入完成');
      
      // 在画板下方创建命令显示区域
      if (commands && commands.length > 0) {
        console.log('[createGGBApplet] 开始创建命令显示区域');
        
        // 查找容器的父元素（ggb-container-wrapper）
        const wrapper = container.parentElement;
        if (wrapper) {
          // 检查是否已经存在命令显示区域
          let commandsDiv = wrapper.querySelector('.ggb-commands-display');
          
          if (!commandsDiv) {
            // 创建命令显示区域
            commandsDiv = document.createElement('div');
            commandsDiv.className = 'ggb-commands-display';
            
            // 生成命令列表 HTML
            const commandItemsHtml = commands.map((cmd, index) => {
              const escapedCmd = escapeHtmlForCommands(cmd);
              return `<div class="ggb-command-item"><span class="command-number">${index + 1}.</span><code>${escapedCmd}</code></div>`;
            }).join('');
            
            // 复制按钮的 SVG 图标
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
            
            // 存储命令数据供复制使用
            commandsDiv.dataset.commands = JSON.stringify(commands);
            
            wrapper.appendChild(commandsDiv);
            console.log('[createGGBApplet] ✓ 命令显示区域已创建，包含', commands.length, '条命令');
          } else {
            console.log('[createGGBApplet] 命令显示区域已存在，跳过创建');
          }
        } else {
          console.warn('[createGGBApplet] 未找到容器包装器，无法创建命令显示区域');
        }
      }
      
      return applet;
    } catch (e) {
      console.error('[GeoGebra] 创建画板失败:', e);
      return null;
    }
  }

  // 格式化消息内容
  function formatMessage(content) {
    console.log('[formatMessage] 开始处理，内容长度:', content.length);
    
    // 先尝试提取并移除 ggb-json 代码块（我们会单独渲染）
    const extracted = extractGGBCommands(content);
    console.log('[formatMessage] 提取结果:', extracted.success ? '成功' : '失败', '命令数量:', extracted.commands ? extracted.commands.length : 0);
    
    if (extracted.success && extracted.commands.length > 0) {
      // 有 GeoGebra 命令，需要分离解释文字和代码块
      let displayContent = content;
      
      // 移除 ggb-json 代码块（如果存在）
      displayContent = displayContent.replace(/```ggb-json\s*[\s\S]*?```/g, '');
      
      // 移除普通代码块（ggb/geogebra/plaintext等）
      displayContent = displayContent.replace(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)[\s\S]*?```/g, '');
      
      console.log('[formatMessage] 移除代码块后内容长度:', displayContent.length);
      
      // 处理 Markdown 标题（从大到小处理，避免冲突）
      displayContent = displayContent.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
      displayContent = displayContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      displayContent = displayContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      displayContent = displayContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
      
      // 处理加粗
      displayContent = displayContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // 将换行转换为<br>
      displayContent = displayContent.replace(/\n/g, '<br>');
      
      console.log('[formatMessage] 最终HTML长度:', displayContent.length);
      
      return {
        text: displayContent.trim(),
        hasGGB: true,
        commands: extracted.commands,
        viewRange: extracted.viewRange
      };
    }
    
    // 没有 GeoGebra 命令，按普通文本处理
    let formatted = content;
    
    // 保留普通代码块用于显示
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理 Markdown 标题
    formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // 处理加粗
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 将换行转换为<br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return {
      text: formatted,
      hasGGB: false
    };
  }

  // 发送消息
  async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // 获取设置
    const settings = getSettings();
    if (!settings.apiKey || !settings.endpoint || !settings.modelName) {
      alert('请先在设置中配置 API');
      return;
    }

    // 禁用发送按钮
    sendBtn.disabled = true;
    userInput.value = '';
    
    // 添加用户消息到历史和界面
    messageHistory.push({ role: 'user', content: message });
    addMessageToUI(message, 'user');
    
    // 创建 AI 客户端
    const aiClient = new AiClient(settings.endpoint, settings.apiKey, settings.modelName);
    
    // 准备消息列表（包含系统提示语和历史）
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory
    ];
    
    // 添加 AI 消息占位符
    const aiContentDiv = addMessageToUI('', 'assistant');
    let fullResponse = '';
    
    // HTML转义函数
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // 调用 AI
    await aiClient.sendMessage(
      messages,
      // onUpdate - 流式响应中只显示文字
      (content) => {
        fullResponse = content;
        const formatted = formatMessage(content);
        aiContentDiv.innerHTML = formatted.text;
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
      },
      // onComplete - 响应完成后创建画板
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
        
        // 解析最终响应
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
        
        // 如果有 GeoGebra 命令，创建画板和命令显示区域
        if (formatted.hasGGB && formatted.commands && formatted.commands.length > 0) {
          console.log('[onComplete] ✓ 检测到 GeoGebra 命令，开始创建画板和命令显示区域');
          const ggbContainerId = 'ggb-' + Date.now();
          console.log('[onComplete] 画板ID:', ggbContainerId);
          
          // 创建画板容器包装器
          const ggbWrapper = document.createElement('div');
          ggbWrapper.className = 'ggb-container-wrapper';
          
          // 创建画板div
          const ggbContainer = document.createElement('div');
          ggbContainer.id = ggbContainerId;
          ggbContainer.className = 'ggb-container';
          ggbWrapper.appendChild(ggbContainer);
          console.log('[onComplete] 画板容器已创建');
          
          // 创建命令显示区域
          const commandsDiv = document.createElement('div');
          commandsDiv.className = 'ggb-commands-display';
          
          // 生成命令列表 HTML
          const commandItemsHtml = formatted.commands.map((cmd, index) => {
            const escapedCmd = escapeHtml(cmd);
            console.log(`[onComplete] 命令 ${index + 1}:`, cmd);
            return `<div class="ggb-command-item"><span class="command-number">${index + 1}.</span><code>${escapedCmd}</code></div>`;
          }).join('');
          
          // 复制按钮的 SVG 图标
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
          
          // 存储命令数据供复制使用
          commandsDiv.dataset.commands = JSON.stringify(formatted.commands);
          
          ggbWrapper.appendChild(commandsDiv);
          console.log('[onComplete] 命令显示区域已创建，包含', formatted.commands.length, '条命令');
          
          // 将整个包装器添加到消息内容中
          aiContentDiv.appendChild(ggbWrapper);
          console.log('[onComplete] ✓ 画板和命令显示区域已添加到DOM');
          
          // 验证容器是否存在
          const container = document.getElementById(ggbContainerId);
          if (container) {
            console.log('[onComplete] ✓ 容器元素验证通过');
            
            // 创建 GeoGebra 画板
            createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange)
              .then(() => {
                console.log('[onComplete] ✓✓✓ 画板创建成功！');
              })
              .catch(err => {
                console.error('[onComplete] ✗ 画板创建失败:', err);
                // 即使画板创建失败，命令仍然会显示
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'color: red; padding: 8px; margin-top: 8px; background: #fff3f3; border-radius: 4px; font-size: 12px;';
                errorDiv.textContent = '⚠️ 画板加载失败，但您可以复制下方命令在 GeoGebra 中使用';
                commandsDiv.appendChild(errorDiv);
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
      // onError
      (error) => {
        aiContentDiv.innerHTML = `<span style="color: red;">错误: ${error}</span>`;
        sendBtn.disabled = false;
      }
    );
  }

  // 绑定发送按钮
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // 示例标签点击
  const exampleTags = document.querySelectorAll('.example-tag');
  exampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const message = tag.textContent;
      
      // 获取设置
      const settings = getSettings();
      if (!settings.apiKey || !settings.endpoint || !settings.modelName) {
        alert('请先在设置中配置 API');
        return;
      }
      
      // 直接调用 sendMessage 逻辑
      const sendBtn = document.getElementById('send-btn');
      const userInput = document.getElementById('user-input');
      
      // 禁用发送按钮
      sendBtn.disabled = true;
      
      // 添加用户消息到历史和界面
      messageHistory.push({ role: 'user', content: message });
      addMessageToUI(message, 'user');
      
      // 创建 AI 客户端
      const aiClient = new AiClient(settings.endpoint, settings.apiKey, settings.modelName);
      
      // 准备消息列表（包含系统提示语和历史）
      const messages = [
        { role: 'system', content: systemPrompt },
        ...messageHistory
      ];
      
      // 添加 AI 消息占位符
      const aiContentDiv = addMessageToUI('', 'assistant');
      let fullResponse = '';
      
      // 调用 AI
      aiClient.sendMessage(
        messages,
        // onUpdate - 流式响应中只显示文字
        (content) => {
          fullResponse = content;
          const formatted = formatMessage(content);
          aiContentDiv.innerHTML = formatted.text;
          
          chatContainer.scrollTop = chatContainer.scrollHeight;
        },
        // onComplete - 响应完成后创建画板
        (content) => {
          fullResponse = content || fullResponse;
          messageHistory.push({ role: 'assistant', content: fullResponse });
          
          // 解析最终响应
          const formatted = formatMessage(fullResponse);
          aiContentDiv.innerHTML = formatted.text;
          
          // 如果有 GeoGebra 命令，创建画板
          if (formatted.hasGGB) {
            const ggbContainerId = 'ggb-' + Date.now();
            const ggbWrapper = document.createElement('div');
            ggbWrapper.className = 'ggb-container-wrapper';
            ggbWrapper.innerHTML = `
              <div id="${ggbContainerId}" class="ggb-container"></div>
              <div class="ggb-actions">
                <button class="ggb-btn" onclick="rerenderGGB('${ggbContainerId}')">重新绘制</button>
                <button class="ggb-btn" onclick="copyGGBCommands(${JSON.stringify(formatted.commands).replace(/"/g, '&quot;')})">复制命令</button>
              </div>
            `;
            aiContentDiv.appendChild(ggbWrapper);
            
            // 创建 GeoGebra 画板
            createGGBApplet(ggbContainerId, formatted.commands, formatted.viewRange);
          }
          
          chatContainer.scrollTop = chatContainer.scrollHeight;
          sendBtn.disabled = false;
        },
        // onError
        (error) => {
          aiContentDiv.innerHTML = `<span style="color: red;">错误: ${error}</span>`;
          sendBtn.disabled = false;
        }
      );
    });
  });
});

// ==================== 全局辅助函数 ====================

// 重新绘制 GeoGebra 画板
window.rerenderGGB = function(containerId) {
  // TODO: 实现重绘逻辑
};

