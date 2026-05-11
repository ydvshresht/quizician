let userAnswers = [];
let totalTime = 0;
let quizData = [];
// 🔊 Safe sound loading (won’t crash if file missing)
let correctSound, wrongSound;

try {
  correctSound = new Audio("assets/sounds/correct.mp3");
  wrongSound = new Audio("assets/sounds/wrong.mp3");
} catch (e) {
  console.log("Sound not loaded");
}

// Quiz Data
let quizzes = {};

fetch("https://script.google.com/macros/s/AKfycbwgny0cx2klDxxkzKZWmAI61HTGOjgeOX5TNr7Vrqhumkofbukbc48d-2Emdus9E4UisQ/exec")
  .then(res => res.json())
  .then(data => {
    quizzes = data;
    console.log("Loaded from sheet:", quizzes);
  });





let currentQuestion = 0;
let score = 0;
let selected = null;
let timer;
let timeLeft = 10;

let startSound = new Audio("assets/sounds/start.mp3");

let wowSound = new Audio("assets/sounds/wow.mp3");

// optional: slightly lower volume
startSound.volume = 0.2;

wowSound.volume = 0.8;
// Start Quiz


function startQuiz(category = "gk") {
  hideAll();

  quizData = quizzes[category] || [];
  if (quizData.length === 0) return;

  currentQuestion = 0;
  score = 0;
  selected = null;
  userAnswers = [];
  totalTime = 0;
  clearInterval(timer);

  // 🔊 play start sound (safe)
  try {
    startSound.currentTime = 0;
    startSound.play();
  } catch (e) {}

  document.getElementById("quiz").style.display = "block";
  loadQuestion();
}




// Load Question

function loadQuestion() {
  const container = document.querySelector(".quiz-card");
  if (container) container.style.opacity = 0;

  setTimeout(() => {
    selected = null;
    timeLeft = 10;

    const q = quizData[currentQuestion];

    // ✅ Better progress calculation
    const progressPercent = ((currentQuestion + 1) / quizData.length) * 100;
    document.getElementById("progressFill").style.width = progressPercent + "%";

    // Question + progress text
    document.getElementById("question").innerText = q.question;
    document.getElementById("progress").innerText =
      `Question ${currentQuestion + 1}/${quizData.length}`;

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    const letters = ["A", "B", "C", "D"];

    q.options.forEach((option, index) => {
      const btn = document.createElement("button");

      // ✅ Styled answer (like UI)
      btn.innerHTML = `
        <span class="option-letter">${letters[index]}</span>
        ${option}
      `;

      btn.onclick = () => {
        selected = option;

        document.querySelectorAll(".answers button").forEach(b => {
          b.classList.remove("selected");
        });

        btn.classList.add("selected");
      };

      answersDiv.appendChild(btn);
    });

    if (container) container.style.opacity = 1;

    startTimer();
  }, 200);
}



// Timer

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    totalTime++;

    document.getElementById("timer").innerText = "⏱ " + timeLeft;

    if (timeLeft <= 0) {
      nextQuestion();
    }
  }, 1000);
}



// Next Question


function nextQuestion() {
  clearInterval(timer);

  const correctAns = quizData[currentQuestion].correct;

  userAnswers.push({
    question: quizData[currentQuestion].question,
    selected: selected || "Not Answered",
    correct: correctAns
  });

  if (selected === correctAns) {
    score++;
    if (correctSound) {
      correctSound.currentTime = 0;
      correctSound.play();
    }
  } else {
    if (wrongSound) {
      wrongSound.currentTime = 0;
      wrongSound.play();
    }
  }

  currentQuestion++;

  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
}





// Result



function showResult() {
  hideAll();
  document.getElementById("result").style.display = "flex";

  const total = quizData.length;
  const accuracy = Math.round((score / total) * 100);

  document.getElementById("score").innerText = `${score} / ${total}`;
  document.getElementById("accuracy").innerText = accuracy + "%";
  document.getElementById("timeTaken").innerText = totalTime + " sec";

  const reviewDiv = document.getElementById("review");
  reviewDiv.innerHTML = "";

  userAnswers.forEach((item, index) => {
    const isCorrect = item.selected === item.correct;

    const div = document.createElement("div");
    div.className = "review-card " + (isCorrect ? "correct" : "wrong");

    div.innerHTML = `
      <div class="review-icon">
        <i class="fa-solid ${isCorrect ? "fa-check" : "fa-xmark"}"></i>
      </div>

      <div class="review-text">
        <p><strong>Q${index + 1}: ${item.question}</strong></p>
        <p>Your Answer: ${item.selected}</p>
        <p>Correct Answer: ${item.correct}</p>
      </div>
    `;

    reviewDiv.appendChild(div);
  });

  // 🎉 Confetti (if good score)
  if (typeof confetti !== "undefined" && score >= total / 2) {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  // 🔊 result sound logic
 if (score === total) {
  // all correct → wow
  try {
    wowSound.currentTime = 0;
    wowSound.play();
  } catch (e) {}
}
}








// Save Score
function saveScore() {
  const name = document.getElementById("username").value || "Guest";

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.push({ name, score });

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  showLeaderboard();
}

// Show Leaderboard
function showLeaderboard() {
  document.getElementById("result").style.display = "none";
  document.getElementById("leaderboard").style.display = "block";

  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboard.forEach((user, index) => {
    const div = document.createElement("div");
    div.classList.add("leaderboard-item");

    if (index === 0) div.classList.add("rank-1");
    if (index === 1) div.classList.add("rank-2");
    if (index === 2) div.classList.add("rank-3");

    div.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="name">${user.name}</span>
      <span class="score">${user.score}</span>
    `;

    list.appendChild(div);
  });
}

// Restart Quiz

function restartQuiz() {
  // Reset quiz state
  currentQuestion = 0;
  score = 0;
  selected = null;
  clearInterval(timer);

  // 🔥 Reset new tracking data
  userAnswers = [];
  totalTime = 0;

  // Hide all sections
  document.getElementById("quiz").style.display = "none";
  document.getElementById("result").style.display = "none";
document.getElementById("review").innerHTML = "";

  // Show home again
  document.querySelector(".hero").style.display = "block";
  document.querySelector(".categories").style.display = "block";
}


// ✅ FIX: Ensure button works after page loads
window.onload = function () {
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", nextQuestion);
  }
};


// Navigation
document.getElementById("homeBtn").onclick = (e) => {
  e.preventDefault();
  showHome();
};

document.getElementById("quizBtn").onclick = (e) => {
  e.preventDefault();
  startQuiz("gk");
};

document.getElementById("catBtn").onclick = (e) => {
  e.preventDefault();
  showCategories();
};

function showHome() {
  hideAll();
  document.querySelector(".hero").style.display = "block";
  document.querySelector(".categories").style.display = "block";
}

function showCategories() {
  hideAll();
  document.querySelector(".categories").style.display = "block";
}

function hideAll() {
  const hero = document.querySelector(".hero");
  const categories = document.querySelector(".categories");
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("result");
  const leaderboard = document.getElementById("leaderboard");

  if (hero) hero.style.display = "none";
  if (categories) categories.style.display = "none";
  if (quiz) quiz.style.display = "none";
  if (result) result.style.display = "none";
  if (leaderboard) leaderboard.style.display = "none";
}

const navLinks = document.querySelectorAll(".navbar nav a");

navLinks.forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    // remove active from all
    navLinks.forEach(l => l.classList.remove("active"));

    // add active to clicked one
    this.classList.add("active");
  });
});




