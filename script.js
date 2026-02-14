var canvas = document.getElementById("starfield");
var context = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

var stars = 500;
var colorrange = [0, 60, 240];
var starArray = [];
var frameNumber = 0;
var opacity = 0;
var secondOpacity = 0;
// var thirdOpacity = 0; // Biến này chưa dùng đến, có thể bỏ

// Các trạng thái game
const STATE_LOGIN = -1;
const STATE_HEART = 0;
const STATE_QUIZ = 1;
const STATE_TEXT = 2;
const STATE_MAP = 3;
const STATE_LOVE_QUESTION = 4;

let gameState = STATE_LOGIN;
let heartParticles = [];

const loveLevels = [
    { title: "Will you be my Valentine? 🌹", btn: "Yes, I will! ❤️" },
    { title: "Do you love me?", btn: "Okay, yes I love you" },
    { title: "I love you more!", btn: "I love you most" },
    { title: "I love you more than you love me most!", btn: "I love you most than you love me more than i love you most" },
    { title: "I love you more than you love me most than i love you most!", btn: "I love you most than you love me more than i love you most than you love me more than i love you most" },
    { title: "I love you more than you love me most than i love you most than you love me more than i love you most!", btn: "I love you most than you love me more than i love you most than you love me more than i love you most than you love me more than i love you most" }
];
let currentLoveLevel = 0;

const startButton = document.getElementById("startButton");
const loginContainer = document.getElementById("loginContainer");
const submitDateButton = document.getElementById("submitDate");
const dateInputs = document.querySelectorAll(".date-input");
const quizContainer = document.getElementById("quizContainer");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const scoreContainer = document.getElementById("scoreContainer");
const scoreText = document.getElementById("scoreText");
const finishQuizButton = document.getElementById("finishQuiz");
const loveQuestionContainer = document.getElementById("loveQuestionContainer");
const questionTitleEl = document.getElementById("questionTitle");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initStars() {
    starArray = [];
    for (var i = 0; i < stars; i++) {
        var x = Math.random() * canvas.width;
        var y = Math.random() * canvas.height;
        var radius = Math.random() * 1.2;
        var hue = colorrange[getRandom(0, colorrange.length - 1)];
        var sat = getRandom(50, 100);
        var opacity = Math.random();
        starArray.push({ x, y, radius, hue, sat, opacity });
    }
}

function drawStars() {
    for (var i = 0; i < stars; i++) {
        var star = starArray[i];
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, 360);
        context.fillStyle = "hsla(" + star.hue + ", " + star.sat + "%, 88%, " + star.opacity + ")";
        context.fill();
    }
}

function updateStars() {
    for (var i = 0; i < stars; i++) {
        if (Math.random() > 0.99) {
            starArray[i].opacity = Math.random();
        }
    }
}


dateInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value.length === 1 && index < dateInputs.length - 1) {
            dateInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
            dateInputs[index - 1].focus();
        }
    });
});

submitDateButton.addEventListener("click", () => {
    let enteredDate = "";
    dateInputs.forEach(input => enteredDate += input.value);
    // Validate date: dd mm yyyy
    if (enteredDate === "19082023") {
        dateInputs.forEach(input => {
            input.classList.remove("error");
            input.classList.add("success");
        });

        setTimeout(() => {
            loginContainer.style.display = "none";
            gameState = STATE_HEART;
            startButton.style.display = "block";
            initHeart();
        }, 1000);
    } else {
        dateInputs.forEach(input => {
            input.value = "";
            input.classList.add("error");
            setTimeout(() => input.classList.remove("error"), 500);
        });
        dateInputs[0].focus();
    }
});

let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function initHeart() {
    heartParticles = [];
    const totalPoints = 1200;
    let count = 0;
    let attempts = 0;
    let boundary = [];

    for (let t = 0; t < Math.PI * 2; t += 0.02) {
        const scale = 15;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        boundary.push({ x: x * scale + canvas.width / 2, y: y * scale + canvas.height / 2 });
    }

    while (count < totalPoints && attempts < 50000) {
        attempts++;
        const range = 500;
        const startX = (Math.random() * range) - (range / 2) + canvas.width / 2;
        const startY = (Math.random() * range) - (range / 2) + canvas.height / 2;

        if (isInside(startX, startY, boundary)) {
            heartParticles.push({
                x: startX,
                y: startY,
                originX: startX,
                originY: startY,
                vx: 0,
                vy: 0,
                size: Math.random() * 2 + 1,
                color: '#e91e63'
            });
            count++;
        }
    }
}

