
require("../../__init.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/lib/Config.js");
require("../mixin/WithActiveState.js");
require("../mixin/WithText.js");
require("../mixin/WithDropdown.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.ui.button.Button = MetaphorJs.app.Container.$extend({
    $mixins: [MetaphorJs.ui.mixin.WithActiveState, 
                MetaphorJs.ui.mixin.WithText,
                MetaphorJs.ui.mixin.WithDropdown],
    $class: "MetaphorJs.ui.button.Button",
    $alias: "MetaphorJs.directive.component.ui-button",
    template: "ui/button/button.html",
    as: "button",
    node: false,

    onClick: function(e) {
        this.trigger("click", this, e);
    }
}, {

    defaultDropdown: {
        on: "click"
    },

    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        click: "button", 
        dblclick: "button", 
        mousedown: "button", 
        mouseup: "button",
        mousemove: "button",
        dropdown: true
    },

    propsToItems: {
        "menu": "MetaphorJs.ui.menu.Menu"
    },

    dropdownClasses: ["MetaphorJs.ui.menu.Menu"],
    configProps: ["text", "active"]
});