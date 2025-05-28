// 测试题目数据
const questions = [
    // 词汇部分 - 7题
    {
        id: 1,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the correct word to complete the sentence: The dog is _____ under the tree.",
        options: ["sleeping", "sleep", "sleeps", "to sleep"],
        correct: 0
    },
    {
        id: 2,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Which word is the opposite of 'expensive'?",
        options: ["costly", "cheap", "price", "value"],
        correct: 1
    },
    {
        id: 3,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the word that means 'a place where books are kept'.",
        options: ["bookshop", "library", "school", "bedroom"],
        correct: 1
    },
    {
        id: 4,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "What is the correct meaning of the word 'enormous'?",
        options: ["very small", "very fast", "very loud", "very big"],
        correct: 3
    },
    {
        id: 5,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the correct word to complete the sentence: She _____ her homework every evening.",
        options: ["do", "does", "doing", "done"],
        correct: 1
    },
    {
        id: 6,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the word that doesn't belong in the group.",
        options: ["apple", "banana", "carrot", "orange"],
        correct: 2
    },
    {
        id: 7,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the correct word for this definition: 'a large area of water surrounded by land'.",
        options: ["river", "ocean", "lake", "waterfall"],
        correct: 2
    },

    // 语法部分 - 7题
    {
        id: 8,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Choose the correct sentence.",
        options: [
            "She don't like coffee.",
            "She doesn't likes coffee.",
            "She doesn't like coffee.",
            "She not like coffee."
        ],
        correct: 2
    },
    {
        id: 9,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Complete the sentence: If it _____ tomorrow, we will go to the park.",
        options: ["rains", "will rain", "is raining", "rain"],
        correct: 0
    },
    {
        id: 10,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Choose the correct past tense form of the verb 'go'.",
        options: ["goed", "gone", "went", "going"],
        correct: 2
    },
    {
        id: 11,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Select the correct preposition: The book is _____ the table.",
        options: ["in", "on", "at", "by"],
        correct: 1
    },
    {
        id: 12,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Choose the correct comparative form: My house is _____ than yours.",
        options: ["big", "bigger", "biggest", "more big"],
        correct: 1
    },
    {
        id: 13,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Which sentence uses the present perfect tense correctly?",
        options: [
            "I have see that movie yesterday.",
            "I have saw that movie.",
            "I have seen that movie.",
            "I have seeing that movie."
        ],
        correct: 2
    },
    {
        id: 14,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Choose the correct article: _____ apple a day keeps the doctor away.",
        options: ["A", "An", "The", "No article needed"],
        correct: 1
    },

    // 阅读理解部分 - 2篇文章，每篇3-4题
    {
        id: 15,
        category: 'reading',
        type: 'reading',
        text: "Reading Passage 1",
        content: `Sarah loves to read books. She goes to the library every Saturday. Last Saturday, she borrowed three books. One was a story about pirates. Another was about a girl who could talk to animals. The third book was about space. Sarah read the pirate book first. It was very exciting! She finished it in two days. Then she started reading the book about the girl. She liked it, but she liked the pirate book more. Sarah will return the books next Saturday and borrow some new ones.`,
        questions: [
            {
                text: "How often does Sarah go to the library?",
                options: ["Every day", "Every Saturday", "Once a month", "Twice a week"],
                correct: 1
            },
            {
                text: "How many books did Sarah borrow last Saturday?",
                options: ["1", "2", "3", "4"],
                correct: 2
            },
            {
                text: "Which book did Sarah read first?",
                options: ["The book about space", "The book about pirates", "The book about a girl", "None of them"],
                correct: 1
            },
            {
                text: "When will Sarah return the books?",
                options: ["Next Monday", "Next Friday", "Next Saturday", "In two days"],
                correct: 2
            }
        ]
    },
    {
        id: 16,
        category: 'reading',
        type: 'reading',
        text: "Reading Passage 2",
        content: `Tom has a new bicycle. It is red and black. He rides it to school every day. The school is two kilometers from his house. It takes Tom about 15 minutes to ride there. One day, it was raining heavily. Tom couldn't ride his bicycle. He had to take the bus. The bus was very crowded. Tom prefers riding his bicycle because it's faster and more fun. When the weather is good, Tom sometimes rides his bicycle to the park after school. He meets his friends there, and they play together.`,
        questions: [
            {
                text: "What color is Tom's bicycle?",
                options: ["Blue and black", "Red and blue", "Red and black", "Black and white"],
                correct: 2
            },
            {
                text: "How far is Tom's school from his house?",
                options: ["1 kilometer", "2 kilometers", "3 kilometers", "4 kilometers"],
                correct: 1
            },
            {
                text: "Why couldn't Tom ride his bicycle one day?",
                options: ["It was broken", "It was raining heavily", "He was late", "His friend borrowed it"],
                correct: 1
            }
        ]
    },

    // 听力部分 - 5题 来自 https://www.ximalaya.com/sound/330567370
    {
        id: 17,
        category: 'listening',
        type: 'listening',
        text: "What is the man’s new hobby?",
        audio: "17.m4a",
        options: ["Drawing cartoons", "Watching movies", "Writing plays", "Playing video games"],
        correct: 2
    },
    {
        id: 18,
        category: 'listening',
        type: 'listening',
        text: "How many shop assistants in David store can speak a foreign language. ",
        audio: "18.m4a",
        options: ["Four", "Six", "Ten", "Twenty"],
        correct: 1
    },
    {
        id: 19,
        category: 'listening',
        type: 'listening',
        text: "How does the woman like the trip to the National Park?",
        audio: "19.m4a",
        options: ["She thinks it was exciting.",
"B. She thinks it was boring.",
"C. She wants to go again.",
"D. She didn’t go on the trip."],
        correct: 0
    },
    {
        id: 20,
        category: 'listening',
        type: 'listening',
        text: "When is Jessica’s birthday?",
        audio: "20.m4a",
        options: ["April 1st", "April 2nd", "June 1st", "June 2nd"],
        correct: 3
    },
    {
        id: 21,
        category: 'listening',
        type: 'listening',
        text: "Why did the man move to the country?",
        audio: "21.m4a",
        options: ["Because he likes the quiet life in the country.",
"Because he wanted to live near his office.",
"Because his friends live in the country.",
"Because he bought a house there."],
        correct: 1
    },

    // 额外题目，确保总题数达到25题以上
    {
        id: 22,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the word that best completes the sentence: The sky is _____ today.",
        options: ["blue", "blew", "blow", "blues"],
        correct: 0
    },
    {
        id: 23,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Which sentence is in the future tense?",
        options: [
            "I am going to school.",
            "I went to school.",
            "I will go to school tomorrow.",
            "I go to school."
        ],
        correct: 2
    },
    {
        id: 24,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the correct plural form of 'child'.",
        options: ["childs", "childrens", "children", "child"],
        correct: 2
    },
    {
        id: 25,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Select the sentence with the correct word order:",
        options: [
            "Where you are going?",
            "Where are you going?",
            "You are going where?",
            "Where going you are?"
        ],
        correct: 1
    },
    {
        id: 26,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "Choose the correct word: I need to _____ my teeth before going to bed.",
        options: ["washing", "wash", "washes", "brushes"],
        correct: 1
    },
    {
        id: 27,
        category: 'grammar',
        type: 'multipleChoice',
        text: "Select the correct possessive pronoun: That book is _____.",
        options: ["me", "my", "mine", "I"],
        correct: 2
    },
    {
        id: 28,
        category: 'vocabulary',
        type: 'multipleChoice',
        text: "What is the meaning of 'delicious'?",
        options: ["very big", "very small", "tasting very good", "very difficult"],
        correct: 2
    }
];

