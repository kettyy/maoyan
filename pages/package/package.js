// pages/package/package.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    package:{},
    cinema:{},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + 'package/find',
      data: {
        _id: options.id
      },
      success: (res) => {
        let total = 0;
        for (let obj of res.data.goodsList) {
          total += parseInt(obj.num) * obj.price;
        }
        res.data["totalPrice"] = total;
        this.setData({
          package: res.data
        })
      }
    })
    wx.request({
      url: SERVER + 'cinema/find',
      data: {
        _id: options.cinemaID
      },
      success: (res) => {
        this.setData({
          cinema: res.data
        })
      }
    })
  },
  //点击购买
  clickBuy() {
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
            wx.request({
              url: SERVER + 'user/update',
              data:{
                _id: user,
                order: [...res.data.order,{
                  package: this.data.package._id,
                  cinemaName: this.data.cinema.name
                }]
              }
            })
          }
        })
        wx.showToast({
          title: '购买成功',
          duration: 2000
        })
      } else {
        wx.navigateTo({
          url: '/pages/chooseLogin/chooseLogin'
        })
      }
    }, 100)
  }
})