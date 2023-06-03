// 获取数据库
const db = wx.cloud.database()
// 获取集合
const goods_col = db.collection('goods')
const carts_col = db.collection('carts')

// 引入 异步操作
import {
  ml_showLoading,
  ml_hideLoading,
  ml_showToast,
  ml_showToastSuccess
} from '../../utils/asyncWX.js'

Page({

  data: {
    goods: [], // 商品列表数据
    carts: [],
    _page: 0,
    hasMore: true, // 是否有更多数据可加载
    swipers: [],
    value: [],
    time: 30 * 60 * 60 * 1000,
  },

  //加载列表数据
  onLoad() {
    this.setTabbar()
    this.loadSwipersData()
    this.loadListData()
  },

  onShow() {
    this.setTabbar()
  },

  // 当搜索框内容发生变化时触发
  onChange(e) {
    this.setData({
      value: e.detail,
    });
  },
  //搜索
  onSearch() {
    const keyword = this.data.value;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${keyword}`, // 将搜索关键词作为参数传递给search页面
    });
  },

  // 加载轮播图数据
  // 限制  :3个
  async loadSwipersData() {
    let res = await goods_col.orderBy('count', 'desc').limit(5).get()
    //  console.log('轮播图',res)
    this.setData({
      swipers: res.data
    })
  },

  // 加载列表数据
  async loadListData() {
    const LIMIT = 5
    let {
      _page,
      goods
    } = this.data // 0

    // 显示加载框
    await ml_showLoading()
    let res = await goods_col.limit(LIMIT).skip(_page * LIMIT).get()

    // 隐藏加载框
    await ml_hideLoading()

    // 手动停止下拉刷新
    wx.stopPullDownRefresh()
    this.setData({
      goods: [...goods, ...res.data],
      _page: ++_page, // 1
      hasMore: res.data.length === LIMIT
    })
  },

  // 上拉刷新
  async onReachBottom() {
    // 没有更多数据的情况
    if (!this.data.hasMore) {
      await ml_showToast('没有更多数据了')
      return console.log('没有更多数据了');
    }
    this.loadListData()
  },

  // 下拉刷新
  onPullDownRefresh() {
    //1. 重置
    this.setData({
      goods: [],
      _page: 0,
      hasMore: true,
    })
    //2. 加载最新的数据
    this.loadListData()
  },


  // 获取用户点击事件并获取商品信息将其加入购物车
  addCart(event) {
    let goods = event.currentTarget.dataset.item; //获取点击的商品对象
    // 将商品信息添加到购物车数组中
    let cartItem = {
      id: goods._id,
      title: goods.title,
      price: goods.price,
      imageSrc: goods.imageSrc,
      num: 1,
      checked: true
    };
    // 获取本地存储的购物车数据，若不存在则创建一个空数组
    let carts = wx.getStorageSync('carts') || [];   
    // 判断购物车中是否已存在该商品，若存在则通过findIndex方法返回该商品在数组中的索引，否则返回-1
    let index = carts.findIndex(item => item.id === cartItem.id);   
    if (index !== -1) {
      carts[index].num += 1;  // 购物车中存在该商品，数量+1
    } else {
      carts.push(cartItem); // 购物车中不存在该商品，则将其添加到购物车数组中
    }
    wx.setStorageSync('carts', carts);  // 将更新后的购物车数据保存到本地存储中
    this.setTabbar()  // 更新购物车图标上的数字，即显示购物车中已添加的商品数量
    // 弹窗提醒
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });
  },

  // 更新 TabBar 上的数字
  setTabbar() {
    let carts = wx.getStorageSync('carts') || [];
    let checkedCount = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].checked) {
        checkedCount += carts[i].num;
      }
    }
    if (checkedCount.toString() == 0) {
      wx.setTabBarBadge({
        index: 2,
        text: '',
      });
    } else{
      wx.setTabBarBadge({
        index: 2,
        text: checkedCount.toString()
      });
    }
  },


  //点击分类
  onClickCategory(event) {
    let categoryName = event.currentTarget.dataset.name
    console.log('categoryNameindex', categoryName);
    wx.switchTab({
      url: '/pages/category/category',
      success: function () {
        wx.setStorageSync('activeKey', categoryName);
      }
    });
  }


})