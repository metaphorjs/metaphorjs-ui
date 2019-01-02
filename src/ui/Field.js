require("../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/directive/attr/bind.js");
require("metaphorjs/src/directive/attr/model.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),    
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js");

module.exports = MetaphorJs.ui.Field = MetaphorJs.app.Component.$extend({

    supportsDirectives: {
        "bind": true,
        "model": true
    },

    _initConfig: function() {
        
        var self = this,
            config = self.config;

        config.setOption("defaultMode", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("inputAutoCapitalize", "bool", null, true);
        config.setType("inputAutoCorrect", "bool", null, true);
        config.setType("inputDisabled", "bool", null, false);
        config.setType("clearable", "bool", null, true);
        config.setType("as", null, null, "field");
        config.setType("disabled", "bool", null, false);
        config.setType("readonly", "bool", null, false);

        self.$super();  
    },

    onDestroy: function() {
        var self = this;

        if (self.bindDirective) {
            self.bindDirective.$destroy();
            self.bindDirective = null;
        }
        if (self.modelDirective) {
            self.modelDirective.$destroy();
            self.modelDirective = null;
        }

        self.$super();
    },

    getValue: emptyFn,
    setValue: emptyFn,
    onChange: function(fn, ctx, opt) {
        return this.on("change", fn, ctx, opt);
    },
    unChange: function(fn, ctx) {
        return this.un("change", fn, ctx);
    },

    getInputApi: function() {
        return this;
    }
});
