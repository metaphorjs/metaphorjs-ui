
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("./Item.js");
require("./Divider.js");
require("./Container.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Menu = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu",
    template: "ui/menu/menu.html",
    node: false,

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true
    },

    _initObjectItem: function(def) {
        if (def.__containerItemDef) {
            return def;
        }
        !def.scope && (def.scope = this.scope.$new());
        return new MetaphorJs.ui.menu.Item.createFromPlainObject(def);
    },

    _initStringItem: function(def) {
        if (def === '-' || def === '|') {
            return MetaphorJs.ui.menu.Divider;
        }
        return this.$super(def);
    },

    _wrapChildItem: function(item) {
        var self = this;
        
        if (item.type === "component" && 
            !(item.component instanceof MetaphorJs.ui.menu.Item) && 
            !(item.component instanceof MetaphorJs.ui.menu.Divider) && 
            !(item.component instanceof MetaphorJs.ui.menu.Container)) {

            var newItem = self._createDefaultItemDef();
            newItem.component = new MetaphorJs.ui.menu.Container({
                scope: self.scope,
                items: [
                    item.component
                ]
            });
            return newItem;
        }
        return item;
    }

}, {

    initItemWithMenu: function(host, menu) {
        var item = host._createDefaultItemDef();

        if (!(menu instanceof MetaphorJs.ui.menu.Menu)) {
            menu = MetaphorJs.ui.menu.Menu.createFromPlainObject(menu);
        }

        item.component = menu;
        item.resolved = !isThenable(menu);
        !host.items && (host.items = []);
        if (isArray(host.items)) {
            host.items.push(item);
        }
        else {
            host.items.body.push(item);
        }
    },

    createFromPlainObject: function(obj) {
        return new MetaphorJs.ui.menu.Menu(obj);
    }

});
