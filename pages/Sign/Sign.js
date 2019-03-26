// pages/Sign/Sign.js
let interval = null //倒计时函数
const app = getApp();
const { isPoneAvailable, showSuccessToast, showErrorToast} = require('../../utils/util.js');
const { api, wxApi } = require('../../server/index.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        Name: '',
        Pass: '',
        Code: '',
        bg_bj: 'bth_tj',
        time: '获取验证码', //倒计时 
        currentTime: 61,
        phonePass: '',
        rePhonePass: '',
        unionid: '',
        apicode: '',
        login_type: '',
        isCorrectPhone: false,
        timeState: 'end'
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
        const that = this;
        //获取 unionid id
        const userInfo = wx.getStorageSync('userInfo');

        that.setData({
            unionid: userInfo.unionId,
            userInfo: userInfo
        });

        if (options.phoneNumber){
            that.getCode();
            that.setData({
                disabled: true,
                isCorrectPhone: false,
                Pass: options.phoneNumber
            });
        };

    },
    // 用户名
    userName(e) {
        this.setData({
            Name: e.detail.value,
        });
    },
    // 手机号码
    userPass(e) {
        
        if (this.data.timeState !== 'end'){
            this.setData({
                Pass: e.detail.value,
                isCorrectPhone: false
            });
            return;
        };

        this.setData({
            Pass: e.detail.value,
            isCorrectPhone: isPoneAvailable(e.detail.value)
        });
    },
    // 短信验证码
    userCode(e) {
        this.setData({
            Code: e.detail.value,
        });
    },
    // 密码
    userphonePass(e) {
        const phonePassvalue = e.detail.value;

        this.setData({
            phonePass: phonePassvalue,
        });

        // 判断 短信 有内容就提交光亮  没有内容就提交不光亮 
        if (this.data.phonePass !== '') {
            this.setData({
                bg_bj: 'bth_tj42'
            })
        } else {
            this.setData({
                bg_bj: 'bth_tj'
            })
        };

    },
    reUserphonePass(e){
        this.setData({
            rePhonePass: e.detail.value,
        });
    },
    /**
     * 验证码倒计时
     */
    getCode() {
        let currentTime = this.data.currentTime;

        interval = setInterval(() => {
            currentTime--;
            this.setData({
                time: `${currentTime}秒`,
                timeState: 'start'
            });

            if (currentTime <= 0) {
                clearInterval(interval)
                this.setData({
                    time: '重新发送',
                    currentTime: 61,
                    isCorrectPhone: true,
                    disabled: false,
                    timeState: 'end'
                })
            }
        }, 1200);

    },
    /**
     * 获取验证码 判断是否 注册 和未注册
     */
    getVerificationCode() {
        const that = this;
        const phonepas = that.data.Pass;

        if (!isPoneAvailable(phonepas)){
            showErrorToast('请填写正确的手机号码！');
            return;
        };

        api.sendSMS(phonepas).then( res => {

            if (res.data.msg === '该手机号码已被注册') {
                wx.showModal({
                    content: '尊敬的老用户,您已注册,但未绑定手机号',
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: `/pages/binding/binding?phoneNumber=${phone}`
                            })
                        }
                    }
                });
                return;
            };

            if (res.data.msg === '发送成功') {
                wx.showToast({
                    title: res.data.msg,
                })

                that.getCode();
                that.setData({
                    disabled: true,
                    isCorrectPhone: false
                });
                return;
            };

            wx.showToast({
                title: res.data.msg,
                icon: 'none'
            });
        }).catch( err => console.error(err));

    },
    /**
     * 获得授权信息
     */
    onGotUserInfo(e) {
        const that = this;

        if (e.detail.userInfo !== undefined){
            // 判断授权成功标识 
            wx.setStorageSync('atc', 1)

            // 授权成功 登录 
            that.submit();
        }else{
            // 判断授权失败标识 
            wx.setStorageSync('atc', 0)
                //授权失败 
            wx.showToast({
                title: '拒绝授权导致你无法登录',
            })

            // 授权失败 登录 
            setTimeout(function() {
                that.submit();
            }, 1500)
        }
    },

    /**
     * 提交注册
     */
    submit(e) {
        const that = this;

        // 手机号码验证
        if (!isPoneAvailable(that.data.Pass)) {
            showErrorToast('请输入手机号码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        };

        if (that.data.Code === '' || typeof parseInt(that.data.Code) !== 'number') {
            showErrorToast('请输入验证码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        }

        if (that.data.phonePass === '') {
            showErrorToast('请设置密码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        }
        
        if (that.data.phonePass !== that.data.rePhonePass){
            showErrorToast('密码不一致', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
            return false;
        }

        wx.showLoading({title: '加载中...', mask: true});
        api.registerMember(
            that.data.Code, 
            that.data.Pass, 
            that.data.phonePass, 
            that.data.unionid,
            wx.getStorageSync('meId'),
            this.data.userInfo.gender || 0,
            this.data.userInfo.nickName || '',
            this.data.userInfo.avatarUrl || ''
        ).then(res => {

            if (res.data.status === false){ 
              wx.showToast({
                title:res.data.msg,
                icon:'none'
              });
              return;
              wx.hideLoading();
            };

            that.Signin();
            
        }).catch(err => console.log(err));

    },
    // 注册成功自动登录到我界面
    Signin: function() {
        const that = this;

        api.memberLogin(that.data.unionid, {
            member_mobile: that.data.Pass,
            member_password: that.data.phonePass
        }).then( res => {
            let title = '成功';
            
            wx.setStorageSync('token', res.data.data.token);
            wx.setStorageSync('member_mobile', res.data.data.member_mobile);
            wx.removeStorageSync('meid');

            if (res.data.status ){
                title = '登录成功'
                wx.switchTab({
                    url: '/pages/my/my'
                });
            }else{
                title = res.data.msg;
            }
            
            wx.hideLoading();
            wx.showToast({
                title: title,
            });
        }).catch(err => console.error(err));
        
    },
    /**
     * 获取用户授权-手机号码
     */
    getPhoneNumber(e) {
        if (e.detail.errMsg === 'getPhoneNumber:ok'){
            const userInfo = this.data.userInfo;
            
            api.decryptWxDatar(userInfo.session_key, e.detail.iv, e.detail.encryptedData,wx.getStorageSync('meId')).then( res => {
                const data = res.data.data;
                if (data === -41003){
                    wx.showToast({
                        title: '提示：您的微信登录已过期，无法获取手机号码！',
                        icon: 'none'
                    });
                    return false;
                };
                
                wx.setStorageSync('phoneNumber', data.phoneNumber);
                if (this.data.timeState !== 'end') {
                    this.setData({ Pass: data.phoneNumber, isCorrectPhone: false});
                    return false;
                };
                this.setData({ Pass: data.phoneNumber, isCorrectPhone: true });
            }).catch(err => console.error(err));
        }
    },
    /**
     * 失去焦点验证手机号码 
     */
    focusInput(e) {
        if (e.detail.value === '')return;
        
        if (!isPoneAvailable(e.detail.value)) {
            showErrorToast('请填写正确的手机号码！');
            return;
        };
    }
})