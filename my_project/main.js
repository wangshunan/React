// Modules to control application life and create native browser window
const { dialog, app, BrowserWindow, ipcMain } = require('electron')
const DataStore = require('./renderer/MusicDataStore')
const myStore = new DataStore({'name': 'Music Data'})
const remote = require('electron').remote;

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation){
    const basicConfig = {
      webPreferences: { 
        weidth: 800,
        height: 600,
        nodeIntegration: true 
      },
      show: false
    }

    const finalConfig = Object.assign(basicConfig, config)
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

app.on ('ready', () => {
  // Create the browser window.
  const mainWindow = new AppWindow({
    resizable: false
  }, './renderer/index.html')
  mainWindow.webContents.on('did-finish-load', () => {
    const updatedTracks = myStore.getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('add-music-window', () => {
    if ( mainWindow.getChildWindows().length < 1 ) { 
      const addWindow = new AppWindow({
        width: 600,
        height: 500,
        parent: mainWindow,
        modal: true,
        resizable: false
      }, './renderer/add.html')

      addWindow.setMenu(null)
      addWindow.webContents.openDevTools()
    }
  })

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'music file', extensions: ['mp3', "m4a"] }]
    }).then(result  => {
      if (result) {
        event.sender.send('selected-file', result.filePaths)
      }
    })
  })

  ipcMain.on('add-tracks', (event, tracks) => {
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks', updatedTracks)
    mainWindow.getChildWindows()[0].close()
  })

  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
})
