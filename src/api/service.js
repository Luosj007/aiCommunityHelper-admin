import request from '@/utils/request';

export default {
  getServiceList(params) {
    return request({
      url: '/admin/services', 
      method: 'get',
      params 
    });
  },

  getServiceDetail(id) {
    return request({
      url: `/admin/services/${id}`,
      method: 'get'
    });
  },

  addService(data) {
    return request({
      url: '/admin/addServices',
      method: 'post',
      data
    });
  },

  updateService(id, data) {
    return request({
      url: `/admin/updaServices/${id}`,
      method: 'put',
      data
    });
  },

  deleteService(id) {
    return request({
      url: `/admin/delServices/${id}`,
      method: 'delete'
    });
  }
};