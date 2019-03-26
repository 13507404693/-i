// pages/Logistics/Logistics.js
const { shopApi } = require('../../server/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logisticsList: [],
    token: '',
    expressName: '',
    code: '',
    expTextName: '',
    tel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      token: wx.getStorageSync('token'),
      goodsImg: options.goodsImg,
      expressName: options.expressName||'' ,
      code: options.code || ''
    });

    shopApi.getLogistics(this.data.token, this.data.code, this.data.expressName).then(res => {
      wx.hideNavigationBarLoading();
      // "status": 4,-1 待查询 0 查询异常 1 暂无记录 2 在途中 3 派送中 4 已签收 5 用户拒签 6 疑难件 7 无效单 8 超时单 9 签收失败 10 退回
      let stateText = '';

      switch (res.data.showapi_res_body.status) {
        case -1:
          stateText = '';
          break;
        case 0:
          stateText = '查询异常';
          break;
        case 1:
          stateText = '暂无记录';
          break;
        case 2:
          stateText = '在途中';
          break;
        case 3:
          stateText = '派送中';
          break;
        case 4:
          stateText = '已签收';
          break;
        case 5:
          stateText = '用户拒签';
          break;
        case 6:
          stateText = '疑难件';
          break;
        case 7:
          stateText = '无效单';
          break;
        case 8:
          stateText = '超时单';
          break;
        case 9:
          stateText = '签收失败';
          break;
        case 10:
          stateText = '退回';
          break;
      };
      
      this.setData({
        logisticsList: res.data.showapi_res_body.data||[],
        expTextName: res.data.showapi_res_body.expTextName || '',
        tel: res.data.showapi_res_body.tel || '',
        stateText: stateText
      });
    }).catch(err => console.log(err));
  }
})