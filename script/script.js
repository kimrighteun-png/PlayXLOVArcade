
// Данные четвёрки для карусели



const CHARACTERS = [
    {
        id: 'wumuti',
        name: 'WUMUTI',
        desc: 'Swings his sword in close range to instantly defeat enemies in front of him, dealing a lethal 3 HP one-shot blow.',
        img: 'media/Wumuti.png'
    },
    {
        id: 'rui',
        name: 'RUI',
        desc: 'Fires rapid star shots straight down his lane, dealing 1 HP of damage per hit and taking three shots to defeat an enemy.',
        img: 'media/Rui.png'
    },
    {
        id: 'hyun',
        name: 'HYUN',
        desc: 'Strikes enemies in close range with his bat for 1.5 HP of damage while knocking them back toward the right edge of the screen.',
        img: 'media/Hyun.png'
    },
    {
        id: 'haru',
        name: 'HARU',
        desc: 'Fires quick arrows for 0.5 HP on a tap, or holds FIRE to charge a powerful shot dealing from 1 to 3 HP depending on the draw.',
        img: 'media/Haru.png'
    }
];

let currentCharIndex = 0; 

// Функция смены экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Обновление карточки в карусели
function updateCharacterCard() {
    const char = CHARACTERS[currentCharIndex];
    
    
    document.getElementById('char-name').textContent = char.name;
    document.getElementById('char-desc').textContent = char.desc;
    
    const preview = document.getElementById('char-preview');
    preview.src = char.img;
}

// Кнопка START -> открывает экран выбора персонажа
document.getElementById('start-btn').addEventListener('click', () => {
    updateCharacterCard();
    showScreen('character-select');
});

// Стрелка влево (<)
document.getElementById('btn-prev').addEventListener('click', () => {
    currentCharIndex--;
    if (currentCharIndex < 0) {
        currentCharIndex = CHARACTERS.length - 1;
    }
    updateCharacterCard();
});

// Стрелка вправо (>)
document.getElementById('btn-next').addEventListener('click', () => {
    currentCharIndex++;
    if (currentCharIndex >= CHARACTERS.length) {
        currentCharIndex = 0;
    }
    updateCharacterCard();
});

// Кнопка PLAY -> открывает игровой экран
document.getElementById('btn-start-game').addEventListener('click', () => {
    showScreen('screen-game');
});



const bgmMenu = document.getElementById('bgmMenu');
const bgmGame = document.getElementById('bgmGame');
const soundBtn = document.getElementById('sound');
const soundIcon = document.getElementById('sound-icon');
let isMuted = false;

// При первом клике в любое место экрана включается Чивава
document.addEventListener('click', () => {
    if (!isMuted && bgmMenu.paused && bgmGame.paused) {
        bgmMenu.play();
    }
    const elem = document.documentElement;
    if (!document.fullscreenElement && elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
    }
}, { once: true });

// Кнопка с нотой включает и выключает звук
soundBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    isMuted = !isMuted;

    if (isMuted) {
        bgmMenu.pause();
        bgmGame.pause();
        soundIcon.src = 'media/music-off.png';
    } else {
        soundIcon.src = 'media/music-on.png';
        if (document.getElementById('screen-game').classList.contains('active')) {
            bgmGame.play();
        } else {
            bgmMenu.play();
        }
    }
});

// При нажатии на PLAY останавливаем Чиваву и включаем Biii:-P
document.getElementById('btn-start-game').addEventListener('click', () => {
    bgmMenu.pause();
    bgmMenu.currentTime = 0;
    if (!isMuted) {
        bgmGame.play();
    }
});

document.getElementById('back').addEventListener('click', () => {
    showScreen('character-select');
    bgmGame.pause();
    bgmGame.currentTime = 0;
    if (!isMuted) {
        bgmMenu.play();
    }
});


window.addEventListener('orientationchange', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
});















// === ИГРОВОЕ ПОЛЕ НА 8 ДОРОЖЕК, ВРАГИ И ЖИЗНИ ===
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const LANES = 8;
let currentLane = 3;
let gameRunning = false;

let lives = 5;
let score = 0;
let enemies = [];
let swingTimer = 0; // Таймер анимации удара мечом

let bullets = [];
const ruiBulletImg = new Image();
ruiBulletImg.src = 'media/star.png';

let arrows = [];
let haruChargeStart = 0;
const haruArrowImg = new Image();
haruArrowImg.src = 'media/arrow.png';

