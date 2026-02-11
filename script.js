var canvas = document.getElementById("starfield");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var context = canvas.getContext("2d");
var stars = 500;
var colorrange = [0, 60, 240];
var starArray = [];

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize stars with random opacity values
for (var i = 0; i < stars; i++) {
    var x = Math.random() * canvas.offsetWidth;
    var y = Math.random() * canvas.offsetHeight;
    var radius = Math.random() * 1.2;
    var hue = colorrange[getRandom(0, colorrange.length - 1)];
    var sat = getRandom(50, 100);
    var opacity = Math.random();
    starArray.push({ x, y, radius, hue, sat, opacity });
}

var frameNumber = 0;
var opacity = 0;
var secondOpacity = 0;
var thirdOpacity = 0;

var baseFrame = context.getImageData(0, 0, window.innerWidth, window.innerHeight);

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

const button = document.getElementById("valentinesButton");

button.addEventListener("click", () => {
    if (button.textContent === "Click Me! ❤") {
        button.textContent = "I Love You Forever! ❤";
        // Optional: add some confetti or extra animation here if you like
    }
});

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

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Auto-focus next input and restrict to digits
dateInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        // Allow only digits
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

const STATE_LOGIN = -1;
const STATE_HEART = 0;
const STATE_QUIZ = 1;
const STATE_TEXT = 2;
const STATE_MAP = 3;

let gameState = STATE_LOGIN;
let heartParticles = [];

// Quiz Variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

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
            // Go to heart state
            gameState = STATE_HEART;
            startButton.style.display = "block";
            initHeart();
        }, 1000);
    } else {
        dateInputs.forEach(input => {
            input.value = "";
            input.classList.add("error");

            setTimeout(() => {
                input.classList.remove("error");
            }, 500);
        });
        dateInputs[0].focus();
    }
});

function initHeart() {
    heartParticles = [];
    // Using rejection sampling to fill the heart
    const totalPoints = 1200;
    let count = 0;
    let attempts = 0;

    // Boundary defined by parametric equation
    // x = 16 sin^3 t
    // y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
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
                size: Math.random() * 2 + 1, // Slightly larger dots
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

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
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

// Re-init heart on resize to center
window.addEventListener("resize", function () {
    if (gameState === STATE_HEART) {
        setTimeout(initHeart, 100);
    }
});

// Quiz Functions
async function loadQuestions() {
    try {
        const response = await fetch('questions.json?t=' + new Date().getTime()); // Cache busting
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
    } catch (error) {
        console.error("Could not load questions:", error);
        questions = [
            {
                question: "Error loading questions. But I love you anyway!",
                options: { "A": "Me too" },
                answer: "A"
            }
        ];
    }
}
loadQuestions();

function showQuestion(index) {
    if (index >= questions.length) {
        // Quiz finished
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
    // Disable all buttons 
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.onclick = null);

    if (selectedKey === correctKey) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
    }

    // Wait and go next
    setTimeout(() => {
        currentQuestionIndex++;

        // Transition effect
        quizContainer.style.opacity = '0';
        setTimeout(() => {
            showQuestion(currentQuestionIndex);
            quizContainer.style.opacity = '1';
        }, 500);

    }, 1500);
}


startButton.addEventListener('click', () => {
    // Transition to QUIZ
    gameState = STATE_QUIZ;
    startButton.style.display = 'none';
    quizContainer.style.display = 'block';
    showQuestion(0);
});

finishQuizButton.addEventListener('click', () => {
    gameState = STATE_TEXT;
    quizContainer.style.display = 'none';
    frameNumber = 0;
    opacity = 0;
    secondOpacity = 0;
    thirdOpacity = 0;
});


function draw() {
    context.putImageData(baseFrame, 0, 0);

    drawStars();
    updateStars();

    if (gameState === STATE_HEART) {
        updateHeartParticles();
        drawHeartParticles();
    } else if (gameState === STATE_QUIZ) {
        // Just background stars
    } else if (gameState === STATE_MAP) {
        // Map is visible, just stars in background
    } else if (gameState === STATE_TEXT) {
        drawText();
        if (frameNumber < 99999) {
            frameNumber++;
        }
    }

    window.requestAnimationFrame(draw);
}

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    baseFrame = context.getImageData(0, 0, window.innerWidth, window.innerHeight);
});

function drawTextWithLineBreaks(lines, x, y, fontSize, lineHeight) {
    lines.forEach((line, index) => {
        context.fillText(line, x, y + index * (fontSize + lineHeight));
    });
}

