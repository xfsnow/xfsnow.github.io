// 定义画布和上下文
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 定义蛇的初始位置和长度
let snake = [{ x: 200, y: 200 }];
let snakeLength = 5;

// 定义蛇的移动方向
let direction = "right";

// 定义食物的位置和大小
let food = { x: 0, y: 0 };
let foodSize = 20;

// 定义障碍物数组和大小
let obstacles = [
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  { x: 300, y: 300 },
];
let obstacleSize = 20;

// 定义游戏是否结束的标志
let gameOver = false;

// 绘制蛇、食物和障碍物
function draw() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制蛇
  ctx.fillStyle = "green";
  snake.forEach((segment) => {
    ctx.fillRect(segment.x, segment.y, 20, 20);
  });

  // 绘制食物
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, foodSize, foodSize);

  // 绘制障碍物
  ctx.fillStyle = "gray";
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, obstacleSize, obstacleSize);
  });
}

// 更新蛇的位置和长度
function update() {
  // 计算蛇头的新位置
  let head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      head.y -= 20;
      break;
    case "down":
      head.y += 20;
      break;
    case "left":
      head.x -= 20;
      break;
    case "right":
      head.x += 20;
      break;
  }

  // 将蛇头添加到蛇的数组中
  snake.unshift(head);

  // 检查是否吃到了食物
  if (head.x === food.x && head.y === food.y) {
    // 生成新的食物位置
    food.x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
    food.y = Math.floor(Math.random() * (canvas.height / 20)) * 20;

    // 增加蛇的长度
    snakeLength++;
  } else {
    // 如果没有吃到食物，则移除蛇尾
    snake.pop();
  }

  // 检查是否碰到了墙壁
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    gameOver = true;
  }

  // 检查是否碰到了自己的身体
  if (
    snake.slice(1).some((segment) => head.x === segment.x && head.y === segment.y)
  ) {
    gameOver = true;
  }

  // 检查是否碰到了任何一个障碍物
  if (
    obstacles.some((obstacle) => head.x === obstacle.x && head.y === obstacle.y)
  ) {
    gameOver = true;
  }
}

// 处理键盘事件，改变蛇的移动方向
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      direction = "up";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
    case "ArrowRight":
      direction = "right";
      break;
  }
});

// 游戏循环
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    setTimeout(gameLoop, 500);
  } else {
    alert("Game over!");
  }
}

// 初始化游戏
function init() {
  // 生成初始食物位置
  food.x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
  food.y = Math.floor(Math.random() * (canvas.height / 20)) * 20;

  // 开始游戏循环
  gameLoop();
}

// 启动游戏
init();