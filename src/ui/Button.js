
require("../__init.js");
require("./menu/Menu.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js");

module.exports = MetaphorJs.ui.Button = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-button",
    template: "ui/button/button.html",
    as: "button",
    node: false,

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

    _initItems: function() {
        if (this.menu) {
            MetaphorJs.ui.menu.Menu.initItemWithMenu(this, this.menu);
        }
        this.$super();
    },

    _initConfig: function() {
        this.$super();
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setDefaultValue("as", "button");
    },

    onClick: function(e) {
        this.trigger("click", this, e);
    },

    _wrapChildItem: function(item) {
        if (item.type === "component" && 
            item.component.$is("MetaphorJs.ui.menu.Menu")) {

        }
        return item;
    },

    _onChildResolved: function(cmp) {
        if (cmp.$is("MetaphorJs.ui.menu.Menu")) {
            this.menu = cmp;
        }
        this.$super(cmp);
    }
});