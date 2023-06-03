// 获取数据库
const db = wx.cloud.database()
// 获取集合
const goods_col = db.collection('goods')
const carts_col = db.collection('carts')

// 引入 异步操作
import {
  ml_showToastSuccess
} from '../../utils/asyncWX.js'

Page({
  data: {
    goods: [], // 商品列表数据
    carts: [],
    goodsList: [], //实际显示商品的数据
    activeKey: 0 //侧边栏激活的Key
  },

  onLoad() {
    this.refreshData();
  },

  onShow() {
    this.refreshData();
  },


  onChangeSidebar(event) {
    // 定义一个对象，存储每个选项对应的分类
    const categoryMap = {
      '0': '', // 0 表示全部商品分类
      '1': 'vegetables', // 1 表示蔬菜分类
      '2': 'fruit', // 2 表示水果分类
      '3': 'meatAndEggs', // 3 表示肉蛋分类
      '4': 'drink' // 4 表示饮料分类
    };

    // 获取选中项的索引值
    const activeKey = event.detail;
    console.log("activeKey", activeKey);

    // 更新 activeKey 的状态
    this.setData({
      activeKey: activeKey
    });

    // 判断选中项的索引值是否为 0（即全部商品分类）
    if (activeKey === 0) {
      // 如果是，调用 getGoodsList 函数加载所有商品列表
      this.getGoodsList(activeKey);
    } else {
      // 如果不是，根据选中项从 categoryMap 对象中获取对应的分类
      const category = categoryMap[activeKey];
      console.log('category', category);

      // 调用 getGoodsList 函数加载对应分类的商品列表
      this.getGoodsList(category || '');
    }
  },



  // 刷新页面数据
  refreshData() {
    const activeKey = wx.getStorageSync('activeKey') || '0';
    // 更新左侧 sidebar 选中项
    this.setData({
      activeKey: activeKey
    });
    const categoryMap = {
      '1': 'vegetables',
      '2': 'fruit',
      '3': 'meatAndEggs',
      '4': 'drink'
    };
    const category = categoryMap[activeKey];
    this.getGoodsList(category || '');
  },

  // 加载列表数据
  getGoodsList(tags) {
    let query = wx.cloud.database().collection('goods');
    // 如果 tags 参数不为空，则根据它过滤记录；否则，查询所有记录
    if (tags) {
      query = query.where({
        tags: tags
      });
    }
    query.get().then(res => { // 返回 Promise 对象，在查询完成后执行回调函数
      // 更新 goodsList 的状态，用于渲染页面
      this.setData({
        goodsList: res.data || [] // 当查询结果为空时，将 goodsList 设置为空数组
      });
    }).catch(err => { // 出现错误时，打印错误信息
      console.error(err);
    });
  },


  // 加入到购物车
  addCart(event) {
    console.log(event);
    let goods = event.currentTarget.dataset.item;
    let cartItem = {
      id: goods._id,
      title: goods.title,
      price: goods.price,
      imageSrc: goods.imageSrc,
      num: 1,
      checked: true
    };
    // 将商品信息添加到购物车数组中
    let carts = wx.getStorageSync('carts') || [];
    let index = carts.findIndex(item => item.id === cartItem.id);
    if (index !== -1) {
      carts[index].num += 1;
    } else {
      carts.push(cartItem);
    }
    wx.setStorageSync('carts', carts);
    this.setTabbar()
    // 更新购物车页面
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 2000
    });
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
    } else{
      wx.setTabBarBadge({
        index: 2,
        text: checkedCount.toString()
      });
    }
  },

  // 当搜索框内容发生变化时触发
  onChangeSearch(e) {
    this.setData({
      value: e.detail,
    });
  },
  //搜索
  onSearch() {
    const keyword = this.data.value;
    console.log('搜索关键词:', keyword);
    wx.navigateTo({
      url: `/pages/search/search?keyword=${keyword}`, // 将搜索关键词作为参数传递给search页面
    });
  },
})