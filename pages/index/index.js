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
    _page: 0,
    hasMore: true, // 是否有更多数据可加载
    swipers :[]
  },

  onLoad() {
    this.setTabBar()
    this.loadSwipersData()
    this.loadListData()
  },

  // 加载轮播图数据
  // 限制  :3个
  async loadSwipersData(){
     let res = await goods_col.orderBy('count','desc').limit(3).get() 
     console.log('轮播图',res)
     this.setData({
      swipers : res.data
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
    console.log('列表数据', res.data)

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
      return console.log('没有数据了')
    }
    console.log('上拉刷新')
    this.loadListData()
  },
  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新')
    //1. 重置
    this.setData({
      goods :[],
      _page :0,
      hasMore : true
    })
    //2. 加载最新的数据
    this.loadListData()
  },

  // 加入到购物车
  async addCart(e){
    //1. 拿到该商品
    let { item } = e.currentTarget.dataset

    // 2. 判断该商品在不在购物车里面
    //  根据 _id 尝试从购物车里面获取数据, 看能不能获取到
    try{
      let res = await carts_col.doc(item._id).get()
        console.log('有值')
        // 有值, 把购物车里面的该商品 的 num值累加
      await carts_col.doc(item._id).update({
        data : {
          num : db.command.inc(1)
        }
      })  

    }catch(err){
       console.log('没有值')

       //没有值 把该商品添加到购物车里面去
       await carts_col.add({
         data : {
           _id :item._id,
           imageSrc : item.imageSrc,
           price :item.price,
           title :item.title,
           num : 1,
           selected : true
         }
       })
    }

    this.setTabBar()
    await ml_showToastSuccess('下单成功') 
  },

  // 修改tabBar 右上角数字
  async setTabBar(){

    let total = 0
    let res = await carts_col.get()

    res.data.forEach(v => {
      total += v.num
    })

    if(total === 0)  return 

    wx.setTabBarBadge({
      index: 1,
      text: total+'',
    })
  }



})