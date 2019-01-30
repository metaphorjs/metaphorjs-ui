require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Divider = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.menu.Divider",
    $alias: "MetaphorJs.directive.component.ui-menu-divider",
    template: "ui/menu/divider.html"
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
        mousemove: true
    }
});