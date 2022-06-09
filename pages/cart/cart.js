const db = wx.cloud.database()
const carts_col = db.collection('carts')

import {
  ml_showToastSuccess,
  ml_payment
} from '../../utils/asyncWX.js'

Page({

  data: {
    carts: [], // 购物车数据
    totalCount: 0,
    totalPrice: 0
  },

  onLoad() {
    this.loadCartsData()
  },

  onShow() {
    this.loadCartsData()
  },

  // 加载购物车数据
  async loadCartsData() {
    let res = await carts_col.get()
    console.log('购物车数据', res)
    this.setData({
      carts: res.data
    })

    // 统计总价格和总数量
    this.setCart(res.data)
  },
  // 统计总价格和总数量
  setCart(carts) {

    let totalCount = 0
    let totalPrice = 0

    carts.forEach(v => {
      totalCount += v.num
      totalPrice += v.num * v.price
    })


    this.setData({
      totalCount,
      totalPrice
    })

  },
  // 点击 + 
  async addCount(e) {
    //1. 获取 id 
    let id = e.currentTarget.dataset.id
    //2. 修改num +1 
    let res = await carts_col.doc(id).update({
      data: {
        num: db.command.inc(1)
      }
    })
    console.log('+1', res)
    // 3.1 +1 成功后 再次重新刷新
    // this.loadCartsData()
    // 3.2 +1 成功后 修改当前data里面的carts数据
    let newCarts = this.data.carts
    let goods = newCarts.find(v => v._id == id)
    goods.num += 1
    this.setData({
      carts: newCarts
    })
    // //4. 提示 累加成功
    // await ml_showToastSuccess('累加成功')

    //5. 再次统计
    this.setCart(newCarts)

  },


  // 点击 - 
  async subCount(e) {
    //1. 获取 id 
    let id = e.currentTarget.dataset.id
    //2. 修改num -1 
    let res = await carts_col.doc(id).update({
      data: {
        num: db.command.inc(-1)
      },
    })
    console.log('-1', res)
    // 3.1 -1 成功后 再次重新刷新
    // this.loadCartsData()
    // 3.2 -1 成功后 修改当前data里面的carts数据
    let newCarts = this.data.carts
    let goods = newCarts.find(v => v._id == id)
    let n = goods.num - 1
    if (n == 0) {
      let that = this 
      //删除购物车内商品
      wx.cloud.database().collection('carts')
        .doc(id)
        .remove()
        that.onLoad();
        console.log('删除了商品')
    } else{
      console.log('减少了商品')
      this.onLoad();
    }
    
    // this.setData({
    //   carts: newCarts
    // })
    //5. 再次统计
    this.setCart(newCarts)
    


},

// 点击 当前页面对应的tab
onTabItemTap() {
  wx.setTabBarBadge({
    index: 1,
    text: '',
  })
},

// 开始支付
async startpay() {
  //1. 发起订单 => 获取订单号  => 未支付
  let res1 = await wx.cloud.callFunction({
    name: 'makeOrder',
    data: {
      carts: this.data.carts
    }
  })
  await ml_showToastSuccess('发起订单成功')
  const {
    order_number
  } = res1.result
  console.log('发起订单', order_number)

  //2. 预支付  => 获取支付所需要的5个参数
  let res2 = await wx.cloud.callFunction({
    name: 'pay',
    data: {
      order_number
    }
  })
  console.log('预支付', res2)

  //3. 发起支付
  await ml_payment(res2.result)

  await ml_showToastSuccess('支付成功')

  //4. 更新支付状态  => 已支付 
  let res3 = await wx.cloud.callFunction({
    name: 'updateStatus',
    data: {
      order_number
    }
  })
  console.log('更新状态', res3)

  //5. 清空购物车
  let res4 = await wx.cloud.callFunction({
    name: 'clearCarts'
  })
  console.log('清空购物车', res4)
  this.setData({
    carts: [],
    totalCount: 0,
    totalPrice: 0
  })

  // 跳转到订单页面
  wx.navigateTo({
    url: '/pages/orders/orders',
  })

}
})