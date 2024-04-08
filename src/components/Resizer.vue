<template>
  <div id="resizer" @pointerdown="onPointerDown"></div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
let dom = null
let signals = null
onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const editor = window.editor
      signals = editor.signals
      dom = document.querySelector('#resizer')
    }
  }, {
    immediate: true
  })
})
function onPointerDown (event) {
  if (event.isPrimary === false) return

  dom.ownerDocument.addEventListener('pointermove', onPointerMove)
  dom.ownerDocument.addEventListener('pointerup', onPointerUp)
}

function onPointerUp (event) {
  if (event.isPrimary === false) return

  dom.ownerDocument.removeEventListener('pointermove', onPointerMove)
  dom.ownerDocument.removeEventListener('pointerup', onPointerUp)
}

function onPointerMove (event) {
  // PointerEvent's movementX/movementY are 0 in WebKit

  if (event.isPrimary === false) return

  const offsetWidth = document.body.offsetWidth
  const clientX = event.clientX

  const cX = clientX < 0 ? 0 : clientX > offsetWidth ? offsetWidth : clientX

  const x = Math.max(260, offsetWidth - cX) // .TabbedPanel min-width: 260px

  dom.style.right = x + 'px'

  document.getElementById('sidebar').style.width = x + 'px'
  document.getElementById('viewport').style.right = x + 'px'

  signals.windowResize.dispatch()
}

</script>
