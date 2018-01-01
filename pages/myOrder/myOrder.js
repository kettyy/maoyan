// pages/myOrder/myOrder.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD, 
    SERVER,
    order:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = null;
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        user = res.data;
      }
    })
    setTimeout(()=>{
      if (user){
        wx.request({
          url: SERVER + 'user/find',
          data:{
            _id: user
          },
          success:(res)=>{
            if(res.data.order.length){
              let match=[];
              let pack = [];
              let order = [...res.data.order];
              order.forEach((ele)=>{
                if (ele.match){
                  match.push(ele.match)
                }else{
                  pack.push(ele.package)
                }
              })
              if (match.length){
                wx.request({
                  url: SERVER + 'match/find',
                  data: {
                    submitType: "findIds",
                    ids: match,
                    ref: ["film", "cinema"]
                  },
                  success: (response) => {
                    match = response.data
                  }
                })
              }
              if (pack.length){
                wx.request({
                  url: SERVER + 'package/find',
                  data: {
                    submitType: "findIds",
                    ids: pack
                  },
                  success: (response) => {
                    pack = response.data
                  }
                })
              }
              setTimeout(()=>{
                order.forEach((ele) => {
                  if (ele.match) {
                    match.forEach((m)=>{
                      if (ele.match==m._id){
                        ele.match=m
                      }
                    })
                  } else {
                    pack.forEach((p) => {
                      if (ele.package == p._id) {
                        ele.package = p
                        ele.package["totalPrice"]= p.goodsList.reduce((pre,cur)=>{
                          return parseInt(pre.num) * pre.price + parseInt(cur.num) * cur.price;
                        })
                      }
                    })
                  }
                })
                this.setData({
                  order
                })
              },100)
            }
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/chooseLogin/chooseLogin'
        })
      }
    },200)
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})