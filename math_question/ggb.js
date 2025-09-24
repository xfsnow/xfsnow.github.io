// 等待 GeoGebra 应用加载完成
window.addEventListener("load", function() {
     var ggbApp = new GGBApplet({
      "width": 600,
      "height": 600,
      "showToolBar": true,
      "showAlgebraInput": true,
      "showMenuBar": true,
      "allowStyleBar": true,
      "language": "zh"
    }, true);
    ggbApp.inject('ggb-element');
    

      // 获取按钮和文本框元素
      const executeBtn = document.getElementById('execute-btn');
      const commandArea = document.getElementById('ggb-commands');
      const sendBtn = document.getElementById('send-btn');
      const userInput = document.getElementById('user-input');
      const chatContainer = document.getElementById('chat-container');
      const apiKeyInput = document.getElementById('api-key');
      const modelSelect = document.getElementById('model-select');
      const systemPrompt = document.getElementById('system-prompt');
      
      // 添加按钮点击事件
      executeBtn.addEventListener('click', function() {
        const commands = commandArea.value.split('\n');
        const app = window.ggbApplet; // 获取 GeoGebra 应用实例
        
        // 逐行执行命令
        commands.forEach(function(command) {
          command = command.trim();
          if (command) {
            try {
              app.evalCommand(command);
            } catch (e) {
              console.error('执行命令出错: ' + command, e);
            }
          }
        });
      });
      
      // 发送按钮点击事件
      sendBtn.addEventListener('click', sendMessage);
      
      // 回车发送消息
      userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
      
      // 发送消息函数
      function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 显示用户消息
        displayMessage(message, 'user');
        userInput.value = '';
        
        // 获取API密钥
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
          displayMessage('请先输入API密钥', 'ai');
          return;
        }
        
        // 获取系统提示语
        const systemMessage = systemPrompt.value.trim();
        
        // 构造对话历史
        const chatHistory = getChatHistory();
        
        // 调用DeepSeek API
        callDeepSeekAPI(message, apiKey, systemMessage, chatHistory);
      }
      
      // 显示消息
      function displayMessage(message, sender, isThinking = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        if (isThinking) {
          messageDiv.classList.add('ai-thinking');
        }
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageDiv;
      }
      
      // 获取对话历史
      function getChatHistory() {
        const messages = chatContainer.querySelectorAll('.message');
        const history = [];
        
        messages.forEach(function(messageDiv) {
          // 不包含正在思考中的消息
          if (messageDiv.classList.contains('ai-thinking')) {
            return;
          }
          
          if (messageDiv.classList.contains('user-message')) {
            history.push({ role: 'user', content: messageDiv.textContent });
          } else if (messageDiv.classList.contains('ai-message')) {
            history.push({ role: 'assistant', content: messageDiv.textContent });
          }
        });
        
        return history;
      }
      
      // 调用DeepSeek API
      function callDeepSeekAPI(userMessage, apiKey, systemMessage, chatHistory) {
        // 显示思考过程消息
        const thinkingMessage = displayMessage('AI正在思考...', 'ai', true);
        
        // 构造消息数组
        const messages = [];
        if (systemMessage) {
          messages.push({ role: 'system', content: systemMessage });
        }
        
        // 添加历史对话
        messages.push(...chatHistory);
        
        // 添加当前用户消息
        messages.push({ role: 'user', content: userMessage });
        
        // 发送请求到DeepSeek API
        fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            stream: true  // 启用流式传输
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('API请求失败: ' + response.status);
          }
          
          // 处理流式响应
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let fullResponse = '';
          
          // 递归读取流数据
          function readStream() {
            reader.read().then(({ done, value }) => {
              if (done) {
                // 流结束，移除思考消息，显示完整响应
                if (thinkingMessage.parentNode) {
                  chatContainer.removeChild(thinkingMessage);
                }
                displayMessage(fullResponse, 'ai');
                
                // 提取GeoGebra命令并填充到命令区域
                extractAndFillGgbCommands(fullResponse);
                return;
              }
              
              // 解码数据
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              // 处理每个数据行
              lines.forEach(line => {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      fullResponse += content;
                      // 更新思考消息内容
                      thinkingMessage.textContent = fullResponse;
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              });
              
              // 继续读取流
              readStream();
            }).catch(error => {
              // 移除思考消息
              if (thinkingMessage.parentNode) {
                chatContainer.removeChild(thinkingMessage);
              }
              displayMessage('错误: ' + error.message, 'ai');
            });
          }
          
          // 开始读取流
          readStream();
        })
        .catch(error => {
          // 移除思考消息
          if (thinkingMessage.parentNode) {
            chatContainer.removeChild(thinkingMessage);
          }
          displayMessage('错误: ' + error.message, 'ai');
        });
      }
      
      // 提取并填充GeoGebra命令
      function extractAndFillGgbCommands(response) {
        // 使用正则表达式提取```geogebra和```之间的内容
        const regex = /```geogebra([\s\S]*?)```/g;
        let match;
        const commands = [];
        
        while ((match = regex.exec(response)) !== null) {
          const commandBlock = match[1].trim();
          const commandLines = commandBlock.split('\n');
          commandLines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              commands.push(trimmedLine);
            }
          });
        }
        
        if (commands.length > 0) {
          commandArea.value = commands.join('\n');
        }
      }
    });