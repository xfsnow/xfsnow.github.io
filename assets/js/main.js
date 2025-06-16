// 搜索索引构建
function buildSearchIndex() {
    const searchIndex = [];

    if (typeof articlesData !== 'undefined') {
        articlesData.forEach(article => {
            const searchText = [
                article.title,
                article.description,
                ...article.tags,
                article.category
            ].join(' ').toLowerCase();

            searchIndex.push({
                ...article,
                searchText
            });
        });
    }

    return searchIndex;
}

// 导出数据到全局
window.articlesData = typeof articlesData !== 'undefined' ? articlesData : [];
window.toolsData = typeof toolsData !== 'undefined' ? toolsData : [];
window.langMap = typeof langMap !== 'undefined' ? langMap : {};
window.searchIndex = buildSearchIndex();

class BlogApp {
    constructor() {
        this.currentLang = document.documentElement.lang || 'zh-CN';
        this.langConfig = window.langMap || {};
        this.init();
    }

    init() {
        this.initNavigation();
        this.initScrollEffects();
        this.initSmoothScroll();
        this.renderTools();
        this.initLanguageSwitch();
        this.updateUITexts();
    }

    initNavigation() {
        const navToggle = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // 点击菜单项时关闭菜单
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });

            // 点击外部区域关闭菜单
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }

        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'var(--bg-primary)';
                navbar.style.backdropFilter = 'none';
            }
        });
    }

    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 观察需要动画的元素
        const animateElements = document.querySelectorAll(
            '.article-card, .tool-card, .hero-content, .search-container'
        );

        animateElements.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    initSmoothScroll() {
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

    updateUITexts() {
        // 更新搜索框占位符
        const searchInput = document.getElementById('searchInput');
        if (searchInput && this.langConfig.searchPlaceholder) {
            searchInput.placeholder = this.langConfig.searchPlaceholder;
        }

        // 更新分类按钮文本
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            const category = btn.getAttribute('data-category');
            if (this.langConfig.categories && this.langConfig.categories[category]) {
                btn.textContent = this.langConfig.categories[category].name;
            }
        });

        // 更新无结果提示文本
        const noResultsTitle = document.querySelector('#noResults h3');
        const noResultsDesc = document.querySelector('#noResults p');
        if (noResultsTitle && this.langConfig.noResults) {
            noResultsTitle.textContent = this.langConfig.noResults;
        }
        if (noResultsDesc && this.langConfig.tryOtherKeywords) {
            noResultsDesc.textContent = this.langConfig.tryOtherKeywords;
        }
    }

    renderTools() {
        const toolsGrid = document.getElementById('toolsGrid');
        if (!toolsGrid || !window.toolsData) {
            console.warn('工具容器或数据未找到');
            return;
        }

        // 清空容器
        toolsGrid.innerHTML = '';

        // 生成工具卡片
        window.toolsData.forEach(tool => {
            const toolCard = this.createToolCard(tool);
            toolsGrid.appendChild(toolCard);
        });
    }

    initLanguageSwitch() {
        const langSwitch = document.querySelector('.lang-switch');
        if (langSwitch) {
            langSwitch.addEventListener('click', (e) => {
                // 添加点击效果
                langSwitch.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    langSwitch.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    createToolCard(tool) {
        const card = document.createElement('div');
        card.className = 'tool-card';
        const buttonText = this.langConfig.buttonText || '查看体验';
        card.innerHTML = `
            <i class="${tool.icon}"></i>
            <h3>${tool.title}</h3>
            <p>${tool.description}</p>
            <a href="${tool.url}" class="btn btn-outline">${buttonText}</a>
        `;
        return card;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});