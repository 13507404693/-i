const { api, wxApi } = require('../../server/index.js');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_id:'',
    istoday:'',
    member_id:'',
    Todaylist:'',
    tep:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that=this;

    var order_id=options.order_id;
    var istoday=options.istoday;
    
    that.setData({ 
      order_id:order_id,
      istoday: istoday
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
  onShow:function(){
    const that=this;
    const member_id = wx.getStorageSync('member_id');
    that.setData({
      member_id: member_id
    })

    //请求 订单详情里面的内容 
    that.OrderContent();
  
  },
// 通过 order_id 获取对应界面的参数
  OrderContent(){ 
    const that=this;
    const member_id=that.data.member_id;
    const istoday = that.data.istoday;
    const order_id = that.data.order_id;
    console.log(that.data.order_id)
    api.OrderDcontent(member_id, istoday,order_id).then(reslocve => {
      console.log(reslocve.data.data.list[0].contacts_phone)
      that.setData({
        Todaylist: reslocve.data.data.list,
        tep: reslocve.data.data.list[0].contacts_phone
        
      })

      console.log(zhekou)

      var  Tlist = setInterval(function () {

        const offtimes = that.data.Todaylist;

        for (var i = 0; i < offtimes.length; i++) {

          //把 status 1 状态 时间筛选出来

          if (offtimes[i].offtime.status == 1) {

            if (offtimes[i].offtime.msg == 0) {
              offtimes[i].offtime.msg = 0;
              clearInterval(Tlist)
            }

            offtimes[i].offtime.msg -= 1;
            
          }

        }
        that.setData({
          Todaylist: offtimes
        })
      }, 1000)



    })
  },
  // zhekou 0 是 全款 1是 折扣  全款和折扣根据 积分去判断 积分=0 就是全款 积分=1 就是折扣
  jlpayment(){
    const that=this;
    const Todaylists = that.data.Todaylist[0];

    const openid = wx.getStorageSync('openid');
    const paytype = 1;
    const deduction = that.data.Todaylist[0].voucher_price==0?0:1;
    const fromtype = 'LETPAY';
    let mobile = Todaylists.member_mobile;
    let goods = JSON.stringify(Todaylists.goods)
    let openId = openid;
    let storeId = Todaylists.store_id;
    let time = Todaylists.shipping_time;
    let mobile2 = Todaylists.member_mobile;
    let msg = '';
    let order_id = Todaylists.order_id;

    wx.showLoading({
      title: '载入中...',
      mask: true
    });
    // (mobile, goods, openId, storeId, deduction, time, mobile2, msg, paytype, order_id)
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
      if (res.errMsg === 'requestPayment:ok') {
        wx.switchTab({
          url: '/pages/sQorder/sQorder'
        })
        return;
      };
      }).catch(err=>{ 
        console.log(err);
        wx.showToast({
          title: '支付已放弃',
          icon:'none'
        })
        if (err.errMsg ==="requestPayment:fail cancel"){ 
          setTimeout(()=>{
              wx.switchTab({
                url: '/pages/sQorder/sQorder'
              })
          },2000)
          return; 
        }
      }) 

      
  },
  // 点击事件 拨打电话
  phonecallevent: function (e) {
    wx.makePhoneCall({
      phoneNumber:this.data.tep
    })
  },
  // 确定收货
  ConfirmGoods(){
    const that=this;
    const orderId=that.data.order_id;
    wx.showModal({
      title: '确认收货',
      content: '如您已收货，请点击确定',
      success: function (res) {
        if (res.confirm) {
         
          api.ConfirmGoods(orderId).then(res => {

            if (res.data.status === true) {
              console.log(res);
              wx.showToast({
                title: '收货成功',
                icon: 'none'
              })

              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/sQorder/sQorder'
                })
              }, 2000)
            }
          })


        } else if (res.cancel) {
          wx.showToast({
            title: '您取消确认收货',
            icon:'none'
          })
        }
      }
    })

    
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