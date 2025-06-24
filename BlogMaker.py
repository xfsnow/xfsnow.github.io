import markdown
import os
import re
import json
from datetime import datetime

class BlogMaker:

    def markdown_to_html(self, markdown_text):
        return markdown.markdown(markdown_text)

    def index_article(self, path: str = 'zh'):
        """遍历指定目录下的所有 Markdown 文件，提取文章信息并生成索引"""
        articles = []

        # 确保路径存在
        if not os.path.exists(path):
            print(f"路径 {path} 不存在")
            return articles

        # 遍历目录下的所有文件
        for filename in os.listdir(path):
            if filename.endswith('.md'):
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
            article_info = {
                'filename': filename,
                'title': '',
                'description': '',
                'time_publish': '',
                'category': ''
            }

            # 提取标题 (第一行的 # 标题)
            for line in lines:
                if line.strip().startswith('# '):
                    article_info['title'] = line.strip()[2:].strip()
                    break

            # 提取发布时间（完整的年月日时分秒）
            time_pattern = r'发布时间:\s*\*?([0-9]{4}-[0-9]{2}-[0-9]{2}(?:\s+[0-9]{2}:[0-9]{2}:[0-9]{2})?)'
            time_match = re.search(time_pattern, content)
            if time_match:
                time_str = time_match.group(1)
                # 如果只有日期没有时间，添加默认时间
                if len(time_str) == 10:  # 只有日期
                    time_str += ' 00:00:00'
                article_info['time_publish'] = time_str

            # 提取分类 - 更新正则表达式以匹配双下划线格式
            category_pattern = r'分类:\s*__([^_\n]+)__'
            category_match = re.search(category_pattern, content)
            if category_match:
                category = category_match.group(1).strip()
                article_info['category'] = self.map_category(category)
            else:
                # 如果没有找到分类，尝试从文件名或内容推断
                article_info['category'] = self.infer_category_from_content(content, filename)

            # 提取简介
            intro_pattern = r'简介:\s*([^\n]+(?:\n[^\n-]+)*)'
            intro_match = re.search(intro_pattern, content)
            if intro_match:
                description = intro_match.group(1).strip()
                # 限制简介长度
                if len(description) > 200:
                    description = description[:200] + '...'
                article_info['description'] = description

            # 如果没有找到简介，从正文提取前几行
            if not article_info['description']:
                article_info['description'] = self.extract_description_from_content(content)

            return article_info

        except Exception as e:
            print(f"处理文件 {filepath} 时出错: {e}")
            return None

    def map_category(self, category: str):
        """将中文分类映射为英文分类标识"""
        category_map = {
            'AI技术': 'AI',
            'Azure云': 'Azure',
            'GitHub Copilot': 'GitHub',
            '综合开发': 'Development',
            '工具': 'Tools',
            '开发工具': 'Tools',
            '云计算': 'Cloud Computing',
            '人工智能': 'AI',
            '服务器端技术': 'Backend',
            '数据库': 'Database',
            '前端技术': 'Frontend',
            'Web开发': 'Web',
            '系统管理': 'System',
            '网络技术': 'Network',
            '移动开发': 'Mobile',
            '软件工程': 'Software',
            '编程语言': 'Programming',
            '框架技术': 'Framework'
        }
        return category_map.get(category, 'Tools')

    def infer_category_from_content(self, content: str, filename: str):
        """从内容或文件名推断分类"""
        content_lower = content.lower()
        filename_lower = filename.lower()

        # AI相关关键词
        ai_keywords = ['ai', 'gpt', 'copilot', 'openai', 'claude', 'deepseek', 'vision', '人工智能', '机器学习', '深度学习']
        if any(keyword in content_lower or keyword in filename_lower for keyword in ai_keywords):
            return 'ai'

        # Azure相关关键词
        azure_keywords = ['azure', 'cloud', '云计算', '云服务', 'vm', 'virtual machine']
        if any(keyword in content_lower or keyword in filename_lower for keyword in azure_keywords):
            return 'azure'

        # GitHub Copilot相关关键词
        copilot_keywords = ['copilot', 'github copilot', 'mcp', 'vision plugin']
        if any(keyword in content_lower or keyword in filename_lower for keyword in copilot_keywords):
            return 'copilot'

        # 默认分类
        return 'tools'

    def extract_description_from_content(self, content: str):
        """从文章内容中提取描述"""
        lines = content.split('\n')
        description_lines = []

        # 跳过前面的元数据，找到正文
        in_content = False
        for line in lines:
            line = line.strip()
            if line.startswith('---') and in_content:
                break
            if line.startswith('---') or line.startswith('#') or line.startswith('发布时间') or line.startswith('简介'):
                in_content = True
                continue
            if in_content and line and not line.startswith('#') and not line.startswith('发布时间'):
                description_lines.append(line)
                if len(' '.join(description_lines)) > 200:
                    break

        description = ' '.join(description_lines)
        if len(description) > 200:
            description = description[:200] + '...'

        return description if description else '暂无描述'

    def generate_article_js(self, articles: list, path: str):
        """生成 JavaScript 文件"""
        # 生成文章数据
        js_content = "const articles = [\n"

        for article in articles:
            js_content += "    {\n"
            js_content += f"        url: '{article['filename'].replace('.md', '.htm')}',\n"
            js_content += f"        title: '{article['title'].replace('\"', '\\\"')}',\n"
            js_content += f"        description: '{article['description'].replace('\"', '\\\"')}',\n"
            js_content += f"        time_publish: '{article['time_publish']}',\n"
            js_content += f"        category: '{article['category']}'\n"
            js_content += "    },\n"

        js_content += "];\n\n"

        # 添加工具数据和语言配置
        if path == 'zh':
            js_content += self.get_zh_tools_and_lang()
        else:
            js_content += self.get_en_tools_and_lang()

        # 保存到文件
        output_file = os.path.join(path, 'index.js')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(js_content)

        print(f"已生成 {len(articles)} 篇文章的索引文件: {output_file}")

    def get_zh_tools_and_lang(self):
        """获取中文版工具和语言配置"""
        return '''
// 工具数据
const tools = [
    {
        id: 'image-process',
        title: '响应式图片处理',
        description: '在线图片压缩和格式转换工具',
        url: 'imageprocess/',
        icon: 'fas fa-images',
        category: 'tools'
    },
    {
        id: 'ai-assistant',
        title: 'AI 虚拟助手',
        description: '智能对话和问答助手',
        url: 'va/',
        icon: 'fas fa-robot',
        category: 'tools'
    },
    {
        id: 'azure-icons',
        title: 'Azure图标汇总',
        description: '完整的Azure服务图标集合',
        url: 'AzureIcon/',
        icon: 'fas fa-cloud',
        category: 'tools'
    },
    {
        id: 'english-test',
        title: '英语能力测试',
        description: '初中英语水平在线测试系统',
        url: 'english_middle/',
        icon: 'fas fa-graduation-cap',
        category: 'tools'
    },
    {
        id: 'school-regions',
        title: '北京学校划片数据',
        description: '北京地区学校划片信息查询',
        url: 'schools.htm',
        icon: 'fas fa-map',
        category: 'tools'
    },
    {
        id: 'maths',
        title: '数学计算演练',
        description: '在线数学计算题库，支持多种题型',
        url: 'maths.htm',
        icon: 'fas fa-calculator',
        category: 'tools'
    }
];

// 中文语言配置
const lang = {
    'lang': 'zh-CN',
    'langName': '中文',
    'read': '阅读',
    'article': '文章',
    'noResults': '没有找到相关文章',
    'tryOtherKeywords': '请尝试其他关键词或查看全部文章',
    'ReadTry': '查看体验',
    'searchPlaceholder': '搜索文章标题、内容或标签...',
    'categories': {
        all: { name: '全部', color: '#64748b' },
        ai: { name: 'AI技术', color: '#8b5cf6' },
        azure: { name: 'Azure云', color: '#0078d4' },
        copilot: { name: 'GitHub Copilot', color: '#24292f' },
        tools: { name: '工具', color: '#059669' }
    }
};
'''

    def get_en_tools_and_lang(self):
        """获取英文版工具和语言配置"""
        return '''
// Tools data
const tools = [
    {
        id: 'image-process',
        title: 'Responsive Image Processing',
        description: 'Online image compression and format conversion tool',
        url: '../imageprocess/',
        icon: 'fas fa-images',
        category: 'tools'
    },
    {
        id: 'ai-assistant',
        title: 'AI Virtual Assistant',
        description: 'Intelligent dialogue and Q&A assistant',
        url: '../va/',
        icon: 'fas fa-robot',
        category: 'tools'
    },
    {
        id: 'azure-icons',
        title: 'Azure Icons Collection',
        description: 'Complete collection of Azure service icons',
        url: '../AzureIcon/',
        icon: 'fas fa-cloud',
        category: 'tools'
    },
    {
        id: 'english-test',
        title: 'English Proficiency Test',
        description: 'Online middle school English level testing system',
        url: '../english_middle/',
        icon: 'fas fa-graduation-cap',
        category: 'tools'
    },
    {
        id: 'school-regions',
        title: 'Beijing School District Data',
        description: 'Beijing area school district information query',
        url: '../schools.htm',
        icon: 'fas fa-map',
        category: 'tools'
    },
    {
        id: 'maths',
        title: 'Math Calculation Practice',
        description: 'Online math problem bank supporting multiple question types',
        url: '../maths.htm',
        icon: 'fas fa-calculator',
        category: 'tools'
    }
};

// 英文语言配置
const lang = {
    'lang': 'en',
    'langName': 'English',
    'read': 'read',
    'article': 'article',
    'noResults': 'No related articles found',
    'tryOtherKeywords': 'Please try other keywords or view all articles',
    'ReadTry': 'Read & try',
    'searchPlaceholder': 'Search article titles, content or tags...',
    'categories': {
        all: { name: 'All', color: '#64748b' },
        ai: { name: 'AI Technology', color: '#8b5cf6' },
        azure: { name: 'Azure Cloud', color: '#0078d4' },
        copilot: { name: 'GitHub Copilot', color: '#24292f' },
        tools: { name: 'Tools', color: '#059669' }
    }
};
'''

    def main(self):
        # 处理中文文章
        zh_articles = self.index_article('zh')
        print(f"处理了 {len(zh_articles)} 篇中文文章")

        # 处理英文文章 (如果有的话)
        if os.path.exists('en'):
            en_articles = self.index_article('en')
            print(f"处理了 {len(en_articles)} 篇英文文章")

if __name__ == "__main__":
    blog_maker = BlogMaker()
    blog_maker.main()
