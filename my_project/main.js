// Modules to control application life and create native browser window
const { dialog, app, BrowserWindow, ipcMain, screen } = require('electron')
const DataStore = require('./renderer/MusicDataStore')
const myStore = new DataStore({'name': 'Music Data'})
const remote = require('electron').remote;

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation){
    const basicConfig = {
      webPreferences: {
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
  let size = screen.getPrimaryDisplay().size 
  let scaleFactor = screen.getPrimaryDisplay().scaleFactor
  let dWidth = parseInt(size.width * scaleFactor)
  let dHeight = parseInt(size.height * scaleFactor)

  console.log(dHeight / 2.16)
  
  const mainWindow = new AppWindow({
    width: Math.floor(dWidth / 2.4),
    height: Math.floor(dHeight / 1.8),
    resizable: false
  }, './renderer/index.html')
  mainWindow.webContents.on('did-finish-load', () => {
    const updatedTracks = myStore.getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('add-music-window', () => {
    if ( mainWindow.getChildWindows().length < 1 ) { 
      const addWindow = new AppWindow({
        width: Math.floor(dWidth / 3.2),
        height: Math.floor(dHeight / 2.16),
        parent: mainWindow,
        modal: true,
        resizable: false
      }, './renderer/add.html')

      addWindow.setMenu(null)
      // addWindow.webContents.openDevTools()
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

  ipcMain.on('add-tracks', async(event, tracks) => {
    const updatedTracks = await (await myStore.addTracks(tracks)).getTracks()
    mainWindow.send('getTracks', updatedTracks)
    mainWindow.getChildWindows()[0].close()
  })

  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
})
