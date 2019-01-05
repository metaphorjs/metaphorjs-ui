
require("../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.Button = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-button",
    template: "ui/button/button.html",
    as: "button",

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: "button", 
        dblclick: "button", 
        mousedown: "button", 
        mouseup: "button",
        mousemove: "button"
    },

    _initConfig: function() {
        this.config.setDefaultMode("text", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setType("as", null, null, "button");
    },

    onClick: function(e) {

    }
});