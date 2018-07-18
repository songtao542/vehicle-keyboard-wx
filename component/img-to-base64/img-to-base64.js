// component/scanner.js
var Promise = require('../../common/lib/promise.js')
var upng = require('./upng/UPNG.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // canvas: object
  },

  /**
   * 组件的初始数据
   */
  data: {
    image: {},
    canvasSize: null,
    target: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setImage: function(filePath) {
      if (filePath) {
        let that = this
        var image = this.data.image
        image.path = filePath
        that.setData({
          image: image
        })
        that._getImageSize(that.data.image)
          .then((image) => {
            return that._getCanvasSize()
          })
          .then(() => {
            that._calcTarget()
            that._drawTarget()
          })
      }
    },
    _getImageSize: function(image) {
      wx.showLoading({
        title: '正在加载图片...',
        mask: true
      })
      return new Promise(resolve => {
        let that = this
        wx.getImageInfo({
          src: image.path,
          success(res) {
            image['radio'] = res.width / res.height
            image['width'] = res.width
            image['height'] = res.height
            // console.log("image size---->", image)
            resolve(image)
          },
          fail(e) {
            console.error(e)
          }
        })
      })
    },
    _getCanvasSize: function() {
      let that = this
      return new Promise(resolve => {
        if (that.data.canvasSize) {
          resolve()
        } else {
          wx.createSelectorQuery().in(that).select('#ocrCanvas').boundingClientRect((res) => {
            var canvasSize = {
              radio: res.width / res.height,
              width: res.width,
              height: res.height
            }
            // console.log("canvasSize---->", canvasSize)
            that.setData({
              canvasSize: canvasSize
            })
            resolve()
          }).exec()
        }
      })
    },
    _calcTarget: function() {
      var that = this
      let target = {}
      let image = that.data.image
      let canvasSize = that.data.canvasSize
      if (image.radio > canvasSize.radio) {
        target['width'] = canvasSize.width
        target['height'] = parseInt(target['width'] / image.radio)
        target['top'] = parseInt((canvasSize.height - target['height']) / 2)
        target['left'] = 0
      } else {
        target['height'] = canvasSize.height
        target['width'] = parseInt(target['height'] * image.radio)
        target['left'] = parseInt((canvasSize.width - target['width']) / 2)
        target['top'] = 0
      }
      that.setData({
        target: target
      })
    },
    _drawTarget: function() {
      let that = this
      let image = that.data.image
      let target = that.data.target
      let canvas = wx.createCanvasContext("ocrCanvas", that);
      canvas.drawImage(image.path, target.left, target.top, target.width, target.height)
      canvas.draw(false, () => {
        that._decodeTarget()
      })
    },

    _decodeTarget: function() {
      console.log("start _decodeTarget")
     
      let that = this
      that._getTargetImageData()
        .then((res) => {
          return that._toPNGBase64(res.buffer, res.width, res.height)
        })
        .then((base64) => {
          // console.log("decode base64 success")
          that._base64Complete(base64)
        })
        // .then(res => {})
        .catch(error => {
          wx.hideLoading()
          that._triggerError("base64 failed")
        })
    },
    _getTargetImageData: function() {
      let that = this
      return new Promise((resolve, reject) => {
        wx.canvasGetImageData({
          canvasId: "ocrCanvas",
          x: that.data.target.left,
          y: that.data.target.top,
          width: that.data.target.width,
          height: that.data.target.height,
          success(res) {
            // console.log("_getTargetImageData==>", res)
            let platform = wx.getSystemInfoSync().platform
            if (platform == 'ios') {
              // 兼容处理：ios获取的图片上下颠倒
              res = that._reverseImageData(res)
            }
            resolve({
              buffer: res.data.buffer,
              width: res.width,
              height: res.height
            })
          },
          fail(e) {
            // console.log("_getTargetImageData fail==>", e)
            reject({
              code: 1,
              reason: '读取图片数据失败'
            })
          }
        }, this)
      })
    },
    _reverseImageData: function(res) {
      var w = res.width
      var h = res.height
      let con = 0
      for (var i = 0; i < h / 2; i++) {
        for (var j = 0; j < w * 4; j++) {
          con = res.data[i * w * 4 + j]
          res.data[i * w * 4 + j] = res.data[(h - i - 1) * w * 4 + j]
          res.data[(h - i - 1) * w * 4 + j] = con
        }
      }
      return res
    },
    _toPNGBase64: function(buffer, width, height) {
      return new Promise((resolve, reject) => {
        try {
          let pngData = upng.encode([buffer], width, height)
          resolve(wx.arrayBufferToBase64(pngData))
        } catch (e) {
          reject({
            code: 2,
            reason: '图片转base64失败'
          })
        }
      })
    },
    _base64Complete: function(base64) {
      wx.hideLoading()
      this.triggerEvent('oncomplete', base64)
    },
    _chooseImage: function() {
      var that = this
      wx.chooseImage({
        sourceType: ['camera', 'album'],
        sizeType: ['compressed'],
        count: 1,
        success: function(res) {
          var selectImage = res.tempFilePaths[0];
          // console.log("selectImage----------->" + selectImage)
          that.setImage(selectImage)
        }
      })
    },
    _triggerError: function(error) {
      this.triggerEvent('onerror', error)
    }
  }
})