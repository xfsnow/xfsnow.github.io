document.addEventListener('DOMContentLoaded', () => {
  // GeoGebra 加载状态
  window.ggbLibLoaded = false;
  window.ggbLibLoading = false;
  
  // 预加载 GeoGebra 库
  function preloadGeoGebraLib() {
    if (window.ggbLibLoaded || window.ggbLibLoading) {
      return;
    }
    
    window.ggbLibLoading = true;
    console.log('[GeoGebra] 开始预加载库...');
    
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
          console.log('[GeoGebra] 预加载 applet 初始化成功');
        }
      };
      
      console.log('[GeoGebra] 创建预加载 applet...');
      const preloadApplet = new GGBApplet(preloadParams, '5.0', 'ggb-preload-applet');
      preloadApplet.inject('ggb-preload-container', 'preferHTML5');
      console.log('[GeoGebra] 预加载 applet 注入成功');
      
      // 轮询检查库是否完全加载
      const checkInterval = setInterval(() => {
        // 检查多个可能的全局对象
        const ggbLoaded = typeof GGBApplet !== 'undefined' || 
                          (window.GGBApplet && typeof window.GGBApplet === 'function') ||
                          (preloadContainer.querySelector('iframe') !== null);
        
        if (ggbLoaded) {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          window.ggbLibLoading = false;
          console.log('[GeoGebra] 库预加载完成');
          console.log('[GeoGebra] GGBApplet:', typeof GGBApplet);
          console.log('[GeoGebra] window.GGBApplet:', typeof window.GGBApplet);
          console.log('[GeoGebra] container iframe:', preloadContainer.querySelector('iframe') ? '存在' : '不存在');
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
    // 尝试匹配 ggb-json 代码块
    const jsonMatch = content.match(/```ggb-json\s*([\s\S]*?)```/);
    
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
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
    return parseOldFormat(content);
  }

  // 旧的解析方式（向后兼容）
  function parseOldFormat(content) {
    const codeMatch = content.match(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)([\s\S]*?)```/);
    
    if (codeMatch) {
      const commands = codeMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
      
      return {
        success: true,
        commands: commands,
        viewRange: null,
        explanation: content.replace(/```[\s\S]*?```/g, '').trim()
      };
    }
    
    // 没有找到命令
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
        console.log('[GeoGebra] 库已加载（从缓存）');
        resolve(true);
        return;
      }

      // 检查是否可以直接使用
      const canUseGGB = typeof GGBApplet !== 'undefined' || 
                        (window.GGBApplet && typeof window.GGBApplet === 'function');
      
      if (canUseGGB) {
        console.log('[GeoGebra] 库已加载（直接检测）');
        window.ggbLibLoaded = true;
        resolve(true);
        return;
      }

      console.log('[GeoGebra] 等待库加载...');
      
      // 轮询检查库是否加载
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const ggbLoaded = typeof GGBApplet !== 'undefined' || 
                          (window.GGBApplet && typeof window.GGBApplet === 'function');
        
        if (ggbLoaded) {
          clearInterval(checkInterval);
          window.ggbLibLoaded = true;
          console.log('[GeoGebra] 库加载完成，耗时:', Date.now() - startTime, 'ms');
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          console.error('[GeoGebra] 库加载超时');
          console.error('[GeoGebra] GGBApplet:', typeof GGBApplet);
          console.error('[GeoGebra] window.GGBApplet:', typeof window.GGBApplet);
          console.error('[GeoGebra] 请检查网络连接或 CDN 是否可访问: https://cdn.geogebra.org/apps/deployggb.js');
          reject(new Error('GeoGebra 库加载超时，请检查网络连接'));
        }
      }, 200);
    });
  }

  // 创建 GeoGebra 画板
  async function createGGBApplet(containerId, commands, viewRange) {
    try {
      // 等待 GeoGebra 库加载
      await waitForGeoGebraLib();
    } catch (e) {
      console.error('[GeoGebra] 库加载失败:', e);
      return null;
    }

    console.log('[GeoGebra] 开始创建画板:', containerId);
    console.log('[GeoGebra] 命令:', commands);
    console.log('[GeoGebra] 视图范围:', viewRange);

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
        console.log('[GeoGebra] 画板加载完成:', containerId);
        console.log('[GeoGebra] API 对象:', api);
        console.log('[GeoGebra] API 方法:', Object.keys(api).slice(0, 20));
        
        // 执行所有命令
        if (commands && commands.length > 0) {
          console.log('[GeoGebra] 开始执行 ' + commands.length + ' 个命令...');
          commands.forEach((cmd, index) => {
            try {
              api.evalCommand(cmd);
              console.log('[GeoGebra] 命令 ' + (index + 1) + ' 执行成功:', cmd);
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
                console.log('[GeoGebra] 已设置坐标系:', viewRange);
              } else {
                // 没有指定范围，尝试自动缩放
                if (typeof api.zoomTo === 'function') {
                  api.zoomTo(200); // 默认缩放级别
                  console.log('[GeoGebra] 使用默认缩放');
                }
              }
              
              // 强制刷新画板
              if (typeof api.refreshViews === 'function') {
                api.refreshViews();
                console.log('[GeoGebra] 已刷新视图');
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
      // 创建并注入画板
      console.log('[GeoGebra] 创建 GGBApplet 实例...');
      const applet = new GGBApplet(params, '5.0', containerId);
      
      console.log('[GeoGebra] 注入画板到:', containerId);
      applet.inject(containerId, 'preferHTML5');
      
      console.log('[GeoGebra] 画板注入成功');
      return applet;
    } catch (e) {
      console.error('[GeoGebra] 创建画板失败:', e);
      console.error('[GeoGebra] 错误详情:', e.message);
      console.error('[GeoGebra] 错误堆栈:', e.stack);
      return null;
    }
  }

  // 格式化消息内容
  function formatMessage(content) {
    // 先提取并移除 ggb-json 代码块（我们会单独渲染）
    const extracted = extractGGBCommands(content);
    
    if (extracted.success && extracted.commands.length > 0) {
      // 有 GeoGebra 命令，显示解释文字
      let displayContent = extracted.explanation || content;
      
      // 处理普通 Markdown 格式
      displayContent = displayContent.replace(/```[\s\S]*?```/g, ''); // 移除所有代码块
      displayContent = displayContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      displayContent = displayContent.replace(/\n/g, '<br>');
      
      return {
        text: displayContent,
        hasGGB: true,
        commands: extracted.commands,
        viewRange: extracted.viewRange
      };
    }
    
    // 没有 GeoGebra 命令，按普通文本处理
    let formatted = content;
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
  console.log('重新绘制:', containerId);
  // TODO: 实现重绘逻辑
};

// 复制 GeoGebra 命令到剪贴板
window.copyGGBCommands = function(commands) {
  const text = commands.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert('命令已复制到剪贴板！');
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });

// ==================== 全局辅助函数 ====================

// 重新绘制 GeoGebra 画板
window.rerenderGGB = function(containerId) {
  console.log('重新绘制:', containerId);
  // TODO: 实现重绘逻辑
};

// 复制 GeoGebra 命令到剪贴板
window.copyGGBCommands = function(commands) {
  const text = commands.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert('命令已复制到剪贴板！');
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
};

// ==================== 全局辅助函数 ====================

// 重新绘制 GeoGebra 画板
window.rerenderGGB = function(containerId) {
  console.log('重新绘制:', containerId);
  // TODO: 实现重绘逻辑
};

// 复制 GeoGebra 命令到剪贴板
window.copyGGBCommands = function(commands) {
  const text = commands.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert('命令已复制到剪贴板！');
  }).catch(err => {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  });
}}
