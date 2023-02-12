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
// const context = canvas.getContext("2d");
const expressionEl = document.querySelector("#expression");
const loaderEl = document.querySelector("#loader");

const songListEl = document.querySelector("#song-list");
const songTypeEl = document.querySelector("#song-type");
const songLock = document.querySelector("#song-lock");
let isSongLock = false;
songLock.addEventListener("change", () => {
  isSongLock = !isSongLock;
})


function videoLoaded() {
  console.log("video loaded");

  //   video.play();
}



const startDetecting = async () => {
  showLoader();
  var constraints = {
    audio: false,
    video: {
      width: { ideal: 500 },
      height: { ideal: 500 },
      facingMode: "user",
      frameRate: {
        ideal: 10,
        max: 15
      }
    }
  };
  let stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");
  // await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceExpressionNet.loadFromUri("./models");
  // await faceapi.nets.ageGenderNet.loadFromUri("./models");
  hideLoader();
  drawLoop();
};

const drawLoop = async () => {

  const detection = await faceapi
    .detectAllFaces(video)
    // .withFaceLandmarks()
    .withFaceExpressions()
    // .withAgeAndGender();
  // console.log(detection);

  let expString = "";
  removeAllClasses();
  if (!detection.length) {
    expString = "No Face";
    expressionEl.classList.add("no-face");
  }
  for (let i = 0; i < detection.length; i++) {
    const face = detection[i];
    if (face && face.expressions) {
      const exp = face.expressions;
      if (exp.happy > 0.5) {
        expString += "Happy ";
        expressionEl.classList.add("happy");
        debouncedAppendSongs(songs.happySongs, "happy");
      } else if (exp.sad > 0.5) {
        expString += "Sad ";
        expressionEl.classList.add("sad");
        debouncedAppendSongs(songs?.sadSongs, "sad");
      } else if (exp.angry > 0.5) {
        expString += "Angry ";
        expressionEl.classList.add("angry");
        debouncedAppendSongs(songs?.angrySongs, "angry");
      } else if (exp.disgusted > 0.5) {
        expString += "Disgusted ";
        expressionEl.classList.add("disgusted");
        debouncedAppendSongs(songs?.disgustedSongs, "disgusted");
      } else if (exp.fearful > 0.5) {
        expString += "Fearful ";
        expressionEl.classList.add("fearful");
        debouncedAppendSongs(songs?.fearfulSongs, "fearful");
      } else if (exp.neutral > 0.5) {
        expString += "Neutral ";
        expressionEl.classList.add("neutral");
        debouncedAppendSongs(songs?.neutralSongs, "neutral");
      } else if (exp.surprised > 0.5) {
        expString += "Surprised ";
        expressionEl.classList.add("surprised");
        debouncedAppendSongs(songs?.surprisedSongs, "surprised");
      }
    }
    // context.strokeStyle = "#FFFF00";
    // context.lineWidth = 5;
    // const { left, right, width, height } = face.alignedRect.box;
    // context.beginPath();
    // context.rect(left, right, width, height);
    // context.stroke();
  }
  expression.innerHTML = expString;
  requestAnimationFrame(drawLoop);
};

const removeAllClasses = () => {
  expressionEl.classList.remove("happy");
  expressionEl.classList.remove("sad");
  expressionEl.classList.remove("angry");
  expressionEl.classList.remove("disgusted");
  expressionEl.classList.remove("fearful");
  expressionEl.classList.remove("neutral");
  expressionEl.classList.remove("surprised");
  expressionEl.classList.remove("no-face");
};

const showLoader = () => {
  loaderEl.classList.add("show");
};

const hideLoader = () => {
  loaderEl.classList.remove("show");
};

// debounce append songs once every 10 seconds without any library
let timeout;
const debounceTime = 1000
const debouncedAppendSongs = (songs, mood) => {
  if (timeout) {
    return;
  }
  timeout = setTimeout(() => {
    appendSongs(songs, mood);
    timeout = null;
  }, debounceTime);
};


let audio;
let currentlyPlayingSongId;
let currentMood = null;

const markAllSongsPause = () => {
  const songEls = document.querySelectorAll(".song-controls");
  songEls.forEach((songEl) => {
    pauseSongUiUpdate(songEl);
  })
}
const playSongs = (songs, songId) => {
  // clear all audio started before
  if (audio) {
    audio.pause();
  }
  let song = songs[0];
  if (songId) {
    song = songs.find((song) => song.id === songId);
  }

  if (!song) {
    song = songs[0];
  }
  markAllSongsPause();
  audio = new Audio(song.path);
  audio.play();
  currentlyPlayingSongId = song.id;
  // get song element
  const songEl = document.querySelector(`#${song.id}`);
  console.log("song el is: ", songEl);

  playSongUiUpdate(songEl);

  audio.addEventListener("ended", () => {
    playSongs(songs.slice(1));
  });

};

const playSongUiUpdate = (songEl) => {
  if (songEl) {
    const playButton = songEl.querySelector(".play-btn");
    const pauseButton = songEl.querySelector(".pause-btn");
    playButton.classList.add("hide");
    playButton.classList.remove('show')
    pauseButton.classList.remove("hide");
    pauseButton.classList.add("show");

    // add active class to its parent element
    songEl.parentElement.classList.add("active");
  }
}

