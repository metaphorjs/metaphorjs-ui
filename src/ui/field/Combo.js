

var defineClass = require("metaphorjs-class/src/func/defineClass.js");


require("./Select.js");

module.exports = (function(){

    return defineClass({
        $class: "ui.field.Combo",
        $extends: "ui.field.Select",

        editable: false,
        forceSelection: true
    });

}());