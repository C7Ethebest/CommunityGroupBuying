// 获取数据库
const db = wx.cloud.database()
// 获取集合
const goods_col = db.collection('goods')
const carts_col = db.collection('carts')

Page({


  data :{
    goods: [],
    detail : {}
  },
  onLoad(options){

    let { id } = options

    this.loadDetailData(id)
  },
  // 加载详情数据
  async loadDetailData(id){

    // 拿到数据库的商品
    let ins = goods_col.doc(id)

    //+1
    await ins.update({
      data :{
        count : db.command.inc(1)
      }
    })

    // 获取
   let res =  await ins.get()

   // 赋值
   this.setData({
     detail : res.data
   })

  },
})