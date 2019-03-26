const { api, wxApi, shopApi } = require('../../server/index.js');

Page({
  /**
   * 页面的初始数据
   */
   data: {
     token:'',
     page:1,
     pageSize:300,
     state:100,
     listData:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     const  that=this;
     const add_token = wx.getStorageSync('token');

    that.setData({
      token: add_token,
    });

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 列表数据初始化
    this.OrderList();
  },
  // 列表数据初始化 
  OrderList:function(){
     const that=this;

     const token=that.data.token;
     const page=that.data.page;
     const pageSize = that.data.pageSize;
     const state = that.data.state;
     

     shopApi.OrderList(token, page, pageSize,state).then(res=>{
        if (res.data.status==true){ 

          that.setData({ 
              listData:res.data.data.list
          })
    
        }
    }).catch(err=>{
        console.log(err)
    })

  },
  //点击进入商品 详情
  details:function(e){ 
    const that=this;
      wx.navigateTo({
        url: `/pages/RefundProcessing/RefundProcessing?go_index=${e.currentTarget.dataset.index}`,
      })
  }
})