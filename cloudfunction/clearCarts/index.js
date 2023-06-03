// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'shequtuangou-3gbr2gmy99c18698'
})
const carts_col = db.collection('carts')

// 云函数入口函数
exports.main = async (event, context) => {
  
  // 清空购物车中购买了的商品
  let res = await carts_col.where({
    checked : true
  }).remove()

  return res 
}