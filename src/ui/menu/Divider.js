
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Divider = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu-divider",
    template: "ui/menu/divider.html",
    node: false,

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    }
});