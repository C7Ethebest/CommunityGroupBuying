Page({
  data: {
    checked: true,
    userInfo: []
  },

  onLoad() {
    let users = wx.getStorageSync('users') || [];
    this.setData({
      users
    });
  },
  onShow() {
    // 从缓存中获取userInfo
    const users = wx.getStorageSync('users');
    this.setData({
      users: users
    })
    console.log('从缓存中获取到的users：', users);
  },


  //复选框变化时
  onCheckboxChange(event) {
    if (!event) return;
    let index = event.currentTarget.dataset.index;
    console.log('index', index);
    let {
      users
    } = this.data;
    let oldCheckStatus = users[index].checked; //获得旧的复选框状态
    // 将所有项的 checked 状态置为 false
    users.forEach((item, idx) => {
      if (idx !== index && item.checked) {
        item.checked = false;
      }
    });
    users[index].checked = !oldCheckStatus; //将当前项的复选框状态取反
    this.setData({
      users
    });
    // 将更新后的 users 数组写入缓存
    wx.setStorageSync('users', users);
  },


  // 跳转编辑界面
  onEdit(event) {
    let index = event.currentTarget.dataset.index;
    let user = this.data.users[index];
    console.log('index',index);
    console.log('user',user);
    wx.navigateTo({
      url: '/pages/editUserInfo/editUserInfo?info=' + JSON.stringify(user) + '&index=' + index
    })
  },

  onAddUser() {
    wx.navigateTo({
      url: '/pages/addUserInfo/addUserInfo',
    })
  }
})