// pages/disCard/disCard.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    disCard:{},
    checked:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + 'disCard/find',
      data:{
        _id: options.id
      },
      success:(res)=>{
        this.setData({
          disCard:res.data
        })
      }
    })
  },
  checkbox(e){
    this.setData({
      checked: !this.data.checked
    })
  },
  //点击购买
  clickBuy(){
    if (this.data.checked){
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
                data: {
                  _id: user,
                  disCards: [...res.data.disCards, this.data.disCard._id]
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
  }
})