
require("../../__init.js");
require("../mixin/Selectable.js");
require("./Field.js");
require("metaphorjs-model/src/model/Store.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("metaphorjs/src/func/dom/addClass.js");
require("metaphorjs/src/func/dom/removeClass.js");
require("metaphorjs/src/func/dom/getWidth.js");
require("metaphorjs/src/lib/EventBuffer.js");
require("metaphorjs-dialog/src/dialog/Dialog.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/lib/MutationObserver.js");
require("metaphorjs/src/func/dom/getStyle.js");

require("./view/Select.js");

const async = require("metaphorjs-shared/src/func/async.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.field.Select = MetaphorJs.ui.field.Field.$extend({

    $mixins: [MetaphorJs.ui.mixin.Selectable],
    $class: "MetaphorJs.ui.field.Select",
    $alias: "MetaphorJs.directive.component.ui-select",
    $view: "MetaphorJs.ui.field.view.Select",
    template: "ui/field/select.html",

    dialog: null,

    currentValue: null,
    prevValue: null,
    currentName: null,
    resizeBuffer: null,
    _firstLoadSet: false,

    initConfig: function() {

        this.$super();

        const config = this.config;

        config.setDefaultMode("options", MetaphorJs.lib.Config.MODE_DYNAMIC);
        config.setDefaultMode("store", MetaphorJs.lib.Config.MODE_SINGLE);

        config.setType("searchable", "bool", null, false);
        config.setType("storeAutoLoad", "bool", null, true);
        config.setType("storePageSize", "int", null, 20);
        config.setType("storeFilter", null, MetaphorJs.lib.Config.MODE_LISTENER);
        config.setType("valueField", null, null, "id");
        config.setType("displayField", null, null, "name");

        config.setType("showEmptyItem", "bool", null, true);
        config.setType("showNotFound", "bool", null, true);
        config.setType("showSingleClear", "bool", null, false);
        config.setType("keepSelectedOptions", "bool", null, true);

        config.setType("hiddenInputName", "string", null, "");
        config.setType("emptyText", "string", null, "");
        config.setType("emptyItemText", "string", null, "&nbsp;");
        config.setType("notFoundText", "string", null, "Nothing found");
        config.setType("placeholder", "string", null, "");

        config.setType("queryParam", "string", null, "q");
        config.setType("queryMinLength", "int", null, 3);
        config.setType("queryMode", "string", null, "local");

        config.on("options", this.setOptions, this);
    },

    initComponent: function() {

        const self = this,
            state = self.state,
            config = self.config;

        self._prevQuery = "";
        self.searchQueue = new MetaphorJs.lib.Queue({
            auto: true,
            async: 300,
            mode: MetaphorJs.lib.Queue.REPLACE
        });

        state.loading = false;
        state.opened = false;
        state.searchQuery = "";
        state.focused = false;

        if (config.hasExpression("store")) {
            self.store = config.get("store");
        }

        if (!self.store) {
            self.store = new MetaphorJs.model.Store({
                model: config.get("storeModel") || {
                    id: config.get("valueField")
                },
                local: !config.hasExpression("storeModel"),
                autoLoad: config.hasExpression("storeModel") && 
                            config.get("storeAutoLoad"),
                pageSize: config.get("storePageSize")
            });
        }

        self.store.on("loading-start", self.onStoreStartLoading, self);
        self.store.on("load", self.onStoreLoad, self);

        if (config.get("queryMode") !== "none") {
            self.store.filter(bind(self.storeFilter, self));
        }

        if (config.get("searchable")) {
            self.state.$watch(
                "this.searchQuery",
                self.onSearchQueryChange,
                self
            );
        }

        if (config.hasExpression("storeFilter")) {
            self.storeFilterFn = config.get("storeFilter");
        }
        else self.storeFilterFn = null;

        if (config.has("options")) {
            self.setOptions(config.get("options"));
        }

        self.$super();
    },

    afterRender: function() {
        var self = this;
        async(self.initDialog, self, [], 300);
    },

    onDestroy: function() {
        var self = this;

        if (!self.config.$isDestroyed() && self.config.get("searchable")) {
            self.state.$unwatch(
                "this.searchQuery",
                self.onSearchQueryChange,
                self
            );
        }

        self.$super();
    },

    


    /* PUBLIC API */

    hasSelection: function() {
        if (this.$$selection.length > 0) {
            return true;
        }
        if (this.currentValue) {
            return !isArray(this.currentValue) || this.currentValue.length > 0;
        }
        return false;
    },

    isSelectionEnabled: function() {
        return true;
        //return !this.config.get("disabled");
    },

    getValue: function() {
        var self = this, 
            sels = self.getSelectedValues();
        if (self.isMultiSelection()) {
            return sels;
        }
        else {
            return sels.length ? sels[0] : null;
        }
    },

    setValue: function(val, name) {
        var self = this;

        if (self.currentValue == val) {
            return;
        }

        self.prevValue = self.currentValue;

        if (self.hasSelection() && 
            !self.isMultiSelection()) {
            self.$$observable.suspendEvent("change");
            self.unselectAll();
            self.$$observable.resumeEvent("change");
        }

        if (!val) {
            self.currentValue = null;
            return;
        }

        if (self.isMultiSelection()) {
            if (!isArray(val)) {
                val = [val];
            }
            self.currentValue = val;
            var i, l;
            for (i = 0, l = val.length; i < l; i++) {
                self.selectItemById(val[i]);
            }
        }
        else {
            self.currentValue = val;
            self.currentName = name;
            self.selectItemById(val);
        }
        if (!self.state.$$checking) {
            self.state.$check();
        }
    },

    getSelectedValues: function() {
        return this.$$selection.slice();
    },

    getSelectedName: function() {
        var self = this;
        if (self.isMultiSelection()) {
            return null;
        }
        var sel = self.getSelection();
        if (sel.length) {
            return self.getItemName(sel[0]);
        }
        else if (self.currentName) {
            return self.currentName;
        }
        return self.currentValue;
    },

    getMultiSelection: function() {
        return this.isMultiSelection() ? 
                    this.getSelection() : [];
    },

    search: function(query) {
        this.store.start = 0;
        this.store.setParam(this.queryParam, query);
        this.store.load();
    },

    setOptions: function(options) {
        if (this.store && typeof this.store !== "string") {
            this.store.clear();
            if (options) {
                this.store.addMany(options);
            }
        }
    },


    /* PRIVATE */

    onSearchQueryChange: function(query, prev) {
        var self = this;

        self._prevQuery = prev;

        if (!self.store.local && self.config.get("queryMode") !== "local") {
            if (query.length >= self.queryMinLength) {
                self.searchQueue.append(
                    self.search,
                    self,
                    [query]
                );
            }
            else if (query === "") {
                if (self.config.get("storeAutoLoad")) {
                    self.searchQueue.append(
                        self.search,
                        self,
                        [query]
                    );
                }
                else {                    
                    self.store.clear();
                }
            }
            else {
                self.store.clear();
            }
        }
        else {
            self.store.update();
        }

        self.trigger("query-change", self, query, prev);
    },

    onSelectionChange: function() {
        this.store.update();
        self.prevValue = self.currentValue;
        this.currentValue = this.getValue();
        this.trigger("change", this.currentValue, this, this.prevValue);
    },

    getItemValue: function(item) {
        return item[this.config.get("valueField")];
    },

    getItemName: function(item) {
        return item[this.config.get("displayField")];
    },

    onStoreStartLoading: function() {
        this.state.$set('loading', true);
    },

    onStoreLoad: function() {
        var self = this;

        if (!self._firstLoadSet) {
            self._firstLoadSet = true;
            if (self.currentValue) {
                self.setValue(self.currentValue, self.currentName);
            }
        }
        else {
            if (self.currentValue) {
                self.$$observable.suspendEvent("selection-change");
                self.setValue(self.currentValue, self.currentName);
                self.$$observable.resumeEvent("selection-change");
            }
        }
        self.state.$set('loading', false);
    },

    storeFilter: function(item) {
        var self = this,
            config = self.config;

        if (self.isSelected(item) && !config.get("keepSelectedOptions")) {
            return false;
        }

        if ((config.get("queryMode") === "local" || self.store.local) && 
            self.state.searchQuery) {
            var text = item[config.get("displayField")];
            if (text) {
                if (self.storeFilterFn) {
                    return self.storeFilterFn(item, text, self.state.searchQuery);
                }
                else {
                    return (""+text).toLowerCase().indexOf(
                        self.state.searchQuery.toLowerCase()
                    ) !== -1;
                }
            }
        }

        return true;
    },

    _getSelectOptions: function() {
        var opts = [],
            self = this;

        if (self.config.get("showEmptyItem") && !self.store.isEmpty()) {
            opts.push({
                name: self.config.get("emptyItemText"),
                value: null
            });
        }

        self.store.each(function(item){
            opts.push({
                name: self.getItemName(item),
                value: self.getItemValue(item)
            });
        });

        return opts;
    },





    /* DIALOG */

    onBeforeDialogShow: function() {
        var self = this,
            pl = MetaphorJs.dom.getStyle(self.node, "padding-left"),
            pr = MetaphorJs.dom.getStyle(self.node, "padding-right");

        if (self.disabled) {
            return false;
        }

        pl = pl ? parseInt(pl) : 0;
        pr = pr ? parseInt(pr) : 0;

        self.dialog.getElem().style.minWidth = pl + pr + MetaphorJs.dom.getWidth(self.node) + "px";
        MetaphorJs.dom.addClass(self.node, "active");
    },

    onDialogShow: function() {
        this.state.$set('opened', true);
    },

    onDialogHide: function() {
        this.state.$set('opened', false);
        MetaphorJs.dom.removeClass(this.node, "active");
    },

    initDialog: function() {

        const self = this;
        const customCmp = self.getRefCmp("menu");
        const customEl = self.getRefEl("menu") || (customCmp && customCmp.getRefEl("main"));
        let render,
            position;

        if (!customEl) {
            position = false;
            render = {
                el: self.getRefEl("menu_items"),
                appendTo: false,
                keepInDOM: true
            };
        }
        else {
            position = {
                type: "bl",
                offsetY: 1
            };
            render = {
                el: customEl,
                zIndex: 100,
                appendTo: document.body,
                style: {
                    position: "absolute"
                }
            };
        }

        self.dialog = new MetaphorJs.dialog.Dialog({
            target: self.node,
            position: position,
            content: false,
            modal: false,
            group: "ui-select",
            render: render,
            show: {
                events: false,
                single: true
            },
            hide: {
                events: {
                    "body": "click"
                },
                remove: false
            }
        });

        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);

        self.$$observable.relayEvent(self.dialog, "*", null, "menu-");
    }
}, {

    supportsDirectives: {
        bind: true,
        model: true,
        show: true,
        hide: true,
        class: true,
        style: true,
        "in-focus": "search",
        click: true, 
        dblclick: true, 
        mousedown: true, 
        mouseup: true,
        mousemove: true,
        validate: true
    }
});
