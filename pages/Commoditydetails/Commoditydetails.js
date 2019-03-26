const { api, wxApi, shopApi } = require('../../server/index.js');
const app = getApp();
const { unique, showSuccessToast } = require('../../utils/util.js');
let timeInter = null;
const WxParse = require('../../wxParse/wxParse.js');

// pages/Commoditydetails/Commoditydetails.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperActiveIndex: 1,
    content: {},
    isShowTopNav: false,
    toView: 'list0',
    ishoswhide: false,
    token: '',
    commodity_data: '',
    points: '', //积分价
    goodsList: '', //评论
    co_index: 0,//颜色
    mem_index: 0,//内存
    goodsnum: '',//库存
    num: 1,//商品数量
    Coll: false,
    goodsId: '',
    isfav: '',
    goods_spec_image: '',
    skusList: [],
    skuId: '',//商品id
    skuPrice: '',
    skuGoodsNum: 0,
    skuPoints: 0,
    skuModelOff: true,
    addCartBtnState: false,
    isShowToShop: true,
    content: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    const add_token = wx.getStorageSync('token');

    that.setData({
      token: add_token,
      goodsId: options.goodsId,
      isShowSpec: options.isShowSpec || false
    });

    // 将分享页面带有的 member_id 保存
    if (options.member_id !== undefined && options.member_id !== '') {
      wx.setStorageSync('meId', options.member_id);
    };

    // 初始化商品数
    that.commodity();

    //猜你喜欢 数据初始化
    that.ApplicationProgress()


    timeInter = setTimeout(() => {
      this.setData({
        isShowToShop: false
      });
    }, 5000);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      scene: app.globaData.referrerInfo.scene || 1001
    });
  },
  /**
   * 监听-swiper 滑动
   */
  swiperChange(e){
    this.setData({
      swiperActiveIndex: e.detail.current+1
    });
  },
  /**
   * 点击-顶部导航
   */
  tapTopNav: function (e) {
    this.setData({
      toView: e.currentTarget.dataset.opt,
    });
  },

   /**
   * 点击-积分惠购 显示 原价的 sku 列表
   */
  showDirectPricelSkuModel() {
    const that = this;
    const skuItem = this.data.nopoint[0][0].valArr[this.data.nopoint[0][0].index];

    that.setData({
      ishoswhide: true,
      skusList: this.data.nopoint,
      skuId: skuItem.goods_id,
      skuPrice: skuItem.goods_price,
      skuGoodsNum: skuItem.goods_num,
      skuPoints: skuItem.goods_points,
      skuModelOff: false,
      offtf: false
    });

  },
  /**
   * 点击-积分惠购 显示积分惠购的 sku 列表
   */
  showIntegralSkuModel() {
    const that = this;
    const skuItem = this.data.point[0][0].valArr[this.data.point[0][0].index];

    that.setData({
      ishoswhide: true,
      skusList: that.data.point,
      skuId: skuItem.goods_id,
      skuPrice: skuItem.goods_price,
      skuGoodsNum: skuItem.goods_num,
      skuPoints: skuItem.goods_points,
      skuModelOff: true,
      offtf:true
    });

  },
  // 点击列表参数 关闭
  hideSkuModel: function () {
    const that = this;
    that.setData({
      ishoswhide: false,
    });
  },
  /**
   * 点击-选择 sku
   */
  tapSkus: function (e) {
    const dataset = e.currentTarget.dataset;
    const skusItem = this.data.skusList[0][dataset.keyindex];
    const skusItemStr = `skusList[0][${dataset.keyindex}]`

    /** 判断　当前选择　sku　类型 */
    if (dataset.skutype === 'key'){
      let sizeArr = [];
      let skus = [];

      if (this.data.skuModelOff) {
        skus = this.data.commodity_data.skus.point;
      } else {
        skus = this.data.commodity_data.skus.nopoint;
      };

      /** 通过选择的 sku 找出关联的 sku */ 
      for (let index = 0; index < skus.length; index++) {
        const skuItem = skus[index];
        if (skuItem.attributes.length <= 1) break;
        if (skuItem.attributes[dataset.keyindex].value === dataset.keyval) {
          skuItem['key'] = skuItem.attributes[dataset.keyindex + 1].value;
          sizeArr.push(skuItem);
        };
      };

      /**有关联 判断 当前的 sku， 有无 关联 sku*/
      if (sizeArr.length > 1){
        const skusList = this.data.skusList[0];
        
        if (skusList[dataset.keyindex + 1].index > sizeArr.length-1){
          this.setData({
            [`skusList[0][${dataset.keyindex + 1}].index`]: 0
          });
        };

        this.setData({
          [`skusList[0][${dataset.keyindex + 1}].valArr`]: sizeArr,
          goods_spec_image: dataset.img,
          skuId: sizeArr[skusList[dataset.keyindex + 1].index].goods_id,
          [`${skusItemStr}.index`]: dataset.index,
          skuPrice: sizeArr[skusList[dataset.keyindex + 1].index].goods_price,
          skuGoodsNum: sizeArr[skusList[dataset.keyindex + 1].index].goods_num,
          skuPoints: sizeArr[skusList[dataset.keyindex + 1].index].goods_points
        });
        return false;
      };

      /** 无关联 sku　的情况  */
      this.setData({
        goods_spec_image: dataset.img,
        skuId: dataset.goodsid,
        [`${skusItemStr}.index`]: dataset.index,
        skuPrice: skusItem.valArr[dataset.index].goods_price,
        skuGoodsNum: skusItem.valArr[dataset.index].goods_num,
        skuPoints: skusItem.valArr[dataset.index].goods_points
      });
      return false;
    };

    /* 正常 默认 选择 sku 的情况 */
    this.setData({
      goods_spec_image: dataset.img,
      skuId: dataset.goodsid,
      [`${skusItemStr}.index`]: dataset.index,
      skuPrice: skusItem.valArr[dataset.index].goods_price,
      skuGoodsNum: skusItem.valArr[dataset.index].goods_num,
      skuPoints: skusItem.valArr[dataset.index].goods_points
    });
  },
  // 点击减号
  bindMinus: function () {
    let num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }

    this.setData({
      num: num
    });

  },
  //点击加号
  bindPlus: function () {
    const that = this;
    let num = this.data.num;
    num++;
    if (num > this.data.skuGoodsNum) {
      wx.showToast({
        title: '已超出库存数量',
        icon: 'none'
      })
      that.setData({
        num: that.data.num
      })
      return false
    }

    that.setData({
      num: num
    })

  },

  //商品详情 数据
  commodity: function () {
    const that = this;
    const token = that.data.token;
    const comid = this.data.goodsId;

    wx.showLoading({title: '载入中...', mask: true });
    shopApi.commodity(token, comid).then(res => {
      if (res.data.status == true) {
        //积分加换算 
        const points = (res.data.data.goods_price + res.data.data.goods_points);
        
        that.setData({
          commodity_data: res.data.data,
          points: points,
          nopoint: this.skusFormat(res.data.data.skus.nopoint),
          point: this.skusFormat(res.data.data.skus.point),
          goodsnum: res.data.data.goods_num,
          user_name: res.data.data.user_name,
          isfav: res.data.data.isfav,
          modelid: res.data.data.model_id
        });
        
        //初始化 评论数据
        that.comment();
        
        if (that.data.isShowSpec) {
          that.showIntegralSkuModel();
        };
      }
      
      wx.hideLoading();
      WxParse.wxParse('content', 'html', res.data.data.goods_desc, this, 0);

    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 添加购物车
   */
  addCart() {

    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '品兑：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return false;
    };

    if (this.data.num > this.data.skuGoodsNum) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return false;
    }

    this.setData({ addCartBtnState: true });
    shopApi.goodcard(this.data.token, this.data.skuId, this.data.num).then(res => {
      this.setData({ addCartBtnState: false });

      if (res.data.status == true) {
        this.setData({ ishoswhide: false});
        wx.showToast({
          title: '添加购物车成功',
          icon: 'none',
          duration: 1500
        });
        return false;
      }
    }).catch(err => {
      console.error(err);
    })

  },
  /**
   * 点击-立即购买
   */
  gobuy: function () {
    const that = this;
    const token = that.data.token;
    const goodsinfo = that.data.skuId + ':' + that.data.num;

    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '提示：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return false;
    }
    if (that.data.num > that.data.skuGoodsNum) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return false;
    }

    shopApi.goodgobuy(token, goodsinfo).then(res => {
      this.setData({ ishoswhide: false });
      
      if (res.data.status == true) {
        wx.navigateTo({
          url: '/pages/Checkout/Checkout?ids=' + that.data.skuId + ':' + that.data.num
        });
      }
    }).catch(err => {
      console.error(err);
    })

  },
  //评论列表
  comment: function () {
    const that = this;
    const page = 1;
    const pagesize = 2;
    const id = that.data.modelid;
    const geval_scores = '0';
    const token = that.data.token;

    shopApi.comment(page, pagesize, id, geval_scores,token).then(res => {
      
      if (res.data.status === true && res.data.data.goodsList.length >= 1) {
        const General = res.data.data.goodsList.length;

        for (let i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].geval_image = res.data.data.goodsList[i].geval_image.split(',');
        }

        that.setData({
          goodsList: res.data.data.goodsList,
          goodst: res.data.data,
          General: General
        })
      }
    }).catch(err => {
      console.error(err);
    })
  },
  // 查看全部评论
  Goall: function () {
    const that = this;
    wx.navigateTo({
      url: `/pages/Allcomments/Allcomments?modelid=${that.data.commodity_data.model_id}`,
    })
  },
  // 拨打电话号码
  makePhone: function () {
    const that = this;

    wx.makePhoneCall({
      phoneNumber: that.data.user_name
    })

  },
  /**
   * 点击-关注商品
   */
  follow: function (e) {
    const that = this;
    
    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '提示：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return false;
    }

    shopApi.Collection(that.data.token, e.currentTarget.dataset.modelid).then(res => {

      if (res.data.status == true) {
        that.setData({
          ['commodity_data.isfav']: this.data.commodity_data.isfav === 1? 0 : 1
        });
      };

      wx.showToast({
        title: res.data.msg,
        icon: 'none',
        duration: 2000
      });
    }).catch(err => {
      console.error(err)
    })
  },
  // 进入店铺
  go_shop: function (e) {
    wx.navigateTo({
      url: `/pages/ShopBusiness/ShopBusiness?storeId=${e.currentTarget.dataset.storeid}`,
    })
  },
  //进入购物车 
  to_shGwc: function () {
    wx.navigateTo({
      url: '/pages/Cart/Cart'
    })
  },

  /**
   * 格式 suks 参数
   * @param {Array} arr 
   */
  skusFormat(arr){
    let skus = JSON.parse(JSON.stringify(arr));
    let formatSkus = [];


    for (let i = 0; i < skus.length; i++) {
      let obj = [];
      for (let j = 0; j < skus[i].attributes.length; j++) {
        const attributes = skus[i].attributes[j];
        obj.push({ 'key': attributes.key, valArr: [], index: 0, type: j & 1 === 1 ? 'val' : 'key' });

        for (let s = 0; s < skus.length; s++) {
          const skuItem = skus[s];
          if (attributes.key == skuItem.attributes[j].key){
            let obj2 = JSON.parse(JSON.stringify(skuItem));
            obj2.key = skuItem.attributes[j].value;
            
            delete obj2.attributes;
            obj[j].valArr.push(obj2);
          };
        };
        
        obj[j].valArr = unique(obj[j].valArr, 'key');
      };

      if (skus[i].attributes[0].key !== obj[0].key || formatSkus.length < 1){
        formatSkus.push(obj);
      };

    };
    
    return formatSkus;
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.commodity_data.goods_title,
      path: `/pages/Commoditydetails/Commoditydetails?goodsId=${this.data.goodsId}&member_id=${wx.getStorageSync('member_id')}`
    }
  },
  /**
 * 监听页面滚动事件
 */
  bindscroll (e) {

    /** 返回商城首页 侧边显示 */
    if (!this.data.isShowToShop){
      this.setData({
        isShowToShop: true
      })
    };

    clearInterval(timeInter);
    timeInter = setTimeout(() => {
      this.setData({
        isShowToShop: false
      });
    }, 2000);

    /** 头部导航 */
    if (e.detail.scrollTop >= 100) {
      if (this.data.isShowTopNav) return;
      this.setData({
        isShowTopNav: true
      });
    } else {
      if (!this.data.isShowTopNav) return;

      this.setData({
        isShowTopNav: false
      });
    };

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
  // 评论预览图片
  tapPreviewImage(e) {
    const that=this;
    const images = e.currentTarget.dataset.images;
    
    let arry_images='';
    // 去数组空的变量  拼接在一起 
    for (let i = 0;i<images.length;i++){ 
      if (images[i]!==''){
        arry_images+='https://img.lion-mall.com/'+images[i]+',';
      }
    }
//切割成数组
    var srcdete= arry_images.split(",")
    that.previewImage( e.currentTarget.dataset.src, srcdete);
  },
  // banner 点击预览图片
  tapSwiperPreviewImage(e) {
    this.previewImage(e.currentTarget.dataset.img, this.data.commodity_data.goods_album);
  },
  /**猜你喜欢 数据初始化 */
  ApplicationProgress: function () {
    const that = this;
    const token = wx.getStorageSync('token');
    const orderid = that.data.modelid || 15317301789617510000;
    

    shopApi.ApplicationProgress(token, orderid).then(res => {
      let guesslike = res.data.data.guesslike;

      for (let i = 0; i < guesslike.length; i++) {
        res.data.data.guesslike[i].zong_price = res.data.data.guesslike[i].goods_price + res.data.data.guesslike[i].goods_points;
      }

      that.setData({
        buzhouData: res.data.data.buzhou,
        guesslikeData: res.data.data.guesslike,
      })

    }).catch(err => {
      console.log(err)
    })

  }, 

  //点击跳转对应商品
  go_gwc: function (e) {
    const that = this;
    const goodsId = e.currentTarget.dataset.goodsid;

    wx.navigateTo({
      url: `/pages/Commoditydetails/Commoditydetails?goodsId=${goodsId}`,
    })

  },
  // 点击进入购物车
  show_true: function (e) {
    const that = this;
    const goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: `/pages/Commoditydetails/Commoditydetails?goodsId=${goodsId}&isShowSpec=${true}`,
    })
  },
  /**
   * 点击打开会话
   */
  clickIm(e){

    if (wx.getStorageSync('token') === '') {
      wx.showModal({
        title: '品兑：您未登录，是否去登录？',
        cancelText: '算了',
        cancelColor: '#cccccc',
        confirmText: '去登录',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
            wx.setStorageSync('cancelBangding', true);
          };
        }
      });
      return false;
    };

    const userInfo = wx.getStorageSync('userInfo');

    const param = {
      user: {
        name: userInfo.member_mobile,
        avatarUrl: userInfo.avatarUrl
      },
      receiveUser: {
          name: this.data.commodity_data.contacts_phone,
          avatarUrl: this.data.commodity_data.store_logo,
          nickName: this.data.commodity_data.store_name
      },
      sourceType: 8,
      messageType: 1,
      id: this.data.goodsId
    };

    wx.navigateTo({
      url: `/pages/ImDialog/ImDialog?url=https://sp.lion-mall.com/wap6.0/webim/dialog&param=${this.urlJsonEncode(param)}&title=${this.data.commodity_data.store_name}`
    });
  },
  urlJsonEncode(json){
    return encodeURIComponent(JSON.stringify(json));
  }
})