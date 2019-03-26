module.exports = class API {
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
    
    /**
     * 获取openid
     * @param {String} code  临时登录凭证code
     */
    getOpenId(code) {
        if (typeof code !== 'string') return;

        return new Promise((resole, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getmemberinfo`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                data: { "code": code ,newapp: 1},
                success: resole,
                fail: reject
            });
        });
    }
    /**
     * 会员登陆接口
     * @param {String} unionid  unionid 会员唯一标识
     * @param {json} param 自定义参数
     */
    memberLogin(unionid, param) {
        if (typeof unionid !== 'string') return;

        return new Promise((resole, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/index.php?r=member/login`,
                data: Object.assign(
                    { unionid: unionid },
                    param
                ),
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: resole,
                fail: reject
            });
        });

    }
    /**
     * 获取会员信息
     * @param {String} token 登录成功后返回的 token
     */
    getMemberInfo(token) {
        if (typeof token !== 'string') return;

        return new Promise((resole, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/index.php?r=member/info`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'GET',
                data: { token: token },
                success: resole,
                fail: reject,
            });

        });
    }
    /**
     * 获取 折扣 扫码支付信息
     * @param {String} openid 
     * @param {String} unionid 
     * @param {String} money 
     * @param {Number} storeid 
     */
    getpayinfo(openid, unionid, money, storeid, phone, param) {
        return new Promise((reslove, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getpayinfo`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: Object.assign({
                    'openid': openid,
                    'unionid': unionid,
                    'money': money,
                    'storeid': storeid,
                    'phone': ''
                },param),
                success: reslove,
                fail: reject
            });
        })
    }
    /**
     * 获取 全款 扫码支付信息
     * @param {String} openid 
     * @param {String} unionid 
     * @param {String} money 
     * @param {Number} storeid 
     */
    getpayAllinfo(openid, unionid, money, storeid, phone, param) {
        return new Promise((reslove, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getpayall`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: Object.assign({
                    openid: openid,
                    unionid: unionid,
                    money: money,
                    storeid: storeid,
                    phone: ''
                }, param),
                success: reslove,
                fail: reject
            });
        })
    }

    /**
     * 根据台码获取 storeid 
     * @param {String} param 台码编号 或 storeid
     */
    
    getPayBusinessByTaimaOrStoreid(param){
        return new Promise((reslove, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getstoreid`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: param,
                success: reslove,
                fail: reject
            });
        })
    }

    /**
     * 解密 微信的加密数据
     * @param {String} sessionKey 
     * @param {String} iv 
     * @param {String} encryptedData 
     * @param {String} meid 
     * @param {Number} sex 
     * @param {String} name 
     * @param {String} avatar 
     */
    decryptWxDatar(sessionKey, iv, encryptedData, meid, sex, name, avatar) {
        return new Promise((reslove, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getphone`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    sessionKey: sessionKey,
                    iv: iv,
                    encryptedData: encryptedData,
                    meid: meid || '',
                    newapp: 1,
                    member_sex: sex || 0,
                    member_name: name || '',
                    member_avatar: avatar || ''
                },
                success: reslove,
                fail: reject
            });
        })
    }
    /**
     * 获取折扣信息
     * @param {json}  传人id  phone money unionid 其他信息
     * @param {Number} id 
     * @param {Number} phone
     * @param {Number} money
     * @param {String} unionid
     */
    getDiscount(getdata){
        return new Promise((reslove, reject) => {
            const { storeid, phone, money, unionid } = getdata;

            wx.request({
                url: `${this.defaultSPApi}/miniappnew/getzhekou`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                data: {
                    "storeid": storeid,
                    "phone": phone,
                    "money": money,
                    "unionid": unionid
                },
                success: reslove,
                fail: reject
            })

        })
    }
    
    /**
     * 根据 订单 id 获取商品（包含积分）
     * @param {Number} orderId 订单id
     */
    getPaymentGoodsByorderId(orderId){
        return new Promise((reslove, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=goods/xcx-goods`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'GET',
                data: {
                    "order_id": orderId
                },
                success: reslove,
                fail: reject
            })

        })
    }
    /**
     * 获取会员账单
     * @param {Number} member_id 会员id
     * @param {Number} page 当前页码
     */
    getMemberPayBill(member_id, page) {
        return new Promise((resole, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=excitation/getpaylist`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'GET',
                data: {
                    member_id: member_id,
                    page: page,
                },
                success: resole,
                fail: reject
            });
        });
    }
    /**
     * 发送验证码
     * @param {Number} phone 手机号码
     */
    sendSMS(phone) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=sms/user-register`,
                data: {
                    phone: phone,
                },
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: resolve,
                fail: reject
            })
        });
    }
    /**
     * 注册会员
     * @param {String} code 小程序 code
     * @param {Number} member_mobile 手机号码
     * @param {String} member_password 密码
     * @param {String} unionid  小程序 unionid
     * @param {String} meid 小程序分享页面带的 member_id
     * @param {Number} sex 性别
     * @param {String} name 名称
     * @param {String} avatar 头像
     */
    registerMember(code, mobile, password, unionid, meid, sex, name, avatar) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/index.php?r=member/register`,
                data: {
                    code: code,
                    member_mobile: mobile,
                    member_password: password,
                    unionid: unionid,
                    meid: meid || '',
                    member_sex: sex,
                    member_name: name,
                    member_avatar: avatar
                },
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: resolve,
                fail: reject
            })
        });
    }
    /**
     * 上传评论图片
     * @param {String} path 上传图片路径
     * @param {String} dir 图片保存路径
     * @param {Function} callback 返回 当前上传进度参数，文档：https://developers.weixin.qq.com/miniprogram/dev/api/network-file.html#wxuploadfileobject
     */
    uploadImage(path, dir, callback){
        return new Promise((resolve, reject) => {
            const uploadTask = wx.uploadFile({
                url: 'https://img.lion-mall.com/upimgs/img-up',
                filePath: path,
                name: 'goods_imgs',
                formData: {
                    dirimg: dir || 'comment'
                },
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: resolve,
                fail: reject
            });
            uploadTask.onProgressUpdate(callback);
        });
    }
    /**
     * 获取地区商家
     * @param {String} location 经纬度
     * @param {Number} page 当前页码
     * @param {Number} pagesize 返回数量
     * @param {String} area 中文地址
     */
    getAreaBusiness(location, page, pagesize, area){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=store/offline-list`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    point: location,
                    page: page||1,
                    pagesize: pagesize||5,
                    area: area,
                },
                method: 'POST',
                success: resolve,
                fail: reject
            });
        })
    }
    /**
     * 获取 商圈 分类
     */
    getCircleClassif(){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/index.php?r=index/guide-icon`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'GET',
                success: resolve,
                fail: reject
            });
        });
    }
    /**
     * 获取 商圈 轮播
     */
    getCircleSlide(){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=index/slide-show3`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: 'GET',
                success: resolve,
                fail: reject
            });
        });
    }

    /**
    * nav 标签分类
    */
    gettaglist(pid_js){
      return new Promise((resolve, reject) => {
        wx.request({
            url: `${this.defaultPDApi}/?r=store/gettag-list`,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data:{pid:pid_js},
          method: 'POST',
          success: resolve,
          fail: reject,
        });
      })
    }

    /**
    *  美食 标签块
    */
  Labeltype(datajson){ 
    var data_json = {
      point: datajson.point,
      page: datajson.page,
      pagesize: datajson.pagesize,
      area: datajson.area,
      pid: datajson.pid,
      token: datajson.token,
      tag: datajson.tag
    }

    return new Promise((resolve,reject)=>{ 
      wx.request({
        url: `${this.defaultPDApi}/?r=store/offline-list2`,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data:data_json,
        method:'POST',
        success: resolve,
        fail: reject,
      }); 
    })
  }
  /**
   * 获取商家详情
   * @param {Number} id 商家的 store_id
   */
    getBusinessDetails(storeId, token){
      return new Promise((resolve, reject) => {
          wx.request({
              url: `${this.defaultPDApi}/?r=store/info`,
              header: {
                  'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                  id: storeId,
                  token: token
              },
              method: 'GET',
              success: resolve,
              fail: reject,
          }); 
      });
    }
    /**
     * 获取商家 商品列表
     * @param {Number} storeId 商家的 store_id
     * @param {Number} page 当前页数
     * @param {Number} pagesize 返回数量
     */
    getBusinessGoods(storeId, page, pagesize){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=goods/store-goods-list2`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    storeId: storeId,
                    page: page || 0,
                    pagesize: pagesize || 2
                },
                method: 'GET',
                success: resolve,
                fail: reject,
            });
        });
    }
    /**
     * 获取商家评论
     * @param {Number} storeId 商家的 store_id
     * @param {Number} page 当前页数
     * @param {Number} pagesize 返回数量
     */
    getBusinessComment(storeId, page, pagesize,type,token){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=evaluate/comment-list`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    store_id: storeId,
                    page: page || 0,
                    per_page: pagesize || 2,
                    seval_comment: type || '',
                    token:token
                },
                method: 'GET',
                success: resolve,
                fail: reject,
            });
        });
    }
    /**
     * 发表商家评论
     * @param {String} token 
     * @param {Number} storeId 商家id
     * @param {String} con 评论内容
     * @param {String} fileImg 评论图片
     */
    publishBusinessComment(unionid, storeId, con, fileImg, score, orderId){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=evaluate/store-add&unionid=${unionid}`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    store_id: storeId,
                    desccredit: 5,
                    seval_content: con,
                    seval_img: fileImg,
                    seval_comment: score,
                    order_id: orderId || ''
                },
                method: 'POST',
                success: resolve,
                fail: reject,
            });
        });
    }
     /**
     * 投诉商家
     * @param {String} token 
     * @param {Number} storeId 商家id
     * @param {String} con 评论内容
     * @param {String} fileImg 评论图片
     */
    publishBusinessComplaint(name, mobile, info, imgs){
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=pchome/mapp-send`,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    name: name,
                    mobile: mobile,
                    info: info,
                    imgs: imgs
                },
                method: 'GET',
                success: resolve,
                fail: reject,
            });
        });
    }

    /**
     *  商品搜索
     * @param {string} keywords   关键词
     * @param {Number} page      page 当前页码
     * @param {number} pasesize  pasesize 每页的总页码 
     * @param {number} store_lat store_lat 经度 
     * @param {unmber} store_lng store_lng 纬度
    */
    seach(keywords, page, pagesize, store_lat, store_lng, sort) {

      return new Promise((reslocve, reject) => {
        wx.request({
          url: `${this.defaultPDApi}/?r=store/search-goods`,
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            keywords: keywords,
            page: page || 1,
            pagesize: pagesize || 10,
            store_lat: store_lat,
            store_lng: store_lng,
            sort: sort||''
          },
          success: reslocve,
          fail: reject
        })
      })

    }

    /**
     *  商铺搜索
     * @param {string} keyword    关键词
     * @param {Number} page      page 当前页码
     * @param {number} listRows  listRows 每页的总页码
     * @param {number} store_lat store_lat 经度 
     * @param {unmber} store_lng store_lng 纬度
    */
    store(keyword, page, listRows, store_lat, store_lng) {

      return new Promise((reslocve, reject) => {
        wx.request({
          url: `${this.defaultPDApi}/?r=store/search`,
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            keyword: keyword,
            page: page || 0,
            listRows: listRows || 10,
            store_lat: store_lat,
            store_lng: store_lng
          },
          success: reslocve,
          fail: reject
        })
      })
    }

    /**
     * 短信验证码
     * @param {number} code   短信验证码
    */
    phonecode(phone_reg){ 
      return new Promise((reslocve, reject) => {
        wx.request({
          url: `${this.defaultPDApi}/?r=sms/reset-password`,
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            phone: phone_reg
          },
          success: reslocve,
          fail: reject
        })
      })
      
    }

    /**
     * 短信验证码
     * @param {number} code   短信验证码
     * @param {number}  passwrod     新密码
     * @param {number}  passwrod     确认新密码
    */

    repPassWrod(list_up){
      return new Promise((reslocve, reject)=>{
        wx.request({
          url: `${this.defaultPDApi}/?r=member/reset-password`,
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            code:list_up.code,
            member_mobile:list_up.mobile,
            member_password:list_up.password,
          },
          success: reslocve,
          fail: reject
        })

      }) 

    }

    /**
     * 获取 红包
     * @param {String} orderId 订单 id
     */
    getRedPacket(orderId) {
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/index.php?r=member/get-red`,
                method: 'GET',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    order_id: orderId
                },
                success: reslocve,
                fail: reject
            })

        }) 
    }

    /**
     * 获取 临时会员信息
     * @param {String} unionid 微信用户 UnionId
     */
    getTempMemberInfo(unionid) {
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=member/testmember`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    unionid: unionid
                },
                success: reslocve,
                fail: reject
            })

        })
    }

    /**
     * 获取 店铺商品及分类
     * @param {Number} id 店铺 id
     */
    getStoreGoodsAndClassify(id){
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=store-new/cat-goods`,
                method: 'GET',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    store_id: id
                },
                success: reslocve,
                fail: reject
            });

        })
    }
    /**
     * 获取 店铺商品详情
     * @param {Number} id 商品 model_id
     */
    getStoreGoodsDetails(id){
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultPDApi}/?r=goods/infox`,
                method: 'GET',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    is_online: 0,
                    id: id
                },
                success: reslocve,
                fail: reject
            });

        })
    }
    /**
     * 获取 结算积分折扣
     * @param {Number} id 店铺 id 
     * @param {Number} mobile 会员手机
     * @param {Number} sum 金额
     */
    getCheckoutPointsDiscount(id, mobile, sum){
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/fypayapp/getzhekou`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    store_id:id,
                    member_mobile:mobile,
                    money:sum
                },
                success: reslocve,
                fail: reject
            });

        })
    }
    /**
     * 获取 商家下单支付信息
     * @param {Number} mobile 会员手机号码 
     * @param {Array} goods sku 商品
     * @param {String} openId 微信 openid
     * @param {Number} storeId 店铺id
     * @param {Number} deduction 不抵扣 0,积分抵扣 1 
     * @param {String} time 自提时间
     * @param {Number} mobile2 自取电话
     * @param {String} msg 留言
     */
    getBusinessPayInfo(mobile, goods, openId, storeId, deduction, time, mobile2, msg){
        return new Promise((reslocve, reject) => {
            wx.request({
                url: `${this.defaultSPApi}/fypayapp/getpayinfo`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    member_mobile: mobile,
                    goods: goods,
                    storeid: storeId,
                    zhekou: deduction,
                    fromtype: 'LETPAY',
                    openid: openId,
                    shipping_time: time,
                    consignee_mobile: mobile2,
                    order_message: msg
                },
                success: reslocve,
                fail: reject
            });

        })
    }

    /**
     * 获取 商家下单订单信息
     * @param {Number} member_id 
     * @param {Array} istoday 状态码 1为 今日订单 0历史订单
    */ 
  BusinessOrder(member_id, istoday){    
    return new Promise((reslocve, reject)=>{ 
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/store-order`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          member_id:member_id,
          istoday:istoday, 
        },
        success: reslocve,
        fail: reject
      });
    })
  }
    /**
     * 获取 商家订单列表信息
     * @param {Number} member_id 
     * @param {Array} istoday 状态码 1为 今日订单 0历史订单
     * @param {Number} order_id
    */

  OrderDcontent(member_id, istoday, order_id){ 
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/store-order`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          member_id:member_id,
          istoday:istoday,
          order_id:order_id
        },
        success: reslocve,
        fail: reject
      });
    })
  
  }


  /**
   * 获取 列表订单支付信息
   * @param {Number} mobile 会员手机号码 
   * @param {Array} goods sku 商品
   * @param {String} openId 微信 openid
   * @param {Number} storeId 店铺id
   * @param {Number} deduction 不抵扣 0,积分抵扣 1 
   * @param {String} time 自提时间
   * @param {Number} mobile2 自取电话
   * @param {String} msg 留言
   * @param {Number} paytype  //APP支付方式必传   1为微信2为支付宝
   * @param {Number} order_id //按订单支付时必传
   */
  listPayInfo(mobile, goods, openId, storeId, deduction, time, mobile2, msg, paytype, order_id) {
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultSPApi}/fypayapp/getpayinfo`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data:{
          member_mobile:mobile,
          goods:goods,
          storeid:storeId,
          zhekou:deduction,
          fromtype:'LETPAY',
          openid:openId,
          shipping_time:time,
          consignee_mobile:mobile2,
          order_message:msg,
          paytype:paytype,
          order_id: order_id
        },
        success: reslocve,
        fail: reject
      });
    })
  }

  /**
   * 取消订单
   * @param {Number} token 登录凭证
   * @param {Number} orderid  订单id
   */
  orderOff(token, orderid){ 
    return new Promise((reslocve,reject)=>{ 
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/order-off&token=${token}`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          order_id:orderid
        },
        success: reslocve,
        fail: reject
      });
      
    })
  }

  /**
   * 删除订单
   * @param {Number} token 登录凭证
   * @param {Number} orderid  订单id
   */
  orderRemover(token, orderid) {
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/order-del&token=${token}`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          order_id: orderid
        },
        success: reslocve,
        fail: reject
      });

    })
  }



  /**
   * 门店消费订单
   * @param {Number} member_id memberid
   * @param {Number} stare_time  开始时间
   * @param {Number} end_time 结束时间
   * @param {Number} order_state  状态默认20
   * @param {Number} page 多少页
   * @param {Number} pagesize 每页多少个
   */
  getTimeOrderid(member_id,start_time,end_time,order_state,page,pagesize,order_come) {
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/store-order`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          member_id:member_id,
          start_time:start_time,
          end_time: end_time,
          order_state:order_state || 20,
          page: page,
          pagesize: pagesize,
          order_come: order_come || 2
        },
        success: reslocve,
        fail: reject
      });
    })

  }
  /**
   * 获取 小程序 菊花码
   * @param {Number} id 店铺id
   */
  getMiniprogramCode(scene, page, width){
    return new Promise((reslocve, reject) => {
        wx.request({
          url: `${this.defaultSPApi}/miniappnew/miniappcode`,
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            scene: scene||'15246254738312030000',
            page: page||'pages/Business/Business',
            width: width|| 200
          },
          success: reslocve,
          fail: reject
        });
      })
  }


  /**
 * 获取 确认收货
 * @param {Number} order_id 
 */
  ConfirmGoods(orderId) {
    return new Promise((reslocve, reject) => {
      wx.request({
        url: `${this.defaultPDApi}/?r=store-new/quhuo`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          order_id:orderId
        },
        success: reslocve,
        fail: reject
      });
    })
  }

}