const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const menuButton = document.getElementById("menu-btn");
const statsButton = document.getElementById("stats-btn");
const searchButton = document.getElementById("search-btn");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nameElement = document.getElementById("name");
const searchNameElement = document.getElementById("search-name");
const dateElement = document.getElementById("date");
const userLabelElement = document.getElementById("user-label");
const chartElement = document.getElementById("chart");
const alertDiv = document.getElementById("alert-div");
const endGame = document.getElementById("end-game");
const progressBar = document.getElementById("progress-bar");
let chartUserElement = document.getElementById("myChartUser");
const url = 'https://restcountries.com/v3.1/all?fields=name,capital,cca2,flags'
const date = new Date();
const formatedDate = date.toISOString().split('T')[0];
dateElement.innerText = formatedDate;
userLabelElement.innerText = nameElement.value;

let countriesData = [];
let questions = [];
let correctAnswers = [];
let mark = 0;
let progress = 0;
let currentQuestionIndex;
let stats = JSON.parse(localStorage.getItem('stats')) || [];

const setChartMarks = () => {
  let xValues = [];
  let yValues = [];
  stats.forEach(user => {
    xValues.push(user.name);
    yValues.push(user.mark);
  });
  new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: "grey",
        data: yValues,
      }]
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Marks"
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: 10,
          }
        }]
      }
    }
  });
}

const setChartUser = (userName) => {
  let xValues = [];
  let yValues = [];
  stats.forEach(user => {
    if (user.name == userName) {
      xValues.push(user.date);
      yValues.push(user.mark);
    }
  });
  new Chart("myChartUser", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: "grey",
        data: yValues,
      }]
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: userName
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: 10,
          }
        }]
      }
    }
  });
}


const apiAccess = () => {
  axios.get(url)
    .then((response) => {
      countriesData = response.data;
      createQuestions();
    })
    .catch((error) => console.error(error));
}

const createQuestions = () => {
  countriesData.forEach(countrie => {
    let answers = [];
    for (let i = 0; i < 3; i++) {
      let randomIndex = Math.floor(Math.random() * countriesData.length);
      answers.push(countriesData[randomIndex].flags.png);
    }
    answers.push(countrie.flags.png);
    answers.sort(() => Math.random() - 0.5);
    let question = {
      question: countrie.name.common,
      answers: answers,
      correct_answer: countrie.flags.png,
    };
    questions.push(question);
  });
  questions.sort(() => Math.random() - 0.5);
  questions = questions.slice(0, 10);
}


const createUser = () => {
  let user = {
    name: nameElement.value,
    date: formatedDate,
    mark: mark
  }
  stats.push(user);
  localStorage.setItem("stats", JSON.stringify(stats));
}

const searchUser = () => {
  if (chartUserElement) {
    const chartUserParent = chartUserElement.parentElement;
    chartUserParent.removeChild(chartUserElement);
    chartUserElement = document.createElement("canvas");
    chartUserElement.id = "myChartUser";
    chartUserParent.appendChild(chartUserElement);
  }
  setChartUser(searchNameElement.value);
  searchNameElement.value = searchNameElement.value;
}

const startGame = () => {
  if (nameElement.value == "" || nameElement.value == null) {
    alertDiv.innerHTML = `<div class="alert alert-dismissible alert-danger">
    <strong>You must enter your name!</strong>
  </div>`
    return;
  }
  progress = 0;
  progressBar.children[0].style.width = `${progress}%`;
  progressBar.classList.remove("d-none");
  createQuestions();
  correctAnswers = [];
  alertDiv.innerHTML = "";
  nameElement.value = nameElement.value;
  userLabelElement.innerText = nameElement.value;
  startButton.classList.add("d-none");
  nameElement.classList.add("d-none");
  dateElement.classList.add("d-none");
  chartElement.classList.add("d-none");
  statsButton.classList.add("d-none");
  searchButton.classList.add("d-none");
  currentQuestionIndex = 0;
  mark = 0;
  questionContainerElement.classList.remove("d-none");
  setNextQuestion();
}

const showQuestion = (question) => {
  questionElement.innerText = question.question;
  for (const answer in question.answers) {
    if (question.answers[answer] != undefined) {
      const buttonImg = document.createElement("img");
      const divContenedor = document.createElement('div');
      divContenedor.classList.add("g-col-8");
      buttonImg.classList.add("float-start");
      buttonImg.classList.add("rounded");
      buttonImg.classList.add("img-thumbnail");
      buttonImg.classList.add("shadow");

      buttonImg.src = question.answers[answer];
      if (question.correct_answer == question.answers[answer]) {
        buttonImg.dataset.correct = true;
      }
      divContenedor.appendChild(buttonImg);

      buttonImg.addEventListener("click", selectAnswer);
      answerButtonsElement.appendChild(divContenedor);
    }
  }
}

const resetState = () => {
  nextButton.classList.add("d-none");
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

const selectAnswer = (event) => {
  const selectedButton = event.target;
  if (selectedButton.dataset.correct) {
    let answer = {
      countrie: questions[currentQuestionIndex].question,
      correct_answer: true
    }
    correctAnswers.push(answer);
    mark++;
  } else {
    let answer = {
      countrie: questions[currentQuestionIndex].question,
      correct_answer: false
    }
    correctAnswers.push(answer);
  }
  Array.from(answerButtonsElement.children).forEach((button) => {
    setStatusClass(button.children[0]);
  });
  progress += 10;
  progressBar.children[0].style.width = `${progress}%`;

  if (questions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove("d-none");
  } else {
    createUser();
    setTimeout(() => {
      progressBar.classList.add("d-none");
      showEndGame();
    }, 1500);
  }
}

const showMenu = () => {
  questionContainerElement.classList.add("d-none");
  startButton.classList.remove("d-none");
  nameElement.classList.remove("d-none");
  dateElement.classList.remove("d-none");
  statsButton.classList.remove("d-none");
  chartElement.classList.add("d-none");
  menuButton.classList.add("d-none");
  searchNameElement.classList.add("d-none");
  searchButton.classList.add("d-none");
  endGame.classList.add("d-none");
  alertDiv.innerHTML = "";
}

const showStats = () => {
  questionContainerElement.classList.add("d-none");
  startButton.classList.add("d-none");
  nameElement.classList.add("d-none");
  chartElement.classList.remove("d-none");
  menuButton.classList.remove("d-none");
  searchNameElement.classList.remove("d-none");
  searchButton.classList.remove("d-none");
  statsButton.classList.add("d-none");
  alertDiv.innerHTML = "";
  setChartMarks();
}

const showEndGame = () => {
  answerButtonsElement.innerHTML = "";
  questionElement.innerHTML = "";
  menuButton.classList.remove("d-none");
  endGame.classList.remove("d-none");
  let index = 0;
  Array.from(endGame.children).forEach((answerText) => {
    if (correctAnswers[index].correct_answer) {
      answerText.classList.add("list-group-item-success");
      answerText.innerText = correctAnswers[index].countrie;
    } else {
      answerText.classList.add("list-group-item-danger");
      answerText.innerText = correctAnswers[index].countrie;
    }
    index++;
  });
}

apiAccess();

searchButton.addEventListener("click", searchUser);
startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});
menuButton.addEventListener("click", showMenu);
statsButton.addEventListener("click", showStats);