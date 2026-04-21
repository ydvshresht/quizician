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

const quizzes = {
  gk: [
    {
      question: "Capital of India?",
      options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
      correct: "Delhi"
    },
    {
      question: "National animal of India?",
      options: ["Lion", "Tiger", "Elephant", "Cow"],
      correct: "Tiger"
    }
  ],

  science: [
    {
      question: "H2O is?",
      options: ["Oxygen", "Hydrogen", "Water", "Salt"],
      correct: "Water"
    },
    {
      question: "Sun is a?",
      options: ["Planet", "Star", "Moon", "Asteroid"],
      correct: "Star"
    }
  ],

  history: [
    {
      question: "Who was first PM of India?",
      options: ["Gandhi", "Nehru", "Patel", "Modi"],
      correct: "Nehru"
    },
    {
      question: "Who was first president of India?",
      options: ["Gandhi", "Nehru", "Patel", "Modi"],
      correct: "Patel"
    }
  ]
};



let currentQuestion = 0;
let score = 0;
let selected = null;
let timer;
let timeLeft = 10;

// Start Quiz


function startQuiz(category = "gk") {
  hideAll();

  // Set selected category
  quizData = quizzes[category] || [];

  if (quizData.length === 0) {
    alert("No questions available!");
    return;
  }

  // Reset everything properly
  currentQuestion = 0;
  score = 0;
  selected = null;
  userAnswers = [];
  totalTime = 0;
  clearInterval(timer);

  document.getElementById("quiz").style.display = "block";

  loadQuestion();
}




// Load Question
function loadQuestion() {
  const container = document.querySelector(".quiz-container");
  container.style.opacity = 0;

  setTimeout(() => {
    selected = null;
    timeLeft = 10;

    const q = quizData[currentQuestion];

    document.getElementById("question").innerText = q.question;
    document.getElementById("progress").innerText =
      `Question ${currentQuestion + 1}/${quizData.length}`;

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    q.options.forEach(option => {
      const btn = document.createElement("button");
      btn.innerText = option;

      btn.onclick = () => {
        selected = option;

        document.querySelectorAll(".answers button").forEach(b => {
          b.classList.remove("selected");
        });

        btn.classList.add("selected");
      };

      answersDiv.appendChild(btn);
    });

    container.style.opacity = 1;

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
  document.getElementById("quiz").style.display = "none";
  document.getElementById("result").style.display = "block";

  const total = quizData.length;
  const accuracy = Math.round((score / total) * 100);

  document.getElementById("score").innerText = `${score} / ${total}`;
  document.getElementById("accuracy").innerText = accuracy + "%";
  document.getElementById("timeTaken").innerText = totalTime;

  const reviewDiv = document.getElementById("review");
  reviewDiv.innerHTML = "";

  userAnswers.forEach((item, index) => {
    const div = document.createElement("div");

    const isCorrect = item.selected === item.correct;

    div.style.margin = "10px 0";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.style.background = isCorrect ? "#d4edda" : "#f8d7da";

    div.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${item.question}</p>
      <p>Your Answer: ${item.selected}</p>
      <p>Correct Answer: ${item.correct}</p>
    `;

    reviewDiv.appendChild(div);
  });
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
document.getElementById("homeBtn").onclick = () => {
  showHome();
};

document.getElementById("quizBtn").onclick = () => {
  startQuiz("gk");
};

document.getElementById("catBtn").onclick = () => {
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



