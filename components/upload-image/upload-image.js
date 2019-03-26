// components/upload-image/upload-image.js
const { api, wxApi } = require('../../server/index.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgSize: {
      type: 'Number',
      value: 2000
    },
    imgDir: {
      type: 'String',
      value: 'comment'
    },
    imgNum: {
      type: 'Number',
      value: 7
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    images: []
  },
  ready(){
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _addImage(){
      
      wxApi.chooseImage({ count: (this.data.imgNum + 1) - this.data.images.length }).then( res => {
        if (res.errMsg !== 'chooseImage:ok') return;

        const imgLength = this.data.images.length;
        wx.showNavigationBarLoading();
        
        this.setData({
          images: this.data.images.concat(this._filterLimitSizeImg(res.tempFiles)),
          imgLength: imgLength
        });

        this._uploadImg(this.data.images, res => {
          wx.hideNavigationBarLoading();

          this.triggerEvent('onSuccess', this.data.images);
        });

      }).catch(err => console.error(err));
      
    },
    /**
     * 删除图片
     */
    _remove(e){
      const index = e.currentTarget.dataset.index;
      const images = this.data.images;

      images.splice(index, 1);
      this.setData({
        images: images
      });
    },
    /**
     * 更新上传进度
    */
    _onUploadTask(res,index){
      
      this.setData({
        [`images[${index}].progress`]: (100-res.progress)
      });
      
    },
    /**
     * 逐个上传图片
    */
    _uploadImg(imgArr,callback){
      
      for (let index = this.data.imgLength; index < imgArr.length; index++) {
        const item = imgArr[index];
        
        api.uploadImage(item.path, this.data.imgDir, res => this._onUploadTask(res, index))
        .then( uploadRes => {
            const data = JSON.parse(uploadRes.data);
            
            if (data.status) {
              this.setData({
                [`images[${index}].isUpload`]: true,
                [`images[${index}].file`]: data.data.goods_imgs
              });
              callback && callback(data.data);
            };

          }).catch( err => {
            this.setData({
              [`images[${index}].progress`]: 100
            });
            console.error(err);
          });
      };
   
    },
    /**
     * 过滤 限制图片大小 的图片 
     */
    _filterLimitSizeImg(tempFiles){

      let imgArr = [];
      for (const index in tempFiles) {
        const tempImg = tempFiles[index];
        const size = parseInt(tempImg.size / 1024);

        if (size > this.data.imgSize) {

          wx.showToast({
            title: `图片大小不能超过 ${this.data.imgSize / 1000}M`,
            icon: 'none',
            duration: 2000
          });
          continue;
        };

        imgArr.push(tempFiles[index]);
      };

      return imgArr;
    }
  }
})
