const db = wx.cloud.database()
const carts_col = db.collection('carts')

Page({
  data: {
    carts: [],
    totalPrice: 0,
    allChecked: false
  },
  onLoad() {
    let carts = wx.getStorageSync('carts') || [];
    let empty = carts.length === 0 ? true : false; //无商品则显示空
    // 从本地存储中获取购物车商品信息及选中状态
    let totalPrice = this.getTotalPrice(carts);
    let allChecked = this.getAllChecked(carts);
    this.setData({
      empty: empty,
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked
    });
    // 更新tabbar上的数字
    this.setTabbar()
  },

  onShow() {
    let carts = wx.getStorageSync('carts') || [];
    let empty = carts.length === 0 ? true : false; //无商品则显示空
    // 从本地存储中获取购物车商品信息及选中状态
    let totalPrice = this.getTotalPrice(carts);
    let allChecked = this.getAllChecked(carts);
    this.setData({
      empty: empty,
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked,
    });
    // 更新tabbar上的数字
    this.setTabbar()
  },

  // 计算购物车商品总价
  getTotalPrice(carts) {
    let totalPrice = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].checked) {
        totalPrice += carts[i].price * carts[i].num * 100;
      }
    }
    return totalPrice;
  },


  // 判断购物车中所有商品是否都被勾选
  getAllChecked(carts) {
    for (let i = 0; i < carts.length; i++) {
      if (!carts[i].checked) {
        return false;
      }
    }
    return true;
  },

  // 更新 TabBar 上的数字
  setTabbar() {
    let carts = wx.getStorageSync('carts') || [];
    let checkedCount = 0;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].checked) {
        checkedCount += carts[i].num;
      }
    }
    if (checkedCount.toString() == 0) {
      wx.setTabBarBadge({
        index: 2,
        text: '',
      });
    } else {
      wx.setTabBarBadge({
        index: 2,
        text: checkedCount.toString()
      });
    }
  },

  // 勾选商品复选框
  onCheckboxChange(e) {
    let index = e.currentTarget.dataset.index; // 修改被勾选商品的 checked 值，用来标记商品是否被勾选
    let carts = this.data.carts; // 获取购物车数据
    carts[index].checked = !carts[index].checked; // 修改被勾选商品的 checked 值取反
    let totalPrice = this.getTotalPrice(carts);
    let allChecked = this.getAllChecked(carts);
    this.setData({
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked
    });
    // 将购物车数据存储到本地
    wx.setStorageSync('carts', carts);
    // 更新tabbar上的数字，只显示已勾选的商品数量
    this.setTabbar();
  },

  // 全选或取消全选
  onAllChange(e) {
    let allChecked = e.detail;
    let carts = this.data.carts;
    for (let i = 0; i < carts.length; i++) {
      carts[i].checked = allChecked;
    }
    let totalPrice = this.getTotalPrice(carts);
    this.setData({
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked
    });
    // 将购物车数据存储到本地
    wx.setStorageSync('carts', carts);
    // 更新tabbar上的数字，只显示已勾选的商品数量
    this.setTabbar();
  },


  // 修改商品数量
  onChangeStepper(event) {
    let id = event.currentTarget.dataset.id; // 获取步进器所关联商品的ID
    let carts = this.data.carts;
    for (let i = 0; i < carts.length; i++) {
      if (carts[i].id === id) {
        carts[i].num = event.detail;
        // 如果数量为 0，将该商品从购物车中删除
        if (carts[i].num === 0) {
          carts.splice(i, 1);
          // let empty = true; //无商品显示空
          // this.setData({
          //   empty: empty
          // })
        }
        break;
      }
    }
    let totalPrice = this.getTotalPrice(carts);
    let allChecked = this.getAllChecked(carts);
    this.setData({
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked,
    });
    // 将购物车数据存储到本地
    wx.setStorageSync('carts', carts);
    if (carts.length == 0) {
      let empty = true; //无商品显示空
      this.setData({
        empty: empty
      })
    }
    this.setTabbar()
  },


  // 删除商品
  onDelete(e) {
    let index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    carts.splice(index, 1);
    let totalPrice = this.getTotalPrice(carts);
    let allChecked = this.getAllChecked(carts);
    this.setData({
      carts: carts,
      totalPrice: totalPrice,
      allChecked: allChecked
    });
    // 如果购物车为空，tabbar设空
    if (carts.length == 0) {
      wx.setTabBarBadge({
        index: 2,
        text: '',
      });
      let empty = true; //无商品显示空
      this.setData({
        empty: empty
      })
    } else {
      // 有则更新tabbar上的数字
      wx.setTabBarBadge({
        index: 2,
        text: carts.length.toString()
      });
    }
    // 将购物车数据存储到本地
    wx.setStorageSync('carts', carts);
  },


  //将勾选商品及商品总价传给confirm页面
  goConfirm() {
    // 检查缓存中是否存在用户信息
    const userInfo = wx.getStorageSync('user');
    if (!userInfo) {
      // 如果缓存中不存在用户信息，则跳转到“我的”页面
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my',
            })
          }, 1500);
        }
      });
      return;
    }
    const carts = this.data.carts
    const totalCount = carts.filter(item => item.checked).reduce((acc, cur) => acc + cur.num, 0);
    // 判断购物车中是否有选中的商品
    if (totalCount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    const totalPrice = this.data.totalPrice
    const checkedGoods = carts.filter(item => item.checked === true)
    const confirmedInfo = {
      checkedGoods: checkedGoods,
      totalCount: totalCount,
      totalPrice: totalPrice
    }
    // 跳转到确认订单页面
    wx.navigateTo({
      url: '/pages/confirm/confirm?confirmedInfo=' + JSON.stringify(confirmedInfo)
    })
  },




})