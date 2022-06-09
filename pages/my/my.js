// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,

  },

  login(e) {
    // 推荐使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '必须授权才可以继续使用', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        let user = res.userInfo
        //登陆用户信息缓存到本地
        wx.setStorageSync('user', user)
        console.log("用户信息",user)
        this.setData({
          userInfo: user
        })
      },
      fail:res =>{
        console.log('授权失败',res)
      }
    })
  },

  loginOut(){
    this.setData({
      userInfo:''
    })
  },

  reload() {
    // 页面重载
    const pages = getCurrentPages()
    // 声明一个pages使用getCurrentPages方法
    const curPage = pages[pages.length - 1]
    // 声明一个当前页面
    curPage.onLoad(curPage.options) // 传入参数
    curPage.onShow()
    curPage.onReady()
    // 执行刷新
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let user= wx.getStorageSync('user')
    console.log('进入小程序的my页面获得缓存',user)
    this.setData({
      userInfo: user
    })
    wx.setStorageSync('user', null)
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