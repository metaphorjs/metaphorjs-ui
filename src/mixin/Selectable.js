
require("metaphorjs/src/lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.mixin.Selectable = {

    $beforeInit: function() {
        this.$$selection = [];
        this.$$_selectable_itemCache = {};
    },

    $initConfig: function() {
        this.config.setType("selectionMode", 
            null, MetaphorJs.lib.Config.MODE_STATIC, "single");
    },

    $beforeDestroy: function() {
        this.$$_selectable_itemCache = null;
    },

    $$_selectable_getItemId: function(item) {
        if (this.store) {
            return this.store.getRecordId(item);
        }
        return item.id;
    },

    getSelection: function() {
        var self = this,
            store = self.store,
            sels = self.$$selection,
            items = [],
            i, l, id;

        for (i = 0, l = sels.length; i < l; i++) {
            id = sels[i];
            items.push(store.getById(id) || self.$$_selectable_itemCache[id]);
        }
        
        return items;
    },

    toggleItemSelected: function(item) {
        var self = this;
        if (self.isSelected(item)) {
            self.unselectItem(item);
        }
        else {
            self.selectItem(item);
        }
    },

    selectItem: function(item) {
        var self = this;
        self.selectItemById(self.$$_selectable_getItemId(item));
    },

    selectItemById: function(id) {

        var self = this;

        if (self.$$selection.indexOf(id) === -1) {

            if (!self.isMultiSelection()) {
                self.$$selection = [];
                self.$$_selectable_itemCache = {};
            }

            var item = self.store.getById(id);

            if (item) {
                self.$$selection.push(id);
                self.$$_selectable_itemCache[id] = self.store.getById(id);
                self.trigger("selection-change");
                self.onSelectionChange();
            }
        }
    },

    unselectItem: function(item) {
        this.unselectItemById(this.$$_selectable_getItemId(item));
    },

    unselectItemById: function(id) {
        var self = this,
            inx = self.$$selection.indexOf(id);
        if (inx !== -1) {
            self.$$selection.splice(inx, 1);
            delete self.$$_selectable_itemCache[id];
            self.trigger("selection-change");
            self.onSelectionChange();
        }
    },

    toggleAllSelected: function() {
        var self = this;
        if (!self.isAllSelected()) {
            self.selectAll();
        }
        else {
            self.unselectAll();
        }
    },

    selectAll: function() {
        var self = this,
            changed = !self.isAllSelected();

        if (self.config.get("selectionMode") !== "single") {
            self.$$selection = [];
            self.$$_selectable_itemCache = {};
            self.store.each(function(item){
                var id = self.$$_selectable_getItemId(item);
                self.$$selection.push(id);
                self.$$_selectable_itemCache[id] = item;
            });
        }

        if (changed) {
            self.trigger("selection-change");
            self.onSelectionChange();
        }
    },

    unselectAll: function() {
        var self = this;
        if (self.$$selection.length > 0) {
            self.$$selection = [];
            self.$$_selectable_itemCache = {};
            self.trigger("selection-change");
            self.onSelectionChange();
        }
    },

    isIdSelected: function(id) {
        return this.$$selection.indexOf(id) !== -1;
    },

    isSelected: function(item) {
        return this.isIdSelected(this.$$_selectable_getItemId(item));
    },

    isMultiSelection: function() {
        return this.config.get("selectionMode") === "multi";
    },

    isAllSelected: function() {
        return this.$$selection.length > 0 &&
            this.$$selection.length === this.store.getLength();
    },

    hasSelection: function() {
        return this.$$selection.length > 0;
    },

    onSelectionChange: function() {

    }

};