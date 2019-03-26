const { api, wxApi, shopApi } = require('../../server/index.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    datalist:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;

    const type_num = options.type;
    const id = options.id;

    that.setData({
      type_num: type_num
    })

    shopApi.getcsah(type_num,id).then(res=>{
      console.log(res);
      if (res.data.status==true){ 
        console.log(res.data.data)
        that.setData({ 
          datalist: res.data.data
        })
      }
    }).catch(err=>{ 
        console.log(err)
    })
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