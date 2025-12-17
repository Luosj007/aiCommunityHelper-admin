import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

// 定义用户Store：存储Token、角色（管理员/物业）
export const useUserStore = defineStore('user', {
  state: () => ({
    token: Cookies.get('admin_token') || '',
    role: Cookies.get('admin_role') || '' // 角色：admin/property
  }),
  actions: {
    // 登录成功：存Token和角色到Store+Cookie
    setUserInfo(token, role) {
      this.token = token
      this.role = role
      // Cookie有效期7天
      Cookies.set('admin_token', token, { expires: 7 })
      Cookies.set('admin_role', role, { expires: 7 })
    },
    // 退出登录：清空Store+Cookie
    logout() {
      this.token = ''
      this.role = ''
      Cookies.remove('admin_token')
      Cookies.remove('admin_role')
    }
  }
})