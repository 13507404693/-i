const { api, wxApi, shopApi } = require('../../server/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productData:'',
    oneId:'',
    windowHeight:'',
    indexs:0,
    typeId:1,
    proBlcokData:''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      const that=this;
      const token = wx.getStorageSync('token');

      that.setData({ 
        token: token
      })

      //获取 手机高度初始化  
      that.getSystemInfo();

      //初始化 产品分类分类
       that.producttitle();

  },
  // 产品 分类标题
  producttitle:function(){ 
    const that=this; 
    const typeId = that.data.typeId;
    const token = that.data.token;

    shopApi.product_title(token,typeId).then(res=>{
      if (res.data.status==true){ 
        that.setData({
          productData: res.data.data,
          oneId: res.data.data[0].classify_id
        });
        //执行 对应产品内容 
        that.ProductBlock();
      }
    }).catch(err=>{ 
      console.log(err);
    })
  },

  //产品块内容 分类
  ProductBlock:function(){ 

     const that=this;
     const typeId = that.data.typeId;
     const token = that.data.token;
     const parentId = that.data.oneId;

    shopApi.ProductBlock(token, parentId, typeId).then(res=>{ 
      if(res.data.status==true){ 
             console.log(res.data.data);
             that.setData({ 
               proBlcokData:res.data.data
             })
      }
    }).catch(err=>{   
        console.log(err);
    })
  },

//获取手机设备信息
  getSystemInfo: function (){
    const that=this;
    wx.getSystemInfo({
      success: function (res) {
        const wh = res.windowHeight-52;
        that.setData({
          windowHeight: wh
        })
      }
    })
  },
  // 点击标题
  tap_product:function(e){
    const that=this;

    that.setData({ 
      indexs:e.currentTarget.dataset.index,
      oneId: e.currentTarget.dataset.id,
    })

    //点击执行 对应产品内容
    that.ProductBlock();

  },
  //点击产品 到搜索界面
  navTo_name:function(e){
      const that=this;
      wx.navigateTo({
        url: `/pages/ShopSearch/ShopSearch?words=${e.currentTarget.dataset.name}&categoryId=${e.currentTarget.dataset.categoryid}`,
      })

  },
// 点击进入购物车
  go_gwc:function(){
    wx.navigateTo({
      url:'/pages/Cart/Cart'
    })
  },
})