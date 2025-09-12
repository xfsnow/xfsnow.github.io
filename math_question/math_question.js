window.MathJax = {
            tex: {
                inlineMath: [['\\(', '\\)'], ['$', '$']],
                displayMath: [['\\[', '\\]'], ['$$', '$$']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
                ignoreHtmlClass: 'tex2jax_ignore'
            }
};

// LaTeX到HTML转换函数（简化版）
function convertLatexToHTML(latex) {
    let html = latex;
    
    // 处理Markdown标题
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // 处理粗体文字
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理Markdown图片链接
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">');
    
    // 处理多行段落：先将双换行转换为段落分隔符
    html = html.replace(/\n\n+/g, '</p><p>');
    
    // 包装为段落
    html = '<p>' + html + '</p>';
    
    // 处理单个换行为<br>
    html = html.replace(/\n/g, '<br>');
    
    // 清理空段落
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');
    
    return html;
}

// 安全的MathJax渲染函数
function safeMathJaxRender(element) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        return MathJax.typesetPromise([element]).catch(err => {
            console.warn('MathJax渲染失败:', err);
        });
    } else if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        return window.MathJax.startup.promise.then(() => {
            if (window.MathJax.typesetPromise) {
                return MathJax.typesetPromise([element]);
            }
        }).catch(err => {
            console.warn('MathJax渲染失败:', err);
        });
    } else {
        // MathJax还未完全加载，等待后重试
        setTimeout(() => safeMathJaxRender(element), 100);
    }
}

// 预览功能
function updatePreview(type) {
    const content = document.getElementById(`question${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
    const preview = document.getElementById(`${type}Preview`);
    
    if (content.trim()) {
        preview.innerHTML = convertLatexToHTML(content);
        // 重新渲染MathJax
        safeMathJaxRender(preview);
    } else {
        preview.innerHTML = type === 'content' ? '在此输入内容后查看预览' : '在此输入答案后查看预览';
    }
}

// 数学题库数据存储
let mathQuestions = [];

// 从math_questions.json加载题目
function loadQuestions() {
    fetch('math_question.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('题目文件不存在或无法访问');
            }
            return response.json();
        })
        .then(data => {
            if (data.questions && Array.isArray(data.questions)) {
                mathQuestions = data.questions;
                renderQuestions();
                console.log(`成功加载 ${mathQuestions.length} 道题目`);
            }
        })
        .catch(error => {
            console.log('未找到题目文件，使用空题库');
            mathQuestions = [];
            renderQuestions();
        });
}

// 渲染所有题目
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    mathQuestions.forEach((question, index) => {
        const questionCard = createQuestionCard(question, index);
        container.appendChild(questionCard);
    });
    
    // 重新渲染MathJax
    safeMathJaxRender(container);
}

// 创建题目卡片
function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML = `
        <div class="question-header">
            <div>
                <h4 class="question-title">${question.title}</h4>
                <div class="question-meta">
                    分类: ${getCategoryName(question.category)} | 
                    难度: ${getDifficultyName(question.difficulty)} | 
                    创建时间: ${question.createTime}
                </div>
            </div>
            <div class="question-actions">
                <button class="btn btn-info btn-sm" onclick="toggleAnswerVisibility(${index})" id="toggle-${index}">
                    <i class="fas fa-eye"></i> 显示答案
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="question-content">
            <div class="question-body">
                ${convertLatexToHTML(question.content)}
            </div>
            <div class="answer-space"></div>
            <div class="answer-section" id="answer-${index}" style="display: none;">
                <h5 style="color: #059669; margin-bottom: 10px;">
                    <i class="fas fa-lightbulb"></i> 参考答案：
                </h5>
                ${convertLatexToHTML(question.answer)}
            </div>
        </div>
    `;
    return card;
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'geometry': '几何',
        'algebra': '代数', 
        'calculus': '微积分',
        'probability': '概率统计',
        'other': '其他'
    };
    return names[category] || category;
}

// 获取难度名称
function getDifficultyName(difficulty) {
    const names = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    return names[difficulty] || difficulty;
}

// 打印题目
function printQuestions() {
    window.print();
}

// 切换添加题目区域
// 切换特定题目的答案显示
function toggleAnswerVisibility(index) {
    const answerSection = document.getElementById(`answer-${index}`);
    const toggleButton = document.getElementById(`toggle-${index}`);
    
    if (answerSection.style.display === 'none' || answerSection.style.display === '') {
        answerSection.style.display = 'block';
        toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏答案';
        toggleButton.classList.remove('btn-info');
        toggleButton.classList.add('btn-warning');
    } else {
        answerSection.style.display = 'none';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i> 显示答案';
        toggleButton.classList.remove('btn-warning');
        toggleButton.classList.add('btn-info');
    }
}

function toggleAddQuestion() {
    const area = document.getElementById('addQuestionArea');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

// 取消添加题目
function cancelAddQuestion() {
    document.getElementById('addQuestionArea').style.display = 'none';
    clearAddQuestionForm();
}

// 清空添加题目表单
function clearAddQuestionForm() {
    document.getElementById('questionTitle').value = '';
    document.getElementById('questionContent').value = '';
    document.getElementById('questionAnswer').value = '';
    document.getElementById('questionCategory').value = 'geometry';
    document.getElementById('questionDifficulty').value = 'medium';
}

// 添加题目
function addQuestion() {
    const title = document.getElementById('questionTitle').value.trim();
    const content = document.getElementById('questionContent').value.trim();
    const answer = document.getElementById('questionAnswer').value.trim();
    const category = document.getElementById('questionCategory').value;
    const difficulty = document.getElementById('questionDifficulty').value;
    
    if (!title || !content || !answer) {
        alert('请填写完整的题目信息！');
        return;
    }
    
    const question = {
        id: Date.now(),
        title: title,
        content: content,
        answer: answer,
        category: category,
        difficulty: difficulty,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    mathQuestions.push(question);
    renderQuestions();
    cancelAddQuestion();
    
    alert('题目添加成功！');
}

// 删除题目
function deleteQuestion(index) {
    if (confirm('确定要删除这道题目吗？')) {
        mathQuestions.splice(index, 1);
        renderQuestions();
    }
}

// 清空所有题目
function clearAllQuestions() {
    if (confirm('确定要清空所有题目吗？此操作不可恢复！')) {
        mathQuestions = [];
        renderQuestions();
    }
}

// 导出题库到JSON文件
function exportQuestions() {
    if (mathQuestions.length === 0) {
        alert('题库为空，无法导出！');
        return;
    }
    
    const dataToExport = {
        version: "1.0",
        exportTime: new Date().toISOString(),
        description: "数学题库导出数据",
        totalQuestions: mathQuestions.length,
        questions: mathQuestions
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `math_questions_${new Date().toISOString().slice(0,10)}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`成功导出 ${mathQuestions.length} 道题目！`);
}

