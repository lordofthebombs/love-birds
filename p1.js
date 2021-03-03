window.addEventListener("load", (e) => { init(); })


function init() {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var microphone;
    var score = 0;
    var randomNote = 0;
    var currentNote = 0;
    var analyser = audioContext.createAnalyser();

    var accuracy = 0.90;

    if (navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia supported!");
        var constraints = {audio: true};
        navigator.mediaDevices.getUserMedia(constraints)
            .then(
                function(stream) {
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    beginRecording();
                })
            .catch(function(err) {console.log("Error! " + err); })
    }
    else {
        console.log("getUserMedia is not supported!");
    }

    function beginRecording() {
        analyser.fftsize = 256;     // Needs to be a power of 2, between 32 and Maximum Unsigned Integer
        var bufferLength = analyser.fftsize;

        var freqBinDataArray = new Uint8Array(bufferLength);

        var checkAudio = function() {
            analyser.getByteFrequencyData(freqBinDataArray);
            currentNote = getIndexOfMax(freqBinDataArray);
            //console.log(freq`:x
            // BinDataArray);
            console.log("RMS: " + getRMS(freqBinDataArray));
            console.log("Index: " + getIndexOfMax(freqBinDataArray));
            if (getRMS(freqBinDataArray) > 30 && ((getIndexOfMax(freqBinDataArray) > Math.floor(randomNote * accuracy)) || (getIndexOfMax(freqBinDataArray) < Math.floor(getIndexOfMax(randomNote) * (accuracy + 0.20))))) {
                score += 1;
                document.getElementById("score").innerHTML = score;
            }
        }

        var randomizeNote = function() {
            randomNote = Math.floor(Math.random() * 200);  // return a random number between 0 and 100
            console.log("Note: " + randomNote);
            document.getElementById("freq-index").innerHTML = randomNote;
        }

        setInterval(checkAudio, 0);
        setInterval(randomizeNote, 2000);
        setInterval(checkScore, 0);

        function checkScore() {
            if (score == 2000) {
                window.location.href = "love.html"
            }
        }
    }
    var canvas = document.getElementById("audiovis");
    var ctx = canvas.getContext("2d");
    var y = 0;
    var chaser = new Image();
    chaser.src = "../images/chaser.png"

    var chasee = new Image();
    chasee.src = "../images/chasee.png"

    function drawRandom() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(chasee, 0, y*2 + 40, 100, 100);

        ctx.drawImage(chaser, 0,currentNote*2 + 40, 100, 100);

        ctx.fillStyle = "#68e615"
        ctx.fillRect(0, 0, score/5, 20);

        ctx.font = "30px Arial";
        ctx.fillText("Goal", 400, 0)
    }


    function update() {
        y = randomNote;
    }

    function renderLoop() {
        update();
        drawRandom();

        window.requestAnimationFrame(renderLoop);
    }

    renderLoop();


}



// RMS = Root Mean Square
function getRMS(spectrum) {
    var rms = 0;

    for (var i = 0; i < spectrum.length; i++) {
        rms += spectrum[i] * spectrum[i];
    }

    rms /= spectrum.length;
    rms = Math.sqrt(rms)
    return rms;
}



function getIndexOfMax(array) {
    return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}