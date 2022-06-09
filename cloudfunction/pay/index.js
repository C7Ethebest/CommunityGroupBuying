// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//1. 引入 tenpay
const tenpay = require('tenpay');
//2. 配置
const config = {
  appid: 'wx38d8faffac4d34d2',
  mchid: '1500880121',
  partnerKey: 'f5c8e398d51c6261da35f2c246505c99',
  notify_url: 'http://47.112.97.255/orders/notifiy',
  spbill_create_ip: '127.0.0.1'
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //3. 初始化
  const api = tenpay.init(config);
  
  //4. 获取支付参数
  let result = await api.getPayParams({
    out_trade_no: event.order_number + '',
    body: '这是一次支付',
    total_fee: 1,
    openid: wxContext.OPENID
  });

  return result
}