
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");
require("./Color.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorAlpha = MetaphorJs.ui.util.Color.$extend({
    $class: "MetaphorJs.ui.util.ColorAlpha",
    $alias: "MetaphorJs.directive.component.ui-color-alpha",

    _apis: ["dom", "input"],
    _color: null,
    _alpha: null,
    //_hue: null,
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
        //this._color.setHSVA(null, 100, 100);
        this._alpha = this._color.getAlpha();
        //this._hue = this._color.getHSVA(/**floats: */true)[0];
    },

    _setValue: function(color, setHue, setA) {
        var c = new MetaphorJs.lib.Color(color),
            prev = this._color.getAlpha(),
            a = prev;

        if (setHue) {
            //this._hue = c.getHSVA(/**floats: */true)[0];
            var hue = c.getHSVA(/**floats: */true);
            this._color.setHSVA(hue[0], hue[1], hue[2]);
        }

        if (setA) {
            this._alpha = a = c.getAlpha();
            this._color.setAlpha(this._alpha);
        }

        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
            this._renderQueue.add(this.updatePointer);
        }
        if (a !== prev) {
            this.trigger("change", a, prev);
        }
    },

    setColor: function(color) {
        this._setValue(color, true, true);
    },

    setValue: function(color) {
        this.config.disableProperty("color");
        this._setValue(color, true, false);
    },

    _onCfgColorChange: function() {
        this._setValue(this.config.get("color"), true, true);
    },


    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize(),
            pos = self.config.get("position"),
            c = new MetaphorJs.lib.Color(this._color),
            grd;

        c.setAlpha(1);
        ctx.clearRect(0, 0, size.width, size.height);
        ctx.rect(0, 0, size.width, size.height);

        if (pos === "v") {
            grd = ctx.createLinearGradient(0, 0, 0, size.height);
        }
        else {
            grd = ctx.createLinearGradient(0, 0, size.width, 0);
        }

        grd.addColorStop(0, c.getRGBAString());
        c.setAlpha(0);
        grd.addColorStop(1, c.getRGBAString());
        ctx.fillStyle = grd;
        ctx.fill();
    },


    /** Color */

    _getIntValue: function() {
        var pos = this.config.get("position"),
            size = this.getSize()[pos === "v" ? "height" : "width"],
            mouse = this[pos === "v" ? "_lastY" : "_lastX"];
        return 1 - (mouse / size);
    },

    updateColor: function() {
        var a = this._getIntValue(),
            prev = this._alpha;

        this._color.setAlpha(a);
        
        if (this._alpha !== a) {
            this._alpha = a;
            this.trigger("change", a, prev);
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
            var a = this._color.getAlpha(),
                mouse = (1-a) * size[skey];
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
        input: true,

        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true,
        mouseover: true,
        mouseout: true
    }
});