function isInside(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function updateHeartParticles() {
    heartParticles.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const forceRadius = 100;
        const forceStrength = 10;
        let forceX = 0;
        let forceY = 0;

        if (dist < forceRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (forceRadius - dist) / forceRadius;
            forceX = -Math.cos(angle) * force * forceStrength;
            forceY = -Math.sin(angle) * force * forceStrength;
        }

        const springX = (p.originX - p.x) * 0.05;
        const springY = (p.originY - p.y) * 0.05;

        p.vx += forceX + springX;
        p.vy += forceY + springY;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;
    });
}

function drawHeartParticles() {
    heartParticles.forEach(p => {
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fillStyle = p.color;
        context.fill();
    });
}

let questions = [];
let score = 0;
let currentQuestionIndex = 0;

async function loadQuestions() {
    try {
        const response = await fetch('questions.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error("Network response was not ok");
        questions = await response.json();
    } catch (error) {
        console.error("Could not load questions:", error);
        questions = [{ question: "Error loading questions. But I love you anyway!", options: { "A": "Me too" }, answer: "A" }];
    }
}
loadQuestions();

function showQuestion(index) {
    if (index >= questions.length) {
        quizContainer.querySelector('h2').style.display = 'none';
        optionsContainer.style.display = 'none';
        scoreContainer.style.display = 'block';
        scoreText.textContent = `Your Score: ${score}/${questions.length}`;
        return;
    }
    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    questionText.style.display = 'block';

    Object.entries(q.options).forEach(([key, value]) => {
        const btn = document.createElement('button');
        btn.textContent = value;
        btn.classList.add('option-btn');
        btn.onclick = () => checkAnswer(key, q.answer, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedKey, correctKey, btnElement) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.onclick = null);

    if (selectedKey === correctKey) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        quizContainer.style.opacity = '0';
        setTimeout(() => {
            showQuestion(currentQuestionIndex);
            quizContainer.style.opacity = '1';
        }, 500);
    }, 1500);
}

startButton.addEventListener('click', () => {
    gameState = STATE_QUIZ;
    startButton.style.display = 'none';
    quizContainer.style.display = 'block';
    showQuestion(0);
});

finishQuizButton.addEventListener('click', () => {
    gameState = STATE_MAP;
    quizContainer.style.display = 'none';
    setTimeout(() => {
        initMap();
    }, 500);
});

let map = null;
let frankfurtMarker = null;
let munichMarker = null;
let polyline = null;

const frankfurt = [50.1014, 8.5488];
const munich = [48.0390, 11.5234];
const midpoint = [(frankfurt[0] + munich[0]) / 2, (frankfurt[1] + munich[1]) / 2];

