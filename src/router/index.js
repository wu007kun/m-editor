import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './route-list'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
