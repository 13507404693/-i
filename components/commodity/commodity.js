// components/commodity/commodity.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    commodity: {
      type: 'object',
      value: {},
      observer: '_itemChange'
    } 
  },

  /**
   * 组件的初始数据
   */
  data: {
    item:{}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _itemChange(val){
      console.log(val);
      this.setData({
        item: val
      })
    }

  }
})
