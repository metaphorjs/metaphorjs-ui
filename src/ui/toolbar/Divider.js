
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("../menu/Divider.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.toolbar.Divider = MetaphorJs.ui.menu.Divider.$extend({
    $class: "MetaphorJs.ui.toolbar.Divider",
    $alias: "MetaphorJs.directive.component.ui-toolbar-divider",
    template: "ui/toolbar/divider.html"
});