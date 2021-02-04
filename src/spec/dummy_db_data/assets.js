module.exports = function (sodaDbRef) {
    "use strict";
    var assets = [
        {
            name: "001",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "iphone",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "android",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleA",
            description: "A description",
            platform: "androidtab",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "iphone",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "android",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteA",
            module: "moduleB",
            description: "A description",
            platform: "androidtab",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "iphone",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "android",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleA",
            description: "A description",
            platform: "androidtab",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "iphone",
            type: "test"
        },
        {
            name: "001",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "android",
            type: "test"
        },
        {
            name: "002",
            suite: "suiteB",
            module: "moduleB",
            description: "A description",
            platform: "androidtab",
            type: "test"
        },
        {
            name: "003",
            suite: "suiteB",
            module: "common",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "003",
            suite: "suiteA",
            module: "common",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "004",
            suite: "suiteB",
            module: "common",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "004",
            suite: "suiteA",
            module: "common",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "099",
            suite: "global",
            module: "global",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "098",
            suite: "global",
            module: "global",
            description: "A description",
            platform: "generic",
            type: "test"
        },
        {
            name: "097",
            suite: "global",
            module: "global",
            description: "A description",
            platform: "ipad",
            type: "test"
        },
        {
            name: "097",
            suite: "global",
            module: "global",
            description: "A description",
            platform: "generic",
            type: "test"
        }
    ];

    sodaDbRef.on("list assets", function (send) {
        send(null, assets);
    });

    return assets;
};
