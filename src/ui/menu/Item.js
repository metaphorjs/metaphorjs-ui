
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

module.exports = MetaphorJs.ui.menu.Item = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.menu.Item",
    $alias: "MetaphorJs.directive.component.ui-menu-item",
    template: {
        expression: "this.tpl"
    },
    node: false,

    initComponent: function() {
        this.scope.tpl = this.isDivider? this.$self.templates.divider : 
                                            this.$self.templates.item;
        this.$super.apply(this, arguments);
    },
    
    _initConfig: function() {
        this.$super();
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setDefaultValue("as", "item");
    },

    _initChildItem: function(item) {
        var self = this;
        
        if (item.type === "component") {
            self.scope.tpl = self.$self.templates.container;
        }

        if (item.type === "component" && item.resolved && 
            item.component.$is("MetaphorJs.ui.menu.Menu")) {
            self._initDropdownItem(item);
        }
    },

    _initDropdownItem: function(item) {
        var self = this,
            dd = extend({}, self.$self.defaultDropdown);

        self.scope.tpl = self.$self.templates.submenu;
        dd.cmp = {value: item.component};
        self.applyDirective("dropdown", dd);
    },

    onClick: function(ev) {
        this.trigger("click", this, ev);
    }
}, {

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

    propsToItems: {
        "menu": "MetaphorJs.ui.menu.Menu"
    },

    templates: {
        item: "ui/menu/item.html",
        container: "ui/menu/container.html",
        submenu: "ui/menu/item-with-sub.html",
        divider: "ui/menu/divider.html"
    },  

    configProps: ["text"],

    defaultDropdown: {
        on: "mouseover"
    }

});