// 应用状态
let currentPage = 0;
let userAnswers = Array(questions.length).fill(null);
let timer;
let timeLeft = 30 * 60; // 30分钟，以秒为单位
let testStarted = false;

// DOM元素
const testContainer = document.getElementById('testContainer');
const progressBar = document.getElementById('progressBar');
const timerDisplay = document.getElementById('timer');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resultsContainer = document.getElementById('resultsContainer');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始隐藏导航和提交按钮
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    pagination.style.display = 'none';

    // 绑定开始按钮事件
    startButton.addEventListener('click', startTest);

    // 绑定导航按钮事件
    prevBtn.addEventListener('click', goToPrevQuestion);
    nextBtn.addEventListener('click', goToNextQuestion);

    // 绑定提交按钮事件
    submitBtn.addEventListener('click', submitTest);

    // 绑定重新测试按钮事件
    document.getElementById('restartBtn').addEventListener('click', restartTest);
});

// 开始测试
function startTest() {
    testStarted = true;
    startScreen.style.display = 'none';
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'block';
    pagination.style.display = 'flex';

    // 初始化分页
    renderPagination();

    // 显示第一题
    renderQuestion(currentPage);

    // 启动计时器
    startTimer();

    // 更新进度条
    updateProgress();
}

// 渲染分页
function renderPagination() {
    pagination.innerHTML = '';

    for (let i = 0; i < questions.length; i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = i + 1;
        button.addEventListener('click', () => {
            currentPage = i;
            renderQuestion(currentPage);
            updateActivePageBtn();
        });
        pagination.appendChild(button);
    }
}

