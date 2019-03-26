// components/goods-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      goodsItem: {
        type: 'object',
        value: {},
        observer: '_itemChange'
      }    
  },

  /**
   * 组件的初始数据
   */
  data: {
    item: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _itemChange(val){
      let distance, dis_num;
      if (val.distance >= 1) {
        distance = val.distance.toFixed(2) + 'km';
      } else {
        dis_num = val.distance * 1000;
        distance = dis_num.toFixed(2) + 'm';
      }
      val.distance = distance;

      this.setData({
        item: val
      })
    }
  }
})
