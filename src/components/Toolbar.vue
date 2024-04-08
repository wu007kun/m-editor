<template>
  <div class="Panel" id="toolbar">
    <button class="Button"
      :class="{
        selected: activeMode === 'translate'
      }"
      @click="setTransformMode('translate')">
      <img src="@/assets/images/translate.svg" alt="">
    </button>
    <button class="Button"
      :class="{
        selected: activeMode === 'rotate'
      }"
      @click="setTransformMode('rotate')">
      <img src="@/assets/images/rotate.svg" alt="">
    </button>
    <button class="Button"
      :class="{
        selected: activeMode === 'scale'
      }"
      @click="setTransformMode('scale')">
      <img src="@/assets/images/scale.svg" alt="">
    </button>
    <input type="checkbox" class="Checkbox" v-model="spaceCoord" @change="setSpaceCoord">
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'

const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
let signals = null
const activeMode = ref('translate')
function setTransformMode (type) {
  signals.transformModeChanged.dispatch(type)
}

const spaceCoord = ref(false)
function setSpaceCoord () {
  signals.spaceChanged.dispatch(spaceCoord.value === true ? 'local' : 'world')
}

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const editor = window.editor
      signals = editor.signals
      signals.transformModeChanged.add((mode) => {
        activeMode.value = mode
      })
    }
  }, {
    immediate: true
  })
})

</script>
<style lang="less">
#info {
  position: absolute;
  left: 10px; bottom: 20px;
  font-size: 12px; color: #ffffff;
}
</style>
