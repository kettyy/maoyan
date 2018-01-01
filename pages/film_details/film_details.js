// pages/film_details/film_details.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movie:{},
    audComment:[],
    proComment:[],
    textIsOpen:false,
    rank:0,
    partAudComment:[],
    partProComment: [],
    type: "",
    CMD,
    SERVER,
    user:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user=null;
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        user = res.data;
      }
    })
    wx.request({
      url: SERVER+'film/find',
      data: {
        _id: options.id
      },
      success: (res) => {
        res.data["start"] = this.showStart(res.data.point);
        res.data.firstboxOffice = parseInt(res.data.firstboxOffice / 1000);
        res.data.boxOffice = parseInt(res.data.boxOffice / 1000);
        this.setData({
          movie: res.data,
          rank: parseInt(options.index) + 1,
          type: options.type
        })
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
            let { movie } = this.data;
            res.data.wantSee.forEach((want)=>{
              if (want == movie._id){
                movie["wantSee"]=true;
              }
            })
            if (!movie.wantSee){
              movie["wantSee"] = false;
            }
            res.data.haveSee.forEach((have) => {
              if (have == movie._id) {
                movie["haveSee"] = true;
              }
            })
            if (!movie.haveSee){
              movie["haveSee"] = false;
            }
            this.setData({
              user: res.data,
              movie
            })
          }
        })
      }
    }, 100)
    wx.request({
      url: SERVER+'audComment/find',
      data: {
        movieID: options.id
      },
      success: (res) => {
        let partAudComment = res.data.slice(0, 3);
        partAudComment.forEach((comment)=>{
          comment["OffsetDays"] = this.getOffsetDays((new Date(comment.date.replace(/\-/g, "\/") + " " + comment.time)).getTime());
          comment["start"] = this.showStart(comment.point);
          comment["isThumb"] = false;
        })
        this.setData({
          audComment: res.data,
          partAudComment
        })
      }
    })
    wx.request({
      url: SERVER+'proComment/find',
      data: {
        movieID: options.id
      },
      success: (res) => {
        let partProComment = res.data.slice(0, 3);
        partProComment.forEach((comment) => {
          comment["OffsetDays"] = this.getOffsetDays((new Date(comment.date.replace(/\-/g, "\/") + " " + comment.time)).getTime());
          comment["isThumb"]=false;
        })
        this.setData({
          proComment: res.data,
          partProComment
        })
      }
    })
  },
  // 星星点数转换为数组
  showStart(point){
    let start=[];
    for(let i=0;i<10;i++){
      if (i < parseInt(point)){
        start.push(1);
      }else{
        start.push(0);
      }
    }
    return start;
  },
  // 展开详情
  openText(){
    this.setData({
      textIsOpen: !this.data.textIsOpen
    })
  },
  // 将具体时间与当前时间进行计算，返回xx天前等
  getOffsetDays(targetTime){
    let currentTime = Date.now();
    let offsetTime = Math.abs(targetTime - currentTime);
    let offsetDays = Math.floor(offsetTime / (3600 * 24 * 1e3));
    if (Math.floor(offsetTime / (60 * 1e3))<60){
      return Math.floor(offsetTime / (60 * 1e3))+"分钟前";
    } else if (Math.floor(offsetTime / (3600 * 1e3))<24){
      return Math.floor(offsetTime / (3600 * 1e3))+"小时前";
    } else if (Math.floor(offsetTime / (3600 *24 * 1e3))<30){
      return Math.floor(offsetTime / (3600 * 24* 1e3))+"天前";
    } else if (Math.floor(offsetTime / (3600 * 24*30 * 1e3))<12){
      return Math.floor(offsetTime / (3600 * 24 * 30 * 1e3))+"个月前";
    }else{
      return "1年前";
    }
  },
  //点击写短评
  writeCom(){
    if(this.data.user){
      if (!this.data.movie.haveSee){
        wx.navigateTo({
          url: '/pages/writeCom/writeCom?id=' + this.data.movie._id + "&user=" + this.data.user._id
        })
      }
    }else{
      wx.navigateTo({
        url: '/pages/chooseLogin/chooseLogin'
      })
    }
  },
  //点击想看
  clickWant(){
    if (this.data.user){
      let wantSee = [...this.data.user.wantSee];
      if (!this.data.movie.wantSee){
        wantSee.push(this.data.movie._id);
      }else{
        wantSee.forEach((want,index)=>{
          if (want == this.data.movie._id){
            wantSee.splice(index,1);
            return;
          }
        })
      }
      wx.request({
        url: SERVER + 'user/update',
        data: {
          _id: this.data.user._id,
          wantSee
        },
        success: (res) => {
          let { movie } = this.data;
          movie.wantSee = !this.data.movie.wantSee;
          this.setData({
            movie
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/chooseLogin/chooseLogin'
      })
    }
  },
  //点赞
  clickThumbs(e){
    if (e.target.dataset.thumb){
      let id = e.target.dataset.thumb;
      let arr_type = e.target.dataset.type;
      let comments = [...this.data[arr_type]];
      comments.forEach((comment)=>{
        if (comment._id == id){
          comment.isThumb = !comment.isThumb;
          comment.thumbs = parseInt(comment.thumbs)+ (comment.isThumb ? 1 : -1);
          wx.request({
            url: SERVER + (arr_type[4] == "A" ? "audComment" : "proComment") + "/update",
            data: {
              _id: id,
              thumbs: comment.thumbs
            }
          })
          return;
        }
      })
      this.setData({
        [arr_type]: comments
      })
    }
  }
})