// pages/ImDialog/ImDialog.js
const app = getApp();

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
    this.setData({
      url: `${options.url}?json=${options.param}`
    });
    app.globaData.isRefreshDiscovery = true;
  }
})