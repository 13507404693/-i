// pages/Cart/Cart.js
const { api, shopApi } = require('../../server/index');
const { showSuccessToast, showErrorToast } = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpenEdit: false,
    isLogin: false,
    token: '',
    canuse: [1],
    nouse: [1],
    allCheck: false,
    countGoodsLength: 0,
    checkGoods: [],
    totalPrice: '0.00',
    isShowLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const token = wx.getStorageSync('token');
    
    if (typeof token !== 'string' || token.length < 1) {
      this.setData({
        isLogin: false
      });
      return;
    };

    this.setData({ isLogin: true, token: token});
    this.getCart();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide(){
    if (this.data.isLogin) {
      this.updatedStorageCheckGoods();
    };
    this.setData({
      isOpenEdit: false
    });
  },
  /**
   * 点击编辑
   */
  tapEdit(){
    this.setData({
      isOpenEdit: !this.data.isOpenEdit
    });
  },
  /**
   * 获取 购物车 商品
   */
  getCart(){
    this.setData({ isShowLoading: true });
    
    shopApi.getCartByToken(this.data.token).then(res => {
      this.setData({ isShowLoading: false });
      wx.stopPullDownRefresh();
      
      if (!res.data.status){
        this.setData({
          canuse: [],
          nouse: [],
        });
        return;
      };

      const canuse = res.data.data.canuse;
      const checkGoodsIds = wx.getStorageSync('checkGoodsIds') || [];
      let canuseArr = [];
      let goodsLengthNum = 0;

      // 加入 是否选中状态
      for (let i = 0; i < canuse.length; i++) {
        const canuseItem = canuse[i];
        canuseItem.isCheck = false;
        goodsLengthNum += canuseItem.list.length;
        
        for (let j = 0; j < canuseItem.list.length; j++) {
          const goodsItem = canuseItem.list[j];
          goodsItem.isCheck = false;
          goodsItem.isDisabled = goodsItem.goods_num <= 1 ? true : false;

          // 从缓存取出是否有 选中的商品，如果有 默认就是选中
          for (let s = 0; s < checkGoodsIds.length; s++) {
            const goodsId = checkGoodsIds[s];
            
            if (goodsItem.goods_id === goodsId){
              canuseItem.isCheck = true;
              goodsItem.isCheck = true;
            };
          }
        };
        canuseArr.push(canuseItem);
      };

      this.setData({
        canuse: canuseArr,
        nouse: res.data.data.nouse,
        countGoodsLength: goodsLengthNum
      });

      this.setData({
        checkGoods: this.getCheckGoods()
      });

      this.countTotalPrice();
    }).catch(err => console.error(err));
  },
  /**
   * 点击 选中 店铺 或 商品
   */
  tapCheck(e){
    const dataset = e.currentTarget.dataset;
    let countGoodsCheck = 0;
    let checkGoods = [];
    
    for (let j = 0; j < this.data.canuse.length; j++) {
      const storeItem = this.data.canuse[j];

      // 选中当前店铺
      if (storeItem.store_id === dataset.storeid) {
        this.setData({
          [`canuse[${j}].isCheck`]: !this.data.canuse[j].isCheck
        });
      };

      for (let s = 0; s < storeItem.list.length; s++) {
        const goodsItem = storeItem.list[s];
        
        // 如果 店铺选中 就把 当前店铺下的 商品全部选中
        if (dataset.checktype === 'store') {
          this.setData({
            [`canuse[${j}].list[${s}].isCheck`]: this.data.canuse[j].isCheck ? true : false
          });
        };
        
        if (dataset.checktype === 'goods') {
          let storeIsCheck = this.data.canuse[j].list[s].isCheck && false;
          
          // 选中 当前商品，如果店铺下的商品 都没 选中就把店铺也 取消选中。
          if (goodsItem.goods_id == dataset.goodsid) {
            storeIsCheck = this.data.canuse[j].list[s].isCheck;
            
            this.setData({
              [`canuse[${j}].list[${s}].isCheck`]: !this.data.canuse[j].list[s].isCheck,
              [`canuse[${j}].isCheck`]: !storeIsCheck
            });
            
          };

        };

        // 统计 是否所有商品都选中，、如果是 就把 全选 也选中
        countGoodsCheck += this.data.canuse[j].list[s].isCheck ? 1 : 0;
        let isAllCheck = false;

        if (countGoodsCheck === this.data.countGoodsLength) {
          isAllCheck = true;
        };
        
        // 将 选中的商品 存放在 data
        this.setData({
          allCheck: isAllCheck,
          checkGoods: this.getCheckGoods()
        });

      };

    };

    this.countTotalPrice();
  },
  /**
   * 点击 全选
   */
  tapAllCheck(){
    let checkGoods = [];

    this.setData({
      allCheck: !this.data.allCheck
    });

    for (let j = 0; j < this.data.canuse.length; j++) {
      const storeItem = this.data.canuse[j];
      
      for (let i = 0; i < storeItem.list.length; i++) {
        this.setData({
          [`canuse[${j}].list[${i}].isCheck`]: this.data.allCheck ? true : false,
          [`canuse[${j}].isCheck`]: this.data.allCheck ? true : false
        });

        this.setData({
          checkGoods: this.getCheckGoods()
        });

      };
    };

    this.countTotalPrice();
  },
  /**
   * 点击 删除选中的商品
   */
  tapDeleteGoods(){
    let ids = [];
    const checkGoods = this.getCheckGoods();
    
    for (let i = 0; i < checkGoods.length; i++) {
      const goodsItem = checkGoods[i];
      ids.push(goodsItem.goods_id);
    };

    if (ids.length < 1){
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none',
        duration: 600
      });

      return;
    };
    
    wx.showModal({
      title: '删除',
      content: `确认将已选中的${ids.length}件商品删除吗？`,
      success: (res) => {
        if (res.confirm) {
          this.setData({ isShowLoading: true });
          shopApi.delCartGoodsByGoodsId(this.data.token, ids.join(',') ).then(res => {
            this.setData({ isShowLoading: false });

            if (res.data.status) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              wx.setStorageSync('checkGoodsIds',[]);
              this.getCart();
              return;
            };

            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1000
            });

          }).catch(err => console.error(err));

        };
      }
    });
    
    this.countTotalPrice();
  },
  /**
   * 计算 选中商品 价格
   */
  countTotalPrice(){
    let totalPrice = 0;
    const checkGoods = this.getCheckGoods();

    for (let index = 0; index < checkGoods.length; index++) {
      const goodsItem = checkGoods[index];
      totalPrice += Number(goodsItem.goods_price * 100) * Number(goodsItem.goods_num);
    };

    this.setData({
      totalPrice: (totalPrice / 100).toFixed(2)
    });

  },
  /**
   * 找出 选中的商品
   */
  getCheckGoods(){
    let arr = [];
    for (let i = 0; i < this.data.canuse.length; i++) {
      const storeItem = this.data.canuse[i];
      
      if (Object.prototype.toString.call([]) !== "[object Array]") return [];

      for (let j = 0; j < storeItem.list.length; j++) {
        const goodsItem = storeItem.list[j];
        if (this.data.canuse[i].list[j].isCheck) {
          arr.push(this.data.canuse[i].list[j]);
        };
      };
    };

    return arr;
  },
  /**
   * 减少 商品
   */
  reduceGoodsNum(e){
    const dataset = e.currentTarget.dataset;
    const goodsItem = this.data.canuse[dataset.storeindex].list[dataset.goodsindex];

    this.changeGoodsNum(goodsItem.goods_id, -1, dataset.storeindex, dataset.goodsindex, goodsItem.goods_num);
  },
  /**
   * 添加 商品
   */
  addGoodsNum(e){
    const dataset = e.currentTarget.dataset;
    const goodsItem = this.data.canuse[dataset.storeindex].list[dataset.goodsindex];

    this.changeGoodsNum(goodsItem.goods_id, 1, dataset.storeindex, dataset.goodsindex, goodsItem.goods_num);
  },
  /**
   * 变化 商品数量
   * @param {String} goodsId 商品 Id
   * @param {Number} num 变化 数量
   * @param {Number} storeindex 店铺 索引 
   * @param {Number} goodsindex 商品 索引
   * @param {Number} goodsNum 商品原来 数量
   */
  changeGoodsNum(goodsId, num, storeindex, goodsindex, goodsNum){
    this.setData({ isShowLoading: true});

    shopApi.changeCartGoodsNumByGoodsId(
      this.data.token,
      goodsId,
      num
    ).then(res => {
      wx.hideNavigationBarLoading();
      this.setData({ isShowLoading: false });

      if (res.data.status){
        
        this.setData({
          [`canuse[${storeindex}].list[${goodsindex}].goods_num`]: Number(goodsNum) + num,
          [`canuse[${storeindex}].list[${goodsindex}].isDisabled`]: Number(goodsNum) + num <= 1 ? true : false,
        });

        this.countTotalPrice();
      };

    }).catch(err => console.error(err));
  },
  /**
   * 提交购物车，跳转到 确认订单
   */
  submitCheckGoods(){
    const checkGoods = this.getCheckGoods();
    let ids = [];

    for (let index = 0; index < checkGoods.length; index++) {
      const goodsItem = checkGoods[index];
      ids.push(`${goodsItem.goods_id}:${goodsItem.goods_num}`);
    };

    wx.navigateTo({
      url: `/pages/Checkout/Checkout?ids=${ids.join(',')}`
    });
    
  },
  /**
   * 点击-清空失效商品
   */
  emptyInvalidGoods(){
    let ids = [];

    for (let i = 0; i < this.data.nouse.length; i++) {
      const goodsItem = this.data.nouse[i];
      ids.push(goodsItem.goods_id);
    };

    wx.showModal({
      title: '清空',
      content: `确认将已失效的商品清空吗？`,
      success: (res) => {
        if (res.confirm) {
          this.setData({ isShowLoading: true });
          shopApi.delCartGoodsByGoodsId(this.data.token, ids.join(',')).then(res => {
            this.setData({ isShowLoading: false });

            if (res.data.status) {
              this.setData({
                nouse: []
              });
              return;
            };

            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1000
            });

          }).catch(err => console.error(err));

        };
      }
    });

  },
  /**
   * 更新选中商品缓存
   */
  updatedStorageCheckGoods() {
    const checkGoods = this.getCheckGoods();
    let ids = [];

    for (let i = 0; i < checkGoods.length; i++) {
      const goodsItem = checkGoods[i];
      ids.push(goodsItem.goods_id);
    };

    wx.setStorageSync('checkGoodsIds', ids );
  },
  /**
   * 监听-用户下拉刷新事件
   */
  onPullDownRefresh(){
    this.getCart();
  },
  /**
  * 监听-点击 tab 时触发
  */
  onTabItemTap(e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 400
    });
  },
  /**
   * 点击跳转登录
   */
  tapToLogin(e){
    
    wx.switchTab({
      url: e.currentTarget.dataset.url
    });
    wx.setStorageSync('cancelBangding', true);
  }
})