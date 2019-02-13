
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/lib/EventBuffer.js");
require("../mixin/WithActiveState.js");
require("../mixin/WithText.js");
require("../mixin/WithDropdown.js");
require("metaphorjs/src/func/dom/getWidth.js");
require("metaphorjs/src/func/dom/getHeight.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    raf = require("metaphorjs-animate/src/func/raf.js");

module.exports = MetaphorJs.ui.util.ColorPalette = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.util.ColorPalette",
    $alias: "MetaphorJs.directive.component.ui-color-palette",
    template: "ui/util/color-palette.html",
    as: "cplt",

    _liveSize: false,
    _resizeQueue: null,
    _drag: false,

    initComponent: function() {

        var self = this,
            config = self.config,
            w = config.get("width"),
            h = config.get("height");

        if (!w || (""+w).indexOf("px") === -1) {
            self._liveSize = true;   
        }
        if (!h || (""+h).indexOf("px") === -1) {
            self._liveSize = true;
        }

        if (self._liveSize) {
            self._resizeQueue = MetaphorJs.lib.EventBuffer.get(
                window, "resize", 50
            );
            self._resizeQueue.on(self._onWindowResize, self);
        }
    },

    _onWindowResize: function() {
        this.renderPallette();
    },

    _initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;
        config.setType("width", "string", mst);
        config.setType("height", "string", mst);
        config.setType("cursor", "string", mst);
        config.setType("color", "string");
    },

    afterAttached: function() {
        raf(this.renderPallette, this);
    },

    getCtx: function() {
        if (!this._ctx) {
            var canvas = this.getRefEl("canvas");
            this._ctx = canvas.getContext('2d');
        }
        return this._ctx;
    },

    getSize: function() {
        var config = this.config,
            canvas = this.getRefEl("canvas");

        return this._liveSize ? 
            {
                width: MetaphorJs.dom.getWidth(canvas),
                height: MetaphorJs.dom.getWidth(canvas)
            } :
            {
                width: parseInt(config.get("width")),
                height: parseInt(config.get("height"))
            };
    },

    renderPallette: function() {
        var self = this,
            ctx = self.getCtx(),
            size = self.getSize();

        ctx.rect(0, 0, size.width, size.height);
        ctx.fillStyle = "rgba(255,0,0,1)";
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

    onMouseDown: function(e) {
        this._drag = true;
    },
    onMouseMove: function(e) {
        if (this._drag) {
            var x = e.offsetX;
            var y = e.offsetY;
            var ctx = this.getCtx();
            var imageData = ctx.getImageData(x, y, 1, 1).data;
            var rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
            console.log(rgbaColor)
        }
    },
    onMouseUp: function(e) {
        this._drag = false;
    }
}, {
    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: "button", 
        dblclick: "button", 
        mousedown: "button", 
        mouseup: "button",
        mousemove: "button"
    }
});