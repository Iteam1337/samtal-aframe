const cameraBtn = document.getElementById('camera-toggle')
const audienceCamera = document.getElementById('camera-audience')
const presentationCamera = document.getElementById('camera-presentation')

function toggleCamera(rig) {
  const camera = rig.getElementsByClassName('camera')[0]
  const cameraState = camera.getAttribute('camera', 'active')

  camera.setAttribute('camera', 'active', !cameraState.active)
}

if (cameraBtn) {
  cameraBtn.addEventListener('click', () => {
    if (cameraBtn.dataset.state === 'audience') {
      toggleCamera(audienceCamera)
      cameraBtn.dataset.state = 'presentation'
      cameraBtn.innerHTML = `<svg width="25" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5 12.5C13.8359 12.5 16.625 9.76562 16.625 6.375C16.625 3.03906
13.8359 0.25 10.5 0.25C7.10938 0.25 4.375 3.03906 4.375 6.375C4.375 9.76562
7.10938 12.5 10.5 12.5ZM14.6562 14.25H14.2188C13.0703 14.7969 11.8125 15.125
10.5 15.125C9.13281 15.125 7.875 14.7969 6.72656 14.25H6.28906C2.78906 14.25 0
17.0938 0 20.5938V22.125C0 23.6016 1.14844 24.75 2.625 24.75H18.375C19.7969
24.75 21 23.6016 21 22.125V20.5938C21 17.0938 18.1562 14.25 14.6562 14.25ZM26.25
12.5C29.1484 12.5 31.5 10.1484 31.5 7.25C31.5 4.35156 29.1484 2 26.25 2C23.3516
2 21 4.35156 21 7.25C21 10.1484 23.3516 12.5 26.25 12.5ZM28.875
14.25H28.6562C27.8906 14.5234 27.0703 14.6875 26.25 14.6875C25.375 14.6875
24.5547 14.5234 23.7891 14.25H23.625C22.4766 14.25 21.4375 14.5781 20.5625
15.125C21.875 16.5469 22.75 18.4609 22.75 20.5938V22.6719C22.75 22.7812 22.6953
22.8906 22.6953 23H32.375C33.7969 23 35 21.8516 35 20.375C35 17.0391 32.2109
14.25 28.875 14.25Z" fill="currentColor"/>
</svg>`
    } else {
      toggleCamera(presentationCamera)
      cameraBtn.dataset.state = 'audience'
      cameraBtn.innerHTML = `<svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 9.25C10.4609 9.25 12.5 7.24609 12.5 4.75C12.5 2.28906 10.4609 0.25 8 0.25C5.50391 0.25 3.5 2.28906 3.5 4.75C3.5 7.24609 5.50391 9.25 8 9.25ZM11.1289 10.375H10.5312C9.75781 10.7617 8.91406 10.9375 8 10.9375C7.08594 10.9375 6.20703 10.7617 5.43359 10.375H4.83594C2.23438 10.375 0.125 12.5195 0.125 15.1211V16.5625C0.125 17.5117 0.863281 18.25 1.8125 18.25H14.1875C15.1016 18.25 15.875 17.5117 15.875 16.5625V15.1211C15.875 12.5195 13.7305 10.375 11.1289 10.375Z" fill="currentColor"/>
</svg>`
    }
  })
}

