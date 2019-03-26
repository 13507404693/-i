// pages/Shop/Shop.js
const { api, shopApi } = require('../../server/index');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    headerStyle:'background:none;',
    mainBanner: [],
    mainBannerCurrent: 0,
    nav: [],
    bannerTheme: [],
    hotGoodsList:[],
    hotGoodspage: 1,
    hotGoodsPageSize: 10,
    hotGoodsLoading: false,
    classifActivity: [],
    classifActivityIndex: 0,
    classifActivityGoods: [],
    classifActivityGoodsCurrent: 0,
    hotActivity:[],
    hotActivityGoods: [],
    hotActivityGoods: 0,
    hotActivityGoodsCurrent: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showNavigationBarLoading();

    // 将分享页面带有的 member_id 保存
    if (options.member_id !== undefined && options.member_id !== ''){
      wx.setStorageSync('meId', options.member_id);
    };

    this.getShopHotGoods();

    shopApi.getMainBanner().then( res => {
      wx.hideNavigationBarLoading();
      
      if (res.data.status === false){
        return Promise.reject(res.data.msg);
      };
      
      this.setData({
        mainBanner: res.data.data
      });
    }).catch(err => console.error(err));

    /**
     * 获得 商品首页活动
     */
    shopApi.getShopActivity().then(res => {

      if (res.data.status === false) {
        return Promise.reject(res.data.msg);
      };

      let nav = [], theme = [], classifActivity = [], hotActivity = [];

      for (let index = 0; index < res.data.data.length; index++) {
        const item = res.data.data[index];

        if (parseInt(item.position) === 4){
          nav.push(item);
        };

        if (parseInt(item.position) === 5){
          theme.push(item);
        };

        if (parseInt(item.position) === 6) {
          classifActivity.push(item);
        };

        if (parseInt(item.position) === 7) {
          hotActivity.push(item);
        };
      };

      this.setData({
        nav: nav,
        bannerTheme: theme,
        classifActivity: classifActivity,
        hotActivity: hotActivity
      });

      this.getclassifActivityGoods();
      this.gethotActivityGoods();
    }).catch(err => console.error(err));
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.globaData.referrerInfo = {};
  },
  /**
   * 自定义轮播 圆点
   */
  mainBannerChange(e){
    this.setData({ mainBannerCurrent: e.detail.current});
  },
  bannerClassif(e) {
    this.setData({ classifActivityGoodsCurrent: e.detail.current });
  },
  bannerBest(e) {
    this.setData({ hotActivityGoodsCurrent: e.detail.current });
  },
  /**
   * 切换 分类活动 tab
   */
  classifActivityTab(e){
    this.setData({ classifActivityGoods: [], classifActivityIndex: e.currentTarget.dataset.index});
    this.getclassifActivityGoods();
  },
  /**
  * 监听页面滚动事件
  */
  onPageScroll(e) {
    if (e.scrollTop >= 110) {
      this.setData({
        headerStyle: 'background:#e52e31;opacity:1;padding-top:0;'
      });
    } else {
      this.setData({
        headerStyle: 'background:none;opacity:.8;padding-top:20rpx;'
      });
    }
  },
  /**
   * 获取精选商品
   */
  getShopHotGoods(isRenovate){
    wx.showNavigationBarLoading();

    shopApi.getHotGoods(this.data.hotGoodspage, this.data.hotGoodsPageSize).then( res => {
      wx.hideNavigationBarLoading();

      if (res.data.status === false) {
        this.setData({
          hotGoodsLoading: false,
          noGoodsTips: res.data.msg
        });
        return;
      };
      
      let listData = [];
      if (isRenovate){
        listData = res.data.data.goodsList;
      }else{
        listData = this.data.hotGoodsList.concat(res.data.data.goodsList);
      };

      this.setData({
        hotGoodsList: listData,
        hotGoodsLoading: false
      });

    }).catch( err => console.error(err));
  },
  /**
   * 点击活动-根据类型跳转
   */
  tapActivity(e){
    const dataset = e.currentTarget.dataset;

    if (parseInt(dataset.type) === 5 || parseInt(dataset.type) === 3 || parseInt(dataset.type) === 4 || parseInt(dataset.type) === 7) {
      wx.navigateTo({
        url: `/pages/GoodsList/GoodsList?type=${dataset.type}&ids=${dataset.url}&title=${dataset.name}`,
      });
      return false;
    };

    if (parseInt(dataset.type) === 2 ){
      wx.navigateTo({
        url: `/pages/Commoditydetails/Commoditydetails?goodsId=${dataset.url}`,
      });
      return false;
    };

    if (parseInt(dataset.type) === 1 || parseInt(dataset.type) === 8){
      wx.navigateTo({
        url: `/pages/WebView/WebView?url=${encodeURI(dataset.url)}&referrerInfo=1001`,
      });
      return false;
    };
  },
  /**
   * 获取 分类活动 商品
   */ 
  getclassifActivityGoods(){
    const classifActivityItem = this.data.classifActivity[this.data.classifActivityIndex];
    wx.showNavigationBarLoading();
    // if (parseInt(classifActivityItem.type) !== 7){
    //   console.log('活动不符合当前位置展示！ type = 7 position	= 6');
    //   return;
    // };

    shopApi.getActivityDetail(classifActivityItem.type, classifActivityItem.url, 1, 15).then(res => {
      wx.hideNavigationBarLoading();
      
      if (!res.data.status) {
        return Promise.reject(res.data.msg);
      };

      this.setData({
        classifActivityGoods: this.pagingGoods(res.data.data),
        classifActivityGoodsCurrent: 0
      });
    }).catch(err => console.error(err));
  },
  /**
   * 获取 热卖商品
   */
  gethotActivityGoods(){
    const hotActivity = this.data.hotActivity[0];

    shopApi.getActivityDetail(hotActivity.type, hotActivity.url, 1, 15).then(res => {

      if (!res.data.status) {
        return Promise.reject(res.data.msg);
      };

      this.setData({
        hotActivityGoods: this.pagingGoods(res.data.data)
      });
    }).catch(err => console.error(err));
  },
  /**
   * 商品 分页
   */
  pagingGoods(data){
    let goods = data;
    const goodsPage = Math.ceil(goods.length / 3);
    let goodsArr = [];

    for (let index = 0; index < goodsPage; index++) {
      let arr = [];
      for (let i = index * 3; i < goods.length; i++) {
        if (arr.length < 3) {
          arr.push(goods[i]);
        };
      };
      goodsArr.push(arr);
    };
    return goodsArr;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      hotGoodspage: ++this.data.hotGoodspage,
      hotGoodsLoading: true,
      noGoodsTips: ''
    });

    this.getShopHotGoods();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '兑的品质生活',
      path: `/pages/Shop/Shop?member_id=${wx.getStorageSync('member_id')}`,
      imageUrl: ''
    }
  },
  /**
   * 监听-点击 tab 时触发
   */
  onTabItemTap(e){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 400
    });
  }
})