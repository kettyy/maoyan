// pages/cinema/cinema.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    CMD,
    SERVER
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER+'cinema/find',
      data:{
        submitType: "findJoin",
        ref: ["disCard",""]
      },
      success: (res) =>{
        res.data.sort((a,b)=>{
          return parseInt(a.distance) - parseInt(b.distance);
        })
        this.setData({
          list:res.data
        })
      }
    })
  }
})