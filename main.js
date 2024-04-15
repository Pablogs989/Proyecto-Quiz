const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtonsElement = document.getElementById("answer-buttons");
const nameElement = document.getElementById("name");
const dateElement = document.getElementById("date");
const chartElement = document.getElementById("chart");
const url = 'https://restcountries.com/v3.1/all?fields=name,capital,cca2,flags'
const date = new Date();
const formatedDate = date.toISOString().split('T')[0];
dateElement.value = formatedDate;

let countriesData = [];
let questions = [];
let mark = 0;
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
  console.log(JSON.stringify(countriesData));
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

const startGame = () => {
  startButton.classList.add("hide");
  nameElement.classList.add("hide");
  dateElement.classList.add("hide");
  chartElement.classList.add("hide");
  currentQuestionIndex = 0;
  mark = 0;
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}

const showQuestion = (question) => {
  questionElement.innerText = question.question;
  for (const answer in question.answers) {
    if (question.answers[answer] != undefined) {
      const buttonImg = document.createElement("img");
      const divContenedor = document.createElement('div');
      divContenedor.classList.add("g-col-8");
      buttonImg.classList.add("btn");
      buttonImg.classList.add("btn-secondary");

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

const selectAnswer = (event) => {
  const selectedButton = event.target;
  if (selectedButton.dataset.correct) {
    mark++;
  }
  Array.from(answerButtonsElement.children).forEach((button) => {
    setStatusClass(button.children[0]);
  });
  if (questions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove("hide");
  } else {
    createUser();
    setChartMarks();
    setTimeout(() => {
      startButton.innerText = "Restart";
      startButton.classList.remove("hide");
      nameElement.classList.remove("hide");
      dateElement.classList.remove("hide");
      chartElement.classList.remove("hide")
      answerButtonsElement.innerHTML = "";
      questionElement.innerHTML = "";
    }, 2000);
  }
}

apiAccess();
createQuestions();
setChartMarks();
nameElement.addEventListener("keyup", () => setChartUser(nameElement.value));

startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});