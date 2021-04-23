var tActive = 25; //min
var tShortBreak = 5; //ms
var tLongBreak = 15; //ms
var counter = 0; // counts nr of 25 min sessions
var timer;
var timerID;

window.onload = init();

function init(){
    timer = tActive*60;
    document.getElementById('timer').innerHTML = tActive + ":00";
}

function startSession(){
    counter++;
    display = document.getElementById('timer');
    countdown(timer, display);
    startLinearAccelerometer();
}

function stopSession(){
    clearInterval(timerID);
    counter--;
    document.getElementById('message').innerHTML = "Du sollst arbeiten. Das zählt nicht!";
}

function takeBreak(){
    
}

function activeBreak() {
    document.getElementById('timer');
}

// expects duration in seconds!
function countdown(duration, display) {
    timer = duration;
    let minutes, seconds;
    timerID = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        // Fill in leading 0 if necessary
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
            // TO-DO: Trigger Break!!!
        }
    }, 1000); // invoked every second
}

function startBtn(){
    startSession();
    let btn = document.getElementById('btn');
    btn.innerHTML = "Stop";
    btn.onclick = stopBtn;    
}

function stopBtn(){
    stopSession();
    let btn = document.getElementById('btn');
    btn.innerHTML = "Restart";
    btn.onclick = startBtn;
}

function dontTouch(x, y, z){
    if (x != 0 || y != 0 || z != 0) {
        stopSession();
    }
}

function startLinearAccelerometer(){
    if ('LinearAccelerationSensor' in window) {
        try {
            // 1 reading per second
            laSensor = new LinearAccelerationSensor({frequency: 1});
            laSensor.addEventListener('reading', e => {
                dontTouch(laSensor.x, laSensor.y, laSensor.z);
            });
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