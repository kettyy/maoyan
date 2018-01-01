// pages/atlas/atlas.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie: {},
    CMD,
    SERVER,
    choose:"all",
    imgs:[]
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
      success: (res) => {
        this.setData({
          movie: res.data,
        });
        wx.setNavigationBarTitle({
          title: res.data.name
        });
        setTimeout(()=>{
          this.showImg();
        },100)
      }
    })
  },
// 标签切换
  changeTab(e){
    this.setData({
      choose: e.target.dataset.type
    });
    this.showImg();
  },
  showImg(){
    let imgs=[];
    let getStills=()=>{
      for (let img of this.data.movie.imgs.Stills){
        imgs.push(img);
      }
    }
    let getPoster = () => {
      for (let img of this.data.movie.imgs.poster) {
        imgs.push(img);
      }
    }
    let getWorkimg = () => {
      for (let img of this.data.movie.imgs.workimg) {
        imgs.push(img);
      }
    }
    let getNewsimg = () =>{
      for (let img of this.data.movie.imgs.newsimg) {
        imgs.push(img);
      }
    }
    switch (this.data.choose){
      case "all":{
        getStills();
        getPoster();
        getWorkimg();
        getNewsimg();
        break;
      };
      case "Stills": {
        getStills();
        break;
      };
      case "poster": {
        getPoster();
        break;
      };
      case "workimg": {
        getWorkimg();
        break;
      };
      case "newsimg": {
        getNewsimg();
        break;
      };
    }
    this.setData({
      imgs
    })
  }
})