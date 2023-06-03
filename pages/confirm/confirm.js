const db = wx.cloud.database()
const userInfo_col = db.collection('userInfo')

import {
  ml_showToastSuccess,
  ml_payment
} from '../../utils/asyncWX.js'

Page({
  data: {
    checkedGoods: [],
    totalCount: 0,
    totalPrice: 0,
    show: false,
    read: false,
    userInfo: [],
    pickUpPonint: 'XX超市'
  },

  onLoad(options) {
    let confirmedInfo = confirmedInfo = JSON.parse(options.confirmedInfo);
    this.setData({
      checkedGoods: confirmedInfo.checkedGoods,
      totalCount: confirmedInfo.totalCount,
      totalPrice: confirmedInfo.totalPrice //由于Vant组件单位问题实际价格要除100！！！
    })
    // console.log(confirmedInfo.checkedGoods); // 输出确认过的商品列表
    // this.getUserInfo()
  },

  onShow() {
    // 从缓存中获取数据
    const cacheData = wx.getStorageSync('users')
    // 选出 checked 属性为 true 的用户
    const userInfo = cacheData.find(user => user.checked === true)
    this.setData({
      userInfo: userInfo
    })
  },

  getUserInfo: function () {
    db.collection('userInfo').doc("1").get().then(res => {
      // 将返回结果渲染到前端页面
      const userInfo = res.data
      this.setData({
        username: userInfo.username,
        phonenumber: userInfo.phonenumber
      })
    }).catch(err => {
      console.error('获取用户信息失败：', err)
    })
  },

  //用户收货服务协议checkbox
  onChange(event) {
    this.setData({
      read: event.detail,
    });
  },

  //添加或更换提货人信息
  goAddUserInfo() {
    wx.navigateTo({
      url: '/pages/chooseUser/chooseUser',
    })
  },


  // 开始支付
  startToPay() {
    //检查阅读服务没有
    if (!this.data.read) {
      wx.showToast({
        icon: 'error',
        title: '请阅读服务协议',
      })
    } else if(!this.data.userInfo || !this.data.pickUpPonint){
      //检查填写信息没有
      wx.showToast({
        icon: 'error',
        title: '请填写信息',
      })
    } else this.startpay()
  },


  async startpay() {
    //1. 发起订单 => 获取订单号  => 未支付
    let res1 = await wx.cloud.callFunction({
      name: 'makeOrder',
      data: {
        checkedGoods: this.data.checkedGoods, //确认的商品列表
        totalPrice: this.data.totalPrice, //总价
        userInfo: this.data.userInfo, //提货人信息
        pickUpPonint: this.data.pickUpPonint, //自提点信息
        note: this.data.note, //订单备注
      }
    })
    await ml_showToastSuccess('发起订单成功')
    const {
      orderId
    } = res1.result

    //2. 预支付  => 获取支付所需要的5个参数
    //没有支付参数所以获取不到totalPrice报错
    // let res2 = await wx.cloud.callFunction({
    //   name: 'pay',
    //   data: {
    //     orderId,
    //     totalPrice,
    //   }
    // })

    // //3. 发起支付
    // await ml_payment(res2.result)
    // await ml_showToastSuccess('支付成功')

    // //4. 更新支付状态  => 已支付 
    // let res3 = await wx.cloud.callFunction({
    //   name: 'updateStatus',
    //   data: {
    //     orderId
    //   }
    // })
    // console.log('更新状态', res3)

    //5. 清空购物车
    let res4 = await wx.cloud.callFunction({
      name: 'clearCarts'
    })
    // console.log('清空购物车', res4)
    this.setData({
      checkedGoods: [],
      totalCount: 0,
      totalPrice: 0,
    })

    // 跳转到订单页面
    wx.navigateTo({
      url: '/pages/allOrders/allOrders',
    })
  },
});