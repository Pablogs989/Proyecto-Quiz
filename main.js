const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const apiKey = 'KFGmOUvBmwkfPjrKCJZWTdlMVJbJSX0soimMSV5a';
const limit = 10;

let questions = [];
const getQuestions = () => {
  questions = [];
  axios.get(`https://quizapi.io/api/v1/questions?apiKey=${apiKey}&limit=${limit}`)
    .then(res => {
      questions = res.data;
    })
    .catch(err => {
      console.log(err)
    })
}
getQuestions();

let currentQuestionIndex;

const startGame = () => {
  startButton.classList.add("hide");
  currentQuestionIndex = 0;
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
      console.log(question.correct_answers[answer+"_correct"]); 
      if (question.correct_answers[answer+"_correct"] == "true") {
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
  showQuestion(questions[currentQuestionIndex]);
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


const selectAnswer = () => {
  Array.from(answerButtonsElement.children).forEach((button) => {
    setStatusClass(button);
  });
  if (questions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove("hide");
  } else {
    startButton.innerText = "Restart";
    startButton.classList.remove("hide");
  }
}

startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});