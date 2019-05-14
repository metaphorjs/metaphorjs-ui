require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/app/Container.js");
require("metaphorjs/src/func/dom/getOffset.js");
require("metaphorjs/src/func/dom/getScrollParent.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


module.exports = MetaphorJs.ui.util.Pagination = MetaphorJs.app.Container.$extend({
    $class: "MetaphorJs.ui.util.Pagination",
    $alias: "MetaphorJs.directive.component.ui-pagination",
    template: "ui/util/pagination.html",

    _apis: ["dom", "input"],

    initComponent: function() {

        var scope = this.scope;

        scope.start = 0;
        scope.limit = 0;
        scope.total = 0;
        scope.pages = 0;
        scope.page = 0;
        scope.hasPrev = 0;
        scope.hasNext = 0;
        scope.loading = false;
        scope.changePage = 0;
        scope.hidden = true;

        var store = this.config.get("store") || (
                        this.parentCmp ? this.parentCmp.store : null
                    );

        store && this.setStore(store);
    },

    initConfig: function() {
        var config = this.config,
            mst = MetaphorJs.lib.Config.MODE_STATIC;
        config.setType("as", null, null, "pgn");
        config.setType("simple", "bool", mst, false);
        config.setType("autoscroll", "bool", mst, false);
        config.setType("store", null, MetaphorJs.lib.Config.MODE_DYNAMIC);
        config.on("simple", this.updatePages, this, {async: true});
    },

    setStore: function(s) {
        this.store && this._bindStore(this.store, "un");
        this.store = s;
        s && this._bindStore(s, "on");
        s && this.updatePages();
    },

    _bindStore: function(s, fn) {
        s[fn]("loading-start", this.onStoreStartLoading, this);
        s[fn]("load", this.onStoreLoad, this);
        s[fn]("update", this.onStoreLoad, this);
    },

    $onPropertyChange: function(val, prev, name) {
        if (name === "simple" && (val === false || val === true)) {
            async(this.updatePages, this);
        }
    },

    onStoreStartLoading: function() {
        this.scope.$set({
            loading: true
        });
    },

    onStoreLoad: function() {
        this.updatePages();
    },

    updatePages: function() {
        var store = this.store,
            total,
            count,
            start = store.start,
            pageSize = store.pageSize,
            pages,
            page;

        if (!this.config.get("simple")) {

            total = store.getTotalLength();

            if (!pageSize) {
                pageSize = total;
            }

            pages = Math.ceil(total / pageSize);
            page = Math.floor(start / pageSize) + 1;

            this.scope.$set({
                start: start,
                end: Math.min(start + pageSize, total),
                limit: pageSize,
                total: total,
                pages: pages,
                changePage: page,
                page: page,
                hasPrev: page > 1,
                hasNext: page < pages,
                loading: false,
                hidden: pages < 2
            });
        }
        else {
            count = store.getLength();

            this.scope.$set({
                loading: false,
                start: start,
                end: start + count,
                limit: pageSize,
                hasNext: count >= pageSize,
                hasPrev: start > 0,
                hidden: start === 0 && count < pageSize
            });
        }
    },

    onPrevClick: function() {
        this.store.loadPrevPage();
        this.scrollToParent();
    },

    onNextClick: function() {
        this.store.loadNextPage();
        this.scrollToParent();
    },

    hasPages: function() {
        return !this.config.get("simple") ?
            this.scope.pages > 1 :
            true;
    },

    onPageKeyDown: function() {

        var page = this.scope.changePage;
        if (isNaN(page)) {
            page = 1;
        }
        if (page < 1) {
            page = 1;
        }
        if (page > this.scope.pages) {
            page = this.scope.pages;
        }
        this.scope.$set({
            page: page
        });

        this.store.loadPage((this.scope.page - 1) * this.scope.limit);
        this.scrollToParent();
    },

    scrollToParent: function() {
        if (this.config.get("autoscroll") === false) {
            return;
        }
        var sp = MetaphorJs.dom.getScrollParent(this.$refs.node.main.parentNode);
        if (sp) {
            if (sp === document.body) {
                if (this.parentCmp) {
                    var ofs = MetaphorJs.dom.getOffset(this.parentCmp.getRefEl("main"));
                    sp.scrollTop = ofs.top;
                    document.documentElement.scrollTop = ofs.top;
                }
            }
            else {
                sp.scrollTop = 0;
            }
        }
    },

    onDestroy: function() {
        this.setStore(null);
    }
}, {
    resolve: {
        parentCmp: '$parentCmp'
    },
    supportsDirectives: {
        show: true,
        hide: true,
        class: true,
        style: true,
        "in-focus": "input"
    }
});