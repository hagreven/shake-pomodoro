var tActive = 60; // in s
var tShortBreak = 15; // in s
var tLongBreak = 5; //in s
var counter = 0; // counts nr of sessions
var timer;
var timerID;
var focused;
var laSensor;

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
        laSensor.addEventListener('reading', e => {
            dontTouch(laSensor.x, laSensor.y, laSensor.z);
        });
    }
    countdown();
}

function stopSession(){
    clearInterval(timerID);
    if (laSensor != null) {
        laSensor.removeEventListener('reading');
    }
}

function takeBreak(){
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
                takeBreak();
                document.getElementById('label').innerHTML = "Wohlverdiente Pause";
            } else {
                setTimer(tActive);
                focused = true;
                let btn = document.getElementById('btn');
                btn.innerHTML = "START";
                btn.onclick = startBtn;
                btn.style.visibility = "visible";
                document.getElementById('label').innerHTML = "Und weiter geht's! Starte die nächste Session";
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

function dontTouch(x, y, z){
    if (Math.sqrt(Math.abs(x**2 + y**2 + z**2))> 0.1) {
        document.getElementById('message').innerHTML = "Hey, lass dich nicht ablenken!";
        stopBtn();
    }
}

function startLinearAccelerometer(){
    if ('LinearAccelerationSensor' in window) {
        try {
            // 1 reading per second
            laSensor = new LinearAccelerationSensor({frequency: 1});
            laSensor.start();
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