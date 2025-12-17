import request from '@/utils/request';

export default {
  getNoticeList(params) {
    return request({
      url: '/admin/notices', 
      method: 'get',
      params 
    });
  },

  getNoticeDetail(id) {
    return request({
      url: `/admin/notices/${id}`,
      method: 'get'
    });
  },

  addNotice(data) {
    return request({
      url: '/admin/addNotices',
      method: 'post',
      data
    });
  },

  updateNotice(id, data) {
    return request({
      url: `/admin/updaNotices/${id}`,
      method: 'put',
      data
    });
  },

  deleteNotice(id) {
    return request({
      url: `/admin/delNotices/${id}`,
      method: 'delete'
    });
  }
};