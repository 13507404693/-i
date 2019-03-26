// pages/Business/Business.js
const {
  api,
  wxApi,
  shopApi
} = require('../../server/index');

const {
  filterHtml,
  showSuccessToast,
  unique
} = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorArr: ['商品', '评论', '商家'],
    swiperCurrent: 0,
    swiperLine: 94,
    inePositon: [94, 344, 594],
    slideToggleState: false,
    details: {},
    goodsDetails: {},
    goodsList: [],
    isShowFullLoading: true,
    isShowSwipreLoading: false,
    comment: [],
    commentPage: 1,
    goodsPage: 1,
    isShowTopIndicator: false,
    commentScore: {},
    commentTotal: 0,
    commentType: '',
    classifyData: [],
    isClassifyTop: false,
    isMask: false,
    isCartShowList: false,
    goodsDetailsPopup: false,
    specPopup: false,
    classifyScroll: true,
    classifyScrollId: '',
    classifyIndex: 0,
    recommendGoodsData: [],
    cart: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = wx.getStorageSync('token');
    options.id = options.id ? options.id : decodeURIComponent(options.scene);

    this.setData({
      id: options.id,
      systemInfo: wx.getSystemInfoSync()
    });

    Promise.all([
      api.getBusinessDetails(options.id, token),
      api.getStoreGoodsAndClassify(options.id)
    ]).then(res => {
      let options = {
        isShowFullLoading: false
      };

      if (res[0].data.status) {
        options.details = this.transformBusinessInfo(res[0].data.data);
      };

      if (res[1].data.status) {
        options.classifyGoodsData = res[1].data.data.cat;
        options.recommendGoodsData = [...this.getRecommendGoods('multiSelector', res[1].data.data.cat), ...this.getRecommendGoods('selector', res[1].data.data.nocat)];

        if (options.classifyGoodsData.length >= 1 || res[1].data.data.nocat.length >= 1) {
          options.classifyGoodsData.push({
            store_category_id: 147258369,
            store_category_name: options.classifyGoodsData.length >= 1 ? '其他' : '全部',
            goods: res[1].data.data.nocat
          });
        };

      };

      if (this.checkLogin()) {
        const {
          member_mobile
        } = wx.getStorageSync('userInfo');
        const userCart = wx.getStorageSync(`userCart_${member_mobile}`);

        if (userCart === '') {
          wx.setStorageSync(`userCart_${member_mobile}`, {});
        } else {
          options.cart = userCart[`business_${this.data.id}`] || [];
          options.cartSize = this.countCartSize(options.cart);
          options.cartTotalPrice = this.countCartTotalPrice(options.cart);
        };

      };

      this.setData(options, () => this.initIntersectionObserver());

    }).catch(err => console.error(err));

  },
  /**
   * 获取推荐商品
   */
  getRecommendGoods(range, data) {
    if (Object.prototype.toString.call(data) !== "[object Array]") return;

    if (range === 'selector') {
      let arr = [];
      data.forEach(item => {
        if (item.is_store_recommend == 1) {
          item.org_price = Number(item.goods_market_price) + Number(item.goods_price);
          arr.push(item);
        };
      });
      return arr;
    };

    if (range === 'multiSelector') {
      let arr = [];
      data.forEach(item => {
        item.goods.forEach(item2 => {
          item2.org_price = Number(item2.goods_market_price) + Number(item2.goods_price);
          arr.push(item2);
        })
      });
      return arr;
    };
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      commentType: '',
      comment: [],
      commentPage: 1
    });

    this.getComment();
  },
  /**
   * 点击切换按钮
   */
  tapIndicator(e) {
    const linePositon = this.data.inePositon;
    let index = e.target.dataset.index;

    this.setData({
      swiperLine: linePositon[index],
      swiperCurrent: index
    });

    if (index === 1 && this.data.comment.length < 1) {
      this.getComment();
    };

  },
  /**
   * 初始化-监听节点相交状态变化
   */
  initIntersectionObserver() {
    wx.createIntersectionObserver(this, {
        thresholds: [0.999]
      }).relativeToViewport()
      .observe('#swiperIndicator', observeRes => {
        this.setData({
          isShowTopIndicator: observeRes.intersectionRatio <= 0.999
        });
      });

    wx.createIntersectionObserver(this, {
      observeAll: true
    }).relativeTo('.classify-scroll').observe('.classify-goods-item', observeRes => {
      if (observeRes.intersectionRatio > 0) {
        this.setData({
          classifyIndex: observeRes.dataset.index
        });
      };
    });

    wx.createSelectorQuery()
      .selectAll('.swiper-indicator,.footer-cart')
      .boundingClientRect()
      .exec(res => {
        let screenHeight = this.data.systemInfo.screenHeight - (this.data.systemInfo.statusBarHeight + 44);
        if(this.data.details.pay_online == 1){
          let viewH = res[0][0].height + res[0][1].height - 6;
          screenHeight = screenHeight - viewH;
        };

        this.setData({
          classifyScrollHeight: screenHeight
        });
      });

    wx.createIntersectionObserver(this).relativeToViewport()
    .observe('.title', observeRes => {
      if(observeRes.intersectionRatio >  0){
        wx.setNavigationBarTitle({title: '店铺详情'});
      }else{
        wx.setNavigationBarTitle({title: this.data.details.store_name});
      }
    });

  },
  /**
   *展开收缩标签内容 
   */
  slideToggle(e) {
    this.setData({
      slideToggleState: !this.data.slideToggleState
    });
  },
  /**
   * 商家详情数据 转型
   */
  transformBusinessInfo(info) {
    // 商家环境图
    if (info.store_environment !== '') info.store_environment = info.store_environment.split(';');
    // 商家描述
    if (info.store_description !== null) info.store_description = filterHtml(info.store_description);

    return info;
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const index = this.data.swiperCurrent;

    if (index === 1) {
      this.setData({
        commentPage: ++this.data.commentPage
      });
      this.getComment();
    };

    // if (index === 0){
    //   this.setData({
    //     goodsPage: ++this.data.goodsPage
    //   });
    //   this.getGoodsList();
    // }
  },
  /**
   * 获取评论
   */
  getComment() {
    const token = wx.getStorageSync('token');
    this.setData({
      isShowSwipreLoading: true
    });

    api.getBusinessComment(this.data.id, this.data.commentPage, 5, this.data.commentType, token).then(res => {
      let data = {};
      if (res.data.status) {
        let arr = res.data.data.page_data;

        arr.forEach(item => {
          // 多张图片图片的情况则需要分割
          if (typeof item.seval_img === 'string' && item.seval_img !== '') {
            item.seval_img = item.seval_img.split(';');
          };
        });

        data = {
          comment: this.data.comment.concat(arr),
        };

        if (this.data.commentType === '') {
          Object.assign(data, {
            commentScore: res.data.data.comment_score || {},
            commentTotal: parseInt(res.data.data.comment_score.high) + parseInt(res.data.data.comment_score.low)
          });
        };

      }

      this.setData(Object.assign(data, {
        isShowSwipreLoading: false
      }));
    }).catch(err => console.error(err));
  },
  /**
   * 获取商品列表 
   */
  getGoodsList() {
    this.setData({
      isShowSwipreLoading: true
    });
    api.getBusinessGoods(this.data.id, this.data.goodsPage, 5).then(res => {

      if (res.data.status && res.data.data.goodsList !== undefined && res.data.data.goodsList.length >= 1) {
        this.setData({
          goodsList: this.data.goodsList.concat(res.data.data.goodsList),
          isShowSwipreLoading: false
        });
      } else {
        this.setData({
          isShowSwipreLoading: false
        });
      }
    }).catch(err => console.error(err));
  },
  /**
   * 预览评论图片
   */
  previewCommentImage(e) {
    let imgArr = [];

    this.data.comment.forEach(item => {
      if (Object.prototype.toString.call(item.seval_img) === "[object Array]") {
        item.seval_img.forEach(img => {
          imgArr.push(`http://img.lion-mall.com/${img}`);
        });
      } else {
        imgArr.push(`http://img.lion-mall.com/${item.seval_img}`);
      }
    });

    this.previewImage(e.currentTarget.dataset.img, imgArr);
  },
  /**
   * 预览环境图
   */
  previewEnvironmentImage(e) {
    let imgArr = [];

    this.data.details.store_environment.forEach(item => {
      imgArr.push(`http://img.lion-mall.com/${item}`);
    });

    this.previewImage(e.currentTarget.dataset.img, imgArr);
  },
  /**
   * 预览营业资质图
   */
  previewAptitudeImage(e) {
    const d = this.data.details;
    let arr = [];

    if (d.store_licence !== '') {
      arr.push(d.store_licence);
    };
    if (d.store_tax !== '') {
      arr.push(d.store_tax);
    }
    if (d.store_institutions !== '') {
      arr.push(d.store_institutions);
    };

    this.previewImage(e.currentTarget.dataset.img, arr);
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
  },
  /**
   * 监听页面滚动事件
   */
  onPageScroll(e) {
    this.setData({
      isClassifyTop: false,
    });
  },
  /**
   * 点击按钮--筛选评论 
   */
  tapComment(e) {
    this.setData({
      commentType: e.target.dataset.type || '',
      comment: [],
      commentPage: 1
    });

    this.getComment();
  },
  /**
   * 点击 拨打电话
   */
  tapDialTelephone(e) {
    wxApi.makePhoneCall(e.target.dataset.phone);
  },
  /**
   * 点击发表评论
   */
  tapNavigateTo(e) {
    if (!this.checkLogin()) return;

    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });
  },
  /**
   * 点击跳转评论
   */
  tapCommentNavigateTo(e) {
    const unionid = wx.getStorageSync('userInfo').unionId;

    if (typeof unionid !== 'string' || unionid.length <= 1) {
      wx.showModal({
        title: '未获得您用户授权，无法为您提供评论服务',
        cancelText: '放弃评论',
        cancelColor: '#ccc',
        confirmText: '立即授权',
        confirmColor: '#4395FF',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/my/my',
            });
          };
        }
      });
      return false;
    }
    wx.showLoading({
      title: '载入中...'
    });

    api.publishBusinessComment(unionid, this.data.id).then(res => {
      wx.hideLoading();


      if (res.data.data.code == -90) {
        wx.showToast({
          title: '提示：没有在该商家消费，不能评论哦。',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.navigateTo({
          url: e.currentTarget.dataset.url,
        });
      };
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: this.data.details.store_name,
      path: `pages/Business/Business?id=${this.data.id}`,
      imageUrl: this.data.details.store_heard
    }
  },
  //点赞
  dianzan(e) {
    if (!this.checkLogin()) return;

    const that = this;
    const token = wx.getStorageSync('token');
    const index = e.currentTarget.dataset.index;
    const message = that.data.comment;

    for (let i in message) {

      if (index == i) {

        that.data.comment[i].iszan = 1;
        //累加

        let zannum = parseInt(that.data.comment[i].zannum);
        let geval_id = that.data.comment[i].seval_id;

        shopApi.dianzan(geval_id, token).then(res => {
          if (res.data.status == false) {
            wx.showToast({
              title: '你已点过赞了',
              icon: 'none'
            })
            return false;
          }

          zannum = zannum + 1
          that.data.comment[i].zannum = zannum;

          that.setData({
            comment: that.data.comment
          });

        }).catch(err => {
          console.log(err)
        })

      }
    }
  },
  /**
   * 点击打开会话
   */
  clickIm(e) {

    if (!this.checkLogin()) return;

    const userInfo = wx.getStorageSync('userInfo');

    if (e.currentTarget.dataset.receiveuser.is_blacklist == 1) {
      showSuccessToast('该评论用户已经被加入黑名单～', '');
      return;
    };

    if (e.currentTarget.dataset.receiveuser.member_mobile.length < 11) {
      showSuccessToast('该评论用户已经被删除～', '');
      return;
    };

    if (e.currentTarget.dataset.receiveuser.member_mobile == userInfo.member_mobile) {
      showSuccessToast('该评论为您发表的，不支持会话咨询', '');
      return;
    };

    const param = {
      user: {
        name: userInfo.member_mobile,
        avatarUrl: userInfo.avatarUrl
      },
      receiveUser: {
        name: e.currentTarget.dataset.receiveuser.member_mobile,
        avatarUrl: e.currentTarget.dataset.receiveuser.member_avatar,
        nickName: e.currentTarget.dataset.receiveuser.seval_membername
      },
      sourceType: 7,
      messageType: 0,
      id: e.currentTarget.dataset.receiveuser.seval_id
    };

    wx.navigateTo({
      url: `/pages/ImDialog/ImDialog?url=https://sp.lion-mall.com/wap6.0/webim/dialog&param=${this.urlJsonEncode(param)}&title=${e.currentTarget.dataset.receiveuser.seval_membername}`
    });
  },
  urlJsonEncode(json) {
    return encodeURIComponent(JSON.stringify(json));
  },
  /**
   * 点击-切换购物车列表
   */
  tapCutCartList() {
    if (this.data.cartSize >= 1) {
      this.setData({
        isCartShowList: !this.data.isCartShowList,
        isMask: !this.data.isMask
      });
    };
  },
  /**
   * 点击-弹窗遮罩
   */
  tapMask() {
    this.setData({
      isCartShowList: false,
      isMask: false,
      goodsDetailsPopup: false,
      specPopup: false
    });
  },
  /**
   * 点击-分类列表
   */
  tapClassify(e) {
    wx.pageScrollTo({
      scrollTop: 1000,
      duration: 0
    });
    console.log(this.data.dataclassifyIndex)
    this.setData({
      isClassifyTop: true,
      classifyIndex: e.currentTarget.dataset.index
    },() => {  
      this.setData({
        classifyScrollId: `classify${e.currentTarget.dataset.id}`
      });
    });

  },
  /**
   * 监听-滚动分类商品
   */
  onClassifyScroll(e) {
    wx.pageScrollTo({
      scrollTop: 1000,
      duration: 0
    });

    if (e.detail.scrollTop > 0) {
      this.setData({
        isClassifyTop: true,
        isShowTopIndicator: true
      });
    }

  },
  /**
   * 点击-切换商品详情弹窗
   */
  tapCutGoodsDetailsPopup(e) {
    if (!this.data.goodsDetailsPopup) {
      this.getGoodsDetails(e.currentTarget.dataset.goodsid, 'goodsDetailsPopup');
      return;
    };

    this.setData({
      goodsDetailsPopup: !this.data.goodsDetailsPopup,
      isMask: !this.data.isMask
    });

  },
  /**
   * 获取 商品详情
   */
  getGoodsDetails(id, key) {
    if (this.data.goodsDetails.model_id == id) {
      this.setData({
        [key]: true,
        isMask: true
      });
      return;
    };

    wx.showLoading({
      title: '载入中...',
      mask: true
    });
    api.getStoreGoodsDetails(id).then(res => {
      wx.hideLoading();

      if (res.data.status) {
        let data = res.data.data;
        data.goods_desc = filterHtml(data.goods_desc || '');
        data.trait.forEach(item => item.index = 0);

        this.setData({
          goodsDetails: data,
          skusList: this.skusFormat(data.skus.nopoint),
          trait: data.trait
        }, () => {
          let sku = this.getSelectSku();
          sku.org_price = Number(sku.goods_price) + Number(sku.goods_points);

          this.setData({
            isMask: true,
            [key]: true,
            selectSku: sku
          })
        });

        return;
      };

      showSuccessToast(res.data.msg, '');
    }).catch(err => {
      console.error(err);
    });
  },

  /**
   * 格式 suks 参数
   * @param {Array} arr 
   */
  skusFormat(arr) {
    let skus = JSON.parse(JSON.stringify(arr));
    let formatSkus = [];


    for (let i = 0; i < skus.length; i++) {
      let obj = [];
      for (let j = 0; j < skus[i].attributes.length; j++) {
        const attributes = skus[i].attributes[j];
        obj.push({
          'key': attributes.key,
          valArr: [],
          index: 0,
          type: j & 1 === 1 ? 'val' : 'key'
        });

        for (let s = 0; s < skus.length; s++) {
          const skuItem = skus[s];
          if (attributes.key == skuItem.attributes[j].key) {
            let obj2 = JSON.parse(JSON.stringify(skuItem));
            obj2.key = skuItem.attributes[j].value;

            delete obj2.attributes;
            obj[j].valArr.push(obj2);
          };
        };

        obj[j].valArr = unique(obj[j].valArr, 'key');
      };

      if (skus[i].attributes[0].key !== obj[0].key || formatSkus.length < 1) {
        formatSkus = obj;
      };

    };

    return formatSkus;
  },
  /**
   * 获取 选中的sku
   */
  getSelectSku() {
    let {
      skusList,
      goodsDetails
    } = this.data;
    if (typeof skusList !== 'object') return;
    let sku = {};

    goodsDetails.skus.nopoint.forEach(skuItem => {
      skusList.forEach((skuItem2, index2) => {
        if (skuItem.attributes[index2].key == skuItem2.key && skuItem2.valArr[skuItem2.index].key == skuItem.attributes[index2].value && skuItem2.valArr[skuItem2.index].model_id == skuItem.model_id) {
          sku = skuItem;
        };
      });
    });

    return sku;
  },
  /**
   * 点击-切换商品 sku 弹窗
   */
  tapCutspecPopup(e) {
    if (!this.data.specPopup) {
      this.getGoodsDetails(e.currentTarget.dataset.goodsid, 'specPopup');
      return;
    };

    this.setData({
      specPopup: !this.data.specPopup,
      isMask: !this.data.isMask
    });
  },
  /**
   * 点击-选择sku
   */
  tapSelectSku(e) {
    const {
      keyindex,
      valindex
    } = e.currentTarget.dataset;

    this.setData({
      [`skusList[${keyindex}].index`]: valindex
    }, () => {
      let sku = this.getSelectSku();
      sku.org_price = Number(sku.goods_price) + Number(sku.goods_points);

      this.setData({
        selectSku: sku
      })
    });
  },
  /**
   * 点击-选择特点
   */
  tapSelectTrait(e) {
    const {
      keyindex,
      valindex
    } = e.currentTarget.dataset;
    this.setData({
      [`trait[${keyindex}].index`]: valindex
    });
  },
  /**
   * 点击-提交 sku 
   */
  tapSubmitSku() {
    if (!this.checkLogin()) return;

    const {
      selectSku,
      cart,
      goodsDetails
    } = this.data;

    let cartOpt = JSON.parse(JSON.stringify(cart));
    let trait = [];
    let cartSkuIndex = '';

    this.data.trait.forEach(item => trait.push(item.value[item.index]));

    cart.forEach((item, index) => {
      if (item.goodsId == selectSku.goods_id && item.trait.join(',') == trait.join(',')) {
        cartSkuIndex = index;
      };
    });

    // 判断 sku 是否已经存在
    if (typeof cartSkuIndex === 'number') {
      let num = ++cartOpt[cartSkuIndex].amount;
      cartOpt[cartSkuIndex].amount = num;
      cartOpt[cartSkuIndex].totalPrice = num * Number(cartOpt[cartSkuIndex].unitPrice);
    } else {
      cartOpt.push({
        amount: 1,
        totalPrice: selectSku.goods_price,
        unitPrice: selectSku.goods_price,
        goodsId: selectSku.model_id,
        title: goodsDetails.goods_title,
        goodsImg: goodsDetails.goods_image,
        skuInfo: selectSku,
        trait: trait
      });
    };

    this.setData({
      cart: cartOpt,
      cartSize: this.countCartSize(cartOpt),
      cartTotalPrice: this.countCartTotalPrice(cartOpt),
      specPopup: false,
      isMask: false,
      cartBtnAmin: true
    }, () => {
      setTimeout(() => {
        this.setData({
          cartBtnAmin: false
        });
      }, 800)
    });

    this.updateCartStorageSync();
  },
  /**
   * 点击-添加购物车
   */
  tapAddCart(e) {
    const {
      id,
      index
    } = e.currentTarget.dataset;
    const cart = this.data.cart[index];
    let num = ++cart.amount;

    this.setData({
      [`cart[${index}].amount`]: num,
      [`cart[${index}].totalPrice`]: num * Number(cart.unitPrice),
      cartSize: this.countCartSize(this.data.cart),
      cartBtnAmin: true
    }, () => {
      setTimeout(() => {
        this.setData({
          cartBtnAmin: false,
          cartTotalPrice: this.countCartTotalPrice(this.data.cart)
        });
      }, 800)
    });

    this.updateCartStorageSync();
  },
  /**
   * 点击-减少购物车
   */
  tapReduceCart(e) {
    let cart = JSON.parse(JSON.stringify(this.data.cart));
    const {
      id,
      index
    } = e.currentTarget.dataset;
    const sku = cart[index];
    let num = --sku.amount;

    if (num < 1) {
      cart.splice(index, 1);
      let is = cart.length < 1;

      this.setData({
        cart: cart,
        cartSize: this.countCartSize(cart),
        isCartShowList: !is,
        isMask: !is
      }, () => this.setData({
        cartTotalPrice: this.countCartTotalPrice(this.data.cart)
      }));
    } else {
      this.setData({
        [`cart[${index}].amount`]: num,
        [`cart[${index}].totalPrice`]: num * Number(sku.unitPrice),
        cartSize: this.countCartSize(cart)
      }, () => this.setData({
        cartTotalPrice: this.countCartTotalPrice(this.data.cart)
      }));
    };

    this.updateCartStorageSync();
  },
  /**
   * 点击-清空购物车
   */
  tapEmptyCart() {
    this.setData({
      cart: [],
      cartSize: 0,
      cartTotalPrice: '0.00',
      isCartShowList: false,
      isMask: false
    });
    this.updateCartStorageSync();
  },
  /**
   * 更新缓存购物车
   */
  updateCartStorageSync() {
    const {
      member_mobile
    } = wx.getStorageSync('userInfo');
    const key = `userCart_${member_mobile}`;
    let userCart = wx.getStorageSync(key);

    userCart[`business_${this.data.id}`] = this.data.cart;
    wx.setStorageSync(key, userCart);
  },
  /**
   * 计算购物车数量
   */
  countCartSize(obj) {
    let num = 0;
    for (const key in obj) {
      num += obj[key].amount;
    }
    return num;
  },
  /**
   * 计算购物车总价
   */
  countCartTotalPrice(obj) {
    let num = 0;
    for (const key in obj) {
      num += obj[key].totalPrice;
    }
    return num.toFixed(2);
  },
  submitCart() {
    wx.navigateTo({
      url: `/pages/BusinessCheckout/BusinessCheckout?cart=${JSON.stringify(this.data.cart)}&store=${JSON.stringify(this.data.details)}&totalPrice=${this.data.cartTotalPrice}`
    });
  },
  /**
   * 点击-跳转分享
   */
  tapGoShare() {
    const {
      store_logo,
      store_heard,
      store_name,
      store_tag,
      haoping,
      renjun,
      store_id
    } = this.data.details;

    wx.navigateTo({
      url: `/pages/ShareBusiness/ShareBusiness?storeId=${store_id}&head=${store_heard||store_logo}&name=${store_name}&price=${haoping||0}&commentNum=${renjun||0}&tag=${store_tag||'寂静小店,环境别致,摆渡众生'}`
    });
  },
  /**
   * 检查 是否 登录
   */
  checkLogin() {
    const token = wx.getStorageSync('token');

    if (token === '' || typeof token !== 'string' || token.length < 1) {
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

    return true
  }

})