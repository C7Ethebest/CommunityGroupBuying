//app.js
App({
  onLaunch: function () {

    //配置云开发环境
     wx.cloud.init({
       env:'shequtuangou-3gbr2gmy99c18698'
     }) 

  },
  globalData: {
    userInfo: null
  }
  
})