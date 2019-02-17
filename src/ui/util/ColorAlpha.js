
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
    _lastX: 0,
    _lastY: 0,

    initConfig: function() {
        this.$super();

        var self = this,
            config = self.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("position", "string", mst, "v");
        config.setType("cursor", "string", mst);
        config.setType("alpha", "float", null, 1);
        config.setDefaultValue("color", "hsva(0,100,100,1)")
        config.on("alpha", self.setValue, self);
        config.on("color", self.setColor, self);
        config.on("hue", self.setHue, self);
    },

    initComponent: function() {
        this.$super();
        this._color = new MetaphorJs.lib.Color(null, "hsva");
        this._color.setColor(this.config.get("color"));
        if (this.config.has("alpha")) {
            this._alpha = this.config.get("alpha");
            this._color.setAlpha(this._alpha);
        }
        else this._alpha = this._color.getAlpha();
    },

    setColor: function(color) {
        this._color.setColor(color);
        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
        }
    },

    setHue: function(hue) {
        this._color.setHSVA(hue);
        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
        }
    },

    setValue: function(alpha) {
        alpha = parseFloat(alpha);
        alpha < 0 && (alpha = 0);
        alpha > 1 && (alpha = 1);
        var prev = this._alpha;
        this._alpha = alpha;
    
        if (alpha != prev) {
            if (this._attached) {
                this._renderQueue.add(this.updatePointer);
            }
            this.trigger("change", alpha, prev);
        }
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
        this.setValue(this._getIntValue());
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
            mouse = (1 - this._alpha) * size[skey];
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