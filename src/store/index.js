import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    editorReady: false
  }),
  getters: {
  },
  actions: {
    setEditorReady () {
      this.editorReady = true
    }
  }
})
