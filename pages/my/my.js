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
    // 使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    wx.getUserProfile({
      desc: '用于完善会员资料', // 获取用户个人信息后的用途
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
    wx.removeStorageSync('user');   //清空缓存中用户信息  
    let userInfo = '' //界面用户信息设空
    //同步到data
    this.setData({
      userInfo: ''
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
    //拿出缓存中的用户信息
    let user= wx.getStorageSync('user')
    this.setData({
      userInfo: user
    })
    wx.setStorageSync('user', null)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})