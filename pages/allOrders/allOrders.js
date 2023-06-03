const db = wx.cloud.database()
const orders_col = db.collection('orders')

Page({
  data: {
    activeIndex: 1,
    orders: [],
    ordersTime: 0,
    orderGoods: []
  },

  onLoad(options) {
    let activeKey = options.activeIndex;
    this.setData({
      activeIndex: parseInt(activeKey)
    })
    this.onChange(activeKey)
  },

  // 加载全部订单数据
  async loadAllOrders() {
    let res = await orders_col.get()
    console.log('res', res);
    let modifiedOrders = res.data.map(order => ({
      ...order,
      totalPrice: order.totalPrice / 100,
      // statusText: this.getOrderStatusText(order), //获取订单状态文字
    }))
    let orderTime = res.orderTime
    this.setData({
      orders: modifiedOrders,
      orderTime: orderTime,
    })
  },


  onChange(event) {
    let activeKey;
    if (typeof event === 'string') {
      //将页面跳转传入的字符串转换为数字类型
      activeKey = parseInt(event);
    } else {
      // 获取选中项的索引值
      activeKey = event.detail.index;
    }

    // 定义一个对象，存储每个选项对应的分类
    const statusMap = {
      '0': '', //  表示全部订单
      '1': '待付款', //  待支付订单
      '2': '待取货', //  待取货订单
      '3': '待评价', //  待评价
      '4': '售后中' //  售后中
    };

    // 更新 activeKey 的状态
    this.setData({
      activeKey: activeKey
    });
    // 判断选中项的索引值是否为 空（即全部订单）
    if (activeKey === 0) {
      // 如果是，调用 loadAllOrders 函数加载所有订单列表
      this.loadAllOrders();
    } else {
      // 如果不是，根据选中项从 statusMap 对象中获取对应的订单
      const status = statusMap[activeKey];
      // 调用 searchOrdersByStatus 函数加载对应类型的订单
      this.searchOrdersByStatus(status);
    }
  },

  //按status订单状态搜索订单
  async searchOrdersByStatus(status) {
    let res = await orders_col.where({
      status: status
    }).get()
    let modifiedOrders = res.data.map(order => ({
      ...order,
      totalPrice: order.totalPrice / 100,
      // statusText: this.getOrderStatusText(order), //获取订单状态文字
    }))
    let orderTime = res.orderTime
    this.setData({
      orders: modifiedOrders,
      orderTime: orderTime,
    })
  },

  // 跳转到评论页面
  goComment() {
    wx.navigateTo({
      url: '/pages/comment/comment'
    })
  },


  // 跳转到售后页面
  goAfterSales() {

    wx.navigateTo({
      url: '/pages/afterSales/afterSales'
    })
  }
  








  //根据status显示不同的订单状态
  // getOrderStatusText(order) {
  //   switch (order.status) {
  //     case 0:
  //       return '待付款';
  //     case 1:
  //       return '待取货';
  //     case 2:
  //       return '待评价';
  //     case 3:
  //       return '售后中';
  //     case 4:
  //       return '已完成';
  //     default:
  //       return '';
  //   }
  // }




  // // 加载待付款订单数据 - status 0
  // async pendingPaymentOrders() {
  //   let res = await orders_col
  //     .where({
  //       status: 0
  //     })
  //     .get()
  //   console.log('全部数据 失败 ', res)
  //   this.setData({
  //     orders_0: res.data
  //   })
  // },
  // /// 加载已支付订单数据 - status 1
  // async loadOrdersData_status1() {
  //   let res = await orders
  //     .where({
  //       status: 1
  //     })
  //     .get()
  //   console.log('全部数据 成功', res)
  //   this.setData({
  //     orders_1: res.data
  //   })
  // },
  // // 点击 tab
  // clicktab(e) {
  //   let id = e.currentTarget.dataset.id

  //   let newTabs = [...this.data.tabs]

  //   newTabs.forEach(v => {
  //     if (v.id === id) {
  //       v.isActive = true
  //     } else {
  //       v.isActive = false
  //     }
  //   })

  //   this.setData({
  //     activeIndex: id,
  //     tabs: newTabs
  //   })

  //   if (id === 1) {
  //     if (this.data.orders_all.length > 0) return
  //     this.loadOrdersData_all()
  //   } else if (id === 2) {
  //     if (this.data.orders_1.length > 0) return
  //     this.loadOrdersData_status1()
  //   } else {
  //     if (this.data.orders_0.length > 0) return
  //     this.loadOrdersData_status0()
  //   }
  // }
})