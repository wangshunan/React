// Modules to control application life and create native browser window
const { dialog, app, BrowserWindow, ipcMain } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

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
  const mainWindow = new AppWindow({
    width: 800,
    height: 600,
  }, './renderer/index.html')

  ipcMain.on('add-music-window', () => {
    const addWindow = new AppWindow({
      width: 600,
      height: 500,
      parent: mainWindow
    }, './renderer/add.html')

    addWindow.setMenu(null)
  })

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'text file', extensions: ['txt'] }]
    }).then(result  => {
      if (result) {
        event.sender.send('selected-file', result.filePaths)
      }
    })
  })

  ipcMain.on('add-tracks', (event, tracks) => {
    console.log('muisicPilesPath is not empty')
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    console.log(updatedTracks)
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
})
