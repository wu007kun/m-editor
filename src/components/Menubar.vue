<template>
  <div id="menubar">

  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
import { MenubarAdd } from '@/editor/Menubar/Menubar.Add.js'
import { MenubarEdit } from '@/editor/Menubar/Menubar.Edit.js'
import { MenubarFile } from '@/editor/Menubar/Menubar.File.js'
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
      const add = new MenubarAdd(editor)
      const edit = new MenubarEdit(editor)
      const file = new MenubarFile(editor)
      const container = document.querySelector('#menubar')
      container.appendChild(file.dom)
      container.appendChild(edit.dom)
      container.appendChild(add.dom)
    }
  }, {
    immediate: true
  })
})
</script>
<style lang="less">
#menubar {
  position: absolute;
  width: 100%;
  height: 32px;
  background: #181818;
  padding: 0;
  margin: 0;
  right: 0;
  top: 0;
  color: #D6D6D6;
  display: flex; align-items: center;
  .menu {
    position: relative;
    cursor: pointer;
    margin-right: 8px;
    &:hover {
      background: #303030;
      .options {
        display: block;
      }
    }
    .title {
      display: inline-block;
      margin: 0;
      padding: 8px;
      line-height: 16px;
    }
    .options {
      position: fixed;
      margin-top: -2px;
      display: none;
      padding: 5px 0;
      background: #181818;
      width: 150px;
      max-height: calc(100% - 80px);
      overflow: auto;
      box-shadow: 0px 0px 1px 1px #242424;

      hr {
        border-color: #2F2F2F;
      }
      .option {
        background-color: transparent;
        padding: 5px 10px;
        margin: 0 !important;
        &:hover {
          color: #fff;
          background-color: #08f;
        }
        &:active {
          color: #666;
          background: transparent;
        }
      }
      .inactive {
        color: #bbb;
        background-color: transparent;
        padding: 5px 10px;
        margin: 0 !important;
      }
    }
  }
}

</style>
