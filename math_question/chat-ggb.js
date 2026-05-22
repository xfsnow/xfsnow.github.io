window.addEventListener("load", function() {
  AiBase.formatAIResponse = function(content) {
    const ggbBlocks = [];
    let placeholderContent = content.replace(/```(?:\s*geogebra\s*|\s*geogebra\s*\n)([\s\S]*?)```/g, (match, p1) => {
      const trimmedContent = p1.trim();
      ggbBlocks.push(trimmedContent);
      return `{{GGB_BLOCK_${ggbBlocks.length - 1}}}`;
    });

    let formattedContent = placeholderContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');

    formattedContent = formattedContent.replace(/\{\{GGB_BLOCK_(\d+)\}\}/g, (match, index) => {
      const blockContent = ggbBlocks[index];
      const lines = blockContent.split('\n').length;
      return `<textarea class="ggb-code-block" rows="${Math.max(lines, 3)}">${blockContent}</textarea><div class="ggb-execute-container"><button class="ggb-execute-btn" data-ggb-execute><span class="ggb-execute-icon"></span>执行命令</button></div>`;
    });

    return formattedContent;
  };

  AiBase.extractGgbCommands = function(response) {
    const regex = /```(?:\s*geogebra\s*|\s*geogebra\s*\n)([\s\S]*?)```/g;
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

    return commands;
  };

  class GGBManager {
    constructor() {
      this.ggbApp = null;
      this.sendBtn = null;
      this.userInput = null;
      this.chatContainer = null;
      this.systemPrompt = null;
      this.providerNameInput = null;
      this.apiEndpointInput = null;
      this.apiKeyInput = null;
      this.modelNameInput = null;
      this.settingsBtn = null;
      this.settingsPanel = null;
      this.closeSettingsBtn = null;
      this.saveSettingsBtn = null;
      this.imageAttachmentBtn = null;

      this.init();
    }

    init() {
      this.initGGBApplet();
      this.initSettings();
      this.bindElements();
      this.bindEvents();
      this.loadSettings();
    }

    initGGBApplet() {
      this.ggbApp = new GGBApplet({
        "width": 600,
        "height": 600,
        "showToolBar": true,
        "showAlgebraInput": false,
        "showMenuBar": true,
        "allowStyleBar": true,
        "language": "zh",
        "showAlgebraView": false,
        "perspective": "G"
      }, true);
      this.ggbApp.inject('ggb-element');
    }

    initSettings() {
      const settingsBtn = document.getElementById('settings-btn');
      const closeSettingsBtn = document.getElementById('close-settings');
      const settingsPanel = document.getElementById('settings-panel');

      settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('active');
      });

      closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
      });
    }

    bindElements() {
      this.sendBtn = document.getElementById('send-btn');
      this.userInput = document.getElementById('user-input');
      this.chatContainer = document.getElementById('chat-container');
      this.systemPrompt = document.getElementById('system-prompt');

      this.providerNameInput = document.getElementById('provider-name');
      this.apiEndpointInput = document.getElementById('api-endpoint');
      this.apiKeyInput = document.getElementById('api-key');
      this.modelNameInput = document.getElementById('model-name');

      this.settingsBtn = document.getElementById('settings-btn');
      this.settingsPanel = document.getElementById('settings-panel');
      this.closeSettingsBtn = document.getElementById('close-settings');
      this.saveSettingsBtn = document.getElementById('save-settings');
      this.imageAttachmentBtn = document.getElementById('image-attachment-btn');
    }

    bindEvents() {
      if (this.imageAttachmentBtn) {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        this.imageAttachmentBtn.addEventListener('click', () => {
          this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            alert('仅支持 JPG/PNG/GIF/WEBP 格式图片！');
            this.fileInput.value = '';
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            alert('图片大小不能超过10MB！');
            this.fileInput.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            AiBase.prototype.selectedImageBase64 = event.target.result;
            this.showImagePreview(AiBase.prototype.selectedImageBase64);
          };
          reader.readAsDataURL(file);
        });
      }

      const closePreviewBtn = document.getElementById('close-preview');
      if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
          this.hideImagePreview();
          if (this.fileInput) {
            this.fileInput.value = '';
          }
        });
      }

      this.sendBtn.addEventListener('click', () => this.sendMessage());

      this.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      this.settingsBtn.addEventListener('click', () => {
        this.settingsPanel.classList.add('active');
      });

      this.closeSettingsBtn.addEventListener('click', () => {
        this.settingsPanel.classList.remove('active');
      });

      this.saveSettingsBtn.addEventListener('click', () => {
        this.saveSettings();
        this.settingsPanel.classList.remove('active');
      });

      this.chatContainer.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[data-ggb-execute]')) {
          this.handleGgbExecute(e.target);
        }
      });
    }

    handleGgbExecute(buttonElement) {
      const textareaElement = buttonElement.closest('.ggb-execute-container').previousElementSibling;
      if (textareaElement && textareaElement.classList.contains('ggb-code-block')) {
        this.executeCommandsFromTextarea(textareaElement);
      }
    }

    executeCommandsFromTextarea(textareaElement) {
      const app = window.ggbApplet;

      if (app) {
        try {
          app.reset();
        } catch (e) {
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }

      const commands = textareaElement.value.split('\n');

      commands.forEach((command) => {
        command = command.trim();
        if (command) {
          try {
            app.evalCommand(command);
          } catch (e) {
            console.error('执行命令出错: ' + command, e);
          }
        }
      });
    }

    executeCommands() {
      const app = window.ggbApplet;

      if (app) {
        try {
          app.reset();
        } catch (e) {
          try {
            app.evalCommand('Delete[All]');
          } catch (e2) {
            console.warn('无法清空画板:', e2);
          }
        }
      }

      const commands = this.commandArea.value.split('\n');

      commands.forEach((command) => {
        command = command.trim();
        if (command) {
          try {
            app.evalCommand(command);
          } catch (e) {
            console.error('执行命令出错: ' + command, e);
          }
        }
      });
    }

    showImagePreview(imageData) {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      const previewImage = document.getElementById('image-preview');

      if (imageData && previewWrapper && previewImage) {
        previewImage.src = imageData;
        previewWrapper.classList.add('active');
      }
    }

    hideImagePreview() {
      const previewWrapper = document.querySelector('.image-preview-wrapper');
      if (previewWrapper) {
        previewWrapper.classList.remove('active');
      }
    }

    sendMessage() {
      const message = this.userInput.value.trim();
      if (!message && !AiBase.prototype.selectedImageBase64) return;

      this.displayUserMessage(message, AiBase.prototype.selectedImageBase64);

      this.userInput.value = '';
      const tempImage = AiBase.prototype.selectedImageBase64;
      AiBase.prototype.selectedImageBase64 = null;
      this.hideImagePreview();
      if (this.fileInput) {
        this.fileInput.value = '';
      }

      const providerName = this.providerNameInput.value.trim();
      const apiEndpoint = this.apiEndpointInput.value.trim();
      const apiKey = this.apiKeyInput.value.trim();
      const modelName = this.modelNameInput.value.trim();

      if (!providerName) {
        this.displayMessage('请先输入模型供应方', 'ai');
        return;
      }
      if (!apiEndpoint) {
        this.displayMessage('请先输入接入端点', 'ai');
        return;
      }
      if (!apiKey) {
        this.displayMessage('请先输入API密钥', 'ai');
        return;
      }
      if (!modelName) {
        this.displayMessage('请先输入模型名称', 'ai');
        return;
      }

      const systemMessage = this.systemPrompt.value.trim();

      const chatHistory = this.getChatHistory();

      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
        chatHistory.pop();
      }

      const aiClient = new OpenAICompatibleAI(apiKey, systemMessage, chatHistory, apiEndpoint, modelName, providerName);
      aiClient.callAPI(
        message,
        (content, sender, isThinking) => this.displayMessage(content, sender, isThinking),
        (response) => {
          this.displayMessage(response, 'ai');
          const commands = AiBase.extractGgbCommands(response);
          if (commands.length > 0) {
            console.log('GeoGebra commands extracted:', commands);
          }
        },
        (error) => this.displayMessage(error, 'ai'),
        tempImage
      );
    }

    displayUserMessage(text, imageBase64 = null) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'user-message');

      let content = `<p>${text || "(无文本消息)"}</p>`;
      if (imageBase64) {
        content += `<img src="${imageBase64}" class="image-preview" alt="用户上传图片" style="max-width: 200px; max-height: 200px; margin-top: 10px; border-radius: 4px;">`;
      }

      messageDiv.innerHTML = content;
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }

    displayMessage(message, sender, isThinking = false) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender + '-message');
      if (isThinking) {
        messageDiv.classList.add('ai-thinking');
      }

      if (sender === 'ai' && !isThinking) {
        messageDiv.innerHTML = AiBase.formatAIResponse(message);
      } else {
        messageDiv.textContent = message;
      }

      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      return messageDiv;
    }

    getChatHistory() {
      const messages = this.chatContainer.querySelectorAll('.message');
      const history = [];

      messages.forEach((messageDiv) => {
        if (messageDiv.classList.contains('ai-thinking')) {
          return;
        }

        if (messageDiv.classList.contains('user-message')) {
          const textContent = messageDiv.querySelector('p').textContent;

          let content = [{ type: "text", text: textContent }];

          if (content.length === 1 && content[0].type === "text") {
            history.push({ role: 'user', content: content[0].text });
          } else {
            history.push({ role: 'user', content: content });
          }
        } else if (messageDiv.classList.contains('ai-message')) {
          const textContent = messageDiv.textContent;
          history.push({ role: 'assistant', content: textContent });
        }
      });

      return history;
    }

    saveSettings() {
      const settings = {
        providerName: this.providerNameInput.value,
        apiEndpoint: this.apiEndpointInput.value,
        apiKey: this.apiKeyInput.value,
        modelName: this.modelNameInput.value,
        systemPrompt: this.systemPrompt.value
      };
      localStorage.setItem('ggbOpenAISettings', JSON.stringify(settings));
      alert('设置已保存！');
    }

    loadSettings() {
      const settings = JSON.parse(localStorage.getItem('ggbOpenAISettings')) || {};
      this.providerNameInput.value = settings.providerName || '';
      this.apiEndpointInput.value = settings.apiEndpoint || '';
      this.apiKeyInput.value = settings.apiKey || '';
      this.modelNameInput.value = settings.modelName || '';
      if (settings.systemPrompt) {
        this.systemPrompt.value = settings.systemPrompt;
      }
    }
  }

  const ggbManager = new GGBManager();
});