// Функция атаки (сработает при нажатии на FIRE или Пробел)
function triggerAttack() {
    if (!gameRunning) return;

    const selectedChar = CHARACTERS[currentCharIndex];

    // Атака Умути (ближний бой с ваншотом)
    if (selectedChar.id.toLowerCase() === 'wumuti') {
        swingTimer = 12; // Запускаем наклон меча на 12 кадров

        // Зона удара меча перед Умути
        const hitStartX = canvas.width * 0.20;
        const hitEndX = canvas.width * 0.36;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.lane === currentLane && enemy.x >= hitStartX && enemy.x <= hitEndX) {
                enemy.hp -= 3; // Ваншот на все 3 HP!
                if (enemy.hp <= 0) {
                    enemies.splice(i, 1);
                    score += 1;
                    document.getElementById('score-display').textContent = 'SCORE: ' + score;
                }
                break; // За один взмах срубаем одного врага
            }
        }
    }
    // Атака Руи (выпуск звёздочки по прямой на 1 урон)
    if (selectedChar.id.toLowerCase() === 'rui') {
        bullets.push({
            lane: currentLane,
            x: canvas.width * 0.28,
            speed: canvas.width * 0.014
        });
    }
    // Атака Хёна (удар битой на 1.5 HP + отбрасывание врага назад)
    if (selectedChar.id.toLowerCase() === 'hyun') {
        swingTimer = 12; // Запускаем взмах битой на 105 градусов

        const hitStartX = canvas.width * 0.19;
        const hitEndX = canvas.width * 0.38;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.lane === currentLane && enemy.x >= hitStartX && enemy.x <= hitEndX) {
                enemy.hp -= 1.5; // Сносим половину HP (2 удара на врага)

                if (enemy.hp <= 0) {
                    enemies.splice(i, 1);
                    score += 1;
                    document.getElementById('score-display').textContent = 'SCORE: ' + score;
                } else {
                    // Отбрасываем врага обратно вправо на 25% экрана!
                    enemy.x += canvas.width * 0.25;
                }
                break;
            }
        }
    }
}

// Загружаем спрайты всей четвёрки
const playerSprites = {};
CHARACTERS.forEach(char => {
    const img = new Image();
    img.src = char.img;
    playerSprites[char.id] = img;
});

// Загружаем спрайт злого сердечка (ПРОВЕРЬ ИМЯ ФАЙЛА!)
const enemyImg = new Image();
enemyImg.src = 'media/enemy.png';


const weaponSprites = {};
const weaponFiles = {
    wumuti: 'media/Wumuti-weapon.png',
    rui: 'media/Rui-weapon.png',
    hyun: 'media/Hyun-weapon.png',
    haru: 'media/Haru-weapon.png'
};

for (let id in weaponFiles) {
    const img = new Image();
    img.src = weaponFiles[id];
    weaponSprites[id] = img;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function moveUp() {
    if (gameRunning && currentLane > 0) currentLane--;
}

function moveDown() {
    if (gameRunning && currentLane < LANES - 1) currentLane++;
}

// Мгновенный мультитач для телефона (срабатывает при касании, не дожидаясь отпускания)
document.getElementById('btn-up').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    moveUp();
});

document.getElementById('btn-down').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    moveDown();
});

document.getElementById('btn-attack').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (CHARACTERS[currentCharIndex].id.toLowerCase() === 'haru') {
        if (gameRunning && haruChargeStart === 0) haruChargeStart = performance.now();
    } else {
        triggerAttack();
    }
});

document.getElementById('btn-attack').addEventListener('pointerup', (e) => {
    e.preventDefault();
    if (CHARACTERS[currentCharIndex].id.toLowerCase() === 'haru') {
        releaseHaruArrow();
    }
});


// Одновременная работа клавиш на клавиатуре ноутбука
document.addEventListener('keydown', (e) => {
    if (!gameRunning || e.repeat) return; // e.repeat запрещает зажатие, оставляя чистые нажатия

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц') {
        e.preventDefault();
        moveUp();
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
        e.preventDefault();
        moveDown();
    }
       if (e.code === 'Space') {
        e.preventDefault();
        if (CHARACTERS[currentCharIndex].id.toLowerCase() === 'haru') {
            if (haruChargeStart === 0) haruChargeStart = performance.now();
        } else {
            triggerAttack();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && CHARACTERS[currentCharIndex].id.toLowerCase() === 'haru') {
        releaseHaruArrow();
    }
});

