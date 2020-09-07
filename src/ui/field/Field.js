require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/directive/attr/bind.js");
require("metaphorjs/src/directive/attr/model.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),    
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js");

module.exports = MetaphorJs.ui.field.Field = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.field.Field",

    initConfig: function() {
        
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
        config.setDefaultMode("name", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultValue("name", "");

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

    
    

    /* Input API */
    setValue: emptyFn,
    getValue: emptyFn,
    onKey: emptyFn,
    unKey: emptyFn,
    onChange: function(fn, ctx, opt) {
        return this.on("change", fn, ctx, opt);
    },
    unChange: function(fn, ctx) {
        return this.un("change", fn, ctx);
    },

    getInputApi: function() {
        return this;
    }
}, {

    supportsDirectives: {
        "bind": true,
        "model": true
    }
});
