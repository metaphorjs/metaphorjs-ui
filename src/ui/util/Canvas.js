
require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("metaphorjs-shared/src/lib/Color.js");
require("metaphorjs/src/func/dom/getInnerWidth.js");
require("metaphorjs/src/func/dom/getInnerHeight.js");
require("metaphorjs/src/func/dom/whenAttached.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

module.exports = MetaphorJs.ui.util.Canvas = MetaphorJs.app.Component.$extend({
    $class: "MetaphorJs.ui.util.Canvas",
    $alias: "MetaphorJs.directive.component.ui-canvas",
    template: "ui/util/canvas.html",
    as: "cnv",

    _renderQueue: null,
    _currentSize: null,
    _sizePromise: null,
    _sizeInterval: null,

    initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("width", "int", mst);
        config.setType("height", "int", mst);  
    },

    initComponent: function() {

        var self = this;

        self._sizeDelegate = bind(self.getSize, self);
        self._sizePromise = new MetaphorJs.lib.Promise;
        self._renderQueue = new MetaphorJs.lib.Queue({
            async: "raf",
            auto: true,
            mode: MetaphorJs.lib.Queue.REPLACE,
            context: self
        });
    },

    queueAction: function(fn) {
        var self = this;
        self.getSizePromise().done(function(){
            self._renderQueue.add(fn);
        });
    },

    _onCfgWidthChange: function() {
        this._currentSize = null;
        this.queueAction(this.renderCanvas);
    },

    _onCfgHeightChange: function() {
        this._currentSize = null;
        this.queueAction(this.renderCanvas);
    },

    afterAttached: function() {
        var self = this,
            canvas = this.getRefEl("canvas");

        MetaphorJs.dom.whenAttached(canvas)
            .done(function() {
                self.queueAction(self.renderCanvas);
            });

        this.config.on("width", this._onCfgWidthChange, this);
        this.config.on("height", this._onCfgHeightChange, this);
    },


    /**Sizing */


    getCtx: function() {
        if (!this._ctx) {
            var canvas = this.getRefEl("canvas");
            this._ctx = canvas.getContext('2d');
        }
        return this._ctx;
    },

    getSize: function() {

        var canvas = this.getRefEl("canvas");

        if (!this._currentSize) {
            var config = this.config;

            var w = config.has("width"),
                h = config.has("height"),
                main = this.getRefEl("main");

            if (!w) {
                if (main) {
                    w = main.style.width ? 
                            parseInt(main.style.width) :
                            parseInt(MetaphorJs.dom.getInnerWidth(main));
                    w && config.setDefaultValue("width", w);
                }
            }
            if (!h) {
                if (main) {
                    h = main.style.height ?
                            parseInt(main.style.height) :
                            parseInt(MetaphorJs.dom.getInnerHeight(main));
                    h && config.setDefaultValue("height", h);
                }
            }

            w = config.get("width");
            h = config.get("height");

            if (w > 0 && h > 0) { 
                this._currentSize = {width: w, height: h};
                if (this._sizeInterval) {
                    window.clearInterval(this._sizeInterval);
                    this._sizeInterval = null;
                }
            }
            else {
                if (!this._sizeInterval) {
                    this._sizeInterval = window.setInterval(this._sizeDelegate, 50);
                }
            }
        }

        if (canvas && this._currentSize) {
            if (canvas.width != this._currentSize.width || 
                canvas.height != this._currentSize.height) {
                canvas.width = this._currentSize.width;
                canvas.height = this._currentSize.height;
                canvas.setAttribute("width", this._currentSize.width);
                canvas.setAttribute("height", this._currentSize.height);
            }
            if (this._sizePromise && this._sizePromise.isPending()) {
                // delay rendering
                this._sizePromise.after(new MetaphorJs.lib.Promise(function(resolve){
                    window.setTimeout(resolve, 100);
                }));
            }
        }

        if (this._currentSize && this._sizePromise.isPending()) {
            this._sizePromise.resolve(this._currentSize);
        }

        return this._currentSize;
    },
    
    getSizePromise: function() {
        this.getSize();
        return this._sizePromise;
    },

    getCanvasWidth: function() {
        return this.getSize().width;
    },

    getCanvasHeight: function() {
        return this.getSize().height;
    },


    /**Rendering */

    renderCanvas: function() {},


    onDestroy: function() {
        this._renderQueue.$destroy();
        this._sizePromise.$destroy();
        this.$super();
    }
}, {
    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true
    }
});