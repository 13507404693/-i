// pages/WebView/WebView.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.title){ 
      wx.setNavigationBarTitle({
        title: options.title//页面标题为路由参数
      }) 
    }else{ 
      wx.setNavigationBarTitle({
        title:'梁家河首页'//页面标题为路由参数
      })
    }

    this.setData({ url:`${options.url}?referrerInfo=${options.referrerInfo||1001}`})

  }
})