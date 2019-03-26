const { shopApi } = require('../../server/index.js');
const { showSuccessToast } = require('../../utils/util.js');

// pages/Allcomments/Allcomments.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: '',
    goodst: '',
    page: 1,
    pagesize: 10,
    id: '',
    geval_scores: 0,
    isShowSwipreLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    that.setData({
      id: options.modelid
    })

    that.comment();

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 点击切换状态
  tap_czc: function (e) {
    const that = this;
    let caz = e.currentTarget.dataset.caz;
    that.setData({
      geval_scores: caz,
      isShowSwipreLoading: false
    })

    that.comment();
    wx.showLoading({
      title: '加载中',
    })

  },
  //评论列表
  comment: function () {
    const that = this;
    const token = wx.getStorageSync('token');

    let page = 1;
    let pagesize = that.data.pagesize;
    let id = that.data.id;
    let geval_scores = that.data.geval_scores;

    that.setData({
      page: 1
    })

    shopApi.comment(page, pagesize, id, geval_scores, token).then(res => {

      if (res.data.status == true) {

        for (let i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].geval_image = res.data.data.goodsList[i].geval_image.split(',');
        }
        // 评论总数
        const count = res.data.data.allzan.zan + res.data.data.allzan.cai;

        that.setData({
          goodsList: res.data.data.goodsList,
          goodst: res.data.data,
          count: count
        })
        wx.hideLoading();
      }

      if (res.data.msg == "无更多数据") {
        that.setData({
          isShowSwipreLoading: true
        })
        return false;
      }

      if (res.data.status == false) {
        that.setData({
          isShowSwipreLoading: true
        })
      }
    }).catch(err => {
      that.setData({
        goodsList: '',
        isShowSwipreLoading: true
      })
      wx.hideLoading();
    })
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

    const that = this;
    const images = e.currentTarget.dataset.images;
    let arry_images = '';
    // 去数组空的变量  拼接在一起 
    for (let i = 0; i < images.length; i++) {
      if (images[i] !== '') {
        arry_images += 'https://img.lion-mall.com/' + images[i] + ',';
      }
    }
    //切割成数组
    var srcdete = arry_images.split(",")
    that.previewImage(e.currentTarget.dataset.src, srcdete);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const that = this;

    const token = wx.getStorageSync('token');
    let page = ++that.data.page;
    let pagesize = that.data.pagesize;
    let id = that.data.id;
    let geval_scores = that.data.geval_scores;


    shopApi.comment(page, pagesize, id, geval_scores, token).then(res => {
      if (res.data.status == true) {

        for (let i = 0; i < res.data.data.goodsList.length; i++) {
          res.data.data.goodsList[i].geval_image = res.data.data.goodsList[i].geval_image.split(',');
        }

        that.setData({
          goodsList: that.data.goodsList.concat(res.data.data.goodsList),

        })


      }

      if (res.data.status == false) {
        wx.showToast({
          title: '没有更多了',
          icon: 'none'
        })

      }

    }).catch(err => {
      console.log(err);
    })
  },
  // 点赞接口
  dianzan(e) {
    const that = this;

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

    const token = wx.getStorageSync('token');
    const index = e.currentTarget.dataset.index;
    const message = that.data.goodsList;

    for (let i in message) {

      if (index == i) {
        that.data.goodsList[i].iszan = 1;
        //累加

        let zannum = parseInt(that.data.goodsList[i].zannum);
        let geval_id = that.data.goodsList[i].geval_id;

        shopApi.dianzan(geval_id, token).then(res => {
          if (res.data.status == false) {
            console.log('你已点过赞了')
            wx.showToast({
              title: '你已点过赞了',
              icon: 'none'
            })
            return false;
          }

          zannum = zannum + 1
          that.data.goodsList[i].zannum = zannum;

          that.setData({
            goodsList: that.data.goodsList
          })

        }).catch(err => {
          console.log(err)
        })
      }
    }
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

    if(e.currentTarget.dataset.receiveuser.is_blacklist == 1){
      showSuccessToast('该评论用户已经被加入黑名单～', '');
      return;
    };
    e.currentTarget.dataset.receiveuser.member_mobile+='';
    if(e.currentTarget.dataset.receiveuser.member_mobile.length < 11){
      showSuccessToast('该评论用户已经被删除～', '');
      return;
    };

    if(e.currentTarget.dataset.receiveuser.member_mobile == userInfo.member_mobile){
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
          nickName: e.currentTarget.dataset.receiveuser.geval_frommembername
      },
      sourceType: 8,
      messageType: 0,
      id: e.currentTarget.dataset.receiveuser.geval_id
    };

    wx.navigateTo({
      url: `/pages/ImDialog/ImDialog?url=https://sp.lion-mall.com/wap6.0/webim/dialog&param=${this.urlJsonEncode(param)}&title=${e.currentTarget.dataset.receiveuser.geval_frommembername}`
    });
  },
  urlJsonEncode(json){
    return encodeURIComponent(JSON.stringify(json));
  }
})