const pauseSongUiUpdate = (songEl) => {
  if (songEl) {
    const playButton = songEl.querySelector(".play-btn");
    const pauseButton = songEl.querySelector(".pause-btn");
    playButton.classList.remove("hide");
    playButton.classList.add("show");
    pauseButton.classList.add("hide");
    pauseButton.classList.remove("show");
    // remove active class from its parent element
    songEl.parentElement.classList.remove("active");
  }
}



const playSong = (songEl) => {
  const songId = songEl.id;
  if (currentlyPlayingSongId === songId) {
    if (audio) {
      audio.play();
      playSongUiUpdate(songEl);
      return
    }
  }
  console.log("play song id is: ", songId);
  const song = songs[currentMood + "Songs"].find((song) => song.id === songId);
  console.log("song is: ", song);
  if (song) {
    playSongs([song]);
  }
}

const pauseSong = (songEl) => {
  console.log("pause song id is: ", songEl);
  if (audio) {
    audio.pause();
  }
  // const songEl = document.querySelector(`#${songId}`);
  console.log("song el is: ", songEl);
  pauseSongUiUpdate(songEl);
}

let lastMood = null;
const appendSongs = (songs, mood) => {
  if (isSongLock) {
    return console.log("song lock is on..");
  }
  currentMood = mood;
  // check if last songs are same as current songs
  console.log("latest mood", lastMood, " current mood", mood);
  if (lastMood === mood) {
    return;
  }
  songTypeEl.innerHTML = mood;

  songListEl.innerHTML = "";
  // console.log(songs);
  songs.forEach((song) => {
    const li = document.createElement("li");
    li.classList.add("song-item");
    const template = `
    <div class="song-info">
      <h4 class="song-title">${song.title}</h4>
      <p class="song-artist">Artist</p>
    </div>
    <div id="${song.id}" class="song-controls">
      <button class="control play-btn" onclick='playSong(${song.id})'>
        <i class="fas fa-play"></i>
      </button>
      <button class="control pause-btn" onclick='pauseSong(${song.id})'>
        <i class="fas fa-pause"></i>
      </button>
    </div>`;
    li.innerHTML = template;

    songListEl.appendChild(li);
  });
  lastMood = mood;
  playSongs(songs);
};

startDetecting();

const songs = {
  happySongs: [
    {
      title: "Mann mera",
      path: "./songs/happySong1.mp3",
      id: "happySong1",
    },
    {
      title: "Excuses",
      path: "./songs/happySong2.mp3",
      id: "happySong2",
    },
    {
      title: "Hey Baby",
      path: "./songs/happySong3.mp3",
      id: "happySong3",
    }
  ],
  sadSongs: [
    {
      title: "Chahun main ya na",
      path: "./songs/sadSong1.mp3",
      id: "sadSong1",

    }, {
      title: "Desire",
      path: "./songs/sadSong2.mp3",
      id: "sadSong2",

    },
    {
      title: "Kyun main jaagoon",
      path: "./songs/sadSong3.mp3",
      id: "sadSong3",
    },
    {
      title: "Tu jo mila",
      path: "./songs/sadSong4.mp3",
      id: "sadSong4",

    }
  ],
  angrySongs: [
    {
      title: "So High",
      path: "./songs/angrySong1.mp3",
      id: "angrySong1",

    },
    {
      title: "Insane",
      path: "./songs/angrySong2.mp3",
      id: "angrySong2",
    },
    {
      title: "Bang Bang",
      path: "./songs/angrySong3.mp3",
      id: "angrySong3",
    },
    {
      title: "We Rollin",
      path: "./songs/angrySong4.mp3",
      id: "angrySong4",
    }

  ],
  disgustedSongs: [
    {

      title: "Labon ko",
      path: "./songs/disgustedSong1.mp3",
      id: "disgustedSong1",

    },
    {
      title: "Tu jo mila",
      path: "./songs/disgustedSong2.mp3",
      id: "disgustedSong2",

    },
    {
      title: "Aao milo chalo",
      path: "./songs/disgustedSong3.mp3",
      id: "disgustedSong3",
    },
  ],

  fearfulSongs: [
    {
      title: "Hanuman Chalisa",
      path: "./songs/fearfulSong1.mp3",
      id: "fearfulSong1",
    }
  ],
  neutralSongs: [
    {
      title: "Zindagi do pal ki",
      path: "./songs/neutralSong1.mp3",
      id: "neutralSong1",
    },
    {
      title: "Beete Lamhein",
      path: "./songs/neutralSong2.mp3",
      id: "neutralSong2",

    },
    {
      title: "Pal",
      path: "./songs/neutralSong3.mp3",
      id: "neutralSong3",
    },
    {
      title: "Shayad",
      path: "./songs/neutralSong4.mp3",
      id: "neutralSong4",
    }
  ],

  surprisedSongs: [
    {
      title: "Bad Munda",
      path: "./songs/surprisedSong1.mp3",
      id: "surprisedSong1",
    },
    {
      title: "Blue Eyes",
      path: "./songs/surprisedSong2.mp3",
      id: "surprisedSong2",

    },
    {
      title: "Desire",
      path: "./songs/surprisedSong3.mp3",
      id: "surprisedSong3",
    },
    {
      title: "Amplifier",
      path: "./songs/surprisedSong4.mp3",
      id: "surprisedSong4",
    }
  ],
};
