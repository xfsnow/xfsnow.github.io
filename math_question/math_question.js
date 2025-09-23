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

class MathQuestionBank {
    constructor() {
        this.mathQuestions = [];
        this.container = null;
        this.addQuestionArea = null;
        this.importFileInput = null;
    }

    // 初始化系统
    init() {
        this.container = document.getElementById('questionsContainer');
        this.addQuestionArea = document.getElementById('addQuestionArea');
        this.importFileInput = document.getElementById('importFile');
        
        this.bindEvents();
        this.loadQuestions();
    }

    // 绑定事件
    bindEvents() {
        // 主要控制按钮
        document.querySelector('button[data-action="toggleAddQuestion"]').addEventListener('click', () => this.toggleAddQuestion());
        document.querySelector('button[data-action="exportQuestions"]').addEventListener('click', () => this.exportQuestions());
        document.querySelector('button[data-action="importQuestions"]').addEventListener('click', () => this.importQuestions());
        document.querySelector('button[data-action="printQuestions"]').addEventListener('click', () => this.printQuestions());
        document.querySelector('button[data-action="clearAllQuestions"]').addEventListener('click', () => this.clearAllQuestions());

        // 添加题目表单事件
        document.getElementById('questionContent').addEventListener('input', () => this.updatePreview('content'));
        document.getElementById('questionAnswer').addEventListener('input', () => this.updatePreview('answer'));
        document.querySelector('button[data-action="addQuestion"]').addEventListener('click', () => this.addQuestion());
        document.querySelector('button[data-action="cancelAddQuestion"]').addEventListener('click', () => this.cancelAddQuestion());

        // 导入文件事件
        this.importFileInput.addEventListener('change', (event) => this.handleImportFile(event));
    }

