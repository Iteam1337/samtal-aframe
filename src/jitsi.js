import 'babel-polyfill' // need this for some reason
export async function startJitsi (roomName, videoElement, presentationElement) {
  console.log('start jitsi', roomName)
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
  JitsiMeetJS.init({
    preferH264: true
  })

  const config = {
    hosts: {
      domain: 'beta.meet.jit.si',
      muc: 'conference.beta.meet.jit.si'
    },
    serviceUrl: 'wss://beta.meet.jit.si/xmpp-websocket',
    clientNode: 'https://beta.meet.jit.si',
  };


  const connection = new JitsiMeetJS.JitsiConnection(null, null, config)
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionEstablished)

  await connection.connect()


  function onConnectionEstablished() {
    const room = connection.initJitsiConference(roomName, {
      openBridgeChannel: true
    })
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onTrackAdded)
      room.join()
      JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] }).then(localTracks =>{
      localTracks.forEach(track => room.addTrack(track))
    })
  }

  function onTrackAdded(track) {
    console.log('track added, remote?', !track.isLocal())
    if (track.getType() === 'video') {
      const video = track.isLocal() ? videoElement : presentationElement
      track.attach(video);
    } // todo: handle audio
  }
}