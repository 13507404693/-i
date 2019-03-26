// pages/my/my.js
const app = getApp();
const { api, wxApi } = require('../../server/index.js');
const { idSplit } = require('../../utils/util.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        avatarUrl: '',
        nickName: '',
        member_mobile: '绑定手机号码',
        member_sm: '(绑定手机获取更多优惠)',
        points: '0',
        member_id: '',
        isOpenAuthLoginGetUserInfo: false,
        orderSates: [
            {
                state: '10',
                name: '待付款',
                icon: 'https://sp.lion-mall.com/miniprogram/images/icon-order-state1.png',
                order_nums: 0
            },
            {
                state: '20',
                name: '待发货',
                icon: 'https://sp.lion-mall.com/miniprogram/images/icon-order-state2.png',
                order_nums: 0
            },
            {
                state: '30',
                name: '待收货',
                icon: 'https://sp.lion-mall.com/miniprogram/images/icon-order-state3.png',
                order_nums: 0
            },
            {
                state: '40',
                name: '待评价',
                icon: 'https://sp.lion-mall.com/miniprogram/images/icon-order-state4.png',
                order_nums: 0
            },
            {
                state: '100',
                name: '退换/售后',
                icon: 'https://sp.lion-mall.com/miniprogram/images/icon-order-state5.png',
                order_nums: 0
            }
        ],
      isLogin: true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onShow(){
        
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');

        if (typeof token === 'string' && token.length > 1 && typeof userInfo === 'object') {
            this.setData({
                member_sm: '',
                userInfo: userInfo,
                isLogin: false
            });
            api.getMemberInfo(token).then( memberInfo => {
                if (memberInfo.statusCode !== 200){
                    wx.removeStorageSync('token');
                    this.setData({ member_mobile: '绑定手机号码', member_sm: '(绑定手机获取更多优惠)'});
                    return Promise.reject(memberInfo.statusCode);
                };

                this.updatedOrderNums(memberInfo.data.data.order_nums);
                this.setData({
                    points: memberInfo.data.data.points,
                    member_sm: '',
                    member_mobile: memberInfo.data.data.member_mobile,
                    member_id: memberInfo.data.data.member_id,
                    cash_amount: memberInfo.data.data.cash_amount
                });
                wx.setStorageSync('member_id', memberInfo.data.data.member_id);
            }).catch(err => console.error(err));
        } else {
            
            if (typeof userInfo !== 'object'){
                this.getAuthUserInfo();
            }else{

                api.getTempMemberInfo(userInfo.unionId).then(res => {
                    if (!res.data.status){
                        return Promise.reject(res.data.msg);
                    };

                    return api.getMemberInfo(res.data.data.token);
                }).then(memberInfo => {
                    if (memberInfo.statusCode !== 200 || memberInfo.data.status === false) {
                        return Promise.reject(memberInfo.statusCode);
                    };
                    
                    this.setData({
                        points: memberInfo.data.data.points,
                        member_id: memberInfo.data.data.member_id,
                        cash_amount: memberInfo.data.data.cash_amount,
                        isLogin: false
                    });
                    wx.setStorageSync('member_id', memberInfo.data.data.member_id);
                }).catch(err => console.error(err));

                this.setData({
                    userInfo: userInfo
                });

                if (userInfo.bangding === false){
                    console.error('未绑定手机号码！');

                    if (wx.getStorageSync('cancelBangding')){
                        wx.navigateTo({
                            url: '/pages/wxPhoneLogin/wxPhoneLogin',
                        });
                        wx.setStorageSync('cancelBangding', false);
                    };

                };
            };
        };
    },
    /**
     * 获取用户授权
     */
    getAuthUserInfo() {
        let session_key = ''; 
        
        wxApi.getSetting().then(settingRes => {
            // 如果已经授权就 获取用户信息
            if (settingRes.authSetting['scope.userInfo'] === true) {
                // 1、 调用小程序登录
                wx.showLoading({title: '加载中', mask: true});
                return wxApi.login();
            };

           return Promise.reject('未授权！');

        }).then(res => {
           
            // 2、拿到小程序 code 去，获取 session_key
            return api.getOpenId(res.code)
        }).then(openidRes => {
            if (openidRes.statusCode !== 200) return Promise.reject(openidRes.data);
            
            session_key = openidRes.data.data.session_key;
            // 获取 加密用户数据
            return wxApi.getUserInfo();

        }).then(info => {
            // 调用 解密数据接口
            return api.decryptWxDatar(
              session_key, 
              info.iv, 
              info.encryptedData,
              wx.getStorageSync('meId')
            );

            console.log(info);

        }).then(res => {
            if (res.data.status) {
                const resData = res.data.data;
                resData['session_key'] = session_key;
                
                this.setData({ 
                    userInfo: resData,
                    isLogin: false
                });

                wx.setStorageSync('unionid', resData.unionId);
                wx.setStorageSync('openid', resData.openId);
                wx.setStorageSync('userInfo', resData);

                this.memberAuth();
                return false;
            };

            return Promise.reject('解密失败，'+res.data.msg);
        }).catch(err => {
            console.error(err);
            wx.hideLoading();
            this.setData({
                isOpenAuthLoginGetUserInfo: true
            });
        });
    },
    /**
    * 监听授权成功
    */
    onAuthLoginGetUserInfo(res) {
        this.setData({
            userInfo: res.detail,
            isOpenAuthLoginGetUserInfo: false
        });

        wx.setStorageSync('userInfo', res.detail);
        wx.setStorageSync('unionid', res.detail.unionId);
        wx.setStorageSync('openid', res.detail.openId);
        this.memberAuth();
    },
    /**
     * 会员登录流程
     */
    memberAuth() {
        const userInfo = this.data.userInfo;

        // 判断用户 是否 绑定了手机号码
        if (userInfo.bangding || wx.getStorageSync('userInfo').bangding ) {
            
            // 3、会员登录 
            api.memberLogin(userInfo.unionId).then(loginRes => {
                const { data } = loginRes;

                if (!data.status) {
                    return Promise.reject(data.msg);
                };

                // 登录成功
                if (data.data.token) {
                    
                    wx.setStorageSync('token', data.data.token);

                    wx.hideLoading();
                    wx.showToast({
                        title: data.msg,
                    });

                    let nickName = data.data.member_name;
                    let avatarUrl = `https://img.lion-mall.com/${data.data.member_avatar}`;

                    this.setData({
                        member_mobile: data.data.member_mobile,
                        nickName: nickName,
                        avatarUrl: avatarUrl,
                        isLogin: false
                    });

                    return api.getMemberInfo(data.data.token);

                } else {

                    wx.showToast({
                        title: '用户信息缺失，登陆失败',
                    })
                };

                // 4、获取会员信息
            }).then(memberInfo => {

                this.setData({
                    points: memberInfo.data.data.points,
                    member_id: memberInfo.data.data.member_id,
                    cash_amount: memberInfo.data.data.cash_amount,
                    member_sm: ''
                });

                this.updatedOrderNums(memberInfo.data.data.order_nums);

                wx.setStorageSync('member_id', memberInfo.data.data.member_id);
                wx.setStorageSync('member_email', memberInfo.data.data.member_email);
                wx.setStorageSync('member_avatar', memberInfo.data.data.member_avatar);

            }).catch(err => {
                wx.hideLoading();

                this.setData({
                    isOpenAuthLoginGetUserInfo: true
                });
                console.error(err);
            });
            return false;
        };

        // 用户 未绑定 手机号码
        wx.hideLoading();
        
        if (wx.getStorageSync('cancelBangding') === false) return console.error("未绑定手机号码！");

        wx.navigateTo({
            url: '/pages/wxPhoneLogin/wxPhoneLogin',
        });

        wx.setStorageSync('cancelBangding', false);

    },

    /**
     * 去注册
     */
    register() {
        if (!wx.getStorageSync('token')) {
            wx.navigateTo({
                url: '/pages/wxPhoneLogin/wxPhoneLogin',
            });
        }

    },
    /**
     * 唤起扫码支付
     */
    saoma() {
        wxApi.scanCode().then(res => {
            
            let str = res.result.replace(/(https|http):\/\//, '');
            str = str.substring(0, str.indexOf('?'));

            if (str !== 'm2.lion-mall.com/yfpay/yfpayurl' && str !== 'm2.lion-mall.com/fypay/fypayurl') {
                wx.showToast({
                    title: '提示：请扫品兑的二维码！',
                    icon: 'none',
                    duration: 2000
                });
                return false;
            };

            wx.navigateTo({
                url: `/pages/payment/payment?q=${encodeURIComponent(res.result)}`,
            })
        }).catch(err => console.error(err));
    },
    /**
     * 跳转页面
     */
    navigateTo(e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url,
        });
    },
    /**
     * 点击-跳转到我的订单
     */
    tapToOrder(e){
        if (e.currentTarget.dataset.orderstate == 100){
            wx.navigateTo({
                url: `/pages/RefundRefunds/RefundRefunds`
            });
        }else{
            wx.navigateTo({
                url: `/pages/Order/Order?orderState=${e.currentTarget.dataset.orderstate}`
            });
        }
    },
    /**
     * 更新-订单数量 
     * @param {Array} orderNums 
     */
    updatedOrderNums(orderNums) {
        let orderSates = [...this.data.orderSates];

      console.log(orderSates);
        
        for (let index = 0; index < orderSates.length; index++) {
            const item = orderSates[index];
            for (const key in orderNums) {
                if (parseInt(key) === parseInt(item.state)) {
                    item.order_nums = orderNums[key];
               };
            }
        };

        this.setData({
            orderSates: orderSates
        });
    },
    clickNoLogin(){
        wx.navigateTo({
            url: '/pages/wxPhoneLogin/wxPhoneLogin',
        })
    }
})