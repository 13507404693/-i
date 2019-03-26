const { api, wxApi } = require('../../server/index.js');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    member_id: '',
    Todaylist: '',
    Historicallist: '',
    strOff: true,
    strOfftwo:true,
    empty:false
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
   * 生命周期函数--监听页面显示
  */
  onShow: function (){
    var that = this;

    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '提示：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return;
    };

    const member_id = wx.getStorageSync('member_id');
    that.setData({
      member_id: member_id
    })

    //今日订单
    that.OrderToday();
    //历史订单 
    that.HistoricalOrder();

  },
  // 今日订单
  OrderToday() {
    const that = this;
    const istoday = 1;
    const member_id = that.data.member_id;
    api.BusinessOrder(member_id, istoday).then(reslocve => {

      if (reslocve.data.data.list==''){
        console.log('123')
          that.setData({
            strOff:false,
            empty:true,
            Todaylist: reslocve.data.data.list
          })
          return false;
       
      }
      if (reslocve.data.data.list) {

        // 为滑动删除 添加isTouchMove条件
        const Todaylist = reslocve.data.data.list;
        for (var i = 0; i < Todaylist.length; i++) {
          Todaylist[i].isTouchMove = false;
        }

        that.setData({
          Todaylist: Todaylist,
          strOff: true,
          empty: false,
        })
        
        clearInterval(that.data.Tlist)
        //取消订单 倒计时不再执行
        if (that.timsoff) {
          clearInterval(Tlist);
          return false;
        }
        
        const Tlist = setInterval(function () {
          var offtimes = that.data.Todaylist;
          for (var i = 0; i < offtimes.length; i++) {
            //把 status 1 状态 时间筛选出来
            if (offtimes[i].offtime.status == 1) {
                
                //msg 等于0 的话  
              if (offtimes[i].offtime.msg == 0){
                offtimes[i].offtime.msg = 0;
                that.OrderToday();
              }
              offtimes[i].offtime.msg -= 1;
            }
          }
          that.setData({
            Todaylist: offtimes
          })
        }, 1100)

        that.setData({ 
          Tlist: Tlist
        })
        
      }

    })
  },
  //历史订单
  HistoricalOrder() {
    const that = this;
    const istoday = 0;
    const member_id = that.data.member_id;
    api.BusinessOrder(member_id, istoday).then(reslocve => {
      
      if (reslocve.data.data.list == '') {
        that.setData({
          strOfftwo: false,
          Historicallist: reslocve.data.data.list,
          emptytwo:true
        })
        return false;
      }

      if (reslocve.data.data.list) {
        // 为滑动删除 添加isTouchMove条件
        const Todaylist = reslocve.data.data.list;
        for (var i = 0; i < Todaylist.length; i++) {
          Todaylist[i].isTouchMove = false;
        }

        that.setData({
          Historicallist: Todaylist,
          strOfftwo: true,
          emptytwo: false
        })

      } else {
        that.setData({
          strOff: false
        })
      }
    })
  },

  //取消订单
  cancel(e) {
    const that = this;
    const token = wx.getStorageSync('token');
    const orderid = e.currentTarget.dataset.orderid;

    wx.showLoading({
      title: '订单取消中...',
      mask: true
    });

    api.orderOff(token, orderid).then(reslocve => {

      if (reslocve.data.status===true){ 
        console.log(reslocve);
        wx.hideLoading();
        that.OrderToday();
        wx.showToast({
          title: '取消成功',
          icon: "none"
        })
        that.setData({
          timsoff: false
        })
      }

    }).catch (err=> {
      console.log(err);
    })


  },
 //删除订单
  orderRmover(e){
    const that=this;
    const token = wx.getStorageSync('token');
    const orderid = e.currentTarget.dataset.orderid;
    console.log(orderid);
    wx.showLoading({
      title: '订单删除中...',
      mask: true
    });
    api.orderRemover(token, orderid).then(reslocve => {
      console.log(reslocve);
      if (reslocve.data.status === true){ 
          wx.hideLoading();
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })
          that.OrderToday();
          that.HistoricalOrder();
          console.log(reslocve);
      }

    }).catch(err=>{ 
      console.log(err);
    })


  },
