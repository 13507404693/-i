// pages/spComment/spComment.js
const { api, wxApi } = require('../../server/index');
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
    submitBtnState: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id, orderId: options.orderId });
    const token = wx.getStorageSync('token');


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
      images: arr.join(';')
    });
  },
  submit(){
    const unionid = wx.getStorageSync('userInfo').unionId;
    
    if (this.data.content === ''){
      showErrorToast('需要写点什么吧！')
      return false; 
    };
    this.setData({submitBtnState: true});
    
    api.publishBusinessComment(
      unionid, 
      this.data.id, 
      filterEmoji(this.data.content), 
      this.data.images, 
      this.data.score,
      this.data.orderIdfsdafsdfsd
    ).then(res => {
      if (res.data.status){

        showSuccessToast(res.data.msg);

        setTimeout( () => {

          this.setData({ submitBtnState: false });
          wx.navigateBack({ delta: 1});

        },2000);
      }else{
        this.setData({ submitBtnState: false });

        if (res.data.data.code === -90){
          wx.showToast({
            title: '提示：没有在该商家消费，不能评论哦。',
            icon: 'none',
            duration: 2000
          });
          return false;
        }

        showErrorToast(`提示：${res.data.msg}`);
      };
    });
  }
})