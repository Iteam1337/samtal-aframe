const audio = document.getElementById('happy')
let soundReady = false
const socket = io()

audio.addEventListener('canplay', () => {
  soundReady = true
})

socket.on('faces', (faces) => {
  faces.map((face) => {
    if (face.mouth.height * 10 > 0.6) {
      audio.play()
    }
  })
})
