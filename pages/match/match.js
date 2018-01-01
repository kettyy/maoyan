// pages/match/match.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    cinema:{},
    dates:[],
    chooseMovieIndex:0,
    chooseDate: "",
    films:[],
    matchs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + 'cinema/find',
      data:{
        _id: options.id,
        submitType: "findJoin",
        ref: ["disCard","package"]
      },
      success:(res)=>{
        if (res.data.disCard.length){
          let index = res.data.disCard[0].firstCut.search(/[0-9]/);
          res.data.disCard[0]["discount"] = parseInt(res.data.disCard[0].firstCut.slice(index))/2;
        }
        if (res.data.package.length){
          res.data.package.forEach((ele)=>{
            let total=0;
            for (let obj of ele.goodsList){
              total += parseInt(obj.num) * obj.price;
            }
            ele["totalPrice"] = total;
          })
        }
        this.setData({
          cinema:res.data
        })
      }
    });
    wx.request({
      url: SERVER + 'match/find',
      data:{
        cinemaID: options.id,
        submitType: "findJoin",
        ref: [ "film",""]
      },
      success:(res)=>{
        this.setData({
          films: this.filterFilm(res.data)
        });
        if (options.movieID) {
          let index = null;
          this.data.films.forEach((flim,i)=>{
            if (flim._id == options.movieID){
              index=i;
            }
          })
          this.setData({
            chooseMovieIndex: index
          })
        }
        setTimeout(()=>{
          this.getMatch();
        },100)
        setTimeout(()=>{
          this.getCurMatch();
        },200)
      }
    })
  },
  //电影去重
  filterFilm(data){
    let films = [];
    for (let i = 0; i < data.length; i++) {
      let n = 0;
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].movieID == data[j].movieID) {
          n++;
        }
      }
      if (!n ) {
        films.push(data[i].film[0]);
      }
    }
    return films;
  },
  //日期去重
  filterDate(data) {
    let dates = [];
    for (let i = 0; i < data.length; i++) {
      let n = 0;
      for (let j = i + 1; j < data.length; j++) {
        if (data[i].date == data[j].date) {
          n++;
          break;
        }
      }
      let flag = new Date(new Date().toLocaleDateString()) - new Date(data[i].date.replace(/\-/g, "\/"));
      if (!n && flag <= 0) {
        let week = null;
        var weekArray = new Array("周日 ", "周一 ", "周二 ", "周三 ", "周四 ", "周五 ", "周六 ");
        let dateArr = data[i].date.split("-");
        if (flag == 0) {
          week = "今天 ";
        } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3)) < 2) {
          week = "明天 ";
        } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3)) < 3) {
          week = "后天 ";
        } else {
          week = weekArray[new Date(data[i].date.replace(/\-/g, "\/")).getDay()]
        }
        week += dateArr[1] + "月" + dateArr[2] + "日";
        dates.push({
          date: data[i].date,
          week
        });
      }
    }
    dates.sort((a, b) => {
      return new Date(a.date.replace(/\-/g, "\/")) - new Date(b.date.replace(/\-/g, "\/"));
    });
    return dates;
  },
  //获取选中电影的排片
  getMatch(){
    wx.request({
      url: SERVER + 'match/find',
      data: {
        cinemaID: this.data.cinema._id,
        movieID: this.data.films[this.data.chooseMovieIndex]._id
      },
      success:(res)=>{
        this.setData({
          dates: this.filterDate(res.data),
          chooseDate: this.filterDate(res.data).length?this.filterDate(res.data)[0].date:""
        });
      }
    })
  },
  //获取选中日期的排片
  getCurMatch(){
    wx.request({
      url: SERVER + 'match/find',
      data:{
        cinemaID: this.data.cinema._id,
        movieID: this.data.films[this.data.chooseMovieIndex]._id,
        date: this.data.chooseDate,
        submitType: "findJoin",
        ref: ["hall", ""]
      },
      success:(res)=>{
        let matchs=[];
        let duration = parseInt(this.data.films[this.data.chooseMovieIndex].duration) * 60 * 1e3;
        res.data.forEach((match)=>{
          let flag = Date.now() - new Date(this.data.chooseDate.replace(/\-/g, "\/") + " " + match.startTime + ":00").getTime();
          if (flag <= 0){
            let endTime = new Date(this.data.chooseDate.replace(/\-/g, "\/") + " " + match.startTime + ":00").getTime() + duration;
            match["endTime"] = (new Date(endTime).toLocaleTimeString('chinese', { hour12: false })).slice(0, 5);
            matchs.push(match);
          }
        });
        matchs.sort((a,b)=>{
          return new Date(new Date().toLocaleDateString() + " " + a + ":00") - new Date(new Date().toLocaleDateString() + " " + b + ":00");
        })
        this.setData({
          matchs
        })
      }
    })
  },
  scroll(e){
    let width = (e.detail.scrollWidth - 300) / this.data.films.length;
    this.setData({
      chooseMovieIndex: parseInt(e.detail.scrollLeft / width)
    });
    this.getMatch();
    this.getCurMatch();
  },
  clickM(e){
    if(e.target.dataset.index){
      this.setData({
        chooseMovieIndex: e.target.dataset.index
      })
    }
    this.getMatch();
    this.getCurMatch();
  },
  changeTab(e) {
    if (e.target.dataset.date) {
      this.setData({
        chooseDate: e.target.dataset.date
      });
      this.getCurMatch();
    }
  }
})