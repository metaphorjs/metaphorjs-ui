
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Item = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu-item",
    template: "ui/menu/item.html",

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

    onClick: function(ev) {
        this.trigger("click", ev);
    }
});