
require("../../__init.js");
require("metaphorjs/src/lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

module.exports = MetaphorJs.ui.mixin.WithDropdown = {

    $beforeInit: function() {
        this.$$dropdowns = [];
    },

    $beforeDestroy: function() {
        this.$$dropdowns = null;
    },

    $initChildItem: function(item) {
        this._checkDropdownItem(item);
    },

    hasDropdown: function() {
        return this.$$dropdowns.length > 0;
    },

    _checkDropdownItem: function(item) {
        var clss = this.$self.dropdownClasses,
            i, l;
        if (clss && item.type === "component" && item.resolved) {
            for (i = 0, l = clss.length; i < l; i++) {
                if (item.component.$is(clss[i])) {
                    this._initDropdownItem(item);
                    return;
                }
            }
        }
    },

    _initDropdownItem: function(item) {
        var self = this,
            dd = extend({}, self.$self.defaultDropdown);
        dd.cmp = {value: item.component};
        self.$$dropdowns.push(item.component);
        self.applyDirective("dropdown", dd);
        self._onDropdownCreated(item.component);
    },

    _onDropdownCreated: function() {}
}