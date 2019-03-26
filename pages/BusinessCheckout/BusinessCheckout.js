// pages/BusinessCheckout/BusinessCheckout.js
const {
  api,
  wxApi
} = require('../../server/index');
const {
  formatNumber,
  showSuccessToast,
  getGreatCircleDistance,
  showErrorToast
} = require('../../utils/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: '',
    payTypeData: [{
        id: 0,
        name: '全款支付'
      },
      {
        id: 1,
        name: '积分抵扣'
      }
    ],
    payTypeIndex: 0,
    paytypePopup: false,
    isMask: false,
    submitBtnState: true,
    telephone: '',
    orderMsg: '',
    isAgreement: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      cart,
      store,
      totalPrice
    } = options;
    let goodsData = [];
    const date = new Date();
    const userInfo = wx.getStorageSync('userInfo');

    cart = JSON.parse(cart);
    store = JSON.parse(store);

    for (const key in cart) {
      goodsData.push(cart[key]);
    };
    
    this.setData({
      goodsData: goodsData,
      storeInfo: store,
      startTime: `${date.getHours()}:${formatNumber(date.getMinutes())}`,
      userInfo: userInfo,
      totalPrice: totalPrice,
      telephone: userInfo.member_mobile
    });

    // 获取 用户当前位置
    wxApi.getLocation('gcj02').then(res => {
      let num = getGreatCircleDistance(res.latitude, res.longitude, Number(store.store_lat), Number(store.store_lng));

      this.setData({
        location: res,
        distance: num > 1000 ? (num / 1000).toFixed(1) + 'km' : `${parseInt(num)}m`
      });
    });

    // 导航栏 标题交互
    wx.createIntersectionObserver(this).relativeToViewport()
    .observe('.title', observeRes => {
      if(observeRes.intersectionRatio >  0){
        wx.setNavigationBarTitle({title: ''});
      }else{
        wx.setNavigationBarTitle({title: '到店自取'});
      }
    });

  },

  /**
   * 监听-选择时间
   */
  onTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },

  /**
   * 监听-输入 input 框
   */
  onInputChange(e){
    this.setData({
      [e.target.dataset.key]: e.detail.value
    });
  },

  /**
   * 监听-选择 checked
   */
  checkedChange(e){
    this.setData({
      isAgreement: e.detail.value[0] == 1 
    });
  },

  /**
   * 点击-切换支付类型 弹窗
   */
  tapSwitchPaytypePopup() {
    this.setData({
      paytypePopup: !this.data.paytypePopup,
      isMask: !this.data.isMask
    });
  },

  /**
   * 点击-选择支付类型
   */
  tapSelectPayType(e) {
    const {
      index
    } = e.currentTarget.dataset;

    let options = {
      payTypeIndex: index,
    };

    if (index === 0) {
      options = Object.assign(options, {
        paytypePopup: false,
        isMask: false,
        discountTotalPrice: 0,
        discountPrice: 0,
      });
    };

    if (index === 1) {
      const {
        storeInfo,
        userInfo,
        totalPrice
      } = this.data;

      api.getCheckoutPointsDiscount(storeInfo.store_id, userInfo.member_mobile, totalPrice).then(res => {
        if (res.data.status) {
          this.setData({
            discountTotalPrice: (Number(totalPrice) - Number(res.data.data)).toFixed(2),
            discountPrice: res.data.data,
            paytypePopup: false,
            isMask: false
          });
          if(res.data.data == 0){
            showSuccessToast(res.data.msg, '');
          };
          return;
        };

        showSuccessToast(res.data.msg, '');
      });
    };

    this.setData(options)
  },

  /**
   * 点击-弹窗遮罩
   */
  tapMask() {
    this.setData({
      paytypePopup: false,
      isMask: false
    });
  },

  /**
   * 点击-打开 查看地图
   */
  tapOpenLocation() {
    const {
      location,
      storeInfo
    } = this.data;
    const {
      latitude,
      longitude
    } = location;
    
    
    wx.openLocation({
      latitude: Number(storeInfo.store_lat),
      longitude: Number(storeInfo.store_lng),
      name: storeInfo.store_company_name || storeInfo.address_info || storeInfo.store_name,
      address: storeInfo.store_address,
      scale: 24
    })
  },

  /**
   * 提交订单
   */
  submitOrder() {
    const {
      storeInfo,
      userInfo,
      goodsData,
      payTypeIndex,
      payTypeData,
      telephone,
      time,
      startTime,
      orderMsg
    } = this.data;
    let goods = [];
    wx.showLoading({
      title: '载入中...',
      mask: true
    });

    goodsData.forEach(item => {
      goods.push({
        id: item.skuInfo.goods_id,
        num: item.amount,
        trait: item.trait || []
      });
    });

    api.getBusinessPayInfo(
      userInfo.member_mobile,
      JSON.stringify(goods),
      userInfo.openId,
      storeInfo.store_id,
      payTypeData[payTypeIndex].id,
      time || startTime,
      telephone,
      orderMsg
    ).then(res => {
      wx.hideLoading();

      if (res.data.status) {
        this.emptyBusinessCartStorageSync();
        return wxApi.requestPayment(res.data.data);
      };

      let msg = '';
      if(res.data.data == undefined){
        msg = res.data.msg;
      }else{
        msg = res.data.data.return_msg;
      };

      wx.showModal({
        title: '预支付失败',
        content: msg
      });

      return Promise.reject({
        errMsg: msg
      });
    }).then(res => {

      if (res.errMsg === 'requestPayment:ok') {
        wx.switchTab({
          url: `/pages/sQorder/sQorder`
        });
      };
    }).catch(err => {

      console.error(err);

      if (err.errMsg === "requestPayment:fail cancel") {
        wx.switchTab({
          url: `/pages/sQorder/sQorder`
        });
        return;
      };
      showErrorToast( err.errMsg || '服务器繁忙！', '', 1500);
    });
  },
  /**
   * 更新缓存购物车
   */
  emptyBusinessCartStorageSync() {
    const {
      member_mobile
    } = wx.getStorageSync('userInfo');
    const key = `userCart_${member_mobile}`;
    let userCart = wx.getStorageSync(key);

    userCart[`business_${this.data.storeInfo.store_id}`] = [];
    wx.setStorageSync(key, userCart);
  }
})