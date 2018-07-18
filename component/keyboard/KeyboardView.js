// 实现键盘整体的UI操作逻辑
// Author: 陈哈哈 yoojiachen@gmail.com
var $ = require("./utils.js");
Component({
    // keyboard 对象是键盘组件的数据对象，用于传递键盘每行的数据
    // keycount 是指定每行的键位数量
    properties: {
        keyboard: {
            type: Object,
            observer: function (newVal, oldVal, changedPath) {
                // console.log("keyboard observer=================", newVal)
                var rc = $.__arrayOf(newVal, "row4").length === 0 ? 4 : 5;
                this.setData({
                    rc: rc
                })
                var shortcuts = $.__arrayOf(newVal, "shortcuts");
                if (shortcuts) {
                    var hasShortcut = shortcuts.length > 0;
                    this.setData({
                        shortcuts: shortcuts,
                        hasShortcut: hasShortcut
                    })
                }
            }
        },
        keycount: {
            type: Number,
            observer: function (newVal, oldVal, changedPath) {
                this.setData({
                    kc: newVal
                })
            }
        },
        kc: {
            type: Number
        },
        rc: {
            type: Number
        },
        shortcuts: {
            type: Array
        },
        hasShortcut: {
            type: Boolean
        }
    },

    data: {
        tipText: "",
        tipPosX: "0px",
        tipPosY: "0px",
    },

    methods: {
        onKeyEvent: function (params) {
            // var key = params.detail
            // var self = this;
            // var _reset = function () {
            //     self.data.tipText = "";
            // };
            // if (key.enabled && !key.isFunKey) {
            //     var tipText = key.text;
            //     this.setData({
            //         tipText: tipText
            //     })
            //     var rect = key.rect
            //     var tipPosX = (rect.left - Math.abs(60 - rect.width) / 4) + "px";
            //     var tipPosY = (rect.top - 62) + "px";
            //     this.setData({
            //         tipPosX: tipPosX,
            //         tipPosY: tipPosY
            //     })
            //     setTimeout(_reset, 250);
            // } else {
            //     _reset();
            // }
        },
        onKeyClick: function (params) {
            // console.log("kkkkkkkkkkkkkkkkkkkkkk onKeyClick params=", params)
            var key = params.detail;
            // console.log("kkkkkkkkkkkkkkkkkkkkkk onKeyClick key=", key)
            this.triggerEvent("onpadkeyclick", key);
        },
        onShowMoreClick: function () {
            this.triggerEvent("onpadshowmoreclick");
        }
    },

    ready: function () {

    }
})