
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("../menu/Menu.js");
require("./Item.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Toolbar = MetaphorJs.ui.menu.Menu.$extend({
    $class: "MetaphorJs.ui.menu.Toolbar",
    $alias: "MetaphorJs.directive.component.ui-toolbar",
    template: "ui/toolbar/toolbar.html"

}, {
    allowUnwrapped: ["MetaphorJs.ui.toolbar.Item", "MetaphorJs.ui.menu.Menu"],
    wrapper: "MetaphorJs.ui.toolbar.Item",
    classes: {
        item: "MetaphorJs.ui.toolbar.Item"
    }
});
