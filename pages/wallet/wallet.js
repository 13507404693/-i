const { api, wxApi, shopApi } = require('../../server/index.js');

// pages/wallet/wallet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    pagesize:10,
    member_id: '',
    start_time:'',
    end_time:'',
    amount:'',
    listData:'',
    time_star:'',
    time_end:'',
    is_off:false,
    is_tf:false,
    url:'https://sp.lion-mall.com/wx_dist/envelopesExplain.html',
    title:"提现说明"
  },
// 点击展开模板
  tap_moble(){
    const that=this;
    that.setData({ 
      is_off:true
    })
  },
  // 点击取消 取消模板为把 选择好时间清空
  cancel(){ 
    const that = this;
    that.setData({
      is_off: false,
      time_star:'',
      time_end:''
    }) 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that=this;
  
    that.setData({
      member_id: options.member_id,
    })
    wx.showLoading({
      title: '加载中...',
    })

    that.getData();
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that=this;

    wx.showLoading({
      title: '加载中...',
    }) 

      let num=++that.data.page;
      console.log(num)

    let wallData = {
      page: that.data.page,
      pagesize: that.data.pagesize,
      member_id: that.data.member_id,
      type: 1,
      start_time: that.data.start_time,
      end_time: that.data.end_time
    }
    shopApi.wallerGet(wallData).then(res => {
      wx.hideNavigationBarLoading();
      wx.hideLoading()

      if (!res.data.data.detail.list.length){
          wx.showToast({
            title: "没有啦！",
            icon: 'none'
          });
        return false;
      }

      console.log(res)

      that.setData({
        amount: res.data.data.amount,
        listData: that.data.listData.concat(res.data.data.detail.list) 
      })
    }).catch(err => {
      console.log(err);
    })
  },


  /**
 * 获取数据
 */
  getData(){
    var that = this;
    console.log(that.data.page)

    let  wallData = {
      page: that.data.page,
      pagesize: that.data.pagesize,
      member_id: that.data.member_id,
      type:1,
      start_time: that.data.start_time,
      end_time: that.data.end_time
      }
    shopApi.wallerGet(wallData).then(res=>{ 

      if (!res.data.data.detail.list.length) {
            that.setData({
              is_tf: true,
              listData: res.data.data.detail.list,
            })
            wx.hideLoading()
            return false;
      } 

           wx.hideLoading()

          that.setData({ 
            amount: res.data.data.amount,
            listData:res.data.data.detail.list,
            is_tf:false
          })

    }).catch(err=>{ 
            console.log(err);
    })
  },

  /**
   * 数据时间筛选 bindDateChangeStar开始时间   bindDateChangeEed 结束时间
   */
  bindDateChangeStar: function (e){
    console.log(e)
    console.log('picker1发送选择改变，携带值为', e.detail.value)
    this.setData({
      time_star: e.detail.value
    })
  },
  bindDateChangeEed: function (e) {
    console.log(e)
    console.log('picker2发送选择改变，携带值为', e.detail.value)
    this.setData({
      time_end: e.detail.value
    })
  },

// 选择时间选择 form 提交
  formSubmit: function (e) {
    const that=this;
    console.log(e);

    if (e.detail.value.timeStar==''){
          wx.showToast({
            title: '开始时间不能为空',
            icon:'none'
          })

          return false;
    }

    if (e.detail.value.timeEnd==''){
      wx.showToast({
        title: '结束时间不能为空',
        icon:'none'
      })
      return false;
    }

    wx.showLoading({
      title: '加载中...',
    })


    let wallData = {
      page:1,
      pagesize: that.data.pagesize,
      member_id: that.data.member_id,
      type: 1,
      start_time:e.detail.value.timeStar,
      end_time:e.detail.value.timeEnd
    }

    shopApi.wallerGet(wallData).then(res => {
     
      if (!res.data.data.detail.list.length) {
        that.setData({ 
          is_tf:true,
          amount: res.data.data.amount,
          listData: res.data.data.detail.list,
          start_time: ' ',
          end_time: ' ',
          is_off: false,
        })  
        wx.hideLoading()
        return false;
      } 

        setTimeout(()=>{ 
          wx.hideLoading()
        },1500)


      that.setData({
        amount: res.data.data.amount,
        listData: res.data.data.detail.list,
        start_time:' ',
        end_time:' ',
        is_off: false,
        is_tf: false
      })

    }).catch(err => {
      console.log(err);
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})