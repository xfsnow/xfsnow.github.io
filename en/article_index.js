const articlesData = [
    {
        id: 'claude-cheatsheet',
        title: 'Claude Prompts Cheatsheet',
        description: 'Comprehensive collection of Claude AI common prompts and best practices to help you interact better with Claude.',
        url: '../doc/Claude_Cheatsheet.html',
        date: '2024-01-15',
        category: 'ai',
        tags: ['Claude', 'AI', 'Prompt Engineering', 'Prompt']
    },
    {
        id: 'github-copilot-mcp',
        title: 'Using MCP in GitHub Copilot',
        description: 'Detailed guide on how to integrate and use Model Context Protocol (MCP) in GitHub Copilot.',
        url: '../doc/GitHub_Copilot_MCP.html',
        date: '2024-01-12',
        category: 'copilot',
        tags: ['GitHub Copilot', 'MCP', 'Development Tools', 'AI Programming']
    },
    {
        id: 'deepseek-prompts',
        title: 'DeepSeek 50 Common Commands',
        description: 'Collection of 50 practical DeepSeek AI model commands covering various application scenarios.',
        url: '../doc/DeepSeek_Prompts.html',
        date: '2024-01-10',
        category: 'ai',
        tags: ['DeepSeek', 'AI Commands', 'Prompt', 'Chinese AI']
    },
    {
        id: 'ai-graph',
        title: 'AI Core Technologies Illustrated',
        description: 'In-depth explanation of artificial intelligence core technology principles through charts and illustrations.',
        url: '../doc/ai_graph.html',
        date: '2024-01-08',
        category: 'ai',
        tags: ['AI Technology', 'Machine Learning', 'Deep Learning', 'Illustration']
    },
    {
        id: 'nanoai-watermark',
        title: 'NanoAI Watermark Removal',
        description: 'Introduction to NanoAI watermark removal technology principles and applications, along with ethical considerations.',
        url: '../doc/NanoAI_watermark.html',
        date: '2024-01-05',
        category: 'ai',
        tags: ['AI Technology', 'Image Processing', 'Watermark Removal', 'NanoAI']
    },
    {
        id: 'gpt-azure-ai',
        title: 'GPT Model Selection in Azure AI Foundry',
        description: 'Detailed analysis of various GPT models characteristics and applicable scenarios in Azure AI Foundry.',
        url: '../doc/GPT_in_Azure_AI.html',
        date: '2024-01-03',
        category: 'azure',
        tags: ['Azure', 'GPT', 'AI Foundry', 'Cloud Computing']
    },
    {
        id: 'deepseek-azure',
        title: 'Full Azure DeepSeek Deployment',
        description: 'Complete deployment guide and best practices for DeepSeek model on Azure cloud platform.',
        url: '../doc/DeepSeek_Azure.html',
        date: '2024-01-01',
        category: 'azure',
        tags: ['DeepSeek', 'Azure', 'Cloud Deployment', 'AI Model']
    },
    {
        id: 'easydiffusion-azure',
        title: 'Installing EasyDiffusion on Azure VM',
        description: 'Detailed steps for installing and configuring EasyDiffusion on Azure NC4as virtual machine.',
        url: '../doc/EasyDiffusion_Azure_NC4as.html',
        date: '2023-12-28',
        category: 'azure',
        tags: ['Azure', 'EasyDiffusion', 'Stable Diffusion', 'GPU']
    },
    {
        id: 'copilot-vision',
        title: 'Extending GitHub Copilot with Vision Plugin for Image Q&A',
        description: 'Detailed guide on how to use Vision plugin to enable GitHub Copilot with image recognition and analysis capabilities.',
        url: '../doc/GitHub_Copilot_Vision.html',
        date: '2023-12-25',
        category: 'copilot',
        tags: ['GitHub Copilot', 'Vision', 'Image Recognition', 'AI Plugin']
    },
    {
        id: 'copilot-websearch',
        title: 'Extending GitHub Copilot Q&A with Web Search Plugin',
        description: 'Learn how to use Web Search plugin to enhance GitHub Copilot search and Q&A capabilities.',
        url: '../doc/GitHub_Copilot_WebSearch.html',
        date: '2023-12-22',
        category: 'copilot',
        tags: ['GitHub Copilot', 'Web Search', 'Search Plugin', 'AI Extension']
    }
];

// Tools data
const toolsData = [
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
];

// 英文语言配置
const langMap = {
    'lang': 'en',
    'langName': 'English',
    'read': 'read',
    'article': 'article',
    'noResults': 'No related articles found',
    'tryOtherKeywords': 'Please try other keywords or view all articles',
    'buttonText': 'Try Now',
    'searchPlaceholder': 'Search article titles, content or tags...',
    'categories': {
        all: { name: 'All', color: '#64748b' },
        ai: { name: 'AI Technology', color: '#8b5cf6' },
        azure: { name: 'Azure Cloud', color: '#0078d4' },
        copilot: { name: 'GitHub Copilot', color: '#24292f' },
        tools: { name: 'Tools', color: '#059669' }
    }
};