function releaseHaruArrow() {
    if (!gameRunning || haruChargeStart === 0) return;
    const holdSeconds = (performance.now() - haruChargeStart) / 1000;
    haruChargeStart = 0;

    let dmg = 0.5;
    if (holdSeconds >= 1.0) dmg = 3;
    else if (holdSeconds >= 0.66) dmg = 2;
    else if (holdSeconds >= 0.33) dmg = 1;

    arrows.push({
        lane: currentLane,
        x: canvas.width * 0.26,
        speed: canvas.width * 0.015,
        damage: dmg
    });
}


// Обновляем отображение 5 сердечек наверху
function updateHeartsUI() {
    const heartIcons = document.querySelectorAll('#hearts-display .heart-icon');
    heartIcons.forEach((icon, index) => {
        icon.style.visibility = index < lives ? 'visible' : 'hidden';
    });
}

// Сброс и старт новой игры
function startNewGame() {
    if (document.activeElement) document.activeElement.blur();
    resizeCanvas();
    currentLane = 3;
    lives = 5;
    score = 0;
    enemies = [];
    bullets = [];
    arrows = [];
    haruChargeStart = 0;
    spawnTimer = 0;
    updateHeartsUI();
    document.getElementById('score-display').textContent = 'SCORE: 0';
    document.getElementById('game-over-modal').style.display = 'none';
    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const topLimit = canvas.height * 0.15;
    const bottomLimit = canvas.height * 0.78;
    const laneHeight = (bottomLimit - topLimit) / LANES;

    // 1. Рисуем выбранного чибика
    const selectedChar = CHARACTERS[currentCharIndex];
    const sprite = playerSprites[selectedChar.id];
    const playerX = canvas.width * 0.16;

    if (sprite && sprite.complete) {
        const charHeight = canvas.height * 0.22;
        const aspect = sprite.naturalWidth / sprite.naturalHeight || 0.8;
        const charWidth = charHeight * aspect;
        const laneCenterY = topLimit + laneHeight * (currentLane + 0.5);
        const playerY = laneCenterY - charHeight / 2;

        ctx.drawImage(sprite, playerX, playerY, charWidth, charHeight);
        const weaponImg = weaponSprites[selectedChar.id.toLowerCase()];
        const isRui = selectedChar.id.toLowerCase() === 'rui';
        const weaponHeight = isRui ? canvas.height * 0.08 : canvas.height * 0.14;
        const weaponX = playerX + charWidth + (canvas.width * 0.01);
        const weaponY = laneCenterY - weaponHeight / 2;

        if (weaponImg && weaponImg.complete && weaponImg.naturalWidth > 0) {
            const wAspect = weaponImg.naturalWidth / weaponImg.naturalHeight || 0.6;
            const weaponWidth = weaponHeight * wAspect;

            ctx.save();
            const pivotX = weaponX + weaponWidth / 2;
            const pivotY = weaponY + weaponHeight * 0.85;
            ctx.translate(pivotX, pivotY);

            if (swingTimer > 0) {
                ctx.rotate((105 * Math.PI) / 180);
                swingTimer--;
            }

            ctx.drawImage(weaponImg, -weaponWidth / 2, -weaponHeight * 0.85, weaponWidth, weaponHeight);
            ctx.restore();
                        // Цветная шкала натяжения лука Хару при удержании
            if (selectedChar.id.toLowerCase() === 'haru' && haruChargeStart > 0) {
                const holdSec = Math.min((performance.now() - haruChargeStart) / 1000, 1.0);
                const barW = weaponHeight * 0.8;
                const barH = 6;
                const barX = weaponX;
                const barY = weaponY - 10;

                ctx.fillStyle = '#000000';
                ctx.fillRect(barX, barY, barW, barH);

                // Голубой (1 HP) -> Жёлтый (2 HP) -> Зелёный (3 HP / ваншот!)
                ctx.fillStyle = holdSec >= 1.0 ? '#4ade80' : (holdSec >= 0.66 ? '#facc15' : '#38bdf8');
                ctx.fillRect(barX, barY, barW * holdSec, barH);
            }

        }
}
    

    // 2. Создаём нового врага каждые ~90 кадров (примерно раз в 1.5 секунды)
    spawnTimer++;
    if (spawnTimer >= 30) {
        spawnTimer = 0;
        const randomLane = Math.floor(Math.random() * LANES);
        enemies.push({
            lane: randomLane,
            x: canvas.width + 50,
            speed: canvas.width * 0.006, // Скорость полёта справа налево
            hp: 3
        });
    }

    // 3. Двигаем врагов и проверяем левую границу
    const enemySize = canvas.height * 0.09;
    const failLineX = canvas.width * 0.20; // Граница за спиной игрока

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x -= enemy.speed;

        const laneCenterY = topLimit + laneHeight * (enemy.lane + 0.5);
        const enemyY = laneCenterY - enemySize / 2;

        if (enemyImg.complete) {
            ctx.drawImage(enemyImg, enemy.x, enemyY, enemySize, enemySize);

            // Мини-полоска HP над врагом
            const barWidth = enemySize;
            const barHeight = 5;
            const barY = enemyY - 8;

            ctx.fillStyle = '#000000'; // Тёмная подложка
            ctx.fillRect(enemy.x, barY, barWidth, barHeight);

            ctx.fillStyle = '#ff66a3'; // Розовая шкала здоровья
            ctx.fillRect(enemy.x, barY, barWidth * (enemy.hp / 3), barHeight);
        }
        

        // Если враг пересек границу и не был побеждён
        if (enemy.x < failLineX) {
            enemies.splice(i, 1);
            lives--;
            updateHeartsUI();

            // Проверяем проигрыш
            if (lives <= 0) {
                gameRunning = false;
                document.getElementById('final-score').textContent = 'SCORE: ' + score;
                document.getElementById('game-over-modal').style.display = 'block';
                return;
            }
        }
    }
    // 4. Двигаем звёздочки-патроны Руи и проверяем попадания
    const bulletSize = canvas.height * 0.05;

    for (let b = bullets.length - 1; b >= 0; b--) {
        const bullet = bullets[b];
        bullet.x += bullet.speed;

        const laneCenterY = topLimit + laneHeight * (bullet.lane + 0.5);
        const bulletY = laneCenterY - bulletSize / 2;

        if (ruiBulletImg.complete && ruiBulletImg.naturalWidth > 0) {
            ctx.drawImage(ruiBulletImg, bullet.x, bulletY, bulletSize, bulletSize);
        }

        if (bullet.x > canvas.width + 50) {
            bullets.splice(b, 1);
            continue;
        }

        for (let e = enemies.length - 1; e >= 0; e--) {
            const enemy = enemies[e];
            if (enemy.lane === bullet.lane && bullet.x + bulletSize >= enemy.x && bullet.x <= enemy.x + enemySize) {
                bullets.splice(b, 1);
                enemy.hp -= 1;

                if (enemy.hp <= 0) {
                    enemies.splice(e, 1);
                    score += 1;
                    document.getElementById('score-display').textContent = 'SCORE: ' + score;
                }
                break;
            }
        }
    }
    // 5. Двигаем стрелы Хару и проверяем попадания
    const arrowHeight = canvas.height * 0.035;
    const arrowWidth = arrowHeight * 3.2;

    for (let a = arrows.length - 1; a >= 0; a--) {
        const arrow = arrows[a];
        arrow.x += arrow.speed;

        const laneCenterY = topLimit + laneHeight * (arrow.lane + 0.5);
        const arrowY = laneCenterY - arrowHeight / 2;

        if (haruArrowImg.complete && haruArrowImg.naturalWidth > 0) {
            ctx.drawImage(haruArrowImg, arrow.x, arrowY, arrowWidth, arrowHeight);
        }

        if (arrow.x > canvas.width + 60) {
            arrows.splice(a, 1);
            continue;
        }

        for (let e = enemies.length - 1; e >= 0; e--) {
            const enemy = enemies[e];
            if (enemy.lane === arrow.lane && arrow.x + arrowWidth >= enemy.x && arrow.x <= enemy.x + enemySize) {
                arrows.splice(a, 1);
                enemy.hp -= arrow.damage;

                if (enemy.hp <= 0) {
                    enemies.splice(e, 1);
                    score += 1;
                    document.getElementById('score-display').textContent = 'SCORE: ' + score;
                }
                break;
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

document.getElementById('btn-start-game').addEventListener('click', startNewGame);
document.getElementById('btn-restart').addEventListener('click', startNewGame);

document.getElementById('back').addEventListener('click', () => {
    gameRunning = false;
    document.getElementById('game-over-modal').style.display = 'none';
});