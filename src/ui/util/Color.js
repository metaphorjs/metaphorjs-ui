require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("./Canvas.js");
require("../../lib/Color.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/getOffset.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

module.exports = MetaphorJs.ui.util.Color = MetaphorJs.ui.util.Canvas.$extend({
    $class: "MetaphorJs.ui.util.Color",
    template: "ui/util/color.html",

    _apis: ["dom", "input"],
    _color: null,
    _colorHex: null,
    _lastX: 0,
    _lastY: 0,

    initConfig: function() {

        this.$super();
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;

        config.setType("format", "string", mst, "hex");
        config.setType("color", null, null, "rgba(255,0,0,1)");
        config.on("color", this._onCfgColorChange, this);
    },

    initComponent: function() {
        var self = this;
        self.$super();
        self.scope.pointerLeft = null;
        self.scope.pointerTop = null;
        self._color = new MetaphorJs.lib.Color(this.config.get("color"));
        self._colorHex = self._color.getHEX();

        self._mouseUpDelegate = bind(self.onMouseUp, self);
        self._mouseMoveDelegate = bind(self.onMouseMove, self);
    },

    isDragging: function() {
        return this._drag;
    },

    afterAttached: function() {
        this.$super();
        this._renderQueue.add(this.updatePointer);
    },

    _onCfgColorChange: function() {},


    renderCanvas: function(){},
    updateColor: function(){},
    updatePointer: function(){},


    /**Mouse handling */

    _updateCoords: function(e) {
        var size = this.getSize();
        var ofs = MetaphorJs.dom.getOffset(this.getRefEl("main"));
        var x = e.clientX - ofs.left;
        var y = e.clientY - ofs.top;

        x < 0 && (x = 0);
        y < 0 && (y = 0);
        x > size.width && (x = size.width);
        y > size.height && (y = size.height);

        this._lastX = x;
        this._lastY = y;
    },

    onMouseDown: function(e) {
        var b = window.document.body;
        MetaphorJs.dom.addListener(b, "mouseup", this._mouseUpDelegate);
        MetaphorJs.dom.addListener(b, "mousemove", this._mouseMoveDelegate);
        this._drag = true;
        
        this._updateCoords(e);
        this.updateColor(); 
        this.updatePointer();
    },
    onMouseMove: function(e) {
        if (this._drag) {
            this._updateCoords(e);
            this.updateColor();        
            this.updatePointer();
            this.scope.$check();
        }
    },
    onMouseUp: function(e) {
        var b = window.document.body;
        MetaphorJs.dom.removeListener(b, "mouseup", this._mouseUpDelegate);
        MetaphorJs.dom.removeListener(b, "mousemove", this._mouseMoveDelegate);
        this.scope.$check();
        this._drag = false;
    },


    /* Input API */
    setValue: function(color) {
        
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