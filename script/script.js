let currentSong = new Audio();

let playpause = document.querySelector(".play-pause");
let next = document.querySelector(".next");
let prev = document.querySelector(".prev");
let display_song_name = document.querySelector(".display.song-name");
let song_artist = document.querySelector(".song-artist");
let display_song_artist = document.querySelector(".display.song-artist");
let song_time = document.querySelector(".song-time");
let song_current_time = document.querySelector(".song-current-time");
let volume_icon = document.querySelector(".side-box i");
let volume_range = document.getElementById("volume");
let songcount = 0;
volume_range.value = 100;
let count = 0;
let currfolder;
let curralbum;
let songs = [];
let cardcontainer = document.getElementById("albums");

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5502/5_spotify_project/${currfolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let link = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < link.length; index++) {
    const e = link[index];
    if (e.href.endsWith("mp3")){
      songs.push(e.href.split(`/${currfolder}/`)[1]);
      console.log(`Added song: ${e.href.split(`/${currfolder}/`)[1]}`);
    }
  }
  console.log(`Songs array: ${songs}`);
  
  let songul = document.querySelector(".songs ul");
  currentSong.src = `/5_spotify_project/${currfolder}/${songs[0]}`;
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML += `
             <li class="songlist flex align-center" data-link="${song}">
                    <div class="flex songleft align-center">
                    <i class="fa-solid fa-music"></i>
                    <div class="info flex dir-col">
                        <div class="song-name">${song.replaceAll(
                          "%20",
                          " "
                        )}</div>
                        <div class="song-artist">Songartist</div>
                    </div></div>
                    <div class="play flex align-center">
                        <span>play now</span>
                        <i class="fa-regular fa-circle-play"></i>
                    </div>
                </li>
        `;
  }
  Array.from(document.querySelectorAll(".songlist")).forEach((e, i) => {
    e.addEventListener("click", () => {
      songcount = i;
      let link = e.getAttribute("data-link");
      console.log(`Playing song: ${link}`);
      playMusic(link);
    });
  });

  return songs; // Ensure that the function returns the songs array
}

function changeicon(i) {
  document.querySelectorAll(".sonlist .play")[i];
  console.log("hello");
  console.log(document.querySelectorAll(".sonlist .play")[i]);
}

function displaysongname() {
  display_song_name.textContent = currentSong.src
    .split(`/${currfolder}/`)[1]
    .replaceAll("%20", " ");
}

function playMusic(track) {
  currentSong.src = `/5_spotify_project/${currfolder}/${track}`;
  currentSong.play();
  document.querySelector(".bars").classList.remove("none");
  playpause.classList.remove("fa-circle-play");
  playpause.classList.add("fa-circle-pause");
  displaysongname();
  document.querySelectorAll(".songlist").forEach((song) => {
    song.classList.remove("playing");
  });
  const currentSongElement = document.querySelector(
    `.songlist[data-link="${track}"]`
  );
  if (currentSongElement) {
    currentSongElement.classList.add("playing");
  }
}

function convertSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

function displaceCircle(value) {
  value -= 1;
  document.querySelector(".play-line .circle").style.left = `${value}%`;
}

function update_volume_icon(value) {
  if (value > 50) {
    volume_icon.classList.remove("fa-volume-low", "fa-volume-xmark");
    volume_icon.classList.add("fa-volume-high");
    count = 0;
  } else if (value > 0) {
    volume_icon.classList.remove("fa-volume-high", "fa-volume-xmark");
    volume_icon.classList.add("fa-volume-low");
    count = 1;
  } else {
    volume_icon.classList.remove("fa-volume-high", "fa-volume-low");
    volume_icon.classList.add("fa-volume-xmark");
    count = 2;
  }
}

function setvolume(value) {
  currentSong.volume = parseInt(value) / 100;
}

