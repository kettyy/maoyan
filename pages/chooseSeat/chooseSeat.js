// pages/chooseSeat/chooseSeat.js
var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CMD,
    SERVER,
    match:{},
    seats:[],
    rows:[],
    chooseSeat:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: SERVER + 'match/find',
      data:{
        _id: options.id,
        submitType: "findJoin",
        ref: ["film", "cinema","hall"]
      },
      success:(res)=>{
        wx.setNavigationBarTitle({
          title: res.data.film[0].name
        });
        res.data.date=this.transDate(res.data.date);
        let rows=[];
        let index=1;
        res.data.seat.forEach((seats)=>{
          let flag=false;
          seats.forEach((seat)=>{
            if (seat){
              flag=true;
              return;
            }
          });
          rows.push(flag ? index++:0);
        })
        this.setData({
          match:res.data,
          seats: res.data.seat,
          rows
        })
      }
    })
  },
  //日期转换
  transDate(date) {
    let week = null;
    let flag = new Date(new Date().toLocaleDateString()) - new Date(date.replace(/\-/g, "\/"));
    var weekArray = new Array("周日 ", "周一 ", "周二 ", "周三 ", "周四 ", "周五 ", "周六 ");
    let dateArr = date.split("-");
    if (flag == 0) {
      week = "今天 ";
    } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3)) < 2) {
      week = "明天 ";
    } else if (Math.floor(Math.abs(flag) / (3600 * 24 * 1e3)) < 3) {
      week = "后天 ";
    } else {
      week = weekArray[new Date(date.replace(/\-/g, "\/")).getDay()]
    }
    week += dateArr[1] + "月" + dateArr[2] + "日";
    return week;
  },
  chooseSeat(e){
    const { row, col } = e.target.dataset;
    let chooseSeat = [...this.data.chooseSeat];
    if (this.data.seats[row][col] == 3 || e.target.dataset.type == "cancel") {
      for (let i = 0; i < chooseSeat.length;i++){
        if (chooseSeat[i][0] == row && chooseSeat[i][1] == col) {
          chooseSeat.splice(i, 1);
          break;
        }
      }
      this.changeSeat(row, col, 1);
    } else if (this.data.seats[row][col] == 1) {
      if (chooseSeat.length < 4) {
        chooseSeat.push([row, col]);
        this.changeSeat(row, col, 3);
      } else {
        wx.showToast({
          title: '最多购买4张',
          duration: 2000
        })
      }
    }
    this.setData({
      chooseSeat
    });
  },
  //改变seats数组
  changeSeat(row, col,num){
    let seats=[...this.data.seats];
    seats[row][col]=num;
    this.setData({
      seats
    })
  },
  //智能推荐
  recommend(e){
    let num=e.target.dataset.num;
    if (num){
      let rowArr = [];
      //获取有连坐的排数号
      for (let i = 0; i < this.data.seats.length; i++) {
        let n = 0;
        for (let j = 0; j < this.data.seats[i].length; j++) {
          if (this.data.seats[i][j] == 1) {
            n++;
            if (n >= num) {
              rowArr.push(i);
            }
          } else {
            n = 0;
          }
        }
      }
      //去重
      let tempSet = new Set([...rowArr]);
      rowArr = [...tempSet];
      //计算最优排数和列数
      let best_row = parseInt(this.data.seats.length / 2);
      let best_col = parseInt(this.data.seats[0].length / 2);
      //根据最优排数排列数组，最优的在前
      rowArr.sort(function (a, b) {
        return Math.abs(a - best_row) - Math.abs(b - best_row);
      });
      let tempArr = [];
      //创建临时数组存放可选座位下标
      for (let i = 0; i < rowArr.length; i++) {
        tempArr.push({
          row: rowArr[i],
          col: [],
          choose: []
        });
        for (let j = 0; j < this.data.seats[rowArr[i]].length; j++) {
          if (this.data.seats[rowArr[i]][j] == 1) {
            tempArr[i].col.push(j);
          }
        }
      }
      for (let i = 0; i < tempArr.length; i++) {
        if(num>1){
          let arr = [];
          //遍历可选下标数组，找出连坐下标，push进arr数组
          for (let j = 1; j < tempArr[i].col.length; j++) {
            if (tempArr[i].col[j] - tempArr[i].col[j - 1] == 1) {
              arr.push(tempArr[i].col[j-1]);
              arr.push(tempArr[i].col[j]);
              let s = new Set([...arr]);
              arr=[...s];
              //若arr数组长度与所选连坐长度相等，则该数组值为可选连坐组，预设权重值为0
              if (arr.length == num) {
                tempArr[i].choose.push({
                  seats: [...arr],
                  weigth: 0
                });
                //清空arr数组进入下一次判断
                arr.length = 0;
                j = j - num + 2;
              }
            } else {
              //如下标出现间隔，则不连坐，清空arr数组，进入下一次循环
              arr.length = 0;
            }
          }
        }else{
          for (let j = 0; j < tempArr[i].col.length; j++){
            tempArr[i].choose.push({
              seats: [tempArr[i].col[j]],
              weigth: 0
            });
          }
        }
      }
      //设置权重值
      for (let i = 0; i < tempArr.length; i++) {
        for (let j = 0; j < tempArr[i].choose.length; j++) {
          //tempArr数组中下标越小的权重值越小
          tempArr[i].choose[j].weigth += i;
          for (let k = 0; k < tempArr[i].choose[j].seats.length; k++) {
            //可选数组中下标与最优下标相减，绝对值越小的权重值越小
            tempArr[i].choose[j].weigth += Math.abs(tempArr[i].choose[j].seats[k] - best_col)*2;
          }
        }
        tempArr[i].choose.sort(function (a, b) {
          return a.weigth - b.weigth;
        })
      }
      //根据权重值排序，权重值越小，则越优
      tempArr.sort(function (a, b) {
        if (a.choose.length && b.choose.length)
          return a.choose[0].weigth - b.choose[0].weigth;
        else
          return 1;
      });
      let chooseSeat=[];
      tempArr[0].choose[0].seats.forEach((col)=>{
        chooseSeat.push([tempArr[0].row,col])
      })
      chooseSeat.forEach((choose)=>{
        this.changeSeat(choose[0], choose[1], 3);
      })
      this.setData({
        chooseSeat
      });
    }
  },
  //点击购买
  clickBuy(){
    if (this.data.chooseSeat.length) {
      let user=null;
      wx.getStorage({
        key: 'userId',
        success: function (res) {
          user=res.data;
        }
      })
      setTimeout(()=>{
        if (user) {
          let choose = JSON.stringify(this.data.chooseSeat)
          wx.navigateTo({
            url: '/pages/buy/buy?id=' + this.data.match._id + "&choose=" + choose + "&user=" + user + "&date=" + this.data.match.date
          })
        } else {
          wx.navigateTo({
            url: '/pages/chooseLogin/chooseLogin'
          })
        }
      },100)
    }
  }
})