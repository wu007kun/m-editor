import * as GCMapDev from '../lib/index.js'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

window.GCMap = GCMapDev
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
