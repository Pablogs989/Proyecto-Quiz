const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nameElement = document.getElementById("name");
const dateElement = document.getElementById("date");
const apiKey = 'KFGmOUvBmwkfPjrKCJZWTdlMVJbJSX0soimMSV5a';
const limit = 20;
const date = new Date();
const formatedDate = date.toISOString().split('T')[0];
dateElement.value = formatedDate;

let questions = [];
let filteredQuestions = [];
let marks = 0;
let currentQuestionIndex;
let stats = JSON.parse(localStorage.getItem('stats')) || [];

const filterQuestions = (questions) => {
  for (const question in questions) {
    let aNumber = 0;
    let correctAnswers = 0;
    for (const answer in questions[question].answers) {
      if (questions[question].answers[answer] != null) {
        if (questions[question].correct_answers[answer + "_correct"] == "true") {
          correctAnswers++;
        }
        aNumber++;
      }
    }
    if (aNumber == 4 && filteredQuestions.length < 10 && correctAnswers == 1) {
      filteredQuestions.push(questions[question]);
    }
  }
}

const apiAccess = () => {
  axios.get(`https://quizapi.io/api/v1/questions?apiKey=${apiKey}&limit=${limit}`)
    .then(res => {
      questions = res.data;
      filterQuestions(questions);
      if (filteredQuestions.length < 10) {
        axios.get(`https://quizapi.io/api/v1/questions?apiKey=${apiKey}&limit=${limit}`)
          .then(res => {
            questions = res.data;
            filterQuestions(questions);
          })
          .catch(err => {
            console.log(err)
          })
      }
    })
    .catch(err => {
      console.log(err)
    })
}

const getQuestions = () => {
  filteredQuestions = [];
  apiAccess();
}

const createUser = () => {
  let user = {
    name: nameElement.value,
    date: formatedDate,
    marks: marks
  }
  stats.push(user);
  localStorage.setItem("stats", JSON.stringify(stats));
}

const startGame = () => {
  startButton.classList.add("hide");
  nameElement.classList.add("hide");
  dateElement.classList.add("hide");
  currentQuestionIndex = 0;
  marks = 0;
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}

const showQuestion = (question) => {
  questionElement.innerText = question.question;
  for (const answer in question.answers) {
    if (question.answers[answer] != undefined) {
      const button = document.createElement("button");
      button.classList.add("btn");
      button.classList.add("btn-secondary");
      button.innerText = question.answers[answer];
      if (question.correct_answers[answer + "_correct"] == "true") {
        button.dataset.correct = true;
      }
      button.addEventListener("click", selectAnswer);
      answerButtonsElement.appendChild(button);
    }
  }
}

const resetState = () => {
  nextButton.classList.add("hide");
  answerButtonsElement.innerHTML = "";
}

const setNextQuestion = () => {
  resetState();
  showQuestion(filteredQuestions[currentQuestionIndex]);
}

const setStatusClass = (element) => {
  if (element.dataset.correct == "true") {
    element.classList.add("btn");
    element.classList.add("btn-success");
  } else {
    element.classList.add("btn");
    element.classList.add("btn-danger");
  }
}

const selectAnswer = (event) => {
  const selectedButton = event.target;
  if (selectedButton.dataset.correct) {
    marks++;
  }
  Array.from(answerButtonsElement.children).forEach((button) => {
    setStatusClass(button);
  });
  if (filteredQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove("hide");
  } else {
    createUser();
    setTimeout(() => {
      startButton.innerText = "Restart";
      startButton.classList.remove("hide");
      nameElement.classList.remove("hide");
      dateElement.classList.remove("hide");
      answerButtonsElement.innerHTML = "";
      questionElement.innerHTML = "";
    }, 2000);
  }
}

getQuestions();

startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});