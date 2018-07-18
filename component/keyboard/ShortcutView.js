// 定义快捷省份的UI操作逻辑
// Author: 陈哈哈 yoojiachen@gmail.com
Component({
    // props: ["shortcuts"],
    properties: {
        shortcuts: {
            type: Array
        }
    },
    methods: {
        onButtonClick: function (params) {
            var key = params.currentTarget.dataset.item;
            if (key.enabled) {
                this.triggerEvent("onkeyclick", key);
            }
        },
        onShowMoreClick: function () {
            this.triggerEvent("onshowmoreclick");
        }
    }
})