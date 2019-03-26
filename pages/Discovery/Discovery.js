// pages/Discovery/Discovery.js
const { wxApi } = require('../../server/index');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    isOpen: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    
    if (wx.getStorageSync('token') === ''){
      wx.showModal({
        title: '提示：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success:(res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return;
    };

    const userInfo = wx.getStorageSync('userInfo');
    let location = wx.getStorageSync('location');
    
    if(location == ''||typeof location != 'object'){
      wx.showNavigationBarLoading();
      this.getLocation().then( res => {
        location = wx.getStorageSync('location');

        this.setData({
          url: `https://sp.lion-mall.com/wap6.0/webim/discovery/follow?user=${userInfo.member_mobile}&avatarUrl=${userInfo.avatarUrl}&nickName=${userInfo.nickName}&lat=${location.latitude}&lng=${location.longitude}`
        });
        wx.hideNavigationBarLoading();
      });
      return;
    };
    
    if(this.data.url === ''){
      wx.showNavigationBarLoading();
      location = wx.getStorageSync('location');
      this.setData({
        url: `https://sp.lion-mall.com/wap6.0/webim/discovery/follow?user=${userInfo.member_mobile}&avatarUrl=${userInfo.avatarUrl}&nickName=${userInfo.nickName}&lat=${location.latitude}&lng=${location.longitude}`
      });
      wx.hideNavigationBarLoading();
    };

    if(app.globaData.isRefreshDiscovery){
      this.setData({isOpen: false});
      setTimeout(() => {
        this.setData({isOpen: true});
        app.globaData.isRefreshDiscovery = false;
      },100);
    };
  },
  urlJsonEncode(json){
    return encodeURIComponent(JSON.stringify(json));
  },
  /**
   * 获取定位
   */
  getLocation(){
    return new Promise((resolve, reject) => {

        wxApi.getLocation().then(res => {

            return wxApi.getReverseGeocoder(res.latitude, res.longitude);
        }).then(res => {

            if (res.message === "query ok") {
                const location = {
                    city: res.result.ad_info.city,
                    district: res.result.ad_info.district,
                    latitude: res.result.location.lat,
                    longitude: res.result.location.lng,
                    name: res.result.ad_info.name,
                    province: res.result.ad_info.province,
                    address: res.result.address
                };

                this.setData({
                    location: location
                });
                wx.setStorageSync('location', location);

                resolve(res);
            };
        }).catch(reject);

    });
  },
  onMessage(res){
    console.log(res)
  }
})