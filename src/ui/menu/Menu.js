
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("./Item.js");
require("./Divider.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.menu.Menu = MetaphorJs.app.Container.$extend({
    $alias: "MetaphorJs.directive.component.ui-menu",
    template: "ui/menu/menu.html",

    _initObjectItem: function(def) {
        if (def.__containerItemDef) {
            return def;
        }
        var cfg = {
            scope: this.scope.$new(),
            config: new MetaphorJs.lib.Config(def, {
                scope: this.scope
            })
        }
        return new MetaphorJs.ui.menu.Menu(cfg);
    },

    _initTextItem: function(def) {
        if (def === '-' || def === '|') {
            return "MetaphorJs.ui.menu.Divider";
        }
        return this.$super(def);
    }

});
