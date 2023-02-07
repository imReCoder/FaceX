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
const expressionEl = document.querySelector("#expression");
const loaderEl = document.querySelector("#loader");

const songListEl = document.querySelector("#song-list");

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
  // console.log(detection);

  let expString = "";
  for (let i = 0; i < detection.length; i++) {
    const face = detection[i];
    if (face && face.expressions) {
      const exp = detection[0].expressions;
      removeAllClasses();
      if (exp.happy > 0.5) {
        expString += "Happy ";
        expressionEl.classList.add("happy");
        debouncedAppendSongs(songs.happySongs);
      } else if (exp.sad > 0.5) {
        expString += "Sad ";
        expressionEl.classList.add("sad");
        debouncedAppendSongs(songs?.sadSongs);
      } else if (exp.angry > 0.5) {
        expString += "Angry ";
        expressionEl.classList.add("angry");
        debouncedAppendSongs(songs?.angrySongs);
      } else if (exp.disgusted > 0.5) {
        expString += "Disgusted ";
        expressionEl.classList.add("disgusted");
        debouncedAppendSongs(songs?.disgustedSongs);
      } else if (exp.fearful > 0.5) {
        expString += "Fearful ";
        expressionEl.classList.add("fearful");
        debouncedAppendSongs(songs?.fearfulSongs);
      } else if (exp.neutral > 0.5) {
        expString += "Neutral ";
        expressionEl.classList.add("neutral");
        debouncedAppendSongs(songs?.neutralSongs);
      } else if (exp.surprised > 0.5) {
        expString += "Surprised ";
        expressionEl.classList.add("surprised");
        debouncedAppendSongs(songs?.surprisedSongs);
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

const removeAllClasses = () => {
  expressionEl.classList.remove("happy");
  expressionEl.classList.remove("sad");
  expressionEl.classList.remove("angry");
  expressionEl.classList.remove("disgusted");
  expressionEl.classList.remove("fearful");
  expressionEl.classList.remove("neutral");
  expressionEl.classList.remove("surprised");
};

const showLoader = () => {
  loaderEl.classList.add("show");
};

const hideLoader = () => {
  loaderEl.classList.remove("show");
};

// debounce append songs once every 10 seconds without any library
let timeout;

const debouncedAppendSongs = (songs) => {
  console.log("debouncedAppendSongs");
  if (timeout) {
    return;
  }
  timeout = setTimeout(() => {
    appendSongs(songs);
    timeout = null;
  }, 5000);
};

const appendSongs = (songs) => {
  songListEl.innerHTML = "";
  console.log(songs);
  songs.forEach((song) => {
    const li = document.createElement("li");
    li.classList.add("song-item");
    const template = `
    <div class="song-info">
      <h4 class="song-title">${song.title}</h4>
      <p class="song-artist">Artist</p>
    </div>
    <div class="song-controls">
      <button class="play-btn">
        <i class="fas fa-play"></i>
      </button>
      <button class="pause-btn">
        <i class="fas fa-pause"></i>
      </button>
    </div>`;
    li.innerHTML = template;

    songListEl.appendChild(li);
  });
};

startDetecting();

const songs = {
  happySongs: [
    {
      title: "Happy Song 1",
      path: "happySong1.mp3",
    },
    {
      title: "Happy Song 2",
      path: "happySong2.mp3",
    },
  ],
  sadSongs: [
    {
      title: "Sad Song 1",
      path: "sadSong1.mp3",
    },
    {
      title: "Sad Song 2",
      path: "sadSong2.mp3",
    },
  ],
  angrySongs: [
    {
      title: "Angry Song 1",
      path: "angrySong1.mp3",
    },
    {
      title: "Angry Song 2",
      path: "angrySong2.mp3",
    },
  ],
  disgustedSongs: [
    {
      title: "Disgusted Song 1",
      path: "disgustedSong1.mp3",
    },
    {
      title: "Disgusted Song 2",
      path: "disgustedSong2.mp3",
    },
  ],

  fearfulSongs: [
    {
      title: "Fearful Song 1",
      path: "fearfulSong1.mp3",
    },
    {
      title: "Fearful Song 2",
      path: "fearfulSong2.mp3",
    },
  ],
  neutralSongs: [
    {
      title: "Neutral Song 1",
      path: "neutralSong1.mp3",
    },
    {
      title: "Neutral Song 2",
      path: "neutralSong2.mp3",
    },
  ],

  surprisedSongs: [
    {
      title: "Surprised Song 1",
      path: "surprisedSong1.mp3",
    },
    {
      title: "Surprised Song 2",
      path: "surprisedSong2.mp3",
    },
  ],
};
