// pages/spComment/spComment.js
const { shopApi, wxApi } = require('../../server/index');
const { showSuccessToast, showErrorToast, filterEmoji } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    score: 5,
    content: '',
    images: '',
    submitBtnState: false,
    token: '',
    anonymous: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync('token');
    this.setData({ orderId: options.orderId, goodsImg: options.goodsImg||'',token: token });

  },
  tapEvaluate(e){
    this.setData({ score: parseInt(e.currentTarget.dataset.evaluate)});
  },
  /**
   * 输入 字体 长度 监听
   */
  bindiupt:function(e){
    const that=this;
    const vallength=e.detail.value.length;
    
    that.setData({
      num: vallength,
      content: e.detail.value
    })

  },
  /**
   * 监听图片上传成功
  */
  imageloadSuccess(e){
    let arr = [];
    
    e.detail.forEach(item => {
      arr.push(item.file);
    });

    this.setData({
      images: arr.join(',')
    });
  },
  tapIsanonymous(){
    this.setData({
      anonymous: this.data.anonymous === 1 ? 0 : 1
    });
  },
  submit(){
    
    if (this.data.content === ''){
      showErrorToast('需要写点什么吧！')
      return false; 
    };
    this.setData({submitBtnState: true});
    
    shopApi.pubOrderComment(
      this.data.token, 
      this.data.orderId, 
      filterEmoji(this.data.content), 
      this.data.images, 
      this.data.score,
      this.data.anonymous
    ).then(res => {
      
      if (res.data.status){

        showSuccessToast(res.data.msg);

        setTimeout( () => {

          this.setData({ submitBtnState: false });
          wx.navigateBack({ delta: 1});

        },2000);
      }else{
        this.setData({ submitBtnState: false });

        showErrorToast(`${res.data.msg}`,'');
      };
    });
  }
})