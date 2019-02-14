
require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("./Canvas.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js");

module.exports = MetaphorJs.ui.util.ColorCanvas = MetaphorJs.ui.util.Canvas.$extend({
    $class: "MetaphorJs.ui.util.ColorCanvas",
    $alias: "MetaphorJs.directive.component.ui-color-canvas",

    _apis: ["dom", "input"],
    _baseColor: null,
    _currentColor: null,
    _currentColorHex: null,
    _lastX: 0,
    _lastY: 0,

    _initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("cursor", "string", mst);
        config.setType("format", "string", mst, "hex");
        config.setType("baseColor", "string", null, "rgba(255,0,0,1)");
        config.on("baseColor", this._onCfgColorChange, this);
    },

    initComponent: function() {
        var self = this;
        self.$super();
        self._currentColor = new MetaphorJs.lib.Color("ffffff");
        self._currentColorHex = "ffffff";
        self._baseColor = new MetaphorJs.lib.Color;
        this._baseColor.setColor(this.config.get("baseColor"));
    },

    _onCfgColorChange: function() {
        this._baseColor.setColor(this.config.get("baseColor"));
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
        ctx.fillStyle = self._baseColor.getRGBAString();
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

    _getColorAt: function(x, y) {
        var ctx = this.getCtx();
        var imageData = ctx.getImageData(x, y, 1, 1).data;
        return [imageData[0], imageData[1], imageData[2], 1];
    },

    _updateCurrentColor: function() {
        var rgba = this._getColorAt(this._lastX, this._lastY);
        this._currentColor.setRGBA(rgba);
        var hex = this._currentColor.getHEX(),
            prev;
        if (this._currentColorHex !== hex) {
            prev = this._currentColorHex;
            this._currentColorHex = hex;
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
    setValue: function(baseColor) {
        
    },
    getValue: function() {
        return this._currentColor.getAs(this.config.get("format"));
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