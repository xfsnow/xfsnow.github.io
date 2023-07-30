# 实时2D 虚拟助手

学习自 https://techcommunity.microsoft.com/t5/educator-developer-blog/build-a-virtual-assistant-with-azure-open-ai-and-azure-speech/ba-p/3735636

记录一些自己配置和优化的过程。


## Live2D Cubism Core for Web
在 VS Code 中按 Ctrl+` 打开 Terminal，在源码的根目录，输入以下命令安装依赖
```bash
git submodule update --init --recursive 
```
这会把 Framework 目录下的文件下载到 Framework 目录下，然后在根目录下创建一个 Core 目录。
从 https://www.live2d.com/download/cubism-sdk/download-web/ 下载 **Cubism Core for Web**，并把文件解压到 Core 目录。

再执行以下命令，会把这个 Node.js 项目构建以及运行起来。

```bash
cd Samples/TypeScript/Demo
npm install
npm audit fix
npm run build
npm run serve
```

生成的 dist/bundle.js 是未压缩的文件，还可以用在线工具 https://minify-js.com/ 压缩成 bundle.min.js 文件。
然后把 index.html 里引用的文件也改成 bundle.min.js 即可。

本地测试版运行在 http://localhost:5000/Samples/TypeScript/Demo/。

测试成功后，最后可以把纯静态文件发布到自己的 GitHub 静态文件站点，或者使用云平台上的静态文件站点。