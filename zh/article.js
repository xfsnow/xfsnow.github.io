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