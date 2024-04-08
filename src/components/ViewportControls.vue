<template>
  <div class="Panel viewport-controls" id="viewportControls">

  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
import { UIBoolean } from '@/editor/libs/ui.three'
import { UISelect } from '@/editor/libs/ui'
const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      init()
    }
  }, {
    immediate: true
  })
})

function init () {
  const container = document.querySelector('#viewportControls')
  const editor = window.editor
  const { signals, strings } = editor

  const gridCheckbox = new UIBoolean(true, strings.getKey('viewport/controls/grid'))
  gridCheckbox.onChange(function () {
    signals.showGridChanged.dispatch(this.getValue())
  })
  container.appendChild(gridCheckbox.dom)

  // helpers

  const helpersCheckbox = new UIBoolean(true, strings.getKey('viewport/controls/helpers'))
  helpersCheckbox.onChange(function () {
    signals.showHelpersChanged.dispatch(this.getValue())
  })
  container.appendChild(helpersCheckbox.dom)

  // shading

  const shadingSelect = new UISelect()
  shadingSelect.setOptions({ solid: 'solid', wireframe: 'wireframe' })
  shadingSelect.setValue('solid')
  shadingSelect.onChange(function () {
    editor.setViewportShading(this.getValue())
  })
  container.appendChild(shadingSelect.dom)

  signals.editorCleared.add(function () {
    shadingSelect.setValue('solid')
    editor.setViewportShading(shadingSelect.getValue())
  })
}
</script>
<style lang="less">
.viewport-controls {
  position: absolute; top: 10px; right: 10px;
  color: #ffffff;

}
</style>
