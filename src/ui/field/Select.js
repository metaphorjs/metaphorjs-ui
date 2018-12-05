
require("../../__init.js");
require("../../mixin/Selectable.js");
require("../Field.js");
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

var async = require("metaphorjs-shared/src/func/async.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.field.Select = MetaphorJs.ui.Field.$extend({

    $mixins: [MetaphorJs.mixin.Selectable],
    $alias: "MetaphorJs.directive.component.ui-select",

    template: "ui/field/select.html",
    dialog: null,

    currentValue: null,
    currentName: null,
    resizeBuffer: null,
    _firstLoadSet: false,

    _initConfig: function() {

        this.$super();

        var config = this.config;

        config.setDefaultMode("options", MetaphorJs.lib.Config.MODE_SINGLE);
        config.setDefaultMode("store", MetaphorJs.lib.Config.MODE_SINGLE);

        config.setType("searchable", "bool", null, false);
        config.setType("storeAutoLoad", "bool", null, true);
        config.setType("storePageSize", "int", null, 20);
        config.setType("valueField", null, null, "id");
        config.setType("displayField", null, null, "name");

        config.setType("showEmptyItem", "bool", null, true);
        config.setType("showNotFound", "bool", null, true);
        config.setType("keepSelectedOptions", "bool", null, true);
        config.setType("useHiddenSelect", "bool", null, false);
        config.setType("hiddenSelectBreakpoint", "int");

        config.setType("hiddenInputName", "string", null, "");
        config.setType("emptyText", "string", null, "");
        config.setType("emptyItemText", "string", null, "&nbsp;");
        config.setType("notFoundText", "string", null, "Nothing found");

        config.setType("queryParam", "string", null, "q");
        config.setType("queryMinLength", "int", null, 3);
        config.setType("queryMode", "string", null, "local");

        console.log(config.properties)
    },

    initComponent: function() {

        var self = this,
            scope = self.scope,
            config = self.config;

        self._prevQuery = "";
        self.searchQueue = new MetaphorJs.lib.Queue({
            auto: true,
            async: 300,
            mode: MetaphorJs.lib.Queue.REPLACE
        });

        scope.loading = false;
        scope.opened = false;
        scope.searchQuery = "";
        scope.focused = false;

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
        self.store.filter(bind(self.storeFilter, self));

        if (config.get("searchable")) {
            self.queryWatcher = self.scope.$watch(
                "this.searchQuery",
                self.onSearchQueryChange,
                self
            );
        }

        if (config.hasExpression("options")) {
            self.setOptions(config.get("options"));
        }

        if (config.get("useHiddenSelect")) {
            if (config.get("hiddenSelectBreakpoint")) {
                config.set("useHiddenSelect", false);
                self.resizeBuffer = MetaphorJs.dom.EventBuffer.get(window, "resize");
                self.resizeBuffer.watchWidth();
                self.resizeBuffer.onBreak(
                    "width", 
                    config.get("hiddenSelectBreakpoint"), 
                    self.onWindowBreak, 
                    self
                );
            }
        }

        window.selObj = self;

        self.$super();
    },

    afterRender: function() {
        var self = this;
        async(self.initDialog, self, [], 300);
        if (self.config.get("selectionMode") === "multi" && 
            self.config.get("searchable")) {
            async(self.initSizer, self);
        }
        if (self.resizeBuffer) {
            async(self.onWindowBreak, self);
        }
    },

    onWindowBreak: function() {
        this.config.set("useHiddenSelect", 
            getWidth(window) < this.config.get("hiddenSelectBreakpoint")
        );
        this.scope.$check();
    },

    onStoreStartLoading: function() {
        this.scope.$set('loading', true);
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
        self.scope.$set('loading', false);
    },

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
        this.scope.$set('opened', true);
    },

    onDialogHide: function() {
        this.scope.$set('opened', false);
        MetaphorJs.dom.removeClass(this.node, "active");
    },

    initDialog: function() {

        var self = this;

        self.dialog = new MetaphorJs.dialog.Dialog({
            target: self.node,
            position: {
                type: "bl",
                offsetY: 1
            },
            content: false,
            modal: false,
            group: "ui-select",
            render: {
                el: self.scope.el_menu,
                zIndex: 100,
                appendTo: document.body,
                style: {
                    position: "absolute"
                }
            },
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
    },

    initSizer: function() {
        if (this.scope.el_sizer) {
            var style = this.scope.el_sizer.style;
            style.left = '-10000px';
            style.maxWidth = '1000px';
            style.display = 'inline-block';
            style.position = 'absolute';
        }
    },

    setInputWidth: function() {
        this.scope.el_search.style.width =
            (MetaphorJs.dom.getWidth(this.scope.el_sizer) + 10) + "px";
    },

    storeFilter: function(item) {
        return this.config.get("keepSelectedOptions") || !this.isSelected(item);
    },

    getItemValue: function(item) {
        return item[this.config.get("valueField")];
    },

    getItemName: function(item) {
        return item[this.config.get("displayField")];
    },

    getSelectedValues: function() {
        return this.$$selection;
    },

    getSelectedName: function() {

        var self = this;
        if (self.config.get("selectionMode") === "multi") {
            return null;
        }
        var sel = self.getSelection();
        if (sel.length) {
            return self.getItemName(sel[0]);
        }
        else if (self.currentName) {
            return self.currentName;
        }
        return null;
    },

    getMultiSelection: function() {
        return this.config.get("selectionMode") === "multi" ? 
                    this.getSelection() : [];
    },

    setSearchFocus: function() {
        this.scope.el_search.focus();
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

    hasSelection: function() {
        return !!(this.currentValue || this.$$selection.length);
    },


    onHiddenSelectClick: function(e) {
        e.stopPropagation();
    },

    onHiddenSelectChange: function(e) {
        var self = this,
            val = self.scope.el_hiddenselect.value;
        
        if (val) {
            var item = self.store.find(self.config.get("valueField"), val);
            if (item) {
                self.selectItem(item);
            }
        }
        else {
            self.unselectAll();
        }
    },

    /*onOptionsChange: function(options) {
        this.store.clear();
        this.store.addMany(options);
    },

    forceOptionsChange: function() {
        //this.optionsWatcher.check();
    },*/

    onSearchQueryChange: function(query, prev) {
        var self = this;

        self._prevQuery = prev;

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

        if (self.config.get("selectionMode") === "multi") {
            async(self.setInputWidth, self);
        }
    },

    onSearchFocus: function(e) {
        this.scope.$set("focused", true);
        if (!this.dialog.isVisible()) {
            this.dialog.show();
            e.stopPropagation();
        }
    },

    onSearchBlur: function(e) {
        this.scope.$set("focused", false);
        if (!this.dialog.isVisible()) {
            this.dialog.show();
            e.stopPropagation();
        }
    },

    onSearchBackspace: function() {
        if (!this.scope.searchQuery) {
            if (!this._prevQuery) {
                if (this.hasSelection()) {
                    this.unselectItemById(
                        this.$$selection[this.$$selection.length - 1]
                    );
                }
            }
            else {
                this._prevQuery = "";
            }
        }
    },

    onSelfClick: function(e) {
        var self = this;

        if (self.config.get("useHiddenSelect")) {
            e.stopPropagation();
            return;
        }

        if (self.scope.focused &&
            self.dialog.isVisible()) {
            e.stopPropagation();
            return;
        }

        if (self.config.get("searchable") && !self.scope.focused) {
            async(this.setSearchFocus, this);
            e.stopPropagation();
        }

        if (!self.config.get("searchable") &&
            !self.dialog.isVisible()) {
            self.dialog.show();
            e.stopPropagation();
        }
    },

    onDropdownIconClick: function(e) {
        e.stopPropagation();
        this.dialog.toggle(e, true);
    },

    onItemClick: function(item, e) {
        if (item) {
            //this.selectItem(item);
            this.setValue(
                item[this.config.get("valueField")], 
                item[this.config.get("displayField")]
            );
        }
        else {
            this.unselectAll();
        }

        if (!this.config.get("keepSelectedOptions")) {
            this.store.update();
        }

        e.stopPropagation();

        this.scope.$set("searchQuery", "");

        if (this.config.get("selectionMode") !== "multi") {
            this.dialog.hide();
        }
        else {
            async(this.setSearchFocus, this);
        }
    },

    onValueTextClick: function(e) {

    },

    onItemDeleteClick: function(item, e) {
        this.unselectItem(item);
        e.stopPropagation();
    },

    onNotFoundClick: function(item, e){
        e.stopPropagation();
    },

    onPaginationClick: function(e) {
        e.stopPropagation();
    },

    onSelectionChange: function() {
        this.currentValue = this.getValue();
        this.trigger("change", this.currentValue, this);
    },


    getValue: function() {
        var self = this, 
            sels = self.getSelectedValues();
        if (self.config.get("selectionMode") === "multi") {
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

        if (self.hasSelection()) {
            self.unselectAll();
        }

        if (!val) {
            return;
        }

        if (self.config.get("selectionMode") === "multi") {
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
    },

    destroy: function() {
        this.$super();
    },

    getInputInterface: function() {

        var self = this;

        return {
            getValue: function() {
                return self.getValue();
            },
            setValue: function(val) {
                self.setValue(val);
            },
            onChange: function(fn, context) {
                self.on("change", fn, context);
            },
            unChange: function(fn, context) {
                self.un("change", fn, context);
            },
            destroy: function() {}
        };
    }
});
