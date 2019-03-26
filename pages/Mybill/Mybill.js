const { api, wxApi } = require('../../server/index.js');

Page({
    data: {
        moneys: 0,
        nums: 0,
        list: [],
        member_id: '',
        page: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      
        this.setData({
          member_id: options.member_id.replace(/\s+/g, ''),
          page: 0
        });

        this.getData();
    },
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.setData({
            page: 0,
            list: []
        });

        this.getData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.setData({
            page: ++this.data.page
        });

        api.getMemberPayBill(this.data.member_id, this.data.page).then((res) => {
            const list = res.data.data.list;
            wx.hideLoading();
            
            if (!list.length) {
                wx.showLoading({
                    title: '没有更多了',
                    duration: 1000
                });
            } else {
                this.setData({
                    list: this.data.list.concat(res.data.data.list),
                    moneys: res.data.data.moneys,
                    nums: res.data.data.nums
                });
            };
        });
    },
    getData(){
        wx.showLoading({
            title: '加载中...',
        });

        api.getMemberPayBill(this.data.member_id, this.data.page).then((res) => {
            const list = res.data.data.list;
            wx.hideLoading();
            wx.stopPullDownRefresh();
            
            if (!list.length) {
                wx.showLoading({
                    title: '没有更多了',
                    duration: 1000
                });
            } else {
                this.setData({
                    list: res.data.data.list,
                    moneys: res.data.data.moneys,
                    nums: res.data.data.nums
                });
            };
        });
    }
})