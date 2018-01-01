var app = getApp();
const { CMD, SERVER } = app.globalData;
Page({
  data: {
    currentTab: 0,
    movies:[],
    CMD,
    SERVER,
    user:""
  },
  onLoad: function (options) {
    wx.request({
      url: SERVER+'film/find',
      data: {
        isUpcoming: this.data.currentTab ? "true" : "false",
        isShowing: this.data.currentTab ? "false" : "true"
      },
      success: (res) => {
        res.data.forEach((movie) =>{
          this.getMatch(movie,true);
        });
        res.data.sort((a,b)=>{
          return a.lastboxOffice - b.lastboxOffice;
        });
        setTimeout(() => {
          this.setData({
            movies: res.data
          })
        },100)
      }
    })
  },
  //点击切换
  clickTab: function (e) {
    let user = null;
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        user = res.data;
      }
    })
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
    wx.request({
      url: SERVER+'film/find',
      data: {
        isUpcoming: e.target.dataset.current==1 ? "true" : "false",
        isShowing: e.target.dataset.current==1 ? "false" : "true"
      },
      success: (res) => {

        let movies=[...res.data];
        if (e.target.dataset.current==0){
          movies.forEach((movie)=>{
            this.getMatch(movie,true);
          });
          movies.sort((a, b) => {
            return a.lastboxOffice - b.lastboxOffice;
          });
        }else{
          movies.forEach((movie) => {
            this.getMatch(movie,false);
          })
        }
        setTimeout(()=>{
          this.setData({
            movies
          })
        },100)
      }
    })
    setTimeout(() => {
      if (user && this.data.currentTab==1) {
        wx.request({
          url: SERVER + 'user/find',
          data: {
            _id: user
          },
          success: (res) => {
            let movies = [...this.data.movies];
            movies.forEach((movie) => {
              res.data.wantSee.forEach((want) => {
                if (want == movie._id) {
                  movie["wantSee"] = true;
                }
              })
              if (!movie.wantSee) {
                movie["wantSee"] = false;
              }
            })
            movies.forEach((movie) => {
              res.data.haveSee.forEach((have) => {
                if (have == movie._id) {
                  movie["haveSee"] = true;
                }
              })
              if (!movie.wantSee) {
                movie["haveSee"] = false;
              }
            })
            this.setData({
              user: res.data,
              movies
            })
          }
        })
      }
    }, 100)
  },
  getMatch(movie,showing){
    movie['match'] = {
      play:0,
      cinema:0,
      type:"",
      isMatch:false,
      date:""
    }
    let date = new Date().toLocaleDateString().replace(/\//g, "-");
    wx.request({
      url: SERVER+'match/find',
      data: {
        movieID: movie._id,
        date: showing?date:""
      },
      success: (res) => {
        if (showing){
          movie['match'].play = res.data.length;
          let cinemas = [];
          for (let obj of res.data) {
            cinemas.push(obj.cinemaID);
          }
          let s = new Set(cinemas);
          cinemas = [...s];
          movie['match'].cinema = cinemas.length;
        }else{
          movie.match.isMatch = res.data.length?true:false;
        }
      }
    });
  },
  //点击想看
  clickWant(e) {
    if (this.data.user) {
      let wantSee = [...this.data.user.wantSee];
      let index=0,flag=true;
      wantSee.forEach((want,i)=>{
        if (want == e.target.dataset.id) {
          wantSee.splice(i, 1);
          flag=false
          return;
        }
        index++;
      })
      if (index == wantSee.length && flag){
        wantSee.push(e.target.dataset.id);
      }
      wx.request({
        url: SERVER + 'user/update',
        data: {
          _id: this.data.user._id,
          wantSee
        },
        success: (res) => {
          let movies = [...this.data.movies];
          movies.forEach((movie) => {
            if (movie._id == e.target.dataset.id) {
              movie.wantSee = !movie.wantSee;
              return;
            }
          })
          this.setData({
            movies
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/chooseLogin/chooseLogin'
      })
    }
  },
  //点击退出
  test(){
    wx.removeStorage({
      key: 'userId'
    })
  }
})