async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:5502/5_spotify_project/song/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  console.table(anchors);
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/song/")) {
      let album = e.href.split("/").slice(-1)[0];
      // get meta data of the folder
      let a = await fetch(
        `http://127.0.0.1:5502/5_spotify_project/song/${album}/info.json`
      );
      let response = await a.json();
      let description = response.description;
      if (description.length > 34) {
        description = description.slice(0, 33) + "...";
      }
      console.log(response);
      cardcontainer.innerHTML += `<div data-album="${album}" class="card square flex dir-col pointer">
                  <button class="play-button box pointer" type="button">
                      <i class="fa-solid fa-play"></i>
                  </button>
                  <img
                    class="box-img"
                    src="/5_spotify_project/song/${album}/cover.jpg"
                    alt="album cover"
                  />
                  <div class="card-heading">${response.title}</div>
                  <p class="card-content">
                    ${description}
                  </p>
                </div>`;
      // load the playlist when card is clicked
      document.querySelectorAll(".card.square").forEach((e) => {
        e.addEventListener("click", async (item) => {
          document.querySelector(".bars").classList.remove("none");
          let album = e.getAttribute("data-album");
          console.log(`Clicked album: ${album}`);
          songs = await getsongs(`song/${album}`);
          console.log(`Songs loaded: ${songs}`);
          songcount = 0; // Reset songcount when switching albums
          playMusic(songs[0]); // Play the first song automatically
        });
      });
    }
  }
}

async function main() {
  await getsongs("song/album1");
  console.log(`Initial songs: ${songs}`);

  // display all the albums
  displayalbums();

  // for play, next and prev
  playpause.addEventListener("click", () => {
    document.querySelector(".bars").classList.remove("none");
    if (currentSong.paused) {
      currentSong.play();
      playpause.classList.remove("fa-circle-play");
      playpause.classList.add("fa-circle-pause");
      displaysongname();
    } else {
      currentSong.pause();
      playpause.classList.remove("fa-circle-pause");
      playpause.classList.add("fa-circle-play");
    }
  });

  // listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = convertSeconds(currentSong.currentTime);
    let duration = convertSeconds(currentSong.duration);
    console.log(currentTime, duration);
    song_current_time.innerHTML = `${currentTime}`;
    song_time.innerHTML = `${duration}`;
    let displace_value = (currentSong.currentTime / currentSong.duration) * 100;
    displaceCircle(displace_value);
  });

  // play-line event listener
  document.querySelector(".play-line").addEventListener("click", (e) => {
    let displace_value =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    displaceCircle(displace_value);
    currentSong.currentTime = (displace_value / 100) * currentSong.duration;
  });

  // event for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
  });

  document.querySelector(".logo .fa-xmark").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // prev and next
  prev.addEventListener("click", () => {
    songcount--;
    if (songcount < 0) {
      songcount = songs.length - 1;
    }
    console.log(`Previous song index: ${songcount}`);
    let e = songs[songcount];
    playMusic(e);
  });

  next.addEventListener("click", () => {
    songcount++;
    if (songcount >= songs.length) {
      songcount = 0;
    }
    console.log(`Next song index: ${songcount}`);
    let e = songs[songcount];
    playMusic(e);
  });

  // volume change
  volume_range.addEventListener("input", (e) => {
    let volume_value = e.target.value;
    setvolume(volume_value);
    console.log(volume_value);
    update_volume_icon(volume_value);
  });

  // click effect also
  volume_icon.addEventListener("click", (e) => {
    count++;
    if (count == 1) {
      volume_icon.classList.remove("fa-volume-high");
      volume_icon.classList.add("fa-volume-low");
      volume_range.value = 50;
      setvolume(50);
    }
    if (count == 2) {
      volume_icon.classList.remove("fa-volume-low");
      volume_icon.classList.add("fa-volume-xmark");
      volume_range.value = 0;
      setvolume(0);
    }
    if (count == 3) {
      volume_icon.classList.remove("fa-volume-xmark");
      volume_icon.classList.add("fa-volume-high");
      volume_range.value = 100;
      setvolume(100);
      count = 0;
    }
  });
  // Function to play the next song
  function playNextSong() {
    songcount++;
    if (songcount >= songs.length) {
      songcount = 0; // Reset to the first song if at the end
    }
    let nextSong = songs[songcount];
    playMusic(nextSong);
  }

  // Add event listener for the 'ended' event on the audio element
  currentSong.addEventListener("ended", playNextSong);
}

main();
