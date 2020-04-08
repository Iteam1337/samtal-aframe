const socket = io()
const emojiBtn = document.getElementById('btn-emoji')

if (emojiBtn) {
  emojiBtn.addEventListener('click', () => {
    emojiBtn.setAttribute('disabled', true)

    socket.emit('emoji', {
      id: localStorage.getItem('viroom/userid'),
      emoji: 'heart',
    })
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
        emojiBtn.removeAttribute('disabled')
        emojiEl.remove()
      }
    }, 3100)
  })
})
