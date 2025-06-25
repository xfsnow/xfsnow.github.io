import os
from jinja2 import Environment, FileSystemLoader

class View:
    def __init__(self):
        """初始化视图渲染器"""
        # 设置模板目录
        self.env = Environment(loader=FileSystemLoader('assets/template'))

    def render_template(self, template_name, **kwargs):
        """渲染模板"""
        try:
            template = self.env.get_template(template_name)
            return template.render(**kwargs)
        except Exception as e:
            print(f"渲染模板 {template_name} 时出错: {e}")
            return None

    def write_html(self, file_path, content):
        """写入HTML文件"""
        try:
            # 确保目录存在
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已生成 HTML 文件: {file_path}")
        except Exception as e:
            print(f"写入文件 {file_path} 时出错: {e}")
