const { api, wxApi } = require('../../server/index.js');
const { Firstmonth, Thelastmonth } = require('../../utils/util.js');

// pages/Mybilltwo/Mybilltwo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      active:1,
      page:1,
      pagesize:10,
      order_come:1,
      start_time:'',
      end_time:'',
      time_star:'',
      time_end:'',
      tongji:'',
      showModal:false,
      offbottom:false

  },
  //点击切换选项啦
  tab_active(e){
   const that=this
    console.log(e);
    console.log(e.currentTarget.dataset.active)


    that.setData({ 
      active:e.currentTarget.dataset.active
    })

    // :1线下门店支付
    if (e.currentTarget.dataset.active==1){ 
        that.setData({ 
            page: 1,
        })
      that.StoreConsumption(); 
     }

    // :2线上商圈支付
    if (e.currentTarget.dataset.active==2){ 
        that.setData({
          page:1
        })
      that.StoreConsumption();
    }
  
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    const that=this;
    if (that.data.active==1){ 
     that.StoreConsumption();
    }
  },
  // 账单数据请求公共
  StoreConsumption(){ 
    const that = this;
    const member_id = wx.getStorageSync('member_id');
    let start_time = Firstmonth(new Date());
    let end_time = Thelastmonth(new Date());
    let page = that.data.page;
    let pagesize = that.data.pagesize;
    let order_come = that.data.active;

    console.log()
    const order_state = 20;

    api.getTimeOrderid(member_id, start_time, end_time, order_state, page, pagesize,order_come ).then(reslocve => {
      console.log(reslocve)
      console.log(reslocve.data.data.tongji)
      //数据为空 显示没有更多数据
      if (reslocve.data.data.list == '') {
        console.log('刚开始执行')
        that.setData({
          start_time: start_time,
          end_time: end_time,
          Tostlist: reslocve.data.data.list,
          tongji: reslocve.data.data.tongji,
          offbottom:true
        })
        return false;
      }

      that.setData({
        start_time: start_time,
        end_time: end_time,
        Tostlist: reslocve.data.data.list,
        tongji: reslocve.data.data.tongji,
        offbottom: false
      })
    }) 

  },
// 点击日期弹出时间
  modalDlg(){ 
    const that=this;
    that.setData({
      showModal: true
    })

  },

  // 点击取消 取消模板为把 选择好时间清空
  cancel() {
    const that = this;
    that.setData({
      showModal: false
    })
  },

  /**
 * 数据时间筛选 bindDateChangeStar开始时间   bindDateChangeEed 结束时间
 */
  bindDateChangeStar: function (e) {
    console.log(e)
    console.log('picker1发送选择改变，携带值为', e.detail.value)
    this.setData({
      time_star: e.detail.value
    })
  },

  bindDateChangeEed: function (e) {
    console.log('picker2发送选择改变，携带值为', e.detail.value)
    this.setData({
      time_end: e.detail.value
    })
  },


  // 选择时间选择 form 提交
  formSubmit: function (e) {
    const that = this;
    if (e.detail.value.timeStar == ''){
      wx.showToast({
        title: '开始时间不能为空',
        icon: 'none'
      })

      return false;
    }

    if (e.detail.value.timeEnd == ''){
      wx.showToast({
        title: '结束时间不能为空',
        icon: 'none'
      })
      return false;
    }

    const member_id = wx.getStorageSync('member_id');
    let start_time = e.detail.value.timeStar;
    let end_time = e.detail.value.timeEnd;
    let page = that.data.page;
    let pagesize = that.data.pagesize;
    let order_come = that.data.active;
    const order_state = 20;

    wx.showLoading({
      title: '加载中...',
    })

    api.getTimeOrderid(member_id, start_time, end_time, order_state, page, pagesize, ).then(reslocve => {
      //数据为空 显示没有更多数据
      if (reslocve.data.data.list==''){
        that.setData({ 
          Tostlist: reslocve.data.data.list,
          tongji: reslocve.data.data.tongji,
          offbottom:true
        })

        return false;
      }
      
      wx.hideLoading() 
      that.setData({
        start_time:start_time,
        end_time:end_time,
        Tostlist:reslocve.data.data.list,
        tongji:reslocve.data.data.tongji,
        showModal: false
      })
    }) 

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
  onPullDownRefresh: function (e) {
    const that=this;

    wx.showLoading({
      title: '数据加载中',
    })
    wx.showNavigationBarLoading();
    that.setData({ 
      page:1
    })

    that.StoreConsumption();

    setTimeout(()=>{
      wx.hideLoading();
      // // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    },2000)
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that = this;

    wx.showLoading({
      title: '加载中...',
    })

    let page = ++that.data.page;

    const member_id = wx.getStorageSync('member_id');
    let start_time = that.data.start_time;
    let end_time = that.data.end_time;
    let pagesize = that.data.pagesize;
    let order_come = that.data.active;
    const order_state = 20;

    api.getTimeOrderid(member_id, start_time, end_time, order_state, page, pagesize, ).then(reslocve => {
      wx.hideLoading();
      //数据为空 显示没有更多数据
      if (reslocve.data.data.list == '') {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'noen',
          })
      }

      that.setData({
        start_time: start_time,
        end_time: end_time,
        Tostlist: that.data.Tostlist.concat(reslocve.data.data.list),
        showModal: false
      })
    })     
  
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})