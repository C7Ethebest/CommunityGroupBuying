// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'shequtuangou-3gbr2gmy99c18698' //云开发环境id
})
const orders_col = db.collection('orders')

// 云函数入口函数
exports.main = async (event, context) => {
  //获取订单时间
  var now = new Date();
  var tzoffset = now.getTimezoneOffset() * 60000; // 以毫秒为单位的偏移量
  var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
  var orderTime = new Date(localISOTime + 'Z').toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false
  }).replace(/[年月]/g, '-').replace(/[日上下午]/g, '');
  //1. 创建一个随机订单号, 组成一个对象
  let obj = {
    orderId: Date.now(), //随机不重复的订单号
    checkedGoods: event.checkedGoods, //确认的商品列表
    userInfo: event.userInfo, //提货人信息
    pickUpPoint: event.pickUpPoint, //自提点信息
    totalPrice: event.totalPrice, //总价
    notes: event.notes, //订单备注
    orderTime: orderTime, //订单时间
    status: '待付款'   //0待付款  1待取货  2待评价  3售后中
  }

  //2. 添加到 orders 集合里面
  let res = await orders_col.add({
    data: obj
  })

  return {
    res,
    orderId: obj.orderId,
    orderTime: obj.orderTime
  }
}