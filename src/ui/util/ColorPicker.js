require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");

require("metaphorjs-shared/src/lib/Color.js");
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
    _color: null,
    _prev: null,

    initComponent: function() {
        this.$super();
        this._color = this.scope.color = new MetaphorJs.lib.Color(null, "hsva");
        this._color.setColor(this.config.get("color"));
        this._prev = this._color.getHSVAString();
    },

    initConfig: function() {
        this.$super();
        this.config.setType("color", null, null, "hsva(0,100,100,1)")
    },

    afterRender: function(){
        this._updateCanvas();
    },

    _frame: function(val, min, max) {
        val = parseFloat(val);
        val < min && (val = min);
        val > max && (val = max);
        return val;
    },

    _updateCanvas: function() {
        this._updating = true;

        var sv = this.getRefCmp("sv"),
            hue = this.getRefCmp("hue"),
            alpha = this.getRefCmp("alpha"),
            c = this._color;

        sv && sv.setValue(c);
        hue && hue.setValue(c.getH());
        alpha && alpha.setValue(c.getAlpha());

        this.scope.$check();
        this._updating = false;
    },


    onInputHex: function(hex) {
        hex = (""+hex).toLowerCase().trim();
        if (hex.substring(0,1) === "#") {
            hex = hex.substring(1);
        }
        if (hex === this._color.getHEX()) {
            return;
        }
        var c = new MetaphorJs.lib.Color(hex);
        if (c.getHEX() === hex) {
            this._color.setColor(hex);
            this._updateCanvas();
            this._onChange();
        }
    },

    _onInputRGBA: function(r,g,b,a) {
        this._color.setRGBA(r,g,b,a);
        this._updateCanvas();
        this._onChange();
    },

    onInputR: function(r) {
        this._onInputRGBA(this._frame(r, 0, 255));
    },
    onInputG: function(g) {
        this._onInputRGBA(null, this._frame(g, 0, 255));
    },
    onInputB: function(b) {
        this._onInputRGBA(null, null, this._frame(b, 0, 255));
    },
    onInputA: function(a) {
        this._onInputRGBA(null, null, null, this._frame(a, 0, 1));
    },


    _onInputHSV: function(h,s,v) {
        this._color.setHSVA(h,s,v);
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
    


    onInputSV: function(sv) {
        if (this.getRefCmp("sv").isDragging()) {
            this._color.setHSVA(null, sv[0], sv[1]);
            this._onChange();
        }
    },
    onInputHue: function(hue) {
        if (this.getRefCmp("hue").isDragging()) {
            this._color.setHSVA(hue);
            this._onChange();
        }
    },
    onInputAlpha: function(a) {
        if (this.getRefCmp("alpha").isDragging()) {
            this._color.setAlpha(a);
            this._onChange();
        }
    },


    _onChange: function() {
        var val = this._color.getRGBAString(),
            prev = this._prev;
        if (prev !== val) {
            this._prev = val;
            this.trigger("change", val, prev, this._color, this);
        }
    },


    /* Input API */
    setValue: function(color) {
        this._color.setColor(color);
        this._onChange();
        this.scope.$check();
        this._updateCanvas();
    },
    getValue: function() {
        return this._color;
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