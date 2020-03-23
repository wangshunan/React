const { ipcRenderer } = require('electron')
const { $ } = require('./helper')
const path = require('path')

let musicFilesPath = []

$('select-music').addEventListener('click', () => {
    ipcRenderer.send('open-music-file')
})

$('add-music').addEventListener('click', () => {
    if (musicFilesPath.length > 0) {
        ipcRenderer.send('add-tracks', musicFilesPath)
    }
})

const renderListHTML = (pathes) => {
    const musicList = $('musicList')
    const musicItemHTML = pathes.reduce((html, music) => {
        html += `<li class="row list-group-item d-flex justify-content-center align-items-center">
            <div class="col-1">
                <i class="fas fa-music"></i>
            </div>
            <div class="col-10">
                <b>${path.basename(music)}</b>
            </div>
            <div class="col-1">
                <b>test</b>
            </div>
        </div>
        </li>`
        return html
    }, '')

    musicList.innerHTML = `<ul class="list-group">${musicItemHTML}</ul>`
}

ipcRenderer.on('selected-file', (event, filesPath) => {
    if( Array.isArray(filesPath) ) {
        renderListHTML(filesPath)
        musicFilesPath = filesPath
    }
})