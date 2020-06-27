window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
var analyser;
var distortion;
var source;

const URL = 'http://localhost:8000/audios/see_you_again.mp3';
var playing = false;

function onLoadError() {
    alert('Error while loading song');
}

const startButton = document.querySelector('#playSound');
startButton.onclick = function () {
    context = new AudioContext();
    analyser = context.createAnalyser();
    distortion = context.createWaveShaper();
    source = context.createBufferSource();

    var request = new XMLHttpRequest();
    request.open('GET', URL, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
            playing = true;
            playSound(buffer);
        }, onLoadError)
    }

    request.send();
}

const stopButton = document.querySelector('#stopSound');
stopButton.onclick = function () {
    if (playing) {
        source.stop(0);
    }
}

async function playSound(buffer) {
    analyser.fftSize = 1024 //Math.pow(2, 10);
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(distortion);
    distortion.connect(context.destination);

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    // const WIDTH = 1200;
    // const HEIGHT = 512;

    var canvas = document.getElementById('oscilloscope');
    var canvasCtx = canvas.getContext("2d");
    source.start(0);

    // function draw() {
    //     requestAnimationFrame(draw);
    //     analyser.getByteTimeDomainData(dataArray);
    //     canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    //     canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    //     var barWidth = (WIDTH / bufferLength) * 2.5;
    //     var barHeight;
    //     var x = 0;

    //     for (var i = 0; i < bufferLength; i++) {
    //         barHeight = (dataArray[i] / 2) * 5;
    //         canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
    //         canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

    //         x += barWidth + 3;
    //     }

    //     counter++;
    // }

    // draw();

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(255, 255, 255)";
        canvasCtx.beginPath();

        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    draw();
}
