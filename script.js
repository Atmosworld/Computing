
function setCardTheme(button, color) {
  const card = button.closest(".card");
  if (card) {
    card.style.backgroundColor = color;
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(card => {
  observer.observe(card);
});

document.addEventListener('contextmenu', e => {
  if (e.target.closest('.noselect')) e.preventDefault();
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
    if (document.activeElement.closest('.noselect')) e.preventDefault();
  }
});

const answers = {};
const submitted = {};
const questionsByCategory = {
  input: [
    {
      q: "Which of the following is a variable being used in the code?",
      options: ["total_cars", "int", "input", "Enter sale price of car £"],
      correct: "A"
    },
    {
      q: "What data type is the variable `price` using?",
      options: ["Integer", "String", "Boolean", "Float"],
      correct: "D"
    },
    {
      q: "Which command is used to get a user’s response from the keyboard?",
      options: ["input()", "print()", "int()", "float()"],
      correct: "A"
    },
    {
      q: "How many variables are used in this program?",
      options: ["1", "2", "3", "4"],
      correct: "D"
    },
    {
      q: "Which of these is not a valid variable name?",
      options: ["totalCars", "bonus_count", "Total Cars", "price"],
      correct: "C"
    }
  ],
  iteration: [
    {
      q: "What type of iteration does this code use?",
      options: ["Count-controlled", "Condition-controlled", "Recursion", "Infinite loop"],
      correct: "A"
    },
    {
      q: "On which line is the iteration started?",
      options: ["3", "4", "5", "6"],
      correct: "C"
    },
    {
      q: "What keyword is used for iteration in this code?",
      options: ["if", "loop", "while", "for"],
      correct: "D"
    },
    {
      q: "How many times will the loop run if total_cars = 3?",
      options: ["1", "2", "3", "4"],
      correct: "C"
    },
    {
      q: "What happens inside the loop?",
      options: ["Bonus is paid", "Input is collected", "Car is printed", "Variables are declared"],
      correct: "B"
    }
  ],
  selection: [],
  output: [],
  code: []
};

const categories = [
  { key: "input", colorClass: "input-buttons", color: "rgb(226, 196, 76)" },
  { key: "iteration", colorClass: "iteration-buttons", color: "rgb(69, 138, 172)" },
  { key: "selection", colorClass: "selection-buttons", color: "rgb(160, 166, 161)" },
  { key: "output", colorClass: "output-buttons", color: "rgb(241, 200, 19)" },
  { key: "code", colorClass: "code-buttons", color: "rgb(100, 162, 113)" }
];

function selectAnswer(topic, qNum, choice, btn) {
  const key = topic + '-Q' + qNum;
  if (submitted[topic]) return;
  answers[key] = choice;

  const buttons = btn.parentElement.querySelectorAll("button");
  buttons.forEach(b => b.style.border = "none");
  btn.style.border = "2px solid #0984e3";
}

function submitCard(topic) {
  const questions = questionsByCategory[topic];
  let score = 0;

  questions.forEach((item, i) => {
    const key = topic + '-Q' + (i + 1);
    const userAnswer = answers[key];
    const correct = item.correct;

    const buttons = document.querySelectorAll(`#${topic}-quiz .quiz-options:nth-of-type(${i + 1}) button`);
    buttons.forEach((btn, idx) => {
      const letter = String.fromCharCode(65 + idx);
      btn.disabled = true;
      if (letter === correct) {
        btn.style.border = "2px solid #2ecc71";
      } else if (letter === userAnswer) {
        btn.style.border = "2px solid #e74c3c";
      }
    });

    if (userAnswer === correct) score++;
  });

  submitted[topic] = true;
  const output = document.getElementById(`${topic}-score`);
  output.innerHTML = `<p><strong>${topic.toUpperCase()} Score:</strong> ${score} / ${questions.length}</p>`;

  updateOverallScore();
}

function updateOverallScore() {
  let total = 0;
  let max = 0;

  categories.forEach(cat => {
    const questions = questionsByCategory[cat.key];
    if (!questions || questions.length === 0) return;

    questions.forEach((q, i) => {
      const key = cat.key + '-Q' + (i + 1);
      if (answers[key] === q.correct) {
        total++;
      }
    });

    max += questions.length;
  });

  const overallOutput = document.getElementById("overall-score");
  overallOutput.innerHTML = `<p><strong>Overall Score:</strong> ${total} / ${max}</p>`;
}

function renderQuestions() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  categories.forEach(cat => {
    const card = document.createElement("div");
    card.className = "card visible";
    card.innerHTML = `
      <div class="title">${cat.key.toUpperCase()} <span style="color: ${cat.color};">.</span></div>
      <div class="content"><div class="quiz-question-group" id="${cat.key}-quiz"></div></div>
      <div style="margin-top:1rem;" id="${cat.key}-score"></div>
      <div style="margin-top:1rem;">
        <button class="modern-button" onclick="submitCard('${cat.key}')">✅ Submit Answers</button>
      </div>
    `;
    container.appendChild(card);

    const quizGroup = card.querySelector(`#${cat.key}-quiz`);
    const questions = questionsByCategory[cat.key]?.length
      ? questionsByCategory[cat.key]
      : Array.from({ length: 5 }, (_, i) => ({
          q: `Q${i + 1}: [Insert question here]`,
          options: ["A", "B", "C", "D"],
          correct: "A"
        }));

    questions.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = 'quiz-question';
      div.innerHTML = `
        <p><strong>Q${i + 1}:</strong> ${item.q}</p>
        <div class="quiz-options ${cat.colorClass}">
          ${item.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `<button onclick="selectAnswer('${cat.key}', ${i + 1}, '${letter}', this)">${opt}</button>`;
          }).join("")}
        </div>
      `;
      quizGroup.appendChild(div);
    });

    if (cat.key === "output") {
      const summary = document.createElement("div");
      summary.id = "overall-score";
      summary.style.marginTop = "2rem";
      card.appendChild(summary);
    }
  });
}

document.addEventListener("DOMContentLoaded", renderQuestions);
