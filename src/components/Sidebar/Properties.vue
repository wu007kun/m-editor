<template>
  <div class="sidebar-properties">
    <div class="tab-list">
      <div class="tab-item"
        :class="{
          active: activeTab === 0
        }"
        @click="setActiveTab(0)">
        <img src="@/assets/images/env.png" alt="">
      </div>
      <div class="tab-item"
        :class="{
          active: activeTab === 1
        }"
        @click="setActiveTab(1)">
        <img src="@/assets/images/object.png" alt="">
      </div>
      <div class="tab-item"
        :class="{
          active: activeTab === 2
        }"
        @click="setActiveTab(2)">
        <img src="@/assets/images/material.png" alt="">
      </div>
    </div>
    <div class="tab-panel">
      <div v-show="activeTab === 0" class="panel-content">
        <Background />
      </div>
      <div v-show="activeTab === 1" class="panel-content">
        <ObjectComp />
      </div>
      <div v-show="activeTab === 2" class="panel-content" ref="matRef">

      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from 'vue'
import { SidebarMaterial } from '@/editor/Sidebar/Sidebar.Material.js'
import Background from './Background.vue'
import ObjectComp from './Object.vue'
import { useMainStore } from '@/store'
const store = useMainStore()
const matRef = ref()

onMounted(() => {
  watch(() => store.editorReady, ready => {
    if (ready) {
      const editor = window.editor
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
  flex-grow: 1; flex-shrink: 1;
  height: 300px;
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
  .tab-panel {
    width: calc(100% - 34px); height: 100%;
    box-sizing: border-box;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 3px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-thumb {
      width: 3px;
      border-radius: 3px;
      background-color: #3D3D3D;
    }
  }
}
.detail-form {
  padding: 10px 20px; box-sizing: border-box;
  .detail-form-group {
    margin-bottom: 10px;
    .detail-form-item {
      height: 30px;
      display: flex; align-items: center;
      .label {
        margin-right: 10px;
        width: 80px; text-align: right;
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
  }

}

</style>
