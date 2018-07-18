
Component({
    properties: {

    },

    data: {
        
    },


    methods: {
        getDyKeyCount: function () {
            return Utils.__arrayOf(this.data.dyKeyboard, "row0").length;
        },
        getDyKeyboardType: function () {
            return this.data.args.keyboardtype; // 计算属性，键盘类型
        },
        getDyCurrentIndex: function () {
            return this.data.selectedIndex; // 计算属性，当前选中输入框的序号
        },
        getDyDisplayMode: function () { // 用于显示的车牌模式
            if (this.data.userMode === Keyboard.NUM_TYPES.NEW_ENERGY) {
                return Keyboard.NUM_TYPES.NEW_ENERGY;
            } else {
                return this.data.detectNumberType === Keyboard.NUM_TYPES.NEW_ENERGY
                    ? Keyboard.NUM_TYPES.NEW_ENERGY
                    : Keyboard.NUM_TYPES.AUTO_DETECT;
            }
        },
        getDyKeyboard: function () {
            if (0 === this.data.dyCurrentIndex  // 选中第一位输入框时；
                && this.data.args.province.length >= 2 // 当前为有效的省份名字
                && this.data.showShortcuts) { // 标记为强制显示快捷省份；
                var keyboard = {
                    shortcuts: provinces.locationOf(this.args.province).peripheryShortnames().map(function (name) {
                        return Keyboard.$newKey(name);
                    }).slice(0, 6)// 只返回6个
                };
                console.log("ddddddddddddd", keyboard)
                // 如果快捷省份数据不存在(快捷省份包括当前省份和周边省份数据)，则返回全键盘数据。
                if (keyboard.shortcuts.length > 1) {
                    try {
                        return keyboard;
                    } finally {
                        this.submitprovince(keyboard);
                    }
                }
            }
            var ukeyboard = this.updatekeyboard();
            console.log("aaaaaaaaaaaaaa", ukeyboard)
            return ukeyboard;
        }
    }
})