

// 定义键盘组件的键位行的逻辑
// Author: 陈哈哈 yoojiachen@gmail.com

Component({
    // props: ["rowcount", "keys", "isfunc", "keycount"],
    properties: {
        rowcount: {
            type: Number
        },
        keys: {
            type: Array
        },
        isfunc: {
            type: Boolean
        },
        keycount: {
            type: Number
        },
        row: {
            type: Number
        },
    },

    data: {

    },

    filters: {
        deleteTextFilter: function (text) {
            if (!text || "←" === text) {
                return "";
            } else {
                return text;
            }
        }
    },
    methods: {
        onButtonClick: function (params) {
            var key = params.currentTarget.dataset.item;
            var id = params.target.id
            key.id = id;
            if (key.enabled) {
                this.triggerEvent("onkeyclick", key);
                var that = this
                // wx.createSelectorQuery().in(this).select("#" + id).boundingClientRect(function (rect) {
                //     var tipPosX = (rect.left - Math.abs(60 - rect.width) / 4) + "px";
                //     var tipPosY = (rect.top - 62) + "px";
                //     key.rect = rect
                //     that.triggerEvent("onkeyevent", key);
                // }).exec()
                that.triggerEvent("onkeyevent", key);
            }
        }
    }
})