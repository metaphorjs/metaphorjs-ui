
require("../../__init.js");
require("./Field.js");
require("metaphorjs/src/lib/Input.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");


module.exports = MetaphorJs.ui.field.Checkbox = MetaphorJs.ui.field.Field.$extend({
    $class: "MetaphorJs.ui.field.Checkbox",
    $alias: "MetaphorJs.directive.component.ui-checkbox",
    template: "ui/field/checkbox.html",

    afterRender: function() {
        var self = this,
            input;

        if (self.$refs.node.input) {
            self.input = input = MetaphorJs.lib.Input.get(self.$refs.node.input);
            self.setValue = bind(input.setValue, input);
            self.getValue = bind(input.getValue, input);
            self.onKey = bind(input.onKey, input);
            self.unKey = bind(input.unKey, input);
            self.$$observable.relayEvent(input, "change");
        }

        self.$super();
    }
}, {

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
    }
});