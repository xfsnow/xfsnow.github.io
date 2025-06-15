import requests
import json
import time
import re
import os
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import html2text
from pathlib import Path

class CSDNBlogScraper:
    def __init__(self, username='snowpeak'):
        self.username = username
        self.base_api_url = "https://blog.csdn.net/community/home-api/v1/get-business-list"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': f'https://{username}.blog.csdn.net/',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cookie': r'uuid_tt_dd=10_19716680490-1742088980902-575738; fid=20_00926746272-1742088982574-981471; UserName=xfsnow; UserInfo=227d3c9769694c6891657f32c414902b; UserToken=227d3c9769694c6891657f32c414902b; UserNick=%E9%9B%AA%E5%B3%B0; AU=8E1; UN=xfsnow; BT=1742089005601; p_uid=U010000; tfstk=g1rtd6bWF6fi9WiljG_HmtbwqiXh-oew95yWmjcMlWFL3SKMjmmilxGLghq0n-avD8lejRqgnXhYiWic3N5NMdrLwnxG_NyXDmmfZ_jlqRzZ0m1urdViPfk4dj6n57dAHgifZ_jHwpsmlmNMz5GXpJGEHxMscSgBdXk2lmGslBTIFXGjcSgsdDM-BEMsCnsCpxlIGmibGJGKvOhFfY-YPECv8Pgn9ntbvA1qNRhKLvrKBVhSRXKXBkHtWbw_j4DLgvZ3v40Hn_iQUyVsp0I9aAUQecMY0TTxMqEZvvzFMEh8lR4zl2B1fJnt6qkIWLLIXrNaDVz93TyIfWzraV_FTvEgqqhrJB1_KJhsyrFGTnGgyJNKrkAHq0az9o3SVg57quIWSQc-nF6dpE8q5v-FdPmcHQqRavhlCVT2u4EEpbXCcE8qSlDKZ90puEuKZ; FCNEC=%5B%5B%22AKsRol9DB3yCdfFQyDnwdscIpXOveEWco3lRE6N0-0ttPbW2T3KeHs1_TTIwbQ3rnKzyZNxI2dG6FVy1Ww2jIop6fqFpXWJBMwwbWGe8V1uRukvB2eOgVTDraYmCPvJxAkDfKIvCJjj41IueCbLzsfcHpIdxqJ8kpQ%3D%3D%22%5D%5D; c_dl_um=-; csdn_newcert_xfsnow=1; __gads=ID=eeb53108a6ca8359:T=1742300652:RT=1749904535:S=ALNI_MaWhi7ave7Wkdw6HeZzgWcmFdzieg; __gpi=UID=00001066775c4ba8:T=1742300652:RT=1749904535:S=ALNI_MbJR-B38zXYqEDcxq86fl0_DiPSAw; __eoi=ID=8781a6c93e3590b3:T=1742300652:RT=1749904535:S=AA-AfjYeeJZJ7u9sAy_EE1yORAFl; dc_session_id=10_1749973346118.846695; c_segment=10; Hm_lvt_6bcd52f51e9b3dce32bec4a3997715ac=1749522325,1749643150,1749883501,1749973349; HMACCOUNT=85000109A43C15A7; bc_bot_session=17499733478f511cfb4b6935a8; dc_sid=c0fb2467283a79ad7c966f0f63e2eeb3; creative_btn_mp=3; _clck=mgo4b0%7C2%7Cfws%7C0%7C1901; bc_bot_token=10017499733478f511cfb4b6935a89b024f; bc_bot_rules=-; bc_bot_fp=3f103070fe46b5e3877e237f1f3e60f3; c_pref=default; c_first_ref=default; is_advert=1; _clsk=vi6laj%7C1749974985683%7C3%7C0%7Cj.clarity.ms%2Fcollect; c_dl_prid=1747143665416_290677; c_dl_rid=1749975655330_439298; c_dl_fref=https://snowpeak.blog.csdn.net/; c_dl_fpage=/download/xfsnow/1349589; c_ref=default; c_page_id=default; log_Id_click=18; c_first_page=https%3A//www.csdn.net/; c_dsid=11_1749976509240.903238; log_Id_pv=15; c-sidebar-collapse=0; c_ab_test=1; creativeSetApiNew=%7B%22toolbarImg%22%3A%22https%3A//i-operation.csdnimg.cn/images/cd1b1c49ffd24f5f99e0336910392b70.png%22%2C%22publishSuccessImg%22%3A%22https%3A//img-home.csdnimg.cn/images/20240229024608.png%22%2C%22articleNum%22%3A69%2C%22type%22%3A2%2C%22oldUser%22%3Atrue%2C%22useSeven%22%3Afalse%2C%22oldFullVersion%22%3Atrue%2C%22userName%22%3A%22xfsnow%22%7D; Hm_lpvt_6bcd52f51e9b3dce32bec4a3997715ac=1749976511; dc_tos=sxw2jq; dc_tos=sxw2kz; log_Id_view=407'
        })
        # 配置HTML到Markdown转换器
        self.html_converter = html2text.HTML2Text()
        self.html_converter.ignore_links = False
        self.html_converter.ignore_images = False
        self.html_converter.body_width = 0  # 不限制行宽
        self.html_converter.protect_links = True
        self.html_converter.wrap_links = False

        # 关键词翻译映射表
        self.keyword_translations = {
            # 技术相关
            '使用': 'Using',
            '插件': 'Plugin',
            '识图': 'Image_Recognition',
            '问答': 'QA',
            '流水线': 'Pipeline',
            '合并': 'Merge',
            '源码库': 'Repository',
            '源码': 'Source_Code',
            '部署': 'Deployment',
            '配置': 'Configuration',
            '开发': 'Development',
            '测试': 'Testing',
            '自动化': 'Automation',
            '容器': 'Container',
            '微服务': 'Microservice',
            '数据库': 'Database',
            '前端': 'Frontend',
            '后端': 'Backend',
            '接口': 'API',
            '服务': 'Service',
            '架构': 'Architecture',
            '设计': 'Design',
            '实现': 'Implementation',
            '优化': 'Optimization',
            '监控': 'Monitoring',
            '日志': 'Log',
            '安全': 'Security',
            '权限': 'Permission',
            '认证': 'Authentication',
            '授权': 'Authorization',
            '网络': 'Network',
            '存储': 'Storage',
            '缓存': 'Cache',
            '队列': 'Queue',
            '消息': 'Message',
            '事件': 'Event',
            '异步': 'Async',
            '同步': 'Sync',
            '并发': 'Concurrent',
            '性能': 'Performance',
            '扩展': 'Extension',
            '升级': 'Upgrade',
            '迁移': 'Migration',
            '备份': 'Backup',
            '恢复': 'Recovery',
            '故障': 'Fault',
            '排查': 'Troubleshoot',
            '调试': 'Debug',
            '版本': 'Version',
            '发布': 'Release',
            '上线': 'Online',
            '下线': 'Offline',
            '腾讯': 'Tencent',
            '域名': 'Domain',
            '服务器': 'Server',
            '一': '1',
            '二': '2',
            '三': '3',
            '四': '4',
            '五': '5',
            '六': '6',
            '七': '7',
            '八': '8',
            '九': '9',
            '十': '10',
            '（一）': '_1',
            '（二）': '_2',
            '（三）': '_3',
            '（四）': '_4',
            '（五）': '_5',
            '（六）': '_6',
            '（七）': '_7',
            '（八）': '_8',
            '（九）': '_9',
            '（十）': '_10',
            '(一)': '_1',
            '(二)': '_2',
            '(三)': '_3',
            '(四)': '_4',
            '(五)': '_5',
            '(六)': '_6',
            '(七)': '_7',
            '(八)': '_8',
            '(九)': '_9',
            '(十)': '_10',
        }

        # 确保目录存在
        self.ensure_directories()

    def ensure_directories(self):
        """确保所需目录存在"""
        directories = ['zh', 'assets', 'assets/img']
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)

    def get_articles_from_api(self, page=1, size=80):
        """从 CSDN API 获取文章列表"""
        try:
            params = {
                'page': page,
                'size': size,
                'businessType': 'blog',
                'orderby': '',
                'noMore': False,
                'year': '',
                'month': '',
                'username': self.username
            }

            print(f"正在请求第 {page} 页，每页 {size} 篇文章...")
            response = self.session.get(self.base_api_url, params=params)
            response.raise_for_status()

            data = response.json()

            if data.get('code') != 200:
                print(f"API 返回错误: {data.get('message', '未知错误')}")
                return []

            articles_data = data.get('data', {}).get('list', [])
            articles = []

            for item in articles_data:
                article = {
                    'title': item.get('title', ''),
                    'description': item.get('description', ''),
                    'url': item.get('url', ''),
                    'postTime': item.get('postTime', ''),
                    'picList': item.get('picList', [])
                }
                articles.append(article)

            print(f"第 {page} 页获取到 {len(articles)} 篇文章")
            return articles

        except Exception as e:
            print(f"获取第 {page} 页文章失败: {e}")
            return []

    def get_all_articles(self, max_pages=None):
        """获取所有文章"""
        all_articles = []
        page = 1

        print(f"开始获取用户 {self.username} 的所有文章...")

        while True:
            articles = self.get_articles_from_api(page)

            if not articles:
                print(f"第 {page} 页没有文章，结束获取")
                break

            all_articles.extend(articles)

            # 如果设置了最大页数限制
            if max_pages and page >= max_pages:
                print(f"已达到最大页数限制 {max_pages}")
                break

            # 如果返回的文章数少于请求数，说明已到最后一页
            if len(articles) < 80:
                print("已获取所有文章")
                break

            page += 1
            time.sleep(1)  # 避免请求过快

        print(f"总共获取到 {len(all_articles)} 篇文章")
        return all_articles

    def save_articles_to_json(self, articles, filename="csdn_articles.json"):
        """保存文章到 JSON 文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(articles, f, ensure_ascii=False, indent=2)
            print(f"文章数据已保存到: {filename}")
            return True
        except Exception as e:
            print(f"保存 JSON 文件失败: {e}")
            return False

    def save_articles_to_txt(self, articles, filename="csdn_articles_list.txt"):
        """保存文章列表到文本文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"CSDN 博客文章列表 - 用户: {self.username}\n")
                f.write("=" * 80 + "\n")
                f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"文章总数: {len(articles)}\n")
                f.write("=" * 80 + "\n\n")

                for i, article in enumerate(articles, 1):
                    f.write(f"{i}. {article['title']}\n")
                    f.write(f"   发布时间: {article['postTime']}\n")
                    f.write(f"   URL: {article['url']}\n")

                    if article['description']:
                        description = article['description']
                        if len(description) > 200:
                            description = description[:200] + "..."
                        f.write(f"   描述: {description}\n")

                    if article['picList']:
                        f.write(f"   图片数量: {len(article['picList'])}\n")
                        for j, pic in enumerate(article['picList'][:3], 1):  # 只显示前3张图片
                            f.write(f"     图片{j}: {pic}\n")
                        if len(article['picList']) > 3:
                            f.write(f"     ... 还有 {len(article['picList']) - 3} 张图片\n")

                    f.write("\n" + "-" * 80 + "\n\n")

            print(f"文章列表已保存到: {filename}")
            return True
        except Exception as e:
            print(f"保存文本文件失败: {e}")
            return False

    def display_summary(self, articles):
        """显示文章摘要信息"""
        if not articles:
            print("没有文章数据")
            return

        print(f"\n文章摘要信息:")
        print(f"用户: {self.username}")
        print(f"文章总数: {len(articles)}")

        # 按年份统计
        year_count = {}
        for article in articles:
            post_time = article.get('postTime', '')
            if post_time:
                year = post_time[:4]
                year_count[year] = year_count.get(year, 0) + 1

        if year_count:
            print("\n按年份统计:")
            for year in sorted(year_count.keys(), reverse=True):
                print(f"  {year}年: {year_count[year]} 篇")

        # 显示最新的5篇文章
        print(f"\n最新的5篇文章:")
        for i, article in enumerate(articles[:5], 1):
            print(f"  {i}. {article['title']}")
            print(f"     时间: {article['postTime']}")
            if article['description']:
                desc = article['description'][:100] + "..." if len(article['description']) > 100 else article['description']
                print(f"     描述: {desc}")
            print()

    def scrape_articles_from_json(self, json_file='xfsnow_articles.json'):
        """从JSON文件中读取文章列表并逐个抓取"""
        with open(json_file, 'r', encoding='utf-8') as f:
            articles = json.load(f)

        print(f"开始处理 {len(articles)} 篇文章...")

        for i, article in enumerate(articles, 1):
            # 前4 个文章可以处理路过，从第 5 个开始处理
            # # if i <= 4:
            #     print(f"[{i}/{len(articles)}] 跳过处理: {article.get('title', 'Unknown')}")
            #     continue
            print(f"[{i}/{len(articles)}] 正在处理: {article.get('title', 'Unknown')} 来自: {article.get('url', 'Unknown URL')}")
            self.scrape_article_detail(article)
            break
            # 添加延迟避免请求过快
            time.sleep(1)
            continue

        print("所有文章处理完成!")


    def scrape_article_detail(self, article):
        """抓取单篇文章详情"""
        url = article.get('url')
        if not url:
            print("文章缺少URL")
            return

        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        # 把 response.text 写出到文件，调试是否能正常获取到文章内容
        # 发现如果是未登录状态，返回的文章只有前面一小部分！
        with open('debug_article_content.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(response.text)
        exit()
        soup = BeautifulSoup(response.text, 'html.parser')

        # 查找文章内容区域
        article_content = soup.find('article', {'class': 'baidu_pl'})
        print(article_content)
        exit()
        if not article_content:
            print(f"未找到文章内容区域: {article.get('title', 'Unknown')}")
            return

        # 处理图片下载
        self.process_images(article_content, article)

        # 转换为Markdown
        markdown_content = self.convert_to_markdown(article_content, article)

        # 保存Markdown文件
        self.save_markdown_file(markdown_content, article)


    def process_images(self, content_element, article):
        """处理文章中的图片，下载并更新路径"""
        images = content_element.find_all('img')

        for i, img in enumerate(images, 1):
            src = img.get('src')
            if not src:
                continue

            try:
                # 构建完整的图片URL
                if src.startswith('//'):
                    img_url = 'https:' + src
                elif src.startswith('/'):
                    img_url = urljoin(article.get('url'), src)
                elif not src.startswith('http'):
                    img_url = urljoin(article.get('url'), src)
                else:
                    img_url = src

                # 下载图片
                local_path = self.download_image(img_url, article, i)
                if local_path:
                    # 更新图片src为本地路径
                    relative_path = f"../assets/img/{os.path.basename(local_path)}"
                    img['src'] = relative_path
                    print(f"图片已下载: {os.path.basename(local_path)}")

            except Exception as e:
                print(f"处理图片失败 {src}: {str(e)}")

    def download_image(self, img_url, article, index):
        """下载图片到本地"""
        try:
            response = self.session.get(img_url, timeout=30)
            response.raise_for_status()

            # 获取文件扩展名
            parsed_url = urlparse(img_url)
            ext = os.path.splitext(parsed_url.path)[1].lower()
            if not ext or ext not in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
                ext = '.png'  # 默认扩展名

            # 生成文件名
            publish_date = self.format_date(article.get('postTime', ''))
            title_keywords = self.extract_keywords(article.get('title', ''))
            filename = f"{publish_date}_{title_keywords}_{str(index).zfill(2)}{ext}"

            # 保存路径
            save_path = os.path.join('assets', 'img', filename)

            with open(save_path, 'wb') as f:
                f.write(response.content)

            return save_path

        except Exception as e:
            print(f"下载图片失败 {img_url}: {str(e)}")
            return None

    def convert_to_markdown(self, content_element, article):
        """将HTML内容转换为Markdown格式"""
        # 处理代码块
        self.process_code_blocks(content_element)

        # 获取HTML内容
        html_content = str(content_element)

        # 转换为Markdown
        markdown = self.html_converter.handle(html_content)

        # 清理和格式化Markdown
        markdown = self.clean_markdown(markdown)

        # 添加文章头部信息
        front_matter = self.generate_front_matter(article)

        return front_matter + markdown

    def process_code_blocks(self, content_element):
        """处理代码块，确保使用```包围"""
        # 直接修改HTML内容，而不是创建新标签

        # 处理<pre>标签
        pre_tags = content_element.find_all('pre')
        for pre in pre_tags:
            code_content = pre.get_text()
            # 直接替换内容
            pre.clear()
            pre.append(f"```\n{code_content}\n```")

        # 处理<code>标签（行内代码）
        code_tags = content_element.find_all('code')
        for code in code_tags:
            if code.parent and code.parent.name != 'pre':  # 不是代码块中的代码
                code_content = code.get_text()
                if '\n' in code_content:  # 多行代码，转换为代码块
                    # 用pre标签包装
                    code.name = 'pre'
                    code.clear()
                    code.append(f"```\n{code_content}\n```")

    def clean_markdown(self, markdown):
        """清理和格式化Markdown内容"""
        # 移除多余的空行
        markdown = re.sub(r'\n{3,}', '\n\n', markdown)

        # 确保代码块格式正确
        markdown = re.sub(r'```\n```', '```\n\n```', markdown)

        # 移除HTML注释
        markdown = re.sub(r'<!--.*?-->', '', markdown, flags=re.DOTALL)

        return markdown.strip()

    def generate_front_matter(self, article):
        """生成Markdown文件头部信息"""
        title = article.get('title', 'Untitled').replace('"', '\\"')
        publish_time = article.get('postTime', '')
        original_url = article.get('url', '')

        front_matter = f"""# {title}
发布时间: *{publish_time}
原文链接: [{original_url}]({original_url})
---

"""
        return front_matter

    def save_markdown_file(self, content, article):
        """保存Markdown文件"""
        filename = self.generate_filename(article)
        filepath = os.path.join('zh', filename)

        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已保存: {filename}")
        except Exception as e:
            print(f"保存文件失败 {filename}: {str(e)}")

    def generate_filename(self, article):
        """生成文件名"""
        publish_date = self.format_date(article.get('postTime', ''))
        title_keywords = self.extract_keywords(article.get('title', ''))
        return f"{publish_date}_{title_keywords}.md"

    def format_date(self, date_string):
        """格式化日期为YYYYMMDD"""
        if not date_string:
            return datetime.now().strftime('%Y%m%d')

        try:
            # 尝试解析不同的日期格式
            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%Y/%m/%d']:
                try:
                    date_obj = datetime.strptime(date_string, fmt)
                    return date_obj.strftime('%Y%m%d')
                except ValueError:
                    continue

            # 如果都解析失败，返回当前日期
            return datetime.now().strftime('%Y%m%d')
        except Exception:
            return datetime.now().strftime('%Y%m%d')

    def extract_keywords(self, title):
        """从标题提取关键词并翻译成英文 - 简化版本"""
        if not title:
            return 'article'

        # 第一步：提取标题中的英文单词
        english_words = re.findall(r'[a-zA-Z]+', title)

        if english_words:
            # 如果有英文单词，取前3个用下划线连接
            keywords = english_words[:3]
            return '_'.join(keywords)

        # 第二步：如果没有英文，使用技术词汇对照表
        # 简化的技术词汇对照表
        tech_translations = {
            '使用': 'Using',
            '插件': 'Plugin',
            '识图': 'Vision',
            '问答': 'QA',
            '流水线': 'Pipeline',
            '合并': 'Merge',
            '源码库': 'Repository',
            '源码': 'Source',
            '部署': 'Deploy',
            '配置': 'Config',
            '开发': 'Dev',
            '测试': 'Test',
            '自动化': 'Auto',
            '容器': 'Container',
            '微服务': 'Microservice',
            '数据库': 'Database',
            '前端': 'Frontend',
            '后端': 'Backend',
            '接口': 'API',
            '服务': 'Service',
            '架构': 'Architecture',
            '设计': 'Design',
            '实现': 'Implementation',
            '优化': 'Optimization',
            '监控': 'Monitor',
            '日志': 'Log',
            '安全': 'Security',
            '网络': 'Network',
            '存储': 'Storage',
            '缓存': 'Cache',
            '消息': 'Message',
            '性能': 'Performance',
            '版本': 'Version',
            '发布': 'Release',
            '（一）': '1',
            '（二）': '2',
            '（三）': '3',
            '（四）': '4',
            '（五）': '5',
            '(一)': '1',
            '(二)': '2',
            '(三)': '3',
            '(四)': '4',
            '(五)': '5'
        }

        # 查找匹配的技术词汇
        found_keywords = []
        for chinese_word, english_word in tech_translations.items():
            if chinese_word in title and len(found_keywords) < 3:
                found_keywords.append(english_word)

        if found_keywords:
            return '_'.join(found_keywords)

        # 如果都没找到，返回默认值
        return 'article'

def main():
    """主函数"""
    username = "snowpeak"
    scraper = CSDNBlogScraper(username)

    # # 获取所有文章
    # articles = scraper.get_all_articles()

    # if articles:
    #     # 保存到不同格式的文件
    #     scraper.save_articles_to_json(articles, f"{username}_articles.json")
    #     scraper.save_articles_to_txt(articles, f"{username}_articles_list.txt")

    #     # 显示摘要信息
    #     scraper.display_summary(articles)

    #     print(f"\n完成！共获取 {len(articles)} 篇文章")
    # else:
    #     print("未获取到任何文章")

    # 从JSON文件抓取文章
    scraper.scrape_articles_from_json()
    # TODO 折腾半天才发现 CSDN 限制登录状态，用 Python 不好模拟，现在只能是未登录状态抓取到的文章只有前面一部分。先不抓取了，因为有不少文章和自己博客上重复的，先整理自己的博客吧，没有在自己博客发布过的文章再手工补上。
	# 而且从标题提取文件名也不好，还是手工提取和命名吧。

if __name__ == "__main__":
    main()