const socket = io()
const emojiBtn = document.getElementById('btn-emoji')

if (emojiBtn) {
  emojiBtn.addEventListener('click', () => {
    const emoji = {
      id: localStorage.getItem('viroom/userid'),
      emoji: 'heart',
    }

    socket.emit('emoji', emoji)
  })
}

socket.on('emojis', (emojis) => {
  if (emojis.length === 0) {
    return
  }

  emojis.forEach((emoji) => {
    const faceId = `face-${emoji.id}`
    const id = `${faceId}-emoji`
    const faceEl = document.getElementById(faceId)
    let emojiEl = document.getElementById(id)

    if (!emojiEl) {
      emojiEl = document.createElement('a-entity')
      emojiEl.setAttribute('template', `src: #emoji-${emoji.emoji}`)
      emojiEl.setAttribute('id', id)

      faceEl.appendChild(emojiEl)
    }

    setTimeout(() => {
      if (emojiEl) {
        emojiEl.remove()
      }
    }, 2000)
  })
})
