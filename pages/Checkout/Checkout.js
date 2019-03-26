// pages/Confirmation/Confirmation.js
const { api, shopApi, wxApi } = require('../../server/index');
const { showSuccessToast, showErrorToast, filterEmoji, validateMoney } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    goodsList: [],
    totalPrice: '0.00',
    addressList: [],
    isNoAddress: false,
    addressDefault: {},
    totalPoints: '',
    actualPrice: '0.00',
    leaveWord: '',
    isShowRedPacketPopup: false,
    cashAmount: 0,
    deductionAmount: 0,
    entryDeductionAmount: 0,
    primaryPrice: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const token = wx.getStorageSync('token');
    const openid = wx.getStorageSync('userInfo').openId;

    if (typeof token !== 'string' || token.length < 1) {
      this.setData({
        isLogin: false
      });
      return;
    };

    this.setData({ isLogin: true, token: token, ids: options.ids, openid: openid });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({ title: '载入中...', mask: true });
    this.initAddressInfo();
    this.initOrderInfo();
  },
  /**
   * 初始化-地址信息
   */
  initAddressInfo(){
    shopApi.list_dz(this.data.token).then(res => {

      if (!res.data.status) {
        wx.showModal({
          title: '您还没有收货地址，是否现在新建一个？',
          content: '',
          confirmText: '新建',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: `/pages/Addmanagement/Addmanagement`
              });
            };
          }
        });
        this.setData({
          isNoAddress: true
        });
        return;
      };

      let arr = [];
      for (let index = 0; index < res.data.data.length; index++) {
        const item = res.data.data[index];
        if (item.is_default == 1) {
          arr.push(res.data.data[index])
        };
      }

      // 判断如果没有默认地址
      if (arr.length < 1) {
        arr.push(res.data.data[0]);
      };

      // 判断是否有选择的地址 
      if (wx.getStorageSync('pageSource') === 'checkout' && typeof wx.getStorageSync('choiceAddress') === 'object') {
        arr = [wx.getStorageSync('choiceAddress')];
      };

      this.setData({
        addressList: res.data.data,
        addressDefault: arr[0],
        isNoAddress: false
      });
    }).catch((err) => console.error(err));
  },
  /**
   * 初始化-订单信息
   */
  initOrderInfo(){
    shopApi.getCartCheckGoods(
      this.data.token,
      this.data.ids
    ).then(res => {
      wx.hideLoading();

      if (!res.data.status) {
        wx.navigateBack({
          delta: 1
        });
        return Promise.reject(res.data.msg);
      };

      this.setData({
        goodsList: res.data.data.orderList,
        totalPrice: res.data.data.total_goods.toFixed(2),
        actualPrice: res.data.data.total.toFixed(2),
        primaryPrice: res.data.data.total.toFixed(2),
        totalPoints: res.data.data.total_points
      });

      return shopApi.getMemberExcitation(this.data.token);
    }).then(res => {
      if (res.data.status) {
        this.setData({
          cashAmount: Number(res.data.data.cash_amount).toFixed(2),
          deductionAmount: Number(res.data.data.cash_amount).toFixed(2),
          entryDeductionAmount: Number(res.data.data.cash_amount).toFixed(2)
        });
        this.deductionPrice();
        return;
      };

      return Promise.reject(res.data.msg);
    }).catch(err => {
      showErrorToast(err, '')
      console.error(err)
    });
  },
  /**
   * 监听-输入框变化
   */
  textareaChange(e){
    this.setData({ leaveWord: e.detail.value});
  },
  
  /**
   * 点击-提交订单 调起支付
   */

  submitOrder(){
    let ids = [];
    wx.showLoading({ title: '载入中...', mask: true });

    for (const key in this.data.goodsList) {
      this.data.goodsList[key].goods_list.forEach( goodsItem => {
        ids.push(
          `${goodsItem.goods_id}:${goodsItem.buy_num}`
        );
      });
    };
    
    shopApi.submitOrder(
      this.data.token, 
      ids, 
      this.data.addressDefault.address_id, 
      filterEmoji(this.data.leaveWord),
      this.data.deductionAmount
    ).then(res => {
      if (res.data.status){
        return shopApi.getWechatApp(res.data.data.pay_sn, this.data.openid);
      };

      return Promise.reject({errMsg: res.data.msg});
    }).then(res => {
      wx.hideLoading();

      if (res.data.status){
        return wxApi.requestPayment(res.data.data);
      };

      wx.showModal({
        title: '预支付失败',
        content: res.data.data.return_msg
      });
      
      return Promise.reject({ errMsg: res.data.data.return_msg });
    }).then(res => {

      if (res.errMsg === 'requestPayment:ok'){
        wx.redirectTo({
          url: `/pages/Order/Order?orderState=20`
        });
      };
    }).catch(err => {
      
      console.error(err);

      if (err.errMsg === "requestPayment:fail cancel"){
        wx.redirectTo({
          url: `/pages/Order/Order?orderState=10`
        });
        return;
      };
      showErrorToast(err.errMsg, '', 1500);
    });
  },
  /**
   * 点击-选择收货地址 
   */
  tapChoiceAddress(){
    wx.setStorageSync('pageSource', 'checkout');
    
    wx.navigateTo({
      url: '/pages/Addressmanagement/Addremanagement'
    });
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    wx.removeStorageSync('pageSource');
    wx.removeStorageSync('choiceAddress');
  },
  /**
   * 监听-我的钱包弹窗 打开或关闭
   */
  redPacketChange(e) {
    if (this.data.cashAmount <= 0)return;
    this.setData({
      isShowRedPacketPopup: e.currentTarget.dataset.state || e.detail.state
    });
  },
  /**
   * 监听-输入抵扣金额 input
   */
  deductionInputChange(e){
    this.setData({
      entryDeductionAmount: Number(e.detail.value)
    });
  },
  /**
   * 计算 得到抵扣金额-实付款金额
   */
  deductionPrice(){
    if (Number(this.data.entryDeductionAmount) !== 0){
      if (!validateMoney(this.data.entryDeductionAmount)) {
        showErrorToast('品兑：金额必须为保留两位小数点以内的正数！', '');
        return false;
      };
  
      if ((Number(this.data.entryDeductionAmount) * 100) > (Number(this.data.cashAmount) * 100)){
        showErrorToast('品兑：请输入少于您钱包金额', '');
        return false;
      };
    };

    let price = (this.countPrice(this.data.entryDeductionAmount, this.data.primaryPrice) / 100).toFixed(2);
    let deductionAmount = Number(this.data.entryDeductionAmount).toFixed(2);
    if (price <= 0){
      price = '0.01';
      deductionAmount = this.data.primaryPrice - 0.01;
    };

    this.setData({
      actualPrice: price,
      deductionAmount: Number(deductionAmount).toFixed(2),
      isShowRedPacketPopup: false
    });
  },
  /**
   * 计算价格
   * @param {Number} a 价格 A
   * @param {Number} b 价格 B
   */
  countPrice(a,b){
    return (Number(b) * 100) - (Number(a) * 100);
  }
})