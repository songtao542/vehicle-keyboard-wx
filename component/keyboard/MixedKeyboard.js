var Keyboard = require("./engine.js");
var FastProvince = require("./provinces.js");
var Utils = require("./utils.js");
var _ClickEvent = require("./KeyEvent.js");

var engine = new Keyboard();
var provinces = new FastProvince();



Component({
  properties: {
    args: { // 属性名
      type: Object, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: {
        number: "",
        province: "",
        keyboardtype: 0,
        usermode: 0
      }, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal, changedPath) {
        var numberArray = this._rebuildNumberArray(this.data.args.number, this.data.numberArray.length /*要保证与原生长度一致*/ );
        // 在用户更新车牌后，选中位置设置为当前车牌可输入的最后一位
        var number = numberArray.join("");
        var selectedIndex = Math.max(0, Math.min(numberArray.length - 1, number.length));
        this.setData({
          numberArray: numberArray,
          // 在用户更新车牌后，选中位置设置为当前车牌可输入的最后一位
          selectedIndex: selectedIndex,
          userChanged: true,
          showShortcuts: true,
          userMode: newVal.usermode
        })
      }
    },
    // numberArray: ["", "", "", "", "", "", ""], // 用户输入的车牌数据
    numberArray: { // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ["", "", "", "", "", "", ""], // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal, changedPath) {
        var args = this.data.args
        var number = this.getNumber();
        args.number = number
        this.setData({
          args: args
        })
      }
    },
    userMode: {
      type: Number,
      value: Keyboard.NUM_TYPES.AUTO_DETECT, // 用户设定的车牌号码模式
    },
    detectNumberType: {
      type: Number,
      value: Keyboard.NUM_TYPES.AUTO_DETECT, // 识别的车牌号码模式
      observer: function(newVal, oldVal, changedPath) {
        this.updateDisplayMode()
      }
    },
    selectedIndex: {
      type: Number,
      value: 0,
      observer: function(newVal, oldVal, changedPath) {
        var keyboard = this.getKeyboard()
        this.setData({
          keyboard: keyboard
        })
      }
    }, // 当前用户输入框已选中的序号
    clickEventType: {
      type: Number,
      value: _ClickEvent.KEY
    }, // 用户动作类型
    showShortcuts: {
      type: Boolean,
      value: true
    }, // 需要显示省份简称
    userChanged: {
      type: Boolean,
      value: false
    },
    keyboard: {
      type: Object,
      observer: function(newVal, oldVal, changedPath) {
        var keyboard = newVal
        var keyCount = Utils.__arrayOf(keyboard, "row0").length;
        this.setData({
          keyCount: keyCount
        })
      }
    },
    keyCount: {
      type: Number,
      value: 0
    },
    displayMode: {
      type: Number,
      value: 0
    },
  },
  data: {

  },

  methods: {
    updateDisplayMode: function() {
      var displayMode = this.data.displayMode;
      if (this.data.userMode === Keyboard.NUM_TYPES.NEW_ENERGY) {
        displayMode = Keyboard.NUM_TYPES.NEW_ENERGY;
      } else {
        displayMode = this.data.detectNumberType === Keyboard.NUM_TYPES.NEW_ENERGY ?
          Keyboard.NUM_TYPES.NEW_ENERGY : Keyboard.NUM_TYPES.AUTO_DETECT;
      }
      if (displayMode !== this.data.displayMode) {
        this.setData({
          displayMode: displayMode
        })
      }
      return displayMode
    },
    // 切换用户强制车牌模式
    onUserSetMode: function() {
      // 如果当前车牌为武警车牌，不可切换：
      if (this.data.detectNumberType === Keyboard.NUM_TYPES.WUJING ||
        this.data.detectNumberType === Keyboard.NUM_TYPES.WUJING_LOCAL) {
        // this.data.callbacks.onmessage("武警车牌，请清空再切换");
        this.triggerEvent("onmessage", "武警车牌，请清空再切换");
        return;
      }
      var userMode = 0
      if (this.data.userMode === Keyboard.NUM_TYPES.NEW_ENERGY) {
        userMode = Keyboard.NUM_TYPES.AUTO_DETECT
        this.setData({
          userMode: userMode
        })
      } else {
        // 已输入普通车牌如果不符合新能源车牌方式，不能切换为新能源车牌：
        var number = this.getNumber();
        if (number.length > 2) { // 只输入前两个车牌号码，不参与校验
          var size = 8 - number.length;
          for (var i = 0; i < size; i++) number += "0";
          // 使用正则严格校验补全的车牌号码
          if (this._isEnergyNumber(number)) {
            userMode = Keyboard.NUM_TYPES.NEW_ENERGY;
            this.setData({
              userMode: userMode
            })
          } else {
            // this.data.callbacks.onmessage("非新能源车牌，请清空再切换");
            this.triggerEvent("onmessage", "非新能源车牌，请清空再切换");
            return;
          }
        } else {
          userMode = Keyboard.NUM_TYPES.NEW_ENERGY;
          this.setData({
            userMode: userMode
          })
        }
      }
      this.updatekeyboard()
      var displayMode = this.updateDisplayMode()
      // 如果用户切换为新能源模式，则需要修改输入长度为8位：
      if (displayMode === Keyboard.NUM_TYPES.NEW_ENERGY) {
        this.setLengthTo8();
        // this.data.callbacks.onmessage("车牌类型：新能源车牌");
        this.triggerEvent("onmessage", "车牌类型：新能源车牌");
      } else {
        this.setLengthTo7();
        // this.data.callbacks.onmessage("车牌类型：普通车牌");
        this.triggerEvent("onmessage", "车牌类型：普通车牌");
      }
    },
    // 点击显示更多省份信息：相当于人工点击第一个输入框并强制显示键盘
    onClickShowALL: function() {
      this.onUserSelectedInput(0, true /*强制显示键盘*/ );
    },
    // 选中输入框
    onUserSelectedInput: function(index, shouldShowKeyboard) {
      var length = this.getNumber().length;
      if (length > 0 && index <= length) {
        this.setData({
          selectedIndex: index
        })
      }
      if (true === shouldShowKeyboard) { /*强制显示键盘*/
        this.setData({
          showShortcuts: false
        })
      } else {
        var showShortcuts = (this.selectedIndex === 0);
        this.setData({
          showShortcuts: showShortcuts
        })
      }
    },
    // 点击键位
    onClickPadKey: function(params) {
      var key = params.detail;
      // console.log("onClickPadKey key=", key)
      if (key.isFunKey) {
        this.onFuncKeyClick(key);
      } else {
        this.onTextKeyClick(key.text);
      }
    },
    // 点击字符按键盘
    onTextKeyClick: function(text, forceUpdate) {
      // console.log("onTextKeyClick text=", text, forceUpdate)
      var clickEventType = _ClickEvent.KEY;
      this.setData({
        clickEventType: clickEventType
      })
      if (true === forceUpdate || text !== this.data.numberArray[this.data.selectedIndex]) {
        this.setNumberTxtAt(this.data.selectedIndex, text);
      }
      var lastInput = (this.data.numberArray.length - 1) === this.data.selectedIndex;
      var completed = this.isCompleted();
      var number = this.getNumber();
      var mode = this.data.detectNumberType;
      this.selectNextIndex(); // 选中下一个输入框
      try {
        // 通知其它回调函数
        // this.data.callbacks.onchanged(number, mode, completed);
        var eventDetail = {
          number: number,
          plateMode: mode,
          isCompleted: completed
        }
        this.triggerEvent("onchanged", eventDetail);
        if (completed && String.fromCharCode(31908, 76, 55, 54, 80, 57, 57) === number) {
          // this.data.callbacks.onmessage(VERSION); // 增加内置触发显示版本信息的处理
          this.triggerEvent("onmessage", VERSION);
        }
      } finally {
        // 当输入最后一位字符并且已输入完成时，自动提交完成接口
        if (lastInput && completed) {
          // this.data.callbacks.oncommit(number, mode, true);
          var eventDetail = {
            number: number,
            plateMode: mode,
            isCompleted: true
          }
          this.triggerEvent("oncommit", eventDetail);
        }
      }
    },
    // 点击功能键
    onFuncKeyClick: function(key) {
      if (key.keyCode === Keyboard.KEY_TYPES.FUN_DEL) {
        var clickEventType = _ClickEvent.DEL;
        this.setData({
          clickEventType: clickEventType
        })
        // 删除车辆号码的最后一位
        var maxIndex = this.data.numberArray.length - 1;
        var deleteIndex = Math.max(0, maxIndex);
        for (var i = maxIndex; i >= 0; i--) {
          if (this.data.numberArray[i].length !== 0) {
            deleteIndex = i;
            break;
          }
        }
        this.setNumberTxtAt(deleteIndex, "");
        // 更新删除时的选中状态
        var selectedIndex = deleteIndex;
        this.setData({
          selectedIndex: selectedIndex
        })
        // this.data.callbacks.onchanged(this.getNumber(), this.detectNumberType, false);
        var number = this.getNumber()
        var plateMode = this.data.detectNumberType
        var isCompleted = false
        var eventDetail = {
          number: number,
          plateMode: plateMode,
          isCompleted: isCompleted
        }
        this.triggerEvent("onchanged", eventDetail);
      } else if (key.keyCode === Keyboard.KEY_TYPES.FUN_OK) {
        var clickEventType = _ClickEvent.OK;
        this.setData({
          clickEventType: clickEventType
        })
        // 用户主动点击“确定”按钮，触发回调
        // this.data.callbacks.oncommit(this.getNumber(), this.detectNumberType, false);
        var number = this.getNumber()
        var plateMode = this.data.detectNumberType
        var isCompleted = false
        var eventDetail = {
          number: number,
          plateMode: plateMode,
          isCompleted: isCompleted
        }
        this.triggerEvent("oncommit", eventDetail);
      }
    },
    // 更新键盘：当WidgetInput上的数据发生变化时，会触发键盘更新
    updatekeyboard: function() {
      var number = this.getNumber();
      var updatedKeyboard = engine.update(this.data.args.keyboardtype, this.data.selectedIndex, number, this.getUpdateMode());
      var detectNumberType = updatedKeyboard.numberType;
      this.setData({
        detectNumberType: detectNumberType
      })
     
      var modeName = Keyboard.NUM_TYPES.nameOf(updatedKeyboard.numberType);
      console.debug("更新键盘数据，车牌: " + number + "，模式：" + modeName + "，车牌限制长度：" + updatedKeyboard.numberLimitLength);
      // 将识别结果的车牌模式同步到用户选择模式上
      if (updatedKeyboard.numberType === Keyboard.NUM_TYPES.NEW_ENERGY) {
        var userMode = Keyboard.NUM_TYPES.NEW_ENERGY;
        this.setData({
          userMode: userMode
        })
      } else {
        var userMode = Keyboard.NUM_TYPES.AUTO_DETECT;
        this.setData({
          userMode: userMode
        })
      }
      this.syncInputLength(updatedKeyboard.numberType, (this.data.userMode === Keyboard.NUM_TYPES.NEW_ENERGY) /*force to set NewEnergy mode*/ );
      this.autocommitsinglekey(updatedKeyboard);

      // console.log("updatedKeyboard==========", updatedKeyboard)
      return updatedKeyboard;
    },
    // 当键盘数据只有一个键位可选择时,自动提交点击事件:(武警车牌第二位J和使馆车最后一位)
    autocommitsinglekey: function(layout) {
      if (this.data.clickEventType === _ClickEvent.KEY) {
        var availableKeys = layout.keys.filter(function(k) {
          return k.enabled && !k.isFunKey;
        });
        if (availableKeys.length === 1) {
          var self = this;
          setTimeout(function() {
            self.onTextKeyClick(availableKeys[0].text);
          }, 32);
        }
      }
    },
    // 如果当前为空车牌号码，自动提交第一位快捷省份汉字
    submitprovince: function(layout) {
      // 注意：如果是用户点击删除按钮，退回到第一位。则不自动提交第一位快捷省份汉字。
      // 注意：如果用户外部重新设置了空的车牌号码，则需要自动提交
      if (this.getNumber().length === 0 &&
        (this.data.clickEventType === _ClickEvent.KEY || this.isUserChangeNumber())) {
        var self = this;
        setTimeout(function() {
          if (self.data.selectedIndex === 0) { // 注意检查当自动提交省份时，输入框选中位置是否在第一位上
            self.onTextKeyClick(layout.shortcuts[0].text);
          }
        }, 32);
      }
    },

    ///////////////////////////////
    ////// 以下是 WidgetInput 组件的辅助函数
    // 返回当前已输入的车牌号码
    getNumber: function() {
      return this.data.numberArray.join("");
    },

    // 返回当前车牌是否已输入完成
    isCompleted: function() {
      return this.getNumber().length === this.data.numberArray.length;
    },

    // 选中下一个输入序号的输入框
    selectNextIndex: function() {
      var next = this.data.selectedIndex + 1;
      if (next <= (this.data.numberArray.length - 1) /*限定在最大长度*/ ) {
        var selectedIndex = next;
        this.setData({
          selectedIndex: selectedIndex
        })
      }
    },

    setNumberTxtAt: function(index, text) {
      // this.$set(this.data.numberArray, index, text);
      var numberArray = this.data.numberArray
      numberArray[index] = text;
      this.setData({
        numberArray: numberArray
      })
      // console.log("setNumberTxtAt index=", index)
      // console.log("setNumberTxtAt text==", text)
      this.resetUserChanged();
    },

    setLengthTo8: function() {
      // 当前长度为7位长度时才允许切换至8位长度
      if (this.data.numberArray.length === 7) {
        // 扩展第8位：当前选中第7位，并且第7位已输入有效字符时，自动跳转到第8位
        if (6 === this.selectedIndex && this.getNumber().length === 7) {
          var selectedIndex = 7;
          this.setData({
            selectedIndex: selectedIndex
          })
        }
        var numberArray = this.data.numberArray
        numberArray.push("");
        this.setData({
          numberArray: numberArray
        })
        this.resetUserChanged();
      }
    },

    setLengthTo7: function() {
      if (this.data.numberArray.length === 8) {
        if (7 === this.selectedIndex) { // 处理最后一位的选中状态
          var selectedIndex = 6;
          this.setData({
            selectedIndex: selectedIndex
          })
        }
        var numberArray = this.data.numberArray
        numberArray.pop();
        this.setData({
          numberArray: numberArray
        })
        this.resetUserChanged();
      }
    },
    // 重置外部用户修改车牌标记位
    resetUserChanged: function() {
      var userChanged = false;
      this.setData({
        userChanged: userChanged
      })
    },

    /////// 以下是 全局 辅助函数

    // 返回用户是否外部修改了车牌号码
    isUserChangeNumber: function() {
      return this.data.userChanged === true;
    },

    // 同步输入框长度
    syncInputLength: function(mode, forceNewEnergyMode) {
      // 键盘引擎根据输入参数，会自动推测出当前车牌的类型。
      // 如果当前用户没有强制设置，更新键盘的输入框长度以适当当前的车牌类型,（指地方武警车牌，长度为8位）
      if (forceNewEnergyMode) { // 强制新能源类型，应当设置为：8位
        this.setLengthTo8();
      } else {
        if (Keyboard.NUM_TYPES.WUJING_LOCAL === mode || Keyboard.NUM_TYPES.NEW_ENERGY === mode) { // 地方武警，应当设置为：8位
          this.setLengthTo8();
        } else { // 其它车牌，应当设置为：7位
          this.setLengthTo7();
        }
      }
    },

    // 当用户选择的车牌模式为非AUTO_DETECT模式时，使用用户强制设置模式：目前用户选择的模式有两个值：AUTO_DETECT / NEW_ENERGY
    getUpdateMode: function() {
      if (this.data.userMode === Keyboard.NUM_TYPES.NEW_ENERGY) {
        return Keyboard.NUM_TYPES.NEW_ENERGY;
      } else {
        return Keyboard.NUM_TYPES.AUTO_DETECT;
      };
    },
    ///////////////////////////////

    //////// 以下是工具类函数
    // 将车牌号码，生成一个车牌字符数组
    _rebuildNumberArray: function(updateNumber, originLength) {
      var output = ["", "", "", "", "", "", ""]; // 普通车牌长度为7位，最大长度为8位
      if (originLength > 7) {
        output.push("");
      }
      if (updateNumber != undefined && updateNumber.length != 0) {
        var size = Math.min(8, updateNumber.length);
        for (var i = 0; i < size; i++) {
          output[i] = updateNumber.charAt(i);
        }
      }
      return output;
    },

    _isEnergyNumber: function(number) {
      return /\W[A-Z][0-9DF][0-9A-Z]\d{3}[0-9DF]/.test(number);
    },
    //////////////////////////////////////


    getKeyboard: function() {
      if (0 === this.data.selectedIndex // 选中第一位输入框时；
        && this.data.args.province.length >= 2 // 当前为有效的省份名字
        && this.data.showShortcuts) { // 标记为强制显示快捷省份；
        var keyboard = {
          shortcuts: provinces.locationOf(this.args.province).peripheryShortnames().map(function(name) {
            return Keyboard.$newKey(name);
          }).slice(0, 6) // 只返回6个
        };
        // 如果快捷省份数据不存在(快捷省份包括当前省份和周边省份数据)，则返回全键盘数据。
        if (keyboard.shortcuts.length > 1) {
          try {
            return keyboard;
          } finally {
            this.submitprovince(keyboard);
          }
        }
      }
      return this.updatekeyboard();
    }
  },

  ready: function() {
    var that = this
    var keyboard = that.getKeyboard()

    that.setData({
      keyboard: keyboard
    })
    // console.log('keyboard', keyboard)
    // console.log('keyboard json=', JSON.stringify(keyboard))
  }

})