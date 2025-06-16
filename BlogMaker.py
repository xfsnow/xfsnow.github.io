import markdown


class BlogMaker:

    def markdown_to_html(self, markdown_text):
        return markdown.markdown(markdown_text)

    def index_article(self):
        # Implementation for creating a blog post
        pass

    def main(self):
        self.markdown_text = """# My First Blog Post
This is a simple blog post written in Markdown.
## Subheading
Here is some code:
```python
def hello_world():
    print("Hello, world!")
```
And here is a link to [Google](https://www.google.com).
"""
        self.html_content = self.markdown_to_html(self.markdown_text)
        self.index_article()

if __name__ == "__main__":
    blog_maker = BlogMaker()
    blog_maker.main()
