document.addEventListener('DOMContentLoaded', () => {
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
1. 使用GeoGebra脚本格式，使用方括号语法，如 Circle[A, B]
2. 每个命令单独一行
3. 将命令放在代码块中，使用ggb或plaintext语言标识
4. 提供清晰的步骤说明和解释
5. 确保坐标在合理范围内（x: -10~10, y: -10~10）
6. 优先使用点定义，再使用几何命令`;

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
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return contentDiv;
  }

  // 格式化消息内容
  function formatMessage(content) {
    // 处理 GeoGebra 代码块
    content = content.replace(/```(?:\s*ggb\s*|\s*geogebra\s*|\s*plaintext\s*)([\s\S]*?)```/g, 
      '<pre class="ggb-code-block"><code>$1</code></pre>');
    
    // 处理普通代码块
    content = content.replace(/```([\s\S]*?)```/g, 
      '<pre><code>$1</code></pre>');
    
    // 处理加粗
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理换行
    content = content.replace(/\n/g, '<br>');
    
    return content;
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
      // onUpdate
      (content) => {
        fullResponse = content;
        aiContentDiv.innerHTML = formatMessage(content);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      },
      // onComplete
      (content) => {
        fullResponse = content || fullResponse;
        messageHistory.push({ role: 'assistant', content: fullResponse });
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
        // onUpdate
        (content) => {
          fullResponse = content;
          aiContentDiv.innerHTML = formatMessage(content);
          chatContainer.scrollTop = chatContainer.scrollHeight;
        },
        // onComplete
        (content) => {
          fullResponse = content || fullResponse;
          messageHistory.push({ role: 'assistant', content: fullResponse });
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
