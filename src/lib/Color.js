
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js");

module.exports = MetaphorJs.lib.Color = function(color) {

    if (color) {
        this.setColor(color);
    }

}; 

extend(MetaphorJs.lib.Color.prototype, {

    _rgba: null,

    setColor: function(color) {
        if (!color) {
            return;
        }

        var t = typeof color;

        if (t === 'string') {
            if (color.substring(0,1) === "#") {
                color = color.substring(1);
            }
            color = color.toLowerCase();
            if (color.length === 3) {
                this.setHEX(this._hex2full(color));
            }
            else if (color.length === 6) {
                this.setHEX(color);
            }
            else if (color.indexOf("rgba") !== -1) {
                this.setRGBA(this._rgbaFromStr(color));
            }
        }
        else if (color instanceof MetaphorJs.lib.Color) {
            this.setRGBA(color.getRGBA());
        }
        else if (isArray(color)) {
            this.setRGBA(color);
        }
    },

    setHEX: function(hex) {
        this._rgba = this._hex2rgba(hex);
    },

    setHSLA: function(hsla) {

    },

    setRGBA: function(rgba) {
        if (rgba) {
            this._rgba = rgba.map(function(x) {return parseInt(x)});
            if (this._rgba.length === 3) {
                this._rgba.length.push(1);
            }
        }
    },

    getAs: function(format) {
        switch (format) {
            case "hex":
                return this.getHEX();
            case "rgba":
                return this.getRGBA();
            case "hsla":
                return this.getHSLA();
            case "rgbastr":
                return this.getRGBAString();
            case "hslastr":
                return this.getHSLAString();
            default:
                return this.getHEX();
        }
    },

    getHEX: function() {
        return this._rgba2hex(this._rgba);
    },

    getHSLA: function() {
        return this._rgba2hsla(this._rgba);
    },
    getHSLAString: function() {
        return this._hsla2str(this.getHSLA());
    },

    getRGBA: function() {
        return this._rgba;
    },
    getRGBAString: function() {
        return this._rgba2str(this.getRGBA());
    },


    _hex2full: function(short) {
        var r = short.substring(0,1).toLowerCase(),
            g = short.substring(1,2).toLowerCase(),
            b = short.substring(2,3).toLowerCase();
        return r+r+g+g+b+b;
    },

    _rgbaFromStr: function(str) {
        var match = str.match(/[\d, ]+/);
        if (match) {
            var rgba = match[0].split(",");
            return rgba.map(function(x) {return parseInt(x)});
        }
    },
    _rgba2str: function(rgba) {
        return "rgba(" + rgba.join(',') + ")";
    },

    _rgba2hex: function(rgba) {
        var r = rgba[0].toString(16),
            g = rgba[1].toString(16),
            b = rgba[2].toString(16);

        r.length === 1 && (r = "0"+r);
        g.length === 1 && (g = "0"+g);
        b.length === 1 && (b = "0"+b);
        
        return r + g + b;
    },
    _hex2rgba: function(hex) {
        return [
            parseInt(hex.substring(0,2), 16),
            parseInt(hex.substring(2,4), 16),
            parseInt(hex.substring(4,6), 16),
            1
        ];
    },

    _rgba2hsla: function() {},
    _hsla2rgba: function() {},
    _hsla2str: function() {},

    toString: function(format) {
        return format ? this.getAs(format) : this.getHEX();
    }
});