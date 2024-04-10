<template>
  <div ref="containerRef">
    <div>
      <span>背景色</span>
      <el-color-picker v-model="backgroundColor" @change="onBackgroundChanged"/>
    </div>
    <div>
      <span>环境光照</span>
      <el-upload
        class="avatar-uploader"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="onTextureChanged"
      >
        <img v-if="backgroundTexture" :src="backgroundTexture" class="avatar" />
        <span class="empty" v-else>+</span>
      </el-upload>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
const containerRef = ref()
let editor = null
let signals = null
const backgroundColor = ref('#aaa')
const backgroundTexture = ref('')

function onTextureChanged (file, files) {
  backgroundTexture.value = URL.createObjectURL(file.raw)
  onEnvironmentChanged()
}

onMounted(() => {
  watch(() => props.editorReady, ready => {
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
  // if (scene.environment.mapping === THREE.EquirectangularReflectionMapping) {
  //       environmentType.setValue('Equirectangular')
  //       environmentEquirectangularTexture.setValue(scene.environment)
  //     } else if (scene.environment.isRenderTargetTexture === true) {
  //       environmentType.setValue('ModelViewer')
  //     }
}

</script>
<style lang="less">
.avatar-uploader {
  .avatar {
    width: 40px; height: 30px;
  }
  .empty {
    display: inline-block; width: 30px; height: 30px; background: #ff9;
  }

}
</style>