    // LaTeX到HTML转换函数（简化版）
    convertLatexToHTML(latex) {
        let html = latex.trim();
        
        // 定义转换规则数组
        const conversions = [
            // 处理Markdown标题
            { pattern: /^# (.*$)/gm, replacement: '<h1>$1</h1>' },
            { pattern: /^## (.*$)/gm, replacement: '<h2>$1</h2>' },
            { pattern: /^### (.*$)/gm, replacement: '<h3>$1</h3>' },
            
            // 处理粗体文字
            { pattern: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
            
            // 处理Markdown图片链接
            { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0;">' }
        ];
        
        // 执行转换规则
        conversions.forEach(({ pattern, replacement }) => {
            html = html.replace(pattern, replacement);
        });
        
        // 处理多行段落：先将双换行转换为段落分隔符
        html = html.replace(/\n\n+/g, '</p><p>');
        
        // 包装为段落
        html = '<p>' + html + '</p>';
        
        // 处理单个换行为<br>
        html = html.replace(/\n/g, '<br>');
        
        // 定义清理规则数组
        const cleanups = [
            // 清理标题后面紧接的<br>
            { pattern: /(<\/h[1-6]>)<br>/g, replacement: '$1' },
            
            // 清理空段落和只包含空白字符的段落
            { pattern: /<p><\/p>/g, replacement: '' },
            { pattern: /<p>\s*<\/p>/g, replacement: '' },
            { pattern: /<p><br><\/p>/g, replacement: '' },
            { pattern: /<p>(\s*<br>\s*)+<\/p>/g, replacement: '' },
            
            // 清理连续的<br>标签（超过2个）
            { pattern: /(<br>\s*){3,}/g, replacement: '<br><br>' },
            
            // 清理段落开头和结尾的<br>
            { pattern: /<p><br>/g, replacement: '<p>' },
            { pattern: /<br><\/p>/g, replacement: '</p>' },
            
            // 最终清理：再次检查空段落
            { pattern: /<p><\/p>/g, replacement: '' },
            { pattern: /<p>\s*<\/p>/g, replacement: '' }
        ];
        
        // 执行清理规则
        cleanups.forEach(({ pattern, replacement }) => {
            html = html.replace(pattern, replacement);
        });
        
        return html;
    }

    // 安全的MathJax渲染函数
    safeMathJaxRender(element) {
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
            setTimeout(() => this.safeMathJaxRender(element), 100);
        }
    }

    // 预览功能
    updatePreview(type) {
        const content = document.getElementById(`question${type.charAt(0).toUpperCase() + type.slice(1)}`).value;
        const preview = document.getElementById(`${type}Preview`);
        
        if (content.trim()) {
            preview.innerHTML = this.convertLatexToHTML(content);
            // 重新渲染MathJax
            this.safeMathJaxRender(preview);
        } else {
            preview.innerHTML = '';
        }
    }

    // 从question.js中的math_question变量加载题目
    loadQuestions() {
        try {
            // 检查math_question变量是否存在
            if (typeof math_question !== 'undefined' && math_question.questions && Array.isArray(math_question.questions)) {
                this.mathQuestions = math_question.questions;
                this.renderQuestions();
                console.log(`成功加载 ${this.mathQuestions.length} 道题目`);
            } else {
                console.log('math_question变量不存在或格式错误，使用空题库');
                this.mathQuestions = [];
                this.renderQuestions();
            }
        } catch (error) {
            console.log('加载题目时出错，使用空题库:', error);
            this.mathQuestions = [];
            this.renderQuestions();
        }
    }

    // 渲染所有题目
    renderQuestions() {
        this.container.innerHTML = '';
        
        this.mathQuestions.forEach((question, index) => {
            const questionCard = this.createQuestionCard(question, index);
            this.container.appendChild(questionCard);
        });
        
        // 重新渲染MathJax
        this.safeMathJaxRender(this.container);
        
        // 绑定题目卡片中的事件
        this.bindQuestionCardEvents();
    }

    // 绑定题目卡片中的事件
    bindQuestionCardEvents() {
        // 为每个题目的操作按钮绑定事件
        this.mathQuestions.forEach((question, index) => {
            // 编辑按钮
            const editButton = document.querySelector(`button[data-action="edit"][data-index="${index}"]`);
            if (editButton) {
                editButton.addEventListener('click', () => this.toggleEditMode(index));
            }
            
            // 显示/隐藏答案按钮
            const toggleButton = document.querySelector(`button[data-action="toggleAnswer"][data-index="${index}"]`);
            if (toggleButton) {
                toggleButton.addEventListener('click', () => this.toggleAnswerVisibility(index));
            }
            
            // 删除按钮
            const deleteButton = document.querySelector(`button[data-action="delete"][data-index="${index}"]`);
            if (deleteButton) {
                deleteButton.addEventListener('click', () => this.deleteQuestion(index));
            }
            
            // 保存编辑按钮
            const saveButton = document.querySelector(`button[data-action="save"][data-index="${index}"]`);
            if (saveButton) {
                saveButton.addEventListener('click', () => this.saveQuestion(index));
            }
            
            // 取消编辑按钮
            const cancelButton = document.querySelector(`button[data-action="cancelEdit"][data-index="${index}"]`);
            if (cancelButton) {
                cancelButton.addEventListener('click', () => this.cancelEditMode(index));
            }
        });
    }

    // 创建题目卡片
    createQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="question-display" id="q${question.id}">
                <div class="question-header">
                    <div>
                        <h4 class="question-title"><a href="#q${question.id}" id="title-${question.id}">${question.title}</a></h4>
                        <div class="question-meta">
                            分类: ${this.getCategoryName(question.category)} | 
                            难度: ${this.getDifficultyName(question.difficulty)} | 
                            创建时间: ${question.createTime}
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-warning btn-sm" data-action="edit" data-index="${index}" title="编辑题目">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-secondary btn-sm" data-action="toggleAnswer" data-index="${index}" id="toggle-${index}">
                            <i class="fas fa-eye"></i> 显示答案
                        </button>
                        <button class="btn btn-danger btn-sm" data-action="delete" data-index="${index}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
                <div class="question-content">
                    <div class="question-body">
                        ${this.convertLatexToHTML(question.content)}
                    </div>
                    <div class="answer-space"></div>
                    <div class="answer-section" id="answer-${index}" style="display: none;">
                        <h5 style="color: #059669; margin-bottom: 10px;">
                            <i class="fas fa-lightbulb"></i> 参考答案：
                        </h5>
                        ${this.convertLatexToHTML(question.answer)}
                    </div>
                </div>
            </div>
            
            <div class="question-edit" id="edit-${index}" style="display: none;">
                <div class="question-header">
                    <h4 style="color: #f59e0b;">
                        <i class="fas fa-edit"></i> 编辑题目
                    </h4>
                    <div class="question-actions">
                        <button class="btn btn-success btn-sm" data-action="save" data-index="${index}" title="保存修改">
                            <i class="fas fa-save"></i> 保存
                        </button>
                        <button class="btn btn-secondary btn-sm" data-action="cancelEdit" data-index="${index}" title="取消编辑">
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
    getCategoryName(category) {
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
    getDifficultyName(difficulty) {
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
    printQuestions() {
        window.print();
    }

    // 切换特定题目的答案显示
    toggleAnswerVisibility(index) {
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

    // 切换添加题目区域
    toggleAddQuestion() {
        const toggleButton = document.querySelector('button[data-action="toggleAddQuestion"]');
        
        if (this.addQuestionArea.style.display === 'none' || this.addQuestionArea.style.display === '') {
            // 显示添加题目区域
            this.addQuestionArea.style.display = 'block';
            // 更新按钮文字和样式
            toggleButton.innerHTML = '<i class="fas fa-times"></i> 取消添加';
            toggleButton.classList.remove('btn-success');
            toggleButton.classList.add('btn-secondary');
        } else {
            // 隐藏添加题目区域
            this.addQuestionArea.style.display = 'none';
            // 恢复按钮文字和样式
            toggleButton.innerHTML = '<i class="fas fa-plus"></i> 添加题目';
            toggleButton.classList.remove('btn-secondary');
            toggleButton.classList.add('btn-success');
        }
    }

    // 取消添加题目
    cancelAddQuestion() {
        const toggleButton = document.querySelector('button[data-action="toggleAddQuestion"]');
        
        // 隐藏添加题目区域
        this.addQuestionArea.style.display = 'none';
        
        // 恢复主按钮的文字和样式
        toggleButton.innerHTML = '<i class="fas fa-plus"></i> 添加题目';
        toggleButton.classList.remove('btn-secondary');
        toggleButton.classList.add('btn-success');
        
        // 清空表单
        this.clearAddQuestionForm();
    }

    // 清空添加题目表单
    clearAddQuestionForm() {
        document.getElementById('questionTitle').value = '';
        document.getElementById('questionContent').value = '';
        document.getElementById('questionAnswer').value = '';
        document.getElementById('questionCategory').value = 'geometry';
        document.getElementById('questionDifficulty').value = 'medium';
    }

    // 添加题目
    addQuestion() {
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
        
        this.mathQuestions.push(question);
        this.renderQuestions();
        
        // 取消添加题目（这会自动更新按钮状态）
        this.cancelAddQuestion();
        
        alert('题目添加成功！');
    }

    // 切换编辑模式
    toggleEditMode(index) {
        const displayDiv = document.getElementById(`display-${index}`);
        const editDiv = document.getElementById(`edit-${index}`);
        
        if (displayDiv) displayDiv.style.display = 'none';
        if (editDiv) editDiv.style.display = 'block';
    }

    // 取消编辑模式
    cancelEditMode(index) {
        const displayDiv = document.getElementById(`display-${index}`);
        const editDiv = document.getElementById(`edit-${index}`);
        
        if (displayDiv) displayDiv.style.display = 'block';
        if (editDiv) editDiv.style.display = 'none';
        
        // 恢复原始值
        const question = this.mathQuestions[index];
        document.getElementById(`edit-title-${index}`).value = question.title;
        document.getElementById(`edit-content-${index}`).value = question.content;
        document.getElementById(`edit-answer-${index}`).value = question.answer;
        document.getElementById(`edit-category-${index}`).value = question.category;
        document.getElementById(`edit-difficulty-${index}`).value = question.difficulty;
    }

    // 保存题目修改
    saveQuestion(index) {
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
        this.mathQuestions[index] = {
            ...this.mathQuestions[index],
            title: title,
            content: content,
            answer: answer,
            category: category,
            difficulty: difficulty
        };
        
        // 重新渲染题目列表
        this.renderQuestions();
        
        alert('题目修改成功！');
    }

    // 删除题目
    deleteQuestion(index) {
        if (confirm('确定要删除这道题目吗？')) {
            this.mathQuestions.splice(index, 1);
            this.renderQuestions();
        }
    }

    // 清空所有题目
    clearAllQuestions() {
        if (confirm('确定要清空所有题目吗？此操作不可恢复！')) {
            this.mathQuestions = [];
            this.renderQuestions();
        }
    }

    // 导出题库到question.js文件
    exportQuestions() {
        if (this.mathQuestions.length === 0) {
            alert('题库为空，无法导出！');
            return;
        }
        
        const dataToExport = {
            exportTime: new Date().toISOString(),
            description: "数学题库数据",
            questions: this.mathQuestions
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
        
        alert(`成功导出 ${this.mathQuestions.length} 道题目到 question.js 文件！`);
    }

    // 触发导入文件选择
    importQuestions() {
        this.importFileInput.click();
    }

    // 处理导入的文件
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
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
                        const maxId = this.mathQuestions.length > 0 ? Math.max(...this.mathQuestions.map(q => q.id)) : 0;
                        
                        importData.questions.forEach((question, index) => {
                            question.id = maxId + index + 1;
                            question.createTime = question.createTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
                        });
                        
                        this.mathQuestions = [...this.mathQuestions, ...importData.questions];
                        this.renderQuestions();
                        
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
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    const questionBank = new MathQuestionBank();
    window.questionBank = questionBank; // 将实例挂载到window对象上，便于调试
    questionBank.init();
    
    // 如果MathJax已加载，重新渲染一次确保公式正确显示
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(() => {
            const container = document.getElementById('questionsContainer');
            if (container) {
                questionBank.safeMathJaxRender(container);
            }
        });
    }
});