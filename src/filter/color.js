

require("metaphorjs-shared/src/lib/Color.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter get
 * @param {object} input
 * @param {string} format
 * @returns {*}
 */
MetaphorJs.filter.color = function(val, scope, prop) {
    var c = new MetaphorJs.lib.Color(val);
    return c.getAs(prop);
}