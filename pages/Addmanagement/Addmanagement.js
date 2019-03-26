const { api, wxApi, shopApi } = require('../../server/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: '请选择地址',
    ac_index: false,
    token: '',
    is_off: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    const add_token = wx.getStorageSync('token');

    that.setData({
      token: add_token
    })
  },
  //姓名验证
  bindname(e) {
  },
  //手机号验证
  bindblur: function (e) {
    var phone = e.detail.value;
    console.log(e)

    if (phone == '') {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return false;
    }

    if (!(/^1[34578]\d{9}$/.test(phone))) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
    }
    return false;
  },

  //地址选择
  regionChange(e) {
    const that = this;

    const arry = e.detail.value;
    let str = '';
    for (let i = 0; i < arry.length; i++) {
      str += arry[i] + ' '
    }

    that.setData({
      region: str
    })

  },
  //选择是否成为默认地址  1为默认地址 0为不是默认地址
  tap_atc: function (e) {
    const that = this;
    var ac_tf = '';
    if (that.data.ac_index == false) {
      ac_tf = true;
      that.setData({
        is_off: 1
      })
    } else {
      ac_tf = false;
      that.setData({
        is_off: 0
      })
    }

    that.setData({
      ac_index: ac_tf
    })

  },
  // form 表单提交  提交保存地址 
  formSubmit: function (e) {
    const that = this;

    if (e.detail.value.name == '') {
      wx.showToast({
        title: "收货人姓名不能为空",
        icon: 'none'
      })
      return false;
    } else if (e.detail.value.phone == '') {
      wx.showToast({
        title: "手机号码不能为空",
        icon: 'none'
      })
      return false;
    } else if (!(/^1[34578]\d{9}$/.test(e.detail.value.phone))) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })

      return false;
    } else if (that.data.region == "请选择地址") {
      wx.showToast({
        title: "地址选择不能为空",
        icon: 'none'
      })
      return false;
    } else if (e.detail.value.text == '') {
      wx.showToast({
        title: "详细地址不能为空",
        icon: 'none'
      })
      return false;
    }

    // 传送参数
    var addressbtndata = {
      token: that.data.token,
      consignee: e.detail.value.name,
      mobile: e.detail.value.phone,
      province: that.data.region[0],
      address: e.detail.value.text,
      city: that.data.region[1],
      area: that.data.region[2],
      is_default: that.data.is_off,
      zipcode: 54000,
      pca_info: that.data.region
    }

    shopApi.add_addressbtn(addressbtndata).then(res => {

      if (res.data.status == true) {
        wx.showToast({
          title: '提交成功',
          icon: 'none'
        })

        setTimeout(function () {
          wx.navigateBack({ changed: true });//返回上一页
        }, 800)
      }

    }).catch(err => {
      console.log(err);
    });

  }
})