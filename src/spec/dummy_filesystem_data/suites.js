module.exports = function () {
    "use strict";

    var suites = [
        {
            name        : "global",
            description : "The Global Suite",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".global_suite_iphone",
                    ipad       : ".global_suite_ipad",
                    androidtab : ".global_suite_androidtab",
                    android    : ".global_suite_android"
                }
            }
        },
        {
            name        : "suiteA",
            description : "Test Suite A",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".test_suite_a_iphone",
                    ipad       : ".test_suite_a_ipad",
                    androidtab : ".test_suite_a_androidtab",
                    android    : ".test_suite_a_android"
                }
            }
        },
        {
            name        : "suiteB",
            description : "Test Suite B",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".test_suite_b_iphone",
                    ipad       : ".test_suite_b_ipad",
                    androidtab : ".test_suite_b_androidtab",
                    android    : ".test_suite_b_android"
                }
            }
        },
        {
            name        : "suiteC",
            description : "Test Suite C",
            map         : {
                SUPER_SELECTOR: {
                    iphone     : ".test_suite_c_iphone",
                    ipad       : ".test_suite_c_ipad",
                    androidtab : ".test_suite_c_androidtab",
                    android    : ".test_suite_c_android"
                }
            }
        }
    ];

    return suites;
};
