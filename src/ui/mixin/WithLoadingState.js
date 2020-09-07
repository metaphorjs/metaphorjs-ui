
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.mixin.WithLoadingState = {

    $initConfig: function() {
        this.config.setType("loading", "bool", null, false);
        this.config.makeLocalDynamic("loading", "this.loading");
    },  

    isLoading: function() {
        return this.config.get("loading");
    },

    setLoading: function(state) {
        state !== false && (state = true);
        var prev = this.config.get("loading");
        this.config.set("loading", state);
        if (prev != state) {
            this.trigger("loading-state-change", this, state, prev);
        }
    },

    toggleLoading: function() {
        this.setLoading(!this.config.get("loading"));
    }
}