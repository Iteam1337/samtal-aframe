const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const port = process.env.PORT || 8000

server.listen(port)
console.log('listening on port ', port)

const allFaces = {}

// app.use(express.static(path.join(__dirname, './')))
// app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')))

io.on('connection', (client) => {
  client.on('face', (face) => {
    allFaces[client.id + '_' + face.id] = face
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

  client.on('disconnect', (reason) => {
    Object.keys(allFaces)
      .filter((key) => key.startsWith(client.id))
      .forEach((key) => {
        delete allFaces[key]
      })
  })
})
