import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie' // 后续存储Token用

// 导入页面组件
import Login from '@/views/login/Login.vue'
import Layout from '@/components/Layout.vue'
import Home from '@/views/home/Home.vue'
import QaList from '@/views/infoList/QaList.vue'
import WorkOrderList from '@/views/infoList/WorkOrderList.vue'
import NoticeList from '@/views/notice/NoticeList.vue'
import ServiceList from '@/views/service/ServiceList.vue'

// 路由规则：登录页 → 登录后Layout → 各功能页
const routes = [
  // 1. 登录页（无需权限）
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  // 2. 登录后布局（所有子页需权限）
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    meta: { requiresAuth: true }, // 需要登录
    redirect: '/home', // 默认跳首页
    children: [
      { path: 'home', name: 'Home', component: Home, meta: { title: '首页' } },
      { path: 'info/qa', name: 'QaList', component: QaList, meta: { title: '问答列表' } },
      { path: 'info/workOrder', name: 'WorkOrderList', component: WorkOrderList, meta: { title: '保修列表' } },
      { path: 'notice', name: 'NoticeList', component: NoticeList, meta: { title: '通知列表' } },
      { path: 'service', name: 'ServiceList', component: ServiceList, meta: { title: '便民推荐' } }
    ]
  },
  // 404 → 重定向到登录页
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：控制登录权限
router.beforeEach((to, from, next) => {
  // 从Cookie取Token（登录成功后会存）
  const token = Cookies.get('admin_token')
  
  // 规则1：需要登录的页面，无Token → 跳登录
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // 规则2：已登录状态，访问登录页 → 跳首页
  if (to.path === '/login' && token) {
    next('/home')
    return
  }

  // 正常放行
  next()
})

export default router