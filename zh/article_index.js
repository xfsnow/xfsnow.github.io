const articlesData = [
    {
        id: 'claude-cheatsheet',
        title: 'Claude 提示语一览',
        description: '全面整理Claude AI的常用提示语和最佳实践，帮助你更好地与Claude交互。',
        url: 'doc/Claude_Cheatsheet.html',
        date: '2024-01-15',
        category: 'ai',
        tags: ['Claude', 'AI', '提示工程', 'Prompt']
    },
    {
        id: 'github-copilot-mcp',
        title: '在 GitHub Copilot 中使用 MCP',
        description: '详细介绍如何在GitHub Copilot中集成和使用Model Context Protocol (MCP)。',
        url: 'doc/GitHub_Copilot_MCP.html',
        date: '2024-01-12',
        category: 'copilot',
        tags: ['GitHub Copilot', 'MCP', '开发工具', 'AI编程']
    },
    {
        id: 'deepseek-prompts',
        title: 'DeepSeek 50个常用指令',
        description: 'DeepSeek AI模型的50个实用指令集合，涵盖各种应用场景。',
        url: 'doc/DeepSeek_Prompts.html',
        date: '2024-01-10',
        category: 'ai',
        tags: ['DeepSeek', 'AI指令', 'Prompt', '中文AI']
    },
    {
        id: 'ai-graph',
        title: '图解 AI 核心技术',
        description: '通过图表和图解的方式，深入浅出地解释人工智能的核心技术原理。',
        url: 'doc/ai_graph.html',
        date: '2024-01-08',
        category: 'ai',
        tags: ['AI技术', '机器学习', '深度学习', '图解']
    },
    {
        id: 'nanoai-watermark',
        title: '纳米AI去水印',
        description: '介绍纳米AI去水印技术的原理和应用，以及相关的伦理考量。',
        url: 'doc/NanoAI_watermark.html',
        date: '2024-01-05',
        category: 'ai',
        tags: ['AI技术', '图像处理', '水印去除', '纳米AI']
    },
    {
        id: 'gpt-azure-ai',
        title: 'Azure AI Foundry中GPT模型的选择',
        description: '详细分析Azure AI Foundry中各种GPT模型的特点和适用场景。',
        url: 'doc/GPT_in_Azure_AI.html',
        date: '2024-01-03',
        category: 'azure',
        tags: ['Azure', 'GPT', 'AI Foundry', '云计算']
    },
    {
        id: 'deepseek-azure',
        title: '全 Azure 部署 DeepSeek',
        description: '完整的DeepSeek模型在Azure云平台上的部署指南和最佳实践。',
        url: 'doc/DeepSeek_Azure.html',
        date: '2024-01-01',
        category: 'azure',
        tags: ['DeepSeek', 'Azure', '云部署', 'AI模型']
    },
    {
        id: 'easydiffusion-azure',
        title: '在 Azure 虚拟机上安装 EasyDiffusion',
        description: '在Azure NC4as虚拟机上安装和配置EasyDiffusion的详细步骤。',
        url: 'doc/EasyDiffusion_Azure_NC4as.html',
        date: '2023-12-28',
        category: 'azure',
        tags: ['Azure', 'EasyDiffusion', 'Stable Diffusion', 'GPU']
    },
    {
        id: 'copilot-vision',
        title: '使用 Vision 插件扩展 GitHub Copilot 识图问答',
        description: '详细介绍如何使用Vision插件让GitHub Copilot具备图像识别和分析能力。',
        url: 'doc/GitHub_Copilot_Vision.html',
        date: '2023-12-25',
        category: 'copilot',
        tags: ['GitHub Copilot', 'Vision', '图像识别', 'AI插件']
    },
    {
        id: 'copilot-websearch',
        title: '使用 Web Search 插件扩展 GitHub Copilot 问答',
        description: '学习如何使用Web Search插件增强GitHub Copilot的搜索和问答能力。',
        url: 'doc/GitHub_Copilot_WebSearch.html',
        date: '2023-12-22',
        category: 'copilot',
        tags: ['GitHub Copilot', 'Web Search', '搜索插件', 'AI扩展']
    }
];

// 工具数据
const toolsData = [
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
const langMap = {
    'lang': 'zh-CN',
    'langName': '中文',
    'read': '阅读',
    'article': '文章',
    'noResults': '没有找到相关文章',
    'tryOtherKeywords': '请尝试其他关键词或查看全部文章',
    'buttonText': '查看体验',
    'searchPlaceholder': '搜索文章标题、内容或标签...',
    'categories': {
        all: { name: '全部', color: '#64748b' },
        ai: { name: 'AI技术', color: '#8b5cf6' },
        azure: { name: 'Azure云', color: '#0078d4' },
        copilot: { name: 'GitHub Copilot', color: '#24292f' },
        tools: { name: '工具', color: '#059669' }
    }
};