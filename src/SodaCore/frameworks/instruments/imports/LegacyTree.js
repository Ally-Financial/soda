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
 * @namespace Instruments/Tree
 */

var nodePath    = require("path");

var Tree = function () {
    var Tree, Elements = {};
    /**
     * @associates InstrumentsConfiguration
     * @type {Object}
     */
    var Config = require(nodePath.join(__dirname, 'Config'));

    /////////////////////////////////////////// PRIVATE HELPER FUNCTIONS ///////////////////////////////////////////

    var typeCount = {}; // Used by the following function to keep count of each type of UIAElement

    /**
     * Returns the type of an element
     * @memberof Instruments/LegacyTree
     * @returns {*}
     */
    function getType(o) {
        return o.type;
    }

    /**
     * Recursively walks the screen DOM and generates a DOM Tree
     * @memberof Instruments/LegacyTree
     * @param {Array} elementArray The root to begin the walk from (defaults to: Simulator.app.elements())
     * @param {object=} tree For recursion only
     * @param {object=} parent The parent of the current tree element
     * @returns {*}
     * @private
     */
    function _walkElementTree(elementArray, tree, parent) {
        tree = tree || {};
        var e, i;

        for (i = 0; i < elementArray.length; i++) {

            e = elementArray[i];
            var type = getType(e),
                id;

            if(!typeCount[type]) typeCount[type] = 0;
            id = type.toLowerCase() + ":" + typeCount[type]++;

            var frame = e.frame.replace(/\{+/g, '').replace(/\}+/g, '').split(', ');

            var n = e.name,
                l = e.label,
                v = e.value,
                rect = {},
                hitpoint = {};

                if (e.rect) {
                  rect     = {
                    origin: {
                        x : frame[0],
                        y : frame[1]
                    },
                    size: {
                        width: frame[2],
                        height: frame[3]
                    }
                  };
                  hitpoint = {
                      x: (rect.origin.x + (rect.size.width  / 2)),
                      y: (rect.origin.y + (rect.size.height / 2))
                  };
                }




            tree[id] = {
                id               : id,
                element          : e,
                uuid             : e.uuid,
                type             : getType(e).toLowerCase(),
                name             : (typeof n === "string") ? n.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : n,
                label            : (typeof l === "string") ? l.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : l,
                value            : (typeof v === "string") ? v.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : v,
                rect             : {
                    origin: {
                        x : rect && typeof rect === "object" && rect.origin && typeof rect.origin === "object" && (rect.origin.x || rect.origin.x === 0) ? rect.origin.x : null,
                        y : rect && typeof rect === "object" && rect.origin && typeof rect.origin === "object" && (rect.origin.y || rect.origin.y === 0) ? rect.origin.y : null,
                    },
                    size: {
                        width  : rect && typeof rect === "object" && rect.size && typeof rect.size === "object"  && (rect.size.width  || rect.size.width === 0)  ? rect.size.width  : null,
                        height : rect && typeof rect === "object" && rect.size && typeof rect.size === "object"  && (rect.size.height || rect.size.height === 0) ? rect.size.height : null,
                    }
                },
                hitpoint         : {
                    x : hitpoint && typeof hitpoint === "object" && (hitpoint.x || hitpoint.x === 0) ? +parseFloat(hitpoint.x).toFixed(2) : null,
                    y : hitpoint && typeof hitpoint === "object" && (hitpoint.y || hitpoint.y === 0) ? +parseFloat(hitpoint.y).toFixed(2) : null,
                },
                enabled          : e.isEnabled === '1' ? true : false,         // Coerce to bool
                visible          : e.isVisible === '1' ? true : false,         // Coerce to bool
                hasKeyboardFocus : false,  // Coerce to bool
                valid            : true,           // Coerce to bool
                children         : {},
                index            : i,
                parent           : {
                    id    : parent.id,
                    name  : parent.name,
                    value : parent.value,
                    label : parent.label
                }
            };
            Elements[id] = tree[id];
        }

        for (i in tree) { // Breadth-first search, so now walk child elements
            if (tree.hasOwnProperty(i)) {
                e = tree[i];
                var children = e.element.children;
                if (children instanceof Array && children.length > 0) {
                    _walkElementTree(e.element.children, tree[i].children, e);
                }

            }
        }
        return tree;
    }

    /**
     * Calls the walk element tree method to generate a DOM
     * @memberof Instruments/LegacyTree
     * @param {object=} srcTree The root tree
     */
    function _walkElementTreeWrapper (srcTree) {
        var tree;
        Elements  = {};
        typeCount = {};

        var elements = srcTree.children;

        tree = _walkElementTree(elements, {}, srcTree);
        return tree;
    }


      /**
       * Returns a representation of the DOM as a javascript object.
       *
       *   For each element in the tree the following keys exist:
       *      element          : The element object,
       *      name             : The element name,
       *      label            : The element label,
       *      value            : The element value,
       *      enabled          : true if the element is enabled, false otherwise
       *      valid            : true if the element is enabled, false otherwise
       *      visible          : true if the element is visible, false otherwise
       *      hasKeyboardFocus : true if the element has the keyboard's focus, 0 otherwise
       *      index            ; The nth position the the child in its parent container
       *      children         : The element's children
       *      parent           : An object containing the parent element's id, name, value, and label
       *      toString()       : A function that returns a string representation of the element
       *
       * @memberof Instruments/LegacyTree
       * @param {number=} delay Amount of time to delay before walking the element tree
       * @param {number=} postdelay Amount of time to delay after walking the element tree
       * @returns {*}
       */
      this.getElementTree = function (srcTree) {
          return _walkElementTreeWrapper(srcTree);
      };

      /**
       * Returns the Elements object
       * @memberof Instruments/LegacyTree
       * @returns {*}
       */
      this.getElements = function () {
          return Elements;
      };
};

module.exports = Tree;
