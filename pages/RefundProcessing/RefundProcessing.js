const { api, wxApi, shopApi } = require('../../server/index.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    token:'',
    page: 1, 
    pageSize: 100,
    state: 100,
    listData: '',
    goIndex:'',
    orderid:'',
    is_text:'等待平台处理中'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    that.setData({
      token: wx.getStorageSync('token'),
      goIndex: options.go_index,
    });

    // 列表数据初始化
    that.OrderList();

  },
  OrderList: function () {
    const that = this;

    const token = that.data.token;
    const page = that.data.page;
    const pageSize = that.data.pageSize;
    const state = that.data.state;

    shopApi.OrderList(token, page, pageSize, state).then(res => {
      if (res.data.status == true) {
        //点击谁 获去对应的 数据
        that.setData({
          listData:res.data.data.list[that.data.goIndex],
          orderid:res.data.data.list[that.data.goIndex].order_id,
          order_state:res.data.data.list[that.data.goIndex].order_state
        })

      }
    }).catch(err => {
      console.log(err)
    })
  },
  // 點擊進入商品详情
  go_commodity: function (e) {
    const that = this;

    wx.navigateTo({
      url: `/pages/Commoditydetails/Commoditydetails?goodsId=${e.currentTarget.dataset.goodsid}`,
    })
  },
  //联系客户
  tap_phone:function(){
    const that=this;
    wx.makePhoneCall({
      phoneNumber: '18060746408'
    })
  },
  //撤销退款
  tap_apply:function(){
    const that = this;
    const token=that.data.token;
    const orderid= that.data.orderid;

    wx.showModal({
      title: '撤销申请',
      content: '你确定要撤销申请吗?',
      success: function (res) {
        if (res.confirm) {
          shopApi.Revoke(token, orderid).then(res => {
            console.log(res);

            wx.showToast({
              title: '撤销成功',
              icon: 'none'
            })

            setTimeout(function () {
              wx.navigateBack({ changed: true });//返回上一页
            }, 1000)

          }).catch(err => {
            console.log('err')
          })

        };
      }
    })  
  },
  // 点击查看商品详情
  tap_jindu:function(){ 
    const that = this;
    const orderid = that.data.orderid;
    const order_state = that.data.order_state;

    wx.navigateTo({
      url: `/pages/DetailsOfRefunds/DetailsOfRefunds?orderid=${orderid}&order_state=${order_state}`,
    })
  },
  //修改申请
  tap_modify:function(){
    const that = this;

    wx.navigateTo({
      url: '/pages/Application/refund',
    })

  },
  /**
   * 点击打开会话
   */
  clickIm(e){
    const userInfo = wx.getStorageSync('userInfo');
    const param = {
      user: {
        name: userInfo.member_mobile,
        avatarUrl: userInfo.avatarUrl
      },
      receiveUser: {
          name: this.data.listData.contacts_phone,
          avatarUrl: '',
          nickName: this.data.listData.store_name
      },
      sourceType: 8,
      messageType: 1,
      id: this.data.listData.goodsList[0].model_id
    };

    wx.navigateTo({
      url: `/pages/ImDialog/ImDialog?url=https://sp.lion-mall.com/wap6.0/webim/dialog&param=${this.urlJsonEncode(param)}&title=${this.data.listData.store_name}`
    });
  },
  urlJsonEncode(json){
    return encodeURIComponent(JSON.stringify(json));
  }
})