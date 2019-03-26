// pages/ShopSearch/ShopSearch.js
const { api, shopApi } = require('../../server/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchSwitchState: 'search',
    hotWords: [],
    searchWord: '',
    isShowInputBtnRemove: false,
    searchType: 'goods',
    searchHistory: [],
    goodsList: [],
    storeList: [], 
    page: 1,
    pageSize: 10,
    loadingState: false,
    noGoodsMsgState: false,
    sort:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    shopApi.getHotWords().then(res => {
      this.setData({
        hotWords: res.data.data
      });
    });
    
    if (options.categoryId !== undefined){
      this.setData({
        searchType: 'goods',
        categoryId: options.categoryId
      });
      this.submitSearch();
    };
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      searchHistory: wx.getStorageSync('searchHistory')
    });
  },
  /**
   * 监听 搜索框 变化
   */
  searchChanging(e){
    this.setData({
      searchWord: e.detail.value,
      isShowInputBtnRemove: e.detail.cursor >= 1 ? true : false,
    });
  },
  /**
   * 监听 搜索框 获取焦点
   */
  searchInputfocus(e){
     this.setData({
      isShowInputBtnRemove: this.data.searchWord.length >= 1 ? true : false,
      searchSwitchState: 'search',
      loadingState: false,
      sort: '',
      categoryId: ''
    });
  },
  /**
   * 点击 清空搜索框内容
   */
  tapEmptySearchInput(){
    this.setData({
      searchWord: '',
      isShowInputBtnRemove: false,
      searchSwitchState: 'search',
      loadingState: false,
      sort: '',
      categoryId: ''
    });
  },
  /**
   * 切换 搜索类型
   */
  tapSwitchSearchType(e){
    this.setData({
      searchType: e.target.dataset.searchtype
    });

    shopApi.getHotWords(e.target.dataset.searchtype === 'store'? 2 : 1).then(res => {
      this.setData({
        hotWords: res.data.data
      });
    });
  },
  /**
   * 按住 搜索历史内容 3秒 ，出现删除按钮
   */
  longpressHistory(e){
    const index = e.currentTarget.dataset.index;

    this.setData({
      [`searchHistory[${index}].isShowDeteBtn`]: true
    });
  },
  /**
   * 点击 删除一个搜索历史内容 
   */
  tapDeleteHistory(e){
    const index = e.currentTarget.dataset.index;
    let arr = [...this.data.searchHistory];
    arr.splice(index ,1);

    this.setData({
      searchHistory: arr
    });

    this.updatedHistory();
  },
  /**
   * 点击 清空搜索历史
   */
  tapEmptyHistory(){
    this.setData({
      searchHistory: []
    });

    this.updatedHistory();
  },
  /**
   * 点击 搜索历史内容
   */
  tapHistory(e){

    this.setData({
      searchWord: e.currentTarget.dataset.word,
      isShowInputBtnRemove: true
    });

    this.submitSearch();
  },
  /**
   * 提交 搜索
   */
  submitSearch(){
    if (this.data.searchWord === ' ') return;
    
    //  提交商品搜索
    if (this.data.searchType === 'goods'){
      
      this.setData({
        searchSwitchState: 'goodsList',
        goodsList: [],
        page: 1,
        loadingState: true,
        noGoodsMsgState: false
      });
      
      shopApi.searchGoods(
        this.data.searchWord,
        this.data.page,
        this.data.pageSize,
        this.data.sort,
        this.data.categoryId || ''
      ).then(res => {
          if (res.statusCode !== 200) return Promise.reject(res.statusCode);
          
          if (res.data.status === false) {
            this.setData({
              goodsList: [],
              loadingState: false,
              noGoodsMsgState: true
            });
            return res.data.status;
          };
          
          this.setData({
            goodsList: res.data.data.goodsList,
            loadingState: false
          });
        }).catch(err => {
          this.setData({
            goodsList: [],
            loadingState: false,
            noGoodsMsgState: true
          });
          console.error(err)
        });

        if (this.data.searchWord !== ''){
          this.updatedHistory();
        };

        return;
    };
    
    //  店铺商品搜索
    if (this.data.searchType === 'store'){
      this.setData({
        searchSwitchState: 'storeList',
        storeList: [],
        page: 1,
        loadingState: true,
        noStoreMsgState: false
      });

      shopApi.searchStore(
        this.data.searchWord,
        this.data.page,
        this.data.pageSize
      ).then(res => {
        if (res.statusCode !== 200) return Promise.reject(res.statusCode); 

        if (res.data.status === false) {
          this.setData({
            storeList: [],
            loadingState: false,
            noStoreMsgState: true
          });
          return res.data.status;
        };

        this.setData({
          storeList: res.data.data.list,
          loadingState: false
        });

      }).catch(err => {

        this.setData({
          storeList: [],
          loadingState: false,
          noStoreMsgState: true
        });
        console.error(err)
      });

      this.updatedHistory();
      return;
    };

  },
  /**
   * 更新 关键词搜索历史记录
   */
  updatedHistory() {
    const searchHistory = [...this.data.searchHistory];
    let isExist = false;

    for (let index = 0; index < searchHistory.length; index++) {
      const element = searchHistory[index];
      if (this.data.searchWord === element.name){
        searchHistory.unshift( searchHistory.splice(index,1)[0] );
        isExist = true;
      };
    };
    
    if (!isExist && this.data.searchWord.length){
      searchHistory.unshift({
        name: this.data.searchWord,
        isShowDeteBtn: false
      });
    };

    this.setData({
      'searchHistory': searchHistory
    });
    wx.setStorageSync('searchHistory', searchHistory);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.setData({ loadingState: true, noGoodsMsgState: false});

    if (this.data.searchType === 'goods') {

      shopApi.searchGoods(
        this.data.searchWord,
        ++this.data.page,
        this.data.pageSize,
        this.data.sort,
        this.data.categoryId || ''
      ).then(res => {
          this.setData({ loadingState: false });
  
          if (res.data.status === false) {
            this.setData({ noGoodsMsgState: true });
            return res.data.status;
          };
  
          this.setData({
            goodsList: this.data.goodsList.concat(res.data.data.goodsList)
          });
        }).catch(err => {
          console.error(err)
      });
    };

    if (this.data.searchType === 'store') {

      shopApi.searchStore(
        this.data.searchWord,
        ++this.data.page,
        this.data.pageSize,
        this.data.sort
      ).then(res => {
          this.setData({ loadingState: false });

          if (res.data.status === false) {
            this.setData({ noStoreMsgState: true });
            return res.data.status;
          };

          this.setData({
            storeList: this.data.storeList.concat(res.data.data.list)
          });
        }).catch(err => {
          console.error(err)
        });
    };

  },
  /**
   * 点击 切换商品列表排序
   */
  tapSort(e){
    const index = e.currentTarget.dataset.index;
    
    this.setData({ 
      sort: e.detail,
      page: 1,
      loadingState: true,
      noGoodsMsgState: false,
      goodsList: []
    });
    
    if (this.data.searchType === 'goods') {
      this.submitSearch();
    }
  }
})