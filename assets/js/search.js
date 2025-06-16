class SearchHandler {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.articlesGrid = document.getElementById('articlesGrid');
        this.noResults = document.getElementById('noResults');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.currentFilter = 'all';
        this.currentQuery = '';
        this.langConfig = window.langMap || {};

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderArticles();
    }

    bindEvents() {
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
        if (!this.articlesGrid || !window.articlesData) return;

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
        let articles = window.articlesData || [];

        // 分类筛选
        if (this.currentFilter !== 'all') {
            articles = articles.filter(article =>
                article.category === this.currentFilter
            );
        }

        // 搜索筛选
        if (this.currentQuery) {
            articles = articles.filter(article => {
                const searchText = [
                    article.title,
                    article.description,
                    ...article.tags
                ].join(' ').toLowerCase();

                return searchText.includes(this.currentQuery);
            });
        }

        return articles;
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';

        const categoryConfig = this.langConfig.categories?.[article.category];
        const categoryName = categoryConfig?.name || article.category;
        const categoryColor = categoryConfig?.color || '#64748b';

        card.innerHTML = `
            <div class="article-meta">
                <span class="article-category" style="background-color: ${categoryColor}">
                    ${categoryName}
                </span>
                <span class="article-date">${article.date}</span>
            </div>
            <h3 class="article-title">
                <a href="${article.url}">${article.title}</a>
            </h3>
            <p class="article-description">${article.description}</p>
            <div class="article-tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
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

// 页面加载完成后初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    new SearchHandler();
});
// 页面加载完成后初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    new SearchHandler();
});
