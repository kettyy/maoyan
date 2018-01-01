// pages/login/login.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({
  formSubmit: function (e) {
    wx.request({
      url: SERVER+'user/find',
      data: {
        tel: e.detail.value.phone,
        pwd: e.detail.value.pwd,
        findType: "exact"
      },
      success: function (res) {
        if(res.data.length){
          wx.setStorage({
            key: "userId",
            data: res.data[0]._id
          })
          wx.navigateBack({
            delta: 1
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '手机号或密码输入不正确',
            showCancel:false
          })
        }
      }
    })
  }
})