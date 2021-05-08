let TIME_LIMIT = 10;
let timerText = document.querySelector(".currTime")
let cpmText = document.querySelector(".currCpm")
let wpmText = document.querySelector(".currWpm")
let bestText = document.querySelector(".currBest")
let userText = document.querySelector(".currUser")
let quoteText = document.querySelector(".quote")
let inputArea = document.querySelector(".inputArea");
let restartBtn = document.querySelector(".restartBtn")
let cpmGroup = document.querySelector(".cpm")
let wpmGroup = document.querySelector(".wpm")
let factGroup = document.querySelector(".fact")
let loginSelector = document.querySelector(".loginBtn")
let signupSelector = document.querySelector(".signupBtn")
let usernameSelector = document.querySelector(".username")
let timeLeft = TIME_LIMIT
let timeElapsed = 0
let characterTyped = 0
let correctCharacter = 0
let quoteNo = 0
let currentQuote = ""
let timer = null
let grabbedQuote = ""
let factQuote = ""
let user = null
let loggedIn = false

// grab a quote from Quotable API
async function grabQuote() {
  const response = await fetch("https://api.quotable.io/random")
  const data = await response.json()
  grabbedQuote = data.content
}

async function updateQuote() {
  await grabQuote()
  currentQuote = grabbedQuote
  quoteText.textContent = null
  // separate each character and make an element out of each individual one
  // append each one to the now null quoteText area
  currentQuote.split('').forEach(char => {
    const charSpan = document.createElement('span')
    charSpan.innerText = char
    quoteText.appendChild(charSpan)
  })
}

function processCurrentText() {

  // get current input text and split it
  currInput = inputArea.value;
  currInputArray = currInput.split('')
  characterTyped++

  quoteSpanArray = quoteText.querySelectorAll('span');
  quoteSpanArray.forEach((char, index) => {
    let typedChar = currInputArray[index]

    // characters not currently typed
    if (typedChar == null) {
      char.classList.remove('correctChar')
      char.classList.remove('incorrectChar')

      // correct characters
    } else if (typedChar === char.innerText) {
      char.classList.add('correctChar');
      char.classList.remove('incorrectChar')
      // incorrect characters
    } else {
      char.classList.add('incorrectChar')
      char.classList.remove('correctChar')
    }
  });

  // if current text is completely typed
  // irrespective of errors
  if (currInput.length == currentQuote.length) {
    updateQuote();
    inputArea.value = ""
  }
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeElapsed++;

    // update the timer text
    timerText.textContent = timeLeft + "s"
  }
  else {
    // timer has finished
    finishGame();
  }
}

async function findFact() {
  const response = await fetch("https://official-joke-api.appspot.com/random_joke")
  const data = await response.json()
  factQuote = data.setup + " " + data.punchline
} 

async function finishGame() {
  // stop the timer
  clearInterval(timer);
  // disable the input area
  inputArea.disabled = true;

  quoteText.textContent = "Click restart to start a new game."
  // display restart button
  restartBtn.style.display = "block"

  // calculate cpm and wpm
  cpm = Math.round(((characterTyped / timeElapsed) * 60))
  wpm = Math.round((((characterTyped / 5) / timeElapsed) * 60))
  if (user != null) {
    if (wpm > user.highscore) {
      putHighScore(wpm)
    }
  }
  // update cpm wpm and fact
  cpmText.textContent = cpm
  wpmText.textContent = wpm
  await findFact()
  factGroup.innerHTML = 'Don\'t get frustrated if you can\'t increase your WPM, here\'s a joke: <br>' + factQuote

  findFact(wpm)
  // display the cpm wpm and fact
  cpmGroup.style.display = "block"
  wpmGroup.style.display = "block"
  factGroup.style.display = "block"
}

loginSelector.addEventListener('click', async () => {
    user = await getUser(usernameSelector.value)
    bestText.innerHTML = user.highscore
    userText.innerHTML = user.username
})

signupSelector.addEventListener('click', () => {
  const tempUser = usernameSelector.value
  const tempPass = passwordSelector.value 
  postUser(tempUser, tempPass)
})

async function getUser(user) {
  const res = await fetch ('http://kennyxu.pythonanywhere.com/user/' + user)
  const data = await res.json()
  return data
}

function postUser(username, password) {
  axios({
    method: 'post',
    url: 'http://kennyxu.pythonanywhere.com/',
    data: {
      username: 'username',
      password: 'password'
    }
  })
}

function putHighScore(best) {
  const res = fetch ('http://kennyxu.pythonanywhere.com/user/' + user)
  
  user.highscore = best
  bestText.innerHTML = best
}

function startGame() {
  resetValues()
  updateQuote()

  // clear old and start a new timer
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000)
}

function resetValues() {
  timeLeft = TIME_LIMIT
  timeElapsed = 0
  characterTyped = 0
  quoteNo = 0
  inputArea.disabled = false
  inputArea.value = ""
  quoteText.textContent = 'Click on the area below to start the game.'
  timerText.textContent = timeLeft + 's'
  restartBtn.style.display = "none"
  cpmGroup.style.display = "none"
  wpmGroup.style.display = "none"
  factGroup.style.display = "none"
}