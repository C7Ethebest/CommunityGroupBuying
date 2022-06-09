// pages/punchin/punchin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
  },

  beforeRead(event) {
    const { file, callback } = event.detail;
    callback( file.type === 'image' );
  },

  afterRead(event) {
    const file = event.detail.file 
    
    //还没上传时将选择的图片的上传状态设置为加载    
    var that = this
    const fileList = that.data.fileList 
    fileList.push({})
    fileList[ fileList.length-1 ].status='uploading'
    that.setData({ fileList })

    this.uploadFile( file.url )
  },

  // 上传图片到云开发的存储中
  uploadFile( fileURL) {
    var that = this
    //上传文件
    const filePath = fileURL // 小程序临时文件路径
    const cloudPath = `${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}` + filePath.match(/\.[^.]+?$/)[0]
    // 给文件名加上时间戳和一个随机数，时间戳是以毫秒计算，而随机数是以 1000 内的正整数，除非 1 秒钟（1 秒=1000 毫秒）上传几十万张照片，不然文件名是不会重复的。
    // 将图片上传至云存储空间
    wx.cloud.uploadFile({
      cloudPath, // 指定上传到的云路径
      filePath // 指定要上传的文件的小程序临时文件路径
    }).then(res => {
      // 上传一张图片就会打印上传成功之后的 res 对象，里面包含图片在云存储里的 fileID，注意它的文件名和文件后缀
      console.log("res.fileID", res.fileID)
      // 上传完成需要更新 fileList
      const fileList = that.data.fileList 
      fileList[ fileList.length-1 ].url = res.fileID
      fileList[ fileList.length-1 ].status='done' //将上传状态修改为已完成
      that.setData({ fileList })
      console.log("fileList", fileList)
      wx.showToast({ title: '上传成功', icon: 'none' })
    }).catch((e) => {
      wx.showToast({ title: '上传失败', icon: 'none' })
      const fileList = that.data.fileList 
      fileList[ fileList.length-1 ].status='failed' //将上传状态修改为已完成
      that.setData({ fileList })
      console.log(e)
    });
  },

  // 点击预览的x号，将图片删除
  deleteImg( event) {
    var that = this//这里加上一句，不然会报错 that 未定义
   // event.detail.index: 删除图片的序号值
   const delIndex = event.detail.index
 const fileList = that.data.fileList 
 
   // 云存储删除（真删除）
   var fileID = fileList[ delIndex].url
   this.deleteCloudImg( fileID)
   
   // 页面删除（假删除）
   // 添加或删除 array.splice(index,howmany,item1,.....,itemX)
   fileList.splice( delIndex, 1)
   this.setData({ fileList })
  },

  // 删除云存储的图片
  deleteCloudImg( fileID) {
    wx.cloud.deleteFile({
      fileList: [ fileID],
    }).then(res => {
      // handle success
      console.log(res.fileList)
    }).catch((e) => {
      wx.showToast({ title: '删除失败', icon: 'none' })
      console.log(e)
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})