// 触发导入文件选择
function importQuestions() {
    document.getElementById('importFile').click();
}

// 处理导入的文件
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (importData.questions && Array.isArray(importData.questions)) {
                const importCount = importData.questions.length;
                
                if (confirm(`确定要导入 ${importCount} 道题目吗？这将添加到现有题库中。`)) {
                    // 为导入的题目分配新的ID，避免冲突
                    const maxId = mathQuestions.length > 0 ? Math.max(...mathQuestions.map(q => q.id)) : 0;
                    
                    importData.questions.forEach((question, index) => {
                        question.id = maxId + index + 1;
                        question.createTime = question.createTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
                    });
                    
                    mathQuestions = [...mathQuestions, ...importData.questions];
                    renderQuestions();
                    
                    alert(`成功导入 ${importCount} 道题目！`);
                } else {
                    alert('导入已取消。');
                }
            } else {
                alert('文件格式错误：缺少有效的题目数据！');
            }
        } catch (error) {
            alert('文件格式错误：无法解析JSON文件！');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    
    // 清除文件输入，允许重复导入同一文件
    event.target.value = '';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待MathJax加载完成后再加载题目
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(() => {
            loadQuestions();
        });
    } else {
        // 如果MathJax还未初始化，等待一段时间后重试
        let attempts = 0;
        const checkMathJax = () => {
            attempts++;
            if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
                window.MathJax.startup.promise.then(() => {
                    loadQuestions();
                });
            } else if (attempts < 50) { // 最多等待5秒
                setTimeout(checkMathJax, 100);
            } else {
                // 超时后直接加载，不等待MathJax
                console.warn('MathJax加载超时，直接加载题目');
                loadQuestions();
            }
        };
        checkMathJax();
    }
});