require("../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/directive/attr/bind.js");
require("metaphorjs/src/directive/attr/model.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),    
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

module.exports = MetaphorJs.ui.Field = MetaphorJs.app.Component.$extend({

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
        config.setDefaultMode("bind", MetaphorJs.lib.Config.MODE_DYNAMIC);
        config.setDefaultMode("model", MetaphorJs.lib.Config.MODE_DYNAMIC);

        self.$super();  
    },

    initComponent: function() {
        var self = this;

        self.$super();

        self.config.hasExpression("bind") && self._initBind();
        self.config.hasExpression("model") && self._initModel();
    },

    _createDirectiveConfig: function(dir) {
        var self = this,
            pfx = dir + ".",
            cfg = {
                value: self.config.copyProperty(dir)
            };
        self.config.eachProperty(function(name) {
            if (name.indexOf(pfx) === 0) {
                var nn = name.replace(pfx, "");
                cfg[nn] = self.config.copyProperty(name);
            }
        });
        var c = new MetaphorJs.lib.Config(cfg, {
            scope: self.config.getOption("scope")
        });
        self.config.disableProperty(dir);
        return c;
    },

    _initBind: function() {
        var self = this;

        self.bindDirective = new MetaphorJs.app.Directive.attr.Bind(
            self.config.getOption("scope"),
            self,
            self._createDirectiveConfig("bind")
        );
    },

    _initModel: function() {
        var self = this;

        self.modelDirective = new MetaphorJs.app.Directive.attr.Model(
            self.config.getOption("scope"),
            self,
            self._createDirectiveConfig("model")
        );
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
        var self = this;
        return self;
    }
});
