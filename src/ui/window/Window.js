
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.window.Window = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.window.Window",
    template: "ui/window/window.html",

    _initDraggable: function() {
        
    }
}, {
    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    }
});
