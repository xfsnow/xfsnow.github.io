import markdown
import os
import re
import json
from datetime import datetime
from View import View  # 修正导入方式

class BlogMaker:
    def __init__(self, langPath: str = 'zh'):
        self.view = View()
        self.langPath = langPath

    def getLang(self):
        """读取 lang.json 文件，获取语言相关的配置"""
        lang_file = os.path.join(self.langPath, 'lang.json')
        if not os.path.exists(lang_file):
            print(f"语言文件 {lang_file} 不存在")
            return {}

        with open(lang_file, 'r', encoding='utf-8') as f:
            lang_data = json.load(f)

        # 返回语言配置
        return lang_data

    def list_articles(self):
        js_file = os.path.join(self.langPath, 'index.js')
          # 一次性读出 index.js 文件全部内容，把前面的 const articles=去掉，结尾的分号也去掉，最后 json.loads() 解析成 Python 对象
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
            content = content.replace('const articles=', '').rstrip(';')
            articles = json.loads(content)
            return articles

    def make_home(self):
        """读取 index.js 文件，解析文章数据并生成首页 HTML"""
        data = {}
        data['lang'] = self.getLang()  # 获取语言配置

        articles = self.list_articles()
        # 取最前 10 条
        data['articles'] = articles[:10]

        # 提取所有文章的分类并创建分类映射
        categories_set = set()
        category_names = {}  # 存储 category -> category_name 的映射

        for article in articles:
            if 'category' in article and article['category']:
                categories_set.add(article['category'])
                # 直接从文章中获取 category_name
                if 'category_name' in article and article['category_name']:
                    category_names[article['category']] = article['category_name']

        # 构建分类列表，包含实际存在的分类
        categories = []
        for category in sorted(categories_set):
            categories.append({
                'key': category,
                'value': category_names.get(category, category)  # 直接使用已有的 category_name
            })

        data['categories'] = categories

        # 加载 tools.json 文件
        tools_file = os.path.join(self.langPath, 'tools.json')
        if os.path.exists(tools_file):
            with open(tools_file, 'r', encoding='utf-8') as f:
                data['tools'] = json.load(f)
        else:
            data['tools'] = []

        # 渲染模板
        html_content = self.view.render_template('index.html', data=data)
        # 保存生成的 HTML 文件
        if 'zh' == self.langPath:
            # 如果是中文，则保存为 /index.html
            output_file = 'index.html'
        else:
            output_file = os.path.join(self.langPath, 'index.html')
        self.view.write_html(output_file, html_content, strip=True)

    # markdown 转成HTML，然后再带上模板的页眉和页脚
    def make_article(self):
        articles = self.list_articles()
        # 遍历所有文章，生成每篇文章的 HTML
        for article in articles:
            markdownPath = os.path.join(self.langPath, article['filename'].replace('.htm', '.md'))
            # markdownPath 去掉开头 / 符
            markdownPath = markdownPath.lstrip('/')
            print(f"正在处理文章: {markdownPath}")
            # exit()
            if not os.path.exists(markdownPath):
                print(f"文章文件 {markdownPath} 不存在")
                continue

            with open(markdownPath, 'r', encoding='utf-8') as f:
                content = f.read()

            # 取第一个 --------- 以后的内容为文章正文
            # 使用正则表达式匹配第一个 '---' 之后的内容
            content = re.split(r'^-+\s*$', content, maxsplit=1, flags=re.MULTILINE)
            content = content[1] if len(content) > 1 else content[0]  # 取第二部分作为正文

            # 使用 markdown 库将 Markdown 转换为 HTML
            html_content = markdown.markdown(content, extensions=['fenced_code', 'tables'])
            # 根据 markdown 文件内容长度粗略估计阅读时间， 假设每分钟阅读 60 个单词
            reading_time = len(content.split()) // 60
            reading_time_str = f"{reading_time}" if reading_time > 0 else "1"

            # 渲染模板
            data = {
                'article': {
                    'title': article['title'],
                    'date': article['time_publish'],
                    'reading_time': reading_time_str,
                    'category_name': article['category_name'],
                    'content': html_content
                },
                'lang': self.getLang()
            }
            rendered_html = self.view.render_template('article.html', data=data)

            # 保存生成的 HTML 文件
            output_file = os.path.join(self.langPath, article['filename']).lstrip('/')
            self.view.write_html(output_file, rendered_html, strip=True)
            # break

        print(f"已生成 {len(articles)} 篇文章的 HTML 文件")

    def make_pager(self, page_size: int = 10):
        """生成文章分页页面"""
        articles = self.list_articles()
        total_articles = len(articles)
        total_pages = (total_articles + page_size - 1) // page_size

        if total_pages == 0:
            print("没有文章需要分页")
            return

        # 为每一页生成HTML文件
        for page_num in range(1, total_pages + 1):
            start_index = (page_num - 1) * page_size
            end_index = min(start_index + page_size, total_articles)
            page_articles = articles[start_index:end_index]

            # 准备模板数据
            data = {
                'lang': self.getLang(),
                'articles': page_articles,
                'page': page_num,
                'total_pages': total_pages,
                'page_size': page_size,
                'total_articles': total_articles
            }

            # 渲染模板
            html_content = self.view.render_template('page.html', data=data)

            # 生成文件名
            output_file = os.path.join(self.langPath, f'page_{page_num}.htm')

            # 保存生成的HTML文件
            self.view.write_html(output_file, html_content, strip=True)

        print(f"已生成 {total_pages} 个分页文件，共 {total_articles} 篇文章")

    def make_about(self):
        """生成关于页面"""
        markdownPath = os.path.join(self.langPath, 'about.md')
        with open(markdownPath, 'r', encoding='utf-8') as f:
                content = f.read()
        # 取第一个 --------- 以后的内容为文章正文
        # 使用正则表达式匹配第一个 '---' 之后的内容
        content = re.split(r'^-+\s*$', content, maxsplit=1, flags=re.MULTILINE)
        # print(content)
        content = content[1] if len(content) > 1 else content[0]  # 取第二部分作为正文

        # 使用 markdown 库将 Markdown 转换为 HTML
        html_content = markdown.markdown(content, extensions=['fenced_code', 'tables'])
        data = {
            'lang': self.getLang(),
            'article': {
                    'date': '2010-10-9 09:00:00',
                    'content': html_content
                },
        }
        if 'zh' == self.langPath:
            data['article']['title'] = '关于雪峰'
            data['article']['reading_time'] = '1分钟'
            data['article']['category_name'] = '关于'
        else:
            data['article']['title'] = 'About Snowpeak'
            data['article']['reading_time'] = '1 min'
            data['article']['category_name'] = 'About'
        # 渲染模板
        html_content = self.view.render_template('article.html', data=data)
        # 保存生成的 HTML 文件
        output_file = os.path.join(self.langPath, 'about.htm')
        self.view.write_html(output_file, html_content, strip=True)

    # 生成文章列表的分页 HTML 文件，同样也带上模板的页眉和页脚
    def make_article_pagination(self, articles: list, page_size: int = 10):
        """对文章列表进行分页"""
        pages = []
        for i in range(0, len(articles), page_size):
            pages.append(articles[i:i + page_size])
        return pages

    def index_article(self):
        """遍历指定目录下的所有 Markdown 文件，提取文章信息并生成索引"""
        articles = []
        path = self.langPath
        # 确保路径存在
        if not os.path.exists(path):
            print(f"路径 {path} 不存在")
            return articles

        # 遍历目录下的所有文件
        for filename in os.listdir(path):
            # 只处理以 .md 结尾的文件，并且不处理以 about 开头的“关于”页面
            if filename.endswith('.md') and not filename.startswith('about'):
                filepath = os.path.join(path, filename)
                article_info = self.extract_article_info(filepath, filename)
                if article_info:
                    articles.append(article_info)

        # 按发布时间倒序排序
        articles.sort(key=lambda x: x['time_publish'], reverse=True)

        # 生成 JavaScript 文件
        self.generate_article_js(articles, path)

        return articles

    def extract_article_info(self, filepath: str, filename: str):
        """从单个 Markdown 文件中提取文章信息"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            lines = content.split('\n')
            fileUrl = '/' + self.langPath +'/' + filename.replace('.md', '.htm')
            article_info = {
                'filename': fileUrl,
                'title': '',
                'summary': '',
                'time_publish': '',
                'category': '',
                'category_name': ''  # 添加分类显示名称字段
            }

            # 提取标题 (第一行的 # 标题)
            for line in lines:
                if line.strip().startswith('# '):
                    article_info['title'] = line.strip()[2:].strip()
                    break
            # 提取发布时间（完整的年月日时分秒），形如 Published: *2025-02-12 18:01:01* ，或 发布时间:  *2025-02-12 18:01:01*
            langMap = self.getLang()
            hint = langMap.get('published', '发布时间')
            time_pattern = hint + r':\s*\*?([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2}:[0-9]{2})?)'
            time_match = re.search(time_pattern, content)
            if time_match:
                time_str = time_match.group(1)
                # 如果只有日期没有时间，添加默认时间
                if len(time_str) == 10:  # 只有日期
                    time_str += ' 00:00:00'
                article_info['time_publish'] = time_str

            # 提取分类 - 更新正则表达式以匹配双下划线格式
            hint = langMap.get('category', '分类')
            # 使用双下划线格式的分类
            category_pattern = hint + r':\s*__([^_\n]+)__'
            category_match = re.search(category_pattern, content)
            if category_match:
                category = category_match.group(1).strip()
                article_info['category'] = self.map_category(category)
                # 添加分类显示名称
                category_display_map = self.getLang().get('categoryMap', {})
                article_info['category_name'] = category_display_map.get(article_info['category'], category)
            else:
                # 如果没有找到分类，尝试从文件名或内容推断
                article_info['category'] = self.infer_category_from_content(content, filename)
                # 添加分类显示名称
                category_display_map = self.getLang().get('categoryMap', {})
                article_info['category_name'] = category_display_map.get(article_info['category'], article_info['category'])

            # 提取简介
            hint = langMap.get('summary', '简介')
            intro_pattern = hint +r':\s*([^\n]+(?:\n[^\n-]+)*)'
            intro_match = re.search(intro_pattern, content)
            if intro_match:
                summary = intro_match.group(1).strip()
                # 限制简介长度
                if len(summary) > 200:
                    summary = summary[:200] + '...'
                article_info['summary'] = summary

            # 如果没有找到简介，从正文提取前几行
            if not article_info['summary']:
                article_info['summary'] = self.extract_summary_from_content(content)

            return article_info

        except Exception as e:
            print(f"处理文件 {filepath} 时出错: {e}")
            return None

    def map_category(self, category: str):
        # 从 self.getLang() 中获取分类映射
        category_display_map = self.getLang().get('categoryMap', {})
        # 再反转键与值，得到中文为键，英文为值的映射
        default_category = 'Tools'
        if not category_display_map:
            return default_category
        category_display_map = {v: k for k, v in category_display_map.items()}
        return category_display_map.get(category, default_category)  # 默认返回 'Tools' 分类

    def infer_category_from_content(self, content: str, filename: str):
        """从内容或文件名推断分类"""
        content_lower = content.lower()
        filename_lower = filename.lower()

        # GitHub Copilot相关关键词都算AI相关关键词
        ai_keywords = ['ai', 'gpt', 'copilot', 'openai', 'claude', 'deepseek', 'vision', '人工智能', '机器学习', '深度学习','copilot', 'github copilot', 'mcp', 'vision plugin']
        if any(keyword in content_lower or keyword in filename_lower for keyword in ai_keywords):
            return 'AI'

        # Azure相关关键词
        azure_keywords = ['azure', 'cloud', '云计算', '云服务', 'vm', 'virtual machine']
        if any(keyword in content_lower or keyword in filename_lower for keyword in azure_keywords):
            return 'Azure'

        # 默认分类
        return 'tools'

    def extract_summary_from_content(self, content: str):
        """从文章内容中提取描述"""
        lines = content.split('\n')
        summary_lines = []

        # 跳过前面的元数据，找到正文
        skip_patterns = ['---', '#', '发布时间', '简介', '分类', '原文链接']

        for line in lines:
            line = line.strip()

            # 跳过空行
            if not line:
                continue

            # 跳过元数据行
            should_skip = False
            for pattern in skip_patterns:
                if line.startswith(pattern):
                    should_skip = True
                    break

            if should_skip:
                continue

            # 跳过包含分类信息的行
            if '分类:' in line or '__' in line:
                continue

            # 这是正文内容
            summary_lines.append(line)

            # 收集够足够的文本就停止
            if len(' '.join(summary_lines)) > 200:
                break

        summary = ' '.join(summary_lines)
        if len(summary) > 200:
            summary = summary[:200] + '...'

        return summary if summary else '暂无描述'

    def generate_article_js(self, articles: list, path: str):
        # json.dumps() 不带格式和缩进，可以精简输出文件的体积
        js_content = "const articles=" + json.dumps(articles, ensure_ascii=False) + ";"
        # js_content = "const articles=" + json.dumps(articles, ensure_ascii=False, indent=4) + ";"
        # 保存到文件
        output_file = os.path.join(path, 'index.js')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(js_content)

        print(f"已生成 {len(articles)} 篇文章的索引文件: {output_file}")


    def main(self):
        # 处理文章索引
        zh_articles = self.index_article()
        print(f"处理了 {self.langPath} 目录下 {len(zh_articles)} 篇文章")
        # 生成首页 HTML
        self.make_home()

        # # 生成关于页面
        # self.make_about()

        # 生成文章页面
        self.make_article()

        # 生成分页列表
        self.make_pager()


if __name__ == "__main__":
    blog_maker = BlogMaker('zh')
    blog_maker.main()

    blog_maker = BlogMaker('en')
    blog_maker.main()