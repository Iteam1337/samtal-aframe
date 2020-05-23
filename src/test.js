import {startJitsi} from './jitsi.js'


function startVideo() {
  startJitsi('stagevrmeetio', document.getElementById('video'), document.getElementById('presentation'))
}
document.onreadystatechange = () => {
  console.log('onload')
  document.getElementById('start').onclick = e => startVideo()
}