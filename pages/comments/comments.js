// pages/comments/comments.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
let allComments=[];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    comments: [],
    hotComment:[],
    type:"",
    allLen:0,
    goodLen:0,
    badLen:0,
    buyLen:0,
    authLen:0,
    cityLen:0,
    filterType:"all",
    averagePoint:"暂无评分",
    name:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + options.type +'/find',
      data: {
        movieID: options.id
      },
      success: (res) => {
        let title = (options.type == 'audComment' ? "观众评论" : "专业评论") + " - " + options.name;
        wx.setNavigationBarTitle({
          title
        });
        this.setData({
          type: options.type
        })
        res.data.forEach((comment)=>{
          comment["OffsetDays"] = this.getOffsetDays((new Date(comment.date.replace(/\-/g, "\/") + " " + comment.time)).getTime());
          comment["start"] = this.showStart(comment.point);
          comment["isThumb"] = false;
        });
        allComments = this.getNewCom(res.data);
        this.setData({
          allLen: this.fliterComment("all").length,
          comments: allComments.splice(0,50)
        })
        if (options.type == 'audComment') {
          this.setData({
            hotComment: this.getHotCom(res.data),
            goodLen: this.fliterComment("good").length,
            badLen: this.fliterComment("bad").length,
            buyLen: this.fliterComment("buy").length,
            authLen: this.fliterComment("authentication").length,
            cityLen: this.fliterComment("city").length
          });
        } else {
          this.setData({
            averagePoint: this.averagePoint(res.data),
            name: options.name
          });
        }
      }
    })
  },
// 获取最热十条观众评论
 getHotCom(data){
   let hotComs = [...data];
   hotComs.sort((a,b)=>{
     return b.thumbs - a.thumbs;
   });
   return hotComs.slice(0, 10);
  },
  // 获取评论按时间排序
  getNewCom(data) {
    let newComs = data.filter((comment) => new Date().getTime() >= new Date(comment.date.replace(/\-/g, "\/") + " " + comment.time).getTime());
    newComs.sort((a, b) => {
      let pre_date = (new Date(a.date.replace(/\-/g, "\/") + " " + a.time)).getTime();
      let next_date = (new Date(b.date.replace(/\-/g, "\/") + " " + b.time)).getTime();
      return  next_date - pre_date;
    });
    return newComs;
  },
//筛选评论
fliterComment(type){
  switch(type){
    case "all": return allComments;
    case "good": return allComments.filter((comment) => comment.point>5);
    case "bad": return allComments.filter((comment) => comment.point <= 5);
    case "buy": return allComments.filter((comment) => comment.isBuy);
    case "authentication": return allComments.filter((comment) => comment.isAuthentication );
    case "city": return allComments.filter((comment) => comment.address =="成都市");
  }
},
//设置当前显示评论
curComment(){
  this.setData({
    comments: this.fliterComment(this.data.filterType).splice(0, 50)
  })
},
//获取平均分数
  averagePoint(data){
    let totalPoint = data.map((comment)=>{
      return comment.point;
    }).reduce((pre,cur)=>{
      return pre + cur;
    })
    return (totalPoint / data.length).toFixed(1);
},
// 星星点数转换为数组
showStart(point) {
  let start = [];
  for (let i = 0; i < 10; i++) {
    if (i < parseInt(point)) {
      start.push(1);
    } else {
      start.push(0);
    }
  }
  return start;
  },
  // 将具体时间与当前时间进行计算，返回xx天前等
  getOffsetDays(targetTime) {
    let currentTime = new Date().getTime();
    let offsetTime = Math.abs(targetTime - currentTime);
    let offsetDays = Math.floor(offsetTime / (3600 * 24 * 1e3));
    if (Math.floor(offsetTime / (60 * 1e3)) < 60) {
      return Math.floor(offsetTime / (60 * 1e3)) + "分钟前";
    } else if (Math.floor(offsetTime / (3600 * 1e3)) < 24) {
      return Math.floor(offsetTime / (3600 * 1e3)) + "小时前";
    } else if (Math.floor(offsetTime / (3600 * 24 * 1e3)) < 30) {
      return Math.floor(offsetTime / (3600 * 24 * 1e3)) + "天前";
    } else if (Math.floor(offsetTime / (3600 * 24 * 30 * 1e3)) < 12) {
      return Math.floor(offsetTime / (3600 * 24 * 30 * 1e3)) + "个月前";
    } else {
      return "1年前";
    }
  },
  //点击筛选
  clickFilter(e){
    this.setData({
      comments: this.fliterComment(e.target.dataset.type).splice(0, 50),
      filterType:e.target.dataset.type
    })
  },
  //点赞
  clickThumbs(e) {
    if (e.target.dataset.thumb) {
      let id = e.target.dataset.thumb;
      let arr_type = e.target.dataset.type;
      let comments=[]
      if (e.target.dataset.hot){
        comments = [...this.data.hotComment];
      }else{
        comments = [...this.data.comments];
      }
      comments.forEach((comment) => {
        if (comment._id == id) {
          comment.isThumb = !comment.isThumb;
          comment.thumbs = parseInt(comment.thumbs) + (comment.isThumb ? 1 : -1);
          wx.request({
            url: SERVER + arr_type + "/update",
            data: {
              _id: id,
              thumbs: comment.thumbs
            }
          })
          return;
        }
      })
      let comment = e.target.dataset.hot ? 'hotComment' : 'comments'
      this.setData({
        [comment]:comments
      })
    }
  }
})