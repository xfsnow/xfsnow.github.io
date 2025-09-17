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
            },
            config: {
                categories: {
                    "geometry": "几何",
                    "algebra": "代数",
                    "calculus": "微积分",
                    "probability": "概率统计",
                    "other": "其他"
                },
                difficulties: {
                    "easy": "简单",
                    "medium": "中等",
                    "hard": "困难"
                }
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
        preview.innerHTML = '';
    }
}

// 数学题库数据存储
let mathQuestions = [];

// 从question.js中的math_question变量加载题目
function loadQuestions() {
    try {
        // 检查math_question变量是否存在
        if (typeof math_question !== 'undefined' && math_question.questions && Array.isArray(math_question.questions)) {
            mathQuestions = math_question.questions;
            renderQuestions();
            console.log(`成功加载 ${mathQuestions.length} 道题目`);
        } else {
            console.log('math_question变量不存在或格式错误，使用空题库');
            mathQuestions = [];
            renderQuestions();
        }
    } catch (error) {
        console.log('加载题目时出错，使用空题库:', error);
        mathQuestions = [];
        renderQuestions();
    }
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
        <div class="question-display" id="display-${index}">
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
                    <button class="btn btn-warning btn-sm" onclick="toggleEditMode(${index})" title="编辑题目">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="toggleAnswerVisibility(${index})" id="toggle-${index}">
                        <i class="fas fa-eye"></i> 显示答案
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${index})">
                        <i class="fas fa-trash"></i> 删除
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
        </div>
        
        <div class="question-edit" id="edit-${index}" style="display: none;">
            <div class="question-header">
                <h4 style="color: #f59e0b;">
                    <i class="fas fa-edit"></i> 编辑题目
                </h4>
                <div class="question-actions">
                    <button class="btn btn-success btn-sm" onclick="saveQuestion(${index})" title="保存修改">
                        <i class="fas fa-save"></i> 保存
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="cancelEditMode(${index})" title="取消编辑">
                        <i class="fas fa-times"></i> 取消
                    </button>
                </div>
            </div>
            <div class="question-input-content">
                <div class="input-group">
                    <label for="edit-title-${index}">题目标题：</label>
                    <input type="text" id="edit-title-${index}" class="form-control" value="${question.title.replace(/"/g, '&quot;')}" placeholder="请输入题目标题">
                </div>
                
                <div class="input-group">
                    <label for="edit-content-${index}">题目内容：</label>
                    <textarea id="edit-content-${index}" class="form-control" rows="6" placeholder="请输入题目内容，支持LaTeX数学公式">${question.content}</textarea>
                </div>
                
                <div class="input-group">
                    <label for="edit-answer-${index}">参考答案：</label>
                    <textarea id="edit-answer-${index}" class="form-control" rows="8" placeholder="请输入参考答案，支持LaTeX数学公式">${question.answer}</textarea>
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label for="edit-category-${index}">分类：</label>
                        <select id="edit-category-${index}" class="form-control">
                            <option value="geometry" ${question.category === 'geometry' ? 'selected' : ''}>几何</option>
                            <option value="algebra" ${question.category === 'algebra' ? 'selected' : ''}>代数</option>
                            <option value="calculus" ${question.category === 'calculus' ? 'selected' : ''}>微积分</option>
                            <option value="probability" ${question.category === 'probability' ? 'selected' : ''}>概率统计</option>
                            <option value="other" ${question.category === 'other' ? 'selected' : ''}>其他</option>
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label for="edit-difficulty-${index}">难度：</label>
                        <select id="edit-difficulty-${index}" class="form-control">
                            <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>简单</option>
                            <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>中等</option>
                            <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>困难</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    return card;
}

// 获取分类名称
function getCategoryName(category) {
    if (window.MathJax && window.MathJax.config && window.MathJax.config.categories) {
        return window.MathJax.config.categories[category] || category;
    }
    // 备用配置，防止MathJax未加载
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
    if (window.MathJax && window.MathJax.config && window.MathJax.config.difficulties) {
        return window.MathJax.config.difficulties[difficulty] || difficulty;
    }
    // 备用配置，防止MathJax未加载
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
        toggleButton.classList.remove('btn-secondary');
        toggleButton.classList.add('btn-success');
    } else {
        answerSection.style.display = 'none';
        toggleButton.innerHTML = '<i class="fas fa-eye"></i> 显示答案';
        toggleButton.classList.remove('btn-success');
        toggleButton.classList.add('btn-secondary');
    }
}

