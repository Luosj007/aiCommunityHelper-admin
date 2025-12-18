import request from '@/utils/request';

export default {
  getWorkOrderList(params) {
    return request({
      url: '/admin/workOrders', 
      method: 'get',
      params 
    });
  },

  getWorkOrderDetail(id) {
    return request({
      url: `/admin/workOrders/${id}`,
      method: 'get'
    });
  },

  addWorkOrder(data) {
    return request({
      url: '/admin/addWorkOrders',
      method: 'post',
      data
    });
  },

  updateWorkOrder(id, data) {
    return request({
      url: `/admin/updaWorkOrders/${id}`,
      method: 'put',
      data
    });
  },

  deleteWorkOrder(id) {
    return request({
      url: `/admin/delWorkOrders/${id}`,
      method: 'delete'
    });
  }
};