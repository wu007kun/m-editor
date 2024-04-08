<template>
  <div class="home">
    <Viewport :editorReady="editorReady"/>
    <Toolbar :editorReady="editorReady"/>
    <Sidebar :editorReady="editorReady"/>
    <Menubar :editorReady="editorReady"/>
    <Resizer :editorReady="editorReady"/>
  </div>
</template>

<script setup>
import '@/style/main.css'
import { onMounted, ref } from 'vue'
import Viewport from '@/components/Viewport.vue'
import Toolbar from '@/components/Toolbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import Menubar from '@/components/Menubar.vue'
import Resizer from '@/components/Resizer.vue'
import { Editor } from '../editor/Editor/Editor.js'

window.URL = window.URL || window.webkitURL
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder

const editorReady = ref(false)

onMounted(() => {
  init()
})

function init () {
  const editor = new Editor()
  window.editor = editor
  editorReady.value = true
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
