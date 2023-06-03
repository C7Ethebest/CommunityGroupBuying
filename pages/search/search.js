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
} from '../../utils/asyncWX.js'

Page({
  data: {
    goods: [], // 商品列表数据
    carts: [],
    _page: 0,
    hasMore: true, // 是否有更多数据可加载
    keyword: '', // 搜索关键词
    sortType: 'a', // a表示综合、b表示销量、c表示价格
  },

  onLoad(options) {
    const keyword = options.keyword;
    // console.log('搜索关键词:', keyword);
    this.setData({
      keyword: keyword, // 将搜索关键词保存到data中
    });
    this.searchList(); // 加载搜索结果
  },

  //切换标签
  onTabChange(event) {
    // 获取新的排序类型
    const newSortType = event.detail.name;
    // 如果新的排序类型与当前不同，则更新 sortType 和 goods
    if (newSortType !== this.data.sortType) {
      // 更新数据属性中的 sortType
      this.setData({
        sortType: newSortType,
        // 调用 sortGoods 方法对商品列表进行排序，并将排序后的结果存储在 "goods" 数据属性中
        goods: this.sortGoods(this.data.goods, newSortType),
      });
    }
  },

  //商品排序
  sortGoods(goods, sortType) {
    const newGoods = goods.slice(); // 复制一份原始数据
    switch (sortType) {
      case 'b': // 按sold从高到低排序
        newGoods.sort((a, b) => b.sold - a.sold);
        break;
      case 'c': // 按price从低到高排序
        newGoods.sort((a, b) => a.price - b.price);
        break;
      default: // 综合排序，不做操作
        break;
    }
    return newGoods;
  },

  // 当搜索框内容发生变化时触发
  onSearchChange(e) {
    this.setData({
      keyword: e.detail,
    });
  },

  //搜索
  onSearch() {
    const keyword = this.data.keyword;
    this.setData({
      keyword: keyword, // 将搜索关键词保存到data中
    });
    this.searchList(); // 加载搜索结果
  },

  //搜索的列表
  async searchList() {
    // 显示加载框
    await ml_showLoading()
    // 使用搜索关键词作为过滤条件进行查询
    const keyword = this.data.keyword;
    let query = goods_col.where({
      title: db.RegExp({
        regexp: '.*' + keyword + '.*', // 使用正则表达式进行模糊匹配
        options: 'i' // i 表示忽略大小写
      })
    });
    // 加载数据
    let res = await query.skip(0).get()
    // 隐藏加载框
    await ml_hideLoading()
    // 手动停止下拉刷新
    wx.stopPullDownRefresh()
    this.setData({
      goods: res.data, // 将搜索结果保存到goods变量中
    })
  },




  //上拉刷新
  async onReachBottom() {
    await ml_showToast('没有更多数据了')
  },

  //下拉刷新
  async onPullDownRefresh() {
    // 清空之前的搜索结果和分页
    this.setData({
      keyword: '',
      goods: [],
      _page: 0,
      hasMore: true,
    })
    //重置加载搜索结果，显示所有商品的数据
    const goodsCollection = db.collection('goods')
    let {
      data
    } = await goodsCollection.get()
    this.setData({
      goods: data
    })
    // this.loadListData()
  },

  // 获取用户点击事件并获取商品信息将其加入购物车
  addCart(event) {
    console.log(event);
    let goods = event.currentTarget.dataset.item;
    let cartItem = {
      id: goods._id,
      title: goods.title,
      price: goods.price,
      imageSrc: goods.imageSrc,
      num: 1,
      checked: true
    };
    // 将商品信息添加到购物车数组中
    let carts = wx.getStorageSync('carts') || [];
    let index = carts.findIndex(item => item.id === cartItem.id);
    if (index !== -1) {
      carts[index].num += 1;
    } else {
      carts.push(cartItem);
    }
    wx.setStorageSync('carts', carts);
    // 更新购物车页面
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });
  },


})





// //根据加载列表数据
// async loadListData() {
//   const LIMIT = 5
//   let {
//     _page,
//     goods
//   } = this.data // 0
//   // 显示加载框
//   await ml_showLoading()
//   let res = await goods_col.limit(LIMIT).skip(_page * LIMIT).get()
//   // 隐藏加载框
//   await ml_hideLoading()
//   // 手动停止下拉刷新
//   wx.stopPullDownRefresh()
//   this.setData({
//     goods: [...goods, ...res.data],
//     _page: ++_page, // 1
//     hasMore: res.data.length === LIMIT
//   })
// },