import os
import re
from jinja2 import Environment, FileSystemLoader

class View:
    def __init__(self, langPath: str = 'zh'):
        """初始化视图渲染器"""
        # 设置模板目录
        template_dir = os.path.join('assets', 'template', langPath)
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            trim_blocks=True,
            lstrip_blocks=True
        )

    def render_template(self, template_name, **kwargs):
        """渲染模板"""
        try:
            template = self.env.get_template(template_name)
            return template.render(**kwargs)
        except Exception as e:
            print(f"渲染模板 {template_name} 时出错: {e}")
            return None

    # 写入 HTML 文件
    # 参数 file_path 是文件路径，content 是要写入的内容
    # 参数 strip 用于是否清理所有注释和空白字条，默认为 False
    def write_html(self, file_path, content, strip=False):
        """写入HTML文件"""
        # 确保目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        if strip:
            # 写出的是 HTML 文件，清理一下，主要是 <!--.*--> 注释全部删掉，有多个 空格或 tab 符的都统一换成一个空格
            content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)  # 删除 HTML 注释
            content = re.sub(r'\s+', ' ', content)  # 替换多个空格或 tab 符为一个空格
            content = re.sub(r'>\s+<', '><', content)  # 删除标签间的空格
            content = content.strip()  # 去除首尾空格
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"已生成 HTML 文件: {file_path}")
