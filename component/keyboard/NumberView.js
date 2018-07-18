Component({
    properties: {
        numberArray: {
            type: Array,
        },
        mode: {
            type: Number
        },
        selectedIndex: {
            type: Number
        }
    },
    methods: {
        onModeChanged: function () {
            this.triggerEvent("onmodechanged");
        },
        onCellSelected: function (params) {
            var index = params.currentTarget.dataset.index;
            this.triggerEvent("oncellselected", index);
        }
    }
})