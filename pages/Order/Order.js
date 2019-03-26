// pages/Order/Order.js
const { shopApi, wxApi } = require('../../server/index');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: '',
    orderSates: [
      {
        state: '10',
        name: '待付款'
      },
      {
        state: '20',
        name: '待发货'
      },
      {
        state: '30',
        name: '待收货'
      },
      {
        state: '40',
        name: '待评价'
      }
    ],
    stateIndex: 0,
    loadingState: false,
    orderList: [],
    orderState: '',
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderState: parseInt(options.orderState) || ''
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
    this.setData({
      token: wx.getStorageSync('token'),
      page: 1
    });

    this.getOrder(false);
  },
  /**
   * 点击获取订单
   */
  tapGetOrder(e){
    this.setData({
      stateIndex: e.currentTarget.dataset.index,
      orderState: e.currentTarget.dataset.orderstate,
      orderList: [],
      page: 1
    });

    this.getOrder();
  },
  /**
   * 获取订单
   */
  getOrder(isRefresh){
    if (isRefresh){
      this.setData({loadingState: true});
    }else{
      this.setData({orderList: [], loadingState: true});
    }
    
    let state = {};
    if (this.data.orderState !== ''){
      state = { state: this.data.orderState};
    };
    
    shopApi.getOrderList(this.data.token, this.data.page, this.data.pageSize, state).then(res => {
      this.setData({ loadingState: false });
      
      if (!res.data.status){
        return false;  
      };
      
      this.setData({
        orderList: this.data.orderList.concat(res.data.data.list)
      });

    }).catch(err => console.error(err));
  },
  /**
   * 点击-删除订单
   */
  tapDeleteOrder(e){
    
    this.showModal('确认删除订单？', '删除之后不能恢复').then(res => {
      
      if (res.confirm) {

        this.setData({ loadingState: true });
        return shopApi.deleteOrderByOrderId(this.data.token, e.currentTarget.dataset.orderid);
      };

      return Promise.reject(res.confirm);
    }).then(res => {
      if (res.data.status) {
        showSuccessToast('订单删除成功');
        this.getOrder();

        this.data.orderList.splice(e.currentTarget.dataset.index, 1);

        this.setData({ orderList: this.data.orderList });
        return;
      };

      this.setData({ loadingState: false });
      showErrorToast(res.data.msg,'');
    }).catch(err => console.error(err));
   
  },
  /**
   * 点击再次购物-将订单的商品添加到购物车
   */
  tapAddCart(e){
    const dataset = e.currentTarget.dataset;
    if (this.data.orderList[dataset.orderindex].order_id !== dataset.orderid){
      console.error('orderid 不对应！');
      return false;
    };

    const goodsList = this.data.orderList[dataset.orderindex].goodsList;
    let cartGoods = [];
    let ids = [];
    let resultArr = [];

    goodsList.forEach(item => {
      ids.push(item.goods_id);

      cartGoods.push({
        id: item.goods_id,
        num: item.goods_num
      });
    });

    for (let index = 0; index < cartGoods.length; index++) {
      const item = cartGoods[index];

      resultArr.push(shopApi.goodcard(
        this.data.token,
        item.id,
        item.num
      ));
    }

    this.setData({ loadingState: true});

    Promise.all(resultArr).then(res => {

      if (res.length === cartGoods.length){
        wx.setStorageSync('checkGoodsIds', ids);

        wx.navigateTo({
          url: '/pages/Cart/Cart'
        });
      }
    }).catch(err => console.error(err));
  },
  /**
   * 点击-取消订单
   */
  tapCancelOrder(e){

    this.showModal('取消订单？', '是否确认取消订单').then(res => {
      if (res.confirm) {

        this.setData({ loadingState: true });
        return shopApi.cancelOrderByOrderId(this.data.token, e.currentTarget.dataset.orderid);
      };

      return Promise.reject(res.confirm);
    }).then(res => {
      if (res.data.status) {
        showSuccessToast('订单取消成功');
        this.getOrder();

        this.setData({ page: 1, orderList: [] });
        return;
      };

      this.setData({ loadingState: false });
      showErrorToast(res.data.msg,'');
    }).catch(err => console.error(err));
  },
  /**
   * 点击-确认收货
   */
  tapConfirmOrder(e){

    this.showModal('确认收货？', '是否确认收货').then(res => {
      if (res.confirm) {
        this.setData({ loadingState: true });
        return shopApi.confirmOrderByOrderId(this.data.token, e.currentTarget.dataset.orderid);
      };

      return Promise.reject(res.confirm);
    }).then(res => {
      
      if (res.data.status) {
        showSuccessToast('确认收货成功');
        this.getOrder();

        this.setData({ page: 1, orderList: [] });
        
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
   * 点击-查看物流
   */
  tapLogistics(e){
    const dataset = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: `/pages/Logistics/Logistics?code=${dataset.shippingcode}&goodsImg=${dataset.goodsimg}&expressName=${dataset.expressname}`
    });

  },
  /**
   * 点击-评论
   */
  tapComment(e){
    const dataset = e.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/orderComment/orderComment?orderId=${dataset.orderid}&goodsImg=${dataset.goodsimg}`
    });
  },
  /**
   * 点击-调起支付
   */
  tapPay(e){
    wx.showLoading({ title: '载入中...', mask: true });

    this.getOrderPayInfo({
      token: this.data.token,
      paysn: e.currentTarget.dataset.paysn,
      openId: wx.getStorageSync('userInfo').openId,
      orderid: e.currentTarget.dataset.orderid,
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
       this.setData({
        orderState: 20,
        page: 1,
        orderList: []
       });

       this.getOrder();
      };
    }).catch(err => {
      console.error(err);

      if (err.errMsg === "requestPayment:fail cancel"){
        this.setData({
          orderState: 10,
          page: 1
        });
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: ++this.data.page,
      loadingState: true
    })
    this.getOrder(true);
  }
})