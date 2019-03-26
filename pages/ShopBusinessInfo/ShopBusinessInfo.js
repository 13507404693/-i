// pages/ShopBusinessInfo/ShopBusinessInfo.js
const {shopApi } = require('../../server/index');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    token: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync('token');

    this.setData({ storeId: options.storeId, token: token });

    shopApi.getBusinessInfo(this.data.storeId, this.data.token).then(res => {

      if (res.data.status) {
        this.setData({
          info: res.data.data
        });
      };

    }).catch(err => console.error(err));

    if (typeof token !== 'string' || token.length < 1) {
      this.setData({
        isLogin: false
      });
    };

  },

   /**
   * 点击-收藏店铺 
   */
  tapCollection(){

    if (!this.data.isLogin) {
      wx.showModal({
        title: '提示：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return false;
    };

    wx.showNavigationBarLoading();

    shopApi.storeCollection(this.data.token, this.data.storeId).then(res => {
      wx.hideNavigationBarLoading();
      
      if (res.data.status){
        this.setData({
          ['info.is_fav']: res.data.msg === "收藏成功" ? 1 : 0
        });

        if (this.data.info.is_fav === 0){
          showErrorToast(res.data.msg);
        }else{
          showSuccessToast(res.data.msg)  
        };

      };
    }).catch(err => console.error(err));
  }
})