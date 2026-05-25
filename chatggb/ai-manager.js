class AiBase {
  constructor(apiKey, systemMessage, chatHistory, endpoint, modelName, providerName = '') {
    this.apiKey = apiKey;
    this.systemMessage = systemMessage;
    this.chatHistory = chatHistory;
    this.endpoint = endpoint;
    this.modelName = modelName;
    this.providerName = providerName;
    this.selectedImageBase64 = null;
  }

  imageFileToBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  constructMessages() {
    const messages = [];
    if (this.systemMessage) {
      messages.push({ role: 'system', content: this.systemMessage });
    }
    messages.push(...this.chatHistory);
    return messages;
  }

  constructUserContent(userMessage, imageBase64 = null) {
    if (imageBase64) {
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
      return userMessage;
    }
  }

  static formatAIResponse(content) {
    console.error('formatAIResponse must be implemented by subclass');
    return content;
  }

  static extractCode(response) {
    console.error('extractCode must be implemented by subclass');
    return [];
  }
}

class OpenAICompatibleAI extends AiBase {
  constructor(apiKey, systemMessage, chatHistory, endpoint, modelName, providerName = '') {
    super(apiKey, systemMessage, chatHistory, endpoint, modelName, providerName);
  }

  callAPI(userMessage, onUpdate, onComplete, onError, imageBase64 = null) {
    const messages = this.constructMessages();

    const userContent = this.constructUserContent(userMessage, imageBase64);
    messages.push({ role: 'user', content: userContent });

    let fullEndpoint = this.endpoint;
    if (!fullEndpoint.endsWith('/')) {
      fullEndpoint = fullEndpoint + '/';
    }
    fullEndpoint += 'chat/completions';

    console.log('开始流式请求:', fullEndpoint);

    fetch(fullEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: messages,
        stream: true
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('API请求失败: ' + response.status);
      }

      console.log('响应状态:', response.status, '是否支持流式:', !!response.body);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';
      let chunkCount = 0;

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('流式响应完成, 共收到', chunkCount, '个chunk');
            onComplete(fullResponse, 'ai');
            return;
          }

          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });
          console.log('收到第', chunkCount, '个chunk, 长度:', chunk.length);

          const lines = chunk.split('\n');

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
                  if (choice.delta) {
                    if (choice.delta.content !== undefined) {
                      content = choice.delta.content;
                    } else if (choice.delta.reasoning_content !== undefined) {
                      content = choice.delta.reasoning_content;
                    }
                  } else if (choice.message && choice.message.content) {
                    content = choice.message.content;
                  }
                }

                if (content) {
                  fullResponse += content;
                  onUpdate(fullResponse, 'ai', true);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          });

          readStream();
        }).catch(error => {
          console.log('流式读取错误:', error);
          onError('错误: ' + error.message, 'ai');
        });
      };

      readStream();
    })
    .catch(error => {
      console.log('请求错误:', error);
      onError('错误: ' + error.message, 'ai');
    });
  }
}