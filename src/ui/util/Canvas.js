
require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("../../lib/Color.js");
require("metaphorjs/src/func/dom/getInnerWidth.js");
require("metaphorjs/src/func/dom/getInnerHeight.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    async = require("metaphorjs-shared/src/func/async.js");

module.exports = MetaphorJs.ui.util.Canvas = MetaphorJs.app.Component.$extend({
    $class: "MetaphorJs.ui.util.Canvas",
    $alias: "MetaphorJs.directive.component.ui-canvas",
    template: "ui/util/canvas.html",
    as: "cnv",

    _renderQueue: null,
    _currentSize: null,

    initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("width", "int", mst);
        config.setType("height", "int", mst);  
    },

    initComponent: function() {

        var self = this;

        self._renderQueue = new MetaphorJs.lib.Queue({
            async: "raf",
            auto: true,
            mode: MetaphorJs.lib.Queue.REPLACE,
            context: self
        });
    },

    _onCfgWidthChange: function() {
        this._currentSize = null;
        this._renderQueue.add(this.renderCanvas);
    },

    _onCfgHeightChange: function() {
        this._currentSize = null;
        this._renderQueue.add(this.renderCanvas);
    },

    afterAttached: function() {
        if (!this.config.has("width") || 
            !this.config.has("height")) {
            this._renderQueue.add(this.getSize);
            async(this.renderCanvas, this, [], 100);    
        }
        else this._renderQueue.add(this.renderCanvas);
        
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

        if (!this._currentSize) {
            var config = this.config;

            var w = config.has("width"),
                h = config.has("height"),
                main = this.getRefEl("main");

            if (!w) {
                if (main) {
                    if (main.style.width) {
                        config.setDefaultValue("width", parseInt(main.style.width));
                    }
                    else {
                        config.setDefaultValue("width", 
                            parseInt(MetaphorJs.dom.getInnerWidth(main)));
                    }
                }
            }
            if (!h) {
                if (main) {
                    if (main.style.height) {
                        config.setDefaultValue("height", parseInt(main.style.height));
                    }
                    else {
                        config.setDefaultValue("height", 
                            parseInt(MetaphorJs.dom.getInnerHeight(main)));
                    }
                }
            }

            this._currentSize = {
                width: config.get("width"),
                height: config.get("height")
            };
        }

        return this._currentSize;
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