const { api, wxApi, shopApi } = require('../../server/index.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderid: '',
    buzhouData:'',
    orderState:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    that.setData({ 
      orderid: options.orderid,
      orderState: options.order_state
    })

    // 退款進度數據初始化
    that.ApplicationProgress();
  },
  /**退货进度 */
  ApplicationProgress: function(){
    const that=this;
    const token=wx.getStorageSync('token');
    const orderid =that.data.orderid;

    shopApi.ApplicationProgress(token, orderid).then(res =>{
    let guesslike = res.data.data.guesslike;

    for (let i = 0; i <guesslike.length;i++){ 
      res.data.data.guesslike[i].zong_price= res.data.data.guesslike[i].goods_price + res.data.data.guesslike[i].goods_points; 
    }  

      that.setData({  
        buzhouData:res.data.data.buzhou,
        guesslikeData:res.data.data.guesslike,
      })

    }).catch(err => {
      console.log(err)
    })

  }, 
  // 点击进入购物车
  show_true:function(e){
      const that=this;
      const goodsId = e.currentTarget.dataset.goodsid;
      wx.navigateTo({
        url: `/pages/Commoditydetails/Commoditydetails?goodsId=${goodsId}&isShowSpec=${true}`,
      })
  },
//点击跳转对应商品
  go_gwc:function(e){
    const that=this;
    const goodsId = e.currentTarget.dataset.goodsid;

    wx.navigateTo({
      url: `/pages/Commoditydetails/Commoditydetails?goodsId=${goodsId}`,
    })
   
  }
})