const { api, wxApi, shopApi } = require('../../server/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    ac_index: false,
    list_data: '',
    is_default: '',
    addr_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const that = this;

    const addr_tk = wx.getStorageSync('token');
    const addr_id = options.addrid;//自定义参数
    that.setData({
      addr_id: addr_id,
      token: addr_tk
    })


    shopApi.edit(addr_tk, addr_id).then(res => {

      if (res.data.status == true) {

        that.setData({
          list_data: res.data.data,
          region: res.data.data.pca_info,
          is_default: res.data.data.is_default
        })
      }


    }).catch(err => {

      console.log(err)

    })


  },
  //姓名验证
  bindname(e) {
  },
  //手机号验证
  bindblur: function (e) {
    var phone = e.detail.value;

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
  //选择是否成为默认地址
  tap_atc: function (e) {
    const that = this;


    if (that.data.is_default == 0) {
      that.setData({
        is_default: 1
      })

    } else {
      that.setData({
        is_default: 0
      })

    }

  },
  // form 修改地址保存
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

    var arr = that.data.region.split(" ");

    let addresslistdata = {
      token: that.data.token,
      consignee: e.detail.value.name,
      address: e.detail.value.text,
      mobile: e.detail.value.phone,
      province: arr[0],
      city: arr[1],
      area: arr[2],
      is_default: that.data.is_default,
      zipcode: 40000,
      address_id: that.data.addr_id,
      showCityPickerButton: that.data.region
    }


    shopApi.address(addresslistdata).then(res => {

      if (res.data.status == true) {
        wx.showToast({
          title: '修改成功',
          icon: 'none'
        })

        if (res.data.status == false) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })

        }

        setTimeout(function () {
          wx.navigateBack({ changed: true });//返回上一页
        }, 800)

      }

    }).catch(err => {
      console.log(err)
    })

  }
})