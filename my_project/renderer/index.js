const { ipcRenderer } = require('electron')
const { $, converDuration } = require('./helper')
const jsmediatags = require('jsmediatags')

let musicAudio = new Audio()
let allTracks
let currentTrack
let currentEle

$('add-music-button').addEventListener('click', () => {
    ipcRenderer.send('add-music-window')
})

ipcRenderer.on('getTracks', (event, tracks) => {
    renderListHTML(tracks)
    allTracks = tracks
})

musicAudio.addEventListener('loadedmetadata', () => {
    renderPlayerHTML(currentTrack, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
    if ( currentTrack ) {
        updateProgressHTML(musicAudio.currentTime)
    }
})

musicAudio.addEventListener('ended', () => {
    nextTrack()
    playerButtonControl(currentEle.classList)
})

const updateProgressHTML = (currentTime) => {
    const seeker = $('current-seeker')
    if ( seeker ) {
        seeker.innerHTML = converDuration(currentTime)
    }
}

$('tracksList').addEventListener('click', (event)=> {
    event.preventDefault()
    const { dataset, classList } = event.target
    const id = dataset && dataset.id

    if ( id && classList.contains('fa-trash-alt') ) {

        if ( currentTrack && currentTrack.id === dataset.id ) {
            musicAudio.pause()
            currentTrack = null
        }

        ipcRenderer.send('delete-track', id)
        if ( !currentTrack ) {
            resetRenderPlayerHTML()
        }
        
        return
    }

    if ( id && !(currentTrack && currentTrack.id === dataset.id) ) {
        // new selected music
        currentTrack = allTracks.find(track => track.id === id)
        musicAudio.src = currentTrack.path
        musicAudio.play()
        currentEle = event.target
    }
})

$('player-status').addEventListener('click', (event) => {
    event.preventDefault()
    const { classList } = event.target

    if ( !classList ) return

    if( classList.contains('fa-pause') || classList.contains('fa-play') ) {
        playerButtonControl(classList)
    }

    if ( classList.contains('fa-forward') ) {
        musicAudio.currentTime = fastForward(musicAudio.currentTime, musicAudio.duration)
    } 
    else if ( classList.contains('fa-backward') ) {
        musicAudio.currentTime = fastBackward(musicAudio.currentTime)
    } 
    else if ( classList.contains('fa-step-backward') ) {
        lastTrack()
    } 
    else if ( classList.contains('fa-step-forward') ) {
        nextTrack()
    }
})

const renderListHTML = (tracks) => {
    const tracksList = $('tracksList')
    const tracksListHTML = tracks.reduce((html,track) => {
        html += `<li class="music-track list-group-item row d-flex justify-content-center align-items-center">
            <div class="col-1">
                <img src= ${imageDataChangeToSrc(track.cover)} id="picture" width="45" height="45">
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
                    <i class="fas fa-step-backward data-id="${track.id}"></i>
                    <i class="fas fa-backward"></i>
                    <i id="status-playbtn" class="fas fa-pause mr-2 ml-2" data-id="${track.id}"></i>
                    <i class="fas fa-forward"></i>
                    <i class="fas fa-step-forward data-id="${track.id}"></i>
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

const lastTrack = () => {

    if ( musicAudio.currentTime >= 3 ) {
        musicAudio.currentTime = 0
        return
    }

    for ( i = 0; i < allTracks.length; i++ ) {
        if ( allTracks[i].id === currentTrack.id ) {
            musicAudio.pause()
            currentTrack = allTracks[ i === 0 ? i : i - 1 ]
            musicAudio.src = currentTrack.path
            musicAudio.play()
            return
        }
    }
}

const nextTrack = () => {
    for ( i = 0; i < allTracks.length; i++ ) {
        if ( allTracks[i].id === currentTrack.id ) {
            musicAudio.pause()
            currentTrack = allTracks[ i === allTracks.length - 1 ? i : i + 1 ]
            musicAudio.src = currentTrack.path
            musicAudio.play()
            return
        }
    }
}

const playerButtonControl = (buttonClass) => {
    const statusPlaybtn = $('status-playbtn')
    
    if ( buttonClass.contains('fa-play') ) {
        // play music
        musicAudio.play()
        if ( statusPlaybtn ) statusPlaybtn.classList.replace('fa-play', 'fa-pause')

    }else if ( buttonClass.contains('fa-pause') ) {
        // pause music
        musicAudio.pause()
        statusPlaybtn.classList.replace('fa-pause', 'fa-play')
    }
}

const imageDataChangeToSrc = (cover) => {
    if ( cover ) {
        var base64String = "";
        for (var i = 0; i < cover.data.length; i++) {
            base64String += String.fromCharCode(cover.data[i])
        }
        var src = "data:" + cover.format + ";base64," + window.btoa(base64String)
    } 

    return cover ? src : './test.jpeg'
}