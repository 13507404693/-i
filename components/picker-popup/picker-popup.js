// components/picker-popup/picker-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: 'string',
      value: '标题'
    },
    state: {
      type: 'boolean',
      value: false
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
    _tapClose(){
      this.setData({
        state: false
      });
      this.triggerEvent('cancel', { state: this.data.state});
    }
  }
})
