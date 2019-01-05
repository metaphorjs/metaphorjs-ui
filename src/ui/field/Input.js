
require("../../__init.js");
require("./Field.js");
require("metaphorjs/src/lib/Input.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");


module.exports = MetaphorJs.ui.field.Input = MetaphorJs.ui.field.Field.$extend({
    $alias: "MetaphorJs.directive.component.ui-input",
    template: "ui/field/input.html",

    supportsDirectives: {
        bind: "input",
        model: "input",
        show: true,
        hide: true,
        class: true,
        style: true,
        "in-focus": "input",
        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true,
        field: true
    },

    _initConfig: function() {
        this.$super();

        var config = this.config;
        config.setType("type", null, MetaphorJs.lib.Config.MODE_STATIC, "text");
        config.setType("placeholder", null, MetaphorJs.lib.Config.MODE_STATIC, "");
    },

    afterRender: function() {
        var self = this,
            input;

        self.input = input = MetaphorJs.lib.Input.get(self.$refs.node.input);
        self.setValue = bind(input.setValue, input);
        self.getValue = bind(input.getValue, input);
        self.onKey = bind(input.onKey, input);
        self.unKey = bind(input.unKey, input);

        self.$$observable.relayEvent(input, "change");

        self.$super();
    }
});