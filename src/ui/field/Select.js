
require("../../__init.js");
require("../../mixin/Selectable.js");
require("../Field.js");
require("metaphorjs-model/src/class/Store.js");
require("metaphorjs/src/lib/Queue.js");
require("metaphorjs/src/func/dom/addClass.js");
require("metaphorjs/src/func/dom/removeClass.js");
require("metaphorjs/src/func/dom/getWidth.js");
require("metaphorjs/src/lib/EventBuffer.js");
require("metaphorjs-dialog/src/class/Dialog.js");

var cls = require("metaphorjs-class/src/cls.js"),
    async = require("metaphorjs/src/func/async.js"),
    bind = require("metaphorjs/src/func/bind.js"),
    isArray = require("metaphorjs/src/func/isArray.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");
    


module.exports = (function(){


    var Select = MetaphorJs.ui.field.Select = MetaphorJs.ui.Field.$extend({
        
        $mixins: [MetaphorJs.mixin.Selectable],
        $alias: "MetaphorJs.directive.component.ui-select",

        template: "ui/field/select.html",
        dialog: null,

        multiple: false,
        searchable: false,

        valueField: "id",
        displayField: "name",

        hiddenInputName: "",
        emptyText: "",
        emptyItemText: "&nbsp;",
        notFoundText: "Nothing found",
        showEmptyItem: true,
        showNotFound: true,
        keepSelectedOptions: true,
        useHiddenSelect: false,

        queryParam: "q",
        queryMode: "local",
        query: null,
        queryMinLength: 3,

        options: null,
        store: null,
        storeAutoLoad: true,
        storePageSize: null,
        storeModel: null,
        model: null,

        currentValue: null,
        currentName: null,
        resizeBuffer: null,
        _firstLoadSet: false,

        _initConfig: function(config) {
            config.setType("multiple", "bool");
            config.setType("searchable", "bool");
            config.setType("storeAutoLoad", "bool");
            config.setType("showEmptyItem", "bool");
            config.setType("showNotFound", "bool");
            config.setType("keepSelectedOptions", "bool");
            config.setType("queryMinLength", "int");
            config.setType("disabled", "bool");
            config.setType("useHiddenSelect", "bool");
            config.setType("storePageSize", "int");
            config.setType("hiddenSelectBreakpoint", "int");
            
            /*this.$addProperties({
                options: {
                    type: "array",
                    watchable: true,
                    nullable: true
                }
            });*/

            this.$super(config);
        },

        initComponent: function() {

            var self = this,
                scope = self.scope;

            if (self.onchange) {
                self.on(
                    "change",
                    createGetter(self.onchange)(self.scope),
                    createGetter(self.onchangeContext)(self.scope)
                );
            }

            self.$$selectionMode = self.multiple ? "multi" : "single";

            if (self.storePageSize !== null) {
                self.storePageSize = parseInt(self.storePageSize);
            }

            self._prevQuery = "";

            self.searchQueue = new Queue({
                auto: true,
                async: 300,
                mode: Queue.REPLACE
            });

            scope.loading = false;
            scope.opened = false;
            scope.searchQuery = "";
            scope.focused = false;

            if (self.store && typeof(self.store) === "string") {
                self.store = createGetter(self.store)(self.scope);
            }

            if (!self.store) {
                self.store = new Store({
                    model: self.storeModel || {
                        id: self.valueField
                    },
                    local: !self.storeModel,
                    autoLoad: self.storeModel && self.storeAutoLoad,
                    pageSize: self.storePageSize
                });
            }

            self.store.on("loading-start", self.onStoreStartLoading, self);
            self.store.on("load", self.onStoreLoad, self);
            self.store.filter(bind(self.storeFilter, self));

            if (self.searchable) {
                self.queryWatcher = self.scope.$watch(
                    "this.searchQuery",
                    self.onSearchQueryChange,
                    self
                );
            }

            if (self.options) {
                self.setOptions(self.options);
            }

            if (self.value) {
                self.setValue(self.value);
            }

            if (self.useHiddenSelect) {
                if (self.hiddenSelectBreakpoint) {
                    self.useHiddenSelect = false;
                    self.resizeBuffer = EventBuffer.get(window, "resize");
                    self.resizeBuffer.watchWidth();
                    self.resizeBuffer.onBreak("width", self.hiddenSelectBreakpoint, 
                                                self.onWindowBreak, self);
                }
            }

            self.$super();
        },

        afterRender: function() {
            var self = this;
            async(self.initDialog, self, [], 300);
            if (self.multiple && self.searchable) {
                async(self.initSizer, self);
            }
            if (self.resizeBuffer) {
                async(self.onWindowBreak, self);
            }
        },

        onWindowBreak: function() {
            this.useHiddenSelect = getWidth(window) < this.hiddenSelectBreakpoint;
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
                pl = getStyle(self.node, "padding-left"),
                pr = getStyle(self.node, "padding-right");

            if (self.disabled) {
                return false;
            }

            pl = pl ? parseInt(pl) : 0;
            pr = pr ? parseInt(pr) : 0;

            self.dialog.getElem().style.minWidth = pl + pr + getWidth(self.node) + "px";
            addClass(self.node, "active");
        },

        onDialogShow: function() {
            this.scope.$set('opened', true);
        },

        onDialogHide: function() {
            this.scope.$set('opened', false);
            removeClass(this.node, "active");
        },

        initDialog: function() {

            var self = this;

            self.dialog = new Dialog({
                target: self.node,
                position: {
                    type: "bl",
                    offsetY: 1
                },
                content: false,
                modal: false,
                group: "ui-select",
                render: {
                    el: self.scope.menu,
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
            if (this.scope.sizer) {
                var style = this.scope.sizer.style;
                style.left = '-10000px';
                style.maxWidth = '1000px';
                style.display = 'inline-block';
                style.position = 'absolute';
            }
        },

        setInputWidth: function() {
            this.scope.search.style.width =
                (getWidth(this.scope.sizer) + 10) + "px";
        },

        storeFilter: function(item) {
            return this.keepSelectedOptions || !this.isSelected(item);
        },

        getItemValue: function(item) {
            return item[this.valueField];
        },

        getItemName: function(item) {
            return item[this.displayField];
        },

        getSelectedValues: function() {
            return this.$$selection;
        },

        getSelectedName: function() {

            var self = this;
            if (self.multiple) {
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
            return this.multiple ? this.getSelection() : [];
        },

        setSearchFocus: function() {
            this.scope.search.focus();
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

            if (self.showEmptyItem && !self.store.isEmpty()) {
                opts.push({
                    name: self.emptyItemText,
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
                val = self.scope.hiddenselect.value;
            
            if (val) {
                var item = self.store.find(self.valueField, val);
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
                if (self.storeAutoLoad) {
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

            if (self.multiple) {
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
            if (!this.query) {
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

            if (self.useHiddenSelect) {
                e.stopPropagation();
                return;
            }

            if (self.scope.focused &&
                self.dialog.isVisible()) {
                e.stopPropagation();
                return;
            }

            if (self.searchable && !self.scope.focused) {
                async(this.setSearchFocus, this);
                e.stopPropagation();
            }

            if (!self.searchable &&
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
                this.setValue(item[this.valueField], item[this.displayField]);
            }
            else {
                this.unselectAll();
            }

            if (!this.keepSelectedOptions) {
                this.store.update();
            }

            e.stopPropagation();

            this.scope.$set("searchQuery", "");

            if (!this.multiple) {
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

        $onPropertyChange: function(val, prev, name) {
            if (name === "options") {
                this.setOptions(val);
            }
        },

        getValue: function() {
            var self = this, 
                sels = self.getSelectedValues();
            if (self.multiple) {
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

            if (self.multiple) {
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

    return Select;
}());