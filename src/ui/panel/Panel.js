
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.panel.Panel = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.panel.Panel",
    $alias: "MetaphorJs.directive.component.ui-panel",
    template: "ui/panel/panel.html"
}, {
    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    }
});