function createHeartIcon(size = 40) {
    return L.divIcon({
        html: `<svg width="${size}" height="${size}" viewBox="0 0 32 29.6" class="heart-marker">
                <path fill="#e91e63" d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
                  c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
              </svg>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

function initMap() {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.style.display = 'block';

    map = L.map('map', {
        center: midpoint,
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '' }).addTo(map);

    polyline = L.polyline([frankfurt, munich], {
        color: '#e91e63',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10'
    }).addTo(map);

    frankfurtMarker = L.marker(frankfurt, { icon: createHeartIcon() }).addTo(map);
    munichMarker = L.marker(munich, { icon: createHeartIcon() }).addTo(map);

    setTimeout(() => startHeartAnimation(), 500);
}

function startHeartAnimation() {
    const startHeartElem = munichMarker.getElement().querySelector('svg');
    const destHeartElem = frankfurtMarker.getElement().querySelector('svg');
    anime({
        targets: [startHeartElem, destHeartElem],
        scale: [1, 1.2, 1],
        duration: 1000,
        easing: 'easeInOutQuad',
        loop: 2
    });
    setTimeout(() => { animateJourney(munich, frankfurt, 4000); }, 2000);
}

function animateJourney(startLatLng, endLatLng, duration) {
    const startTime = performance.now();
    function frame(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentLat = startLatLng[0] + (endLatLng[0] - startLatLng[0]) * progress;
        const currentLng = startLatLng[1] + (endLatLng[1] - startLatLng[1]) * progress;
        const currentPos = [currentLat, currentLng];

        munichMarker.setLatLng(currentPos);
        polyline.setLatLngs([endLatLng, currentPos]);

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            finishJourney();
        }
    }
    requestAnimationFrame(frame);
}

function finishJourney() {
    map.removeLayer(munichMarker);
    map.removeLayer(polyline);
    const destHeartElement = frankfurtMarker.getElement().querySelector('svg');

    anime({
        targets: destHeartElement,
        scale: [{ value: 1.4, duration: 400, easing: 'easeOutQuad' }, { value: 1, duration: 400, easing: 'easeInQuad' }],
        loop: 3,
        complete: () => {
            map.removeLayer(frankfurtMarker);
            expandFinalHeart();
        }
    });
}

function expandFinalHeart() {
    const mapContainer = document.getElementById('mapContainer');
    const finalHeartContainer = document.getElementById('finalHeartContainer');
    const heartMessage = document.getElementById('heartMessage');

    finalHeartContainer.style.display = 'block';

    anime({ targets: mapContainer, opacity: 0, duration: 1000, easing: 'easeOutQuad' });

    anime({
        targets: finalHeartContainer,
        scale: [0, 1],
        opacity: [0, 1],
        duration: 2000,
        easing: 'easeOutElastic(1, .6)',
        complete: () => {
            mapContainer.style.display = 'none';
            anime({
                targets: heartMessage,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1500,
                easing: 'easeOutQuad',
                delay: 750,
                complete: () => {
                    setTimeout(() => {
                        anime({
                            targets: finalHeartContainer,
                            opacity: 0,
                            scale: 0.8,
                            duration: 1000,
                            easing: 'easeInQuad',
                            complete: () => {
                                finalHeartContainer.style.display = 'none';
                                gameState = STATE_TEXT;
                                frameNumber = 0;
                                opacity = 0;
                                secondOpacity = 0;
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
}

yesBtn.addEventListener("click", () => {
    currentLoveLevel++;
    if (currentLoveLevel < loveLevels.length) {
        questionTitleEl.innerText = loveLevels[currentLoveLevel].title;
        yesBtn.innerText = loveLevels[currentLoveLevel].btn;

        noBtn.style.position = "";
        noBtn.style.left = "";
        noBtn.style.top = "";
    } else {
        questionTitleEl.innerText = "Ohey, we both love each other so much!\n Happy Valentine's Day my Huni ❤️";
        yesBtn.style.display = "none";
        noBtn.style.display = "none";

        gameState = STATE_HEART;
        initHeart();

        // Xóa style nền để nhìn rõ trái tim
        loveQuestionContainer.style.background = "none";
        loveQuestionContainer.style.backgroundColor = "transparent";
        loveQuestionContainer.style.backdropFilter = "none";
        loveQuestionContainer.style.WebkitBackdropFilter = "none";
        loveQuestionContainer.style.border = "none";
        loveQuestionContainer.style.boxShadow = "none";
    }
});

noBtn.addEventListener("mouseover", () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    const randomX = Math.random() * (windowWidth - btnWidth - 50) + 25;
    const randomY = Math.random() * (windowHeight - btnHeight - 50) + 25;

    const containerRect = loveQuestionContainer.getBoundingClientRect();
    noBtn.style.position = "fixed";
    noBtn.style.left = (randomX - containerRect.left) + "px";
    noBtn.style.top = (randomY - containerRect.top) + "px";
});

function drawTextWithLineBreaks(lines, x, y, fontSize, lineHeight) {
    lines.forEach((line, index) => {
        context.fillText(line, x, y + index * (fontSize + lineHeight));
    });
}

function drawText() {
    var fontSize = Math.min(30, window.innerWidth / 24);
    var lineHeight = 8;

    context.font = (fontSize + 10) + "px 'Great Vibes', cursive";
    context.textAlign = "center";
    context.shadowColor = "rgba(255, 105, 180, 0.8)";
    context.shadowBlur = 8;

    if (frameNumber < 250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        context.fillText("I love you so much, my Huni", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }
    else if (frameNumber >= 250 && frameNumber < 500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        context.fillText("I love you so much, my Huni", canvas.width / 2, canvas.height / 2);
        opacity -= 0.01;
    }
    else if (frameNumber == 500) { opacity = 0; }

    else if (frameNumber > 500 && frameNumber < 750) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["It's sad that I can't be with you", "this Valentine's like other couples"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("It's sad that I can't be with you this Valentine's like other couples", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }
    else if (frameNumber >= 750 && frameNumber < 1000) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["It's sad that I can't be with you", "this Valentine's like other couples"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("It's sad that I can't be with you this Valentine's like other couples", canvas.width / 2, canvas.height / 2);
        opacity -= 0.01;
    }
    else if (frameNumber == 1000) { opacity = 0; }

    else if (frameNumber > 1000 && frameNumber < 1250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["Yeah, sometimes I am a bit dumb...", "I mean really, really dumb"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("Yeah, sometimes I am a bit dumb... I mean really, really dumb", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }
    else if (frameNumber >= 1250 && frameNumber < 1500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["Yeah, sometimes I am a bit dumb...", "I mean really, really dumb"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("Yeah, sometimes I am a bit dumb... I mean really, really dumb", canvas.width / 2, canvas.height / 2);
        opacity -= 0.01;
    }
    else if (frameNumber == 1500) { opacity = 0; }

    else if (frameNumber > 1500 && frameNumber < 1750) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["I know that's made you mad at me,", "but at least that is why you love me right? Hehe"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("I know that's made you mad, but at least that is why you love me right? Hehe", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }
    else if (frameNumber >= 1750 && frameNumber < 2000) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["I know that's made you mad at me,", "but at least that is why you love me right? Hehe"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("I know that's made you mad, but at least that is why you love me right? Hehe", canvas.width / 2, canvas.height / 2);
        opacity -= 0.01;
    }
    else if (frameNumber == 2000) { opacity = 0; }

    else if (frameNumber > 2000 && frameNumber < 2250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["And I know I'm not a perfect guy neither,", "maybe not even in the same league as you yet"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("And I know I'm not a perfect guy neither, maybe not even in the same league as you yet", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }
    else if (frameNumber >= 2250 && frameNumber < 2500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["And I know I'm not a perfect guy neither,", "maybe not even in the same league as you yet"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("And I know I'm not a perfect guy neither, maybe not even in the same league as you yet", canvas.width / 2, canvas.height / 2);
        opacity -= 0.01;
    }
    else if (frameNumber == 2500) { opacity = 0; }

    else if (frameNumber > 2500 && frameNumber < 99999) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["But I'm doing my best every day,", "knowing it will all count someday"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        else context.fillText("But I'm doing my best every day, knowing it will all count someday", canvas.width / 2, canvas.height / 2);
        opacity += 0.01;
    }

    if (frameNumber >= 2750 && frameNumber < 99999) {
        context.fillStyle = `rgba(255, 105, 180, ${secondOpacity})`;
        if (window.innerWidth < 600) drawTextWithLineBreaks(["I miss you so much"], canvas.width / 2, (canvas.height / 2 + 60), fontSize, lineHeight);
        else context.fillText("I miss you so much", canvas.width / 2, (canvas.height / 2 + 50));
        secondOpacity += 0.01;
    }

    if (frameNumber > 3300 && gameState !== STATE_LOVE_QUESTION) {
        gameState = STATE_LOVE_QUESTION;
        loveQuestionContainer.style.display = "block";
        questionTitleEl.innerText = loveLevels[0].title;
        yesBtn.innerText = loveLevels[0].btn;
        opacity = 0;
        secondOpacity = 0;
    }

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();
    updateStars();

    if (gameState === STATE_HEART) {
        updateHeartParticles();
        drawHeartParticles();
    } else if (gameState === STATE_TEXT) {
        drawText();
        if (frameNumber < 100000) frameNumber++;
    }

    window.requestAnimationFrame(draw);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.requestAnimationFrame(draw);