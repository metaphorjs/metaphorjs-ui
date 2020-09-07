require("../../__init.js");
require("metaphorjs/src/app/Component.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("./Canvas.js");
require("metaphorjs-shared/src/lib/Color.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/getOffset.js");
require("metaphorjs/src/func/dom/getScrollTop.js");
require("metaphorjs/src/func/dom/getScrollLeft.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    bind = require("metaphorjs-shared/src/func/bind.js");

module.exports = MetaphorJs.ui.util.Color = MetaphorJs.ui.util.Canvas.$extend({
    $class: "MetaphorJs.ui.util.Color",
    template: "ui/util/color.html",

    _apis: ["dom", "input"],
    _lastX: 0,
    _lastY: 0,

    initComponent: function() {
        var self = this;
        self.$super();
        self.scope.pointerLeft = null;
        self.scope.pointerTop = null;
        self._mouseDownDelegate = bind(self.onMouseDown, self);
        self._mouseUpDelegate = bind(self.onMouseUp, self);
        self._mouseMoveDelegate = bind(self.onMouseMove, self);
        self._touchDownDelegate = bind(self.onTouchDown, self);
        self._touchUpDelegate = bind(self.onTouchUp, self);
        self._touchMoveDelegate = bind(self.onTouchMove, self);
    },

    isDragging: function() {
        return this._drag;
    },

    afterAttached: function() {
        var self = this;
        self.$super();
        self.queueAction(self.updatePointer);

        var el = self.getRefEl("main");
        MetaphorJs.dom.addListener(el, "mousedown", self._mouseDownDelegate);
        MetaphorJs.dom.addListener(el, "touchstart", self._touchDownDelegate, {
            passive: false
        });
    },


    renderCanvas: function(){},
    updateColor: function(){},
    updatePointer: function(){},


    /**Mouse handling */

    updateCoords: function(e) {
        
        var size = this.getSize(),
            evt = e.type.indexOf("touch") !== -1 ? e.changedTouches[0] : e,
            clientX = evt.clientX,
            clientY = evt.clientY,
            ofs = MetaphorJs.dom.getOffset(this.getRefEl("main")),
            st = MetaphorJs.dom.getScrollTop(),
            sl = MetaphorJs.dom.getScrollLeft(),
            x = clientX + sl - ofs.left,
            y = clientY + st - ofs.top;

        x < 0 && (x = 0);
        y < 0 && (y = 0);
        x > size.width && (x = size.width);
        y > size.height && (y = size.height);

        this._lastX = x;
        this._lastY = y;
    },

    onTouchDown: function(e) {
        e.preventDefault();
        var b = window.document.body;

        MetaphorJs.dom.addListener(b, "touchend", this._touchUpDelegate, {
            passive: false
        });
        MetaphorJs.dom.addListener(b, "touchmove", this._touchMoveDelegate, {
            passive: false
        });

        this._drag = true;
        this.updateCoords(e);
        this.updateColor(); 
        this.updatePointer();
    },

    onTouchMove: function(e) {
        e.preventDefault();
        this.onMouseMove(e);
    },

    onTouchUp: function(e) {
        e.preventDefault();
        var b = window.document.body;
        MetaphorJs.dom.removeListener(b, "touchend", this._touchUpDelegate);
        MetaphorJs.dom.removeListener(b, "touchmove", this._touchMoveDelegate);
        this.scope.$check();
        this._drag = false;
    },

    onMouseDown: function(e) {
        var b = window.document.body;

        MetaphorJs.dom.addListener(b, "mouseup", this._mouseUpDelegate);
        MetaphorJs.dom.addListener(b, "mousemove", this._mouseMoveDelegate);

        this._drag = true;
        this.updateCoords(e);
        this.updateColor(); 
        this.updatePointer();
    },

    onMouseMove: function(e) {
        if (this._drag) {
            this.updateCoords(e);
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
    setValue: emptyFn,
    getValue: emptyFn,
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