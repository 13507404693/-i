// pages/Tradingarea/Tradingarea.js
const { api, wxApi } = require('../../server/index');
const { showSuccessToast } = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        location: {}, // 用户位置信息
        page: 1,
        pageSize: 5,
        businessList: [], // 商家列表
        businessListLoadingState: true, // 商家列表 底部 loading
        isShowbottomMsg: false, //  商家列表 底部提示内容 状态
        bottomMsg: '正在全力拓展优惠商户，敬请期待！', // 商家列表 底部提示内容
        slider: [],
        classif: [],
        isShowLocationBtn: false,
        isNewRegister: true
    },

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showNavigationBarLoading();

        // 将分享页面带有的 member_id 保存
        if (options.member_id !== undefined && options.member_id !== '') {
            wx.setStorageSync('meId', options.member_id);
        };
        
        // 获取定位，然后根据定位获取商家
        this.getLocation().then( () => {
            this.getBusiness(true);
        }).catch( err => {

            this.setData({
                businessListLoadingState: false,
                isShowbottomMsg: true
            });
            wx.hideNavigationBarLoading();
        });
        
        const requestAll = Promise.all([
            api.getCircleClassif(),
            api.getCircleSlide(),
        ]);

        requestAll.then(res => {
            
            this.setData({
                classif: res[0].data.data,
                slider: res[1].data.data
            });
        });

    },
    /**
     * 点击 获取定位 如果没有授权，打开设置
     */
    openSettingCallback(e){
        if ( e.detail.authSetting["scope.userLocation"]) {
            // 获取定位，然后根据定位获取商家
            this.getLocation().then(() => {
                this.getBusiness(true);
            }).catch(err => {

                this.setData({
                    businessListLoadingState: false,
                    isShowbottomMsg: true
                });
                wx.hideNavigationBarLoading();
            });
        };
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
    /**
     * 获取商家
     * @param {String} type 
     */
    getBusiness(isRefresh){
        this.setData({
            businessListLoadingState: true,
            isShowbottomMsg: false,
        });

        return new Promise((resolve, reject) => {

            const data = this.data;
            api.getAreaBusiness(
                `${data.location.longitude},${data.location.latitude}`,
                data.page,
                data.pageSize,
                data.location.district
            ).then(res => {
                
                if (res.data.status) {
                    let list = [];
                    
                    if (isRefresh) {
                        list = res.data.data.storeList;
                    } else {
                        list = this.data.businessList.concat(res.data.data.storeList);
                    };

                    this.setData({
                        businessList: list,
                        businessListLoadingState: false
                    });
                    wx.hideNavigationBarLoading();
                    resolve(res);
                }else{
                    this.setData({
                        isShowbottomMsg: true,
                        businessListLoadingState: false
                    });
                }
            }).catch(reject);
        });
        
    },
    showLoading(){
        wx.showNavigationBarLoading();
        wx.showLoading({ title: '加载中..' });
    },
    hideLoading(){
        wx.hideNavigationBarLoading();
        wx.hideLoading();
    },
     /**
     * input 测试 获取焦点 进入搜索内页
     */
    bindfous_sp:function(){ 
      var that=this;
      wx.navigateTo({
        url: '/pages/search/search',
      })

    },
    /**
     * 扫码 进入支付 页面
     */
    getuserinfo(e){
        if (e && e.detail.userInfo !== undefined) {
            wx.showLoading({ title: '载入中..' });

            wxApi.scanCode().then( res => {
                wx.hideLoading(); 
                
                if (res.errMsg === "scanCode:ok"){
                    let str = res.result.replace(/(https|http):\/\//, '');
                    str = str.substring(0, str.indexOf('?'));

                    if (str !== 'm2.lion-mall.com/yfpay/yfpayurl' && str !== 'm2.lion-mall.com/fypay/fypayurl'){
                        wx.showToast({
                            title:'提示：请扫品兑的二维码！',
                            icon: 'none',
                            duration: 2000
                        });
                        return false;
                    };

                    wx.navigateTo({
                        url: `/pages/payment/payment?q=${encodeURIComponent(res.result)}`,
                    });
                };
            }).catch( err => {
                wx.hideLoading(); 
                console.error(err)
            });
        };
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.setData({
            businessListLoadingState: true,
            page: ++this.data.page
        });

        this.getBusiness(false);
    },
    /**
     * 页面用户下拉刷新事件
     */
    onPullDownRefresh() {
        this.setData({
            businessListLoadingState: true,
            page: 1,
            businessList: []
        });

        this.getBusiness(true).then(res => {
            wx.stopPullDownRefresh();
        });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        return {
            title: '用品兑，享优惠',
            path: `pages/index/index?member_id=${wx.getStorageSync('member_id')}`,
            imageUrl: 'https://sp.lion-mall.com/miniprogram/images/goods_banner.png'
        }
    },
    /**
     * 
     * 改变区域 触发
     */
    regionChange(e){
        this.setData({
            page: 1
        });
        
        wxApi.getGeocoder(e.detail.value.join('')).then( res => {
            if (res.message === "query ok"){

                const location = {
                    city: res.result.address_components.city,
                    district: res.result.address_components.district,
                    latitude: res.result.location.lat,
                    longitude: res.result.location.lng,
                    name: res.result.title,
                    province: res.result.address_components.province,
                    address: res.result.title
                };
    
                this.setData({
                    location: location,
                    businessList: [],
                    isShowLocationBtn: true
                });
                wx.setStorageSync('location', location);

                this.getBusiness(true);
            };
            
        }).catch(err => console.error(err));
    },
    /**
     * 点击-定位到当前位置
     */
    tapGetCurrentLocation(){
        this.setData({
            page: 1
        });

        // 获取定位，然后根据定位获取商家
        this.getLocation().then(() => {
            this.getBusiness(true);

            this.setData({
                isShowLocationBtn: false
            });
        }).catch(err => {

            this.setData({
                businessListLoadingState: false,
                isShowbottomMsg: true
            });
            wx.hideNavigationBarLoading();
        });
    },
    /**
   * 监听-点击 tab 时触发
   */
    onTabItemTap(e) {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 400
        });
    },
    tapCloseNewRegister(){
        this.setData({ isNewRegister: false});
    }
})