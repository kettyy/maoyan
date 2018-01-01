// pages/search/search.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    type:"",
    movies:[],
    cinemas:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
    if (options.type=="movie"){
      wx.request({
        url: SERVER+"film/find",
        data:{
          isShowing:"true"
        },
        success: (res) => {
          res.data.sort((a, b) => {
            return a.lastboxOffice - b.lastboxOffice;
          });
          this.setData({
            movies:res.data
          })
        }
      })
    }
  },
  clickMovie(e){
    if(e.target.dataset.id){
      wx.navigateTo({
        url: '/pages/film_details/film_details?id=' + e.target.dataset.id + '&index=' + e.target.dataset.index+'&type=showing'
      })
    }
  },
  searchCinema(e){
    if (e.detail.value){
      wx.request({
        url: SERVER + 'cinema/find',
        data: {
          name: e.detail.value,
          submitType: "findJoin",
          ref: ["disCard", ""]
        },
        success: (res) => {
          res.data.sort((a, b) => {
            return parseInt(a.distance) - parseInt(b.distance);
          })
          this.setData({
            cinemas: res.data
          })
        }
      })
    }else{
      this.setData({
        cinemas: []
      })
    }
  },
  quit(){
    wx.navigateBack({
      delta: 1
    })
  }
})