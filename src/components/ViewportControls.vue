<template>
  <div class="viewport-controls" id="viewportControls" @click="testClick">
    <span class="check-item">
      <el-checkbox v-model="showGrid" @change="changeShowGrid" label="网格"></el-checkbox>
    </span>
    <span class="check-item">
      <el-checkbox v-model="showHelperLine" @change="changeShowHelperLine" label="辅助线"></el-checkbox>
    </span>
    <span class="shading-btn"
      :class="{ active: shadingMode === 'wireframe' }"
      @click="setShadingMode('wireframe')">
      <img src="@/assets/images/wireframe.png" alt="">
    </span>
    <span class="shading-btn"
      :class="{ active: shadingMode === 'solid' }"
      @click="setShadingMode('solid')">
      <img src="@/assets/images/solid.png" alt="">
    </span>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { useMainStore } from '@/store'
const store = useMainStore()

let editor = null
let signals = null

function testClick () {
  console.log('click click')
}
onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      editor = window.editor
      signals = editor.signals
      signals.editorCleared.add(function () {
        shadingMode.value = 'solid'
        editor.setViewportShading('solid')
      })
    }
  }, {
    immediate: true
  })
})

const showGrid = ref(true)
function changeShowGrid () {
  console.log('hhhh')
  if (!signals) return
  signals.showHelpersChanged.dispatch(showGrid.value)
}

const showHelperLine = ref(true)
function changeShowHelperLine () {
  if (!signals) return
  signals.showHelpersChanged.dispatch(showHelperLine.value)
}
const shadingMode = ref('solid')
function setShadingMode (mode) {
  shadingMode.value = mode
  editor.setViewportShading(mode)
}
</script>
<style lang="less">
.viewport-controls {
  position: absolute; top: 5px; right: 5px; z-index: 10;
  color: #ffffff;
  display: flex; align-items: center;
  .check-item {
    margin-right: 6px;
    display: flex; align-items: center;
  }
  .shading-btn {
    width: 24px; height: 24px;
    cursor: pointer;
    img {
      margin: 4px;
      width: 16px; height: 16px;
    }
    &.active {
      background-color: #409eff;
    }
  }
}
</style>
