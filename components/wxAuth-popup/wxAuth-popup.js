// components/wxAuth-popup/wxAuth-popup.js
const { api, wxApi } = require('../../server/index.js');
const { showErrorToast } = require('../../utils/util.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    state: {
      type: 'boolean',
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLoading: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 授权登录，获取用户信息，然后解密得到 unionid
    */
    _authLoginGetUserInfo(e) {
      if (e && e.detail.userInfo !== undefined) {
        this.setData({ isLoading: true });
        let session_key = '';
        let errCode = 10040;
        // 1、 调用小程序登录
        wxApi.login().then(res => {
          console.log('拿到小程序 code'+res)
          console.dir(res);
          return api.getOpenId(res.code)
          // 2、拿到小程序 code 去，获取 session_key
        }).then(openidRes => {
          console.log('session_key'+openidRes)
          console.dir( openidRes)
          if (openidRes.statusCode !== 200 || openidRes.data.status == false){
            errCode = 10043;
            return Promise.reject(openidRes.data);
          };
          session_key = openidRes.data.data.session_key;
          return api.decryptWxDatar(session_key, e.detail.iv, e.detail.encryptedData, wx.getStorageSync('meId'));
        }).then(res => {
          console.dir(res);
          console.log('加密'+res)
          if (res.statusCode !== 200 || res.data.status == false){
            errCode = 10044;
            return Promise.reject(res.data);
          };
          if (res.data.status) {
            const resData = res.data.data;
            resData['session_key'] = session_key;
            this.setData({ isLoading: false });
            this.triggerEvent('onAuthSuccess', resData);
          };
        }).catch(err => {
          console.error(err);
          this.setData({ isLoading: false });

          wx.showModal({
            title: '授权失败',
            content: `${errCode} 微信服务器繁忙，请稍后重试！`,
            confirmText: '知道了',
            success: function (res) { }
          });

        });;

      };

    }
  }
})
