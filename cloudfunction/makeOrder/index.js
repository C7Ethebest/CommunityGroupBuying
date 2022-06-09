// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env:'prod-hswqx'
})
const orders_col = db.collection('orders')

// 云函数入口函数
exports.main = async (event, context) => {

    //1. 创建一个随机订单号, 组成一个对象
    let obj = {
      order_number : Date.now(),
      carts : event.carts,
      status : 0  // 0-未支付  1-已支付
    }

    //2. 添加到 orders 集合里面
    let res = await orders_col.add({
      data: obj
    })
    
    return {
      res,
      order_number : obj.order_number
    }
}