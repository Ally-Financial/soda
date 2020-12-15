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
 * A library of functions for traversing the UIA-DOM, and some other utility functions
 * @namespace Perfecto/iOSTree
 */

var Tree = function (soda) {
    /**
     * @composes PerfectoDriver
     * @type Perfecto
     */

    /////////////////////////////////////////// PRIVATE HELPER FUNCTIONS ///////////////////////////////////////////

    var ids  = {};

    /**
     * Convert each item in an object to a number
     * @param {*} o Conforms to Object.prototype.sodaeach
     * @param {string} k Conforms to Object.prototype.sodaeach
     * @param {number} i Conforms to Object.prototype.sodaeach
     * @param {object|Array} p Conforms to Object.prototype.sodaeach
     */
    function makeNumber(o, k, i, p) {
        p[k] = parseFloat(o.trim());
    }

    /**
     * Builds the element tree from the JSON converted XML
     * @param {Array} node The current node in the tree
     * @param {Object=} tree The tree (or subtree)
     * @param {Object=} parent The parent (one level up) in the tree of the current node
     * @returns {Object}
     */
    function _walkElementTree (node, tree, parent) {

        tree = tree || {};

        for (var t in node) {
            if (node.hasOwnProperty(t)) {
                var obj = { name: t, value: node[t] };

                var e = {
                    id               : null,
                    type             : null,
                    name             : null,
                    label            : null,
                    value            : null,
                    rect             : {
                        origin : {
                            x : null,
                            y : null
                        },
                        size   : {
                            width  : null,
                            height : null
                        }
                    },
                    hitpoint         : null,
                    enabled          : null,
                    visible          : null,
                    hasKeyboardFocus : null,
                    valid            : true,
                    children         : {},
                    index            : null,
                    parent           : null
                };

                e.type = obj.name;

                if(!ids[e.type]) ids[e.type] = 0;

                e.id    = e.type + ":" + ids[e.type]++;
                e.name  = obj.name;
                e.value = obj.value;

                e.enabled          = true;
                e.visible          = true;
                e.hasKeyboardFocus = true;
                e.valid            = true;
                e.index            = 0;

                e.parent = {
                    id      : parent ? parent.id    : null,
                    name    : parent ? parent.name  : null,
                    label   : parent ? parent.label : null,
                    value   : parent ? parent.value : null
                };

                tree[e.id] = e;
                if(obj.node) buildTree(obj.node, e.children, e);
            }
        }

        return tree;
    }

    /**
     * Builds the element tree from the JSON converted XML
     * @param {Array} node The current node in the tree
     * @param {Object=} tree The tree (or subtree)
     * @param {Object=} parent The parent (one level up) in the tree of the current node
     * @returns {Object}
     */
    this.buildTree = function(elementArray, tree, platform) {
        this.platform = platform;

        return _walkElementTree(elementArray, tree, {});
    };
};

module.exports = Tree;
