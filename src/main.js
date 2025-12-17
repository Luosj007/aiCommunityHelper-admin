import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 1. Element Plus（UI库）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 2. Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 3. 路由
import router from './router'
// 4. Pinia（状态管理）
import { createPinia } from 'pinia'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载所有依赖
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')