
require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("../../lib/Color.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.util.Canvas = MetaphorJs.app.Component.$extend({
    $class: "MetaphorJs.ui.util.Canvas",
    $alias: "MetaphorJs.directive.component.ui-canvas",
    template: "ui/util/canvas.html",
    as: "cnv",

    _renderQueue: null,
    _currentSize: null,

    _initConfig: function() {
        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("width", "int", mst);
        config.setType("height", "int", mst);
        config.on("width", self._onCfgWidthChange, self);
        config.on("height", self._onCfgHeightChange, self);
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
        this._renderQueue.add(this.renderCanvas);
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
        return this.getSize().width;
    },


    /**Rendering */

    renderCanvas: function() {
        
    },


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