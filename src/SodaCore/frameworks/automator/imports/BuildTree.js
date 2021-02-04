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
 * @module Automator/BuildTree
 */

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
function buildTree (node, tree, parent) {

    tree = tree || {};

    for(var i = 0; i < node.sodamembers; i++) {

        var obj = node[i];

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

        e.type = obj.$.class ? obj.$.class.split(".") : obj.$.package.split(".");
        e.type = (e.type[e.type.length - 1]).toLowerCase();

        if(!ids[e.type]) ids[e.type] = 0;

        e.id    = e.type + ":" + ids[e.type]++;
        e.name  = obj.$['resource-id'].substring(obj.$['resource-id'].indexOf("/") + 1, obj.$['resource-id'].length);
        e.label = obj.$['content-desc'];
        e.value = obj.$.text;

        var bounds = obj.$.bounds.split(']['),
            origin = bounds[0].replace('[', '').split(','),
            size   = bounds[1].replace(']', '').split(',');

        origin.sodaeach(makeNumber);
        size.sodaeach(makeNumber);

        e.rect.origin.x    = origin[0];
        e.rect.origin.y    = origin[1];
        e.rect.size.width  = size[0] - origin[0];
        e.rect.size.height = size[1] - origin[1];

        e.hitpoint = {
            x: (e.rect.origin.x + (e.rect.size.width  / 2)),
            y: (e.rect.origin.y + (e.rect.size.height / 2))
        };

        e.enabled          = (obj.$.enabled === "true");
        e.visible          = e.rect.size.height > 0 && e.rect.size.width > 0;
        e.hasKeyboardFocus = (obj.$.selected === "true");
        e.valid            = true;
        e.index            = obj.$.index;

        e.parent = {
            id      : parent ? parent.id    : null,
            name    : parent ? parent.name  : null,
            label   : parent ? parent.label : null,
            value   : parent ? parent.value : null
        };

        tree[e.id] = e;
        if(obj.node) buildTree(obj.node, e.children, e);
    }

    return tree;
}

module.exports = function (JSONDump) {
    ids = {};
    return buildTree(JSONDump.hierarchy.node || {});
};
