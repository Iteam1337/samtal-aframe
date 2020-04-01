let broadcaster
module.exports = (client) => {
  client.on('broadcaster', () => {
    broadcaster = client.id
    client.broadcast.emit('broadcaster')
  })

  client.on('watcher', () => {
    client.to(broadcaster).emit('watcher', client.id)
  })

  client.on('disconnect', () => {
    client.to(broadcaster).emit('disconnectPeer', client.id)
  })

  client.on('offer', (id, message) => {
    client.to(id).emit('offer', client.id, message)
  })

  client.on('answer', (id, message) => {
    client.to(id).emit('answer', client.id, message)
  })

  client.on('candidate', (id, message) => {
    client.to(id).emit('candidate', client.id, message)
  })
}
