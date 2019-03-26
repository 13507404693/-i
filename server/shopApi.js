module.exports = class ShopAPI {
  constructor() {
    /**
     * 正式环境 API
     */
    this.SPapi = 'https://sp.lion-mall.com';
    this.PDapi = 'https://pd.lion-mall.com';
    /**
     * 测试环境 API
     */
    this.TestPDapi = 'https://api.pin-dui.com';
    this.TestSPapi = 'https://m2.pin-dui.com';
    /**
     * 正在使用 API（默认）
     */
    this.defaultPDApi = this.PDapi;
    this.defaultSPApi = this.SPapi;
  }
  /*   
    @param {number} code  用戶唯一 token 获取地址
  * */
  list_dz(addr_az) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=address/list&token=${addr_az}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {},
        success: resole,
        fail: reject
      });
    })
  }
  /*  
  @param {number} token  用戶唯一 token 
  @param {number} address 编辑id
* */
  edit(addr_tk, addr_id) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=address/info`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: { token: addr_tk, id: addr_id },
        success: resole,
        fail: reject
      });
    })
  }
  /**
 * 修改地址
 *  @param {number} token  用戶唯一 token 获取地址
 *  @param {string} consignee 名字
 *  @param {string} address 详细地址
 *  @param {number} mobile 手机号
 *  @param {string} province 省
 *  @param {string} city 市
 *  @param {string} area 区
 *  @param {number} is_default 状态
 *  @param {number} zipcode 邮政编码
 *  @param {pca_info} pca_info 省市区
  */
  address(addresslistdata){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=address/edit&token=${addresslistdata.token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          consignee: addresslistdata.consignee,//名字 
          address: addresslistdata.address,//详细地址
          mobile: addresslistdata.mobile,//手机号
          province: addresslistdata.province,//省
          city: addresslistdata.city,//市
          area: addresslistdata.area,//区 
          is_default: addresslistdata.is_default,//状态
          zipcode: addresslistdata.zipcode,//邮政编码
          address_id: addresslistdata.address_id,//地址id
          pca_info: addresslistdata.showCityPickerButton,//省市区 
        },
        success: resole,
        fail: reject
      });
    })
  }
  /* 
添加地址  
@param {number} token  用戶唯一 token 获取地址
@param {string} consignee 名字
@param {string} address 详细地址
@param {number} mobile 手机号
@param {string} province 省
@param {string} city 市
@param {string} area 区
@param {number} is_default 状态
@param {number} zipcode 邮政编码
@param {pca_info} pca_info 省市区
* */
  add_addressbtn(addressbtndata) { 

    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=address/add2&token=${addressbtndata.token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          consignee: addressbtndata.consignee,//名字
          address: addressbtndata.address,//详细地址
          mobile: addressbtndata.mobile,//电话号码
          province: addressbtndata.province,//省
          city: addressbtndata.city,//市
          area: addressbtndata.area,//区
          is_default: addressbtndata.is_default,//状态
          zipcode: addressbtndata.zipcode,//邮政编码  固定
          pca_info: addressbtndata.pca_info//省市区 联在一起
        },
        success: resole,
        fail: reject
      });
    })
  }


  /* 
  删除地址
  @param {number} token  用戶唯一 token 删除地址
* */
  del_addressbtn(del_adddata, token) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=address/del&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          id: del_adddata
        },
        success: resole,
        fail: reject
      });
    })
  }
  /**
   * 产品分类 -分类标题
   *  @param {number} token  用戶唯一 token 
      @param {number} typeId  type类型 1
    * 
    */
  product_title(token, typeId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=category/prt-list&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          typeId: typeId
        },
        success: resole,
        fail: reject
      });
    });
  }



  /**
       * 产品分类标题对应内容产品 
       *  @param {number} token  用戶唯一 token 
          @param {number} parentId  id 
          @param {number} typeId  type类型 1
       * 
       */
  ProductBlock(token, parentId, typeId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=category/chd-list&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          parentId: parentId,
          typeId: typeId
        },
        success: resole,
        fail: reject
      });
    });
  }


  /*
 商品详情  
 @param {number} token  用戶唯一 token 获取商品详情
 @param {number} ID  商品唯一id     
 * */
  commodity(token, commodityid) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/infox&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          id: commodityid
        },
        success: resole,
        fail: reject
      });
    })
  }

  /**
       * 商品收藏
       *  @param {number} token  用戶唯一 token 
          @param {number} goods_id  商品id
          @param {string} goods_name  商品名字
          @param {number} goods_logo  商品图片
       * 
       */
  Collection(token, modelid) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/favorites&token=${token}`,
        header:{
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          goods_id:modelid,
        },
        success: resole,
        fail: reject
      });
    });
  }



  /*
 加入购物车
 @param {number} token  用戶唯一 token 获取商品详情
 @param {number} ID  商品唯一id 
 @param {number} num  商品数量
 * */
  goodcard(token, goosid, num) {

    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=cart/add&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          id: goosid,
          num: num
        },
        success: resole,
        fail: reject
      });
    })
  }

  /*
     立即购买
     @param {number} token  用戶唯一 token 获取
     @param {number}   商品唯一id 
     * */
  goodgobuy(token, goodsinfo) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/check-goods&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          goodsinfo: goodsinfo
        },
        success: resole,
        fail: reject
      });
    })
  }



  /*
    获取评论  
    @param {number} token  用戶唯一 token 获取评论
    @param {number} page  第几页
    @param {number} pagesize  每页多少条
    @param {number} ID  评论唯一id     
  * */
  comment(page, pagesize, id, geval_scores, token) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=evaluate/elt-goods-list`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          page: page,
          pagesize: pagesize,
          id: id,
          geval_scores: geval_scores,
          token:token
        },
        success: resole,
        fail: reject
      });
    })
  }
  /**
   * 获取商品 分类
   */
  getGoodsClassify() {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=category/prt-list`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: { "typeId": 1 },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 首页主轮播
   */
  getMainBanner() {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=index/index-banner`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 精选 商品
   * @param {Number} page 当前页码
   * @param {Number} pageSize 返回商品长度
   */
  getHotGoods(page, pageSize) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/list&cat=hotGoods`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          page: page,
          listRows: pageSize
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 根据 分类 获取商品
   * @param {Number} classifyId 分类 Id
   * @param {Number} page 当前页码
   * @param {Number} pageSize 返回数据长度
   * 
   */
  getGoodsByClassifyId(classifyId, page, pageSize) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/list&cat=activeGoods`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          aid: classifyId,
          page: page,
          listRows: pageSize
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取分类 类型
   * @param {Number} classifyId 分类 Id
   */
  getClassifyType(classifyId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=index/slide-show2`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          classify_id: classifyId
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 搜索 商品
   * @param {String} keywords 关键字
   * @param {Number} brandId 品牌 Id
   * @param {Number} page 当前页码
   * @param {Number} pageSize 返回商品长度
   */
  searchGoods(keywords, page, pageSize, sort, categoryId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/search`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          keywords: keywords,
          brand_id: '',
          page: page,
          listRows: pageSize || 1,
          sort: sort || '',
          categoryId: categoryId || '',
          priceArea: '',
          return: '',
          store_id: ''
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 热点搜索
   */
  getHotWords() {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=index/hot-word`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 搜索 店铺
   * @param {String} word 
   * @param {Number} page 
   * @param {Number} pageSize 
   */
  searchStore(word, page, pageSize) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store/search`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          page: page || 1,
          listRows: pageSize || 10,
          keyword: word || '',
          is_online: 1,
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 商城首页导航
   */
  getShopActivity() {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/index.php?r=shop-new/shop-icon`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 活动详情 ，注：只有 type = 7 (多商品) typ = 3 (多店铺) type = 2 (商品) 才会调用这个接口
   * @param {Nnmber} types 
   * @param {String} url
   * @param {Number} page
   * @param {Number} pageSize
   */
  getActivityDetail(type, url, page, pageSize, sort) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=shop-new/icon-info`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          type: type,
          url: url,
          page: page || 1,
          pagesize: pageSize || 10,
          sort: sort || ''
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 根据 token 获取购物车
   * @param {String} token 用户登录 token
   */
  getCartByToken(token) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=cart/list`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          token: token
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   *  根据 goodsid 删除 购物车 商品
   * @param {String} token 用户登录 token
   * @param {String} ids 商品 id， 如：15295626009434970000,15295636639002550000
   */
  delCartGoodsByGoodsId(token, ids) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=cart/del`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          token: token,
          id: ids
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 根据 goodsid 变更 购物车 商品数量 
   * @param {String} token 用户登录 token
   * @param {String} ids 商品 id
   * @param {Number} num 数量，注：减少数量 num = -1
   */
  changeCartGoodsNumByGoodsId(token, id, num) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=cart/add`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          token: token,
          id: id,
          num: num
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取购物车选中的 商品信息
   * @param {String} token 用户登录 token
   * @param {String} goodsinfo 商品信息 Id:num 如：15295617679249550000:10,15295617679288550000:2
   */
  getCartCheckGoods(token, goodsinfo) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/check-goods`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          token: token,
          goodsinfo: goodsinfo
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 店铺信息
   * @param {String} token 用户登录 token
   * @param {String} storeId 
   */
  getBusinessInfo(storeId, token) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store/info`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          token: token,
          id: storeId
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
  * 获取 店铺 商品
  * @param {String} storeId 店铺 Id 
  * @param {String} categoryId 分类 ID
  * @param {Number} page 当前 页码
  * @param {Number} pagesize 返回数量
  */
  getBusinessGoodsList(storeId, page, pagesize, categoryId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=goods/store-goods-list`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          storeId: storeId,
          categoryId: categoryId || '',
          pagesize: pagesize || 10,
          page: page || 1
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 店铺分类 
   * @param {String} storeId 店铺 Id
   */
  getBusinessCategory(storeId) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store/category`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          store_id: storeId
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 店铺收藏
   * @param {String} token 用户登录 token
   * @param {String} storeId 店铺 Id
   */
  storeCollection(token, storeId){  


    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store/favorites&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          store_id: storeId
        },
        success: resole,
        fail: reject
      });
    });
  }


  /**
   * 申请退款  和 猜你喜欢 
   * @param {numbert}  token 用户登录 token
   * @param {numbert}  orderid
   */
  ApplicationProgress(token,orderid){ 
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/refund-order&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          orderid:orderid
        },
        success: resole,
        fail: reject
      });
    });
  }


  /**
   * 申请退款
   * @param {numbert}  token 用户登录 token
   * @param {numbert}  page 第几页 
   * @param {unmber}   pageSize 每页多少个 
   * @param {unmber}   state  订单状态
    */
  OrderList(token,page,pageSize,state){
    return new Promise((resole, reject)=>{
      wx.request({
        url: `${this.defaultPDApi}/?r=order/order-list&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method:'POST',
        data:{
          token:token,
          page:page,
          pageSize:pageSize,
          state:state
        },
        success: resole,
        fail: reject
      });
    });
  }
/**
   * 获取 订单列表
   * @param {String} token 用户登录 token
   * @param {Number} page 当前页码
   * @param {Number} pagesize 返回数量
   */
  getOrderList(token,page, pagesize,state){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/order-list&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: Object.assign(
          {
            pageSize: pagesize,
            page: page
          },
          state
        ),
        success: resole,
        fail: reject
      });
    });
  }

    /**
   * 根据 订单 Id，撤销申请
   * @param {number} token 用户登录 token
   * @param {number} orderid 订单 Id
   */
  Revoke(token, orderid){ 
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/refunddel&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          orderid:orderid
        },
        success: resole,
        fail: reject
      });
    });
  }

  /**
   * 根据 订单 Id，删除订单
   * @param {String} token 用户登录 token
   * @param {Number} id 订单 Id
   */
  deleteOrderByOrderId(token, orderid){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/del-order&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          order_id: orderid
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 取消订单
   * @param {String} token 用户登录 token
   * @param {Number} id 订单 Id
   */
  cancelOrderByOrderId(token, id){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/cancel-order&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          id: id
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 根据 订单 Id，确认订单收货
   * @param {String} token 用户登录 token
   * @param {Number} id 订单 Id
   */
  confirmOrderByOrderId(token, id){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/receive`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          orderid: id,
          token: token
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取 物流
   * @param {String} token 用户登录 token
   * @param {Number} code 物流单号
   * @param {String} expressName 快递公司名称
   */
  getLogistics(token, code, expressName){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=logistics/get-logistics`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          nu: code,
          token: token,
          com: 'auto',
          shipping_express_name: expressName
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 根据 订单Id 获取订单详情
   * @param {String} orderid 订单 Id
   */
  getOrderDetailsByOrderId(token, orderid){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/order-info&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          orderid: orderid
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 提交订单
   * @param {String} token 用户登录 token
   * @param {String} goodsinfo 订单 商品 ids, 格式 15295621006293570000:2,15295646271803770000:2
   * @param {String} addressid 地址 Id
   * @param {String} msg 买家留言
   */
  submitOrder(token, goodsinfo, addressid, msg, deductionAmount){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/create-order-from-wx&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          goodsinfo: goodsinfo,
          addressid: addressid,
          isbalance: 0,
          payway: 'minApp',
          iscart: true,
          orderMsg:msg,
          deliver_type: 1,
          hongbao: deductionAmount
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取订单支付信息
   * @param {String} paysn 提交订单返回 pay_sn
   * @param {String} openid 用户微信 openid
   */
  getWechatApp(paysn, openid){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=wechat-app/pay-all`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          paysn: paysn,
          openid: openid
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 提交订单支付
   * @param {String} token 用户登录 token
   * @param {String} paysn 订单支付 Id
   * @param {String} openid 用户微信 openid
   */
  submitOrderPay(token, paysn, openid){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=wechat-app/pay-all&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          paysn: paysn,
          openid: openid
        },
        success: resole,
        fail: reject
      });
    });
  }

  /**
   * 提交订单支付
   * @param {String} token 用户登录 token
   * @param {String} orderid 订单 Id
   * @param {String} openid 用户微信 openid
   */
  submitOrderPayByOne(token, orderid, openid){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=wechat-app/pay-one&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          orderid: orderid,
          openid: openid
        },
        success: resole,
        fail: reject
      });
    });
  }

  /**
   * 申请退款
   * @param {String}  token 用户登录 token
   * @param {number}  order_id order_id
   * @param {number}  pic_info 退货凭证 多张图用,分隔
   * @param {number}  reason_id 退货原因ID
   * @param {number}  refund_type 退货类型 1:退款 2:退货(单订单状态为20是传1，当订单状态30时传2)
  * @param {number} buyer_message 买家留言
   */

  RefundMoney(token,order_id, pic_info, reason_id, refund_type, buyer_message) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/refund&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          token:token,
          order_id: order_id,
          pic_info: pic_info,
          reason_id: reason_id,
          refund_type: refund_type,
          buyer_message: buyer_message
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 发表 订单评论
   * @param {String} orderid 订单 Id
   * @param {String} con 评论内容
   * @param {String} image 图片
   * @param {Number} scores 
   * @param {Number} anonymous 
   */
  pubOrderComment(token, orderid, con, image, scores, anonymous) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=evaluate/add&token=${token}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          geval_content: con,
          geval_image: image,
          geval_scores: scores,
          isanonymous: anonymous,
          orderid: orderid
        },
        success: resole,
        fail: reject
      });
    });
  }

  /**
   * 退款 退货原因
   */
  ProductReasons(){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=order/refund-reason-list`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        }, 
        method: 'GET',
        data: {
        },
        success: resole,
        fail: reject
      });
    });
  }
  /**
   * 获取用户红包鼓励金
   * @param {String} token 用户登录 token
   */
  getMemberExcitation(token){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=member/get-member-excitation`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          token: token
        },
        success: resole,
        fail: reject
      });
    });
  }
 /**
   * 获取用户红包鼓励金
   *@param {number} page:1,
    @param {number} pagesize:10,
    @param {number} member_id: '',
    @param {number} type:1,
    @param {number} start_time:'',
    @param {number} end_time:''
   */

  wallerGet(wallData){
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=excitation/getamount1`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'GET',
        data: {
          page: wallData.page,
          pagesize: wallData.pagesize,
          member_id: wallData.member_id,
          type: wallData.type,
          start_time: wallData.start_time,
          end_time: wallData.end_time
        },
        success: resole,
        fail: reject
      });
    });

  }


  /**
  * 获取用户红包详情
  *@param {number} id:1,
   @param {number} type:10,
  */

  getcsah(type_num,id) {
    return new Promise((resole, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=excitation/getcashdetail&type=${type_num}&id=${id}`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method:'GET',
        data: {
        },
        success: resole,
        fail: reject
      });
    });

  }

  dianzan(seval_id, token) {
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=evaluate/ct-zan&seval_id=${seval_id}&token=${token}`,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {},
        success: reslocve,
        fail: reject
      })

    })

  }


}