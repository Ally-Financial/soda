module.exports = function (sodaDbRef) {
    "use strict";

    var modules = [
        {
            name        : "common",
            suite       : "suiteA",
            description : "Common for suiteA",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_a_common_iphone",
                    ipad       : ".suite_a_common_ipad",
                    androidtab : ".suite_a_common_androidtab",
                    android    : ".suite_a_common_android"
                }
            }
        },
        {
            name        : "common",
            suite       : "suiteB",
            description : "Common for suiteB",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_b_common_iphone",
                    ipad       : ".suite_b_common_ipad",
                    androidtab : ".suite_b_common_androidtab",
                    android    : ".suite_b_common_android"
                }
            }
        },
        {
            name        : "common",
            suite       : "suiteC",
            description : "Common for suiteC",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_c_common_iphone",
                    ipad       : ".suite_c_common_ipad",
                    androidtab : ".suite_c_common_androidtab",
                    android    : ".suite_c_common_android"
                }
            }
        },
        {
            name        : "moduleA",
            suite       : "suiteA",
            description : "moduleA for suiteA",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_a_module_a_common_iphone",
                    ipad       : ".suite_a_module_a_common_ipad",
                    androidtab : ".suite_a_module_a_common_androidtab",
                    android    : ".suite_a_module_a_common_android"
                }
            }
        },
        {
            name        : "moduleB",
            suite       : "suiteA",
            description : "moduleB for suiteA",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_a_module_b_common_iphone",
                    ipad       : ".suite_a_module_b_common_ipad",
                    androidtab : ".suite_a_module_b_common_androidtab",
                    android    : ".suite_a_module_b_common_android"
                }
            }
        },
        {
            name        : "moduleA",
            suite       : "suiteB",
            description : "moduleA for suiteB",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_b_module_a_common_iphone",
                    ipad       : ".suite_b_module_a_common_ipad",
                    androidtab : ".suite_b_module_a_common_androidtab",
                    android    : ".suite_b_module_a_common_android"
                }
            }
        },
        {
            name        : "moduleB",
            suite       : "suiteB",
            description : "moduleB for suiteB",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".suite_b_module_b_common_iphone",
                    ipad       : ".suite_b_module_b_common_ipad",
                    androidtab : ".suite_b_module_b_common_androidtab",
                    android    : ".suite_b_module_b_common_android"
                }
            }
        }
    ];

    sodaDbRef.on("list modules", function (send) {
        send(null, modules);
    });
};
