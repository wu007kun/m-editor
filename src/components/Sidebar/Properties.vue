<template>
  <div class="sidebar-properties">
    <div class="tab-list">
      <div class="tab-item"
        :class="{
          active: activeTab === 0
        }"
        @click="setActiveTab(0)">
        <img src="@/assets/images/icon.png" alt="">
      </div>
      <div class="tab-item"
        :class="{
          active: activeTab === 1
        }"
        @click="setActiveTab(1)">
        <img src="@/assets/images/icon.png" alt="">
      </div>
      <div class="tab-item"
        :class="{
          active: activeTab === 2
        }"
        @click="setActiveTab(2)">
        <img src="@/assets/images/icon.png" alt="">
      </div>
    </div>
    <div class="tab-panel">
      <div v-show="activeTab === 0" class="panel-content" ref="envRef">

      </div>
      <div v-show="activeTab === 1" class="panel-content" ref="meshRef">

      </div>
      <div v-show="activeTab === 2" class="panel-content" ref="matRef">

      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { SidebarObject } from '@/editor/Sidebar/Sidebar.Object.js'
import { SidebarGeometry } from '@/editor/Sidebar/Sidebar.Geometry.js'
import { SidebarMaterial } from '@/editor/Sidebar/Sidebar.Material.js'

const props = defineProps({
  editorReady: {
    type: Boolean,
    default: false
  }
})

const envRef = ref()
const meshRef = ref()
const matRef = ref()

onMounted(() => {
  watch(() => props.editorReady, ready => {
    if (ready) {
      const editor = window.editor
      // myRef.value.appendChild()
      meshRef.value.appendChild(new SidebarObject(editor).dom)
      meshRef.value.appendChild(new SidebarGeometry(editor).dom)
      matRef.value.appendChild(new SidebarMaterial(editor).dom)
    }
  }, {
    immediate: true
  })
})

const activeTab = ref(0)
function setActiveTab (n) {
  activeTab.value = n
}
</script>
<style lang="less">
.sidebar-properties {
  flex-grow: 1;
  display: flex;
  margin-top: 3px;
  border-radius: 4px;
  background-color: #303030;
  .tab-list {
    width: 34px;
    background: #1D1D1D;
    .tab-item {
      margin-bottom: 4px;
      width: 100%; height: 34px;
      border-radius: 4px 0 0 4px;
      cursor: pointer;
      img {
        margin: 5px 5px;
        width: 24px; height: 24px;
      }
      &.active {
        background: #303030;
      }
    }
  }
}
</style>
