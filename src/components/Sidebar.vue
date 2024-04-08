<template>
  <div id="sidebar">
    <SidebarScene :editorReady="editorReady"/>
  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
import SidebarScene from './Sidebar/Scene.vue'
import { SidebarProperties } from '@/editor/Sidebar/Sidebar.Properties.js'
const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const editor = window.editor
      const properties = new SidebarProperties(editor)
      const container = document.querySelector('#sidebar')
      container.appendChild(properties.dom)
    }
  }, {
    immediate: true
  })
})
</script>
<style lang="less">
#sidebar {
  position: absolute;
  right: 0;
  top: 32px;
  bottom: 0;
  width: 350px;
  background: #161616;
  overflow: auto;
  .Panel {
    padding: 10px;
    border-top: 1px solid #ccc;
    .collapsed {
      margin-bottom: 0;
    }
  }
  .Row {
    display: flex;
    align-items: center;
    min-height: 24px;
    margin-bottom: 10px;
    .Label {
      width: 120px;
    }
  }
}
</style>
