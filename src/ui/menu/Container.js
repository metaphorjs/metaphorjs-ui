
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Container = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu-container",
    template: "ui/menu/container.html",
    node: false,

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    },

    _initConfig: function() {
        this.$super();
        this.config.setDefaultValue("as", "item");
    },
});