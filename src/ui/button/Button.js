
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

module.exports = MetaphorJs.ui.button.Button = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.button.Button",
    $alias: "MetaphorJs.directive.component.ui-button",
    template: "ui/button/button.html",
    as: "button",
    node: false,

    _initConfig: function() {
        this.$super();
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setDefaultValue("as", "button");
    },

    onClick: function(e) {
        this.trigger("click", this, e);
    },

    _initChildItem: function(item) {
        var self = this;

        if (item.type === "component" && item.resolved && 
            item.component.$is("MetaphorJs.ui.menu.Menu")) {
            self._initDropdownItem(item);
        }
    },

    _initDropdownItem: function(item) {
        var self = this,
            dd = extend({}, self.$self.defaultDropdown);

        dd.cmp = {value: item.component};
        self.applyDirective("dropdown", dd);
    }
}, {

    defaultDropdown: {
        on: "click"
    },

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: "button", 
        dblclick: "button", 
        mousedown: "button", 
        mouseup: "button",
        mousemove: "button",
        dropdown: true
    },

    propsToItems: {
        "menu": "MetaphorJs.ui.menu.Menu"
    },
    configProps: ["text"]
});