// 通用 AI 客户端 - 支持 OpenAI 兼容的流式 API
class AiClient {
  constructor(apiEndpoint, apiKey, modelName) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  // 发送消息并获取流式响应
  async sendMessage(messages, onUpdate, onComplete, onError) {
    const endpoint = this.apiEndpoint.endsWith('/') 
      ? this.apiEndpoint + 'chat/completions'
      : this.apiEndpoint + '/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            onComplete(fullResponse);
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;

              try {
                const parsed = JSON.parse(data);
                const choice = parsed.choices?.[0];
                const content = choice?.delta?.content || choice?.message?.content || '';
                
                if (content) {
                  fullResponse += content;
                  onUpdate(fullResponse);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          });

          readStream();
        }).catch(error => {
          onError(`读取错误: ${error.message}`);
        });
      };

      readStream();
    } catch (error) {
      onError(`请求错误: ${error.message}`);
    }
  }
}
