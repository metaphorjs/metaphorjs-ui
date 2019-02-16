
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");
require("./Color.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorHue = MetaphorJs.ui.util.Color.$extend({
    $class: "MetaphorJs.ui.util.ColorHue",
    $alias: "MetaphorJs.directive.component.ui-color-hue",

    _apis: ["dom", "input"],
    _color: null,
    _colorHex: null,
    _lastX: 0,
    _lastY: 0,

    initConfig: function() {
        this.$super();

        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("position", "string", mst, "v");
        config.setType("cursor", "string", mst);
    },

    initComponent: function() {
        this.$super();
        this._color.setHSVA(null, 100, 100, 1);
        this._colorHex = this._color.getHEX();
    },

    _setValue: function(color) {
        var c = new MetaphorJs.lib.Color(color),
            prev = this._color.getHEX(),
            hex;
        this._color.setHSVA(c.getHSVA(/**floats: */ true)[0]);
        hex = this._color.getHEX();
        if (this._attached) {
            this._renderQueue.add(this.updatePointer);
        }
        if (hex !== prev) {
            this._colorHex = hex;
            this.trigger("change", hex, prev);
        }
    },

    setColor: function(color) {
        this._setValue(color);
    },

    setValue: function(color) {
        this.config.disableProperty("color");
        this._setValue(color);
    },

    _onCfgColorChange: function() {
        this._setValue(this.config.get("color"));
    },

    _onCfgColorChange: function() {
        var c = new MetaphorJs.lib.Color(this.config.get("color")),
            hsva = c.getHSVA();
        this._color.setHSVA(hsva[0]);
        if (this._attached) {
            this._renderQueue.add(this.updatePointer);
        }
    },

    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize(),
            pos = self.config.get("position"),
            grd;
        
        ctx.rect(0, 0, size.width, size.height);

        if (pos === "v") {
            grd = ctx.createLinearGradient(0, 0, 0, size.height);
        }
        else {
            grd = ctx.createLinearGradient(0, 0, size.width, 0);
        }
        grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        grd.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        grd.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        grd.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        grd.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        grd.addColorStop(1, 'rgba(255, 0, 0, 1)');
        ctx.fillStyle = grd;
        ctx.fill();
    },


    /** Color */

    _getIntValue: function() {
        var pos = this.config.get("position"),
            size = this.getSize()[pos === "v" ? "height" : "width"],
            mouse = this[pos === "v" ? "_lastY" : "_lastX"];
        return mouse / size;
    },

    updateColor: function() {
        var pos = this._getIntValue();
        var h = pos * 360;

        this._color.setHSVA(h);
        var hex = this._color.getHEX(),
            prev;

        if (this._colorHex !== hex) {
            prev = this._colorHex;
            this._colorHex = hex;
            this.trigger("change", hex, prev);
        }
    },

    updatePointer: function() {
        var mouse,
            pos = this.config.get("position"),
            size = this.getSize(),
            skey = pos === 'v' ? 'height' : 'width',
            pkeyPrim = pos === 'v' ? 'pointerTop' : 'pointerLeft',
            pkeySec = pos === 'v' ? 'pointerLeft' : 'pointerTop',
            ckey = pos === 'v' ? '_lastY' : '_lastX';

        // follow mouse
        if (this._drag) {
            mouse = this[ckey];
        }   
        // reflect current value
        else {
            var hsva = this._color.getHSVA(),
                h = hsva[0] / 360,
                mouse = h * size[skey];
        }

        mouse < 0 && (mouse = 0);
        mouse > size[skey] && (mouse = size[skey]);

        this.scope[pkeySec] = "50%";
        this.scope[pkeyPrim] = parseInt(mouse) + "px";

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