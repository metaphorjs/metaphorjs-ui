
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.mixin.WithActiveState = {

    $initConfig: function() {
        this.config.setType("active", "bool", null, false);
        this.config.makeLocalDynamic("active", "this.active");
    },  

    isActive: function() {
        return this.config.get("active");
    },

    setActive: function(state) {
        state !== false && (state = true);
        var prev = this.config.get("active");
        this.config.set("active", state);
        if (prev != state) {
            this.trigger("active-state-change", this, state, prev);
        }
    },

    toggleActive: function() {
        this.setActive(!this.config.get("active"));
    }
}