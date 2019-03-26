const QQMapWX = require('../libs/qqmap-wx-jssdk.min');

class WXAPI {
    constructor() {
        this.qqmapsdk = new QQMapWX({
            key: '2ACBZ-LDA6O-MFKWZ-S42WA-6LMF2-3TBGL'
        });
    }
    /**
     * 获取用户当前的授权状态。
     * 说明：如果授权成功则调用 resolve() 授权失败则 reject()
     */
    getSetting(){
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: resolve,
                fail: reject
            });
        });
    }
    /**
     * 获取当前用户信息
     * 1. 当用户未授权过，调用该接口将直接报错进入 fail() 
     * 2. 当用户授权过，可以使用该接口获取用户信息进入 success()
     */
    getUserInfo(){
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: resolve,
                fail: reject,
            });
        });
    }
    /**
     * 小程序登录
     * @return {String} 返回 code
     * 说明：
            小程序调用wx.login() 获取 临时登录凭证code ，并回传到开发者服务器。

            开发者服务器以code换取 用户唯一标识openid 和 会话密钥session_key。
     */
    login(){
        return new Promise((resolve, reject) => {
            wx.login({
                success: resolve,
                fail: reject,
            });
        });
    }
    /**
     * 微信扫码
     */
    scanCode(){
        return new Promise( (resolve, reject) => {
            wx.scanCode({
                success: resolve,
                fail: reject
            });
        });
    }
    /**
     * 从本地相册选择图片或使用相机拍照。
     * @param {object} opi 具体参数请打开： https://developers.weixin.qq.com/miniprogram/dev/api/media-picture.html#wxchooseimageobject
     */
    chooseImage(opi){
        return new Promise((resolve, reject) => {
            wx.chooseImage(Object.assign( opi || {}, {
                success: resolve,
                fail: reject
            }));
        })
    }
    /**
     * 获取授权位置
     * @param {String} type 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
     */
    getLocation(type){
        return new Promise((resolve, reject) => {
            wx.getLocation({
                type: type||'wgs84',
                success: resolve,
                fail: reject
            });
        })
    }
    /**
     * 根据 经纬度 获取详细位置
     * @param {Number} lat 经度
     * @param {Number} lon 纬度
     */
    getReverseGeocoder(lat, lon) {
        return new Promise((resolve, reject) => {
            this.qqmapsdk.reverseGeocoder({
                location: {
                    latitude: lat,
                    longitude: lon
                },
                success: resolve,
                fail: reject,
            });
        });
    }
    /**
     * 根据 地址描述 转换 经纬度，（注：返回的经纬度是 地区的中心点 经纬度）
     * @param {String} area 地址 ，如：'北京市海淀区彩和坊路海淀西大街74号'
     */
    getGeocoder(area){
        return new Promise((resolve, reject) => {
            this.qqmapsdk.geocoder({
                address: area,
                success: resolve,
                fail: reject,
            });
        });
    }

    //上传的图片转 base64 
    imgShiftBase64(imgpath){
    return new Promise((resolve, reject)=>{ 
        wx.request({
            url:imgpath,
            header: {
            'content-type': 'application/x-www-form-urlencoded'
            },
            responseType: 'arraybuffer',
            method:'GET',
            success(res){
            const base64 = wx.arrayBufferToBase64(res.data);
            const userImageBase64 = 'data:image/jpg;base64,' + base64;
            resolve(userImageBase64);
            },
            fail: reject

        })
    })
    }
    /**
     * 拨打的电话号码
    * @param {Number} number 手机号码
    */
    makePhoneCall(number){
        return new Promise((resolve, reject) => {
            wx.makePhoneCall({
                phoneNumber: number,
                success: resolve,
                fail: reject
            });
        })
    }
     /**
     * 调起微信支付
     * @param {Object} obj 参数文档：https://developers.weixin.qq.com/miniprogram/dev/api/api-pay.html?search-key=requestPayment
     */
    requestPayment(obj) {
        return new Promise((reslove, reject) => {
        wx.requestPayment({
            timeStamp: obj.sdk_timestamp,
            nonceStr: obj.sdk_noncestr,
            package: obj.sdk_package,
            signType: obj.sdk_signtype,
            paySign: obj.sdk_paysign,
            success: reslove,
            fail: reject
        })
        })
    }
}

module.exports = WXAPI;