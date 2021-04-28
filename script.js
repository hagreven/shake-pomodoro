var tActive = 10; // in s
var tShortBreak = 60; // in s
var tLongBreak = 7; //in s
var counter = 0; // counts nr of sessions
var timer;
var timerID;
var focused;
var laSensor;
var streak = 0;
var tips = ['Trink was 💧', 'Snack ein Obst 🍏', 'Beweg dich 💃', 'Öffne das Fenster 🦨', 'Geh kurz mal raus ☀️', 'Atme kurz durch 🌪️']; 
var xMax, yMax, zMax; 

window.onload = init();

function init(){
    focused = true;
    setTimer(tActive);
    startLinearAccelerometer();
    document.getElementById('label').innerHTML = "Los geht's!";
}

function startSession(){
    document.getElementById('label').innerHTML = "Höchste Konzentration!";
    if (laSensor != null) {
        laSensor.start();
    }
    countdown();
}

function stopSession(){
    clearInterval(timerID);
    if (laSensor != null) {
        laSensor.stop();
    }
}

function takeBreak(){
    if (laSensor != null){
        //laSensor.stop();
        activeBreak();
    } else {
        showTip();
    }        
    document.getElementById('btn').style.visibility = "hidden";
    let time;
    if(counter < 4){
        //short break
        time = tShortBreak;
    } else {
        // longer break
        time = tLongBreak;
        // new round
        counter = 0;
    }
    setTimer(time);
    countdown();
}

function setTimer(time){
    timer = time;
    let minutes, seconds;
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    
    // Fill in leading 0 if necessary
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    
    // Ausgabe
    document.getElementById('timer').innerHTML = minutes + ":" + seconds;
}

// expects duration in seconds!
function countdown() {
    timerID = setInterval(function () {
        setTimer(timer);
        if (--timer < 0) {
            clearInterval(timerID);
            if (focused) {
                counter++;
                focused = false;
                updateStreak();
                takeBreak();
                document.getElementById('label').innerHTML = "Wohlverdiente Pause";
            } else {
                if(laSensor != null){
                    document.getElementById('score').style.display = "none";
                    document.getElementById('score').style.visibility = "hidden";  
                    document.getElementById('start-msg').style.display = "none";
                    document.getElementById('start-msg').style.visibility = "hidden";
                    document.getElementById('end-msg').style.visibility = "hidden";
                    laSensor.removeEventListener('reading', showScore);
                    laSensor.addEventListener('reading', dontTouch);
                    laSensor.stop();
                }
                resetMsg();
                setTimer(tActive);
                focused = true;
                let btn = document.getElementById('btn');
                btn.innerHTML = "START";
                btn.onclick = startBtn;
                btn.style.visibility = "visible";
                document.getElementById('label').innerHTML = "Und weiter geht's!";
            }
        }
    }, 1000); // invoked every second
}

function startBtn(){
    let btn = document.getElementById('btn');
    btn.innerHTML = "STOP";
    btn.onclick = stopBtn;
    resetMsg();
    startSession();
}

function stopBtn(){
    let btn = document.getElementById('btn');
    btn.innerHTML = "WEITER";
    btn.onclick = startBtn;
    stopSession();
}

function dontTouch(){
    let x = laSensor.x;
    let y = laSensor.y;
    let z = laSensor.z;
    if (Math.abs(x**2 + y**2 + z**2)> 0.15) {
        document.getElementById('message').innerHTML = "Hey, lass dich nicht ablenken!";
        stopBtn();
    }
}

function startLinearAccelerometer(){
    if ('LinearAccelerationSensor' in window) {
        try {
            // 1 reading per second
            laSensor = new LinearAccelerationSensor({frequency: 10});
            laSensor.addEventListener('reading', dontTouch);
        } catch (error) {
          // Handle construction errors.
          if (error.name === 'SecurityError') {
            console.log('Fehler: Zugriff auf Sensor wurde von Permissions Policy blockiert.');
          } else if (error.name === 'ReferenceError') {
            console.log('Fehler: Gerät hat keinen Beschleunigungssensor.');
          } else {
            throw error;
          }
        }
    }
}

function resetMsg(){
    document.getElementById('message').innerHTML = "";
}

function updateStreak(){
    streak++;
    document.getElementById('streak').innerHTML = streak;
}

function showTip(){
    let i = getRandomInt(tips.length - 1);
    let tip = tips[i];
    document.getElementById('message').innerHTML = "<b>Tipp: </b>" + tip;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// val - {xMax, yMax, zMax}, label - {xBar, yBar, zBar}
function move(label, val){
    let bar = document.getElementById(label);
    if (val < 100){
        bar.style.height = val + "%";
    } else {
        bar.style.height = "100%";
    }
}

function showScore(){
    // calculate scores  
    score();
    // display scores as bars
    move("xBar", xMax);
    move("yBar", yMax);
    move("zBar", zMax);
    // additional encouragement
    displayEndMsg();
}

function score(){
    let k = 0.03; // Difficulty factor, the smaller the more/longer one has to shake
    let xs = k*Math.abs(laSensor.x) + xMax;
    let ys = k*Math.abs(laSensor.y) + yMax;
    let zs = k*Math.abs(laSensor.z) + zMax;
    (xs > 100) ? (xMax = 100) : xMax = xs;
    (ys > 100) ? (ymax = 100) : yMax = ys;
    (zs > 100) ? (zMax = 100) : zMax = zs;
}

function displayEndMsg(){
    if(xMax + yMax + zMax >= 300) {
        document.getElementById('end-msg').innerHTML = "Meisterhaft!" + " 💪";
    }
}

function activeBreak(){
    resetScore();
    document.getElementById('score').style.display = "flex";
    document.getElementById('score').style.visibility = "visible";
    document.getElementById('start-msg').style.display = "block";
    document.getElementById('start-msg').style.visibility = "visible";
    laSensor.removeEventListener('reading', dontTouch);
    laSensor.addEventListener('reading', showScore);
}

function resetScore(){
    xMax = 0;
    yMax = 0;
    zMax = 0;
    move("xBar", 2);
    move("yBar", 2);
    move("zBar", 2);
}
