
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("./Item.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

module.exports = MetaphorJs.ui.menu.Menu = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.menu.Menu",
    $alias: "MetaphorJs.directive.component.ui-menu",
    template: "ui/menu/menu.html",
    node: false,

    _initObjectItem: function(def) {
        if (def.__containerItemDef) {
            return def;
        }
        !def.scope && (def.scope = this.scope.$new());
        var itemCls = this.$self.classes.item;
        typeof itemCls === "string" && (itemCls = ns.get(itemCls));
        return itemCls.createFromPlainObject(def);
    },

    _initStringItem: function(def) {
        if (def === '-' || def === '|') {
            return {
                isDivider: true
            };
        }
        return this.$super(def);
    }
}, {

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    },

    allowUnwrapped: ["MetaphorJs.ui.menu.Item"],
    wrapper: "MetaphorJs.ui.menu.Item",

    classes: {
        item: "MetaphorJs.ui.menu.Item"
    }

});
