// pages/video/video.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    movie:{},
    src:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + 'film/find',
      data: {
        _id: options.id
      },
      success:(res)=>{
        wx.setNavigationBarTitle({
          title: res.data.name+" - 预告片"
        });
        this.setData({
          movie:res.data,
          src: res.data.trailer[0]
        })
      }
    })
  },
  clickPlay(e){
    this.setData({
      src:e.target.dataset.src
    })
  }
})