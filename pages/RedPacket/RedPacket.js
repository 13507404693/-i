// pages/RedPacket/RedPacket.js
const { api, wxApi } = require('../../server/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    memberinfo: {},
    isOpenRedPacket: false,
    isPrize: false,
    redPacketSum: 0,
    isLoadingRedPacket: false,
    topAnimationData: {},
    bottomAnimationData: {},
    maskAnimationData: {},
    isShowgRedPacket: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.showLoading({ title: '载入中...', mask: true });
    this.setData({
      redPacketSum: options.redPacketSum,
      'memberinfo.member_points': options.points,
      source: options.source,
      order_id: options.order_id || ''
    });

    api.getPaymentGoodsByorderId(88888).then(res => {
      wx.hideLoading();

      if (res.data.status) {
        const data = res.data.data;

        this.setData({
          list: data.list,
          // memberinfo: data.memberinfo
        });
      }
      
    }).catch(err => console.error(err));
  },
  /**
   * 点击-打开红包
   */
  tapOpenRedPacket() {

    const animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    });

    this.setData({ isLoadingRedPacket: true });

    if (this.data.source === 'payment') {
      setTimeout(() => {
        this.setData({ isLoadingRedPacket: false });

        api.getRedPacket(this.data.order_id).then(res => {
          if (!res.data.state) {

            this.setData({
              isShowgRedPacket: false,
              topAnimationData: animation.translateY(-200).opacity(0).step().export(),
              bottomAnimationData: animation.translateY(200).opacity(0).step().export()
            });

            this.setData({ maskAnimationData: animation.translateY(0).opacity(0).step().export() });

            setTimeout(() => {
              this.setData({
                isOpenRedPacket: true,
                redPacketSum: res.data.data.money,
              });
            }, 500);
            return;
          };

        }).catch(err => console.error(err));
      }, 2000);
    } else {
      
      setTimeout(() => {
        this.setData({ isLoadingRedPacket: false });
        
        this.setData({
          isShowgRedPacket: false,
          topAnimationData: animation.translateY(-200).opacity(0).step().export(),
          bottomAnimationData: animation.translateY(200).opacity(0).step().export()
        });
  
        this.setData({ maskAnimationData: animation.translateY(0).opacity(0).step().export() });
  
        setTimeout(() => {
          this.setData({
            isOpenRedPacket: true
          });
        }, 500);
      }, 400);

    };
  }
})