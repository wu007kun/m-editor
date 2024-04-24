<template>
  <div class="detail-form">
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">相机FOV</span>
        <NumberInput v-model="cameraForm.fov"
          :max="180"
          :min="10"
          :step="1"
          :nudge="1"
          :precision="0"
          @update:model-value="debounceUpdateCamera" />
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">裁剪起点</span>
        <NumberInput v-model="cameraForm.near"
          :min="0"
          :step="0.1"
          :nudge="0.1"
          @update:model-value="debounceUpdateCamera" />
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">结束点</span>
        <NumberInput v-model="cameraForm.far"
          :min="0"
          :step="1"
          :nudge="1"
          :precision="0"
          @update:model-value="debounceUpdateCamera" />
      </div>
    </div>
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
import { onMounted, ref, reactive, watch } from 'vue'
import NumberInput from '../NumberInput.vue'
import uploadIcon from '@/assets/images/plus.png'
import { useMainStore } from '@/store'
import { debounce } from '@/utils'
const store = useMainStore()

let editor = null
let signals = null
const cameraForm = reactive({
  fov: 50,
  far: 2000,
  near: 0.01
})
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

function updateCamera () {
  editor.camera.fov = cameraForm.fov
  editor.camera.far = cameraForm.far
  editor.camera.near = cameraForm.near
  editor.camera.updateProjectionMatrix()
  signals.cameraChanged.dispatch(editor.camera)
}
const debounceUpdateCamera = debounce(updateCamera, 300)

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
