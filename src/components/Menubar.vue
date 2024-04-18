<template>
  <div id="menubar">
    <MenubarFile />
    <MenubarEdit />
    <MenubarAdd />
  </div>
</template>
<script setup>
import MenubarAdd from './Menubar/Add.vue'
import MenubarEdit from './Menubar/Edit.vue'
import MenubarFile from './Menubar/File.vue'
</script>
<style lang="less">
#menubar {
  position: absolute;
  width: 100%;
  height: 32px;
  background: #181818;
  padding: 0;
  margin: 0;
  right: 0;
  top: 0;
  color: #D6D6D6;
  display: flex; align-items: center;
  .menu {
    position: relative;
    cursor: pointer;
    margin-right: 8px;
    &:hover {
      background: #303030;
      .options {
        display: block;
      }
    }
    .title {
      display: inline-block;
      margin: 0;
      padding: 8px;
      line-height: 16px;
    }
    .options {
      position: fixed;
      margin-top: -2px;
      display: none;
      padding: 5px 0;
      background: #181818;
      width: 150px;
      max-height: calc(100% - 80px);
      overflow: auto;
      box-shadow: 0px 0px 1px 1px #242424;

      hr {
        border-color: #2F2F2F;
      }
      .option {
        background-color: transparent;
        padding: 5px 10px;
        margin: 0 !important;
        &:hover {
          color: #fff;
          background-color: #3F3F3F;
        }
        &:active {
          color: #666;
          background: transparent;
        }
      }
      .underlined {
        border-bottom: 1px solid #333;
      }
      .inactive {
        color: #777;
        background-color: transparent;
        padding: 5px 10px;
        margin: 0 !important;
      }
    }
  }
}

</style>
