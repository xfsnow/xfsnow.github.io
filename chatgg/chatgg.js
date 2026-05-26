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
  }

  if (newChatHeaderBtn) {
    newChatHeaderBtn.addEventListener('click', resetChat);
  }

  if (newChatSidebarBtn) {
    newChatSidebarBtn.addEventListener('click', resetChat);
  }
});
