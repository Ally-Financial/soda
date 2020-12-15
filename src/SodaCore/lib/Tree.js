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
 * @module SodaCore/Tree
 */

var util         = require("util"),
    EventEmitter = require("events").EventEmitter,

    // I wouldn't mess with these mama-jamas...
    bracketSplitter         = /\[([\w\.:]+?|[a-zA-Z-\.:]+?)(\s*=\s*|\s*~\s*|\s*\?=\s*|\s*\?!\s*|\s*>\s*|\s*<\s*|\s*>=\s*|\s*<=\s*|\s*!=\s*)((?:['](?:(?:[\s\S])*?)[']|["](?:(?:[\s\S])+?)["]|(?:-*\d+(?:\.\d+)?)|true|false|null))]/g,
    selectorValidatorRegExp = /(^\s*(?:(?:(?:(?:[#\.@^%](?:[\w:]+|\{.+}))*|\*|>|<)(?:(?:\[[a-zA-Z0-9-\.:]+(?:\s*=\s*|\s*~\s*|\s*\?=\s*|\s*\?!\s*|\s*>\s*|\s*<\s*|\s*>=\s*|\s*<=\s*|\s*!=\s*)(?:(?:['](?:[\s\S]*?)['])|(?:["](?:[\s|\S]*?)["]|-*\d+(?:\.\d+)?|true|false|null))])+?)?\s*)|(?:(?:(?:[#\.@^%](?:[\w:]+|\{.+}))+|\*|>|<)(?:(?:\[[a-zA-Z0-9-\.:]+(?:\s*=\s*|\s*~\s*|\s*\?=\s*|\s*\?!\s*|\s*>\s*|\s*<\s*|\s*>=\s*|\s*<=\s*|\s*!=\s*)(?:(?:\d+)|(?:['](?:[\s\S]*?)['])|(?:["](?:[\s|\S]*?)["]|-*\d+(?:\.\d+)?|true|false|null))])+?)?(?:\s+|$)){2,})\s*$)/g,
    selectorSplitterRegExp  = /((?:(?:(?:[.#^@](?:(?:\{.*?})|[\w:]+))+|\*|>|<)(?:(?:\[\S+(?:\s*=\s*|\s*~\s*|\s*\?=\s*|\s*\?!\s*|\s*>\s*|\s*<\s*|\s*>=\s*|\s*<=\s*|\s*!=\s*)(?:'.*?'|".*?"|(?:-*\d+(?:\.\d+)?)|true|false|null)])*)))(?:$| )/g,
    Tree;

/**
 * Converts a jQuery style selector to a "by" selector
 * @param {string} selectorType The selector fragment to convert
 * @returns {*}
 */
function getSelectorType (selectorType) {
    var err = arguments.sodaexpect("string").error;
    if(err) throw err;

    switch(selectorType[0]) {

        case "#":
            return "id";

        case ".":
            return "name";

        case "^":
            return "label";

        case "@":
            return "value";

        case "*":
            return "*";

        case ">":
            return ">";

        case "<":
            return "<";

        default:
            return undefined;
    }
}

/**
 * Get a hash for a particular tree
 * @param  {string|object} tree A string or tree object
 * @return {null|string} The tree hash code, if applicable
 */
function getTreeHash (tree) {
    // Remove the time before hashing!
    if(typeof tree === "string") {
        return tree.replace(/\d{1,2}:\d\d(?: (?:AM|PM))?/g, "SYSTEM_TIME").hash();
    }
    else if(typeof tree === "object") {
        try {
            return JSON.stringify(tree, null, '    ').replace(/\d{1,2}:\d\d(?: (?:AM|PM))?/g, "SYSTEM_TIME").hash();
        }
        catch(e) {
            return null;
        }
    }
    else {
        return null;
    }
}

/**
 * A wrapper for the Tree class for Soda dependency injection
 * @param {Soda} soda A Soda instance
 */
var TreeWrapper = function (soda) {
    /**
     * Builds a DOM Tree from a JSON Object
     * @param {string} JSONTree The JSON tree to build the tree object from
     * @constructor
     * @memberof module.SodaCore/Tree.TreeWrapper
     * @augments EventEmitter
     */
    Tree = function TreeObject (JSONTree) {

        var self = this,
            tree = null,
            err, elements;

        err = arguments.sodaexpect("string|object").error;
        if(err) throw err;

        /**
         * Allows users to get elements by id, name, value, etc. Used by methods findElementBy.* below
         * @type {Object}
         */
        elements = {

            byId      : {},
            byName    : {},
            byValue   : {},
            byLabel   : {},
            byType    : {},
            byLevel   : {},
            byDelta   : {},

            empty: function () {
                elements.byId      = {};
                elements.byName    = {};
                elements.byValue   = {};
                elements.byLabel   = {};
                elements.byType    = {};
                elements.byLevel   = {};
                elements.byDelta   = {};
            },

            withId: function (id) {
                return elements.byId[id] ? [elements.byId[id].toTruthy] : [];
            },

            withName: function (id) {
                return elements.byName[id] ? elements.byName[id].toTruthy : [];
            },

            withLabel: function (id) {
                return elements.byLabel[id] ? elements.byLabel[id].toTruthy : [];
            },

            withValue: function (id) {
                return elements.byValue[id] ? elements.byValue[id].toTruthy : [];
            },

            withType: function (id) {
                return elements.byType[id] ? elements.byType[id].toTruthy : [];
            },

            withSelector: function (selector) {
                return self.findElementsBySelector(selector).toTruthy || [];
            },

            random: function () {
                return elements.byId[Object.keys(elements.byId).random];
            },

            randomWithSelector: function (selector) {
                return self.findElementsBySelector(selector).toTruthy.random;
            },

            atLevel: function (level, complete) {
                var res = elements.byLevel[level] ? elements.byLevel[level].toTruthy : [];
                if(complete) complete.call(self, null, res);
                return res;
            },

            atDelta: function (delta, complete) {
                var res = elements.byDelta[delta] ? elements.byDelta[delta].toTruthy : [];
                if(complete) complete.call(self, null, res);
                return res;
            },

            all: function () {
                return elements.byId.sodaToArray || [];
            }
        };

        /////////////////////////////////////////////// HELPER FUNCTIONS ///////////////////////////////////////////////

        /**
         * Propagates the elements object using the JSON tree.
         * The tree calls this for every member, and child using Objects.prototype.sodaeach (@see ProtoLib.js)
         * @param {object} e The element being inspected/added to the elements object
         */
        function buildElementsObject (e) {
            var id    = e.id,
                name  = e.name,
                label = e['label'],
                value = e.value,
                type  = e.type;

            if(e.parent.id) {
                e.level = elements.byId[e.parent.id].level + 1;
            }
            else {
                e.level = 0;
            }

            /**
             * Emitted as the current Tree is building it's elements object
             * @event module.SodaCore.Tree.TreeWrapper.Tree#building element
             * @argument e The current element being built into the DOM Tree
             */
            self.emit("building element", e);

            soda.element.sodaeach(function (interaction) {
                e[interaction.name] = function (options, complete, x, y, z) {

                    if(!complete && options instanceof Function) {
                        complete = options;
                        options  = {};
                    }
                    interaction.call(self, e, options, function (err, actionWasPerformed) {
                        if(err) soda.console.error(err);
                        if(complete) complete.call(soda.Tree, err, actionWasPerformed);
                    }, x, y, z);
                };
            });

            if(id) elements.byId[id] = e;

            if(name) {
                if(typeof name === "string")
                    name = typeof name === "string" ? name.trim() : name;

                if(name instanceof Array) {
                    name.sodaeach(function (n) {
                        if(!(elements.byName[n] instanceof Array)) elements.byName[n] = [];
                        elements.byName[n].push(e);
                    });
                }
                else {
                    if(!(elements.byName[name] instanceof Array)) elements.byName[name] = [];
                    elements.byName[name].push(e);
                }
            }
            if(label) {
                label = typeof label === "string" ? label.trim() : label;
                if (!(elements.byLabel[label] instanceof Array)) elements.byLabel[label] = [];
                elements.byLabel[label].push(e);
            }
            if(value) {
                value = typeof value === "string" ? value.trim() : value;
                if (!(elements.byValue[value] instanceof Array)) elements.byValue[value] = [];
                elements.byValue[value].push(e);
            }
            if(type) {
                type = typeof type === "string" ? type.trim() : type;
                if (!(elements.byType[type] instanceof Array)) elements.byType[type] = [];
                elements.byType[type].push(e);
            }
            if(e.level !== undefined && e.level !== null) {
                if (!(elements.byLevel[e.level] instanceof Array)) elements.byLevel[e.level] = [];
                elements.byLevel[e.level].push(e);
            }
            if(e.level !== undefined && e.level !== null) {
                for(var i = 0; i <= e.level; i++) {
                    if (!(elements.byDelta[i] instanceof Array)) elements.byDelta[i] = [];
                    if(elements.byDelta[i].indexOf(e) === -1) elements.byDelta[i].push(e);
                }
            }

            if(e['children'] && e['children'].sodamembers > 0) e['children'].sodaeach(buildElementsObject);
        }

        /**
         * A helper function for the functions findElementBy* below
         * @param {string} type (name|id|label|value) the by[type] function to use to find the element
         * @param {string} id The element id (or name, value, or label) depending on the type
         * @param {function} complete A callback for completion
         * @returns {Array<Object>} The filtered element set
         */
        function findElements (type, id, complete) {

            var err = arguments.sodaexpect("string", "*", "function|undefined").error;

            if(err) {
                if(complete) complete.call(self, err, null);
                return err;
            }

            var elemArr = elements[type](id);
            if(complete) complete.call(self, null, elemArr);
            return elemArr;

        }

        /**
         * Filters an array of elements by parent. If the elements in the array have the specified parent, they are added
         * to the filtered set, otherwise they are removed.
         * @param {Array} elements The array of elements to filter
         * @param {object} parent The parent element to filter with
         * @returns {Array<Object>} The filtered element set
         */
        function filterByParent (elements, parent) {
            if(!parent) return elements;
            var filtered = [];

            elements.sodaeach(function (e) {
                if(e.parent.id === parent.id) filtered.push(e);
            });
            return filtered;
        }

        /**
         * Filters an array of elements by parent or any children of the parent.
         * If the elements in the array have the specified parent as its parent or one if its children as its parent,
         * they are added to the filtered set, otherwise they are removed.
         * @param {Array} elements The array of elements to filter
         * @param {object} parent The parent element to filter with
         * @param {Array=} filtered For recursion only
         * @returns {Array<Object>} The filtered element set
         */
        function filterByDescendants (elements, parent, filtered) {
            if(!parent) return elements;
            filtered = filtered || [];

            elements.sodaeach(function (e) { if(e.parent.id === parent.id) filtered.push(e); });
            parent.children.sodaeach(function (c) { filterByDescendants(elements, c, filtered); });
            return filtered;
        }

        /**
         * Filter an array of elements, using an array of property constraints
         * @param {Array} elements The array of elements to filter
         * @param {object} constraints An array of constraints to filter by
         * @returns {Array<Object>} The filtered element set
         */
        function filterByConstraints (elements, constraints) {
            if(!constraints || constraints.sodamembers <= 0) return elements;
            var filtered = [];

            elements.sodaeach(function (e) {

                var valid = true;
                constraints.sodaeach(function (constr, k) {
                    constr.sodaeach(function (c) {
                        var obj = e[k];

                        if(k.indexOf('.') !== -1) {
                            var item = e.findChildByPath(k, ".");
                            if(item !== null && item !== undefined) obj = item.toString();
                        }

                        switch(c.type) {
                            case "?=":
                                if(obj instanceof Array) {
                                    if(obj.indexOf(c.value) === -1 || obj === undefined) valid = false;
                                }
                                else if(obj && typeof obj === "object") {
                                    if(!obj[c.value] || obj === undefined) valid = false;
                                }
                                else {
                                    valid = false;
                                }
                                break;

                            case "?!":
                                if(obj instanceof Array) {
                                    if(obj.indexOf(c.value) > -1 || obj === undefined) valid = false;
                                }
                                else if(obj && typeof obj === "object") {
                                    if(obj[c.value] || obj === undefined) valid = false;
                                }
                                else {
                                    valid = false;
                                }
                                break;

                            case "=":
                                if((obj !== c.value) || obj === undefined) valid = false; // jshint ignore:line
                                break;

                            case "!=":
                                if((obj === c.value) || obj === undefined) valid = false; // jshint ignore:line
                                break;

                            case "<":
                                if((parseFloat(obj) >= parseFloat(c.value)) || obj === undefined) valid = false;
                                else if((obj >= c.value) || obj === undefined) valid = false;
                                break;

                            case ">":
                                if((parseFloat(obj) <= parseFloat(c.value)) || obj === undefined) valid = false;
                                else if((obj <= c.value) || obj === undefined) valid = false;
                                break;

                            case "<=":
                                if((parseFloat(obj) > parseFloat(c.value)) || obj === undefined) valid = false;
                                else if((obj > c.value) || obj === undefined) valid = false;
                                break;

                            case ">=":
                                if((parseFloat(obj) < parseFloat(c.value)) || obj === undefined) valid = false;
                                else if((obj < c.value) || obj === undefined) valid = false;
                                break;

                            case "~":
                                try {
                                    var regexp = new RegExp(c.value);
                                    if((obj && regexp.test(obj.trim()) === false) || !obj) valid = false;
                                }
                                catch (err) {
                                    valid = false;
                                }
                                break;

                            case "!~":
                                try {
                                    var regexp2 = new RegExp(c.value);
                                    if(obj && regexp2.test(obj.trim()) === true) valid = false;
                                }
                                catch (err) {
                                    valid = false;
                                }
                                break;
                            default:
                                break;
                        }
                    });
                });
                if(valid === true) filtered.push(e);
            });
            return filtered;
        }

        /**
         * Filter a set of elements by the nth one
         * @param {Array} elementSet The set to filter
         * @param {number|string=} nth The nth element to choose
         * @returns {Array<Object>} The filtered element set
         */
        function filterByNth (elementSet, nth) {
            if(typeof nth === "string") {
                if(nth.toLowerCase() === "last") {
                    nth = elementSet.length - 1;
                }
                else if(nth.toLowerCase() === "first") {
                    nth = 0;
                }
                else if(nth.toLowerCase() === "mid") {
                    nth = parseInt(elementSet.length / 2, 10) - 1;
                }
            }
            return (nth || nth === 0) ? elementSet[nth] ? [elementSet[nth]] : [] : elementSet;
        }

        /**
         * Get's the children of the provided element
         * @param  {Object} e The element to get the children for
         * @return {Array<Object>} The element's children
         */
        function getChildrenOfParent (e) {
            var res = [];
            if(e && typeof e === "object" && typeof e.children === "object") {
                e.children.sodaeach(function (c) {
                    res.push(c);
                });
            }
            return res;
        }

        /**
         * Walks the selector and evaluates the elements at the current selector item
         * @param {Array} selectorObjects An object with the selector, it's type, and other pertinent information (@see findElementsBySelector)
         * @param {{}=} parent The tree parent above the current level. For recursion only...
         * @returns {Array<Object>} The elements which belong to the given selector
         */
        function walkSelector (selectorObjects, parent) {
            var level       = parent ? parent.level + 1 : 0,
                returnSet   = [],
                selectorObj = selectorObjects.shift(),
                nth         = selectorObj.nthElem,

                prop, elems = [], filtered;

            switch(selectorObj.by[0]) {
                case "name":
                    prop = "withName";
                    break;
                case "label":
                    prop = "withLabel";
                    break;
                case "value":
                    prop = "withValue";
                    break;
                case "id":
                    prop = "withId";
                    break;

                default:
                    prop = selectorObj.by[0];
                    break;
            }

            if((prop !== "*" && prop !== ">" && prop !== "<") || (selectorObjects.sodamembers !== 0)) {

                if(prop === "*") {
                    elems = elements.byDelta[level];
                    if(!(elems instanceof Array) || elems.length === 0) return [];
                    filtered = filterByNth(filterByDescendants(filterByConstraints(elems, selectorObj.constraints), parent), nth);
                }
                else if(prop === ">") {
                    filtered = filterByNth(filterByConstraints(level === 0 ? elements.atLevel(0) : getChildrenOfParent(parent), selectorObj.constraints), nth);
                }
                else if(prop === "<") {
                    filtered = filterByNth(filterByConstraints(parent ? [parent] : [], selectorObj.constraints), nth);
                }
                else {
                    elems = elements[prop](selectorObj.path[0]);
                    if(!(elems instanceof Array) || elems.length === 0) return [];

                    if(selectorObj.by.length > 1) {
                        var newSet = [];

                        for(var i = 1; i < selectorObj.by.length; i++) {
                            var nextBy   = selectorObj.by[i],
                                nextPath = selectorObj.path[i],
                                nextSet, nextProp;

                            switch(nextBy) {
                                case "name":
                                    nextProp = "withName";
                                    break;
                                case "label":
                                    nextProp = "withLabel";
                                    break;
                                case "value":
                                    nextProp = "withValue";
                                    break;
                                case "id":
                                    nextProp = "withId";
                                    break;

                                default:
                                    nextProp = nextBy;
                                    break;
                            }

                            nextSet = elements[nextProp](nextPath);
                            var n;
                            for(n = 0; n < elems.length; n++)  if(newSet.indexOf(elems[n]) === -1)   newSet.push(elems[n]);
                            for(n = 0; n < newSet.length; n++) if(nextSet.indexOf(newSet[n]) === -1) newSet.splice(n, 1);
                        }
                        elems = newSet;
                    }
                    filtered = filterByNth(filterByDescendants(filterByConstraints(elems, selectorObj.constraints), parent), nth);
                }

                if(selectorObjects.length === 0) {
                    returnSet = filtered;
                }
                else {
                    filtered.sodaeach(function (e) {
                        returnSet = typeof selectorObjects[0] === "object" && selectorObjects[0].by[0] === "<" ?
                            returnSet.concat(walkSelector(selectorObjects.sodaclone(), elements.withId(e.parent.id)[0])) :
                            returnSet.concat(walkSelector(selectorObjects.sodaclone(), e));
                    });
                }
            }
            else if(prop === "*") {
                return elements.byDelta[level] ?
                    filterByNth(filterByDescendants(filterByConstraints(elements.byDelta[level], selectorObj.constraints), parent), nth) : [];
            }
            else if(prop === ">") {
                return filterByNth(filterByConstraints(level === 0 ? elements.atLevel(0) : getChildrenOfParent(parent), selectorObj.constraints), nth);
            }
            else if(prop === "<") {
                return filterByNth(filterByConstraints(parent ? [parent] : [], selectorObj.constraints), nth);
            }

            return returnSet.uniqueItems();
        }

        Object.defineProperties(self, {
            contents: {
                configurable : false,
                enumerable   : false,
                get: function () {
                    return tree;
                },
                set: function (v) {
                    tree = v.isAnObject ? v : JSON.parse(v);
                    elements.empty();
                    tree.sodaeach(buildElementsObject);
                    self.hash = getTreeHash(tree);
                }
            },

            hash: {
                configurable : false,
                enumerable   : true,
                writable     : true,
                value        : getTreeHash(JSONTree)
            }
        });

        //////////////////////////////////////////////// CLASS METHODS /////////////////////////////////////////////////

        /**
         * Console logs the element tree.
         * @returns {Tree} The current Tree instance
         */
        this.print = function () {
            console.log(tree.stringified(null, '    '));
            return self;
        };

        /**
         * Returns the elements object for finding elements by name, label, value, or id.
         * @returns {{byId: {}, byName: {}, byValue: {}, byLabel: {}, withId: Function, withName: Function, withLabel: Function, withValue: Function, all: Function}}
         */
        this.elements = function () {
            return elements;
        };

        /**
         * Find elements by tree depth
         * @param {number} level The depth level of the elements to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified depth level
         */
        this.findElementsAtLevel = function findElementsAtLevel (level, complete) {
            return elements.atLevel(level, complete);
        };

        /**
         * Find elements by tree depth, including all children. This differs from findElementsAtLevel since all children
         * from the level down will be included (e.g. level 0 includes level all levels, level 1 includes 1, and 2, etc.)
         * @param {number} delta The depth to exclude elements up to
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified depth level
         */
        this.findElementsAtDelta = function findElementsAtDelta (delta, complete) {
            return elements.atDelta(delta, complete);
        };

        /**
         * Find an element by id
         * @param {string} id The id of the element to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified id
         */
        this.findElementById = function findElementById (id, complete) {
            return findElements("withId", id, complete);
        };

        /**
         * Alias for Tree.findElementById
         * @type {Function}
         */
        this.findElementsById = self.findElementById;

        /**
         * Find an element by name
         * @param {string} name The name of the element to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified name
         */
        this.findElementsByName = function findElementsByName (name, complete) {
            return findElements("withName", name, complete);
        };

        /**
         * Find an element by label
         * @param {string} label The label of the element to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified label
         */
        this.findElementsByLabel = function findElementsByLabel (label, complete) {
            return findElements("withLabel", label, complete);
        };

        /**
         * Find an element by value
         * @param {string} value The value of the element to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified value
         */
        this.findElementsByValue = function findElementsByValue (value, complete) {
            return findElements("withValue", value, complete);
        };

        /**
         * Find an element by type
         * @param {string} type The value of the element to find
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements with the specified value
         */
        this.findElementsByType = function findElementsByType (type, complete) {
            return findElements("withType", type, complete);
        };

        /**
         * Find an element using a jQuery style selector, using a set of selectors to get all matches in the set
         * @param {string} set The array set of selectors to query the tree with
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements that meet the selector's specifications
         */
        this.findElementsBySelectorSet = function findElementsBySelectorSet (set, complete) {
            if(typeof set === "string") return self.findElementsBySelector(set, complete);
            var matchedElements = [], setElements = [];

            set.sodaeach(function (selector, key) {
                var res = self.findElementsBySelector(selector);
                if(res instanceof Array) {
                    matchedElements = matchedElements.concat(res);
                    setElements[key] = res;
                }
                else {
                    setElements[key] = [];
                }
            });

            if(complete instanceof Function) complete.call(self, null, { flat: matchedElements, bySet: setElements });
            return matchedElements;
        };

        this.selectorType = function selectorType(selectorType) {
          return getSelectorType(selectorType);
        };

        this.treeHash = function treeHash(tree) {
          return getTreeHash(tree);
        };

        /**
         * Replaces variables using the syntax's variable format
         * @param {String} selector The selector to replace variables for
         * @returns {*}
         */
        function replaceVariables (v) {
            var re   = soda.config.get("variableFormat")  || soda.config.get("defaultVariableFormat"), m,
                func = soda.config.get("variableOnMatch") || soda.config.get("defaultVariableMatch");

            if(re) {
                re.exec("");
                while (m = re.exec(v)) { // jshint ignore:line
                    v = func(soda.vars, m, v);
                }

                re.exec("");
                if(re.test(v) === true) {
                    v = replaceVariables(v);
                }
            }
            return v;
        }

        /**
         * Returns the selector defined in a suite's mapping file
         * @param  {String} selector The selector (or mapping constant) to lookup
         * @param  {Object} map A suite's mapping file
         * @return {String} The original selector, if it isn't a mapping, or the mapped selector if it is
         */
        function replaceMappingWithSelector (selector, suiteMap, moduleMap) {
            var platform = soda.config.get("platform");

            // Check the modules's mapping file
            if(typeof moduleMap === "object" && typeof moduleMap[selector] === "object" && typeof moduleMap[selector][platform] === "string")
                selector = moduleMap[selector][platform];

            // Check the suite's mapping file
            if(typeof suiteMap === "object" && typeof suiteMap[selector] === "object" && typeof suiteMap[selector][platform] === "string")
                selector = suiteMap[selector][platform];

            // Check the global mapping file
            var currentAsset = soda.assets.current;
            if(typeof currentAsset === "object" && typeof currentAsset.collection === "object" && typeof currentAsset.collection.getSuite instanceof Function) {
                var globalSuite = currentAsset.collection.getSuite("global");

                if(globalSuite) {
                    var globalMap = globalSuite.mapping;
                    if(typeof globalMap === "object" && (typeof globalMap[selector] === "object" && typeof globalMap[selector][platform] === "string")) {
                            selector = globalMap[selector][platform];
                    }
                }
            }

            return replaceVariables(selector);
        }

        /**
         * Find an element using a jQuery style selector
         * @param {string} selector The selector to query the tree with
         * @param {function=} complete A callback for completion
         * @returns {Array<Object>} An array of elements that meet the selector's specifications
         */
        this.findElementsBySelector = function findElementsBySelector (selector, complete) {
            var suiteMapping  = soda.config.get("suiteMapping"),
                moduleMapping = soda.config.get("moduleMapping");

            if(suiteMapping instanceof Function && moduleMapping instanceof Function)
                selector = replaceMappingWithSelector(selector, suiteMapping(), moduleMapping());

            if(!selector) {
                const tempErr = new Error("Null selector");
                if(complete) complete.call(self, tempErr, null);
                return tempErr;
            }

            var err     = arguments.sodaexpect("string", "function|undefined").error,
                valid   = selector.match(selectorValidatorRegExp),
                paths   = [],

                i, m, sel, candidateElements;

            if(err) {
                if(complete) complete.call(self, err, null);
                return err;
            }

            if(valid === null) {
                err = new Error("Invalid selector: `" + selector + "`");
                if(complete) complete.call(self, err, null);
                return err;
            }

            sel = selector.match(selectorSplitterRegExp);

            if(sel) {
                for(i = 0; i < sel.sodamembers; i++) {

                    var noFilters     = sel[i].replace(/\[.*]/g, ''),
                        constraints   = {},
                        nth = null;

                    while((m = bracketSplitter.exec(sel[i])) !== null) {
                        if(typeof m[3] === "string") {
                            switch(m[3]) { // These will convert the non-quote wrapped version to their JS equivalents
                                case "false":
                                    m[3] = false;
                                    break;

                                case "true":
                                    m[3] = true;
                                    break;

                                case "null":
                                    m[3] = null;
                                    break;

                                default:
                                    m[3] = m[3].replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1");
                            }
                        }

                        if(m[1] === "nth") {
                            nth = m[3];
                        }
                        else {
                            if(!constraints[m[1]]) constraints[m[1]] = [];
                            constraints[m[1]].push({ type : m[2], value: m[3] });
                        }
                    }

                    var bys     = noFilters.match(/([.^@#%](?:[\w:]+|\{.+?})|<|>|\*)/g),
                        byArr   = [],
                        pathArr = [];

                    if(!bys) return [];

                    bys.sodaeach(function (b) {
                        var noCurlyBraces = b.replace(/\{(?:\s*)([\s\S]+)(?:\s*)}/g, '$1').trim();
                        byArr.push(getSelectorType(noCurlyBraces));
                        pathArr.push(noCurlyBraces.substr(1, noCurlyBraces.length));
                    });

                    paths.push({
                        by          : byArr,
                        path        : pathArr,
                        constraints : constraints,
                        nthElem     : nth
                    });
                }
            }
            else {
                err = new Error("Invalid selector: `" + selector + "`");
                if(complete) complete.call(self, err, null);
                return err;
            }

            candidateElements = walkSelector(paths);

            if(complete) complete.call(self, null, candidateElements || []);
            return candidateElements || [];
        };

        ///////////////////////////////////////////////// CONSTRUCTOR //////////////////////////////////////////////////

        try {
            tree = JSONTree && JSONTree.isAnObject ? JSONTree : JSON.parse(JSONTree);
            elements.empty();
            tree.sodaeach(buildElementsObject);
        }
        catch(e) {
            throw new soda.exception.SodaError("Couldn't parse Tree, because: " + e.message);
        }
    };

    /**
     * A static event emitter for the Tree class. Used to emit when any tree is updated, or for "global" tree events.
     * @type EventEmitter
     * @memberof module.SodaCore/Tree.TreeWrapper.Tree
     */
    Tree.emitter = new EventEmitter();

    util.inherits(Tree, EventEmitter);
    return Tree;
};

module.exports = TreeWrapper;
