// pages/plate/bind/bind.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isKeyboardShow: false, //是否显示键盘
    inputValue: '',
    showOcrView: false,
    vehicleColorArray: ["蓝牌", "黄牌", "黑牌", "白牌", "渐变绿色", "黄绿双拼色", "蓝白渐变色"],
    keyboardValue: {
      number: "粤B",
      province: "",
      keyboardtype: 0,
      usermode: 0
    },
    base64: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  plateColorChange: function(e) {
    var selectColorIndex = e.detail.value
    var keyboardValue = this.data.keyboardValue
    var usermode = keyboardValue.usermode
    if (selectColorIndex == 4 || selectColorIndex == 5) {
      keyboardValue.usermode = 5
    } else {
      keyboardValue.usermode = 0
    }
    if (usermode !== keyboardValue.usermode) {
      keyboardValue.number = '粤B'
    }
    this.setData({
      vehicleColorIndex: selectColorIndex,
      keyboardValue: keyboardValue,
      inputValue: keyboardValue.number
    });
    this.hideKeyboard();
  },

  /**
   * 输入框显示键盘状态
   */
  showKeyboard: function() {
    var self = this;
    self.bindCursorAnimation();
    self.setData({
      isKeyboardShow: true,
    });
  },
  /**
   * 点击页面隐藏键盘事件
   */
  hideKeyboard: function() {
    var self = this;
    self.clearCursorAnimation();
    if (self.data.isKeyboardShow) {
      //说明键盘是显示的，再次点击要隐藏键盘
      self.setData({
        isKeyboardShow: false,
      })
    }
  },
  /**
   * 输入框聚焦触发，显示键盘
   */
  toggleKeyboard: function() {
    var self = this;
    if (self.data.isKeyboardShow) {
      //说明键盘是显示的，再次点击要隐藏键盘
      self.setData({
        isKeyboardShow: false,
      });
    } else {
      //说明键盘是隐藏的，再次点击显示键盘
      self.setData({
        isKeyboardShow: true,
      });
    }
  },
  bindCursorAnimation: function() {
    var self = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear'
    });
    self.animation = animation;
    self.opacity = 0;
    animation.opacity(0).step();

    self.interval = setInterval(function() {
      var animation = self.animation;
      if (self.opacity == 0) {
        self.opacity = 1;
        animation.opacity(1).step();
      } else {
        self.opacity = 0;
        animation.opacity(0).step();
      }
      self.setData({
        animation: animation.export()
      })
    }, 600);
    self.setData({
      animation: animation.export()
    })
  },
  clearCursorAnimation: function() {
    var self = this;
    clearInterval(self.interval);
    self.setData({
      animation: {}
    })
  },

  doNothing: function() {

  },
  onPlateInputCompleted: function(e) {
    this.hideKeyboard()
    var number = e.detail.number
    var keyboardValue = this.data.keyboardValue
    keyboardValue.number = number
    this.setData({
      inputValue: number,
      keyboardValue: keyboardValue
    })
  },
  onKeyboardMessage: function(e) {
    console.log("onKeyboardMessage=", e.detail)
  },

  getvehicleColor: function() {
    var vehicleColorIndex = this.data.vehicleColorIndex;
    //"0":蓝牌", "1":黄牌", "2":黑牌", "3":白牌", "4":渐变绿色", "5":"黄绿双拼色", "9":"蓝白渐变色"
    if (vehicleColorIndex == 0) {
      return "0";
    } else if (vehicleColorIndex == 1) {
      return "1";
    } else if (vehicleColorIndex == 2) {
      return "2";
    } else if (vehicleColorIndex == 3) {
      return "3";
    } else if (vehicleColorIndex == 4) {
      return "4";
    } else if (vehicleColorIndex == 5) {
      return "5";
    } else if (vehicleColorIndex == 6) {
      return "9";
    }
  },

  onBaseComplete: function(e) {
    console.log("eeeeeeeeeeee", e)
    this.setData({
      base64: e.detail
    })
  },

  chooseImage: function() {
    var that = this
    wx.chooseImage({
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],
      count: 1,
      success: function(res) {
        var selectImage = res.tempFilePaths[0];
        console.log("selectImage----------->" + selectImage)
        var imb = that.selectComponent("#imb");
        console.log("selectImage------imb----->" + imb)
        imb.setImage(selectImage)
      }
    })
  },

})