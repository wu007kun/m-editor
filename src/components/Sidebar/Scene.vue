<template>
  <div class="Panel" ref="containerRef">
    <div class="Outliner" id="outliner"
      @keydown="handleListKeyDown"
      @keyup="handleListKeyUp">
      <template v-for="option in listOptions"
        :key="option.id">
        <div class="option"
          v-if="getNodeVisible(option.id)"
          :style="{
            'padding-left': option.paddingLeft + 'px'
          }"
        >
          <img class="arrow"
            src="@/assets/images/arrow.png" alt=""
            v-if="nodeStates.get(option.id) === 'close' || nodeStates.get(option.id) === 'open'"
            :style="{
              transform: `rotate(${nodeStates.get(option.id) === 'close' ? -90 : 0}deg)`
            }"
            @click="toggleOption(option)">
          {{ option.label }}
        </div>
      </template>
    </div>
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
const containerRef = ref()
const nodeStates = reactive(new Map())
const parentData = new Map()
let editor = null
let signals = null
const outliner = null
const listOptions = reactive([])
onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      editor = window.editor
      signals = editor.signals

      signals.editorCleared.add(refreshList)
      signals.sceneGraphChanged.add(refreshList)
      // signals.refreshSidebarEnvironment.add(refreshUI)
      // signals.objectSelected.add(function (object) {
      //   if (ignoreObjectSelectedSignal === true) return
      //   if (object !== null && object.parent !== null) {
      //     let needsRefresh = false
      //     let parent = object.parent
      //     while (parent !== editor.scene) {
      //       if (nodeStates.get(parent) !== true) {
      //         nodeStates.set(parent, true)
      //         needsRefresh = true
      //       }
      //       parent = parent.parent
      //     }
      //     if (needsRefresh) refreshUI()
      //     outliner.setValue(object.id)
      //   } else {
      //     outliner.setValue(null)
      //   }
      // })
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

function changeActive () {
  editor.selectById(parseInt(outliner.getValue()))
}

function getLabel (object) {
  let html = getObjectType(object) + '-' + escapeHTML(object.name)

  if (object.isMesh) {
    const geometry = object.geometry
    const material = object.material

    html += `${escapeHTML(geometry.name)}`
    html += `${escapeHTML(getMaterialName(material))}`
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

const selectedIndex = -1

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
  switch (e.keyCode) {
    case 38: // up
      listSelectIndex(selectedIndex - 1)
      break
    case 40: // down
      listSelectIndex(selectedIndex + 1)
      break
  }
}

function setOptions (options) {
  const scope = this

  while (scope.dom.children.length > 0) {
    scope.dom.removeChild(scope.dom.firstChild)
  }

  function onClick () {
    scope.setValue(this.value)

    const changeEvent = document.createEvent('HTMLEvents')
    changeEvent.initEvent('change', true, true)
    scope.dom.dispatchEvent(changeEvent)
  }

  //

  scope.options = []

  for (let i = 0; i < options.length; i++) {
    const div = options[i]
    div.className = 'option'
    scope.dom.appendChild(div)

    scope.options.push(div)

    div.addEventListener('click', onClick)
  }

  return scope
}

function listSelectIndex (index) {
  if (index >= 0 && index < listOptions.length) {
    setSelectValue(listOptions[index].value)

    const changeEvent = document.createEvent('HTMLEvents')
    changeEvent.initEvent('change', true, true)
    // this.dom.dispatchEvent(changeEvent)
  }
}

function setSelectValue (value) {
  for (let i = 0; i < listOptions.length; i++) {
    const element = listOptions[i]

    if (element.value === value) {
      element.classList.add('active')

      // scroll into view

      const y = element.offsetTop - this.dom.offsetTop
      const bottomY = y + element.offsetHeight
      const minScroll = bottomY - this.dom.offsetHeight

      if (this.dom.scrollTop > y) {
        this.dom.scrollTop = y
      } else if (this.dom.scrollTop < minScroll) {
        this.dom.scrollTop = minScroll
      }

      this.selectedIndex = i
    } else {
      element.classList.remove('active')
    }
  }

  this.selectedValue = value

  return this
}
</script>
<style lang="less">
.arrow {
  width: 16px; height: 16px;
  transition: transform 0.1s;
}
</style>
