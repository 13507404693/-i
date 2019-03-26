// pages/DetailsBill/DetailsBill.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    

      const that=this;
      that.setData({ 
        store_name: options.store_name,
        order_amount: options.order_amount,
        order_momer: options.order_amount,
        order_pointscount: options.voucher_price,
        payment: options.order_come,
        consumptiontype: options.order_come,
        orderReward: options.order_amount,
        create_time: options.create_time,
        order_id: options.order_id
      })

    // console.log( '店铺名字 store_name'+ options.store_name)
    // console.log('价格金额 order_amount' + options.order_amount)
    // console.log('订单金额 order_momer' + options.order_amount)
    // console.log('积分优惠 order_pointscount' + options.order_pointscount)
    // console.log('付款方式 payment' + options.order_come)
    // console.log('消费类型 consumptiontype' + options.order_come)
    // console.log('积分奖励 orderReward' + options.order_amount)
    // console.log('创建时间 create_time' + options.create_time)
    // console.log('订单号 order_id'   + options.order_id)

  
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
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})