//  今日订单 开始滑动 滑动删除
  touchstart(e){ 
    const that=this;

    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })
 
  },
// 今日订单 结束滑动删除
  touchmove: function (e) {
  const that=this;
    let index = e.currentTarget.dataset.index;//当前索引
    let list = that.data.Todaylist;
    let iso=1
    that.Slidexy(e, index, list, iso);

  },

  //  历史订单 开始滑动 滑动删除
  touchstart_Two(e) {
    const that = this;

    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })


  },
  // 历史订单 结束滑动删除
  touchmove_Two: function (e) {
    const that = this;
    let index = e.currentTarget.dataset.index;//当前索引
    let list = that.data.Historicallist;
    let iso = 2
  
    that.Slidexy(e, index,list,iso);
  },



  //公共 滑动封装
  Slidexy(e,index,list,iso){
    const that=this;
    let startX = that.data.startX;//开始X坐标
    let  startY = that.data.startY;//开始Y坐标

    let  touchMoveX = e.changedTouches[0].clientX;//滑动变化坐标
    let  touchMoveY = e.changedTouches[0].clientY;//滑动变化坐标

      //获取滑动角度
    let  angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });

      list.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) {
          //左滑
          v.isTouchMove = false;
        } else {
          //右滑
          v.isTouchMove = true;
        }
      }
    })

    if (iso==1){ 
      // //更新数据
      that.setData({
        Todaylist: list
      }) 

    }


    if (iso == 2) {
      // //更新数据
      that.setData({
        Historicallist: list
      })
    }

  },
  // 计算角度
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI)
  },
  // 去支付
  toPay(e) {
    const that = this;
    const openid = wx.getStorageSync('openid');
    const paytype = 1;
    const zhekou = 1;
    const fromtype = 'LETPAY';
    let indexs = e.currentTarget.dataset.index;
    let orderid = e.currentTarget.dataset.orderid;
    let Todaylist = that.data.Todaylist;

    let Todaylists = "";
    //  去支付 通过 order_id 得到支付参数
    for (var i = 0; i < Todaylist.length; i++) {
      if (Todaylist[i].order_id == orderid) {
        Todaylists = Todaylist[i]
      }
    }

    let mobile = Todaylists.member_mobile;
    let goods = JSON.stringify(Todaylists.goods)
    let openId = openid;
    let storeId = Todaylists.store_id;
    let deduction = 1;
    let time = Todaylists.shipping_time;
    let mobile2 = Todaylists.member_mobile;
    let msg = '';
    let order_id = Todaylists.order_id;
    wx.showLoading({
      title: '载入中...',
      mask: true
    });
    // 提交下单列表 参数信息
    api.listPayInfo(mobile, goods, openId, storeId, deduction, time, mobile2, msg, paytype, order_id).then(reslocve => {
      console.log(reslocve)
      if (reslocve.data.status) {
        wx.hideLoading();
        // 调起支付
        return wxApi.requestPayment(reslocve.data.data);
      };
      let msg = '';
      if (res.data.data == undefined) {
        msg = res.data.msg;
        wx.hideLoading();
      } else {
        msg = res.data.data.return_msg;
        wx.hideLoading();
      };

      wx.showModal({
        title: '预支付失败',
        content: msg
      });

    }).then(res => {
      console.log(res);
      if (res.errMsg === 'requestPayment:ok') {
        wx.showToast({
          title: '支付成功',
          icon: 'loading',
          duration: 500,
        })
        that.OrderToday();
        return;
      };
    })

  },
  // 立即评价
  Evaluate() {
    const that = this;
    console.log('立即评价')
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})