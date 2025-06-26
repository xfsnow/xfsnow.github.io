// 导出数据到全局
window.articles = typeof articles !== 'undefined' ? articles : [];

class Blog {
    constructor() {
        // 搜索相关属性
        this.searchInput = document.getElementById('searchInput');
        this.articlesGrid = document.getElementById('articlesGrid');
        this.noResults = document.getElementById('noResults');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.currentQuery = '';

        this.init();
    }

    init() {
        this.initNavigation();
        this.initScrollEffects();
        this.initSmoothScroll();
        this.bindSearchEvents();
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

    // 搜索相关方法
    bindSearchEvents() {
        // 搜索输入事件
        if (this.searchInput) {
            this.searchInput.addEventListener('input',
                this.debounce((e) => this.handleSearch(e.target.value), 300)
            );
        }

        // 分类筛选事件
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.getAttribute('data-category'));
            });
        });
    }

    handleSearch(query) {
        this.currentQuery = query.toLowerCase().trim();
        this.renderArticles();
    }

    handleFilter(category) {
        this.currentFilter = category;

        // 更新按钮状态
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            }
        });

        this.renderArticles();
    }

    renderArticles() {
        if (!this.articlesGrid || !window.articles) return;

        const filteredArticles = this.filterArticles();

        if (filteredArticles.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();
        this.articlesGrid.innerHTML = '';

        filteredArticles.forEach(article => {
            const articleCard = this.createArticleCard(article);
            this.articlesGrid.appendChild(articleCard);
        });
    }

    filterArticles() {
        let articles = window.articles || [];

        // 分类筛选
        if (this.currentFilter !== 'all') {
            articles = articles.filter(article => {
                // 创建分类映射
                const categoryMap = {
                    'ai': 'AI',
                    'azure': 'Azure',
                    'copilot': 'AI', // GitHub Copilot相关文章通常归类为AI
                    'tools': 'Tools',
                    'system': 'System',
                    'development': 'Development',
                    'cloud': 'Cloud',
                    'backend': 'Backend',
                    'database': 'Database',
                    'frontend': 'Frontend',
                    'web': 'Web',
                    'network': 'Network',
                    'mobile': 'Mobile',
                    'software': 'Software',
                    'programming': 'Programming',
                    'framework': 'Framework'
                };

                const targetCategory = categoryMap[this.currentFilter] || this.currentFilter;
                return article.category === targetCategory;
            });
        }

        // 搜索筛选
        if (this.currentQuery) {
            articles = articles.filter(article => {
                const searchText = [
                    article.title,
                    article.description
                ].join(' ').toLowerCase();

                return searchText.includes(this.currentQuery);
            });
        }

        return articles;
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';

        // 简化的分类显示，直接使用CSS类
        const categoryClass = `article-category-${article.category}`;

        card.innerHTML = `
            <div class="article-meta">
                <span class="article-category ${categoryClass}">
                    ${article.category}
                </span>
                <span class="article-date">${article.time_publish}</span>
            </div>
            <h3 class="article-title">
                <a href="${article.filename}">${article.title}</a>
            </h3>
            <p class="article-description">${article.description}</p>
        `;

        return card;
    }

    showNoResults() {
        if (this.articlesGrid) {
            this.articlesGrid.innerHTML = '';
        }
        if (this.noResults) {
            this.noResults.style.display = 'block';
        }
    }

    hideNoResults() {
        if (this.noResults) {
            this.noResults.style.display = 'none';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new Blog();
});
