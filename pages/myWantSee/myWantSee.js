// pages/myWantSee/myWantSee.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    wantSee: []
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
            if (res.data.wantSee.length) {
              wx.request({
                url: SERVER + 'film/find',
                data: {
                  ids: res.data.wantSee,
                  submitType: "findIds"
                },
                success: (res) => {
                  this.setData({
                    wantSee: res.data
                  })
                }
              })
            }
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