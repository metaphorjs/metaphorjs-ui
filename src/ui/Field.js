require("../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.Field = MetaphorJs.app.Component.$extend({

    _initConfig: function() {
        
        var config = this.config;

        config.setOption("defaultMode", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("inputAutoCapitalize", "bool", null, true);
        config.setType("inputAutoCorrect", "bool", null, true);
        config.setType("inputDisabled", "bool", null, false);
        config.setType("clearable", "bool", null, true);
        config.setType("as", null, null, "field");
        config.setType("disabled", "bool", null, false);

        this.$super();
    }
});
