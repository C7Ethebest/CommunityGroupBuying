Page({
  data: {
    user: {}
  },

  onLoad(options) {
    let info = options.info ? JSON.parse(options.info) : {};
    let index = options.index || -1;
    this.setData({
      user: info,
      index: index
    });
    console.log('info', info);
  },

  // 编辑提货人信息
  onEditUser() {
    // 获取用户名、电话号码和是否默认的值
    const userName = this.data.userName;
    const phoneNumber = this.data.phoneNumber;
    const isDefault = this.data.isDefault;
    // 创建用户对象
    const userInfo = {
      userName: userName,
      phoneNumber: phoneNumber,
      checked: true,
      isDefault: isDefault,
    };
    // 获取已有用户数据或初始化为空数组
    const users = wx.getStorageSync('users') || [];
    // 将所有项的 checked 状态置为 false  直接勾选新加的提货人
    users.forEach(item => {
      item.checked = false;
    });
    // 将新用户信息加入到数组中
    users.push(userInfo);
    // 存储用户数据到本地缓存中
    wx.setStorageSync('users', users);
    console.log('users', users);
    wx.navigateBack({
      delta: 1 //返回到上一页，触发onShow拿缓存数据
    })
  },

  //删除该用户信息
  onDelete() {
    wx.showModal({
      title: '提示',
      content: '确定要删除该用户信息吗？',
      success: (res) => {
        if (res.confirm) {
          let users = wx.getStorageSync('users') || [];
          let index = this.data.index
          console.log('index', index);
          if (index >= 0) {
            users.splice(index, 1);
            wx.setStorageSync('users', users);
          }
          wx.navigateBack();
        }
      }
    })
  },


  // 开关状态改变
  onChangeSwitch({
    detail
  }) {
    let user = this.data.user
    const isDefault = detail; // 获取开关状态
    user.isDefault = isDefault; // 如果开关打开，将 isDefault 设置为 true，否则设置为 false
    // 需要手动对 checked 状态进行更新
    this.setData({
      isDefault: detail
    });
    console.log('isDefault', isDefault);
  }

})