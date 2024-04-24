<template>
  <div class="viewport-controls">
    <div class="shading-btn"
      :class="{ active: showGrid }"
      @click="changeShowGrid">
      <div class="icon grid-btn"></div>
    </div>
    <div class="shading-btn"
      :class="{ active: showHelperLine }"
      @click="changeShowHelperLine">
      <div class="icon axis-btn"></div>
    </div>
    <div class="shading-btn"
      :class="{ active: shadingMode === 'wireframe' }"
      @click="setShadingMode('wireframe')">
      <div class="icon wireframe-btn"></div>
    </div>
    <div class="shading-btn"
      :class="{ active: shadingMode === 'solid' }"
      @click="setShadingMode('solid')">
      <div class="icon solid-btn"></div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { useMainStore } from '@/store'
const store = useMainStore()

let editor = null
let signals = null

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
  if (!signals) return
  showGrid.value = !showGrid.value
  signals.showGridChanged.dispatch(showGrid.value)
}

const showHelperLine = ref(true)
function changeShowHelperLine () {
  if (!signals) return
  showHelperLine.value = !showHelperLine.value
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
  position: absolute; top: 10px; right: 10px; z-index: 10;
  color: #ffffff;
  display: flex; align-items: center;
  .check-item {
    margin-right: 6px;
    display: flex; align-items: center;
    --el-text-color-regular: #E5E5E5;
  }
  .shading-btn {
    margin-left: 3px;
    width: 24px; height: 24px;
    border-radius: 2px;
    cursor: pointer;
    background-color: #545454;
    .grid-btn {
      background: linear-gradient(currentColor, currentColor), url("@/assets/images/grid.png"), #545454;
    }
    .axis-btn {
      background: linear-gradient(currentColor, currentColor), url("@/assets/images/axis.png"), #545454;
    }
    .wireframe-btn {
      background: linear-gradient(currentColor, currentColor), url("@/assets/images/wireframe.png"), #545454;
    }
    .solid-btn {
      background: linear-gradient(currentColor, currentColor), url("@/assets/images/solid.png"), #545454;
    }
    .icon {
      margin: 2px;
      width: 20px; height: 20px;
      color: #e5e5e5;
      background-size: 100%;
      background-blend-mode: darken, normal;
    }
    &.active {
      background-color: #409eff;
      .grid-btn {
        background: linear-gradient(currentColor, currentColor), url("@/assets/images/grid.png"), #409eff;
      }
      .axis-btn {
        background: linear-gradient(currentColor, currentColor), url("@/assets/images/axis.png"), #409eff;
      }
      .wireframe-btn {
        background: linear-gradient(currentColor, currentColor), url("@/assets/images/wireframe.png"), #409eff;
      }
      .solid-btn {
        background: linear-gradient(currentColor, currentColor), url("@/assets/images/solid.png"), #409eff;
      }
      .icon {
        color: #fff;
        background-size: 100%;
      }
    }
  }
}
</style>
