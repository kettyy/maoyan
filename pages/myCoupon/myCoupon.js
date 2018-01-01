// pages/myCoupon/myCoupon.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    coupon: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = null;
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        user = res.data;
      }
    })
    setTimeout(() => {
      if (user) {
        wx.request({
          url: SERVER + 'user/find',
          data: {
            _id: user
          },
          success: (res) => {
            this.setData({
              coupon: res.data.coupon
            })
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/chooseLogin/chooseLogin'
        })
      }
    }, 100)
  }
})