// 更新活动页按钮
function updateActivePageBtn() {
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentPage);
    });
}

// 渲染问题
function renderQuestion(index) {
    const question = questions[index];
    testContainer.innerHTML = '';

    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    // 问题标题
    const questionText = document.createElement('div');
    questionText.className = 'question-text';

    if (question.type === 'reading') {
        // 阅读理解类型
        questionText.textContent = question.text;
        questionDiv.appendChild(questionText);

        // 阅读内容
        const readingContent = document.createElement('div');
        readingContent.className = 'reading-content';
        readingContent.textContent = question.content;
        questionDiv.appendChild(readingContent);

        // 阅读问题和选项
        question.questions.forEach((q, qIdx) => {
            const subQuestion = document.createElement('div');
            subQuestion.className = 'sub-question';

            const subQuestionText = document.createElement('div');
            subQuestionText.className = 'question-text';
            subQuestionText.textContent = `${index + 1}.${qIdx + 1} ${q.text}`;
            subQuestion.appendChild(subQuestionText);

            const options = document.createElement('div');
            options.className = 'options';

            q.options.forEach((option, optionIdx) => {
                const label = document.createElement('label');
                label.className = 'option';

                const answerId = `${index}-${qIdx}-${optionIdx}`;
                const userAnswerIndex = userAnswers[index] ? userAnswers[index][qIdx] : null;

                if (userAnswerIndex === optionIdx) {
                    label.classList.add('selected');
                }

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question-${index}-${qIdx}`;
                input.value = optionIdx;
                input.style.display = 'none';
                input.checked = userAnswerIndex === optionIdx;

                input.addEventListener('change', () => {
                    // 为阅读理解问题设置答案
                    if (!userAnswers[index]) {
                        userAnswers[index] = Array(question.questions.length).fill(null);
                    }
                    userAnswers[index][qIdx] = optionIdx;

                    // 更新选中样式
                    options.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                    label.classList.add('selected');

                    // 更新进度
                    updateProgress();
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                options.appendChild(label);
            });

            subQuestion.appendChild(options);
            questionDiv.appendChild(subQuestion);
        });
    } else if (question.type === 'listening') {
        // 听力类型
        questionText.textContent = question.text;
        questionDiv.appendChild(questionText);

        // 音频控件
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-container';

        const audioBtn = document.createElement('button');
        audioBtn.className = 'audio-btn';
        audioBtn.innerHTML = '<i class="fas fa-play">▶</i>';

        const audio = new Audio(question.audio);

        audioBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                audioBtn.innerHTML = '<i class="fas fa-pause">❚❚</i>';
            } else {
                audio.pause();
                audio.currentTime = 0;
                audioBtn.innerHTML = '<i class="fas fa-play">▶</i>';
            }
        });

        audio.addEventListener('ended', () => {
            audioBtn.innerHTML = '<i class="fas fa-play">▶</i>';
        });

        audioContainer.appendChild(audioBtn);
        audioContainer.appendChild(document.createTextNode('点击播放音频'));
        questionDiv.appendChild(audioContainer);

        // 选项
        const options = document.createElement('div');
        options.className = 'options';

        question.options.forEach((option, optionIdx) => {
            const label = document.createElement('label');
            label.className = 'option';

            if (userAnswers[index] === optionIdx) {
                label.classList.add('selected');
            }

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = optionIdx;
            input.style.display = 'none';
            input.checked = userAnswers[index] === optionIdx;

            input.addEventListener('change', () => {
                userAnswers[index] = optionIdx;
                options.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');
                updateProgress();
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            options.appendChild(label);
        });

        questionDiv.appendChild(options);
    } else {
        // 常规多选题
        questionText.textContent = `${index + 1}. ${question.text}`;
        questionDiv.appendChild(questionText);

        const options = document.createElement('div');
        options.className = 'options';

        question.options.forEach((option, optionIdx) => {
            const label = document.createElement('label');
            label.className = 'option';

            if (userAnswers[index] === optionIdx) {
                label.classList.add('selected');
            }

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = optionIdx;
            input.style.display = 'none';
            input.checked = userAnswers[index] === optionIdx;

            input.addEventListener('change', () => {
                userAnswers[index] = optionIdx;
                options.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                label.classList.add('selected');
                updateProgress();
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            options.appendChild(label);
        });

        questionDiv.appendChild(options);
    }

    testContainer.appendChild(questionDiv);

    // 更新导航按钮状态
    updateNavigationButtons();
}

// 更新导航按钮
function updateNavigationButtons() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === questions.length - 1;
}

// 上一题
function goToPrevQuestion() {
    if (currentPage > 0) {
        currentPage--;
        renderQuestion(currentPage);
        updateActivePageBtn();
    }
}

// 下一题
function goToNextQuestion() {
    if (currentPage < questions.length - 1) {
        currentPage++;
        renderQuestion(currentPage);
        updateActivePageBtn();
    }
}

// 更新进度
function updateProgress() {
    let answeredCount = 0;
    let totalQuestions = 0;

    for (let i = 0; i < questions.length; i++) {
        if (questions[i].type === 'reading') {
            totalQuestions += questions[i].questions.length;
            if (userAnswers[i]) {
                answeredCount += userAnswers[i].filter(a => a !== null).length;
            }
        } else {
            totalQuestions++;
            if (userAnswers[i] !== null) {
                answeredCount++;
            }
        }
    }

    const percent = (answeredCount / totalQuestions) * 100;
    progressBar.style.width = `${percent}%`;
}

// 启动计时器
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitTest();
        }
    }, 1000);
}

// 提交测试
function submitTest() {
    // 计算未回答的题目数量
    let unanswered = 0;
    let totalQuestions = 0;

    for (let i = 0; i < questions.length; i++) {
        if (questions[i].type === 'reading') {
            totalQuestions += questions[i].questions.length;
            if (!userAnswers[i]) {
                unanswered += questions[i].questions.length;
            } else {
                unanswered += userAnswers[i].filter(a => a === null).length;
            }
        } else {
            totalQuestions++;
            if (userAnswers[i] === null) {
                unanswered++;
            }
        }
    }

    if (unanswered > 0) {
        const proceed = confirm(`您还有 ${unanswered} 题未回答，确定要提交吗？`);
        if (!proceed) return;
    }

    // 停止计时器
    clearInterval(timer);

    // 计算分数并显示结果
    calculateAndDisplayResults();

    // 隐藏测试界面，显示结果
    testContainer.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    pagination.style.display = 'none';
    resultsContainer.classList.remove('hidden');
}

// 计算并显示结果
function calculateAndDisplayResults() {
    // 按类别计算正确答案
    const categories = {
        vocabulary: { total: 0, correct: 0, questions: [] },
        grammar: { total: 0, correct: 0, questions: [] },
        reading: { total: 0, correct: 0, questions: [] },
        listening: { total: 0, correct: 0, questions: [] }
    };

    let totalQuestions = 0;
    let totalCorrect = 0;

    // 统计各类题目的数量和正确率
    for (let i = 0; i < questions.length; i++) {
        const category = questions[i].category;

        if (questions[i].type === 'reading') {
            categories[category].questions.push(questions[i]);
            for (let j = 0; j < questions[i].questions.length; j++) {
                categories[category].total++;
                totalQuestions++;

                if (userAnswers[i] && userAnswers[i][j] === questions[i].questions[j].correct) {
                    categories[category].correct++;
                    totalCorrect++;
                }
            }
        } else {
            categories[category].questions.push(questions[i]);
            categories[category].total++;
            totalQuestions++;

            if (userAnswers[i] === questions[i].correct) {
                categories[category].correct++;
                totalCorrect++;
            }
        }
    }

    // 计算总分和各类别分数
    const totalScore = Math.round((totalCorrect / totalQuestions) * 100);
    const categoryScores = {};

    for (const cat in categories) {
        const { total, correct } = categories[cat];
        if (total > 0) {
            categoryScores[cat] = Math.round((correct / total) * 100);
        } else {
            categoryScores[cat] = 0;
        }
    }

    // 显示总分
    document.getElementById('totalScore').textContent = totalScore;

    // 设置总体水平
    const totalLevel = getLevelText(totalScore);
    document.getElementById('totalLevel').textContent = totalLevel;

    // 设置各类别评价
    setStarsAndFeedback('vocabularyResult', categoryScores.vocabulary);
    setStarsAndFeedback('grammarResult', categoryScores.grammar);
    setStarsAndFeedback('readingResult', categoryScores.reading);
    setStarsAndFeedback('listeningResult', categoryScores.listening);

    // 设置整体评价
    setOverallFeedback(categoryScores, totalScore);

    // 绘制图表
    drawChart(categoryScores);
}

// 获取级别文字描述
function getLevelText(score) {
    if (score >= 90) return '优秀 (A)';
    if (score >= 80) return '良好 (B)';
    if (score >= 70) return '中等 (C)';
    if (score >= 60) return '及格 (D)';
    return '需要提高 (E)';
}

// 设置星级和反馈
function setStarsAndFeedback(elementId, score) {
    const element = document.getElementById(elementId);
    const starsDiv = element.querySelector('.stars');
    const feedbackP = element.querySelector('.feedback');

    // 设置星星
    const starCount = Math.round(score / 20); // 1-5星
    starsDiv.innerHTML = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);

    // 设置反馈文字
    let feedback = '';

    switch (elementId) {
        case 'vocabularyResult':
            if (score >= 80) feedback = '词汇量丰富，能够理解和使用大部分日常词汇。';
            else if (score >= 60) feedback = '掌握了基本词汇，但需要扩展词汇量。';
            else feedback = '词汇量有限，建议加强词汇学习，多阅读英文材料。';
            break;

        case 'grammarResult':
            if (score >= 80) feedback = '语法掌握扎实，能够构建正确的句子。';
            else if (score >= 60) feedback = '基本语法规则理解正确，但在复杂结构上有困难。';
            else feedback = '语法基础薄弱，建议复习基本语法规则，做更多练习。';
            break;

        case 'readingResult':
            if (score >= 80) feedback = '阅读理解能力强，能够理解文章主要内容和细节。';
            else if (score >= 60) feedback = '能够理解基本内容，但对细节把握不够。';
            else feedback = '阅读理解能力需要提高，建议多阅读简单英文文章，逐步提升难度。';
            break;

        case 'listeningResult':
            if (score >= 80) feedback = '听力理解能力强，能够准确捕捉关键信息。';
            else if (score >= 60) feedback = '能够理解基本对话，但在速度较快或复杂内容时有困难。';
            else feedback = '听力基础需要加强，建议多听英语材料，从慢速开始，逐步提高难度。';
            break;
    }

    feedbackP.textContent = feedback;
}

// 设置整体评价
function setOverallFeedback(categoryScores, totalScore) {
    const feedbackElement = document.getElementById('overallFeedback');

    let strengths = [];
    let weaknesses = [];

    // 分析优势和弱势
    for (const category in categoryScores) {
        const score = categoryScores[category];
        if (score >= 75) {
            switch (category) {
                case 'vocabulary': strengths.push('词汇运用'); break;
                case 'grammar': strengths.push('语法结构'); break;
                case 'reading': strengths.push('阅读理解'); break;
                case 'listening': strengths.push('听力理解'); break;
            }
        } else if (score < 60) {
            switch (category) {
                case 'vocabulary': weaknesses.push('词汇量'); break;
                case 'grammar': weaknesses.push('语法'); break;
                case 'reading': weaknesses.push('阅读能力'); break;
                case 'listening': weaknesses.push('听力'); break;
            }
        }
    }

    // 生成反馈文本
    let feedback = '';

    if (totalScore >= 80) {
        feedback = `您的英语水平优秀，`;
    } else if (totalScore >= 70) {
        feedback = `您的英语水平良好，`;
    } else if (totalScore >= 60) {
        feedback = `您的英语水平达到基本要求，`;
    } else {
        feedback = `您的英语水平需要进一步提高，`;
    }

    if (strengths.length > 0) {
        feedback += `在${strengths.join('、')}方面表现突出，`;
    }

    if (weaknesses.length > 0) {
        feedback += `但在${weaknesses.join('、')}方面还需要加强。`;

        // 添加改进建议
        feedback += '建议：';
        weaknesses.forEach(weakness => {
            switch (weakness) {
                case '词汇量':
                    feedback += '多记忆常用词汇，做词汇练习，阅读英文文章扩充词汇量；';
                    break;
                case '语法':
                    feedback += '复习基础语法规则，做针对性语法练习，注意在写作和口语中应用；';
                    break;
                case '阅读能力':
                    feedback += '养成每天阅读英文材料的习惯，从简单文章开始，逐步提升难度；';
                    break;
                case '听力':
                    feedback += '多听英语听力材料，如英文歌曲、新闻、电影等，训练耳朵对英语的敏感度；';
                    break;
            }
        });
    } else {
        feedback += '各方面能力均衡发展。建议继续保持学习热情，挑战更高难度的英语材料，进一步提升英语综合能力。';
    }

    feedbackElement.textContent = feedback;
}

// 绘制图表
function drawChart(categoryScores) {
    const ctx = document.getElementById('scoreChart').getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['词汇', '语法', '阅读理解', '听力'],
            datasets: [{
                label: '得分',
                data: [
                    categoryScores.vocabulary,
                    categoryScores.grammar,
                    categoryScores.reading,
                    categoryScores.listening
                ],
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                borderColor: 'rgba(25, 118, 210, 1)',
                pointBackgroundColor: 'rgba(25, 118, 210, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(25, 118, 210, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 重新测试
function restartTest() {
    // 重置状态
    currentPage = 0;
    userAnswers = Array(questions.length).fill(null);
    timeLeft = 30 * 60;

    // 重设界面
    resultsContainer.classList.add('hidden');
    testContainer.style.display = 'block';
    startScreen.style.display = 'block';

    // 重置进度条
    progressBar.style.width = '0%';

    // 重置计时器显示
    timerDisplay.textContent = '时间: 30:00';
}
