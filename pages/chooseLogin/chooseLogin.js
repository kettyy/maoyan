// pages/chooseLogin/chooseLogin.js
Page({
  clickPhone(){
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },
  chilkWeixin(){
    wx.showModal({
      title: '授权提示',
      content: '微信尚未授权，请使用手机号登录'
    })
  }
})