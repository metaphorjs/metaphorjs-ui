
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Item = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu-item",
    template: "ui/menu/item.html",
    as: "item",
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
        mousemove: true
    },

    _initConfig: function() {
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.$super();
    },

    onClick: function(ev) {
        this.trigger("click", ev);
    }
});