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

  const customConfig = {
    hosts: {
      domain: 'meet.jitsi',
      muc: 'muc.meet.jitsi'
    },
    bosh: 'https://jitsi.vrmeet.io/http-bind',
    //serviceUrl: 'wss://jitsi.vrmeet.io/xmpp-websocket',
    //serviceUrl: `https://jitsi.vrmeet.io/http-bind?room=${roomName}`,
    //websocket: 'wss://jitsi.vrmeet.io/xmpp-websocket',
    //serviceUrl: 'wss://meet.jit.si/xmpp-websocket',

    clientNode: 'https://jitsi.org/jitsimeet',
  };



  const connection = new JitsiMeetJS.JitsiConnection(null, null, customConfig)
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionEstablished)

  await connection.connect()


  function onConnectionEstablished() {
    const room = connection.initJitsiConference(roomName, {
      openBridgeChannel: true
    })
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onTrackAdded)
      room.join()
      JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] }).then(localTracks =>{
      // localTracks.forEach(track => room.addTrack(track)) // remove this to send video
    })
  }

  function onTrackAdded(track) {
    console.log('track added, remote?', !track.isLocal())

    if (track.isLocal()) return // skip local tracks, we are only interested in the presenters view
    
    if (track.getType() === 'video') {
      const video = track.isLocal() ? videoElement : presentationElement
      track.attach(video);
    }  else {
      console.log('audio')
        const audio = document.createElement('audio')
        audio.autoplay = true
        audio.id=track.toString()
        document.body.appendChild(audio)
      track.attach(audio);
    }
  }
}