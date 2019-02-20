
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");
require("./Color.js");
require("metaphorjs-shared/src/lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorHue = MetaphorJs.ui.util.Color.$extend({
    $class: "MetaphorJs.ui.util.ColorHue",
    $alias: "MetaphorJs.directive.component.ui-color-hue",

    _apis: ["dom", "input"],
    _hue: 0,
    _lastX: 0,
    _lastY: 0,

    initConfig: function() {
        this.$super();

        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("position", "string", mst, "v");
        config.setType("cursor", "string", mst);
        config.setType("hue", "float", null, 0);
        config.on("hue", this.setValue, this);
    },

    initComponent: function() {
        this.$super();

        if (this.config.has("hue")) {
            this._hue = this.config.get("hue");
        }
    },

    setValue: function(hue) {
        hue = parseFloat(hue);
        hue < 0 && (hue = 0);
        hue > 360 && (hue = 360);
        var prev = this._hue;
        this._hue = hue;
        if (this._attached) {
            this._renderQueue.add(this.updatePointer);
        }
        if (hue !== prev) {
            this.trigger("change", hue, prev);
        }
    },


    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize(),
            pos = self.config.get("position"),
            grd;
        
        ctx.clearRect(0, 0, size.width, size.height);
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
        return (mouse / size) * 360;
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
            mouse = (this._hue / 360) * size[skey];
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