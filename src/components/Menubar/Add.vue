<template>
  <div class="menu">
    <div class="title">添加</div>
    <div class="options">
      <div class="option" @click="addAmbientLight">环境光</div>
      <div class="option" @click="addDirectionalLight">平行光</div>
      <div class="option" @click="addHemisphereLight">半球光</div>
      <div class="option" @click="addPointLight">点光源</div>
      <div class="option" @click="addSpotLight">聚光灯</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue'
import { AddObjectCommand } from '@/editor/commands/AddObjectCommand.js'

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

function addAmbientLight () {
  const color = 0x222222
  const light = new THREE.AmbientLight(color)
  light.name = 'AmbientLight'
  editor.execute(new AddObjectCommand(editor, light))
}

function addDirectionalLight () {
  const color = 0xffffff
  const intensity = 1
  const light = new THREE.DirectionalLight(color, intensity)
  light.name = 'DirectionalLight'
  light.target.name = 'DirectionalLight Target'
  light.position.set(5, 10, 7.5)
  editor.execute(new AddObjectCommand(editor, light))
}

function addHemisphereLight () {
  const skyColor = 0x00aaff
  const groundColor = 0xffaa00
  const intensity = 1
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
  light.name = 'HemisphereLight'
  light.position.set(0, 10, 0)
  editor.execute(new AddObjectCommand(editor, light))
}

function addPointLight () {
  const color = 0xffffff
  const intensity = 1
  const distance = 0
  const light = new THREE.PointLight(color, intensity, distance)
  light.name = 'PointLight'
  editor.execute(new AddObjectCommand(editor, light))
}

function addSpotLight () {
  const color = 0xffffff
  const intensity = 1
  const distance = 0
  const angle = Math.PI * 0.1
  const penumbra = 0
  const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra)
  light.name = 'SpotLight'
  light.target.name = 'SpotLight Target'
  light.position.set(5, 10, 7.5)
  editor.execute(new AddObjectCommand(editor, light))
}
</script>
