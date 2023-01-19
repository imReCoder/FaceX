document.addEventListener("deviceready", onDeviceReady, false);
let isDeviceReady = false;

function onDeviceReady() {
  isDeviceReady = true;
  alert("Device is ready");
  startDetecting();
}

let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvaContainer = document.querySelector("#canvaContainer");
const expression = document.querySelector("#expression");
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

function renderLoop() {
  requestAnimationFrame(renderLoop);
  context.clearRect(0, 0, 300, 300);
  context.drawImage(video, 0, 0, 300, 300);
  drawLoop();
}

const startDetecting = async () => {

  let stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  video.srcObject = stream;
  await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceExpressionNet.loadFromUri("./models");

  renderLoop();
};

const drawLoop = async () => {
  // get the image data from the video element

  // const canvas = faceapi.createCanvasFromMedia(video);
  // set canva size

  const detection = await faceapi
    .detectAllFaces(video)
    .withFaceLandmarks()
    .withFaceExpressions();
  //    .withAgeAndGender();
  console.log(detection);

  let expString = "";
  for (let i = 0; i < detection.length; i++) {
    const face = detection[i];
    if (face && face.expressions) {
      const exp = detection[0].expressions;
      if (exp.happy > 0.5) {
        expString += "Happy ";
      } else if (exp.sad > 0.5) {
        expString += "Sad ";
      } else if (exp.angry > 0.5) {
        expString += "Angry ";
      } else if (exp.disgusted > 0.5) {
        expString += "Disgusted ";
      } else if (exp.fearful > 0.5) {
        expString += "Fearful ";
      } else if (exp.neutral > 0.5) {
        expString += "Neutral ";
      } else if (exp.surprised > 0.5) {
        expString += "Surprised ";
      }
    }
    context.strokeStyle = "#FFFF00";
    context.lineWidth = 5;
    const { left, right, width, height } = face.alignedRect.box;
    context.beginPath();
    context.rect(left, right, width, height);
    context.stroke();
  }
  expression.innerHTML = expString;
};

startDetecting();
