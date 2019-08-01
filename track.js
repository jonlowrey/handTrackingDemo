const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const handCanvas = document.getElementById("handpic");
const handContext = handCanvas.getContext("2d");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;
let getHandBool = false;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.9,    // confidence threshold for predictions.
}

function toggleHand(){
    getHandBool = !getHandBool;
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

function getHand(predictions){
    if(getHandBool){
        console.log(predictions.length + " HANDS!");
        for(i=0;i<predictions.length;i++){
            if(predictions[i].score > 0.9){
                console.log("Good Hand at index " + i);
                var bbox = predictions[i].bbox;
                var handimg = context.getImageData(bbox[0]+10,bbox[1]+10,bbox[2]+10,bbox[3]+10);
                handContext.putImageData(handimg,0,0);
                getHandBool = false;
                break;
            }
        }
    }

}



function runDetection() {
    model.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);
        if(predictions.length>0){
            getHand(predictions);
        }
        model.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});

