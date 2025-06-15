import requests
from bs4 import BeautifulSoup
import os
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse
import time
import html2text

class BlogScraper:
    def __init__(self, base_url="https://www.snowpeak.fun/"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        # 创建目录
        self.create_directories()

        # 初始化HTML到Markdown转换器
        self.h = html2text.HTML2Text()
        self.h.ignore_links = False
        self.h.ignore_images = False
        self.h.body_width = 0

    def create_directories(self):
        """创建必要的目录结构"""
        directories = ['zh', 'en', 'assets/img']
        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    def get_all_article_links(self):
        """获取所有文章详情页链接"""
        article_links = []

        # 获取中文文章链接
        cn_links = self.get_article_links_from_category('cn')
        article_links.extend(cn_links)

        # 获取英文文章链接
        en_links = self.get_article_links_from_category('en')
        article_links.extend(en_links)

        return article_links

    def get_article_links_from_category(self, language='cn'):
        """从指定语言分类获取文章链接"""
        article_links = []
        page = 1

        print(f"开始获取{language}文章链接...")

        while True:
            list_url = f"{self.base_url}{language}/article/index/{page}/"
            print(f"正在检查列表页: {list_url}")

            try:
                response = self.session.get(list_url)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找文章详情页链接
                detail_links = self.extract_detail_links_from_list(soup, language)

                if not detail_links:
                    print(f"第{page}页没有找到文章链接，停止翻页")
                    break

                article_links.extend(detail_links)
                print(f"第{page}页找到 {len(detail_links)} 篇文章")

                # 检查是否有下一页
                if not self.has_next_page(soup):
                    print("已到达最后一页")
                    break

                page += 1
                time.sleep(1)  # 避免请求过快

            except requests.RequestException as e:
                print(f"获取列表页失败 {list_url}: {e}")
                break

        print(f"{language}语言共找到 {len(article_links)} 篇文章")
        return article_links

    def extract_detail_links_from_list(self, soup, language):
        """从列表页提取文章详情页链接"""
        detail_links = []

        # 查找所有可能的文章链接
        # 方法1: 查找包含 /article/detail/ 的链接
        detail_selectors = [
            f'a[href*="/{language}/article/detail/"]',
            f'a[href*="/article/detail/"]'
        ]

        for selector in detail_selectors:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href:
                    full_url = urljoin(self.base_url, href)
                    if self.is_detail_page(full_url, language):
                        detail_links.append(full_url)

        # 方法2: 查找h2 > a 结构中的详情链接
        h2_links = soup.select('h2 a')
        for link in h2_links:
            href = link.get('href', '')
            if f'/{language}/article/detail/' in href:
                full_url = urljoin(self.base_url, href)
                if full_url not in detail_links:
                    detail_links.append(full_url)

        # 去重
        return list(set(detail_links))

    def is_detail_page(self, url, language):
        """判断是否为文章详情页"""
        return (f'/{language}/article/detail/' in url and
                '/index/' not in url)

    def has_next_page(self, soup):
        """检查是否有下一页"""
        # 查找分页链接
        next_selectors = [
            'a[href*="/index/"]:contains("下一页")',
            'a[href*="/index/"]:contains("Next")',
            'a[href*="/index/"]:contains(">")',
            '.pagination a:contains("下一页")',
            '.pagination a:contains("Next")'
        ]

        for selector in next_selectors:
            if soup.select(selector):
                return True

        # 检查是否还有编号更大的页面链接
        current_page_links = soup.find_all('a', href=re.compile(r'/index/\d+/'))
        if current_page_links:
            return True

        return False

    def extract_article_title(self, soup):
        """专门提取您网站的文章标题"""
        try:
            # 方法1: 查找文章详情页的主标题（通常在详情页中是h1）
            h1_tag = soup.find('h1')
            if h1_tag:
                title = h1_tag.get_text().strip()
                if title and len(title) > 3:
                    print(f"在h1中找到标题: {title}")
                    return title

            # 方法2: 查找 h2 > a 结构的标题（列表页中的标题）
            h2_links = soup.select('h2 a')
            for link in h2_links:
                href = link.get('href', '')
                # 检查链接是否指向文章详情页
                if '/article/detail/' in href:
                    title = link.get_text().strip()
                    if title:
                        print(f"在h2>a中找到标题: {title}")
                        return title

            # 方法3: 查找page title（去除网站名称）
            title_tag = soup.find('title')
            if title_tag:
                full_title = title_tag.get_text().strip()
                # 移除常见的网站后缀
                suffixes_to_remove = [
                    ' - 雪峰网', ' - Snowpeak', ' | 雪峰网', ' | Snowpeak',
                    ' - snowpeak.fun', ' | snowpeak.fun', ' - SnowPeak'
                ]
                for suffix in suffixes_to_remove:
                    if suffix in full_title:
                        title = full_title.replace(suffix, '').strip()
                        if title:
                            print(f"从页面title中提取标题: {title}")
                            return title

                # 如果没有匹配的后缀，直接使用title（如果不太长）
                if len(full_title) < 100:
                    print(f"使用完整页面title: {full_title}")
                    return full_title

            # 方法4: 查找文章页面中的其他标题标签
            title_selectors = [
                '.article-title',
                '.post-title',
                '.entry-title',
                '.page-title',
                'h2',
                'h3'
            ]

            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem:
                    title = title_elem.get_text().strip()
                    if title and len(title) > 3 and len(title) < 100:
                        print(f"在{selector}中找到标题: {title}")
                        return title

        except Exception as e:
            print(f"提取文章标题时出错: {e}")

        return "无标题"

    def extract_publish_date(self, soup):
        """专门提取您网站的发布日期"""
        try:
            # 方法1: 查找包含日期格式的span标签
            # 匹配格式: YYYY-MM-DD HH:MM:SS
            date_pattern = r'\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}'

            # 查找所有span标签
            spans = soup.find_all('span')
            for span in spans:
                span_text = span.get_text().strip()
                if re.search(date_pattern, span_text):
                    # 提取日期部分
                    date_match = re.search(date_pattern, span_text)
                    if date_match:
                        date_str = date_match.group()
                        # 只取日期部分，忽略时间
                        date_only = date_str.split()[0]
                        print(f"找到发布日期: {date_only}")
                        return date_only

            # 方法2: 查找包含"分类:"的元素附近的日期
            category_elements = soup.find_all(text=re.compile(r'分类[:：]|Category[:：]'))
            for elem in category_elements:
                parent = elem.parent
                if parent:
                    # 在父元素及其兄弟元素中查找日期
                    siblings = parent.find_next_siblings()
                    for sibling in siblings:
                        if sibling.name == 'span':
                            sibling_text = sibling.get_text().strip()
                            date_match = re.search(date_pattern, sibling_text)
                            if date_match:
                                date_str = date_match.group()
                                date_only = date_str.split()[0]
                                print(f"在分类附近找到发布日期: {date_only}")
                                return date_only

            # 方法3: 查找包含完整日期时间格式的任何文本
            all_text = soup.get_text()
            date_matches = re.findall(date_pattern, all_text)
            if date_matches:
                # 取第一个匹配的日期
                date_str = date_matches[0]
                date_only = date_str.split()[0]
                print(f"在页面文本中找到发布日期: {date_only}")
                return date_only

            # 方法4: 查找meta标签中的日期信息
            meta_selectors = [
                'meta[property="article:published_time"]',
                'meta[name="pubdate"]',
                'meta[name="date"]',
                'meta[property="article:published"]'
            ]

            for selector in meta_selectors:
                meta_elem = soup.select_one(selector)
                if meta_elem and meta_elem.get('content'):
                    date_content = meta_elem['content']
                    parsed_date = self.parse_date(date_content)
                    if parsed_date != datetime.now().strftime('%Y-%m-%d'):
                        print(f"在meta标签中找到发布日期: {parsed_date}")
                        return parsed_date

            # 方法5: 查找time标签
            time_elem = soup.find('time')
            if time_elem:
                if time_elem.get('datetime'):
                    date_content = time_elem['datetime']
                    parsed_date = self.parse_date(date_content)
                    if parsed_date != datetime.now().strftime('%Y-%m-%d'):
                        print(f"在time标签中找到发布日期: {parsed_date}")
                        return parsed_date
                else:
                    time_text = time_elem.get_text().strip()
                    date_match = re.search(date_pattern, time_text)
                    if date_match:
                        date_str = date_match.group()
                        date_only = date_str.split()[0]
                        print(f"在time标签文本中找到发布日期: {date_only}")
                        return date_only

        except Exception as e:
            print(f"提取发布日期时出错: {e}")

        return None

    def extract_article_content(self, url):
        """提取文章内容"""
        try:
            # 判断语言
            language = 'en' if '/en/' in url else 'zh'

            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            article_data = {
                'url': url,
                'title': '',
                'date': '',
                'content': '',
                'language': language,
                'images': []
            }

            # 提取标题
            article_data['title'] = self.extract_article_title(soup)

            # 提取发布日期
            article_data['date'] = self.extract_publish_date(soup)

            # 如果没找到日期，使用当前日期
            if not article_data['date']:
                article_data['date'] = datetime.now().strftime('%Y-%m-%d')

            # 提取正文内容
            content_selectors = [
                '.article-content',
                '.post-content',
                '.content',
                '.entry-content',
                'article',
                '.post-body',
                '#content',
                '.main-content'
            ]

            content_elem = None
            for selector in content_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    break

            if not content_elem:
                # 如果没找到特定的内容区域，查找包含大量文本的div
                divs = soup.find_all('div')
                max_text_length = 0
                for div in divs:
                    text_length = len(div.get_text().strip())
                    if text_length > max_text_length:
                        max_text_length = text_length
                        content_elem = div

            if content_elem:
                # 处理图片
                self.process_images(content_elem, article_data)

                # 转换为Markdown
                article_data['content'] = self.h.handle(str(content_elem))

                # 清理内容
                article_data['content'] = self.clean_content(article_data['content'])

            return article_data

        except Exception as e:
            print(f"提取文章内容时出错 {url}: {e}")
            return None

    def extract_keywords_from_title(self, title, language='zh'):
        """从文章标题中提取关键词"""
        try:
            # 清理标题
            title = title.strip()

            if language == 'zh':
                # 中文关键词提取
                keywords = self.extract_chinese_keywords(title)
            else:
                # 英文关键词提取
                keywords = self.extract_english_keywords(title)

            # 如果没有提取到关键词，使用前几个字符
            if not keywords:
                if language == 'zh':
                    keywords = title[:6]  # 中文取前6个字符
                else:
                    keywords = title.split()[0] if title.split() else title[:10]  # 英文取第一个单词

            # 确保关键词适合做文件名
            keywords = self.safe_filename(keywords)

            print(f"从标题 '{title}' 提取关键词: '{keywords}'")
            return keywords

        except Exception as e:
            print(f"提取关键词时出错: {e}")
            return "article"

    def extract_chinese_keywords(self, title):
        """提取中文关键词"""
        # 定义中文技术关键词字典
        tech_keywords = {
            'php': 'php',
            'mysql': 'mysql',
            'javascript': 'js',
            'js': 'js',
            'css': 'css',
            'html': 'html',
            'python': 'python',
            'java': 'java',
            'docker': 'docker',
            'nginx': 'nginx',
            'apache': 'apache',
            'linux': 'linux',
            'windows': 'windows',
            'android': 'android',
            'ios': 'ios',
            'api': 'api',
            'sql': 'sql',
            'json': 'json',
            'xml': 'xml',
            'ssl': 'ssl',
            'https': 'https',
            'http': 'http',
            'socket': 'socket',
            'tcp': 'tcp',
            'udp': 'udp',
            'git': 'git',
            'github': 'github',
            'redis': 'redis',
            'mongodb': 'mongodb',
            'elasticsearch': 'elasticsearch',
            'oauth': 'oauth',
            'jwt': 'jwt',
            'rest': 'rest',
            'graphql': 'graphql',
            'webpack': 'webpack',
            'vue': 'vue',
            'react': 'react',
            'angular': 'angular',
            'node': 'node',
            'npm': 'npm',
            'yarn': 'yarn',
            'bootstrap': 'bootstrap',
            'jquery': 'jquery',
            'ajax': 'ajax',
            'websocket': 'websocket',
            'laravel': 'laravel',
            'symfony': 'symfony',
            'codeigniter': 'codeigniter',
            'wordpress': 'wordpress',
            'drupal': 'drupal'
        }

        # 常见中文技术词汇
        chinese_tech_terms = {
            '数据库': 'database',
            '服务器': 'server',
            '框架': 'framework',
            '算法': 'algorithm',
            '网站': 'website',
            '系统': 'system',
            '应用': 'app',
            '开发': 'dev',
            '编程': 'program',
            '设计': 'design',
            '部署': 'deploy',
            '配置': 'config',
            '优化': 'optimize',
            '安全': 'security',
            '性能': 'performance',
            '测试': 'test',
            '调试': 'debug',
            '教程': 'tutorial',
            '指南': 'guide',
            '实现': 'implement',
            '解决': 'solution',
            '问题': 'problem',
            '方案': 'solution',
            '技巧': 'tips',
            '经验': 'experience',
            '分享': 'share',
            '总结': 'summary',
            '学习': 'learn',
            '研究': 'research',
            '探讨': 'discuss',
            '分析': 'analysis',
            '比较': 'compare',
            '介绍': 'intro',
            '使用': 'usage',
            '安装': 'install',
            '运行': 'run',
            '管理': 'manage',
            '监控': 'monitor',
            '日志': 'log',
            '错误': 'error',
            '异常': 'exception',
            '修复': 'fix',
            '更新': 'update',
            '升级': 'upgrade',
            '迁移': 'migration',
            '备份': 'backup',
            '恢复': 'restore',
            '集成': 'integration',
            '接口': 'interface',
            '协议': 'protocol',
            '架构': 'architecture',
            '模式': 'pattern',
            '模型': 'model',
            '层次': 'hierarchical',
            '嵌套': 'nested',
            '树形': 'tree',
            '递归': 'recursive',
            '搜索': 'search',
            '排序': 'sort',
            '过滤': 'filter',
            '缓存': 'cache',
            '队列': 'queue',
            '消息': 'message',
            '推送': 'push',
            '通知': 'notification',
            '邮件': 'email',
            '短信': 'sms',
            '支付': 'payment',
            '登录': 'login',
            '注册': 'register',
            '认证': 'auth',
            '权限': 'permission',
            '角色': 'role',
            '用户': 'user',
            '管理员': 'admin',
            '客户': 'customer',
            '订单': 'order',
            '商品': 'product',
            '商城': 'shop',
            '电商': 'ecommerce',
            '博客': 'blog',
            '论坛': 'forum',
            '社区': 'community',
            '平台': 'platform',
            '门户': 'portal',
            '官网': 'website',
            '主页': 'homepage',
            '首页': 'index',
            '页面': 'page',
            '模板': 'template',
            '主题': 'theme',
            '样式': 'style',
            '布局': 'layout',
            '响应式': 'responsive',
            '移动端': 'mobile',
            '手机': 'mobile',
            '平板': 'tablet',
            '桌面': 'desktop',
            '浏览器': 'browser',
            '兼容': 'compatible',
            '跨平台': 'crossplatform',
            '多语言': 'multilang',
            '国际化': 'i18n',
            '本地化': 'l10n'
        }

        title_lower = title.lower()

        # 首先查找英文技术关键词
        found_keywords = []
        for keyword, short_name in tech_keywords.items():
            if keyword in title_lower:
                found_keywords.append(short_name)

        # 查找中文技术词汇
        for chinese_term, english_equivalent in chinese_tech_terms.items():
            if chinese_term in title:
                found_keywords.append(english_equivalent)

        # 如果找到了技术关键词，优先使用
        if found_keywords:
            return '_'.join(found_keywords[:2])  # 最多取两个关键词

        # 如果没有找到技术关键词，提取有意义的中文词汇
        # 移除常见的停用词
        stop_words = ['的', '了', '在', '是', '和', '与', '或', '但', '而', '等', '及', '以', '为', '从', '到', '由', '对', '关于', '通过', '使用', '如何', '怎么', '什么', '哪个', '这个', '那个', '一个', '一些', '所有', '全部', '部分', '某些', '各种', '多种', '不同', '相同', '类似', '相关', '重要', '主要', '基本', '简单', '复杂', '高级', '初级', '中级', '最新', '最佳', '更好', '更快', '更多', '详细', '完整', '全面']

        # 分词（简单实现）
        words = []
        i = 0
        current_word = ""

        while i < len(title):
            char = title[i]
            if '\u4e00' <= char <= '\u9fff':  # 中文字符
                current_word += char
            else:
                if current_word and current_word not in stop_words:
                    words.append(current_word)
                current_word = ""
                if char.isalnum():
                    # 英文或数字
                    eng_word = ""
                    while i < len(title) and (title[i].isalnum() or title[i] in '.-_'):
                        eng_word += title[i]
                        i += 1
                    i -= 1
                    if eng_word and len(eng_word) > 1:
                        words.append(eng_word.lower())
            i += 1

        if current_word and current_word not in stop_words:
            words.append(current_word)

        # 过滤掉停用词和单字
        meaningful_words = [word for word in words if len(word) > 1 and word not in stop_words]

        if meaningful_words:
            # 取前两个有意义的词
            return '_'.join(meaningful_words[:2])

        # 如果还是没有，返回标题的前几个字符
        return title[:8]

    def extract_english_keywords(self, title):
        """提取英文关键词"""
        # 英文停用词
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'since', 'until', 'while', 'within', 'without', 'against', 'across', 'behind', 'beside', 'beyond', 'inside', 'outside', 'throughout', 'underneath', 'upon', 'within', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'how', 'when', 'where', 'why', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
        }

        # 技术关键词优先级
        tech_priority_words = {
            'php', 'mysql', 'javascript', 'python', 'java', 'css', 'html', 'docker', 'kubernetes', 'nginx', 'apache', 'linux', 'windows', 'android', 'ios', 'api', 'rest', 'graphql', 'oauth', 'jwt', 'ssl', 'https', 'tcp', 'udp', 'socket', 'websocket', 'git', 'github', 'redis', 'mongodb', 'elasticsearch', 'webpack', 'vue', 'react', 'angular', 'node', 'npm', 'bootstrap', 'jquery', 'ajax', 'laravel', 'symfony', 'wordpress', 'drupal', 'algorithm', 'database', 'server', 'framework', 'development', 'programming', 'design', 'security', 'performance', 'testing', 'debugging', 'tutorial', 'guide', 'implementation', 'solution', 'optimization', 'configuration', 'deployment', 'migration', 'backup', 'monitoring', 'logging', 'architecture', 'pattern', 'model', 'hierarchical', 'nested', 'recursive', 'search', 'sorting', 'filtering', 'caching', 'queue', 'message', 'notification', 'authentication', 'authorization', 'permission', 'user', 'admin', 'customer', 'order', 'product', 'ecommerce', 'blog', 'forum', 'community', 'platform', 'website', 'homepage', 'template', 'theme', 'responsive', 'mobile', 'browser', 'compatibility', 'crossplatform', 'multilingual', 'internationalization'
        }

        # 清理和分词
        import re
        # 移除标点符号，保留字母数字和空格
        cleaned_title = re.sub(r'[^\w\s]', ' ', title.lower())
        words = cleaned_title.split()

        # 过滤停用词和单字母词
        meaningful_words = [word for word in words if len(word) > 1 and word not in stop_words]

        # 优先选择技术关键词
        tech_words = [word for word in meaningful_words if word in tech_priority_words]
        if tech_words:
            return '_'.join(tech_words[:2])

        # 如果没有技术关键词，选择其他有意义的词
        if meaningful_words:
            return '_'.join(meaningful_words[:2])

        # 如果都没有，返回第一个单词
        first_words = title.split()[:2]
        return '_'.join([re.sub(r'[^\w]', '', word.lower()) for word in first_words if word])

    def process_images(self, content_elem, article_data):
        """处理文章中的图片"""
        images = content_elem.find_all('img')
        img_counter = 1

        # 从标题提取关键词用于图片文件名
        keywords = self.extract_keywords_from_title(article_data['title'], article_data['language'])

        for img in images:
            try:
                img_url = img.get('src')
                if not img_url:
                    continue

                # 转换为绝对URL
                img_url = urljoin(self.base_url, img_url)

                # 下载图片
                img_response = self.session.get(img_url, timeout=30)
                img_response.raise_for_status()

                # 确定文件扩展名
                parsed_url = urlparse(img_url)
                ext = os.path.splitext(parsed_url.path)[1]
                if not ext:
                    ext = '.jpg'  # 默认扩展名

                # 生成文件名：{发布日期}_{keywords}_{xx}.png
                safe_date = article_data['date'].replace('-', '')
                img_filename = f"{safe_date}_{keywords}_{img_counter:02d}{ext}"
                img_path = os.path.join('assets', 'img', img_filename)

                # 保存图片
                os.makedirs(os.path.dirname(img_path), exist_ok=True)
                with open(img_path, 'wb') as f:
                    f.write(img_response.content)

                # 更新图片标签
                img['src'] = f"../assets/img/{img_filename}"

                article_data['images'].append({
                    'original_url': img_url,
                    'local_path': img_path,
                    'filename': img_filename
                })

                img_counter += 1
                print(f"已保存图片: {img_filename}")

            except Exception as e:
                print(f"处理图片时出错 {img.get('src', 'unknown')}: {e}")
                continue

    def parse_date(self, date_string):
        """解析日期字符串"""
        # 清理日期字符串
        date_string = str(date_string).strip()

        # 常见日期格式
        date_formats = [
            '%Y-%m-%d %H:%M:%S',  # 2011-12-20 21:59:17
            '%Y-%m-%d',           # 2011-12-20
            '%Y/%m/%d %H:%M:%S',  # 2011/12/20 21:59:17
            '%Y/%m/%d',           # 2011/12/20
            '%d/%m/%Y',           # 20/12/2011
            '%m/%d/%Y',           # 12/20/2011
            '%B %d, %Y',          # December 20, 2011
            '%b %d, %Y',          # Dec 20, 2011
            '%d %B %Y',           # 20 December 2011
            '%d %b %Y',           # 20 Dec 2011
            '%Y-%m-%dT%H:%M:%S',  # ISO format
            '%Y-%m-%dT%H:%M:%SZ', # ISO format with Z
        ]

        # 如果包含时间，先尝试提取日期部分
        if ' ' in date_string and ':' in date_string:
            date_part = date_string.split()[0]
            if re.match(r'\d{4}-\d{2}-\d{2}', date_part):
                return date_part

        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_string, fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                continue

        # 尝试使用正则表达式提取日期
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\d{4}/\d{2}/\d{2})',  # YYYY/MM/DD
            r'(\d{2}/\d{2}/\d{4})',  # DD/MM/YYYY or MM/DD/YYYY
        ]

        for pattern in date_patterns:
            match = re.search(pattern, date_string)
            if match:
                extracted_date = match.group(1)
                # 尝试解析提取的日期
                for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%d/%m/%Y', '%m/%d/%Y']:
                    try:
                        parsed_date = datetime.strptime(extracted_date, fmt)
                        return parsed_date.strftime('%Y-%m-%d')
                    except ValueError:
                        continue

        # 如果都解析失败，返回当前日期
        print(f"无法解析日期格式: {date_string}")
        return datetime.now().strftime('%Y-%m-%d')

    def safe_filename(self, filename):
        """生成安全的文件名"""
        # 移除或替换不安全的字符
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        filename = re.sub(r'\s+', '_', filename)
        filename = filename[:50]  # 限制长度
        return filename

    def clean_content(self, content):
        """清理Markdown内容"""
        # 移除多余的空行
        content = re.sub(r'\n{3,}', '\n\n', content)

        # 移除HTML注释
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)

        # 清理多余的空格
        lines = content.split('\n')
        cleaned_lines = []
        for line in lines:
            cleaned_lines.append(line.rstrip())

        return '\n'.join(cleaned_lines)

    def save_article(self, article_data):
        """保存文章为Markdown文件"""
        if not article_data or not article_data['title']:
            return False

        try:
            # 确定保存目录
            lang_dir = 'zh' if article_data['language'] == 'zh' else 'en'

            # 从标题提取关键词
            keywords = self.extract_keywords_from_title(article_data['title'], article_data['language'])

            # 生成文件名：{发布日期}_{keywords}.md
            safe_date = article_data['date'].replace('-', '')
            filename = f"{safe_date}_{keywords}.md"
            filepath = os.path.join(lang_dir, filename)

            # 准备Markdown内容
            markdown_content = f"""# {article_data['title']}

*发布时间: {article_data['date']}*
---
{article_data['content']}
"""

            # 保存文件
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(markdown_content)

            print(f"已保存文章: {filepath}")
            return True

        except Exception as e:
            print(f"保存文章时出错: {e}")
            return False

    def scrape_all_articles(self):
        """抓取所有文章"""
        print("开始抓取博客文章...")

        # 获取所有文章详情页链接
        article_links = self.get_all_article_links()

        if not article_links:
            print("未找到文章链接")
            return

        print(f"总共找到 {len(article_links)} 篇文章")

        success_count = 0
        cn_count = 0
        en_count = 0

        for i, url in enumerate(article_links, 1):
            print(f"\n处理文章 {i}/{len(article_links)}: {url}")

            # 提取文章内容
            article_data = self.extract_article_content(url)

            if article_data and article_data['title'] != "无标题":
                # 保存文章
                if self.save_article(article_data):
                    success_count += 1
                    if article_data['language'] == 'zh':
                        cn_count += 1
                    else:
                        en_count += 1

            # 添加延迟以避免过于频繁的请求
            time.sleep(2)

        print(f"\n抓取完成!")
        print(f"成功保存 {success_count}/{len(article_links)} 篇文章")
        print(f"中文文章: {cn_count} 篇")
        print(f"英文文章: {en_count} 篇")

def main():
    scraper = BlogScraper()
    scraper.scrape_all_articles()

if __name__ == "__main__":
    main()
