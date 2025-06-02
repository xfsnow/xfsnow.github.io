class ArticleSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.articlesGrid = document.getElementById('articlesGrid');
        this.noResults = document.getElementById('noResults');
        this.filterButtons = document.querySelectorAll('.filter-btn');

        this.currentFilter = 'all';
        this.currentSearchTerm = '';

        this.init();
    }

    init() {
        this.renderArticles();
        this.bindEvents();
    }

    bindEvents() {
        // 搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value.toLowerCase().trim();
            this.performSearch();
        });

        // 分类筛选事件
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.category;
                this.performSearch();
            });
        });
    }

    performSearch() {
        let filteredArticles = window.searchIndex;

        // 按分类筛选
        if (this.currentFilter !== 'all') {
            filteredArticles = filteredArticles.filter(article =>
                article.category === this.currentFilter
            );
        }

        // 按搜索词筛选
        if (this.currentSearchTerm) {
            filteredArticles = filteredArticles.filter(article =>
                article.searchText.includes(this.currentSearchTerm)
            );
        }

        this.renderArticles(filteredArticles);
    }

    renderArticles(articles = window.articlesData) {
        if (articles.length === 0) {
            this.articlesGrid.style.display = 'none';
            this.noResults.style.display = 'block';
            return;
        }

        this.articlesGrid.style.display = 'grid';
        this.noResults.style.display = 'none';

        this.articlesGrid.innerHTML = articles.map(article =>
            this.createArticleCard(article)
        ).join('');

        // 添加淡入动画
        const cards = this.articlesGrid.querySelectorAll('.article-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    createArticleCard(article) {
        const categoryInfo = window.categories[article.category];
        const featuredBadge = article.featured ?
            '<span class="featured-badge"><i class="fas fa-star"></i> 推荐</span>' : '';

        return `
            <article class="article-card" data-category="${article.category}">
                <div class="article-header">
                    <div class="article-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(article.date)}</span>
                        <span><i class="fas fa-clock"></i> ${article.readTime}</span>
                        <span class="category-tag" style="background: ${categoryInfo.color}; color: white;">
                            <i class="fas fa-tag"></i> ${categoryInfo.name}
                        </span>
                    </div>
                    <h3>${article.title}</h3>
                    ${featuredBadge}
                </div>
                <div class="article-content">
                    <p class="article-description">${article.description}</p>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${article.url}" class="read-more">
                        阅读全文 <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 添加推荐徽章样式
const style = document.createElement('style');
style.textContent = `
    .featured-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #f59e0b;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .article-header {
        position: relative;
    }

    .category-tag {
        font-weight: 600 !important;
        border-radius: 8px !important;
        padding: 4px 10px !important;
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化搜索
document.addEventListener('DOMContentLoaded', () => {
    new ArticleSearch();
});
