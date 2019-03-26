// components/shop-goods-item/shop-goods-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsList: {
      type: 'Array',
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _addCart(e){
      wx.navigateTo({
        url: `/pages/Commoditydetails/Commoditydetails?goodsId=${e.currentTarget.dataset.goodsid}&isShowSpec=${true}`
      })
    }
  }
})
