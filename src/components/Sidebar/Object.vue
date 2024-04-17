<template>
  <div class="detail-form" v-show="containerVisible">
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">显示</span>
        <el-checkbox v-model="visible" @change="update"></el-checkbox>
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">位置 X</span>
        <NumberInput v-model="translate.x" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Y</span>
        <NumberInput v-model="translate.y" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Z</span>
        <NumberInput v-model="translate.z" @update:model-value="update" />
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">旋转 X</span>
        <NumberInput v-model="rotate.x" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Y</span>
        <NumberInput v-model="rotate.y" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Z</span>
        <NumberInput v-model="rotate.z" @update:model-value="update" />
      </div>
    </div>
    <div class="detail-form-group">
      <div class="detail-form-item">
        <span class="label">缩放 X</span>
        <NumberInput v-model="scale.x" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Y</span>
        <NumberInput v-model="scale.y" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">Z</span>
        <NumberInput v-model="scale.z" @update:model-value="update" />
      </div>
    </div>
    <div class="detail-form-group" v-if="isLight">
      <div class="detail-form-item">
        <span class="label">光强</span>
        <NumberInput v-model="light.intensity" @update:model-value="update" />
      </div>
      <div class="detail-form-item">
        <span class="label">颜色</span>
        <el-color-picker v-model="light.color" @change="update"/>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useMainStore } from '@/store'
import { SetPositionCommand } from '@/editor/commands/SetPositionCommand.js'
import { SetRotationCommand } from '@/editor/commands/SetRotationCommand.js'
import { SetScaleCommand } from '@/editor/commands/SetScaleCommand.js'
import { SetValueCommand } from '@/editor/commands/SetValueCommand.js'
import { SetColorCommand } from '@/editor/commands/SetColorCommand.js'
import NumberInput from '../NumberInput.vue'
const store = useMainStore()

const containerVisible = ref(true)
const visible = ref(true)

let editor = null
let signals = null

const translate = reactive({
  x: 0, y: 0, z: 0
})
const rotate = reactive({
  x: 0, y: 0, z: 0
})
const scale = reactive({
  x: 0, y: 0, z: 0
})
const light = reactive({
  intensity: 1,
  color: '#fff'
})

const isLight = ref(false)
function update () {
  const object = editor.selected
  const newPosition = new THREE.Vector3(translate.x, translate.y, translate.z)
  if (object.position.distanceTo(newPosition) >= 0.01) {
    editor.execute(new SetPositionCommand(editor, object, newPosition))
  }

  const newRotation = new THREE.Euler(
    rotate.x * THREE.MathUtils.DEG2RAD,
    rotate.y * THREE.MathUtils.DEG2RAD,
    rotate.z * THREE.MathUtils.DEG2RAD
  )
  if (new THREE.Vector3().setFromEuler(object.rotation).distanceTo(new THREE.Vector3().setFromEuler(newRotation)) >= 0.01) {
    editor.execute(new SetRotationCommand(editor, object, newRotation))
  }

  const newScale = new THREE.Vector3(scale.x, scale.y, scale.z)
  if (object.scale.distanceTo(newScale) >= 0.01) {
    editor.execute(new SetScaleCommand(editor, object, newScale))
  }

  if (object.visible !== visible.value) {
    editor.execute(new SetValueCommand(editor, object, 'visible', visible.value))
  }

  if (isLight.value) {
    if (object.intensity !== undefined && Math.abs(object.intensity - light.intensity) >= 0.01) {
      editor.execute(new SetValueCommand(editor, object, 'intensity', light.intensity))
    }
    const color = new THREE.Color(light.color)
    if (object.color !== undefined && object.color.getHex() !== color.getHex()) {
      editor.execute(new SetColorCommand(editor, object, 'color', color.getHex()))
    }
  }
}

function updateUI (object) {
  const { position, rotation } = object
  translate.x = position.x.toFixed(2) - 0
  translate.y = position.y.toFixed(2) - 0
  translate.z = position.z.toFixed(2) - 0
  rotate.x = (rotation.x * THREE.MathUtils.RAD2DEG).toFixed(2) - 0
  rotate.y = (rotation.y * THREE.MathUtils.RAD2DEG).toFixed(2) - 0
  rotate.z = (rotation.z * THREE.MathUtils.RAD2DEG).toFixed(2) - 0
  scale.x = object.scale.x.toFixed(2) - 0
  scale.y = object.scale.y.toFixed(2) - 0
  scale.z = object.scale.z.toFixed(2) - 0
  visible.value = object.visible
  if (isLight.value) {
    light.intensity = object.intensity
    light.color = '#' + object.color.getHexString()
  }
}

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      editor = window.editor
      signals = editor.signals
      signals.objectSelected.add((object) => {
        if (object !== null) {
          containerVisible.value = true
          console.log(object)
          isLight.value = object.isLight
          updateUI(object)
        } else {
          containerVisible.value = false
        }
      })

      signals.objectChanged.add((object) => {
        if (object !== editor.selected) return
        updateUI(object)
      })

      signals.refreshSidebarObject3D.add((object) => {
        if (object !== editor.selected) return
        updateUI(object)
      })
    }
  }, {
    immediate: true
  })
})

</script>
<style lang="less">
.detail-form {
  padding: 10px 20px; box-sizing: border-box;
}
.detail-form-item {
  height: 40px;
  display: flex; align-items: center;
  .label {
    width: 80px;
  }
  .img-uploader {
    width: 30px; height: 30px;
    .image {
      width: 30px; height: 30px;
      background-size: contain;
      background-position: left;
      background-repeat: no-repeat;
      background-image: url('@/assets/images/plus.png');
      border: 1px dashed #999;
      border-radius: 4px;
    }
  }
}
</style>
