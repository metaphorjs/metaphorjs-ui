
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.mixin.WithText = {

    $initConfig: function() {
        this.config.setType("text", "string", MetaphorJs.lib.Config.MODE_STATIC);
        this.config.setProperty("text", "defaultValue", "", false);
        this.config.makeLocalDynamic("text", "this.text");
    },  

    getText: function() {
        return this.config.get("text");
    },

    setText: function(text) {
        this.config.set("text", text);
    }
}