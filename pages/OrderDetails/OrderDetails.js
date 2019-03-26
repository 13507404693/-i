// pages/OrderDetails/OrderDetails.js
const { shopApi, wxApi} = require('../../server/index');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    info: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      token: wx.getStorageSync('token')
    });
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {  
    
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderDetails();
  },
  /**
   * 获取订单详情
   */
  getOrderDetails(){
    wx.showLoading({ title: '载入中...', mask: true });

    shopApi.getOrderDetailsByOrderId(this.data.token, this.data.orderId).then(res => {
      wx.hideLoading();

      if (!res.data.status) {
        return res.data.msg
      };

      // 电话号码隐藏处理
      let myphone = res.data.data.consignee_mobile.substr(3, 4);
      res.data.data.consignee_mobile = res.data.data.consignee_mobile.replace(myphone, "****");
      
      this.setData({
        info: res.data.data
      });
    }).catch(err => console.error(err));
  },
  /**
   * 点击-拨打电话
   */
  tapDialTelephone(e) {
    wxApi.makePhoneCall(e.target.dataset.phone);
  },
  /**
   * 点击-取消订单
   */
  tapCancelOrder(e) {

    this.showModal('取消订单？', '是否确认取消订单').then(res => {
      if (res.confirm) {
        wx.showNavigationBarLoading();

        return shopApi.cancelOrderByOrderId(this.data.token, this.data.orderId);
      };

      return Promise.reject(res.confirm);
    }).then(res => {
      wx.hideNavigationBarLoading();

      if (res.data.status) {
        showSuccessToast('订单取消成功');
        this.getOrderDetails();
        return ;
      };

      this.setData({ loadingState: false });
      showErrorToast(res.data.msg,'');
    }).catch(err => console.error(err));
  },
  /**
   * 点击-确认收货
   */
  tapConfirmOrder(e) {

    this.showModal('确认收货？', '是否确认收货').then(res => {
      if (res.confirm) {
        wx.showNavigationBarLoading();

        return shopApi.confirmOrderByOrderId(this.data.token, this.data.orderId);
      };

      return Promise.reject(res.confirm);
    }).then(res => {
      wx.hideNavigationBarLoading();
      
      if (res.data.status) {
        showSuccessToast('确认收货成功');
        this.getOrderDetails();

        // const cash_amount = Math.floor(res.data.data.cash * 100) / 100;
        wx.navigateTo({
          url: `/pages/RedPacket/RedPacket?redPacketSum=${res.data.data.cash}&points=${res.data.data.point}&source=order`
        });

        return;
      };

      this.setData({ loadingState: false });
      showErrorToast(res.data.msg,'');
    }).catch(err => console.error(err));

  },
  /**
   * 点击-查看物流
   */
  tapLogistics(e) {
    const dataset = e.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/Logistics/Logistics?code=${dataset.shippingcode}&goodsImg=${dataset.goodsimg}&expressName=${dataset.expressname}`
    });

  },
  /**
   * 点击-评论
   */
  tapComment(e) {
    const dataset = e.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/orderComment/orderComment?orderId=${dataset.orderid}&goodsImg=${dataset.goodsimg}`
    });
  },
  showModal(title, content){
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: title,
        content: content,
        success: resolve,
        fail: reject
      });
    });
  },
  /**
   * 点击-调起支付
   */
  tapPay(e) {
    wx.showLoading({ title: '载入中...', mask: true});

    this.getOrderPayInfo({
      token: this.data.token,
      paysn: e.currentTarget.dataset.paysn,
      openId: wx.getStorageSync('userInfo').openId,
      orderid: e.currentTarget.dataset.orderid,
    }).then(res => {
      wx.hideLoading();

      if (res.data.status) {
        return wxApi.requestPayment(res.data.data);
      };

      wx.showModal({
        title: '预支付失败',
        content: res.data.data.return_msg
      });

      return Promise.reject({ errMsg: res.data.data.return_msg });
    }).then(res => {

      if (res.errMsg === 'requestPayment:ok') {
        this.getOrderDetails();
      };
    }).catch(err => {
      console.error(err);

      if (err.errMsg === "requestPayment:fail cancel") {
        this.getOrderDetails();
        return;
      };

      wx.showToast({
        title: err.errMsg,
        icon: 'none',
        duration: 1500
      });
    });
  },
  /**
   * 获取订单支付信息
   */
  getOrderPayInfo(param){
    return new Promise( (resolve,reject) => {
      shopApi.submitOrderPay(
        param.token, 
        param.paysn, 
        param.openId
      ).then( res => {
        if(res.data.code == -10){
          return shopApi.submitOrderPayByOne(
            param.token, 
            param.orderid, 
            param.openId
          ).then(resolve);
        }else{
          return resolve(res);
        };
      }).catch( reject );
    });
  },
  /**
   * 点击打开会话
   */
  clickIm(e){

    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '品兑：您未登录，是否去登录？',
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

    const userInfo = wx.getStorageSync('userInfo');
    const param = {
      user: {
        name: userInfo.member_mobile,
        avatarUrl: userInfo.avatarUrl
      },
      receiveUser: {
          name: this.data.info.contacts_phone,
          avatarUrl: '',
          nickName: this.data.info.store_name
      },
      sourceType: 8,
      messageType: 1,
      id: this.data.info.goodsList[0].model_id
    };

    wx.navigateTo({
      url: `/pages/ImDialog/ImDialog?url=https://sp.lion-mall.com/wap6.0/webim/dialog&param=${this.urlJsonEncode(param)}&title=${this.data.info.store_name}`
    });
  },
  urlJsonEncode(json){
    return encodeURIComponent(JSON.stringify(json));
  }
})