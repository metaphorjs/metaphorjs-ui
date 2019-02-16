
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");
require("./Color.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorSV = MetaphorJs.ui.util.Color.$extend({
    $class: "MetaphorJs.ui.util.ColorSV",
    $alias: "MetaphorJs.directive.component.ui-color-sv",

    _color: null,
    _colorHex: null,
    _lastX: 0,
    _lastY: 0,
    _hue: 0,

    initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("cursor", "string", mst);
    },

    initComponent: function() {
        this.$super();
        this._hue = this._color.getHSVA(/**floats: */true)[0];
    },

    setColor: function(color) {
        var prev = this._color.getHEX(),
            hex;
        this._hue = color.getHSVA(/**floats: */true)[0];
        this._color.setColor(color);
        this._colorHex = hex = this._color.getHEX();
        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
            this._renderQueue.add(this.updatePointer);
        }
        if (hex !== prev) {
            this.trigger("change", hex, prev);
        }
    },

    setValue: function(color) {
        var c = new MetaphorJs.lib.Color(color),
            prev = this._color.getHEX(),
            hex;
        this._hue = c.getHSVA(/**floats: */true)[0];
        this._color.setHSVA(this._hue);
        this.config.disableProperty("color");
        hex = this._color.getHEX();
        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
            this._renderQueue.add(this.updatePointer);
        }
        if (hex !== prev) {
            this._colorHex = hex;
            this.trigger("change", hex, prev);
        }
    },

    _onCfgColorChange: function() {
        this.setColor(this.config.get("color"));
    },

    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize(),
            c = new MetaphorJs.lib.Color(this._color);

        c.setHSVA(this._hue, 100, 100);

        ctx.clearRect(0, 0, size.width, size.height);
        ctx.rect(0, 0, size.width, size.height);
        ctx.fillStyle = c.getRGBAString();
        ctx.fillRect(0, 0, size.width, size.height);

        var grdWhite = ctx.createLinearGradient(0, 0, size.width, 0);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grdWhite;
        ctx.fillRect(0, 0, size.width, size.height);

        var grdBlack = ctx.createLinearGradient(0, 0, 0, size.height);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grdBlack;
        ctx.fillRect(0, 0, size.width, size.height);
    },
    

    /** Color */

    _getS: function() {
        var size = this.getSize().width,
            mouse = this._lastX;
        return parseInt((mouse / size) * 100);
    },

    _getV: function() {
        var size = this.getSize().height,
            mouse = this._lastY;
        return 100 - parseInt((mouse / size) * 100);
    },

    updateColor: function() {
        var s = this._getS(),
            v = this._getV();

        this._color.setHSVA(this._hue, s, v);
        var hex = this._color.getHEX(),
            prev;

        if (this._colorHex !== hex) {
            prev = this._colorHex;
            this._colorHex = hex;
            this.trigger("change", hex, prev);
        }
    },

    updatePointer: function() {
        var size = this.getSize(),
            pleft,
            ptop,
            x, y,
            hsva;

        // follow mouse
        if (this._drag) {

            x = this._lastX;
            y = this._lastY;

            x < 0 && (x = 0);
            x > size.width && (x = size.width);
            y < 0 && (y = 0);
            y > size.width && (y = size.width);

            x = x / size.width;
            y = y / size.height;
            
            pleft = parseInt(x * 100) + "%";
            ptop = parseInt(y * 100) + "%";
        }   
        // reflect current value
        else {
            hsva = this._color.getHSVA();
            pleft = hsva[1] + "%";
            ptop = (100-hsva[2]) + "%";
        }

        this.scope.pointerLeft = pleft;
        this.scope.pointerTop = ptop;

        // if pointer is updated via renderQueue
        if (!this._drag) {
            this.scope.$check();
        }
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