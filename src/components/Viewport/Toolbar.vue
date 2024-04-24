<template>
  <div class="toolbar">
    <button
      :class="{
        selected: activeMode === 'translate'
      }"
      @click="setTransformMode('translate')">
      <img src="@/assets/images/translate.png" alt="">
    </button>
    <button
      :class="{
        selected: activeMode === 'rotate'
      }"
      @click="setTransformMode('rotate')">
      <img src="@/assets/images/rotate.png" alt="">
    </button>
    <button
      :class="{
        selected: activeMode === 'scale'
      }"
      @click="setTransformMode('scale')">
      <img src="@/assets/images/scale.png" alt="">
    </button>
    <div class="coord-check">
      <input type="checkbox" v-model="spaceCoord" @change="setSpaceCoord">
      <div class="img-container"
        :class="{
          selected: spaceCoord
        }"
      >
        <img src="@/assets/images/local.png" alt="">
      </div>

    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { useMainStore } from '@/store'
const store = useMainStore()

let signals = null
const activeMode = ref('translate')
function setTransformMode (type) {
  signals.transformModeChanged.dispatch(type)
}

const spaceCoord = ref(false)
function setSpaceCoord () {
  console.log('change!!!')
  signals.spaceChanged.dispatch(spaceCoord.value === true ? 'local' : 'world')
}

onMounted(() => {
  watch(() => store.editorReady, ready => {
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
.toolbar {
  --selected-color: #345688;
  position: absolute;
  left: 10px;
  top: 10px;
  width: 36px;
  text-align: center;
  button {
    width: 100%;
    height: 36px;
    background-color: #282828;
    border: 0;
    margin: 0 0 1px 0;
    padding: 0;
    cursor: pointer;
    outline: none;
    border-radius: 4px;
    &:hover {
      background-color: #363636;
    }

    &.selected {
      background-color: var(--selected-color);
    }
    img {
      width: 24px; vertical-align: middle;
    }
  }
  .coord-check {
    position: relative;
    width: 100%;
    height: 36px;
    input {
      margin: 0; padding: 0; outline: none;
      width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    .img-container {
      line-height: 36px;
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border-radius: 4px;
      background-color: #282828;
      pointer-events: none;
      user-select: none;
      img {
        width: 24px; vertical-align: middle;
      }
      &.selected {
        background-color: var(--selected-color);
      }
    }
    &:hover .img-container:not(.selected) {
      background-color: #363636;
    }
  }
}

</style>
