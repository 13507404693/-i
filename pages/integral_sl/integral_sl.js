// pages/integral.js
const { api, wxApi } = require('../../server/index.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        symbol: 1,
        integrData: {},
        page: 1,
        listData: [],
        isdata: 0,
        member_id: '',
        url:'https://sp.lion-mall.com/wx_dist/Integralrule.html',
        title:"积分说明"
    },
    jfgz: function() {
        wx.navigateTo({
            url: '/pages/Integralrule/Integralrule',
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        var member_id = options.member_id;
       console.log(member_id)

        that.setData({
            member_id: member_id
        })
        this.getData();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        var _this = this;
        this.setData({ 'page': 1 });

        this.getData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        var num = ++this.data.page;
        var _this = this;
        this.setData({ 'page': num });
      console.log(num)

        this.getIntegral(num).then(function(result) {
            if (result.status) {
                if (!result.data.detail.list.length) {
                    wx.showToast({
                        title: "没有啦！",
                        icon: 'none'
                    });
                    return;
                };

                _this.setData({
                    'integrData': result.data,
                    'listData': _this.data.listData.concat(result.data.detail.list)
                });
            }
        }).catch(function(err) {
            console.error(err);
        });
    },
    /**
     * 获取数据
     */
    getData() {
        var _this = this;
        this.getIntegral().then(function(result) {
            wx.stopPullDownRefresh();
            if (result.status) {
                _this.setData({
                    'integrData': result.data,
                    'listData': result.data.detail.list
                });
            }
        }).catch(function(err) {
            console.error(err);
        });
    },
    /**
     * 获取积分
     * @param {Number} page 当前页码数 
     * @param {Number} pageSize 返回内容数量
     */
    getIntegral(page, pageSize) {
        var _this = this;
        wx.showLoading({
            title: "加载中..."
        });

        console.log()

        return new Promise(function(reslove, reject) {
            wx.request({
                url: api.defaultPDApi,
                data: {
                    r: "excitation/getpoint1",
                    pageSize: pageSize || 10,
                    page: _this.data.page || 1,
                    member_id: _this.data.member_id,
                    type: 1,
                    symbol: _this.data.symbol,
                },
                dataType: 'json',
                success(res) {
                    wx.hideLoading();
                    reslove(res.data);
                },
                fail(err) {
                    reject(err);
                }
            });

        });
    }
})