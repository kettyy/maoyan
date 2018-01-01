// pages/chooseCin/chooseCin.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    cinemas:[],
    dates:[],
    movieID:"",
    choose:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER+ 'match/find',
      data:{
        movieID: options.id
      },
      success:(res)=>{
        this.setData({
          dates: this.filterDate(res.data),
          movieID: options.id,
          choose: this.filterDate(res.data).length?this.filterDate(res.data)[0].date:[]
        });
        wx.setNavigationBarTitle({
          title: options.name
        });
        this.getCinemas();
      }
    })
  },
  //日期去重
  filterDate(data){
    let dates=[];
    for (let i = 0; i < data.length; i++) {
      let n = 0;
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].date == data[j].date) {
          n++;
        }
      }
      let flag = new Date(new Date().toLocaleDateString())-new Date(data[i].date.replace(/\-/g, "\/"));
      if (!n && flag<=0) {
        let week=null;
        var weekArray = new Array("周日 ", "周一 ", "周二 ", "周三 ", "周四 ", "周五 ", "周六 ");
        let dateArr = data[i].date.split("-");
        if (flag==0){
          week = "今天 ";
        } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3))<2){
          week = "明天 ";
        } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3)) < 3){
          week = "后天 ";
        }else{
          week = weekArray[new Date(data[i].date.replace(/\-/g, "\/")).getDay()]
        }
        week += dateArr[1] + "月" + dateArr[2] + "日";
        dates.push({
          date: data[i].date,
          week
        });
      }
    }
    dates.sort((a,b)=>{
      return new Date(a.date.replace(/\-/g, "\/")) - new Date(b.date.replace(/\-/g, "\/"));
    });
    return dates;
  },
  //通过日期和电影id获取相应影院数据
  getCinemas(){
    let cinemas=[];
    wx.request({
      url: SERVER + 'match/find',
      data:{
        movieID: this.data.movieID,
        date: this.data.choose,
        submitType: "findJoin",
        ref: ["cinema",""]
      },
      success:(res)=>{
        for (let i = 0; i < res.data.length; i++) {
          let n = 0;
          for (let j = i + 1; j < res.data.length; j++) {
            if (res.data[i].cinemaID == res.data[j].cinemaID) {
              n++;
            }
          }
          if (!n ) {
            cinemas.push(res.data[i].cinema[0]);
          }
        }
        cinemas.sort((a,b)=>{
          return parseInt(a.distance) - parseInt(b.distance);
        });
        cinemas.forEach((cinema) => {
          let matchs=[];
          res.data.forEach((match)=>{
            if (match.cinemaID == cinema._id){
              let flag = Date.now() - new Date(this.data.choose.replace(/\-/g, "\/") + " " + match.startTime + ":00");
              flag<=0?matchs.push(match.startTime):"";
            }
          });
          matchs.sort((a,b)=>{
            return new Date(new Date().toLocaleDateString() + " " + a + ":00") - new Date(new Date().toLocaleDateString() + " " + b + ":00");
          })
          if (matchs.length){
            matchs.length>3? matchs.length=3:"";
            cinema["matchs"] = matchs;
          }
        });
        this.setData({
          cinemas
        });
      }
    });
  },
  changeTab(e){
    if (e.target.dataset.date){
      this.setData({
        choose: e.target.dataset.date
      });
      this.getCinemas();
    }
  }
})