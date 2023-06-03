// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//1. 引入 tenpay
const tenpay = require('tenpay');
//2. 配置
const config = {
  appid: 'wx38d8faffac4d34d2',  //AppID
  mchid: '',    //微信商户号
  partnerKey: '',   //微信支付密钥
  notify_url: 'https://shequtuangou-3gbr2gmy99c18698-1305405939.ap-shanghai.app.tcloudbase.com/pay',  //支付回调网址
  spbill_create_ip: '127.0.0.1'   //本机IP地址
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //3. 初始化
  const api = tenpay.init(config);
  
  //4. 获取支付参数
  let result = await api.getPayParams({
    out_trade_no: event.orderId + '',    //商户内部订单号
    body: '快团方便买',   //商品描述
    total_fee: totalPrice,     //订单金额，单位为分
    openid: wxContext.OPENID  //付款用户的openid，在getWXContext中拉取
  });

  return result
}