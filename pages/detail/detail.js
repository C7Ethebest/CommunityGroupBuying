// 获取数据库
const db = wx.cloud.database()
// 获取集合
const goods_col = db.collection('goods')
const carts_col = db.collection('carts')

Page({

  data: {
    goods: [],
    thisgood: [],
    detail: {},
    text: '',
    swipers: [],
    total: 0,
  },
  onLoad(options) {
    let {
      id
    } = options
    this.loadDetailData(id)
    this.loadSwipersData()

    //设置下方的Menus菜单，才能够让发送给朋友与分享到朋友圈两个按钮可以点击
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
    this.setTabbar()
  },


  // 加载轮播图数据
  async loadSwipersData() {
    let res = await goods_col.orderBy('count', 'desc').get()
    this.setData({
      swipers: res.data
    })
  },

  // 加载详情数据
  async loadDetailData(id) {
    // 拿到数据库的商品
    let ins = goods_col.doc(id)
    //访问+1
    await ins.update({
      data: {
        count: db.command.inc(1)
      }
    })
    // 获取
    let res = await ins.get()
    // 赋值
    this.setData({
      detail: res.data
    })
  },

  // 获取用户点击事件并获取商品信息将其加入购物车
  addCart(event) {
    let goods = this.data.detail;
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
    this.setTabbar()
    // 更新购物车页面
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });
  },

  // 更新购物车上的数字
  setTabbar() {
    let carts = wx.getStorageSync('carts') || [];
    let checkedCount = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].checked) {
        checkedCount += carts[i].num;
      }
    }
    let total = checkedCount;
    this.setData({
      total : total
    })
  },

  back() {
    wx.navigateBack({
      delta: 1,
    })
  },

  gocart() {
    wx.redirectTo({
      url: '/pages/cart/cart',
    })
  },



  

  //用户点击右上角分享给好友，要现在分享到好友这个设置menu的两个参数，才可以实现分享到朋友圈
  onShareAppMessage() {
    wx.showShareMenu({
      withShareTicket: true,
      menu: ['shareAppMessage', 'shareTimeline']
    })
  },
  //用户点击右上角分享朋友圈
  onShareTimeline() {
    return {
      title: '',
      query: {
        key: value
      },
      imageUrl: ''
    }
  },

})