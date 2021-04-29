// #################################################### Objects & Variables #################################################################

// --------------------------------------------------- time interval settings ---------------------------------------------------------------
var tActive = 25*60; // time for one session-block in s
var tShortBreak = 5*60; // time for short break in s
var tLongBreak = 15*50; // time for longer break (once every 4 sessions) in s
var counter = 0; // counts nr of session-blocks completed

// ----------------------------------------------------------- timer ------------------------------------------------------------------------
var timer;
var timerID;
var focused;

// ------------------------------------------ linear acceleration sensor for movement detection ---------------------------------------------
var laSensor;

// ----------------------------------------------- gamification elements for motivation -----------------------------------------------------
var streak = 0;

// ---------------------------------------------------- active break: tipps, scores, messages -----------------------------------------------
var tips = ['Trink was 💧', 'Snack ein Obst 🍏', 'Beweg dich 💃', 'Öffne das Fenster 🦨', 'Geh kurz mal raus ☀️', 'Atme kurz durch 🌪️']; 
var xMax, yMax, zMax;

// ------------------------------------------------------------- sounds ---------------------------------------------------------------------
var ring1 = new Audio('sounds/bell-1x.mp3');
var ring2 = new Audio('sounds/bell-2x.mp3');


// ############################################################## LOGIC #####################################################################

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
    // hide button during break
    document.getElementById('btn').style.visibility = "hidden";
    if (laSensor != null){
        // if available make use of acceleration sensor
        activeBreak();
    } else {
        // else show tip for active break
        showTip();
    }
    // set time according to number of session-blocks 
    let time;
    if(counter < 4){
        //short break
        time = tShortBreak;
    } else {
        // longer break (every 4 blocks)
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

function countdown() {
    timerID = setInterval(function () {
        setTimer(timer);
        if (--timer < 0) {
            clearInterval(timerID);
            if (focused) {
                ring1.play();
                counter++;
                focused = false;
                updateStreak();
                takeBreak();
                document.getElementById('label').innerHTML = "Wohlverdiente Pause";
            } else {
                ring2.play();
                if(laSensor != null){
                    endActiveBreak();
                }
                endBreak();
            }
        }
    }, 1000); // invoked every second
}

function endActiveBreak(){
    // remove scores and messages from view
    document.getElementById('score').style.display = "none";
    document.getElementById('score').style.visibility = "hidden";  
    document.getElementById('start-msg').style.display = "none";
    document.getElementById('start-msg').style.visibility = "hidden";
    document.getElementById('end-msg').style.display = "none";
    document.getElementById('end-msg').style.visibility = "hidden";
    // switch acceleration sensor listener
    laSensor.removeEventListener('reading', showScore);
    laSensor.addEventListener('reading', dontTouch);
    laSensor.stop();                    
}

function endBreak() {
    setTimer(tActive);
    focused = true;
    // bring back Button
    let btn = document.getElementById('btn');
    btn.innerHTML = "START";
    btn.onclick = startBtn;
    btn.style.visibility = "visible";
    // change messages displayed
    resetMsg();
    document.getElementById('label').innerHTML = "Und weiter geht's!";
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
    let tresh = 0.15 // sensibility
    if ( x > tresh || y > tresh || z > thresh) {
        document.getElementById('message').innerHTML = "Hey, lass dich nicht ablenken!";
        // stop counting if user picks up phone
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
    calcScore();
    // display scores as bars
    move("xBar", xMax);
    move("yBar", yMax);
    move("zBar", zMax);
    // additional encouragement
    displayEndMsg();
}

function calcScore(){
    let k = 0.03; // Difficulty factor, the smaller the more/longer one has to shake
    let xs = k*Math.abs(laSensor.x) + xMax;
    let ys = k*Math.abs(laSensor.y) + yMax;
    let zs = k*Math.abs(laSensor.z) + zMax;
    (xs >= 100) ? (xMax = 100) : (xMax = xs);
    (ys >= 100) ? (ymax = 100) : (yMax = ys);
    (zs >= 100) ? (zMax = 100) : (zMax = zs);
}

function displayEndMsg(){
    let s = xMax + yMax + zMax;
    if(s > 299) {
        document.getElementById('end-msg').innerHTML = "Meisterhaft!" + " 💪";
        document.getElementById('end-msg').style.display = "block";
        document.getElementById('end-msg').style.visibility = "visible";
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