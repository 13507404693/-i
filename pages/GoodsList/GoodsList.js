// pages/GoodsList/GoodsList.js
const { api, shopApi } = require('../../server/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    page: 1,
    pageSize: 10,
    loadingState: true,
    sort: '',
    touchGesture: '',
    activityImg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData(options);

    this.getGoodsList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: this.data.title
    })
  },
  /**
   * 获取 商品列表
   */
  getGoodsList(){
    shopApi.getActivityDetail(
      this.data.type, 
      this.data.ids, 
      this.data.page, 
      this.data.pageSize, 
      this.data.sort
    ).then(res => {

      if (!res.data.status) {
        this.setData({
          loadingState: false,
          noGoodsMsgState: true
        });
        return;
      };
      
      if (parseInt(this.data.type) === 5){
        this.setData({
          goodsList: this.data.goodsList.concat(res.data.data.goodsList),
          loadingState: false,
          activityImg: res.data.data.img
        });
      }else{
        this.setData({
          goodsList: this.data.goodsList.concat(res.data.data),
          loadingState: false
        });
      }
    }).catch(err => console.error(err));
  },
  /**
   * 监听-列表排序
   */
  onSort(e){
    this.setData({ touchGesture: 'down',loadingState: true, goodsList: [], sort: e.detail, page: 1});
    this.getGoodsList();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: ++this.data.page,
      loadingState: true,
      noGoodsMsgState: false
    });

    this.getGoodsList();
  },
  /**
   * 监听-滑动手势
   */
  onTouchGesture(e){
    this.setData({
      touchGesture: e.detail.ty || 'down'
    });
  }
})