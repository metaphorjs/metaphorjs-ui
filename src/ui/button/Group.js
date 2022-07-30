
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.button.Group = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.button.Group",
    template: "ui/button/group.html"
}, {
    allowUnwrapped: ["MetaphorJs.ui.button.Button"],
    wrapper: "MetaphorJs.ui.button.Button",
    supportsDirectives: {
        if: true,
        show: true,
        hide: true,
        class: true,
        style: true
    }
});
