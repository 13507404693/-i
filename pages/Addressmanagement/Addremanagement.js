const { api, wxApi, shopApi } = require('../../server/index.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: 'bg_atc',
    ac_index: 0,
    data_list: '',
    token: ''
  },
  // 默认地址
  tap_atc: function (e) {
    const that = this;

    // 点击默认地址获取对应的json
    let index = e.currentTarget.dataset.index;
    let listIndeData = that.data.data_list[index];

    var arr = listIndeData.pca_info.split(" ");
    let addresslistdata = {
      token: that.data.token,
      consignee: listIndeData.consignee,
      address: listIndeData.address,
      mobile: listIndeData.mobile,
      province: arr[0],
      city: arr[1],
      area: arr[2],
      is_default: 1,
      zipcode: 40000,
      address_id: listIndeData.address_id,
      showCityPickerButton: listIndeData.pca_info
    }
    // 默认地址选择提交
    shopApi.address(addresslistdata).then(res => {


      // 选择默认地址之后 刷新默认地址显示
      wx.showLoading({
        title: '修改默认地址中',
      })

      setTimeout(function () {
        that.addr_listdata()
        wx, wx.hideLoading()
      }, 2000)

    }).catch(err => {
      console.error(err)
    })
    that.setData({
      ac_index: e.currentTarget.dataset.index
    })
  },
  //点击 切换   
  AddresSwitChing: function () {
    const that = this;

  },

  /**
   * 生命周期函数--监听页面加载
   */
  //列表地址管理
  addr_listdata: function () {
    const that = this;
    shopApi.list_dz(that.data.token).then(res => {

      if (res.data.status == true) {
        that.setData({
          data_list: res.data.data,
        })
      } else {
        that.setData({
          data_list: "",
        })
      }
    }).catch(err => {
      console.error(res)
    })

  },

  onLoad: function (options) {
    const that = this;
    const addr_az = wx.getStorageSync('token');
    that.setData({
      token: addr_az
    })
    // 初始化数据
    that.addr_listdata()

  },

  del_addr: function (e) {
    const that = this;

    wx.showModal({
      title: '删除地址',
      content: '确认要删除地址吗？',
      success: function (res) {
        if (res.confirm) {
          const del_adddata = e.currentTarget.dataset.addrdel;
          const token = that.data.token;

          shopApi.del_addressbtn(del_adddata, token).then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'none'
            })

            that.addr_listdata()

          }).catch(err => {
            console.error(err)
          })

        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    that.addr_listdata()
  },

  /**
   * 点击-选择收货地址 
   */
  tapChoiceAddress(e){
    if (wx.getStorageSync('pageSource') === 'checkout'){
      wx.setStorageSync('choiceAddress', e.currentTarget.dataset.address);
      wx.navigateBack({
        delta: 1
      });
    };
  }
})