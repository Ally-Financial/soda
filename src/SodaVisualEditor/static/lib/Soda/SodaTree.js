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
 * Manages the Test Editor DOM Tree
 * @constructor
 * @param {Soda} soda The window.Soda instance
 */
window.SodaTree = function (soda, $tree) {

    var self = this,

        /**
         * @associates SodaSettings
         * @type {SodaSettings}
         */
        SodaSettings    = window.SodaSettings,
        wids            = 0,
        elements        = {},
        elementsById    = {},
        Selectors       = {};


    /**
     * Search the properties of element "e" for a search match
     * @param  {object} e The element to search a match for
     * @param  {string} searchTerms The search terms to match
     * @return {Boolean} True if the element matches the search terms, false otherwise
     */
    function traverseElementWithSearchTerms (e, searchTerms) {
        var found = false;
        if(e && typeof e === "object") {
            for(var i in e) {
                if(e.hasOwnProperty(i)) {
                    if(e[i] && typeof e[i] === "object" && i !== "children" && i !== "parent") {
                        found = traverseElementWithSearchTerms(e[i], searchTerms);
                    }
                    else {
                        found = new RegExp(searchTerms, "i").test(e[i]);
                    }
                    if(found) break;
                }
            }
        }
        return found;
    }

    // Create a new toolbox to show tree hierarchy
    $tree.self = soda.editor.addToolbox({
        name    : "dom-tree",
        title   : "Screen Elements",
        content : $tree.self,
        icon    : "fa-tree",
        show    : true,
        side    : "left"
    });

    $tree.elementTemplate   = $tree.self.find(".tree-element").detach();
    $tree.search            = $tree.self.find("#soda-tree-search");
    $tree.hierarchy         = $tree.self.find("#soda-tree-hierarchy");
    $tree.hierarchyWrapper  = $tree.self.find("#soda-tree-hierarchy-wrapper");

    // After a "search" has been iniatiated, but before the elements are queried as to whether or not
    // they meet the search requirements...
    soda.delegates.on("tree search before", function () {
        self.closeAllTreeNodes();
        $(".tree-element").removeClass("search-positive");
    });

    soda.delegates.on("tree search after", function () {
        var $res = $(".tree-element.search-positive");
        $res.each(function () {
            var $el = $(this);
            setTimeout(function () {
                self.expandTreeParents(elements[$el.attr("data-wid")].__soda_parents);
                $el.show();
            }, 0);
        });

        setTimeout(function () {
            soda.$editor.toolboxWrapperLeft.mCustomScrollbar("scrollTo", $res.first(), { scrollInertia: 0 });
        }, 0);
    });

    // On a tree search, determine the tree elements that will pass or fail the search
    soda.delegates.on("tree search", function (searchTerms, $element) {
        if(searchTerms && searchTerms !== "") {
            var passed = traverseElementWithSearchTerms(elements[$element.attr("data-wid")], searchTerms);
            if(passed) $element.addClass("search-positive");
        }
        else {
            $(".tree-element").removeClass("search-positive");
        }
    });

    // After a "tree query" has been iniatiated, but before the elements are queried as to whether or not
    // they meet the query requirements...
    soda.delegates.on("tree query before", function () {
        self.closeAllTreeNodes();
        $(".tree-element").removeClass("query-positive");
    });

    soda.delegates.on("tree query after", function () {
        var $res = $(".tree-element.query-positive");
        $res.each(function () {
            self.expandTreeParents(elements[$(this).attr("data-wid")].__soda_parents);
            $(this).show();
        });

        setTimeout(function () {
            soda.$editor.toolboxWrapperLeft.mCustomScrollbar("scrollTo", $res.first(), { scrollInertia: 0 });
        }, 0);
    });

    // On a tree queru, determine the tree elements that will pass or fail the query
    soda.delegates.on("tree query", function (searchTerms, $element, elementIds) {
        if(searchTerms && searchTerms !== "") {
            var passed = elementIds.indexOf($element.attr("data-eid")) === -1 ? false : true;
            if(passed) $element.addClass("query-positive");
        }
        else {
            $(".tree-element").removeClass("query-positive");
        }
    });

    /**
     * Returns all the tree elements
     * @return {Object} The elements of this tree
     */
    this.getElements = function () {
        return elements;
    };

    /**
     * Close all "nodes" on the tree (the on-screen element tree)
     * @return {SodaTree} The current SodaTree instance
     */
    this.closeAllTreeNodes = function () {
        $(".tree-element").each(function () {
            var $icon = $(this).children(".tree-element-info").children("i.expandable-icon");

            if(!$icon.hasClass("fa-leaf"))
                $icon.removeClass("fa-caret-down").addClass("fa-caret-right");

            $(this).removeClass("expanded").children(".expandable-child").hide();
        });
    };

    /**
     * Append
     * @param  {object} e The element to append attributes to
     * @param  {object} parent The parent of the element
     * @param  {Boolean} isObject
     * @return {undefined}
     */
    function appendToAttributesWithElement (e, parent, isObject) {
        parent = parent || soda.$inspector.attributes;

        for(var i in e) {
            if(e.hasOwnProperty(i) && !(/^__soda_.*/.test(i)) && i !== "element" && i !== "children") {
                if(e[i] && typeof e[i] === "object") {
                    var newParent =
                        $(
                            '<div class="tree-attribute' + (isObject ? ' has-object-parent' : '') + '">' +
                                '<div class="tree-attribute-info">' +
                                    '<div class="tree-attribute-key object-parent">'   + i    + '</div>'  +
                                    '<div class="tree-attribute-value object-parent"></div>'  +
                                '</div>' +
                                '<div class="tree-attribute-children"></div>'  +
                            '</div>'
                        )
                        .appendTo(parent);

                    appendToAttributesWithElement(e[i], newParent.children(".tree-attribute-children"), true);
                }
                else {
                    parent.append(
                        '<div class="tree-attribute' + (isObject ? ' has-object-parent' : '') + '">' +
                            '<div class="tree-attribute-info">' +
                                '<div class="tree-attribute-key inline">'   + i    + '</div>'  +
                                '<div class="tree-attribute-value inline">' + e[i] + '</div>'  +
                            '</div>' +
                        '</div>'
                    );
                }
            }
        }
    }

    /**
     * Call back for when the user hovers over a tree element
     * @param  {object} e The element that is being hovered over
     * @param  {Boolean} force For the attrributes to change, even if another element is pinned
     * @param  {jQuery} parent The parent element of the element
     * @return {Function} The hover callback
     */
    this.treeElementOnHover = function (e, force, parent) {
        parent = parent || soda.$inspector.attributes;

        return function () {
            if(!soda.screen.hoverBoxTacked || force) {
                soda.$inspector.attributes.empty();
                soda.$inspector.attributesHeader.html("#" + e.id);
                appendToAttributesWithElement(e, soda.$inspector.attributes);
            }
        };
    };

    /**
     * Callback for when and element is hovered over
     * @param  {object} e The element to generate the hover function for
     * @return {Function} A callback for hovering over a tree element
     */
    function animateHoverBox (e) {
        return function () {
            if(!soda.screen.hoverBoxTacked) {
                soda.screen.animateHoverBoxUsingElement(e);
            }
        };
    }

    /**
     * Animate the hover box to the element e
     * @param  {object} e The element to animate the hover box to
     * @return {SodaTree} The current SodaTree instance
     */
    this.animateHoverBox = function (e) {
        animateHoverBox(e)();
        return self;
    };

    /**
     * Callback for when and element the element pin icon is clicked
     * @param  {object} e The element to generate the hover function for
     * @return {Function} A callback for pinning a tree element
     */
    function toggleHoverBoxTacked ($eStickyButton, e) {
        return function (event) {
            event.stopPropagation();
            if($eStickyButton.hasClass("active")) {
                $eStickyButton.removeClass("active");
                soda.screen.hoverBoxTacked = false;
            }
            else {
                $tree.self.find("#soda-tree-hierarchy i.sticky-element").removeClass("active");
                soda.screen.animateHoverBoxUsingElement(e);
                self.treeElementOnHover(e, true)();
                $eStickyButton.addClass("active");
                soda.screen.hoverBoxTacked = true;
            }
        };
    }

    /**
     * Generate a function to expand all of the elements in the "parents" array
     * @param  {Array} parents An array of parent elements to expand
     * @return {Function} The generated callback
     */
    function expandParents (parents) {
        return function (event) {
            if(event) event.stopPropagation();
            for(var i in parents) {
                if(parents.hasOwnProperty(i) && !$(parents[i]).parent().hasClass("expanded")) {
                    $(parents[i]).parent().trigger("click");
                }
            }
        };
    }

    /**
     * Expand all tree elements in the "parents" array
     * @param  {Array} parents An array of elements to expand
     * @return {*}
     */
    this.expandTreeParents = function (parents) {
        return expandParents(parents)();
    };

    var lockDraggable = false;

    function finish (ui, rawType, group, e, $input, keys, isElemental, prefill) {
        if($(".editor-toggle." + rawType).attr("data-active") === "true") { // jshint ignore:line
            var currentJson, arr, o = {};

            try {
                currentJson = JSON.parse(soda.testEditor.aceEditors[rawType].getValue().trim());
            }
            catch (e) {
                soda.editor.setContext(
                    {
                        header      : "JSON Syntax Error",
                        body        : "<span class=\"bold\">Can't insert new action, because your JSON is invalid!</span><br>Fix the syntax errors and try again.",
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
                return;
            }

            var addArr = function () {
                arr.push(o);

                try {
                    soda.testEditor.aceEditors[rawType].setValue(JSON.stringify(currentJson, null, '    '));
                }
                catch (e) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong",
                            body        : "Unable to add action at this time. Try again later.",
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                    return;
                }
            };

            var addAction = function () {
                keys.forEach(function (k) {
                    if(k === group && $input && $input.val()) {
                        o[k] = $input.val();
                    }
                    else if(typeof prefill === "object" && prefill && prefill[k]) {
                        o[k] = prefill[k];
                    }
                    else {
                        o[k] = "[value]";
                    }
                });

                if(rawType === "widget") {
                    var vars        = ui.draggable.attr("data-vars") ? ui.draggable.attr("data-vars").split(":VAR:") : [],
                        varDesc     = ui.draggable.attr("data-var-desc") ? ui.draggable.attr("data-var-desc").split(":DESC:") : [],
                        varDefaults,
                        body        = $("<div></div>"),
                        desc        = "";

                    if(ui.draggable.attr("data-def")) {
                        varDefaults = JSON.parse(ui.draggable.attr("data-def"));
                    }
                    else {
                        varDefaults = [];
                    }

                    for(var i in vars) {
                        if(vars.hasOwnProperty(i)) {
                            if(varDesc[i]) {
                                desc = "<div class=\"widget-var-desc\">" + varDesc[i] + "</div>";
                            }
                            else {
                                desc = "<div class=\"widget-var-desc\"><span class=\"emphasis\">No description</span></div>";
                            }

                            var inputType = "";
                            if(varDefaults[i] !== undefined && varDefaults[i] !== null) {
                                if(varDefaults[i] instanceof Array) {
                                    inputType = '<select class="widget-variable" data-var="' + vars[i] + '" data-value="' + varDefaults[i][0] + '">';
                                    for(var k in varDefaults[i]) {
                                        if(varDefaults[i].hasOwnProperty(k) && (typeof varDefaults[i][k] === "string" || typeof varDefaults[i][k] === "number")) {
                                            inputType += '<option value="' + varDefaults[i][k] + '">' + varDefaults[i][k] + '</option>';
                                        }
                                    }
                                    inputType += "</select>";
                                }
                                else {
                                    inputType = '<input class="widget-variable" type="text" data-var="' + vars[i] + '" value="' + varDefaults[i] + '"></input>';
                                }
                            }
                            else {
                                inputType = '<input class="widget-variable" type="text" data-var="' + vars[i] + '"></input>';
                            }

                            $('<div><label class="widget-var-label">Value for <span class="emphasis">' + vars[i] + '</span></label>' + desc + inputType + '</div>').appendTo(body);
                        }
                    }

                    if(vars.length > 0) {
                        soda.editor.setContext({
                            header: "Enter widget variables",
                            body  : body,
                            onOkay: function () {
                                var $vars = body.find(".widget-variable");

                                $vars.each(function () {
                                    arr.push({ "store": $(this).val(), "as": $(this).attr("data-var") });
                                });
                                addArr();
                            }
                        });
                    }
                    else {
                        addArr();
                    }
                }
                else {
                    addArr();
                }
            };

            switch(rawType) {
                case "test":
                case "action":                    
                    if(typeof currentJson === "object" && currentJson.actions instanceof Array) {
                        arr = currentJson.actions;
                        addAction();
                    }
                    else {
                        soda.editor.setContext(
                            {
                                header      : "Asset Syntax Error",
                                body        : "<span class=\"bold\">Your " + rawType + " is missing the \"actions\" array!</span><br>Would you like to autocorrect this problem?",
                                okayText    : "Okay",
                                cancelText  : "No, nevermind",
                                onOkay      : function () {
                                    if(typeof currentJson !== "object") currentJson = {};
                                    currentJson.actions = [];
                                    arr = currentJson.actions;
                                    addAction();
                                }
                            }
                        );
                        return;
                    }
                    break;

                default:
                    if(typeof currentJson === "object" && typeof currentJson[rawType] === "object" && currentJson[rawType].components instanceof Array) {
                        arr = currentJson[rawType].components;
                        addAction();
                    }
                    else {
                        soda.editor.setContext(
                            {
                                header      : "Asset Syntax Error",
                                body        : "<span class=\"bold\">Your " + rawType + " structure is malformed!</span><br>Would you like to autocorrect this problem?",
                                okayText    : "Okay",
                                cancelText  : "No, nevermind",
                                onOkay      : function () {
                                    if(typeof currentJson !== "object") currentJson = {};
                                    if(typeof currentJson[rawType] !== "object") currentJson[rawType] = {};
                                    currentJson[rawType].components = [];
                                    arr = currentJson[rawType].components;
                                    addAction();
                                }
                            }
                        );
                        return;
                    }
            }
        }
        else {
            soda.testEditor.addAction(rawType, group, e, $input, keys, isElemental, prefill);
            soda.testEditor.switchToTab(rawType);
        }
    }

    /**
     * A callback for when an action is dropped on a screen element
     * @param  {object} event jQuery event object
     * @param  {object} ui jQuery ui object
     * @return {undefined}
     */
    function onActionDropped (event, ui) {
        $(this).html(""); // jshint ignore:line

        event.stopPropagation();

        if(!lockDraggable) {
            lockDraggable = true;

            var rawType = ui.draggable.attr("data-type"),
                keys    = rawType !== 'draggable' ? ui.draggable.attr("data-keys").split(":") : [],
                type    = rawType === "action" || ui.draggable.attr("data-type") === "test" ? "action" : ui.draggable.attr("data-type") === "widget" ? "widget" : "validation",
                group   = ui.draggable.attr("data-group"),

                elemental = ui.draggable.attr("data-elemental") === "true" ? true : false,
                eid       = $(this).attr("data-id"), // jshint ignore:line
                id        = elements[eid] ? elements[eid].id : "Unknown",
                e         = elements[eid],
                $input,

                i, bodyHtml, selectors, selectorsDropdown, propertiesDropdown, $testIcon, $testBtn, optn, opt,
                triggeredFirst = false;

            if (rawType === "draggable") {
                return;
            }
            else if(rawType !== "widget") {
                bodyHtml  = $('<div class="soda-selector-context"><span>Action key signature: </span><span class="emphasis">' + keys.join(", ") + '</span><br><span>Perform <span class="emphasis">' + (group.lowerFirst || "?") + '</span>' + (elemental ? (' on element #' + id) : "") + '?</span></div>');
            }
            else {
                bodyHtml  = $('<div class="soda-selector-context">Add widget <span class="bold">' + ui.draggable.attr("data-widget-name") + '</span> to current list?</div>');
            }

            if(elemental && keys.indexOf("using") === -1) {
                selectors = $(
                    '<div class="input-group">' +
                        '<span class="input-group-addon"><em class="fa fa-minus-circle test-icon"></em></span>' +
                        '<input type="text" class="selector-input form-control" placeholder="Enter a selector...">' +
                        '<div class="input-group-btn">' +
                            '<button type="button" class="btn btn-default test-btn">Test</button>' +
                            '<button type="button" class="btn btn-default selector-btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Selectors <span class="caret"></span></button>' +
                            '<ul class="selector-filters dropdown-menu dropdown-menu-right"></ul>' +
                        '</div>' +
                        '<div class="input-group-btn">' +
                            '<button type="button" class="btn btn-default selector-btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Property Filters <span class="caret"></span></button>' +
                            '<ul class="property-filters dropdown-menu dropdown-menu-right"></ul>' +
                        '</div>' +
                    '<div>'
                );

                selectorsDropdown  = selectors.find("ul.selector-filters");
                propertiesDropdown = selectors.find("ul.property-filters");
                $testIcon          = selectors.find(".test-icon");
                $testBtn           = selectors.find("button.test-btn");

                $input = selectors.find(".selector-input");

                $testBtn.click(function () {
                    $(".selector-message").html('Checking selector<span class="dot-dot-dot"></span>');
                    soda.framework.queryTree("selector", $input.val(), function (err, matchedElementIds) {

                        if(matchedElementIds && matchedElementIds instanceof Array && matchedElementIds.indexOf(id) > -1) {
                            $testIcon.removeClass("fa-times-circle").addClass("fa-check-circle");

                            if(matchedElementIds.length > 1) {
                                $testIcon.removeClass("fa-check-circle").addClass("fa-minus-circle");
                                $(".selector-message").html("The selector matches this element and " + (matchedElementIds.length - 1) + " other(s).");
                            }
                            else {
                                $(".selector-message").html("The selector matches this element uniquely");
                            }
                        }
                        else if(err) {
                            $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                            $(".selector-message").html("Invalid Selector!");
                        }
                        else {
                            $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                            $(".selector-message").html("The selector entered doesn't match this element!");
                        }
                    });
                });

                for(i in Selectors[e.id]) {
                    if(Selectors[e.id].hasOwnProperty(i)) {
                        optn = $('<li><a href="#">' + Selectors[e.id][i] + '</a></li>').appendTo(selectorsDropdown);
                        opt  = optn.find("a");

                        opt.click(function () { // jshint ignore:line
                            $input.val($(this).text()).attr("value", $(this).text());
                            $testBtn.trigger("click");
                        });

                        if(!triggeredFirst) {
                            triggeredFirst = true;
                            opt.trigger("click");
                        }
                    }
                }

                var createPropertyFilters = function (e, parent, rawParent) {
                    parent    = parent    || "";
                    rawParent = rawParent || "";

                    for(var n in e) {
                        if(e.hasOwnProperty(n) && /^__/.test(n) === false && /^element/.test(n) === false && /^wid/.test(n) === false && /^children/.test(n) === false) {
                            var localParent = parent + ' <span class="fa fa-caret-right"></span> ' + n.ucFirst,
                                localRaw    = rawParent + "." + n;

                            localRaw    = localRaw.replace(/^\./, '');
                            localParent = localParent.replace(/^ <span class="fa fa-caret-right"><\/span> /, '');

                            if(typeof e[n] !== "object") {
                                var optn = $('<li><a href="#" data-value="[' + localRaw + '=' + JSON.stringify(e[n]).replace(/"/g, "'") + ']">' + localParent + '</a></li>').appendTo(propertiesDropdown),
                                    opt  = optn.find("a");

                                opt.click(function () { // jshint ignore:line
                                    var val = $input.val().trim() + $(this).attr("data-value");
                                    $input.val(val).attr("value", val);
                                    $testBtn.trigger("click");
                                });
                            }
                            else {
                                createPropertyFilters(e[n], localParent, localRaw);
                            }
                        }
                    }
                };

                createPropertyFilters(e);
                createPropertyFilters({ nth: 0 }); // Add a 'pseudo' nth filter

                soda.editor.setContext(
                    {
                        header      : "Add " + type + "?",
                        body        : bodyHtml,
                        okayText    : "Add Action",
                        cancelText  : "No, Cancel",
                        onOkay      : function () {
                            soda.editor.switchToToolbox("test-editor", function () {
                                finish(ui, rawType, group, e, $input, keys, elemental, null);
                            });
                        }
                    }
                );

                bodyHtml.append('<br><label class="selector-label">Enter a selector...</label>');
                bodyHtml.append(selectors);
                bodyHtml.append('<p class="selector-message">Press the test button to test the selector against the current DOM tree</p>');
            }
            else if(elemental) {
                var identifierType = "selector",
                    typeArr        = ["name", "label", "value", "id", "selector"];

                selectors = $(
                    '<div class="input-group">' +
                        '<span class="input-group-addon"><em class="fa fa-minus-circle test-icon"></em></span>' +
                        '<input type="text" class="selector-input form-control" placeholder="Enter a name, label, value, or id...">' +
                        '<div class="input-group-btn">' +
                            '<button type="button" class="btn btn-default test-btn">Test</button>' +
                            '<button type="button" class="btn btn-default selector-btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Name <span class="caret"></span></button>' +
                            '<ul class="identifier-filters dropdown-menu dropdown-menu-right"></ul>' +
                        '</div>' +
                    '<div>'
                );

                selectorsDropdown  = selectors.find("ul.identifier-filters");
                $testIcon          = selectors.find(".test-icon");
                $testBtn           = selectors.find("button.test-btn");

                $input = selectors.find(".selector-input");

                $testBtn.click(function () {
                    $(".selector-message").html('Checking for element match<span class="dot-dot-dot"></span>');
                    soda.framework.queryTree(identifierType, $input.val(), function (err, matchedElementIds) {

                        if(matchedElementIds && matchedElementIds instanceof Array && matchedElementIds.indexOf(id) > -1) {
                            $testIcon.removeClass("fa-times-circle").addClass("fa-check-circle");

                            if(matchedElementIds.length > 1) {
                                $testIcon.removeClass("fa-check-circle").addClass("fa-minus-circle");
                                $(".selector-message").html("The element " + identifierType.lowerFirst + " matches this element and " + (matchedElementIds.length - 1) + " other(s).");
                            }
                            else {
                                $(".selector-message").html("The element " + identifierType.lowerFirst + " matches this element uniquely");
                            }
                        }
                        else if(err) {
                            $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                            $(".selector-message").html("Invalid Selector...");
                        }
                        else {
                            $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                            $(".selector-message").html("The element " + identifierType.lowerFirst + " entered doesn't match this element!");
                        }
                    });
                });

                for(i in typeArr) {
                    if(typeArr.hasOwnProperty(i)) {
                        optn = $('<li><a href="#">' + typeArr[i].ucFirst+ '</a></li>').appendTo(selectorsDropdown);
                        opt  = optn.find("a");

                        opt.click(function () { // jshint ignore:line
                            var val;

                            identifierType = $(this).text();
                            val = e[identifierType.lowerFirst] || "Null";
                            $input.val(val).attr("value", val);

                            $testBtn.trigger("click");
                            $(".selector-btn").html(identifierType.ucFirst + ' <span class="caret"></span>');

                        }); // jshint ignore:line

                        if(!triggeredFirst) triggeredFirst = true;
                    }
                }
                soda.editor.setContext(
                    {
                        header      : "Add " + type + "?",
                        body        : bodyHtml,
                        okayText    : "Add Action",
                        cancelText  : "No, Cancel",
                        onOkay      : function () {
                            soda.editor.switchToToolbox("test-editor", function () {
                                finish(ui, rawType, group, e, $input, keys, elemental, { using: identifierType.lowerFirst, assert: $input.val() });
                            });
                        }
                    }
                );

                bodyHtml.append('<br><label class="selector-label">Enter a value and select an element property...</label>');
                bodyHtml.append(selectors);
                bodyHtml.append('<p class="selector-message">Press the test button to test the selector against the current DOM tree</p>');
            }
            else {
                soda.editor.setContext(
                    {
                        header      : "Add " + type + "?",
                        body        : bodyHtml,
                        okayText    : "Add Action",
                        cancelText  : "No, Cancel",
                        onOkay      : function () {
                            soda.editor.switchToToolbox("test-editor", function () {
                                if(rawType === "widget") {
                                    var prefill    = {},
                                        prefillArr = ui.draggable.attr("data-prefill") ? ui.draggable.attr("data-prefill").split(":") : null,
                                        list       = soda.testEditor.$currentList.attr("data-type") === "test" ? "test" : soda.testEditor.$currentList.attr("data-type") === "action" ? "action" : "test";

                                    if(prefillArr instanceof Array) {
                                        prefillArr.forEach(function (item, key) {
                                            if(keys[key]) prefill[keys[key]] = item;
                                        });
                                    }

                                    var vars        = ui.draggable.attr("data-vars") ? ui.draggable.attr("data-vars").split(":VAR:") : [],
                                        varDesc     = ui.draggable.attr("data-var-desc") ? ui.draggable.attr("data-var-desc").split(":DESC:") : [],
                                        varDefaults,
                                        body        = $("<div></div>"),
                                        desc        = "";

                                    if(ui.draggable.attr("data-def")) {
                                        varDefaults = JSON.parse(ui.draggable.attr("data-def"));
                                    }
                                    else {
                                        varDefaults = [];
                                    }

                                    for(var i in vars) {
                                        if(vars.hasOwnProperty(i)) {
                                            if(varDesc[i]) {
                                                desc = "<div class=\"widget-var-desc\">" + varDesc[i] + "</div>";
                                            }
                                            else {
                                                desc = "<div class=\"widget-var-desc\"><span class=\"emphasis\">No description</span></div>";
                                            }

                                            var inputType = "";
                                            if(varDefaults[i] !== undefined && varDefaults[i] !== null) {
                                                if(varDefaults[i] instanceof Array) {
                                                    inputType = '<select class="widget-variable" data-var="' + vars[i] + '" data-value="' + varDefaults[i][0] + '">';
                                                    for(var k in varDefaults[i]) {
                                                        if(varDefaults[i].hasOwnProperty(k) && (typeof varDefaults[i][k] === "string" || typeof varDefaults[i][k] === "number" || typeof varDefaults[i][k] === "boolean")) {
                                                            inputType += '<option value="' + varDefaults[i][k].toString() + '">' + varDefaults[i][k].toString() + '</option>';
                                                        }
                                                    }
                                                    inputType += "</select>";
                                                }
                                                else {
                                                    inputType = '<input class="widget-variable" type="text" data-var="' + vars[i] + '" value="' + varDefaults[i] + '"></input>';
                                                }
                                            }
                                            else {
                                                inputType = '<input class="widget-variable" type="text" data-var="' + vars[i] + '"></input>';
                                            }

                                            $('<div><label class="widget-var-label">Value for <span class="emphasis">' + vars[i] + '</span></label>' + desc + inputType + '</div>').appendTo(body);
                                        }
                                    }

                                    if(vars.length > 0) {
                                        soda.editor.setContext({
                                            header: "Enter widget variables",
                                            body  : body,
                                            onOkay: function () {
                                                var $vars = body.find(".widget-variable");

                                                $vars.each(function () {
                                                    var val = $(this).val();
                                                    try {
                                                        val = JSON.parse(val);
                                                    }
                                                    catch(e) { /* No op */ }
                                                    finish(ui, list, "store", null, null, ["store", "as"], false, { as: $(this).attr("data-var"), store: val });
                                                });
                                                finish(ui, list, group, e, $input, keys, false, prefill);
                                            }
                                        });
                                    }
                                    else {                                        
                                        finish(ui, list, group, e, $input, keys, false, prefill);
                                    }
                                }
                                else {
                                    finish(ui, rawType, group, e, $input, keys, elemental, null);
                                }
                            });
                        }
                    }
                );
            }
        }
    }

    function onDraggableReset () {
        $(this).html(""); // jshint ignore:line
        lockDraggable = false;
        soda.editor.hideContext();
    }

    function onDropOver (e, ui) {
        e.stopPropagation();
        $(".droppable-icon-wrapper").parent().html("");

        var rawType  = ui.draggable.attr("data-type"),
        icon = null;

        if (rawType === "draggable") {
          icon = "fa-ban";
        }
        else {
          icon = (ui.draggable.attr("data-type") === "action" || ui.draggable.attr("data-type") === "test") ? "fa-bolt" : ui.draggable.attr("data-type") === "widget" ? "fa-puzzle-piece" : "fa-bullseye";
        }

        $(this) // jshint ignore:line
            .html('<div class="droppable-icon-wrapper"><em class="droppable-icon-for-screen-element ' + icon + ' fa"></em></div>')
            .css("color", soda.screen.getColorSchemeForElement(self.getElementWithWid($(this).attr("data-id"))).dark); // jshint ignore:line
    }

    /**
     * Generates a list of selectors for the given element "e"
     * @param  {object} e The element to generate selectors for
     * @param  {object} exclude An object with keys of selector types to exclude from the selector list
     * @return {Array} A list of element selectors
     */
    function generateSelectorsForElement (e, exclude) {
        exclude = exclude  || {};
        var selectors       = [],
            parentSelectors = [];

        if(e.name  && !exclude.name  ) selectors.push(".{" + e.name  + "}");
        if(e.id    && !exclude.id    ) selectors.push("#{" + e.id    + "}");
        if(e.label && !exclude.label ) selectors.push("^{" + e.label + "}");
        if(e.value && !exclude.value ) selectors.push("@{" + e.value + "}");

        selectors.sort(function (a, b) {
            return a < b ? 1 : a > b ? -1 : 0;
        });

        if(e.parent && e.parent.id && elementsById[e.parent.id] && Selectors[e.parent.id]) {
            $.each(Selectors[e.parent.id], function (k, v) {
                if(parentSelectors.length > SodaSettings.MAX_SELECTORS) return false;

                $.each(selectors, function (k2, v2) {
                    if(
                        v && v2                                &&
                        !(exclude.name  && (/\.{.*?}/g).test(v)) &&
                        !(exclude.label && (/\^{.*?}/g).test(v)) &&
                        !(exclude.value && (/@{.*?}/g ).test(v)) &&
                        !(exclude.id    && (/#{.*?}/g ).test(v))
                    ) {
                        parentSelectors.push(v + " " + v2);
                    }
                });
            });
        }
        return selectors.concat(parentSelectors);
    }

    /**
     * Alias for private verison
     * @type {Function}
     */
    this.generateSelectorsForElement = generateSelectorsForElement;

    /**
     * Builds the left-toolbox element tree recursively
     * @param  {object} tree The tree to iterate over
     * @param  {jQuery} parent The parent to the current "tree"
     * @param  {jQuery} $parent The parent jQuery element to the current tree
     * @param  {Array<jQuery>} parents An array ofJQuery parent elements
     * @param  {number} level The level of the current tree in relation to the initial tree
     * @return {undefined}
     */
    function buildElementTree (tree, parent, $parent, parents, level) {

        $parent = $parent || $tree.hierarchy;
        parents = parents || [];
        level   = ++level || 0;

        parents.push($parent);

        for(var i in tree) {
            if(tree.hasOwnProperty(i)) {
                var e            = tree[i],
                    $e           = $tree.elementTemplate.clone(),
                    $eInfo       = $e.children(".tree-element-info"),
                    $eInfoSticky = $eInfo.children(".sticky-element"),
                    hasChildren  = Object.keys(e.children).length !== 0;

                e.wid = wids++;
                $e.attr("data-wid"  , e.wid);
                $e.attr("data-eid"  , e.id);

                elements[e.wid] = elementsById[e.id] = e;
                Selectors[e.id] = generateSelectorsForElement(e);

                $e.addClass("level-" + level);
                $eInfo.children(".tree-element-id").text(e.id);

                if(level === 0) {
                    $e.addClass("root");
                }
                else if(hasChildren){
                    $e.addClass("branch");
                }
                else {
                    $e.addClass("leaf");
                }

                if(hasChildren) {
                    $eInfo.children(".tree-element-icon")
                        .removeClass("fa-leaf")
                        .addClass("fa-caret-right");

                    var parentsClone = [];
                    for(var n = 0; n < parents.length; n++) parentsClone.push(parents[n]);
                    buildElementTree(e.children, e, $e.children(".tree-element-children"), parentsClone, level);
                }
                else {
                    $e.removeClass("expandable-parent");
                }

                var elementOnHover = self.treeElementOnHover(e),
                    $screenElement;

                if(e.visible) {
                    $screenElement = soda.screen.createElementBoxForElement(e);
                    $screenElement.click(expandParents(parents));
                    $screenElement.click(toggleHoverBoxTacked($eInfoSticky, e));
                    $screenElement.hover(elementOnHover);

                    $screenElement.droppable({
                        greedy  : true,
                        drop    : onActionDropped,
                        out     : onDraggableReset,
                        over    : onDropOver,
                        reset   : onDraggableReset,
                        activate: onDraggableReset,
                        tolerance: "pointer"
                    });
                }

                $eInfo.hover(elementOnHover);
                $eInfo.hover(animateHoverBox(e));
                $eInfoSticky.click(toggleHoverBoxTacked($eInfoSticky, e));
                $e.appendTo($parent);
                e.__soda_parents = parents;

                if(e.wid === 0) $eInfo.trigger("mouseout");
            }
        }
    }

    /**
     * Returns an element with the given web-id (not element id)
     * @param  {number} wid The web id of the element to retrieve
     * @return {object} The screen element with web-id "wid", or null if non-existent
     */
    this.getElementWithWid = function (wid) {
        return elements[wid] || null;
    };

    /**
     * Returns an element with the given element id
     * @param  {number} id The id of the element to retrieve
     * @return {object} The screen element with web-id "wid", or null if non-existent
     */
    this.getElementWithId = function (id) {
        return elementsById[id] || null;
    };

    /**
     * Builds the element tree and left-hand tree toolbox
     * @param  {object} treeObject The tree object, as provided by the server
     * @param  {Function} done A callback for completion
     * @return {SodaTree} The current SodaTree instance
     */
    this.build = function (treeObject, done) {
        elements     = {};
        elementsById = {};
        Selectors    = {};

        $("#screen-elements").empty();
        $tree.hierarchy.empty();

        $tree.self.find(".soda-tree-hash").html(treeObject.hash);

        if(!treeObject) {
            soda.framework.getTree(function (err, treeObject) {
                if(err) return console.error(err);
                buildElementTree(treeObject.contents);
                if(done instanceof Function) done.call(self);
            });
        }
        else {
            buildElementTree(treeObject.contents);
        }

        if(done instanceof Function) done.call(self);
        return self;
    };
};
