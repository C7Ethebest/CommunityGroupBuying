/**
 * 显示加载框
 */
export const ml_showLoading = () => {
  return new Promise((resolve) => {
    wx.showLoading({
      title: 'Loading...',
      success: resolve
    })
  })
}
/**
 * 隐藏加载框
 */
export const ml_hideLoading = () => {
  return new Promise((resolve) => {
    wx.hideLoading({
      success: resolve
    })
  })
}

/**
 * 消息提示框
 */
export const ml_showToast = (title) => {
  return new Promise((resolve) => {

    wx.showToast({
      title,
      icon :'none',
      success: resolve
    })
  })
}


/**
 * 消息提示框 -成功
 */

export const ml_showToastSuccess = (title) => {
  return new Promise((resolve) => {

    wx.showToast({
      title,
      success: resolve
    })
  })
}

/**
 *  发起支付
 */

export const ml_payment = (pay) => {
  return new Promise((resolve,reject) => {

      wx.requestPayment({
        ...pay,
        success: resolve,
        fail: reject
      })
   
  })
}