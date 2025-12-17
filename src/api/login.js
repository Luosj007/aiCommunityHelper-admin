import request from '@/utils/request';

export default {
  adminLogin(params) {
    return request({
      url: '/admin/login',
      method: 'post',
      data: params
    })
  }
};