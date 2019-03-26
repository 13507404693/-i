// pages/Complaintsj/Complaintsj.js
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');
const { api, wxApi } = require('../../server/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:0,
    content: '',
    type: 1,
    typeArr: [
      '资质问题',
      '价格问题',
      '质量问题',
      '服务问题',
      '其他问题'
    ],
    images: '',
    submitBtnState: false
  },
  //输入 字体 长度 监听 
  bindiupt: function (e) {
    const vallength = e.detail.value.length;
    
    this.setData({
      num: vallength,
      content: e.detail.value
    })
  },
  /**
   * 监听图片上传完成后，返回上传的 images
   */
  onUploadImg(e){
    let arr = [];
    e.detail.forEach(item => {
      arr.push(item.file);
    });

    this.setData({
      images: arr.join(',')
    });
  },
  tapType(e){
    this.setData({
      type: e.currentTarget.dataset.type
    });
  },
  submit() {
    if (this.data.content === '') {
      showErrorToast('需要写点什么吧！')
      return false;
    };
    this.setData({ submitBtnState: true });
    const userInfo = wx.getStorageSync('userInfo');
    const name = userInfo.nickName;
    const mobile = userInfo.member_mobile;
    
    const com = `(${this.data.typeArr[this.data.type]})：${this.data.content}`;

    api.publishBusinessComplaint(name, mobile, com, this.data.images).then(res => {
      if (res.data.status) {
        
        showSuccessToast(res.data.msg);
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 2000);
      };
    }).catch(err => console.error(err));
  }
})