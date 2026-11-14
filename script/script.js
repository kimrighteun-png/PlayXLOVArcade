
// Данные четвёрки для карусели



const CHARACTERS = [
    {
        id: 'wumuti',
        name: 'WUMUTI',
        desc: 'Тёмный клинок. Мощный ближний бой с двойными очками.',
        img: 'media/Wumuti.png'
    },
    {
        id: 'rui',
        name: 'RUI',
        desc: 'Розовый пикми-огнестрел. Быстрые прямые выстрелы.',
        img: 'media/Rui.png'
    },
    {
        id: 'hyun',
        name: 'HYUN',
        desc: 'Крио-жезл. Выпускает разряд, замедляющий врагов.',
        img: 'media/Hyun.png'
    },
    {
        id: 'haru',
        name: 'HARU',
        desc: 'Лук. Удерживай кнопку атаки для мощного выстрела.',
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
