// pages/writeCom/writeCom.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    movieID:"",
    user:{},
    starts:[],
    point:0,
    evaluate:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieID: options.id
    })
    let starts=[];
    for(let i =0;i<10;i++){
      starts.push(0)
    }
    this.setData({
      starts
    })
    wx.request({
      url: SERVER + 'user/find',
      data:{
        _id: options.user
      },
      success:(res)=>{
        this.setData({
          user:res.data
        })
      }
    })
  },
  // 星星点数转换为数组
  showStart(e) {
    if(e.target.dataset.point){
      let starts = [];
      let point = e.target.dataset.point;
      for (let i = 0; i < 10; i++) {
        if (i < parseInt(point)) {
          starts.push(1);
        } else {
          starts.push(0);
        }
      }
      let evaluate;
      if (point<3){
        evaluate="超烂啊";
      } else if (point < 5){
        evaluate = "比较差";
      } else if (point < 7){
        evaluate = "一般般";
      } else if (point < 9){
        evaluate = "比较好";
      } else if (point < 10){
        evaluate = "棒极了";
      }else{
        evaluate = "完美";
      }
      this.setData({
        starts,
        point,
        evaluate
      })
    }
  },
  bindFormSubmit: function (e) {
    if(!this.data.point){
      wx.showToast({
        title: '请点击评分',
        duration: 2000
      })
    } else if (!e.detail.value.textarea){
      wx.showToast({
        title: '请输入评论内容',
        duration: 2000
      })
    }else{
      let now=new Date();
      wx.request({
        url: SERVER + 'audComment/add',
        data:{
          "name": this.data.user.name,
          "portrait": this.data.user.portrait,
          "point": this.data.point,
          "comment": e.detail.value.textarea,
          "isBuy": true,
          "isAuthentication": true,
          "thumbs": 0,
          "date": now.toLocaleDateString().replace(/\//g, "\-"),
          "time": now.toLocaleTimeString('chinese', { hour12: false }),
          "address": "成都市",
          movieID: this.data.movieID
        }
      })
      let haveSee = [...this.data.user.haveSee];
      haveSee.push(this.data.movieID);
      wx.request({
        url: SERVER + 'user/update',
        data:{
          _id: this.data.user._id,
          haveSee
        }
      })
      wx.showToast({
        title: '评论成功',
        icon: 'loading',
        duration: 1000
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        })
      },1000)
    }
  }
})