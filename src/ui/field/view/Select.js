
require("../../../__init.js");
require("metaphorjs/src/app/component/View.js");
require("metaphorjs/src/lib/EventBuffer.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.field.view.Select = MetaphorJs.app.component.View.$extend({

    $beforeHostInit: function() {
        var self = this;

        self.component.$intercept("afterRender", self.afterRender, self, "after");
        self.component.$intercept(
            "onSearchQueryChange",
            self.onSearchQueryChange, 
            self, 
            "after"
        );
    },

    $afterHostInit: function() {
        var self = this,
            cmp = self.component,
            config = cmp.config;

        config.setType("useHiddenSelect", "bool", null, false);
        config.setType("hiddenSelectBreakpoint", "int");

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
    },

    afterRender: function() {
        var self = this,
            cmp = self.component;
        if (cmp.isMultiSelection() && cmp.config.get("searchable")) {
            async(self.initSizer, self);
        }
        if (self.resizeBuffer) {
            async(self.onWindowBreak, self);
        }
    },

    onSearchQueryChange: function() {
        var self = this,
            cmp = self.component;
        if (cmp.isMultiSelection()) {
            async(self.setInputWidth, self);
        }
    },

    onWindowBreak: function() {
        var cmp = this.component;
        cmp.config.set("useHiddenSelect", 
            MetaphorJs.dom.getWidth(window) < 
                cmp.config.get("hiddenSelectBreakpoint")
        );
        cmp.state.$check();
    },

    initSizer: function() {
        if (this.component.getRefEl("sizer")) {
            var style = this.component.getRefEl("sizer").style;
            style.left = '-10000px';
            style.maxWidth = '1000px';
            style.display = 'inline-block';
            style.position = 'absolute';
        }
    },

    setInputWidth: function() {
        var cmp = this.component;
        cmp.getRefEl("search").style.width =
            (MetaphorJs.dom.getWidth(cmp.getRefEl("sizer")) + 10) + "px";
    },

    setSearchFocus: function() {
        this.component.getRefEl("search").focus();
    },

    onSelfClick: function(e) {
        var self = this,
            cmp = self.component;

        if (cmp.config.get("useHiddenSelect")) {
            e.stopPropagation();
            return;
        }

        if (cmp.state.focused &&
            cmp.dialog.isVisible()) {
            e.stopPropagation();
            return;
        }

        if (cmp.config.get("searchable") && !cmp.state.focused) {
            async(self.setSearchFocus, self);
            e.stopPropagation();
        }

        if (!cmp.config.get("searchable") &&
            !cmp.dialog.isVisible()) {
            cmp.dialog.show();
            e.stopPropagation();
        }
    },

    onDropdownIconClick: function(e) {
        e.stopPropagation();
        this.component.dialog.toggle(e, true);
    },

    onItemClick: function(item, e) {
        var self = this,
            cmp = self.component,
            cfg = cmp.config;

        if (cfg.get("readonly")) {
            e.stopPropagation();
            cmp.dialog.hide();
            return;
        }

        if (item) {
            //this.selectItem(item);
            cmp.setValue(
                item[cfg.get("valueField")], 
                item[cfg.get("displayField")]
            );
        }
        else {
            cmp.unselectAll();
        }

        //if (!cfg.get("keepSelectedOptions")) {
        //    self.store.update();
        //}

        e.stopPropagation();

        cmp.state.$set("searchQuery", "");

        if (!cmp.isMultiSelection()) {
            cmp.dialog.hide();
        }
        else {
            async(self.setSearchFocus, self);
        }
    },

    onValueTextClick: function(e) {

    },

    onItemDeleteClick: function(item, e) {
        var self = this,
            cmp = self.component;
        if (!cmp.isSelectionEnabled()) {
            return;
        }
        cmp.unselectItem(item);
        if (!cmp.config.get("keepSelectedOptions")) {
            cmp.store.update();
        }
        e.stopPropagation();
    },

    /*onNotFoundClick: function(item, e) {
        e.stopPropagation();
    },

    onPaginationClick: function(e) {
        e.stopPropagation();
    },*/

    onSearchFocus: function(e) {
        var cmp = this.component;
        cmp.state.$set("focused", true);
        if (!cmp.dialog.isVisible()) {
            cmp.dialog.show();
            e.stopPropagation();
        }
    },

    onSearchBlur: function(e) {
        var cmp = this.component;
        cmp.state.$set("focused", false);
        if (!cmp.dialog.isVisible()) {
            cmp.dialog.show();
            e.stopPropagation();
        }
    },

    onSearchBackspace: function() {
        var cmp = this.component;
        if (!cmp.state.searchQuery) {
            if (!cmp._prevQuery) {
                if (cmp.hasSelection()) {
                    cmp.unselectItemById(
                        cmp.$$selection[cmp.$$selection.length - 1]
                    );
                    cmp.store.update();
                }
            }
            else {
                cmp._prevQuery = "";
            }
        }
    },

    onHiddenSelectClick: function(e) {
        e.stopPropagation();
    },

    onHiddenSelectChange: function(e) {
        var self = this,
            cmp = self.component,
            val = cmp.getRefEl("hiddenselect").value;

        if (val) {
            var item = cmp.store.find(cmp.config.get("valueField"), val);
            if (item) {
                cmp.selectItem(item);
            }
        }
        else {
            cmp.unselectAll();
        }
    }
});