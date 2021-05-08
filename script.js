let timeLimit = 30;
let timeLeft = timeLimit
let timeElapsed = 0
let charTyped = 0
let currentQuote = ""
let timer = null
let grabbedQuote = ""
let jokeQuote = ""
let user = null

// grab a quote from Quotable API
async function grabQuote() {
  const response = await fetch("https://api.quotable.io/random")
  const data = await response.json()
  grabbedQuote = data.content
}

async function updateQuote() {
  await grabQuote()
  currentQuote = grabbedQuote
  document.querySelector(".quote").textContent = null
  // separate each character and make an element out of each individual one
  // append each one to the now null document.querySelector(".quote") area
  currentQuote.split('').forEach(char => {
    const charSpan = document.createElement('span')
    charSpan.innerText = char
    document.querySelector(".quote").appendChild(charSpan)
  })
}

function processCurrentText() {
  // get current input text and split it
  currInput = document.querySelector(".inputArea").value;
  currInputArray = currInput.split('')
  
  // charTyped++
  quoteSpanArray = document.querySelector(".quote").querySelectorAll('span');
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
      charTyped = charTyped + 1/currInputArray.length
      // console.log(charTyped)
      // incorrect characters
    } else {
      char.classList.add('incorrectChar')
      char.classList.remove('correctChar')
    }
  });
  
  // if current text is completely typed
  if (currInput.length == currentQuote.length) {
    updateQuote();
    document.querySelector(".inputArea").value = ""
  }
}

async function findJoke() {
  const response = await fetch("https://official-joke-api.appspot.com/random_joke")
  const data = await response.json()
  jokeQuote = data.setup + " " + data.punchline
} 

async function loginFunc() {
  user = await getUser(document.querySelector(".username").value)
  if (user != null && document.querySelector(".password").value === user.password) {
      document.querySelector(".currBest").innerHTML = user.highscore
      document.querySelector(".currUser").innerHTML = user.username
      document.querySelector(".username").style.display = 'none'
      document.querySelector(".password").style.display = 'none'
      document.querySelector(".loginBtn").style.display = 'none'
      document.querySelector(".signupBtn").style.display = 'none'
      document.querySelector('.track').style.display = 'none'
      document.querySelector('.signoutBtn').style.display = 'block'
      setUp()
  } else {
    alert('User with that username and password combination does not exist.')
  }
}

async function signupFunc() {
  const tempUser = document.querySelector(".username").value
  const tempPass = document.querySelector(".password").value 
  user = await getUser(document.querySelector(".username").value)
  if (user == null) {
    postUser(tempUser, tempPass)
    alert('Account created! Login to play')
    setUp()
  } else {
    alert('A user with that username already exists')
  }
}

function signoutFunc() {
  window.location.reload();
}

// function leaderboardFunc() {
//   const leaders = ""
//   for (var i = 1; i < 21; i++) {
//     axios({
//       method: 'get',

//     })
//   }
// }

async function getUser(user) {
  const res = await fetch ('https://kennyxu.pythonanywhere.com/user/' + user)
  if (!(res.ok)) {
    return null
  }

  const data = await res.json()
  return data
}

function postUser(username, password) {
  axios({
    method: 'post',
    url: 'https://kennyxu.pythonanywhere.com/user',
    data: {
      username: username,
      password: password
    }
  })
}

function putHighScore(person, best) {
  axios({
    method: 'put',
    url: 'https://kennyxu.pythonanywhere.com/user/' + person,
    data: {
      highscore: best
    }
  })
}

function startGame() {
  setUp()
  updateQuote()

  // clear old and start a new timer
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000)
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeElapsed++;
    // update the timer text
    document.querySelector(".currTime").textContent = timeLeft + "s"
  }
  else {
    // timer has finished
    finishGame();
  }
}

async function finishGame() {
  // stop the timer
  clearInterval(timer);
  // disable the input area
  document.querySelector(".inputArea").disabled = true;
  document.querySelector(".quote").textContent = "Click restart to start a new game."
  // display restart button
  document.querySelector(".restartBtn").style.display = "block"

  // calculate cpm and wpm
  cpm = Math.round(((charTyped / timeElapsed) * 60))
  wpm = Math.round((((charTyped / 5) / timeElapsed) * 60))
  if (user != null) {
    if (wpm > user.highscore) {
      putHighScore(user.username, wpm)
      document.querySelector(".currBest").innerHTML = wpm
    } else {
      document.querySelector(".currBest").innerHTML = user.highscore
    }
  }
  // update cpm wpm and joke
  document.querySelector(".currCpm").textContent = cpm
  document.querySelector(".currWpm").textContent = wpm
  await findJoke()
  document.querySelector(".joke").innerHTML = 'Don\'t get frustrated if you can\'t increase your WPM, here\'s a joke:<br>' + jokeQuote

  // display the cpm wpm and joke
  document.querySelector(".cpm").style.display = "block"
  document.querySelector(".wpm").style.display = "block"
  document.querySelector(".joke").style.display = "block"
}

function setUp() {
  timeLeft = timeLimit
  timeElapsed = 0
  charTyped = 0
  document.querySelector(".inputArea").disabled = false
  document.querySelector(".inputArea").value = ""
  document.querySelector(".quote").textContent = 'Click on the area below to start the game.'
  document.querySelector(".currTime").textContent = timeLeft + 's'
  document.querySelector(".restartBtn").style.display = "none"
  document.querySelector(".cpm").style.display = "none"
  document.querySelector(".wpm").style.display = "none"
  document.querySelector(".joke").style.display = "none"
}

async function resetValues() {
  if (user != null) {
    user = await getUser(user.username)
    document.querySelector(".currBest").innerHTML = user.highscore
  }
  timeLeft = timeLimit
  timeElapsed = 0
  charTyped = 0
  document.querySelector(".inputArea").disabled = false
  document.querySelector(".inputArea").value = ""
  document.querySelector(".quote").textContent = 'Click on the area below to start the game.'
  document.querySelector(".currTime").textContent = timeLeft + 's'
  document.querySelector(".restartBtn").style.display = "none"
  document.querySelector(".cpm").style.display = "none"
  document.querySelector(".wpm").style.display = "none"
  document.querySelector(".joke").style.display = "none"
}