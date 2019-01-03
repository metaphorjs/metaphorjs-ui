require("metaphorjs-ui/src/ui/Container.js");

var cls = require("metaphorjs-class/src/cls.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

var Test = {};

ns.register("Test", Test);


cls({
    $class: "Test.container.Cmp1",
    $extends: "MetaphorJs.app.Component",
    as: "child1",
    move: function() {
        var parent1 = this.scope.$app.getCmp("parent1"),
            parent2 = this.scope.$app.getCmp("parent2");

        if (parent1.hasItem(this)) {
            console.log("move to 2")
            parent2.addItem(this);
        }
        else {
            console.log("move to 1")
            parent1.addItem(this);
        }
    },
    template: {
        html: "<p>This is container child #1; " +
                "<a href=\"#\" (click)=\"this.child1.move()\">move</a></p>"
    }
});

cls({
    $class: "Test.container.Cmp2",
    $extends: "Test.container.Cmp1",
    as: "child2",
    template: {
        html: "<p>This is container child #2; "+
                "<a href=\"#\" (click)=\"this.child2.move()\">move</a></p>"
    }
});

cls({
    $class: "Test.container.Cmp3",
    $extends: "MetaphorJs.app.Component",
    as: "child3",
    supportsDirectives: {
        "bind-html": "bindhere"
    },
    template: {
        html: "<div>Before bind // <span ##bindhere></span> // After bind</div>"
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
            scope: scope,
            template: 'container1.html',
            items: [
                new Test.container.Cmp1({
                    scope: scope,
                    id: "child1"
                }),
                new Test.container.Cmp2({
                    scope: scope,
                    id: "child2"
                }),
                new Test.container.Cmp3({
                    scope: scope,
                    id: "child3",
                    directives: {
                        "bind-html": "this.bindText"
                    }
                }),
                div
            ]
        });

        parent1.render();

        var parent2 = new MetaphorJs.app.Container({
            id: "parent2",
            scope: scope
        });

        parent2.render(document.getElementById("container-app"));
    }
});
