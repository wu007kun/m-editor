<template>
  <div class="home">
    <Viewport />
    <Sidebar />
    <Menubar />
    <Resizer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMainStore } from '@/store'
import Viewport from '@/components/Viewport.vue'
import Sidebar from '@/components/Sidebar.vue'
import Menubar from '@/components/Menubar.vue'
import Resizer from '@/components/Resizer.vue'
import { Editor } from '../editor/Editor/Editor.js'

window.URL = window.URL || window.webkitURL
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder

const mainStore = useMainStore()
onMounted(() => {
  init()
})

function init () {
  const editor = new Editor()
  window.editor = editor
  mainStore.setEditorReady()
  function onWindowResize () {
    editor.signals.windowResize.dispatch()
  }
  window.addEventListener('resize', onWindowResize)
  onWindowResize()
}
</script>

<style lang='less'>
.home {
  height: 100%;
  user-select: none;
}
.function-list {
  position: absolute;
  top: 10px; left: 10px;
  padding: 10px 10px 0;
  width: 300px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: rgba(1, 1, 1, 0.4);
  color: #fff;
  .function-item {
    padding: 4px 0;
    width: 140px;
    margin: 0 10px 10px 0;
    cursor: pointer;
    text-align: center;
    background-color: rgb(8, 39, 85);
    border-radius: 6px;
  }
  .active {
    background-color: #409eff;
  }
}
</style>
../editor/Editor/Editor.js../editor/Menubar/Menubar.js../editor/Sidebar/Sidebar.js../editor/Resizer.js
