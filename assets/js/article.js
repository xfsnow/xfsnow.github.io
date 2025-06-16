class ArticlePage {
    constructor() {
        this.init();
    }

    init() {
        this.initBackToTop();
        this.initSmoothScroll();
        this.initCodeHighlight();
        this.initTableResponsive();
    }

    initBackToTop() {
        // 创建返回顶部按钮
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTop.setAttribute('aria-label', '返回顶部');
        document.body.appendChild(backToTop);

        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // 点击返回顶部
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initSmoothScroll() {
        // 为所有锚点链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initCodeHighlight() {
        // 为代码块添加复制功能
        document.querySelectorAll('pre code').forEach(codeBlock => {
            const pre = codeBlock.parentNode;
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.setAttribute('aria-label', '复制代码');

            pre.style.position = 'relative';
            pre.appendChild(copyButton);

            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                });
            });
        });
    }

    initTableResponsive() {
        // 为表格添加响应式包装
        document.querySelectorAll('table').forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            wrapper.style.overflowX = 'auto';
            wrapper.style.margin = '20px 0';
            wrapper.style.border = '1px solid var(--border-color)';
            wrapper.style.borderRadius = '8px';

            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ArticlePage();
});
