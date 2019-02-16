require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

require("../../lib/Color.js");
require("../../filter/color.js");
require("./ColorSV.js");
require("./ColorHue.js");
require("./ColorAlpha.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorPicker = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.util.ColorPicker",
    $alias: "MetaphorJs.directive.component.ui-color-picker",
    template: "ui/util/color-picker.html",
    as: "pckr",

    _apis: ["node", "input"],
    _updating: false,
    _prev: null,

    initComponent: function() {
        var scope = this.scope,
            initialColor = "ff0000";
        
        scope.input = {
            hex: null,
            r: null,
            g: null,
            b: null,
            h: null,
            s: null,
            v: null
        };

        scope.hue = initialColor;
        scope.sv = initialColor;
        scope.color = new MetaphorJs.lib.Color(initialColor);
        this._prev = initialColor;
    },

    initConfig: function() {
        this.$super();
        this.config.setType("format", "string", MetaphorJs.lib.Config.MODE_STATIC);
    },

    _frame: function(val, min, max) {
        val = parseInt(val);
        val < min && (val = min);
        val > max && (val = max);
        return val;
    },

    _updateCanvas: function() {
        this._updating = true;
        var scope = this.scope;
        this.getRefCmp("sv").setColor(scope.color);
        this.getRefCmp("hue").setColor(scope.color);
        scope.$check();
        this._updating = false;
    },


    onInputHex: function(hex) {
        hex = (""+hex).toLowerCase().trim();
        if (hex.substring(0,1) === "#") {
            hex = hex.substring(1);
        }
        if (hex === this.scope.color.getHEX()) {
            return;
        }
        var c = new MetaphorJs.lib.Color(hex);
        if (c.getHEX() === hex) {
            this.scope.color.setColor(hex);
            this._updateCanvas();
            this._onChange();
        }
    },

    _onInputRGB: function(r,g,b) {
        this.scope.color.setRGBA(r,g,b,1);
        this._updateCanvas();
        this._onChange();
    },

    onInputR: function(r) {
        this._onInputRGB(this._frame(r, 0, 255));
    },
    onInputG: function(g) {
        this._onInputRGB(null, this._frame(g, 0, 255));
    },
    onInputB: function(b) {
        this._onInputRGB(null, null, this._frame(b, 0, 255));
    },


    _onInputHSV: function(h,s,v) {
        this.scope.color.setHSVA(h,s,v,1);
        this._updateCanvas();
        this._onChange();
    },

    onInputH: function(h) {
        this._onInputHSV(this._frame(h, 0, 360));
    },
    onInputS: function(s) {
        this._onInputHSV(null, this._frame(s, 0, 100));
    },
    onInputV: function(v) {
        this._onInputHSV(null, null, this._frame(v, 0, 100));
    },

    onInputA: function(a) {
        this.scope.color.setAlpha(a);
        this._updateCanvas();
        this._onChange();
    },


    onSVChange: function(hex) {
        if (this.getRefCmp("sv").isDragging() ||
            this.getRefCmp("hue").isDragging()) {
            this.scope.color.setColor(hex);
            this._onChange();
        }
    },

    onAChange: function(a) {
        if (this.getRefCmp("alpha").isDragging()) {
            this.scope.color.setAlpha(a);
            this._onChange();
        }
    },


    _onChange: function() {
        var hex = this.scope.color.getHEX(),
            prev = this._prev;

        this._prev = hex;
        if (prev !== hex) {
            this.trigger("change", hex, prev);
        }
    },


    /* Input API */
    setValue: function(color) {
        this.scope.color.setColor(color);
        this._updateCanvas();
        this._onChange();
    },
    getValue: function() {
        return this.scope.color.getAs(this.config.get("format"));
    },
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
        show: true,
        hide: true,

        class: true,
        style: true,

        bind: true,
        model: true,

        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true,
        mouseover: true,
        mouseout: true
    }
});