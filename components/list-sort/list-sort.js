// components/list-sort.js
Component({
   externalClasses: ['sort-class'],
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    sort: [
      {
        name: '综合',
        sortType: '',
        type: ''
      },
      {
        name: '按销量',
        sortType: 'sale_num:',
        type: 1
      },
      {
        name: '按价格',
        sortType: 'goods_price:',
        type: 1
      }
    ],
    thisSortIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
   * 点击 切换商品列表排序
   */
    _tapSort(e) {
      const index = e.currentTarget.dataset.index;

      this.setData({
        thisSortIndex: index,
        [`sort[${index}].type`]: e.currentTarget.dataset.type
      });

      const sort = `${e.currentTarget.dataset.sort}${e.currentTarget.dataset.type}`;
      
      this.triggerEvent('onSort', sort);
    },
  }
})
