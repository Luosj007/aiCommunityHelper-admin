import axios from 'axios';
import Cookies from 'js-cookie';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: 'http://localhost:7001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器：自动携带token
request.interceptors.request.use(
  (config) => {
    // 从cookie中获取登录时存储的admin_token
    const token = Cookies.get('admin_token');
    if (token) {
      // 按后端要求的格式携带token（后端auth中间件识别的字段，常见为Authorization）
      config.headers.Authorization = `Bearer ${token}`; 
      // 若后端要求token字段是其他名称（如token），则改为：
      // config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误（含token失效）
request.interceptors.response.use(
  (response) => {
    // 按后端返回格式处理，比如后端返回 { code, data, msg }
    const res = response.data;
    // 假设后端成功码是200，非200则抛错
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(res);
    }
    return res; // 只返回核心数据，简化组件内调用
  },
  (error) => {
    // 处理401（token失效/未提供）
    if (error.response?.status === 401) {
      ElMessageBox.confirm(
        '登录状态已失效，请重新登录',
        '提示',
        { confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning' }
      ).then(() => {
        Cookies.remove('admin_token'); // 清除无效token
        router.push('/login'); // 跳登录页
      });
    }
    // 统一提示错误信息
    ElMessage.error(error.response?.data?.msg || '服务器错误');
    return Promise.reject(error);
  }
);

export default request;