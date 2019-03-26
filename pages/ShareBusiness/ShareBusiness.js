// pages/ShareBusiness.js
const {
  api
} = require('../../server/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareImage: '',
    painting: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '生成图片中...'
    });

    api.getMiniprogramCode(options.storeId, 'pages/Business/Business', 200).then( res => {
      
      this.setData({
        painting: {
          width: 690,
          height: 877,
          clear: true,
          views: [
            {
              type: 'image',
              url: 'https://sp.lion-mall.com/miniprogram/images/share-bg.png',
              top: 0,
              left: 0,
              width: 690,
              height: 877
            },
            {
              type: 'image',
              url: res.data.data||'https://sp.lion-mall.com/miniprogram/images/gh_8264c7c16c36_258.jpg',
              top: 587,
              left: 118,
              width: 156,
              height: 156
            },
            {
              type: 'image',
              url: options.head || 'https://sp.lion-mall.com/miniprogram/images/business/default_head.png',
              top: 40,
              left: 256,
              width: 180,
              height: 180,
              borderRadius: 90
            },
            {
              type: 'text',
              content: options.name,
              fontSize: 34,
              color: '#000000',
              textAlign: "center",
              top: 280,
              left: 345
            },
            {
              type: 'text',
              content: `好评 ${options.commentNum}`,
              fontSize: 24,
              color: '#EA3B35',
              top: 345,
              left: 255
            },
            {
              type: 'text',
              content: `人均 ¥${options.price}`,
              fontSize: 24,
              color: '#666666',
              top: 345,
              left: 374
            },
            {
              type: 'text',
              content: options.tag,
              fontSize: 24,
              color: '#333333',
              textAlign: "center",
              top: 468,
              left: 345,
            }
          ]
        }
      })
    });
    
  },

  eventGetImage(e){
    wx.hideLoading()
    const { tempFilePath, errMsg } = e.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
  },
  tapSaveImage(){
    wx.saveImageToPhotosAlbum({
        filePath: this.data.shareImage,
        success (res) {
          wx.showToast({
            title: '保存图片成功',
            icon: 'success',
            duration: 2000
          })
        }
    })
  },
   /**
   * 预览图片
   */
  previewImage(current, urls) {
    wx.previewImage({
      current: current,
      urls: urls,
      fail(err) {
        console.error(err);
      }
    });
  },
  tapPreviewImage(e) {
    this.previewImage(e.currentTarget.dataset.img, [e.currentTarget.dataset.img]);
  }
})