function drawText() {
    var fontSize = Math.min(30, window.innerWidth / 24); // Adjust font size based on screen width
    var lineHeight = 8;

    context.font = (fontSize + 10) + "px 'Great Vibes', cursive";
    context.textAlign = "center";

    context.shadowColor = "rgba(255, 105, 180, 0.8)";
    context.shadowBlur = 8;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    if (frameNumber < 250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        context.fillText("I love you so much, my Huni", canvas.width / 2, canvas.height / 2);
        opacity = opacity + 0.01;
    }
    if (frameNumber >= 250 && frameNumber < 500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;
        context.fillText("I love you so much, my Huni", canvas.width / 2, canvas.height / 2);
        opacity = opacity - 0.01;
    }

    if (frameNumber == 500) {
        opacity = 0;
    }

    if (frameNumber > 500 && frameNumber < 750) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["It's sad that I can't be with you", "this Valentine's like other couples"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("It's sad that I can't be with you this Valentine's like other couples", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity + 0.01;
    }
    if (frameNumber >= 750 && frameNumber < 1000) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["It's sad that I can't be with you", "this Valentine's like other couples"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("It's sad that I can't be with you this Valentine's like other couples", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity - 0.01;
    }

    if (frameNumber == 1000) {
        opacity = 0;
    }

    if (frameNumber > 1000 && frameNumber < 1250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["Yeah, sometimes I am a bit dumb...", "I mean really, really dumb"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("Yeah, sometimes I am a bit dumb... I mean really, really dumb", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity + 0.01;
    }
    if (frameNumber >= 1250 && frameNumber < 1500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["Yeah, sometimes I am a bit dumb...", "I mean really, really dumb"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("Yeah, sometimes I am a bit dumb... I mean really, really dumb", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity - 0.01;
    }

    if (frameNumber == 1500) {
        opacity = 0;
    }

    if (frameNumber > 1500 && frameNumber < 1750) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["I know that's made you mad at me,", "but at least that is why you love me right? Hehe"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("I know that's made you mad, but at least that is why you love me right? Hehe", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity + 0.01;
    }
    if (frameNumber >= 1750 && frameNumber < 2000) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["I know that's made you mad at me,", "but at least that is why you love me right? Hehe"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("I know that's made you mad, but at least that is why you love me right? Hehe", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity - 0.01;
    }

    if (frameNumber == 2000) {
        opacity = 0;
    }

    if (frameNumber > 2000 && frameNumber < 2250) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["And I know I'm not a perfect guy neither,", "maybe not even in the same league as you yet"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("And I know I'm not a perfect guy neither, maybe not even in the same league as you yet", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity + 0.01;
    }
    if (frameNumber >= 2250 && frameNumber < 2500) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["And I know I'm not a perfect guy neither,", "maybe not even in the same league as you yet"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("And I know I'm not a perfect guy neither, maybe not even in the same league as you yet", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity - 0.01;
    }

    if (frameNumber == 2500) {
        opacity = 0;
    }

    if (frameNumber > 2500 && frameNumber < 99999) {
        context.fillStyle = `rgba(255, 105, 180, ${opacity})`;

        if (window.innerWidth < 600) {
            drawTextWithLineBreaks(["But I'm doing my best every day,", "knowing it will all count someday"], canvas.width / 2, canvas.height / 2, fontSize, lineHeight);
        } else {
            context.fillText("But I'm doing my best every day, knowing it will all count someday", canvas.width / 2, canvas.height / 2);
        }

        opacity = opacity + 0.01;
    }

    if (frameNumber == 2750) {
        opacity = 0;
    }

    if (frameNumber >= 2750 && frameNumber < 99999) {
        context.fillStyle = `rgba(255, 105, 180, ${thirdOpacity})`;
        context.fillText("Happy Valentine's Day <3", canvas.width / 2, (canvas.height / 2 + 60));

        if (thirdOpacity < 1) thirdOpacity += 0.01;

        // Hiển thị bảng hỏi khi dòng chữ cuối cùng đã hiện rõ
        if (thirdOpacity >= 1 && loveContainer.style.display === "none" && currentLoveLevel === 0) {
            loveContainer.style.display = "block";
        }
    }



    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}


window.requestAnimationFrame(draw);

let map = null;
let frankfurtMarker = null; // Frankfurt
let munichMarker = null;    // Munich
let polyline = null;

// City coordinates
const frankfurt = [50.1014, 8.5488]; // Frankfurt
const munich = [48.0390, 11.5234];    // Munich
const midpoint = [(frankfurt[0] + munich[0]) / 2, (frankfurt[1] + munich[1]) / 2];

// Create heart SVG icon
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: ''
    }).addTo(map);

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

    setTimeout(() => {
        animateJourney(munich, frankfurt, 4000);
    }, 2000);
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
        scale: [
            { value: 1.4, duration: 400, easing: 'easeOutQuad' },
            { value: 1, duration: 400, easing: 'easeInQuad' }
        ],
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

    anime({
        targets: mapContainer,
        opacity: 0,
        duration: 1000,
        easing: 'easeOutQuad'
    });

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
                                // Start final text animation after heart fades out
                                gameState = STATE_TEXT;
                                frameNumber = 0;
                                opacity = 0;
                                secondOpacity = 0;
                                thirdOpacity = 0;
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
}

// --- Dữ liệu hội thoại ---
const loveLevels = [
    { title: "Do you love me?", btn: "Yes i love you" },
    { title: "I love you more!", btn: "I love you most" },
    { title: "I love you more than you love me most!", btn: "I love you most than you love me more than i love you most" },
    { title: "I love you more than you love me most than you love me more than i love you most!", btn: "I love you the mostest in the world!" }
];
let currentLoveLevel = 0;

// --- Xử lý sự kiện nút bấm ---
const loveContainer = document.getElementById("loveQuestionContainer");
const questionTitle = document.getElementById("questionTitle");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

yesBtn.addEventListener("click", () => {
    currentLoveLevel++;
    if (currentLoveLevel < loveLevels.length) {
        questionTitle.innerText = loveLevels[currentLoveLevel].title;
        yesBtn.innerText = loveLevels[currentLoveLevel].btn;
    } else {
        // Kết thúc chuỗi hội thoại
        questionTitle.innerText = "Okay than we both love eachother so muchh, happy valentine day my Huni ❤️";
        yesBtn.style.display = "none";
        noBtn.style.display = "none";

        // Sau 3-4 giây thì hiển thị bản đồ (Map) hoặc Trái tim lớn
        setTimeout(() => {
            loveContainer.style.display = "none";
            initMap(); // Kích hoạt phần Map của bạn
        }, 4000);
    }
});

// Nút NO tinh nghịch (Chạy trốn)
noBtn.addEventListener("mouseover", () => {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.position = "absolute";
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
});

finishQuizButton.addEventListener('click', () => {
    gameState = STATE_MAP;
    quizContainer.style.display = 'none';
    setTimeout(() => {
        initMap();
    }, 500);
});
