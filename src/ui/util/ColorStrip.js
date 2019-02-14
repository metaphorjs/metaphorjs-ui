
require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("./Canvas.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js");

module.exports = MetaphorJs.ui.util.ColorStrip = MetaphorJs.ui.util.Canvas.$extend({
    $class: "MetaphorJs.ui.util.ColorStrip",
    $alias: "MetaphorJs.directive.component.ui-color-strip",

    _apis: ["dom", "input"],
    _color: null,
    _colorHex: null,
    _lastX: 0,
    _lastY: 0,

    _initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("cursor", "string", mst);
        config.setType("format", "string", mst, "hex");
        config.setType("color", "string", null, "rgba(255,0,0,1)");
        config.on("color", self._onCfgColorChange, self);
    },

    initComponent: function() {
        var self = this;
        self.$super();
        self._color = new MetaphorJs.lib.Color(this.config.get("color"));
        self._colorHex = self._color.getHEX();
    },

    _onCfgColorChange: function() {
        this._color.setColor(this.config.get("color"));
        if (this._attached) {
            this._renderQueue.add(this.renderCanvas);
        }
    },

    /**Rendering */

    renderCanvas: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize();

        ctx.rect(0, 0, size.width, size.height);
        var grd1 = ctx.createLinearGradient(0, 0, 0, size.height);
        grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
        grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
        grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
        grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
        grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
        grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
        ctx.fillStyle = grd1;
        ctx.fill();
    },
    

    /** Color */

    _getColorAt: function(x, y) {
        var ctx = this.getCtx();
        var imageData = ctx.getImageData(x, y, 1, 1).data;
        return [imageData[0], imageData[1], imageData[2], 1];
    },


    _updateCurrentColor: function() {
        var rgba = this._getColorAt(this._lastX, this._lastY);
        this._color.setRGBA(rgba);
        var hex = this._color.getHEX(),
            prev;
        if (this._colorHex !== hex) {
            prev = this._colorHex;
            this._colorHex = hex;
            this.trigger("change", hex, prev);
        }
    },

    /**Mouse handling */

    onMouseDown: function(e) {
        this._drag = true;
        this._lastX = e.offsetX;
        this._lastY = e.offsetY;
        this._updateCurrentColor(); 
    },
    onMouseMove: function(e) {
        if (this._drag) {
            this._lastX = e.offsetX;
            this._lastY = e.offsetY;
            this._updateCurrentColor();        
        }
    },
    onMouseUp: function(e) {
        this._drag = false;
    },


    /* Input API */
    setValue: function(color) {
        if (!(color instanceof MetaphorJs.lib.Color)) {
            color = new MetaphorJs.lib.Color(color);
            color = color.getHEX();
        }
        this.config.setStatic("color", color);
    },
    getValue: function() {
        return this._color.getAs(this.config.get("format"));
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