// pages/binding/binding.js
const { isPoneAvailable, showSuccessToast, showErrorToast } = require('../../utils/util.js');
const { api, wxApi } = require('../../server/index.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        Pass: '',
        unionid: '',
        login_type: 1,
        apicode: '0'
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
        const unionid = wx.getStorageSync('userInfo').unionId;

        this.setData({
            unionid:unionid,
            phone: options.phoneNumber
        })

    },
    //手机号
    userphone(e) {
        const evalue = e.detail.value;

        this.setData({
            phone: evalue,
        });
    },
    //密码
    userPass: function(e) {

        const passvalue = e.detail.value;

        this.setData({
            Pass: passvalue,
        });

    },
    // 提交
    bth_click: function(e) {

        // 手机号码验证
        if (!isPoneAvailable(this.data.phone)){
            showErrorToast('请输入手机号码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        };

        if (this.data.Pass === '') {
            showErrorToast('请输入密码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        }


      if (this.data.unionid === '') {
        showErrorToast('该账号登录异常，请联系品兑。', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
        return false;
      }

      wx.showLoading({
        title: '绑定登录中...',
        mask:true
      })

        api.memberLogin(this.data.unionid, {
            member_mobile: this.data.phone,
            member_password: this.data.Pass
        }).then(res => {

          console.log('123');

            let title = '成功';
            let icon = 'success';
 
            if (res.data.status) {

                title = '登录成功';   

                wx.setStorageSync('member_name', res.data.data.member_name);
                wx.setStorageSync('token', res.data.data.token);
                wx.setStorageSync('member_mobile', res.data.data.member_mobile);
                
                wx.hideLoading();
               
                wx.reLaunch({
                    url: '/pages/my/my'
                });

            }else{
                icon = 'none';
                title = res.data.msg;
            }
            wx.showToast({
                title: title,
                icon: icon
            });
        }).catch(err => {
          wx.showToast({
            title: '网络异常',
            icon: 'none'
          });

          });
    }
})