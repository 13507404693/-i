// pages/wxPhoneLogin/wxPhoneLogin.js
const { isPoneAvailable, showSuccessToast, showErrorToast } = require('../../utils/util.js');
const { api, wxApi } = require('../../server/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    isBindphonePopup: false,
    phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
  },

  /**
   * 获取用户授权-手机号码，进行登录绑定手机号码
   */
  bindPhoneNumberLogin (e) {
    
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      if (e.detail.errMsg !== 'getPhoneNumber:fail user deny'){
        this.setData({
          isBindphonePopup: true
        });
      };
      return console.error(e.detail.errMsg);
    };

    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ isLoading: true});

    // 将获取到的手机 解密
    api.decryptWxDatar(
      userInfo.session_key, 
      e.detail.iv, 
      e.detail.encryptedData, 
      wx.getStorageSync('meId'),
      userInfo.gender || 0,
      userInfo.nickName || '',
      userInfo.avatarUrl || ''
    ).then(res => {
      const data = res.data.data;
      if (data === -41003) {

        wx.showToast({
          title: '错误：微信登录失败，请重试！',
          icon: 'none'
        });
        return Promise.reject('登录失败，请重试！');
      };
      
      userInfo['phoneNumber'] = data.phoneNumber;

      wx.setStorageSync('userInfo', userInfo);

      // 将解密的手机 进行 绑定并登录
      return api.memberLogin(userInfo.unionId, {
        member_mobile: data.phoneNumber,
        member_password: 'e10adc3949ba59abbe56e057f20f883e'
      });

    }).then(res => {
      let title = '成功';
      let icon = 'success';

      if (res.data.status) {
        title = '认证成功';

        wx.setStorageSync('member_name', res.data.data.member_name);
        wx.setStorageSync('token', res.data.data.token);
        wx.removeStorageSync('meid');

        wx.switchTab({
          url: '/pages/my/my'
        });

      } else {
        icon = 'none';
        title = res.data.msg;
      };

      wx.showToast({
        title: title ||'',
        icon: icon
      });

      return Promise.reject(res.data.msg);
    }).catch(err => {
      console.error(err);
      this.setData({ isLoading: false });
    });

  },
  tapShowPopup(){
    this.setData({
      isBindphonePopup: !this.data.isBindphonePopup
    });
  },
  phoneInputChange(e){
    this.setData({
      phone: e.detail.value
    })
  },
  tapNext(){
    const phone = this.data.phone;

    if (!isPoneAvailable(phone)){
      showErrorToast('请输入正确的手机号码！');
      this.setData({ phone: ''});
      return;
    };

    api.sendSMS(phone).then(res => {

      // 手机已经注册
      if (!res.data.status){
        wx.navigateTo({
          url: `/pages/binding/binding?phoneNumber=${phone}`
        });
        return;
      };

      if (res.data.status){
        wx.navigateTo({
          url: `/pages/Sign/Sign?phoneNumber=${phone}`
        });
        return;
      };

      showErrorToast(res.data.msg);
    });
  }
})