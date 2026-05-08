// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleHeight = 100;
const paddleWidth = 10;
const ballSize = 8;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4.5,
    score: 0,
    reactionDelay: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    maxSpeed: 8
};

// Keyboard state
const keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Smoothly move paddle toward mouse position
    const centerY = player.y + paddleHeight / 2;
    const distance = mouseY - centerY;
    
    if (Math.abs(distance) > 5) {
        player.dy = distance > 0 ? player.speed : -player.speed;
    } else {
        player.dy = 0;
    }
});

document.getElementById('resetBtn').addEventListener('click', resetGame);

// Update game state
function update() {
    // Player movement with keyboard
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.dy = -player.speed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.dy = player.speed;
    }

    // Update player position
    player.y += player.dy;
    
    // Keep player in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Computer AI with reaction delay
    computer.reactionDelay--;
    if (computer.reactionDelay <= 0) {
        const computerCenterY = computer.y + computer.height / 2;
        const distance = ball.y - computerCenterY;
        
        if (Math.abs(distance) > 15) {
            computer.dy = distance > 0 ? computer.speed : -computer.speed;
            computer.reactionDelay = 2;
        } else {
            computer.dy = 0;
        }
    }

    // Update computer position
    computer.y += computer.dy;
    
    // Keep computer in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }

    // Ball physics
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Ball collision with paddles
    if (checkPaddleCollision(player)) {
        ball.dx = -ball.dx;
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy = (deltaY / (player.height / 2)) * ball.maxSpeed;
        ball.x = player.x + player.width + ball.size;
    }

    if (checkPaddleCollision(computer)) {
        ball.dx = -ball.dx;
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = (deltaY / (computer.height / 2)) * ball.maxSpeed;
        ball.x = computer.x - ball.size;
    }

    // Ball out of bounds - scoring
    if (ball.x + ball.size < 0) {
        computer.score++;
        resetBall();
        updateScore();
    }

    if (ball.x - ball.size > canvas.width) {
        player.score++;
        resetBall();
        updateScore();
    }
}

// Collision detection
function checkPaddleCollision(paddle) {
    return (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const speed = 5;
    ball.dx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = Math.sin(angle) * speed;
}

// Reset entire game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    updateScore();
}

// Update scoreboard
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    drawPaddle(player);

    // Draw computer paddle
    drawPaddle(computer);

    // Draw ball
    drawBall();
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
updateScore();