function toggleAddQuestion() {
    const area = document.getElementById('addQuestionArea');
    const toggleButton = document.querySelector('button[onclick="toggleAddQuestion()"]');
    
    if (area.style.display === 'none' || area.style.display === '') {
        // 显示添加题目区域
        area.style.display = 'block';
        // 更新按钮文字和样式
        toggleButton.innerHTML = '<i class="fas fa-times"></i> 取消添加';
        toggleButton.classList.remove('btn-success');
        toggleButton.classList.add('btn-secondary');
    } else {
        // 隐藏添加题目区域
        area.style.display = 'none';
        // 恢复按钮文字和样式
        toggleButton.innerHTML = '<i class="fas fa-plus"></i> 添加题目';
        toggleButton.classList.remove('btn-secondary');
        toggleButton.classList.add('btn-success');
    }
}

// 取消添加题目
function cancelAddQuestion() {
    const area = document.getElementById('addQuestionArea');
    const toggleButton = document.querySelector('button[onclick="toggleAddQuestion()"]');
    
    // 隐藏添加题目区域
    area.style.display = 'none';
    
    // 恢复主按钮的文字和样式
    toggleButton.innerHTML = '<i class="fas fa-plus"></i> 添加题目';
    toggleButton.classList.remove('btn-secondary');
    toggleButton.classList.add('btn-success');
    
    // 清空表单
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
    
    // 取消添加题目（这会自动更新按钮状态）
    cancelAddQuestion();
    
    alert('题目添加成功！');
}

// 切换编辑模式
function toggleEditMode(index) {
    const displayDiv = document.getElementById(`display-${index}`);
    const editDiv = document.getElementById(`edit-${index}`);
    
    displayDiv.style.display = 'none';
    editDiv.style.display = 'block';
}

// 取消编辑模式
function cancelEditMode(index) {
    const displayDiv = document.getElementById(`display-${index}`);
    const editDiv = document.getElementById(`edit-${index}`);
    
    displayDiv.style.display = 'block';
    editDiv.style.display = 'none';
    
    // 恢复原始值
    const question = mathQuestions[index];
    document.getElementById(`edit-title-${index}`).value = question.title;
    document.getElementById(`edit-content-${index}`).value = question.content;
    document.getElementById(`edit-answer-${index}`).value = question.answer;
    document.getElementById(`edit-category-${index}`).value = question.category;
    document.getElementById(`edit-difficulty-${index}`).value = question.difficulty;
}

// 保存题目修改
function saveQuestion(index) {
    const title = document.getElementById(`edit-title-${index}`).value.trim();
    const content = document.getElementById(`edit-content-${index}`).value.trim();
    const answer = document.getElementById(`edit-answer-${index}`).value.trim();
    const category = document.getElementById(`edit-category-${index}`).value;
    const difficulty = document.getElementById(`edit-difficulty-${index}`).value;
    
    if (!title || !content || !answer) {
        alert('请填写完整的题目信息！');
        return;
    }
    
    // 更新题目数据
    mathQuestions[index] = {
        ...mathQuestions[index],
        title: title,
        content: content,
        answer: answer,
        category: category,
        difficulty: difficulty
    };
    
    // 重新渲染题目列表
    renderQuestions();
    
    alert('题目修改成功！');
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

// 导出题库到question.js文件
function exportQuestions() {
    if (mathQuestions.length === 0) {
        alert('题库为空，无法导出！');
        return;
    }
    
    const dataToExport = {
        exportTime: new Date().toISOString(),
        description: "数学题库数据",
        questions: mathQuestions
    };
    
    // 创建JavaScript文件内容
    const jsContent = `var math_question = ${JSON.stringify(dataToExport, null, 2)};`;
    
    const dataBlob = new Blob([jsContent], {type: 'application/javascript'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `question.js`;  // 固定文件名为question.js
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`成功导出 ${mathQuestions.length} 道题目到 question.js 文件！`);
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
            const fileContent = e.target.result;
            let importData;
            
            // 只支持JavaScript文件格式：var math_question = {...};
            const jsonMatch = fileContent.match(/var\s+math_question\s*=\s*({[\s\S]*?});?\s*$/);
            if (!jsonMatch) {
                throw new Error('文件格式错误：请导入JavaScript变量格式的文件 (var math_question = ...)');
            }
            
            importData = JSON.parse(jsonMatch[1]);
            
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
            alert('文件格式错误：无法解析文件内容！请确保文件是有效的JavaScript变量格式。');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsText(file);
    
    // 清除文件输入，允许重复导入同一文件
    event.target.value = '';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 直接加载题目，不需要等待异步操作
    loadQuestions();
    
    // 如果MathJax已加载，重新渲染一次确保公式正确显示
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(() => {
            const container = document.getElementById('questionsContainer');
            if (container) {
                safeMathJaxRender(container);
            }
        });
    }
});