<template>
  <div class="menu">
    <div class="title">编辑</div>
    <div class="options">
      <div :class="undoStatus" @click="handleUndo">撤销</div>
      <div class="underlined" :class="redoStatus" @click="handleRedo">重做</div>
      <div class="option" @click="handleCenter">居中</div>
      <div class="option" @click="handleCopy">拷贝</div>
      <div class="option" @click="handleDelete">删除</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { AddObjectCommand } from '@/editor/commands/AddObjectCommand.js'
import { RemoveObjectCommand } from '@/editor/commands/RemoveObjectCommand.js'
import { SetPositionCommand } from '@/editor/commands/SetPositionCommand.js'

import { useMainStore } from '@/store'
const store = useMainStore()
let editor = null

const undoStatus = ref('inactive')
const redoStatus = ref('inactive')

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      editor = window.editor
      editor.signals.historyChanged.add(function () {
        const history = editor.history
        undoStatus.value = history.undos.length ? 'option' : 'inactive'
        redoStatus.value = history.redos.length ? 'option' : 'inactive'
      })
    }
  }, {
    immediate: true
  })
})

function handleUndo () {
  editor.undo()
}

function handleRedo () {
  editor.redo()
}

function handleCenter () {
  const object = editor.selected
  if (object === null || object.parent === null) return // avoid centering the camera or scene
  const aabb = new THREE.Box3().setFromObject(object)
  const center = aabb.getCenter(new THREE.Vector3())
  const newPosition = new THREE.Vector3()
  newPosition.x = object.position.x + (object.position.x - center.x)
  newPosition.y = object.position.y + (object.position.y - center.y)
  newPosition.z = object.position.z + (object.position.z - center.z)
  editor.execute(new SetPositionCommand(editor, object, newPosition))
}

function handleCopy () {
  const { clone } = THREE.SkeletonUtils
  let object = editor.selected
  if (object === null || object.parent === null) return // avoid cloning the camera or scene
  object = clone(object)
  editor.execute(new AddObjectCommand(editor, object))
}

function handleDelete () {
  const object = editor.selected
  if (object !== null && object.parent !== null) {
    editor.execute(new RemoveObjectCommand(editor, object))
  }
}
</script>
