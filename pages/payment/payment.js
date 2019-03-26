const { api, wxApi } = require('../../server/index.js');
const { extractURLparmes, showErrorToast } = require('../../utils/util');
const app = getApp();

// pages/payment/payment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeid: '',
    points: 0,
    price: 0,
    money: '',
    submitState: false,
    isOpenAuthLoginGetUserInfo: false,
    payMode: '1',
    isShowRedPacketPopup: false,
    isFocus:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const src = decodeURIComponent(options.q)
    const parames = extractURLparmes(src);
    let businessParam = {};

    if (parames.storeid === undefined && parames.taima === undefined) {
      wx.showToast({
        title: '提示：店铺未开通支付！',
        icon: 'none',
        mask: true,
        duration: 2000
      });
      this.setData({ submitState: true });
      return;
    };

    businessParam = parames.storeid === undefined ? { 'taima': parames.taima } : { 'storeid': parames.storeid };

    api.getPayBusinessByTaimaOrStoreid(businessParam).then(res => {
      
      if (res.data.status) {
        this.setData({
          storeid: res.data.data.store_id,
          store_name: res.data.data.store_name,
          store_heard: res.data.data.store_heard,
          is_ower: res.data.data.is_ower
        });
        return;
      };

      wx.showToast({
        title: `提示：${res.data.msg}`,
        icon: 'none',
        mask: true,
        duration: 2000
      });
      this.setData({ submitState: true });

    }).catch(err => console.error(err));

    const userInfo = wx.getStorageSync('userInfo');
    
    this.setData({
      storeid: parames.storeid || 0,
      userInfo: userInfo || {}
    });

    if (typeof userInfo !== 'object' || wx.getStorageSync('unionid') === '' || wx.getStorageSync('openid') === ''){
      this.getAuthUserInfo();
    };

  },
  onShow(){
    this.setData({
      scene: app.globaData.referrerInfo.scene || 1001
    });
  },
  /**
   * 获取用户授权 数据
   */
  getAuthUserInfo() {

    let session_key = '';

    wxApi.getSetting().then(settingRes => {
      // 如果已经授权就 获取用户信息
      if (settingRes.authSetting['scope.userInfo'] === true) {
        // 1、 调用小程序登录
        wx.showLoading({ title: '加载中', mask: true });
        return wxApi.login();
      };

      return Promise.reject('未授权！');

    }).then(res => {

      // 2、拿到小程序 code 去，获取 session_key
      return api.getOpenId(res.code)
    }).then(openidRes => {
      if (openidRes.statusCode !== 200) return Promise.reject(openidRes.data);
      
      session_key = openidRes.data.data.session_key;
      // 获取 加密用户数据
      return wxApi.getUserInfo();

    }).then(info => {

      // 调用 解密数据接口
      return api.decryptWxDatar(session_key, info.iv, info.encryptedData, wx.getStorageSync('meId'));

    }).then(res => {
      if (res.data.status) {
        const resData = res.data.data;
        resData['session_key'] = session_key;

        this.setData({
          userInfo: resData
        });

        wx.setStorageSync('unionid',resData.unionId);
        wx.setStorageSync('openid',resData.openId);
        wx.setStorageSync('userInfo',resData);

        wx.hideLoading();
        return false;
      };

      return Promise.reject('解密失败，' + res.data.msg);
    }).catch(err => {
      console.error(err);
      wx.hideLoading();
      this.setData({
        isOpenAuthLoginGetUserInfo: true,
        isFocus: false
      });
    });
  },
  /**
   * 点击选择支付方式
   */
  tapPayMode(e){
    if (this.data.is_ower == 0){
      showErrorToast('品兑：商家暂未参与优惠','');
      return;
    };

    this.setData({ payMode: e.currentTarget.dataset.paymode});
    this.receiveActualPrice(this.data.money);

  },
  /**
   * 输入框失去焦点验证 金额
   */
  focusMoneyInput(e){
    this.validateMoney(e.detail.value);
    wx.showLoading({ title: '加载中...', mask: true });
    this.receiveActualPrice(e.detail.value);    
  },
  /**
   * 验证 金额
   * @param {Strong} value 金额
   */
  validateMoney(value) {
    const money = value;
    const moneyss = /^(([0-9]+[\.]?[0-9]{1,2})|[1-9])$/;

    if (money === '') return false;
    if (!moneyss.test(money) || money <= 0) {
      wx.showToast({
        title: '品兑：金额必须为保留两位小数点以内的正数！',
        icon: 'none',
        duration: 2000
      });
      return false;
    };

    return true
  },
  /**
   * 1输入金额获取折扣信息  输入金额-积分=实付金额
   */
  onInput(e) {

    const deteilvalue = e.detail.value;//输入的金额
    
    if (deteilvalue === '') {
      this.setData({
        points: '',//积分
        price: ''//实付金额
      })
    };
    
    this.receiveActualPrice(deteilvalue);
  },
  receiveActualPrice(val){
    // if (val === '') return;

    /** 全款支付 */
    if (this.data.payMode === '1') {
      this.setData({ money: val, price: Number(val).toFixed(2) });
      wx.hideLoading();
      return;
    };

    /** 积分抵扣 */
    api.getDiscount({
      storeid: this.data.storeid,
      phone: this.data.userInfo.member_mobile,
      money: val,
      unionid: this.data.userInfo.unionId
    }).then((res) => {
      wx.hideLoading();
      /** 输入金额-积分=实付金额 */
      const price = Math.round(Number(val) * 100 - Number(res.data.dkjf) * 100) / 100;
      
      this.setData({
        sjzks: res.data.sjzks,// 折扣
        points: res.data.dkjf,// 积分
        price: price.toFixed(2),
        money: val
      });
    }).catch((err) => {
      console.error(err);
    });

  },
  /**
   * 下单
   */
  settlement: function () {

    let order_id = '';
    
    this.setData({ submitStateloading: true, submitState: true });
    
    api.getpayinfo(
      this.data.userInfo.openId, 
      this.data.userInfo.unionId, 
      this.data.money, 
      this.data.storeid,
      this.data.userInfo.member_mobile,
      { formid: this.data.formid,payall:this.data.payMode}
    ).then(res => {
      
      if (res.data.data.result_code === "000000") {
        // 调起支付
        order_id = res.data.data.order_id;
        return wxApi.requestPayment(res.data.data);
      } else {
        this.setData({ submitStateloading: false, submitState: false });

        wx.showModal({
          title: '预支付失败',
          content: res.data.data.result_msg,
          success: function (res) {
            if (res.confirm) {
              return false;
            } else if (res.cancel) {
              return false;
            }
          }
        })
        return Promise.reject(res.data.data.result_msg);
      };

    }).then(res => {
      this.setData({ submitStateloading: false, submitState: false });
      if (res !== undefined && res.errMsg === "requestPayment:ok") {
        wx.showLoading({ title: '载入中...' });
        return api.getRedPacket(order_id);
      } 
      return Promise.reject(res.errMsg);
    }).then(res => {
      wx.redirectTo({
        url: `/pages/RedPacket/RedPacket?redPacketSum=${res.data.data.money || 0}&points=${res.data.data.points || 0}&source=payment&order_id=${order_id}`
      });
    }).catch(err => {
      this.setData({ submitStateloading: false, submitState: false });
      console.error(err);

      wx.getNetworkType({
        success: function (res) {
          if (res.networkType === 'none'){
            wx.showModal({
              title: '网络不佳，请稍后重试',
              content: '',
              showCancel: false,
              confirmText: '知道了'
            });
          }
        }
      })  
    });
  },
  /**
   * 点击 确认支付
   */
  submitForm(e) {
    const formid = e.detail.formId;
    this.setData({
      formid: formid
    });
    
    if (this.validateMoney(this.data.price)) {
      this.settlement();
    };
  },
  /**
   * 监听授权成功
   */
  onAuthLoginGetUserInfo(res) {
    this.setData({
      userInfo: res.detail,
      isOpenAuthLoginGetUserInfo: false,
      submitState: false
    });

    wx.setStorageSync('userInfo', res.detail);
    wx.setStorageSync('unionid', res.detail.unionId);
    wx.setStorageSync('openid', res.detail.openId);
  },
  /**
   * 监听-我的钱包弹窗 打开或关闭
   */
  redPacketChange(e){
    this.setData({
      isShowRedPacketPopup: e.currentTarget.dataset.state || e.detail.state
    });
  }
})