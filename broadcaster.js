import io from 'socket.io-client'
const peerConnections = new Map()

const init = () => {
  const config = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302'],
      },
    ],
  }

  const socket = io.connect('localhost:8000')
  const video = document.querySelector('video')

  // Media contrains
  const constraints = {
    video: { facingMode: 'user' },
    // Uncomment to enable audio
    // audio: true,
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream
      socket.emit('broadcaster')
    })
    .catch((error) => console.error(error))

  socket.on('watcher', (id) => {
    console.log('new watcher: ', id)
    const peerConnection = new RTCPeerConnection(config)
    peerConnections.set(id, peerConnection)

    let stream = video.srcObject
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream))

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate)
      }
    }

    peerConnection
      .createOffer()
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit('offer', id, peerConnection.localDescription)
      })
  })

  socket.on('answer', (id, description) => {
    if (peerConnections.has(id)) {
      peerConnections.get(id).setRemoteDescription(description)
    }
  })

  socket.on('candidate', (id, candidate) => {
    if (peerConnections.has(id)) {
      peerConnections.get(id).addIceCandidate(new RTCIceCandidate(candidate))
    }
  })

  socket.on('disconnectPeer', (id) => {
    if (peerConnections.has(id)) {
      peerConnections.get(id).close()
      peerConnections.delete(id)
    }
  })

  window.onunload = window.onbeforeunload = () => {
    socket.close()
  }
}
export default { init }
