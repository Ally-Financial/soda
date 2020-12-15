/*
 * Copyright 2020 Ally Financial, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

 /**
 * Templates for generating JSON files and objects to run as actions/tests for the SodaVisualEditor
 * @type {Object}
 */
window.SodaTemplates = {
    action: {
        meta: {
            name: "@todo:name",
            id: "@todo:id",
            description: "@todo:description",
            syntax: {
                name: "web",
                version: "1.0"
            }
        },
        actions: []
    },
    test: {
        meta: {
            name: "@todo:name",
            id: "@todo:id",
            description: "@todo:description",
            syntax: {
                name: "web",
                version: "1.0"
            }
        },
        actions: []
    },
    screen: {
        meta: {
            name: "@todo:name",
            id: "@todo:id",
            description: "@todo:description",
            syntax: {
                name: "web",
                version: "1.0"
            }
        },
        screen: {
            components: []
        }
    },
    menu: {
        meta: {
            name: "@todo:name",
            id: "@todo:id",
            description: "@todo:description",
            syntax: {
                name: "web",
                version: "1.0"
            }
        },
        menu: {
            components: []
        }
    },
    popup: {
        meta: {
            name: "@todo:name",
            id: "@todo:id",
            description: "@todo:description",
            syntax: {
                name: "web",
                version: "1.0"
            }
        },
        popup: {
            components: []
        }
    }
};
