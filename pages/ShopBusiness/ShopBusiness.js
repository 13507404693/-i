// pages/ShopBusiness/ShopBusiness.js
const { api, shopApi } = require('../../server/index');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tapNavIndex: 0,
    storeId: '',
    token: '',
    info: {},
    category: [],
    page: 1,
    pageSize: 10,
    categoryId: '',
    goodsList: [],
    loadingState: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync('token');

    
    this.setData({ isLogin: true, storeId: options.storeId, token: token});
    const resultAll = Promise.all([
      shopApi.getBusinessInfo(this.data.storeId, this.data.token),
      shopApi.getBusinessCategory(this.data.storeId)
    ]);
    
    resultAll.then(res => {
      if (res[0].data.status){
        this.setData({
          info: res[0].data.data
        });
      };
      
      if (res[1].data.status) {
        this.setData({
          category: res[1].data.data
        });
      };
      
    }).catch(err => console.error(err));
    
    this.getGoods();

    if (typeof token !== 'string' || token.length < 1) {
      this.setData({
        isLogin: false
      });
    };
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 获取分类 商品
   */
  getGoods(){
    this.setData({ loadingState: true, noGoodsMsgState: false});

    shopApi.getBusinessGoodsList(
      this.data.storeId,
      this.data.page,
      this.data.pageSize,
      this.data.categoryId
    ).then(res => {
      this.setData({ loadingState: false });

      if (res.data.status === false) {
        this.setData({ noGoodsMsgState: true})
        return Promise.reject(res.data.msg);
      };

      if (res.data.data.goodsList === undefined || res.data.data.goodsList.length < 1){
        this.setData({ noGoodsMsgState: true });
        return;
      };

      this.setData({
        goodsList: this.data.goodsList.concat(res.data.data.goodsList)
      });
    }).catch(err => console.error(err));
  },
  /**
   * 点击切换分类-获取分类商品
   */
  tapCategory(e){
    this.setData({
      tapNavIndex: e.currentTarget.dataset.index,
      categoryId: e.currentTarget.dataset.categoryid,
      page: 1,
      goodsList: []
    });

    this.getGoods();
  },
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({ 
      loadingState: true, 
      page: ++this.data.page  
    });

    this.getGoods();
  
  },
  /**
   * 点击-收藏店铺 
   */
  tapCollection(){
    if (!this.data.isLogin){
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