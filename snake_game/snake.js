// 获取画布元素
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 定义蛇的初始位置和大小
let snake = [{ x: 0, y: 0 }];
let snakeSize = 20;

// 定义食物的初始位置和大小
let food = { x: 200, y: 200 };
let foodSize = 20;

// 定义蛇的移动方向
let direction = "right";

// 定义游戏是否结束的标志
let gameOver = false;

// 绘制蛇和食物
function draw() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制蛇
  ctx.fillStyle = "green";
  snake.forEach((part) => {
    ctx.fillRect(part.x, part.y, snakeSize, snakeSize);
  });

  // 绘制食物
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, foodSize, foodSize);
}

// 更新蛇的位置
function update() {
  // 根据移动方向更新蛇头位置
  let head = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      head.y -= snakeSize;
      break;
    case "down":
      head.y += snakeSize;
      break;
    case "left":
      head.x -= snakeSize;
      break;
    case "right":
      head.x += snakeSize;
      break;
  }

  // 将蛇头添加到蛇的数组中
  snake.unshift(head);

  // 如果蛇头和食物重合，则吃掉食物并重新生成一个新的食物
  if (head.x === food.x && head.y === food.y) {
    food.x = Math.floor(Math.random() * canvas.width / snakeSize) * snakeSize;
    food.y = Math.floor(Math.random() * canvas.height / snakeSize) * snakeSize;
  } else {
    // 如果没有吃到食物，则移除蛇尾
    snake.pop();
  }

  // 检查是否碰到了墙壁或自己的身体
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    snake.slice(1).some((part) => part.x === head.x && part.y === head.y)
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
    setTimeout(gameLoop, 200);
  } else {
    alert("Game Over!");
  }
}

// 启动游戏循环
gameLoop();