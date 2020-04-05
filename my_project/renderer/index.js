const { ipcRenderer } = require('electron')
const { $, converDuration } = require('./helper')
const jsmediatags = require('jsmediatags')

let musicAudio = new Audio()
let allTracks
let currentTrack
let selectedEle

$('add-music-button').addEventListener('click', () => {
    ipcRenderer.send('add-music-window')
})

ipcRenderer.on('getTracks', (event, tracks) => {
    renderListHTML(tracks)
    allTracks = tracks
})

musicAudio.addEventListener('loadedmetadata', () => {
    musicAudio.currentTime = musicAudio.duration - 10
    renderPlayerHTML(currentTrack, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
    updateProgressHTML(musicAudio.currentTime)
})

musicAudio.addEventListener('ended', () => {
    playerButtonControl(selectedEle.classList)
})

const updateProgressHTML = (currentTime) => {
    const seeker = $('current-seeker')
    seeker.innerHTML = converDuration(currentTime)
}

$('tracksList').addEventListener('click', (event)=> {
    event.preventDefault()
    const { dataset, classList } = event.target
    const id = dataset && dataset.id

    if ( id && classList.contains('fa-trash-alt') ) {

        if ( currentTrack && currentTrack.id === dataset.id ) { 
            musicAudio.pause()
            musicAudio.currentTime = 0
        }

        ipcRenderer.send('delete-track', id)
        resetRenderPlayerHTML()
        return
    }

    if ( id && !(currentTrack && currentTrack.id === dataset.id) ) {
        // new selected music
        currentTrack = allTracks.find(track => track.id === id)
        musicAudio.src = currentTrack.path
        selectedEle = event.target

        // last played music icon reset
        const resetIconEle = document.querySelector('.fa-pause')
        if ( resetIconEle ) resetIconEle.classList.replace('fa-pause', 'fa-play')
    }
    console.log('jsmediatags start')
    jsmediatags.read(currentTrack.path, {
        onSuccess: function(tag) {
          var image = tag.tags.picture;
            if (image) {
              var base64String = "";
              for (var i = 0; i < image.data.length; i++) {
                  base64String += String.fromCharCode(image.data[i]);
              }
              var base64 = "data:" + image.format + ";base64," +
                      window.btoa(base64String);
              document.getElementById('picture').setAttribute('src',base64);
              console.log('jsmediatags end')
            }
        },
        onError: function(error) {
          console.log(':(', error.type, error.info);
        }
      })
    console.log('test')

    playerButtonControl(classList)
})

$('player-status').addEventListener('click', (event) => {
    event.preventDefault()
    const classList = $('status-playbtn').classList
    if( classList.contains('fa-pause') || classList.contains('fa-play') ) {
        playerButtonControl(classList)
    }

    if ( classList && classList.contains('fa-forward') ) {
        musicAudio.currentTime = fastForward(musicAudio.currentTime, musicAudio.duration)
    } else if ( classList.contains('fa-backward') ) {
        musicAudio.currentTime = fastBackward(musicAudio.currentTime)
    }
})

const renderListHTML = (tracks) => {
    const tracksList = $('tracksList')
    const tracksListHTML = tracks.reduce((html,track) => {
        html += `<li class="music-track list-group-item row d-flex justify-content-center align-items-center">
            <div class="col-1">
                <img src= "./test.jpeg" id="picture" width="45" height="45">
            </div>
            <div class="col-9">
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play ml-4 mr-4" data-id="${track.id}"></i>
                <i class="fas fa-trash-alt" data-id="${track.id}"></i>
            </div>
        </div>
        </li>`
        return html
    }, '')

    const trackHTML = `<ul class="list-group scroll">${tracksListHTML}</ul>`
    const emptyTrackHTML = `没有音乐文件`
    tracksList.innerHTML = tracks.length ? trackHTML : emptyTrackHTML
}

const renderPlayerHTML = (track ,duration) => {
    const player = $('player-status')
    const html = `<div class="col-6 font-weight-bold">
                    正在播放: ${track.fileName}
                </div>
                <div class="col-3">
                    <span id="current-seeker">0:00</span> / ${converDuration(duration)}
                </div>
                <div class="col-3">
                    <i class="fas fa-step-backward"></i>
                    <i class="fas fa-backward"></i>
                    <i id="status-playbtn" class="fas fa-pause mr-2 ml-2" data-id="${track.id}"></i>
                    <i class="fas fa-forward"></i>
                    <i class="fas fa-step-forward"></i>
                </div>`
    player.innerHTML = html
}

const resetRenderPlayerHTML = () => {
    const player = $('player-status')
    player.innerHTML = ""
}

const fastForward = (currentTime, duration) => {
    currentTime += 5
    return currentTime <= duration ? currentTime : duration
}

const fastBackward = (currentTime) => {
    currentTime -= 5
    return currentTime >= 0 ? currentTime : 0
}

const playerButtonControl = (buttonClass) => {
    const statusPlaybtn = $('status-playbtn')
    
    if ( buttonClass.contains('fa-play') ) {
        // play music
        musicAudio.play()
        selectedEle.classList.replace('fa-play', 'fa-pause')
        if ( statusPlaybtn ) statusPlaybtn.classList.replace('fa-play', 'fa-pause')

    }else if ( buttonClass.contains('fa-pause') ) {
        // pause music
        musicAudio.pause()
        statusPlaybtn.classList.replace('fa-pause', 'fa-play')
        selectedEle.classList.replace('fa-pause', 'fa-play')
    }
}