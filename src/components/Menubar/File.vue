<template>
  <div class="menu">
    <div class="title">文件</div>
    <div class="options">
      <div class="option underlined" @click="handleNew">新建</div>
      <div class="option underlined" @click="handleImport">导入</div>
      <form action="" class="import-form" ref="formRef">
        <input ref="fileInputRef" type="file" multiple @change="handleUpload">
      </form>
      <div class="option" @click="handleExportGlb">导出glb</div>
      <div class="option" @click="handleExportGltf">导出glTF</div>
      <div class="option" @click="handleExportObj">导出obj</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
// import { AddObjectCommand } from '@/editor/commands/AddObjectCommand.js'

import { useMainStore } from '@/store'
const store = useMainStore()
let editor = null

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      editor = window.editor
    }
  }, {
    immediate: true
  })
})

function handleNew () {
  if (confirm('未保存的工作将丢弃，确认?')) {
    editor.clear()
  }
}
const formRef = ref()
const fileInputRef = ref()
function handleImport () {
  fileInputRef.value.click()
}

function handleUpload (e) {
  editor.loader.loadFiles(e.target.files)
  formRef.value.reset()
}

function handleExportGlb () {
  const scene = editor.scene
  const animations = getAnimations(scene)

  const optimizedAnimations = []

  for (const animation of animations) {
    optimizedAnimations.push(animation.clone().optimize())
  }

  const { GLTFExporter } = THREE

  const exporter = new GLTFExporter()

  exporter.parse(scene, (result) => {
    editor.utils.saveArrayBuffer(result, 'scene.glb')
  }, undefined, { binary: true, animations: optimizedAnimations })
}

function handleExportGltf () {
  const scene = editor.scene
  const animations = getAnimations(scene)

  const optimizedAnimations = []

  for (const animation of animations) {
    optimizedAnimations.push(animation.clone().optimize())
  }

  const { GLTFExporter } = THREE

  const exporter = new GLTFExporter()

  exporter.parse(scene, function (result) {
    editor.utils.saveString(JSON.stringify(result, null, 2), 'scene.gltf')
  }, undefined, { animations: optimizedAnimations })
}

function handleExportObj () {
  const object = editor.selected

  if (object === null) {
    alert('No object selected.')
    return
  }

  const { OBJExporter } = THREE

  const exporter = new OBJExporter()

  editor.utils.saveString(exporter.parse(object), 'model.obj')
}

function getAnimations (scene) {
  const animations = []

  scene.traverse(function (object) {
    animations.push(...object.animations)
  })

  return animations
}

</script>
<style>
.import-form {
  display: none;
}
</style>
