const audio = document.getElementById('happy')
const socket = io('localhost:8000')

let soundReady = false

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
