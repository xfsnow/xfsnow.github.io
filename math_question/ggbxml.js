// 全局变量
let currentQuestion = null;
let currentXML = '';
let ggbApi = null;
let isGGBInitialized = false;
let questionsData = [];
let questionsXMLData = [];

// 分类颜色映射
const categoryColors = {
    '三角形': '#2196F3',
    '四边形': '#4CAF50',
    '圆': '#FF9800',
    '综合': '#9C27B0',
    '其他': '#9E9E9E'
};

// 根据内容自动分类
function classifyQuestion(content) {
    const keywords = {
        '三角形': ['三角形', '△', '等边', '等腰', '直角', '锐角', '钝角'],
        '四边形': ['四边形', '平行四边形', '矩形', '正方形', '菱形', '梯形'],
        '圆': ['圆', '圆心', '半径', '直径', '弧', '切线', '圆周角'],
        '综合': ['全等', '相似', '对称', '垂直平分线', '角平分线']
    };
    
    for (const [category, kwList] of Object.entries(keywords)) {
        for (const kw of kwList) {
            if (content.includes(kw)) {
                return category;
            }
        }
    }
    return '其他';
}

// 筛选题目
function filterQuestions(category) {
    const items = document.querySelectorAll('.question-item');
    items.forEach(item => {
        if (category === '全部' || item.dataset.category === category) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 显示题目列表
function displayQuestions(questions) {
    const list = document.getElementById('questionList');
    document.getElementById('statTotal').textContent = questions.length;
    
    if (!questions.length) {
        list.innerHTML = '<li style="padding: 8px; color: #999;">暂无题目</li>';
        return;
    }
    
    list.innerHTML = questions.map(q => {
        const category = q.category || classifyQuestion(q.content);
        const catColor = categoryColors[category] || categoryColors['其他'];
        return `
        <li class="question-item" data-id="${q.id}" data-title="${q.title}" data-category="${category}">
            <div class="id">${q.id}</div>
            <div class="title">${q.title}</div>
            <div class="cat-badge" style="background: ${catColor}">${category}</div>
        </li>
        `;
    }).join('');
    
    list.querySelectorAll('.question-item').forEach(item => {
        item.addEventListener('click', () => selectQuestion(item.dataset.id, item.dataset.title));
    });
}

// 选择题目
async function selectQuestion(id, title) {
    currentQuestion = id;
    currentXML = '';
    
    document.querySelector('.question-item.active')?.classList.remove('active');
    document.querySelector(`[data-id="${id}"]`)?.classList.add('active');
    
    document.getElementById('questionTitle').textContent = title;
    
    const question = questionsData.find(q => q.id == id);
    if (question) {
        // 显示题目内容（保留图片）
        let content = question.content;
        // 将 Markdown 图片格式转换为 HTML img 标签
        content = content.replace(/!\[img\]\(([^)]+)\)/g, '<img src="$1" alt="题目配图" class="question-image" />');
        // 将换行转换为 <br>
        content = content.replace(/\n/g, '<br>');
        document.getElementById('questionContent').innerHTML = content;
        
        // 显示解答内容
        let answer = question.answer || '暂无解答';
        // 将 Markdown 图片格式转换为 HTML img 标签
        answer = answer.replace(/!\[img\]\(([^)]+)\)/g, '<img src="$1" alt="解答配图" class="answer-image" />');
        // 将换行转换为 <br>
        answer = answer.replace(/\n/g, '<br>');
        document.getElementById('answerContent').innerHTML = answer;
        
        // 触发 MathJax 重新渲染
        renderMathJax();
        
        // 从 question_xml.js 中获取 XML 命令
        const xmlData = questionsXMLData.find(q => q.id == id);
        if (xmlData && xmlData.xml) {
            currentXML = xmlData.xml;
            document.getElementById('xmlTextarea').value = currentXML;
            document.getElementById('xmlLength').textContent = `${currentXML.length} 字符`;
        } else {
            document.getElementById('xmlTextarea').value = '';
            document.getElementById('xmlLength').textContent = '0 字符';
        }
        
        document.getElementById('statLoaded').textContent = parseInt(document.getElementById('statLoaded').textContent) + 1;
        
        if (isGGBInitialized && currentXML) {
            runXMLCommands();
        }
    }
}

// 初始化 GeoGebra
function initGGBApplet() {
    const container = document.getElementById('ggbContainer');
    const wrapper = document.querySelector('.ggb-wrapper');
    
    const initWidth = Math.max(wrapper.clientWidth || 600, 320);
    const initHeight = Math.max(wrapper.clientHeight || 400, 240);
    
    const params = {
        id: 'ggbContainer',
        width: initWidth,
        height: initHeight,
        showToolBar: true,
        showAlgebraInput: false,
        showMenuBar: true,
        appName: "classic",
        language: "zh-CN",
        enableLabelDrags: false,
        enableShiftDragZoom: true,
        showZoomButtons: true,
        useBrowserForJS: false,
        allowUpscale: true,
        capturingThreshold: null
    };
    
    try {
        const applet = new GGBApplet(params, '5.0', 'ggbContainer');
        
        params.appletOnLoad = function(api) {
            ggbApi = api;
            isGGBInitialized = true;
            
            try {
                if (typeof api.setErrorDialogsActive === 'function') {
                    api.setErrorDialogsActive(false);
                }
            } catch(e) {}
            
            document.getElementById('loadingOverlay').style.display = 'none';
            document.getElementById('runBtn').disabled = false;
            document.getElementById('clearBtn').disabled = false;
            document.getElementById('copyBtn').disabled = false;
            
            console.log('GeoGebra initialized successfully');
        };
        
        applet.inject('ggbContainer', 'preferHTML5');
        
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const newWidth = entry.contentRect.width;
                    const newHeight = entry.contentRect.height;
                    
                    if (newWidth > 100 && ggbApi && typeof ggbApi.setSize === 'function') {
                        ggbApi.setSize(newWidth, newHeight);
                    }
                }
            });
            
            resizeObserver.observe(wrapper);
        }
        
    } catch (error) {
        console.error('GeoGebra initialization failed:', error);
        document.getElementById('loadingOverlay').innerHTML = '<span class="loading-text" style="color: #dc3545;">GeoGebra 加载失败</span>';
    }
}

