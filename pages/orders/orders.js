const db = wx.cloud.database()

const orders = db.collection('orders')

Page({
  data: {
    tabs: [
      {
        id: 1,
        title: '全部',
        isActive: true
      },
      {
        id: 2,
        title: '支付成功',
        isActive: false
      },
      {
        id: 3,
        title: '支付失败',
        isActive: false
      }
    ],
    activeIndex: 1,
    orders_all: [],
    orders_1: [],
    orders_0: []
  },

  onLoad() {
    this.loadOrdersData_all()
  },
  /// 加载订单数据
  async loadOrdersData_all() {
    let res = await orders.get()
    console.log('全部数据', res)
    this.setData({
      orders_all: res.data
    })
  },
  /// 加载订单数据 - status 0
  async loadOrdersData_status0() {
    let res = await orders
      .where({
        status: 0
      })
      .get()
    console.log('全部数据 失败 ', res)
    this.setData({
      orders_0: res.data
    })
  },
  /// 加载订单数据 - status 1
  async loadOrdersData_status1() {
    let res = await orders
      .where({
        status: 1
      })
      .get()
    console.log('全部数据 成功', res)
    this.setData({
      orders_1: res.data
    })
  },
  // 点击 tab
  clicktab(e) {
    let id = e.currentTarget.dataset.id

    let newTabs = [...this.data.tabs]

    newTabs.forEach(v => {
      if (v.id === id) {
        v.isActive = true
      } else {
        v.isActive = false
      }
    })

    this.setData({
      activeIndex: id,
      tabs: newTabs
    })

    if (id === 1) {
      if (this.data.orders_all.length > 0) return
      this.loadOrdersData_all()
    } else if (id === 2) {
      if (this.data.orders_1.length > 0) return
      this.loadOrdersData_status1()
    } else {
      if (this.data.orders_0.length > 0) return
      this.loadOrdersData_status0()
    }
  }
})
