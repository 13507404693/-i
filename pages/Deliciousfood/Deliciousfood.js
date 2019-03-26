const { api, wxApi } = require('../../server/index');
const { showSuccessToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    atcs:'100',
    secend_classify:[],
    storeList:[],
    page:1,
    businessListLoadingState: false, // 商家列表 底部 loading
    isShowbottomMsg: false, //  商家列表 底部提示内容 状态
    bottomMsg: '正在全力拓展优惠商户，敬请期待！', // 商家列表 底部提示内容
    dataset_id:'',
    ids:'',
    pid:'',
    tags: [],
    title:'',
    show_hide:true,
    storeListNoState: false,
    sh_tf:true
  },
  // 点击标签赛选 
  tap:function(e){
    const that=this;
    const secendClassify = that.data.secend_classify;

    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    
    that.setData({ 
      tags: [],
      [`secend_classify[${[e.target.dataset.id]}].state`]: !secendClassify[e.target.dataset.id].state,
      isShowbottomMsg: false,
    });
    
    // 找出 state === true 的标签  
    let tagsNames = [];
    for (let index = 0; index < secendClassify.length;index++){
      if (secendClassify[index].state){
        tagsNames.push(secendClassify[index].name);
      };
    };

    that.setData({ 
      atcs: e.currentTarget.dataset.id,
      dataset_id: e.target.dataset.id,
      tags: tagsNames,
      page:1,
      sh_tf:false,
    
    });
    that.getBusinesslist()
  },

  // 点击全部 更新全部数据
  tap_whole:function(){
  const that = this;

  wx.showLoading({
    title: '加载中',
    mask: true,
  })

  // 获取 标签
  api.gettaglist(that.data.pid).then(res => {
    // 将标签加入 state 属性
    let arr = [];
    for (let i = 0; i < res.data.data.length; i++) {
      res.data.data[i].state = false;
      arr.push(res.data.data[i]);
    };

    that.setData({
      secend_classify: arr,
    });
  }).catch(err => console.error(err));


  //商家
  const latlng = wx.getStorageSync('location');
  const data_json = {
    pid: that.data.pid,
    point: `${latlng.longitude},${latlng.latitude}`,
    page: 1,
    pagesize: 8,
    area: latlng.district,
    token: wx.getStorageSync('token'),
    tag:[]
  }

  api.Labeltype(data_json).then(res => {
    if (res.statusCode === 200) {
      that.setData({
        storeList: res.data.data.storeList,
        businessListLoadingState: false,
        tags:[],
        page:1
      });

      wx.hideLoading();
      
    };

  }).catch(err => {
    console.log('数据报错')
  });

    that.setData({
      sh_tf:true
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that=this;
      that.setData({ 
       pid:options.pid,
       title: options.title
      })

    that.getBusinesslist();

    // 获取 标签
    api.gettaglist(that.data.pid).then(res => {
      // 将标签加入 state 属性
      let arr = [];
      for (let i = 0; i < res.data.data.length;i++){
        res.data.data[i].state = false;
        arr.push(res.data.data[i]);
      };

      that.setData({
        secend_classify: arr,
      });
    }).catch(err => console.error(err));

  
  },
  // 获取 商家
  getBusinesslist(){
    const that=this;
//商家
    const latlng = wx.getStorageSync('location');
    const data_json = {
      pid:that.data.pid,
      point: `${latlng.longitude},${latlng.latitude}`,
      page:that.data.page,
      pagesize:8,
      area:latlng.district,
      token:wx.getStorageSync('token'),
      tag: that.data.tags.join(",")
    }

    api.Labeltype(data_json).then(res => {

    console.log(res)
      
      if (res.statusCode === 200) {
        that.setData({
          storeList:res.data.data.storeList,
          businessListLoadingState:false,
        });
      };

      if (that.data.storeList.length < 1){
        that.setData({
          storeListNoState: true,
          isShowbottomMsg: true,
        })
      };

      if (res.statusCode==404){ 
        that.setData({
          isShowbottomMsg: true,
          show_hide:false,
        })
        return false;
      };


      wx.hideLoading();
    
    }).catch(err => {
      wx.hideLoading();
      that.setData({ 
        businessListLoadingState:false,
        isShowbottomMsg:true,
      });

      if (that.data.storeList.length < 1) {
        that.setData({
          storeListNoState: true,
        })
      };

    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
      const that=this;
      that.setData({ 
       page:++that.data.page 
      });
      
      //商家累加
      const latlng = wx.getStorageSync('location');
      const data_json = {
        pid: that.data.pid,
        point: `${latlng.longitude},${latlng.latitude}`,
        page: that.data.page,
        pagesize: 8,
        area: latlng.district,
        token: wx.getStorageSync('token'),
        tag: that.data.tags.join(",")
      }

      api.Labeltype(data_json).then(res => {

        if (res.statusCode== 200){
          that.setData({
            businessListLoadingState: true,
          });
        };


        if (res.data.data.length <= 0){
          that.setData({
            businessListLoadingState: false,
            isShowbottomMsg: true
          });
          return;
        };

        that.setData({
          storeList:that.data.storeList.concat(res.data.data.storeList),
        });

      }).catch(err => console.error(err));

  },
  onShow:function(){ 
    wx.setNavigationBarTitle({
      title: this.data.title
    })
  }
})