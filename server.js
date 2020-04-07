const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const port = process.env.PORT || 8000
const Bundler = require('parcel-bundler')

server.listen(port)
console.log('listening on port ', port)

const bundler = new Bundler('index.html', { hmr: false })

app.use(express.static(path.join(__dirname, './assets')))
app.use(bundler.middleware())
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/dist/index.html'))
)

const allFaces = {}
let emojis = {}

io.on('connection', (client) => {
  client.on('face', (face) => {
    allFaces[client.id + '_' + face.id] = face
  })

  client.on('emoji', (emoji) => {
    emojis[`${client.id}_${emoji.id}`] = emoji
  })

  setInterval(() => {
    if (!Object.keys(allFaces).length) return

    io.volatile.emit(
      'faces',
      Object.values(allFaces).reduce(
        (result, faces) => result.concat(faces),
        []
      )
    )
  }, 50)

  setInterval(() => {
    io.volatile.emit('emojis', Object.values(emojis))
    emojis = {}
  }, 1000)

  client.on('disconnect', (reason) => {
    Object.keys(allFaces)
      .filter((key) => key.startsWith(client.id))
      .forEach((key) => {
        delete allFaces[key]
      })
  })
})
