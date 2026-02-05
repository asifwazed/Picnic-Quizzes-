// --- STATE MANAGEMENT ---
let currentQuestionIndex = 0;
let teams = []; // Array to store team objects: { name: "Team A", score: 0 }
let timerInterval;
let timeLeft = 20;
const TIME_PER_QUESTION = 20;

// --- DOM ELEMENTS ---
const screens = {
    home: document.getElementById('home-screen'),
    setup: document.getElementById('setup-screen'),
    game: document.getElementById('game-screen'),
    scoreboard: document.getElementById('scoreboard-screen'),
    result: document.getElementById('result-screen')
};

// --- INITIALIZATION ---
document.getElementById('btn-start-setup').addEventListener('click', () => {
    showScreen('setup');
    renderTeamInputs();
});

document.getElementById('btn-start-quiz').addEventListener('click', startGame);
document.getElementById('btn-reveal').addEventListener('click', revealAnswer);
document.getElementById('btn-no-point').addEventListener('click', () => nextStep(null));
document.getElementById('btn-next-question').addEventListener('click', loadNextQuestion);

// --- FUNCTIONS ---

// Helper to switch visible screens
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active', 'hidden'));
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

// 1. SETUP LOGIC
function renderTeamInputs() {
    const container = document.getElementById('team-inputs');
    if(container.children.length === 0) {
        // Add 2 default inputs
        addTeamInput();
        addTeamInput();
    }
}

function addTeamInput() {
    const container = document.getElementById('team-inputs');
    if (container.children.length >= 5) return; // Max 5 teams
    const input = document.createElement('input');
    input.placeholder = `Team ${container.children.length + 1} Name`;
    container.appendChild(input);
}

function startGame() {
    // Gather team names
    const inputs = document.querySelectorAll('#team-inputs input');
    teams = [];
    inputs.forEach((input, index) => {
        const name = input.value.trim() || `Team ${index + 1}`;
        teams.push({ name: name, score: 0 });
    });

    currentQuestionIndex = 0;
    showScreen('game');
    renderQuestion();
}

// 2. GAME LOGIC
function renderQuestion() {
    const qData = quizData[currentQuestionIndex];
    
    // Update UI Elements
    document.getElementById('category-badge').textContent = qData.category;
    document.getElementById('q-number').textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
    document.getElementById('question-text').textContent = qData.question;
    
    // Render Options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    qData.options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-card';
        div.textContent = `${['A','B','C','D'][index]}. ${opt}`;
        div.id = `opt-${index}`;
        optionsContainer.appendChild(div);
    });

    // Reset Controls
    document.getElementById('btn-reveal').classList.remove('hidden');
    document.getElementById('award-section').classList.add('hidden');
    
    // Start Timer
    startTimer();
}

function startTimer() {
    timeLeft = TIME_PER_QUESTION;
    document.getElementById('timer-text').textContent = timeLeft;
    document.getElementById('timer-bar').style.width = '100%';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = timeLeft;
        const percentage = (timeLeft / TIME_PER_QUESTION) * 100;
        document.getElementById('timer-bar').style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Optional: Auto reveal answer logic could go here
        }
    }, 1000);
}

function revealAnswer() {
    clearInterval(timerInterval);
    const qData = quizData[currentQuestionIndex];
    
    // Highlight Correct Answer
    const correctOpt = document.getElementById(`opt-${qData.answer}`);
    if(correctOpt) correctOpt.classList.add('correct');

    // Show Host Controls (Who won?)
    document.getElementById('btn-reveal').classList.add('hidden');
    const awardSection = document.getElementById('award-section');
    awardSection.classList.remove('hidden');
    
    // Generate Team Buttons for Scoring
    const teamBtnContainer = document.getElementById('team-award-buttons');
    teamBtnContainer.innerHTML = '';
    teams.forEach((team, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn primary-btn';
        btn.textContent = `${team.name} (+10)`;
        btn.onclick = () => nextStep(index);
        teamBtnContainer.appendChild(btn);
    });
}

function nextStep(winningTeamIndex) {
    // Update Score
    if (winningTeamIndex !== null) {
        teams[winningTeamIndex].score += 10;
    }

    // Show Scoreboard
    renderScoreboard();
    showScreen('scoreboard');
}

// 3. SCOREBOARD & NAVIGATION
function renderScoreboard() {
    const list = document.getElementById('score-list');
    list.innerHTML = '';
    
    // Sort teams by score (Highest first)
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    sortedTeams.forEach(team => {
        const li = document.createElement('li');
        li.className = 'score-item';
        li.innerHTML = `<span>${team.name}</span> <span>${team.score}</span>`;
        list.appendChild(li);
    });
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        showScreen('game');
        renderQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    showScreen('result');
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    const winnerDiv = document.getElementById('winner-display');
    
    // Check for draw
    if (sortedTeams[0].score === sortedTeams[1]?.score) {
        winnerDiv.innerHTML = `<h2>It's a Draw!</h2><p>${sortedTeams[0].name} & ${sortedTeams[1].name}</p><h1>${sortedTeams[0].score} pts</h1>`;
    } else {
        winnerDiv.innerHTML = `<h2>Winner: ${sortedTeams[0].name}</h2><h1>${sortedTeams[0].score} pts</h1>`;
    }
}
