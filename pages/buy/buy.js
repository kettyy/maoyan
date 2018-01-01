// pages/buy/buy.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    match: {},
    chooseSeat: [],
    time:"15:00",
    disCard:{},
    user:{},
    date:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showModal({
      title: '确认订单',
      content: '座位预定成功，请仔细核对场次信息，并在15分钟内完成支付，购买后无法退换',
      showCancel:false
    })
    let endTime=Date.now()+15*60*1e3;
    let getTime=setInterval(()=>{
      let time = (endTime - Date.now())/1e3;
      let h = parseInt(time/60);
      let s = parseInt(time%60);
      this.setData({
        time:(h<10?"0"+h:h)+":"+(s<10?"0"+s:s)
      })
      if (time<=0){
        clearInterval(getTime);
        wx.showModal({
          title: '支付超时，该订单已失效',
          content: '请重新购买',
          showCancel: false,
          confirmText:"知道了",
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    },1000)
    this.setData({
      chooseSeat: JSON.parse(options.choose),
      date: options.date
    })
    wx.request({
      url: SERVER + 'match/find',
      data:{
        _id: options.id,
        submitType: "findJoin",
        ref: ["film", "cinema", "hall"]
      },
      success:(res)=>{
        this.setData({
          match:res.data
        })
      }
    })
    setTimeout(() => {
      wx.request({
        url: SERVER + 'disCard/find',
        data: {
          _id: this.data.match.cinema[0].disCard[0]
        },
        success: (response) => {
          this.setData({
            disCard: response.data
          })
        }
      })
    },300)
    
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
  //点击付款
  payment(){
    let seats=[...this.data.match.seat];
    this.data.chooseSeat.forEach((seat)=>{
      seats[seat[0]][seat[1]]=2;
    })
    let order=[...this.data.user.order];
    order.push({
      match:this.data.match._id,
      chooseSeat: this.data.chooseSeat
    })
    wx.request({
      url: SERVER + 'user/update',
      data:{
        _id:this.data.user._id,
        order
      }
    })
    wx.request({
      url: SERVER + 'match/update',
      data:{
        _id: this.data.match._id,
        seat: seats
      },
      success:(res)=>{
        wx.showToast({
          title: '购买成功',
          icon: 'success',
          duration: 2000
        })
        wx.navigateTo({
          url: '/pages/myOrder/myOrder'
        })
      }
    })
  }
})