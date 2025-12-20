import request from '@/utils/request';

export default {
  getQaList(params) {
    return request({
      url: '/admin/qas', 
      method: 'get',
      params
    });
  }
};