const db = wx.cloud.database()
const carts_col = db.collection('carts')

Page({
  data: {
    carts: [],
    selectedIndexes: []
  },

  onLoad() {
    // this.loadCarts()
    this.makerOrder()
  },

  makerOrder() {
    //获得当前时间

    let orderTime = new Date().toJSON().substring(0, 10) + ' ' + new Date().toTimeString().substring(0,8);
    console.log('现在时间',orderTime); 

    //1. 创建一个随机订单号, 组成一个对象
    // let obj = {
    //   orderId: Date.now(),
    //   carts: carts,
    //   orderTime: orderTime,   //订单生成时间
    //   status: 0 // 0-未支付  1-已支付
    // }

    // //2. 添加到 orders 集合里面
    // let res = await orders_col.add({
    //   data: obj
    // })

    // return {
    //   res,
    //   order_number: obj.order_number
    // }
  }





  // async loadCarts() {
  //   const {
  //     data
  //   } = await db.collection('carts').get()
  //   this.setData({
  //     carts: data,
  //   })
  // },

  // onCheckboxChange(event) {
  //   console.log('event', event);
  //   let {index} = event.currentTarget.dataset; //这里可以知道被改变的复选框的index
  //   console.log('index', index);
  //   let {
  //     carts
  //   } = this.data;
  //   let oldCheckStatus = carts[index].checked; //获取之前的选中状态
  //   carts[index].checked = !oldCheckStatus; //手动将状态取反,将数据与视图同步
  //   this.setData({
  //     carts,
  //   });
  // },

  // getSelectedCarts() {
  //   return this.data.carts.filter((item, index) => this.data.selectedIndexes.indexOf(index) !== -1)
  // },

  // submitOrder() {
  //   const selectedCarts = this.getSelectedCarts()
  //   console.log('已选中的商品：', selectedCarts)
  //   // 这里可以执行提交订单的操作
  // }
})