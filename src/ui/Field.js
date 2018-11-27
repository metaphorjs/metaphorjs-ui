require("../__init.js");
require("metaphorjs/src/app/Component.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.field.Field = MetaphorJs.app.Component.$extend({
    $class: "ui.Field",
    as: "field",

    __initConfig: function(config) {
        config.setType("inputAutoCapitalize", "bool");
        config.setType("inputAutoCorrect", "bool");
        config.setType("inputDisabled", "bool");
        config.setType("clearable", "bool");
    }
});
