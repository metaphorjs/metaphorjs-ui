
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Item = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu-item",
    template: {
        expression: "this.tpl"
    },
    node: false,

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true,
        dropdown: true
    },

    initComponent: function() {
        this.scope.tpl = this.isDivider? "ui/menu/divider.html" : 
                                            "ui/menu/item.html";
        this.$super.apply(this, arguments);
    },
    
    _initConfig: function() {
        this.$super();
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setDefaultValue("as", "item");
    },

    _initItems: function() {
        if (this.menu) {
            MetaphorJs.ui.menu.Menu.initItemWithMenu(this, this.menu);
        }
        this.$super();
    },

    _initChildItem: function(item) {
        var self = this;
        if (item.type === "component") {
            self.scope.tpl = "ui/menu/container.html";
        }
        if (item.type === "component" && item.resolved && 
            item.component.$is("MetaphorJs.ui.menu.Menu")) {
            self.scope.tpl = "ui/menu/item-with-sub.html";
            if (!self.directives) {
                self.directives = {};
            }
            if (!self.directives.dropdown) {
                self.directives.dropdown = {
                    cmp: {
                        value: item.component
                    },
                    on: "mouseover"
                };
            }
        }
    },

    onClick: function(ev) {
        this.trigger("click", this, ev);
    }
}, {

    createFromPlainObject: function(obj) {
        if (!obj.config) {
            var config = {};
            obj.config = config;

            if (obj.text) {
                config.text = obj.text;
                delete obj.text;
            }
        }

        return new MetaphorJs.ui.menu.Item(obj);
    }

});