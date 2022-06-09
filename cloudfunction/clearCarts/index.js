// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'prod-hswqx'
})
const carts_col = db.collection('carts')

// 云函数入口函数
exports.main = async (event, context) => {
  
  // 清空购物车
  let res = await carts_col.where({
    selected : true
  }).remove()

  return res 
}