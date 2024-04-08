<template>
  <div class="Panel" id="info">
    <p class="info-line">
      <span class="label">物体</span>
      <span class="value">{{ statistics.object }}</span>
    </p>
    <p class="info-line">
      <span class="label">顶点</span>
      <span class="value">{{ statistics.vertices }}</span>
    </p>
    <p class="info-line">
      <span class="label">三角面</span>
      <span class="value">{{ statistics.triangles }}</span>
    </p>
    <p class="info-line">
      <span class="label">渲染时间</span>
      <span class="value">{{ statistics.frametime }}</span>
    </p>
  </div>
</template>
<script setup>
import { onMounted, watch, reactive } from 'vue'
import { formatNumber } from '@/utils'

const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
const statistics = reactive({
  object: '',
  vertices: '',
  triangles: '',
  frametime: ''
})

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const editor = window.editor
      const signals = editor.signals
      signals.objectAdded.add(update)
      signals.objectRemoved.add(update)
      signals.geometryChanged.add(update)
      signals.sceneRendered.add(updateFrametime)

      //

      function update () {
        const scene = editor.scene

        let objects = 0; let vertices = 0; let triangles = 0

        for (let i = 0, l = scene.children.length; i < l; i++) {
          const object = scene.children[i]

          object.traverseVisible(function (object) {
            objects++

            if (object.isMesh || object.isPoints) {
              const geometry = object.geometry

              vertices += geometry.attributes.position.count

              if (object.isMesh) {
                if (geometry.index !== null) {
                  triangles += geometry.index.count / 3
                } else {
                  triangles += geometry.attributes.position.count / 3
                }
              }
            }
          })
        }
        statistics.object = formatNumber(objects)
        statistics.vertices = formatNumber(vertices)
        statistics.triangles = formatNumber(triangles)
      }

      function updateFrametime (frametime) {
        statistics.frametime = Number(frametime).toFixed(2)
      }
    }
  }, {
    immediate: true
  })
})

</script>
<style lang="less">
#info {
  position: absolute;
  left: 10px; bottom: 20px;
  font-size: 12px; color: #ffffff;
}
</style>
