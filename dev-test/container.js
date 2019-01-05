require("metaphorjs/src/app/Container.js");

var cls = require("metaphorjs-class/src/cls.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

var Test = {};

ns.register("Test", Test);


cls({
    $class: "Test.container.Cmp1",
    $extends: "MetaphorJs.app.Component",
    move: function() {
        var parent1 = this.scope.$app.getCmp("parent1"),
            parent2 = this.scope.$app.getCmp("parent2");

        if (parent1.hasItem(this)) {
            parent2.addItem(this);
        }
        else {
            parent1.addItem(this);
        }
    },
    template: {
        html: "<p>This is container child #1; " +
                "<a href=\"#\" (click)=\"this.ctrl.move()\">move</a></p>"
    }
});

cls({
    $class: "Test.container.Cmp2",
    $extends: "Test.container.Cmp1",
    template: {
        html: "<p>This is container child #2; "+
                "<a href=\"#\" (click)=\"this.ctrl.move()\">move</a></p>"
    }
});

cls({
    $class: "Test.container.Cmp3",
    $extends: "MetaphorJs.app.Component",
    supportsDirectives: {
        "bind-html": "bindhere"
    },
    template: {
        html: "<div>Before bind // <span ##bindhere></span> // After bind</div>"
    }
});

cls({
    $class: "Test.container.Parent3",
    $extends: "MetaphorJs.app.Container",
    $alias: "MetaphorJs.directive.component.parent3",
    id: "parent3",
    template: 'container2.html'
});

cls({
    $class: "Test.container.Cmp4",
    $extends: "MetaphorJs.app.Component",
    $alias: "MetaphorJs.directive.component.cmp4",
    template: {
        html: "<div>This is cmp4</div>"
    }
});


cls({
    $class: "Test.ContainerApp",
    $extends: "MetaphorJs.app.App",

    initApp: function(node, scope) {

        window.mainApp = this;

        scope.bindText = "AAA";

        var div = document.createElement("div");
        div.innerHTML = 'Dynamicly created node';

        var parent1 = new MetaphorJs.app.Container({
            id: "parent1",
            renderTo: document.getElementById("container-app"),
            template: 'container1.html',
            items: [
                new Test.container.Cmp1({
                    id: "child1"
                }),
                new Test.container.Cmp2({
                    id: "child2"
                }),
                new Test.container.Cmp3({
                    id: "child3",
                    directives: {
                        scope: scope,
                        "bind-html": "this.bindText"
                    }
                }),
                div
            ]
        });

        parent1.render();

        var parent2 = new MetaphorJs.app.Container({
            id: "parent2"
        });

        parent2.render(document.getElementById("container-app"));
    }
});

