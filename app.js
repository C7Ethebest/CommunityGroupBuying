//app.js
App({
  onLaunch: function () {

    //配置云数据库环境
     wx.cloud.init({
       env:'cloud1-2g83huek7073ebf1'
     }) 

  },
  globalData: {
    userInfo: null
  }
})