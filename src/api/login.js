import request from '@/utils/request';

export default {
  adminLogin(params) {
    return request({
      url: 'http://localhost:7001/admin/login',
      method: 'post',
      data: params
    })
  }
};