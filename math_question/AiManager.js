// AI基类
class AiBase {
  constructor(apiKey, systemMessage, chatHistory) {
    this.apiKey = apiKey;
    this.systemMessage = systemMessage;
    this.chatHistory = chatHistory;
    this.selectedImageBase64 = null; // 存储选中的图片Base64编码
  }
  
  // 将图片文件转换为 base64 字符串
  imageFileToBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // 移除 Data URL 的前缀 "data:image/...;base64," 只保留纯 base64 编码
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }
  
  // 构造消息数组
  constructMessages() {
    const messages = [];
    if (this.systemMessage) {
      messages.push({ role: 'system', content: this.systemMessage });
    }
    messages.push(...this.chatHistory);
    return messages;
  }
  
  // 构造用户消息内容（支持文本和图片）
  constructUserContent(userMessage, imageBase64 = null) {
    if (imageBase64) {
      // 如果有图片，则创建多部分消息
      return [
        { type: "text", text: userMessage },
        { 
          type: "image_url", 
          image_url: {
            url: imageBase64
          }
        }
      ];
    } else {
      // 没有图片，就是纯文本
      return userMessage;
    }
  }
  
  // 格式化AI响应内容 - 通用版本，需要子类重写
  static formatAIResponse(content) {
    console.error('formatAIResponse must be implemented by subclass');
    return content;
  }

  // 提取代码的方法 - 通用版本，需要子类重写
  static extractCode(response) {
    console.error('extractCode must be implemented by subclass');
    return [];
  }
}

// DeepSeek AI类
class AiDeepSeek extends AiBase {
  callAPI(userMessage, onUpdate, onComplete, onError) {
    // 显示思考过程消息
    const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
    
    // 构造消息数组
    const messages = this.constructMessages();
    messages.push({ role: 'user', content: userMessage });
    
    // 发送请求到DeepSeek API
    fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey
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
      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            // 流结束，移除思考消息，显示完整响应
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onComplete(fullResponse, 'ai');
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
                  // 更新思考消息内容，使用innerHTML来支持HTML格式
                  thinkingMessage.innerHTML = this.constructor.formatAIResponse(fullResponse);
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
            thinkingMessage.parentNode.removeChild(thinkingMessage);
          }
          onError('错误: ' + error.message, 'ai');
        });
      };
      
      // 开始读取流
      readStream();
    })
    .catch(error => {
      // 移除思考消息
      if (thinkingMessage.parentNode) {
        thinkingMessage.parentNode.removeChild(thinkingMessage);
      }
      onError('错误: ' + error.message, 'ai');
    });
  }
}

// 通义千问 AI类
class AiQwen extends AiBase {
  constructor(apiKey, systemMessage, chatHistory) {
    super(apiKey, systemMessage, chatHistory);
    this.endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    this.model = "qwen3-vl-plus";
  }
  
  async callAPI(userMessage, onUpdate, onComplete, onError, imageBase64 = null) {
    // 显示思考过程消息
    const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
    
    // 构造消息数组
    const messages = this.constructMessages();

    // 准备用户消息内容
    let userContent;
    if (imageBase64) {
      userContent = this.constructUserContent(userMessage, imageBase64);
    } else {
      userContent = this.constructUserContent(userMessage);
    }
    messages.push({ role: 'user', content: userContent });
    
    // 发送请求到通义千问 API
    fetch(this.endpoint + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: true
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
      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            // 流结束，移除思考消息，显示完整响应
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onComplete(fullResponse, 'ai');
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
                // 修复：正确提取Qwen模型的内容，兼容不同响应格式
                let content = '';
                if (parsed.choices && parsed.choices[0]) {
                  const choice = parsed.choices[0];
                  if (choice.delta && choice.delta.content !== undefined) {
                    content = choice.delta.content;
                  } else if (choice.message && choice.message.content) {
                    content = choice.message.content;
                  }
                }
                
                if (content) {
                  fullResponse += content;
                  // 更新思考消息内容，使用innerHTML来支持HTML格式
                  thinkingMessage.innerHTML = this.constructor.formatAIResponse(fullResponse);
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
            thinkingMessage.parentNode.removeChild(thinkingMessage);
          }
          onError('错误: ' + error.message, 'ai');
        });
      };
      
      // 开始读取流
      readStream();
    })
    .catch(error => {
      // 移除思考消息
      if (thinkingMessage.parentNode) {
        thinkingMessage.parentNode.removeChild(thinkingMessage);
      }
      onError('错误: ' + error.message, 'ai');
    });
  }
}

// Azure OpenAI AI类
class AiAzureOpenAI extends AiBase {
  constructor(apiKey, systemMessage, chatHistory, endpoint, deployment) {
    super(apiKey, systemMessage, chatHistory);
    this.endpoint = endpoint;
    this.deployment = deployment;
  }
  
  callAPI(userMessage, onUpdate, onComplete, onError, imageBase64 = null) {
    // 显示思考过程消息
    const thinkingMessage = onUpdate('AI正在思考...', 'ai', true);
    
    // 构造消息数组
    const messages = this.constructMessages();
    
    // 准备用户消息内容
    const userContent = this.constructUserContent(userMessage, imageBase64);
    messages.push({ role: 'user', content: userContent });
    
    // 确保端点URL以斜杠结尾，并构建完整的API URL
    let fullEndpoint = this.endpoint;
    if (!this.endpoint.endsWith('/')) {
      fullEndpoint = this.endpoint + '/';
    }
    // 构建正确的Azure OpenAI API URL
    fullEndpoint += `openai/deployments/${this.deployment}/chat/completions?api-version=2025-01-01-preview`;
    
    // 发送请求到Azure OpenAI API
    fetch(fullEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        model: "gpt-4o", // 指定模型名称
        messages: messages,
        max_tokens: 6553,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
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
      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            // 流结束，移除思考消息，显示完整响应
            if (thinkingMessage.parentNode) {
              thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            onComplete(fullResponse, 'ai');
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
                let content = '';
                if (parsed.choices && parsed.choices.length > 0) {
                  const choice = parsed.choices[0];
                  if (choice.delta && choice.delta.content) {
                    content = choice.delta.content;
                  } else if (choice.message && choice.message.content) {
                    content = choice.message.content;
                  }
                }
                
                if (content) {
                  fullResponse += content;
                  // 更新思考消息内容，使用innerHTML来支持HTML格式
                  thinkingMessage.innerHTML = this.constructor.formatAIResponse(fullResponse);
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
            thinkingMessage.parentNode.removeChild(thinkingMessage);
          }
          onError('错误: ' + error.message, 'ai');
        });
      };
      
      // 开始读取流
      readStream();
    })
    .catch(error => {
      // 移除思考消息
      if (thinkingMessage.parentNode) {
        thinkingMessage.parentNode.removeChild(thinkingMessage);
      }
      onError('错误: ' + error.message, 'ai');
    });
  }
}