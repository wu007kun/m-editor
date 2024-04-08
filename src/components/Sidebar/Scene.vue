<template>
  <div class="Outliner" id="outliner"
    tabindex="0"
    @keydown="handleListKeyDown"
    @keyup="handleListKeyUp">
    <template v-for="option in listOptions"
      :key="option.id">
      <div class="option"
        v-if="getNodeVisible(option.id)"
        :class="{
          active: activeId === option.id
        }"
        :style="{
          'padding-left': option.paddingLeft + 'px'
        }"
        @click="setActive(option)"
      >
        <span class="arrow">
          <img
            src="@/assets/images/arrow.png" alt=""
            v-if="nodeStates.get(option.id) === 'close' || nodeStates.get(option.id) === 'open'"
            :style="{
              transform: `rotate(${nodeStates.get(option.id) === 'close' ? -90 : 0}deg)`
            }"
            @click.stop="toggleOption(option)">
        </span>
        {{ option.label }}
      </div>
    </template>
  </div>
</template>
<script setup>
import { onMounted, watch, reactive, ref } from 'vue'

const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})
const nodeStates = reactive(new Map())
const parentData = new Map()
let editor = null
let signals = null
const listOptions = reactive([])
const activeId = ref(-1)
onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      editor = window.editor
      signals = editor.signals

      signals.editorCleared.add(refreshList)
      signals.sceneGraphChanged.add(refreshList)
      // signals.refreshSidebarEnvironment.add(refreshUI)
      signals.objectSelected.add((object) => {
        if (object) {
          activeId.value = object.id
        } else {
          activeId.value = -1
        }
      })
    }
  }, {
    immediate: true
  })
})

function refreshList () {
  const scene = editor.scene
  listOptions.length = 0
  function addObjects (objects, pad, parent) {
    for (let i = 0, l = objects.length; i < l; i++) {
      const object = objects[i]
      const option = {
        parent,
        label: getLabel(object),
        id: object.id,
        paddingLeft: pad * 18
      }
      parentData.set(option.id, parent)
      if (!object.children.length) {
        nodeStates.set(option.id, 'leaf')
      } else if (!nodeStates.get(option.id)) {
        nodeStates.set(option.id, 'close')
      }
      listOptions.push(option)
      if (object.children.length) {
        addObjects(object.children, pad + 1, option.id)
      }
    }
  }
  addObjects(scene.children, 0)
}

function toggleOption (option) {
  const state = nodeStates.get(option.id)
  const newState = state === 'close' ? 'open' : state === 'open' ? 'close' : 'leaf'
  nodeStates.set(option.id, newState)
}

function getNodeVisible (id) {
  let visible = true
  let current = id
  while (parentData.get(current) && visible) {
    const parentVisible = nodeStates.get(parentData.get(current)) === 'open'
    visible = parentVisible
    current = parentData.get(current)
  }
  return visible
}

function setActive (option) {
  activeId.value = option.id
  editor.selectById(parseInt(option.id))
}

function getLabel (object) {
  let html = getObjectType(object) + '-' + escapeHTML(object.name)

  if (object.isMesh) {
    const geometry = object.geometry
    const material = object.material

    html += `-${escapeHTML(geometry.name)}`
    html += `-${escapeHTML(getMaterialName(material))}`
  }
  return html
}

function escapeHTML (html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getMaterialName (material) {
  if (Array.isArray(material)) {
    const array = []

    for (let i = 0; i < material.length; i++) {
      array.push(material[i].name)
    }

    return array.join(',')
  }

  return material.name
}

function getObjectType (object) {
  if (object.isScene) return 'Scene'
  if (object.isCamera) return 'Camera'
  if (object.isLight) return 'Light'
  if (object.isMesh) return 'Mesh'
  if (object.isLine) return 'Line'
  if (object.isPoints) return 'Points'
  return 'Object3D'
}

function handleListKeyDown (e) {
  switch (e.keyCode) {
    case 38: // up
    case 40: // down
      e.preventDefault()
      e.stopPropagation()
      break
  }
}

function handleListKeyUp (e) {
  let currentIndex = listOptions.findIndex(item => item.id === activeId.value)
  switch (e.keyCode) {
    case 38: // up
      currentIndex -= 1
      break
    case 40: // down
      currentIndex += 1
      break
  }
  const newActive = listOptions[currentIndex]
  if (newActive) {
    setActive(newActive)
  }
}

</script>
<style lang="less">

.Outliner {
  background-color: #282828;
  border-radius: 4px;
  padding: 0;
  width: 100%;
  height: 180px;
  font-size: 12px;
  cursor: default;
  overflow: auto;
  resize: vertical;
  outline: none !important;
  .option {
    padding: 4px;
    white-space: nowrap;
    display: flex; align-items: center;
    &:nth-child(2n+1) {
      background-color: #2B2B2B;
    }
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    &.active {
      background-color: rgba(64, 158, 255, 0.5);
      color: orange;
    }
    .arrow {
      // margin-right: 8px;
      display: inline-block;
      width: 20px; height: 20px;
      img {
        display: block;
        margin: 4px;
        width: 12px; height: 12px;
        transition: transform 0.1s;
      }
    }
  }
}
</style>
