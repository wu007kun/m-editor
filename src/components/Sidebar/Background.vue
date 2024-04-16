<template>
  <div class="detail-form">
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">背景色</span>
        <el-color-picker v-model="backgroundColor" @change="onBackgroundChanged"/>
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">环境贴图</span>
        <el-upload
          class="img-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onTextureChanged">
          <div class="image"
            :style="{
            'background-image': `url(${backgroundTexture || uploadIcon })`
          }"></div>
        </el-upload>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
import uploadIcon from '@/assets/images/plus.png'
import { useMainStore } from '@/store'
const store = useMainStore()

let editor = null
let signals = null
const backgroundColor = ref('#3F3F3F')
const backgroundTexture = ref('')

function onTextureChanged (file, files) {
  backgroundTexture.value = URL.createObjectURL(file.raw)
  onEnvironmentChanged()
}

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      editor = window.editor
      signals = editor.signals
    }
  }, {
    immediate: true
  })
})
function onBackgroundChanged () {
  signals.sceneBackgroundChanged.dispatch(
    'Color',
    backgroundColor.value
  )
}

function onEnvironmentChanged () {
  console.log(backgroundTexture.value)
  const texture = new THREE.TextureLoader().load(backgroundTexture.value)
  signals.sceneEnvironmentChanged.dispatch(
    'Equirectangular',
    texture
  )
}

</script>
<style lang="less">

</style>
