
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");
require("./Color.js");
require("metaphorjs-shared/src/lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.ColorSV = MetaphorJs.ui.util.Color.$extend({
    $class: "MetaphorJs.ui.util.ColorSV",
    $alias: "MetaphorJs.directive.component.ui-color-sv",

    _color: null,
    _lastX: 0,
    _lastY: 0,
    _sv: null,
    _hue: null,

    initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("cursor", "string", mst);
        config.setType("color", null, null, "hsva(0,100,100,1)");
        config.on("color", this.setColor, this);
        config.on("hue", this.setHue, this);
    },

    initComponent: function() {
        this.$super();
        this._color = new MetaphorJs.lib.Color(null, "hsva");
        this._color.setColor(this.config.get("color"));
        this._color.setAlpha(1);

        if (this.config.has("hue")) {
            this._color.setHSVA(this.config.get("hue"));
        }

        this._sv = [this._color.getS(), this._color.getV()];
        this._hue = this._color.getH();
    },

    setColor: function() {
        var c = new MetaphorJs.lib.Color(this.config.get("color"), "hsva");
        this.setHue(c.getH());
        this.setValue([c.getS(), c.getV()]);
    },

    setHue: function(hue) {
        if (this._color.getH() !== hue) {
            this._color.setHSVA(hue);
            this._hue = this._color.getH();
            if (this._attached) {
                this._renderQueue.add(this.renderCanvas);
            }
        }
    },

    setValue: function(sv) {

        var prev = this._sv,
            c = this._color;

        c.setHSVA(this._hue, sv[0], sv[1]);

        if (prev[0] !== c.getS() || prev[1] !== c.getV()) {
            if (this._attached) {
                this._renderQueue.add(this.updatePointer);
            }

            this._sv = sv;
            this.trigger("change", sv, prev);
        }
    },

    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize(),
            c = new MetaphorJs.lib.Color(null, "hsva");

        c.setHSVA(this._color.getH(), 100, 100);

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
        this.setValue([this._getS(), this._getV()]);
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