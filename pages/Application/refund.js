const { api, wxApi, shopApi } = require('../../server/index.js');
const { showSuccessToast, showErrorToast, filterEmoji } = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    token: '',
    orderId: '',
    info: {},
    num: 0,
    areaIndex: 0,
    area: '',
    images: '',
    orderState: '',
    refund_type: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    const goodsid = options.goodsId;
    const orderState = options.orderState;
    //退货类型 1:退款 2:退货(单订单状态为20是传1，当订单状态30时传2)
    if (orderState == 20) {
      that.setData({
        refund_type: 1
      })
    } else if (orderState == 30) {
      that.setData({
        refund_type: 2
      })
    }
    that.setData({
      orderId: options.orderId,
      token: wx.getStorageSync('token'),
      orderState: options.orderState,
      goodsid: options.goodsId
    });

    //申请退款 数据出初始化
    that.ApplicationProgress();
    // 退款原因
    that.ProductReasons()
  },

  // 退款原因列表
  ProductReasons: function () {
    const that = this;
    shopApi.ProductReasons().then(res => {

      if (res.data.status == true) {
        let data_length = res.data.data;

        const area = [];
        for (let i = 0; i < data_length.length; i++) {
          area.push(data_length[i].reason_info)
        }

        that.setData({
          area: area,
          data_length: data_length,
          reason_id: res.data.data[0].reason_id
        })
      }

    }).catch(err => {
      console.error(err)
    })





  },
  //申请退款 数据出初始化
  ApplicationProgress: function () {
    const that = this
    const token = that.data.token;
    const orderid = that.data.orderId;

    shopApi.getOrderDetailsByOrderId(token, orderid).then(res => {
      if (res.data.status == true) {

        let gdlisy=res.data.data.goodsList;
        let goodslist='';
        for(let i=0;i<gdlisy.length;i++){ 
          if (gdlisy[i].goods_id == that.data.goodsid){ 
            goodslist=gdlisy[i]
          }
        }
      
        console.log(goodslist);
        that.setData({
          resData: res.data.data,
          // goodData: res.data.data.goodsList,
          goodData: goodslist,
          orderid: res.data.data.goodsList.order_id,
          orderGoodsId: res.data.data.goodsList.order_goods_id
        })
      }
    }).catch(err => {
      console.error(res)
    })
  },
  // 选择获取对于picker 的idnex
  bindPickerChange: function (e) {
    const that = this;
    const data_length = that.data.data_length;
    for (let j = 0; j < data_length.length; j++) {
      if (data_length[j].reason_info == that.data.area[e.detail.value]) {
        that.setData({
          reason_id: data_length[j].reason_id
        })
      }
    }
    that.setData({
      areaIndex: e.detail.value,
    })
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
   * 监听图片上传成功
  */
  imageloadSuccess(e) {
    let arr = [];
    e.detail.forEach(item => {
      arr.push(item.file);
    });
    this.setData({
      images: arr.join(',')
    });
  },

  // 退款数据表单 提交 
  formSubmit: function (e) {
    const that = this;
    const token = that.data.token;//tokrn 登录凭证
    const order_id = that.data.orderId;//商品id
    const pic_info = that.data.images;//退货凭证 多张图用,分隔
    const reason_id = that.data.reason_id;//退原因id
    const refund_type = that.data.refund_type;//退货类型 1:退款 2:退货(单订单状态为20是传1，当订单状态30时传2)
    let buyer_message = e.detail.value.textarea_text;//卖家留言

    buyer_message = filterEmoji(buyer_message); // emoji表情

    shopApi.RefundMoney(token, order_id, pic_info, reason_id, refund_type, buyer_message).then(res => {
      if (res.data.status){
        wx.showToast({
          title: '申请成功',
          icon: 'none'
        });
        setTimeout(function () {
          wx.navigateBack({ changed: true });//返回上一页
        }, 1000);
        return;
      }

      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      });
    }).catch(err => {
      console.error(err);
    })


  },
  focus: function () {
    const that = this;
    that.setData({
      is_po: true
    })

  },
  blur: function () {
    const that = this;
    that.setData({
      is_po: false
    })

  },
})