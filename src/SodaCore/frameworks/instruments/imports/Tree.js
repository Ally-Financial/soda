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

var nodePath    = require("path");

var Tree = function () {
    /**
     * @composes PerfectoDriver
     * @type Perfecto
     */
    var Config = require(nodePath.join(__dirname, 'Config'));
    var Elements = {};
    var screenHeight, screenWidth;

    /////////////////////////////////////////// PRIVATE HELPER FUNCTIONS ///////////////////////////////////////////

    var typeCount = {}; // Used by the following function to keep count of each type of UIAElement

    function areAllKeysTheSame(array) {
        return Object.keys(array).reduce(function(a, b){ return (parseInt(a)+1 === parseInt(b)) ? b : false; }) !== false;
    }

    /**
     * Creates an element that conforms to the sODA tree representation
     * @memberof Instruments/Tree
     * @param {string} id The id of the element
     * @param {string} type The type of the element
     * @param {string} indx The index of the element
     * @param {object} e The element
     * @param {object} tree The full tree that has been built thus far
     * @param {object=} parent The parent of the current tree element
     * @returns {*}
     * @private
     */
    this.createElement = function(id, type, indx, elem, e, tree, parent) {
      var n = elem.name ? elem.name : null,
          l = elem.label ? elem.label : null,
          v = elem.value ? elem.value : null,
          x    = elem.x,
          y    = elem.y,
          width  = elem.width,
          height = elem.height,
          siblingArray = [];

          for (var elementToIterate in e) {
             if (e.hasOwnProperty(elementToIterate) && e[elementToIterate] !== elem) {
                var sibling = {};
                if (e[elementToIterate].constructor === {}.constructor) {
                  sibling[elementToIterate] = e[elementToIterate];

                  siblingArray.push(sibling);
                }
                else if (e[elementToIterate] instanceof Array) {
                  sibling[elementToIterate] = e[elementToIterate];

                  siblingArray.push(sibling);
                }
             }
          }

      if (type === 'searchfield') {
        type = 'searchbar';
      }
      else if (type === 'other' && n !== null && l !== null) {
        type = 'statictext';
      }

      tree[id] = {
          id               : id,
          element          : e,
          type             : type,
          name             : (typeof n === "string") ? n.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : n,
          label            : (typeof l === "string") ? l.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : l,
          value            : (typeof v === "string") ? v.replace(Config.SANITIZE_IDENTIFIER, Config.SANITIZE_REPLACEMENT_CHARACTER) : v,
          rect             : {
              origin: {
                  x : (x || x === 0) ? +parseFloat(x).toFixed(2) : null,
                  y : (y || y === 0) ? +parseFloat(y).toFixed(2) : null,
              },
              size: {
                  width  : (width  || width === 0)  ? +parseFloat(width).toFixed(2)  : null,
                  height : (height || height === 0) ? +parseFloat(height).toFixed(2) : null,
              }
          },
          elements : siblingArray,
          hitpoint         : {},
          enabled          : !!elem.enabled,         // Coerce to bool
          visible          : (y <= screenHeight),         // Coerce to bool
          hasKeyboardFocus : null,
          valid            : true,

          children         : {},
          index            : indx,
          parent           : {
            id      : parent ? parent.id    : null,
            name    : parent ? parent.name  : null,
            label   : parent ? parent.label : null,
            value   : parent ? parent.value : null
          }
      };

      Elements[id] = tree[id];

      tree[id].hitpoint = {
          x: (tree[id].rect.origin.x + (tree[id].rect.size.width  / 2)),
          y: (tree[id].rect.origin.y + (tree[id].rect.size.height / 2))
      };

      for (var i = 0; i < tree[id].elements.length; i++) { // Breadth-first search, so now walk child elements
          this._walkElementTree(tree[id].elements[i], tree[id].children, tree[id]);
      }

      return tree;
    };

    /**
     * Recursively walks the Simulator DOM and generates a DOM Tree
     * @memberof Instruments/Tree
     * @fires walking-element-tree
     * @param {Array} elementArray The root to begin the walk from (defaults to: Simulator.app.elements())
     * @param {object=} tree For recursion only
     * @param {object=} parent The parent of the current tree element
     * @returns {*}
     * @private
     */
    this._walkElementTree = function(elementArray, tree, parent) {
      tree = tree || {};

      var originalType = Object.keys(elementArray)[0],
          id,
          i,
          element,
          type;

      type = originalType.replace(/^XCUIElementType/, '').toLowerCase();

      if(!typeCount[type]) typeCount[type] = 0;

      var elements = elementArray[originalType];

      if (elements instanceof Array) {
        if (areAllKeysTheSame(elements)) {
          for (i = 0; i < elements.length; i++) { // Breadth-first search, so now walk child elements
              id = type + ":" + typeCount[type]++;
              element = elements[i];

              this.createElement(id, type, i, element.$, element, tree, parent);
          }
        }
        else {
          soda.console.error("is array dirrent elements of", type);
        }
      }
      else {
          id = type + ":" + typeCount[type]++;
          element = elements.$;

          this.createElement(id, type, i + 1, element, elements, tree, parent);
      }

      return tree;
    };

    /**
     * Builds the element tree from the JSON converted XML
     * @param {Array} node The current node in the tree
     * @param {Object=} tree The tree (or subtree)
     * @param {Object=} parent The parent (one level up) in the tree of the current node
     * @returns {Object}
     */
    this.buildTree = function(elementArray, tree) {
        return this._walkElementTree(elementArray, tree, {});
    };

    /**
     * Returns the Elements object
     * @memberof Instruments/Tree
     * @returns {*}
     */
    this.getElements = function () {
        return Elements;
    };
};

module.exports = Tree;
