<template>
  <div id="sidebar">
    <SidebarScene />
    <SidebarProperties />
  </div>
</template>
<script setup>
import SidebarScene from './Sidebar/Scene.vue'
import SidebarProperties from './Sidebar/Properties.vue'

</script>
<style lang="less">
#sidebar {
  position: absolute;
  right: 0;
  top: 32px;
  bottom: 0;
  width: 350px;
  background: #161616;
  padding: 3px;
  box-sizing: border-box;
  display: flex; flex-direction: column;
}
</style>
