
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("../menu/Item.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.toolbar.Item = MetaphorJs.ui.menu.Item.$extend({
    $class: "MetaphorJs.ui.toolbar.Item",
    $alias: "MetaphorJs.directive.component.ui-toolbar-item"

}, {

    templates: {
        item: "ui/toolbar/item.html",
        container: "ui/toolbar/container.html",
        submenu: "ui/toolbar/item-with-sub.html",
        divider: "ui/toolbar/divider.html"
    },

    dropdownClasses: ["MetaphorJs.ui.menu.Menu"],
    configProps: ["text"]

});