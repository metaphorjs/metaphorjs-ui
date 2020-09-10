
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("../mixin/WithActiveState.js");
require("../mixin/WithText.js");
require("../mixin/WithDropdown.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Item = MetaphorJs.app.Container.$extend({
    $mixins: [MetaphorJs.ui.mixin.WithActiveState, 
                MetaphorJs.ui.mixin.WithText,
                MetaphorJs.ui.mixin.WithDropdown],
    $class: "MetaphorJs.ui.menu.Item",
    $alias: "MetaphorJs.directive.component.ui-menu-item",
    as: "item",
    template: {
        name: {
            expression: "this.tpl"
        }
    },

    initComponent: function() {
        this.state.tpl = this.$self.templates.item;
        this.$super.apply(this, arguments);
    },

    _initChildItem: function(item) {
        var self = this;
        
        if (item.type === "component") {
            self.state.tpl = self.$self.templates.container;
        }

        self.$super();
    },

    _onDropdownCreated: function(component) {
        this.state.tpl = this.$self.templates.submenu;
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
        submenu: "ui/menu/item-with-sub.html"
    },  

    configProps: ["text", "active"],

    dropdownClasses: ["MetaphorJs.ui.menu.Menu"],
    defaultDropdown: {
        on: "mouseover"
    }

});