// 执行 XML 命令
function runXMLCommands() {
    if (!ggbApi) {
        addLog('错误：GeoGebra 画板尚未加载完成');
        return;
    }
    
    const xmlString = document.getElementById('xmlTextarea').value.trim();
    if (!xmlString) {
        addLog('警告：没有可执行的 XML');
        return;
    }
    
    document.getElementById('runBtn').disabled = true;
    document.getElementById('clearBtn').disabled = true;
    document.getElementById('copyBtn').disabled = true;
    
    try {
        ggbApi.reset();
        clearAllViews();
    } catch (e) {
        console.error('清空画板失败:', e);
    }
    
    try {
        ggbApi.evalXML(xmlString);
        addLog('✅ XML 命令执行成功');
        
        setTimeout(() => {
            try {
                if (typeof ggbApi.evalCommand === 'function') {
                    ggbApi.evalCommand("SetAxesRatio[1, 1]");
                }
            } catch (e) {
                console.error('设置坐标轴比例失败:', e);
            }
        }, 500);
        
    } catch (error) {
        console.error('XML 执行失败:', error);
        addLog('❌ XML 执行失败: ' + error.message);
    }
    
    document.getElementById('runBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;
    document.getElementById('copyBtn').disabled = false;
}

// 清空画板
function clearBoard() {
    if (!ggbApi) {
        addLog('错误：GeoGebra 画板尚未加载完成');
        return;
    }
    
    try {
        ggbApi.reset();
        clearAllViews();
        addLog('✅ 画板已清空');
    } catch (e) {
        console.error('清空画板失败:', e);
        addLog('❌ 清空画板失败');
    }
}

// 复制原题和解答
function copyQuestion() {
    const question = questionsData.find(q => q.id == currentQuestion);
    if (!question) {
        addLog('错误：未找到题目');
        return;
    }
    
    // 获取纯文本内容（移除图片标记）
    const questionText = question.content.replace(/!\[img\]\([^)]+\)/g, '');
    const answerText = question.answer ? question.answer.replace(/!\[img\]\([^)]+\)/g, '') : '';
    
    // 组合题目和解答
    const textContent = `【题目】\n${questionText}\n\n【解答】\n${answerText}`;
    
    // 检查 clipboard API 是否可用
    if (!navigator.clipboard) {
        // 降级方案：使用 textarea
        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            addLog('✅ 题目和解答已复制到剪贴板');
            const btn = document.getElementById('copyBtn');
            const originalText = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            addLog('❌ 复制失败');
        }
        
        document.body.removeChild(textarea);
        return;
    }
    
    navigator.clipboard.writeText(textContent).then(() => {
        addLog('✅ 题目和解答已复制到剪贴板');
        // 临时改变按钮文字提示
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        addLog('❌ 复制失败');
    });
}

// 清除所有视图
function clearAllViews() {
    if (!ggbApi) return;
    try {
        if (typeof ggbApi.evalCommand === 'function') {
            ggbApi.evalCommand("DeleteAll");
            ggbApi.evalCommand("DeleteAll[3]");
        }
    } catch (e) {
        console.error('清空视图失败:', e);
    }
}

// 触发 MathJax 渲染
function renderMathJax() {
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise()
            .then(() => {
                console.log('MathJax rendering completed');
            })
            .catch(err => {
                console.error('MathJax rendering failed:', err);
            });
    }
}

// 添加日志（输出到控制台）
function addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
}

// 加载题库数据
async function loadQuestions() {
    try {
        // 加载题目数据
        const response = await fetch('question.js');
        if (!response.ok) throw new Error('加载失败');
        
        const text = await response.text();
        // 解析 JavaScript 对象
        const match = text.match(/var\s+math_question\s*=\s*(\{[\s\S]*\});/);
        if (!match) throw new Error('解析失败');
        
        const data = JSON.parse(match[1]);
        questionsData = data.questions || [];
        
        // 加载 XML 数据
        if (typeof question_xml !== 'undefined' && question_xml.questions) {
            questionsXMLData = question_xml.questions;
            addLog('✅ XML 命令加载成功，共 ' + questionsXMLData.length + ' 道题目');
        } else {
            addLog('⚠️ 未找到 XML 命令数据');
        }
        
        displayQuestions(questionsData);
        addLog('✅ 题库加载成功，共 ' + questionsData.length + ' 道题目');
    } catch (error) {
        console.error('加载题库失败:', error);
        document.getElementById('questionList').innerHTML = '<li style="padding: 8px; color: #dc3545;">加载失败</li>';
        addLog('❌ 题库加载失败: ' + error.message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    
    // 绑定按钮事件
    document.getElementById('runBtn').addEventListener('click', runXMLCommands);
    document.getElementById('clearBtn').addEventListener('click', clearBoard);
    document.getElementById('copyBtn').addEventListener('click', copyQuestion);
    
    // 分类筛选事件
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterQuestions(btn.dataset.category);
        });
    });
    
    // 延迟初始化 GeoGebra
    setTimeout(() => {
        initGGBApplet();
    }, 100);
});