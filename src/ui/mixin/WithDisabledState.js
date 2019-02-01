
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.mixin.WithDisabledState = {

    $initConfig: function() {
        this.config.setType("disabled", "bool", null, false);
        this.config.makeLocalDynamic("disabled", "this.disabled");
    },  

    isDisabled: function() {
        return this.config.get("disabled");
    },

    setDisabled: function(state) {
        state !== false && (state = true);
        var prev = this.config.get("disabled");
        this.config.set("disabled", state);
        if (prev != state) {
            this.trigger("disabled-state-change", this, state, prev);
        }
    },

    toggleDisabled: function() {
        this.setDisabled(!this.config.get("disabled"));
    }
}