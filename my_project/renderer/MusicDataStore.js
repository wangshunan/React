const Store = require('electron-store')
const { ipcRecderer } = require('electron')
const path = require('path')
const uuidv4 = require('uuid/v4')
const jsmediatags = require('jsmediatags')

class DataStore extends Store {
    constructor(settings) {
        super(settings)
        this.tracks = this.get('tracks') || []
    }

    saveTracks() {
        this.set('tracks', this.tracks)
        return this
    }

    getTracks() {
        return this.get('tracks') || []
    }

    getTracksData(track) {
      jsmediatags.read(track, {
        onSuccess: function(tag) {
          var image = tag.tags.picture;
          if (image) {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i])
            }
            var base64 = "data:" + image.format + ";base64," +
                    window.btoa(base64String)
            console.log(base64)
          }
        },
        onError: function(error) {
          console.log(':(', error.type, error.info);
        }
      })
      // const tracksData = await Promise.all(
      //   tracks.map(async (track) => {
      //     var tag
      //     tag = await awaitableJsmediatags(track)
      //     return {
      //       path: track,
      //       fileName: path.basename(track)
      //     }
      //   })
      // )
      console.log(track)
      //return this.addTracks(tracks)
    }

    addTracks(tracksData) {
      const tracksWithProps = tracksData.map(data => {
          // var image = data.tags.picture;
          // if (image) {
          //   var base64String = "";
          //   for (var i = 0; i < image.data.length; i++) {
          //       base64String += String.fromCharCode(image.data[i]);
          //   }
          //   var imgSrc = "data:" + image.format + ";base64," + window.btoa(base64String);
          //   console.log(imgSrc)
          // }
          return {
            id: uuidv4(),
            path: data.path,
            fileName: data.fileName
          }
        }).filter(track => {
          const currentTracksPath = this.getTracks().map(track => track.path)
          return currentTracksPath.indexOf(track.path) < 0
        })

      this.tracks = [...this.tracks, ...tracksWithProps]
      return this.saveTracks()
    }

    deleteTrack(deletedId) {
        this.tracks = this.tracks.filter(item => item.id !== deletedId)
        return this.saveTracks()
    }
}

const awaitableJsmediatags = (filename) => {
  return new Promise(function(resolve, reject) {
    jsmediatags.read(filename, {
      onSuccess: function(tag) {
          resolve(tag);
      },
      onError: function(error) {
        reject(error);
      }
    })
  })
}

module.exports = DataStore