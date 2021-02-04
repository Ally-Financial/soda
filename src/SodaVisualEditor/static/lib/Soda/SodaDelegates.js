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
 * jQuery delegate callbacks for the Soda VisualEditor
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 */
window.SodaDelegates = function (soda) {

        /**
         * @associates SodaSettings
         * @type {SodaSettings}
         */
    var SodaSettings  = window.SodaSettings,

        SodaEmitter   = window.SodaEmitter,
        self          = this,

        searchTimeout, queryTimeout;

    // Inherit from the SodaEmitter class
    SodaEmitter.call(self);

    /**
     * Holds stashed screen elements
     * @type {Array}
     */
    this.stashed = [];

    $("body").on("click", ".action-list-group", function () {
        $(this).find(".action-list-group-actions").slideToggle();
    });

    var suiteChangeTimeout  = null,
        moduleChangeTimeout = null;

    $("body").on("change", ".dynamic-suite", function () {
        clearTimeout(suiteChangeTimeout);
        var val = $(this).val();
        suiteChangeTimeout = setTimeout(function () { soda.framework.updateConfig("suite", val); }, 100);
        $(this).siblings(".dynamic-module").trigger("change");
    });

    $("body").on("change", ".dynamic-module", function () {
        clearTimeout(moduleChangeTimeout);
        var val = $(this).val();
        moduleChangeTimeout = setTimeout(function () { soda.framework.updateConfig("module", val); }, 100);
    });

    /**
     * Re-attach stashed elements
     */
    $("body").keyup(function (e) {
        if(e.ctrlKey || e.metaKey) {
            switch(e.keyCode) {
                case 82: // 'r'
                    self.stashed.forEach(function ($e) {
                        $e.appendTo($("#screen-elements"));
                    });
                    self.stashed = [];

                    soda.editor.setStatus({
                        which   : "left",
                        message : "Element stash emptied.",
                        icon    : "fa-info-circle"
                    });
                    break;

                case 32: // 'space'
                    $("#soda-refresh-button").trigger("click");
                    break;

                case 73: // 'i'
                    $("#soda-download-screen-button").trigger("click");
                    break;

                case 68: // 'd'
                    $("#soda-download-tree-button").trigger("click");
                    break;

                case 71: // 'g'
                    soda.testEditor.$currentList.parent().find(".action-menu-generate-list").trigger("click");
                    break;

                case 76: // 'l'
                    soda.testEditor.$currentList.parent().find(".action-menu-download-list").trigger("click");
                    break;

                case 83: // 's'
                    soda.testEditor.$currentList.parent().find(".action-menu-save-list").trigger("click");
                    break;

                case 67: // 'c'
                    soda.testEditor.$currentList.parent().find(".action-menu-clear-list").trigger("click");
                    break;

                case 88: // 'x'
                    soda.editor.switchToToolbox("console");
                    break;

                case 69: // 'e'
                    soda.editor.switchToToolbox("test-editor");
                    break;

                case 80: // 'p'
                    soda.editor.switchToToolbox("element-inspector");
                    break;

                case 65: // 'a'
                    soda.editor.switchToToolbox("actions-manager");
                    break;

                case 66: // 'b'
                    $("#soda-download-scripts-button").trigger("click");
                    break;

                case 84: // 't'
                    soda.editor.switchToToolbox("dom-tree");
                    break;

                case 85: // 'u'
                    soda.editor.switchToToolbox("test-runner");
                    break;

                case 72:  // 'h'
                case 191: // '?'
                    soda.editor.switchToToolbox("help");
                    break;

                case 74: // 'j'
                    soda.editor.switchToToolbox("project-manager");
                    break;

                case 90: // 'z'
                    soda.editor.switchToToolbox("settings-manager");
                    break;

                case 79: // 'o'
                    soda.screen.toggleOutlineMode();
                    break;

                case 75: // 'k'
                    soda.testEditor.$currentList.parent().find(".action-menu-run-list").trigger("click");
                    break;

                case 70: // 'f'
                    var bodyHtml = $("<div id=\"execute-action-options-for-new-action\"></div>"),
                        suiteDD  = $("#test-editor-test-suite").clone().val($("#test-editor-test-suite").val()),
                        item     = $(document.activeElement),

                        typeDD  = $(
                            '<select class="dynamic-type">' +
                                '<option value="action" selected>action</option>' +
                                '<option value="test">test</option>' +
                                '<option value="screen">screen</option>' +
                                '<option value="menu">menu</option>' +
                                '<option value="popup">popup</option>' +
                            '</select>'
                        ),

                        moduleDD = $("#test-editor-test-module").clone().val($("#test-editor-test-module").val()),
                        actionDD = $('<select id="execute-action-options-for-new-action-action"></select>');

                    var currentAssets  = soda.projectManager.getAssetList(),
                        dynamicModules = soda.projectManager.getModuleList();

                    suiteDD  = suiteDD.appendTo(bodyHtml);
                    moduleDD = moduleDD.appendTo(bodyHtml);
                    typeDD   = typeDD.appendTo(bodyHtml);
                    actionDD = actionDD.appendTo(bodyHtml);

                    var updateActions = function () {
                        var suite  = suiteDD.val(),
                            module = moduleDD.val(),
                            type   = typeDD.val();

                        actionDD.empty();
                        if(currentAssets[suite] && currentAssets[suite][module] && currentAssets[suite][module][type]) {
                            for(var i in currentAssets[suite][module][type]) {
                                if(currentAssets[suite][module][type].hasOwnProperty(i)) {
                                    $('<option value="' + currentAssets[suite][module][type][i] + '">' + currentAssets[suite][module][type][i] + '</option>').appendTo($("#execute-action-options-for-new-action-action"));
                                }
                            }

                            if(actionDD.children().length === 0) {
                                $("#soda-editor-context-button-okay").prop("disabled", true);
                            }
                            else {
                                actionDD.trigger("change");
                                $("#soda-editor-context-button-okay").prop("disabled", false);
                            }
                        }
                    };

                    typeDD.change(function () {
                        updateActions();
                    });

                    moduleDD.change(function () {
                        updateActions();
                    });

                    suiteDD.change(function () {
                        var suite = $(this).val(),
                            $moduleSelector = $(this).siblings(".dynamic-module");

                        if(dynamicModules && dynamicModules[suite]) {
                            $moduleSelector.each(function () {
                                $(this).empty();
                                for(var i in dynamicModules[suite]) {
                                    if(dynamicModules[suite].hasOwnProperty(i)) {
                                        $(this).append('<option data-sort="' + dynamicModules[suite][i] + '" value="' + dynamicModules[suite][i] + '">' + dynamicModules[suite][i] + '</option>');
                                    }
                                }
                            });
                            updateActions();
                        }
                    });

                    moduleDD.css("margin-bottom", "10px");
                    soda.editor.setContext({
                        header    : "Action Picker",
                        okayText  : "Okay",
                        cancelText: "Cancel",
                        body      : bodyHtml,

                        onInit: function () {
                            suiteDD.trigger("change");
                            moduleDD.trigger("change");
                            typeDD.trigger("change");
                        },
                        onOkay: function () {
                            if(item.hasClass("ace_text-input")) {
                                var e = item.parent().parent().attr("data-type");
                                soda.testEditor.aceEditors[e].navigateLeft(1);
                                soda.testEditor.aceEditors[e].insert(actionDD.val());
                            }
                            else if(item.is("input") || item.is("textarea") || item.attr("contenteditable") === "true") {
                                if(item.is("input")) {
                                    item.val(actionDD.val());
                                }
                                else {
                                    item.html(actionDD.val());
                                }
                            }
                        }
                    });
                    break;
                
                default:
                    break;
            }
        }
    });

    /**
     * Prevent forms from refreshing the page
     */
    $("body").on("submit", "form", function (e) {
        e.preventDefault();
    });

    /**
     * Prevent "add-item" icons from bubbling events
     */
    $("body").on("click", "i.add-key-value, i.execute-action-item, .action-list-group-actions", function (e) {
        e.stopPropagation();
    });

    /**
     * Prevent hover on refresh
     */
    $("body").on("mouseover", "#screen-loading", function (e) {
        e.stopPropagation();
    });

    /**
     * Show the test results tab on click
     */
    $("body").on("click", ".show-results-tab", function () {
        if(soda.editor && soda.editor.switchToToolbox instanceof Function)
            soda.editor.switchToToolbox("results-viewer");
    });

    /**
     * Remove elements dynamically
     */
    $("body").on("click", ".remove-el", function (e) {
        e.stopPropagation();
        $($(this).attr("data-remove")).remove();
    });

    /**
     * Empty elements dynamically
     */
    $("body").on("click", ".empty-el", function (e) {
        if($(this).attr("data-propagate") === "false") e.stopPropagation(); // jshint ignore:line
        var $self = $(this);

        var confirm    = $(this).attr("data-confirm"),
            confirmMsg = $(this).attr("data-confirm-message");

        if(!confirm) {
            $($(this).attr("data-empty")).empty();
        }
        else {
            soda.editor.setContext(
                {
                    header     : "Are you sure?...",
                    body       : $("<p>" + (confirmMsg || "Are you sure?") + "</p>"),
                    okayText   : "Yes",
                    cancelText : "No",
                    onOkay     : function () {
                        $($self.attr("data-empty")).empty();
                    }
                }
            );
        }
    });

    /**
     * Select all text on contenteditable field on click
     */
    $("body").on("click", ".toolbox-value, .attribute-value, .attribute-key", function (e) {
        e.stopPropagation();
        if(this !== document.activeElement) $(this).selectText();
    });

    /**
     * Select all text on contenteditable field on focus
     */
    $("body").on("focus", ".toolbox-value, .attribute-value, .attribute-key", function () {
        $(this).selectText();
    });

    /**
     * When a tree element is clicked, prevent event propagation on parent elements
     */
    $("body").on("click", ".tree-element, .project-element, .expandable-item, .f-new", function (e) {
        e.stopPropagation();
    });

    /**
     * When a tree element is clicked, prevent event propagation on parent elements
     */
    $("body").on("contextmenu", ".screen-element", function (e) {
        e.preventDefault();
        var $e = $(this).detach(), el;

        $("#element-hover-box")
            .css("background-color", "transparent")
            .css("border-color", "transparent")
            .css("top",  0)
            .css("left", 0);

        soda.screen.hoverBoxTacked = false;
        $(".fa-thumb-tack.sticky-element").removeClass("active");

        self.stashed.push($e);
        el = soda.tree.getElementWithWid($e.attr("data-id"));
        soda.editor.setStatus({
            which   : "left",
            message : "Element <span class=\"bold\">" + (el ? el.id + " " : " ") + "</span>stashed! " + self.stashed.length + " element(s) now stashed.",
            icon    : "fa-warning"
        });
    });

    /**
     * Clear results fields when the "x" is clicked
     */
    $("body").on("click", ".search-close", function () {
        $(this).siblings("input").val("").trigger("keyup");

        if($(this).siblings().attr("id") === "action-search-addon") {
          $(".action-list-group-actions").children().show();
          $(".action-list-group").show();
        }

    });

    /**
     * Dynamic screen element hovering
     */
    $("body").on("mouseover", ".hover-to-element", function () {
        var element = $(this).attr("data-hover-to-element");
        if(element) {
            var e = soda.tree.getElementWithWid(element);
            if(e) {
                soda.tree.treeElementOnHover(e)();
                soda.tree.animateHoverBox(e);
            }
        }
    });

    /**
     * Empty an element when the '.clear-wrapper' element is clicked
     */
    $("body").on("click", ".clear-wrapper", function () {
        $($(this).attr("data-wrapper")).empty();
    });

    $("body").on("keydown", ".tree-filter", function () {
        if(queryTimeout) clearTimeout(queryTimeout);
    });


    /**
     * Query the tree
     */
    $("body").on("keyup", ".tree-filter", function () {
        var $searchBox = $(this);
        if(queryTimeout) clearTimeout(queryTimeout);

        if($searchBox.val() && $searchBox.val().length > 0) {
            queryTimeout = setTimeout(function () {
                var filterBy = $searchBox.val(),
                    filter   = $searchBox.attr("data-filter"),
                    title    = $searchBox.attr("data-title");

                /**
                 * Emitted just before a tree filter is started
                 * @event window.SodaDelegates#[filter title] before
                 */
                self.emit(title + " before");

                soda.framework.queryTree("selector", filterBy, function (err, elementIds) {
                    if(err) return console.error(err);

                    $(filter).each(function () {
                        if(!$(this).attr("data-filtered-by")) {
                            if(self.listenerCount(title) > 0) {
                                /**
                                 * Emitted when a tree filter is filtering of tree elements (each time an element is being filtered)
                                 * @event window.SodaDelegates#[filter title]
                                 */
                                return self.emit(title, filterBy, $(this), elementIds);
                            }
                            else {
                                var passed = elementIds.indexOf($(this).attr("data-eid")) === -1 ? false : true;
                                return passed ? $(this).show() : $(this).hide();
                            }
                        }
                    });

                    /**
                     * Emitted when a tree filter has completed it's filtering of tree elements
                     * @event window.SodaDelegates#[filter title] after
                     */
                    self.emit(title + " after");
                });
            }, 500);
        }
    });

    $("body").on("keydown", ".search-filter", function () {
        if(searchTimeout) clearTimeout(searchTimeout);
    });

    /**
     * Dynamic searching using HTML data attributes
     */
    $("body").on("keyup", ".search-filter", function () {
        var $searchBox = $(this);
        if(searchTimeout) clearTimeout(searchTimeout);

        if($searchBox.val() && $searchBox.val().length > 2) {
            searchTimeout = setTimeout(function () {
                if($searchBox.attr("id") === "action-search-input") {
                    $(".action-list-group-actions").slideDown();
                    $(".action-list-group").show();
                }

                var filterBy = $searchBox.val(),
                    filter   = $searchBox.attr("data-filter"),
                    title    = $searchBox.attr("data-title"),
                    using    = $searchBox.attr("data-filter-using");

                    /**
                     * Emitted just before a search search is started
                     * @event window.SodaDelegates#[search title] before
                     */
                    self.emit(title + " before");
                    var passed;

                    $(filter).each(function () {
                        if(!$(this).attr("data-filtered-by")) {
                            if(self.listenerCount(title) > 0) {
                                /**
                                 * Emitted for every element being examined in a search
                                 * @event window.SodaDelegates#[search title] before
                                 */
                                return self.emit(title, filterBy, $(this));
                            }
                            else {
                                if(using) {
                                    var $searchItems = $(this).find(using);
                                    passed = ($searchItems.text().search(new RegExp(filterBy, "i")) < 0) ? false : true;
                                    return passed ? $(this).show() : $(this).hide();
                                }
                                else {
                                    passed = ($(this).text().search(new RegExp(filterBy, "i")) < 0) ? false : true;
                                    return passed ? $(this).show() : $(this).hide();
                                }
                            }
                        }
                    });

                    /**
                     * Emitted after a search search is finished
                     * @event window.SodaDelegates#[search title] after
                     */
                    self.emit(title + " after");
            }, 500);
        }
    });

    /**
     * Dynamic element filtering using HTML data attributes
     */
    $("body").on("change", ".category-filter", function () {
        var $select  = $(this),
            filterBy = $select.val(),
            filter   = $select.attr("data-filter"),
            name     = $select.attr("data-name"),
            match    = $select.attr("data-selector");

        if($select.attr("data-parent")) $select.siblings("select").val("all").trigger("change");
        $(this).parent().find(".search-filter").val("").trigger("keyup");

        $(filter).each(function () {
            if((filterBy === "all" || filterBy === "") && ($(this).attr("data-filtered-by") === name || !$(this).attr("data-filtered-by"))) {
                $(this).show();
                if($(this).attr('data-filtered-by') === name) $(this).removeAttr("data-filtered-by");
            }
            else if($(this).attr("data-filtered-by") === name || !$(this).attr("data-filtered-by")) {
                var $info = $(this).find(match);
                if($info.text() !== filterBy) {
                    $(this)
                        .hide()
                        .attr("data-filtered-by", name);
                }
                else {
                    $(this).show();
                    if($(this).attr('data-filtered-by') === name) $(this).removeAttr("data-filtered-by");
                }
            }
        });
    });

    /**
     * Dynamic parent/child tree visiblity using classes
     */
    $("body").on("click", ".expandable-parent", function (e) {
        e.stopPropagation();
        var expanded = $(this).hasClass("expanded"),
            $icon    = $(this).children(".element-info").children("i.expandable-icon");

        if(expanded) {
            if($icon.hasClass("fa-caret-down")) {
                $icon
                    .removeClass("fa-caret-down")
                    .addClass("fa-caret-right");
            }
            else if($icon.hasClass("fa-folder-open")) {
                $icon
                    .removeClass("fa-folder-open")
                    .addClass("fa-folder");
            }

            $(this)
                .removeClass("expanded")
                .children(".expandable-child")
                .hide();
        }
        else {
            if($icon.hasClass("fa-caret-right")) {
                $icon
                    .removeClass("fa-caret-right")
                    .addClass("fa-caret-down");
            }
            else if($icon.hasClass("fa-folder")) {
                $icon
                    .removeClass("fa-folder")
                    .addClass("fa-folder-open");
            }

            $(this)
                .addClass("expanded")
                .children(".expandable-child")
                .show();
        }
    });

    /**
     * Dynamic "tabs" using HTML data attributes
     */
    $("body").on("click", ".btn-group-toggle button", function () {
        var group = $(this).attr("data-group"),
            show  = $(this).attr("data-show"),
            type  = $(this).attr("data-type");

        var $children = $(group).children(),
            $eToShow  = $(show);

        $(this).siblings().removeClass("active");
        $(this).addClass("active");

        /**
         * Emitter when a tab is changed
         * @event window.SodaDelegates#change [tab group]
         */
        self.emit("change " + group, show, group);

        if($children.length > 0 && $eToShow.length > 0 && !$eToShow.is(":visible")) {
            $children.not($eToShow).hide();

            /**
             * Emitter after a tab has been changed and has been show (animation complete)
             * @event window.SodaDelegates#post show [tab group]
             */
            self.emit("pre show " + group, show, group);

            $eToShow.fadeIn(SodaSettings.FADEIN_SPEED, function () {
                /**
                 * Emitter after a tab has been changed and has been show (animation complete)
                 * @event window.SodaDelegates#post show [tab group]
                 */
                self.emit("post show " + group, show, group);
            });

            if(type) {
                if(type === "widget") {
                    if(soda.testEditor.$currentList.attr("data-type") !== "action")
                        soda.testEditor.switchToTab("test");
                }
                else {
                    soda.testEditor.switchToTab(type);
                }
            }
        }
    });

    /**
     * Generate list
     */
    $("body").on("click", ".action-menu-generate-list", function () {
        var type = $(this).attr("data-type") || "screen";
        soda.editor.setContext(
            {
                header      : "Generate " + type.ucFirst + "?",
                body        : soda.testEditor.$generateScreenForm,
                okayText    : "Generate",
                cancelText  : "Forget It",
                onOkay      : function () {
                    soda.editor.setStatus({
                        which: "left",
                        message: "Generating " + type.ucFirst + '<span class="dot-dot-dot">...</span>'
                    });

                    soda.testEditor.generateScreen(type, function () {
                        soda.editor.setStatus({
                            which: "left",
                            message: type.ucFirst + " generation complete!"
                        });
                    });
                }
            }
        );
    });

    /**
     * Change the selected button on the Generate Screen form for headings "Prefer" and "Cardnality"
     */
    $("body").on("click", "#generate-prefer .btn, #generate-cardnality .btn", function () {
        $(this).closest(".btn-toolbar").attr("data-value", $(this).attr("data-value"));
        $(this).siblings().removeClass("btn-yellow");
        $(this).addClass("btn-yellow");
    });

    /**
     * Toggle the selected button on the Generate Screen form for headings "Omit" and "Attributes"
     */
    $("body").on("click", "#generate-omit .btn, #generate-attributes .btn", function () {
        var val,
            thisVal = $(this).attr("data-value"),
            toolBar = $(this).closest(".btn-toolbar");

        try {
            val = JSON.parse(toolBar.attr("data-value"));
        }
        catch (e) {
            val = {};
        }

        if($(this).hasClass("btn-yellow")) {
            $(this).removeClass("btn-yellow");
            if(val[thisVal]) delete val[thisVal];
        }
        else {
            $(this).addClass("btn-yellow");
            val[thisVal] = true;
        }

        try {
            toolBar.attr("data-value", JSON.stringify(val));
        }
        catch (e) {
            toolBar.attr("data-value", JSON.stringify({}));
        }
    });

    /**
     * Run an action from the Project Hierarchy manager (e.g. when the play button is clicked on an asset)
     */
    $("body").on("click", ".project-menu-run-action", function () {
        var action, type, $self = $(this), asset, path, meta;

        type     = $self.attr("data-asset-type") || "action";
        path     = $self.attr("data-path");

        asset    = {
            name     : $self.attr("data-asset-name"),
            suite    : $self.attr("data-asset-suite"),
            module   : $self.attr("data-asset-module"),
            platform : $self.attr("data-asset-platform"),
            type     : type
        };

        // Read the action file from disk
        soda.send("read asset", asset, function (err, contents) {
            console.log(contents)
            if(err) {
                soda.editor.setContext(
                    {
                        header      : "Oops...",
                        body        : $("<p>Something went wrong... unable to read asset " + path + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
            else {
                try {
                    // Get the action's meta data
                    meta = typeof contents.meta === "object" ? contents.meta : {};
                    if(typeof meta.syntax !== "object") meta.syntax = {};

                    // Grab the actual actions, according to the action type
                    switch(type) {
                        case "action":
                        case "test":
                            contents = contents.actions;
                            break;

                        default:
                            contents = typeof contents[type] === "object" ? contents[type].components : null;
                    }

                    if(!(contents instanceof Array)) throw new Error("Malformed action.");

                    // Generate an action
                    action = soda.testEditor.generateActionObject(
                        type,
                        contents,
                        {
                            name        : meta.name        || "Soda VisualEditor " + type.ucFirst,
                            id          : meta.id          || "N/A",
                            description : meta.description || "Soda VisualEditor " + type.ucFirst,
                            syntax: {
                                name    : meta.syntax.name    || soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                                version : meta.syntax.version || soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                            }
                        }
                    );

                    // The action is valid, execute it
                    if(action) {
                        soda.editor.switchToToolbox("console");
                        soda.testEditor.executeAction(type, action, null, false);
                    }
                    // There were no action items in the action
                    else {
                        soda.editor.setContext(
                            {
                                header      : "Oops...",
                                body        : $("<p>This action is empty! Unable to run an empty action...</p>"),
                                okayText    : "Okay",
                                omitCancel  : true
                            }
                        );
                    }
                }
                catch(err) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong...",
                            body        : $("<p>This action is corrupt and cannot be run.</p><p>Error: " + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
            }
        });
    });

    /**
     * Run an action from the Action Run Menu
     */
    $("body").on("click", ".action-menu-run-list", function () {
        var contents, action, type, listInfo = soda.testEditor.getInfoFromCurrentList();
        type = soda.testEditor.$currentList.attr("data-type") || "action";

        if($(".editor-toggle." + type).attr("data-active") === "true") {
            var json = soda.testEditor.aceEditors[type].getValue();

            try {
                action = JSON.parse(json.trim());
            }
            catch (e) {
                soda.editor.setContext(
                    {
                        header      : "JSON Syntax Error",
                        body        : $("<p><span class=\"bold\">Your JSON is invalid.</span><br>Please fix any syntax errors before saving.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
                return;
            }

            soda.editor.switchToToolbox("console");
            soda.testEditor.executeAction(type, action, null, true);
        }
        else {
            type     = soda.testEditor.$currentList.attr("data-type") || "action";
            contents = soda.testEditor.getActionObjectFromCurrentList();

            try {
                action = soda.testEditor.generateActionObject(
                    type,
                    contents,
                    {
                        name        : listInfo.name        || "Soda VisualEditor " + type.ucFirst + " List",
                        id          : listInfo.id          || "N/A",
                        description : listInfo.description || "Soda VisualEditor " + type.ucFirst + " List",
                        syntax: {
                            name    : listInfo.syntax.name    || soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                            version : listInfo.syntax.version || soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                        }
                    }
                );

                if(action) {
                    soda.editor.switchToToolbox("console");
                    soda.testEditor.executeAction(type, action, null, true);
                }
                else {
                    soda.editor.setContext(
                        {
                            header      : "Oops...",
                            body        : $("<p>The " + type + " list is empty! Try adding some actions before executing it.</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
            }
            catch(err) {
                soda.editor.setContext(
                    {
                        header      : "Something went wrong...",
                        body        : $("<p>This list has become corrupt. Try clearing it, then adding new actions.</p><p>Error: " + err.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
    });

    /**
     * Toggle the radio fields on the Save Action dialog
     */
    $("body").on("click", "input[name='save-action-make-generic-value']", function () {
        var $inputField = $("#save-file-filename"),
            inputVal    = $inputField.val(),
            fnRegExp    = new RegExp("\\." + soda.framework.platform + "$", 'i');

        if($(this).val() === "generic") {
            if(fnRegExp.test(inputVal)) {
                inputVal = inputVal.replace(fnRegExp, '');
                $inputField.val(inputVal).attr("value", inputVal).trigger("keyup");
            }
        }
        else {
            if(!fnRegExp.test(inputVal)) {
                inputVal += "." + soda.framework.platform;
                $inputField.val(inputVal).attr("value", inputVal).trigger("keyup");
            }
        }
    });

    /**
     * When the "Save List" link is clicked (for its respective action type)
     */
    $("body").on("click", ".action-menu-save-list", function () {
        var contents, action, type, listInfo = soda.testEditor.getInfoFromCurrentList(), customText;
        type = soda.testEditor.$currentList.attr("data-type") || "action";

        if($(".editor-toggle." + type).attr("data-active") === "true") {
            var json = soda.testEditor.aceEditors[type].getValue();

            try {
                contents = JSON.parse(json.trim());
            }
            catch (e) {
                soda.editor.setContext(
                    {
                        header      : "JSON Syntax Error",
                        body        : $("<p><span class=\"bold\">Your JSON is invalid.</span><br>Please fix any syntax errors before saving.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
                return;
            }

            if(typeof contents === "object" && typeof contents.meta === "object" && typeof contents.meta.name === "string") {
                var name = contents.meta.name.replace(/\.json$/, '').split(".");

                listInfo = {
                    name        : name[name.length - 1],
                    id          : typeof contents.meta.id === "string" ? contents.meta.id : "@todo:id",
                    description : typeof contents.meta.description === "string" ? contents.meta.description : "@todo:description",

                    syntax : listInfo.syntax,
                    suite  : listInfo.suite,
                    module : listInfo.module
                };

                customText = "<div style=\"margin-bottom: 5px;\">" + type.ucFirst + " will be saved to suite <span class=\"bold\">" + listInfo.suite + "</span> and module <span class=\"bold\">" + listInfo.module + "</span>.";
                customText += '<div id="save-action-make-generic" style="margin-bottom:10px;">' +
                    'Is this test... <input type="radio" name="save-action-make-generic-value" value="generic" checked>Generic <span style="padding:0 5px; font-weight:bold;">or</span><input type="radio" name="save-action-make-generic-value" value="specific">For ' + soda.framework.platform + ' only</div></div>';

                var asset = {
                    name     : listInfo.name,
                    platform : (name[1] || "generic"),
                    type     : type,
                    suite    : listInfo.suite,
                    module   : listInfo.module,
                    contents : json
                };
                soda.editor.writeAsset(asset, customText);
            }
            else {
                soda.editor.setContext(
                    {
                        header      : "Asset Syntax Error",
                        body        : $("<p><span class=\"bold\">Your asset structure is invalid.</span><br>You're missing a required \"meta\" key field.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
        else {
            contents = soda.testEditor.getActionObjectFromCurrentList();
            var widgetItem;
            try {
                widgetItem = JSON.parse($("#test-editor-" + type + "-wrapper").attr("data-add-widget"));
            }
            catch (e) { /* No Op */ }

            action = soda.testEditor.generateActionObject(
                type,
                contents,
                {
                    name        : listInfo.name        || "unnamed_" + type,
                    id          : listInfo.id          || "@todo:id",
                    description : listInfo.description || "@todo:description",
                    syntax: {
                        name    : listInfo.syntax.name    || soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                        version : listInfo.syntax.version || soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                    },
                    widget: widgetItem
                }
            );

            customText = "<div style=\"margin-bottom: 5px;\">" + type.ucFirst + " will be saved to suite <span class=\"bold\">" + listInfo.suite + "</span> and module <span class=\"bold\">" + listInfo.module + "</span>.";
            customText += '<div id="save-action-make-generic" style="margin-bottom:10px;">' +
                'Is this test... <input type="radio" name="save-action-make-generic-value" value="generic" checked>Generic <span style="padding:0 5px; font-weight:bold;">or</span><input type="radio" name="save-action-make-generic-value" value="specific">For ' + soda.framework.platform + ' only</div></div>';

            soda.testEditor.downloadAction(type, action, function (err, filename, file, jsonString) {
                if(err) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong...",
                            body        : $("<p>Unable to save action list at this time. Try again later.</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
                else {
                    var name = listInfo.name.replace(/\.json$/, '').split(".");
                    var asset = {
                        name     : name[0]  || "unnamed_" + type,
                        platform : (name[1] || "generic"),
                        type     : type,
                        suite    : listInfo.suite,
                        module   : listInfo.module,
                        contents : jsonString
                    };
                    soda.editor.writeAsset(asset, customText);
                }
            }, true);
        }
    });

    /**
     * When the "Download List" link is clicked (for its respective action type)
     */
    $("body").on("click", ".action-menu-download-list", function () {
        var contents, action, type, listInfo, $self = $(this);
        type = soda.testEditor.$currentList.attr("data-type") || "action";

        if($(".editor-toggle." + type).attr("data-active") === "true") {
            var filename = "unnamed_" + type, json, file;
                json = soda.testEditor.aceEditors[type].getValue().trim();

            try {
                file = "data:text/json;charset=utf-8," + encodeURIComponent(json);
                contents = JSON.parse(json);
                if(typeof contents === "object" && typeof contents.meta === "object" && contents.meta.name === "string") filename = contents.meta.name;
                $self.attr('href', file);
                $self.attr('target', '_blank');
                $self.attr('download', filename + ".json");
            }
            catch (e) {
                $self.removeAttr('href');
                $self.removeAttr('target');
                $self.removeAttr('download');
                soda.editor.setContext(
                    {
                        header      : "JSON Syntax Error",
                        body        : $("<p><span class=\"bold\">Your JSON is invalid.</span><br>Please fix any syntax errors before downloading.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
        else {
            contents = soda.testEditor.getActionObjectFromCurrentList();
            listInfo = soda.testEditor.getInfoFromCurrentList();

            var widgetItem;
            try {
                widgetItem = JSON.parse($("#test-editor-" + type + "-wrapper").attr("data-add-widget"));
            }
            catch (e) { /* No Op */ }

            try {
                action = soda.testEditor.generateActionObject(
                    type,
                    contents,
                    {
                        name        : listInfo.name        || "unnamed_" + type,
                        id          : listInfo.id          || "@todo:id",
                        description : listInfo.description || "@todo:description",
                        syntax: {
                            name    : listInfo.syntax.name    || soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                            version : listInfo.syntax.version || soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                        },
                        widget: widgetItem
                    }
                );

                if(action) {
                    soda.testEditor.downloadAction(type, action, function (err, filename, file) {
                        $self.attr('href', file);
                        $self.attr('target', '_blank');
                        $self.attr('download', filename + ".json");
                    }, true);
                }
                else {
                    soda.editor.setContext(
                        {
                            header      : "Oops...",
                            body        : $("<p>The " + type + " list is empty! Try adding some actions before downloading it.</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
            }
            catch(err) {
                soda.editor.setContext(
                    {
                        header      : "Something went wrong...",
                        body        : $("<p>This list has become corrupt. Try clearing it, then adding new actions.</p><p>Error: " + err.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
    });

    /**
     * When filenames are entered into the save file dialog, sanitize them and check for existence. If the file exists, ask to overwrite
     */
    var inputTimeout = null;
    $("body").on("keyup", "#save-file-filename", function () {
        var $self = $(this);
        clearTimeout(inputTimeout);

        inputTimeout = setTimeout(function () {
            var val          = $self.val(),
                fnRegExp     = new RegExp("\\." + soda.framework.platform + "$", 'i'),
                isNotGeneric = fnRegExp.test($self.val());

            if(isNotGeneric) {
                $("input[name='save-action-make-generic-value'][value='specific']").prop("checked", true);
            }
            else {
                $("input[name='save-action-make-generic-value'][value='generic']").prop("checked", true);
            }

            if(/[^a-zA-Z0-9_.\-]/g.test(val) === true || val === "" || !val) {
                $("#save-exists-icon").removeClass("fa-check-circle").addClass("fa-minus-circle");
                $("#save-file-modal .selector-message.filename-message").html("The chosen asset name is invalid. Asset names must match /[a-zA-Z0-9_.]/");
                $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
            }
            else {
                $("#soda-editor-context-form #soda-editor-context-button-okay").removeAttr("disabled");
                if(/\.json$/g.test(val) === true) {
                    val = val.replace(/\.json$/, '');
                    $self.val(val).attr("value", val).trigger("keyup");
                }

                $self.attr("data-asset-platform", isNotGeneric ? soda.framework.platform.toLowerCase() : "generic");
                $self.attr("data-asset-name", $self.val().split(".")[0]);

                var asset = {
                    name     : $self.attr("data-asset-name"),
                    suite    : $self.attr("data-asset-suite"),
                    module   : $self.attr("data-asset-module"),
                    platform : $self.attr("data-asset-platform"),
                    type     : $self.attr("data-asset-type")
                };

                soda.send("asset exists", asset, function (err, exists) {
                    if(exists) {
                        $("#save-exists-icon").removeClass("fa-check-circle").addClass("fa-minus-circle");
                        $("#save-file-modal .selector-message.filename-message").html("This asset already exists. If you continue, you'll have the option to overwrite it.");
                    }
                    else {
                        $("#save-exists-icon").removeClass("fa-minus-circle").addClass("fa-check-circle");
                        $("#save-file-modal .selector-message.filename-message").html("The chosen asset namespace is available.");
                    }
                });
            }
        }, 500);
    });

    /**
     * When a directory name is entered into the new directory dialog, sanitize them and check for existence.
     */
    $("body").on("keyup", "#save-directory-filename", function () {
        var $self  = $(this),
            suite  = $self.attr("data-suite"),
            type   = $self.attr("data-type"),
            verb   = type === "module" ? "module" : "suite";

        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(function () {
            var val = $self.val();

            if(/[^a-zA-Z0-9_\-]/g.test(val) === true) {
                $("#save-directory-icon").removeClass("fa-check-circle").addClass("fa-times-circle");
                $("#save-directory-modal .selector-message.directory-message").html("That " + verb + " name is invalid. " + verb.ucFirst + " names must match /[a-zA-Z0-9_\\-]/");
                $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
            }
            else if (val === "" || !val) {
                $("#save-directory-icon").removeClass("fa-check-circle").addClass("fa-times-circle");
                $("#save-directory-modal .selector-message.directory-message").html("Enter a " + verb + " name...");
                $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
            }
            else {
                $("#soda-editor-context-form #soda-editor-context-button-okay").removeAttr("disabled");

                switch(type) {
                    case "module":
                        return soda.send("module exists", { module: val, suite: suite }, function (err, exists) {
                            if(!err) {
                                if(exists) {
                                    $("#save-directory-icon").removeClass("fa-check-circle").addClass("fa-times-circle");
                                    $("#save-directory-modal .selector-message.directory-message").html("This module already exists!");
                                    $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
                                }
                                else {
                                    $("#save-directory-icon").removeClass("fa-times-circle").addClass("fa-check-circle");
                                    $("#save-directory-modal .selector-message.directory-message").html("The chosen module name is available.");
                                }
                            }
                            else {
                                $("#save-directory-modal .selector-message.filename-message").html("There was an error comminucating with the server; unable to continue.");
                                $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
                            }
                        });

                    case "suite":
                        return soda.send("suite exists", val, function (err, exists) {
                            if(!err) {
                                if(exists) {
                                    $("#save-directory-icon").removeClass("fa-check-circle").addClass("fa-times-circle");
                                    $("#save-directory-modal .selector-message.directory-message").html("This suite already exists!");
                                    $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
                                }
                                else {
                                    $("#save-directory-icon").removeClass("fa-times-circle").addClass("fa-check-circle");
                                    $("#save-directory-modal .selector-message.directory-message").html("The chosen suite name is available.");
                                }
                            }
                            else {
                                $("#save-directory-modal .selector-message.filename-message").html("There was an error comminucating with the server; unable to continue.");
                                $("#soda-editor-context-form #soda-editor-context-button-okay").attr("disabled", "disabled");
                            }
                        });
                    default:
                        break;
                }
            }
        }, 500);
    });


    /**
     * Switch between raw and interactive edit mode
     */
    $("body").on("click", ".editor-toggle", function (e) {
        e.stopPropagation();

        var $self        = $(this),
            isActive     = $self.attr("data-active") === "true",
            $icon        = $self.children("i"),
            $raw         = $self.siblings(".raw-editor"),
            $interactive = $self.siblings(".interactive-editor"),
            $outElem     = isActive ? $raw : $interactive,
            $inElem      = isActive ? $interactive : $raw;

        var type    = $self.attr("data-type").toLowerCase(), contents,
            context = { type: type };

        if(isActive) {
            try{
                contents = JSON.parse(soda.testEditor.aceEditors[type].getValue().trim());

                if(typeof contents !== "object") {
                    contents = { meta: {} };
                    contents[type] = { components: [] };
                }

                if(typeof contents.meta !== "object") contents.meta = {};

                context.name        = contents.meta.name         || "unnamed_" + type;
                context.id          = contents.meta.id           || "@todo:id";
                context.description = contents.meta.description  || "@todo:description";
                context.platform    = contents.meta.name.replace(/\.json$/, '').split(".");
                context.platform    = context.platform.length > 1 ? context.platform[context.platform.length - 1] : "generic";

                soda.testEditor.convertAssetToActions(context, contents, true, function (err) {
                    if(err) {
                        soda.editor.setContext(
                            {
                                header      : "JSON Syntax Error",
                                body        : $("<p><span class=\"bold\">Your JSON is invalid.</span><br>Please fix any syntax errors before switching back to the interactive editor.</p>"),
                                okayText    : "Okay",
                                omitCancel  : true
                            }
                        );
                    }
                    else {
                        soda.RAW_MODE = false;
                        $outElem.fadeOut(SodaSettings.FADEOUT_SPEED, function () {
                            $icon.removeClass("fa-toggle-on").addClass("fa-toggle-off");
                            $self.attr("data-active", "false").removeClass("active");
                            $inElem.fadeIn(SodaSettings.FADEIN_SPEED);
                        });
                    }
                });
            }
            catch(e) {
                soda.editor.setContext(
                    {
                        header      : "JSON Syntax Error",
                        body        : $("<p><span class=\"bold\">Your JSON is invalid.</span><br>Please fix any syntax errors before switching back to the interactive editor.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
        else {

            var widgetItem;
            try {
                widgetItem = JSON.parse($("#test-editor-" + type + "-wrapper").attr("data-add-widget"));
            }
            catch (e) { /* No Op */ }

            contents = soda.testEditor.getActionObjectFromList(type);
            var listInfo = soda.testEditor.getInfoFromList(type),

                action = soda.testEditor.generateActionObject(
                    type,
                    contents,
                    {
                        name        : listInfo.name        || "unnamed_" + type,
                        id          : listInfo.id          || "@todo:id",
                        description : listInfo.description || "@todo:description",
                        syntax: {
                            name    : listInfo.syntax.name    || soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                            version : listInfo.syntax.version || soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                        },
                        widget: widgetItem
                    }
                );

            soda.testEditor.downloadAction(type, action, function (err, filename, file, jsonString) {
                if(err) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong...",
                            body        : $("<p>Unable to open the raw editor at this time. Try again later.</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
                else {
                    soda.RAW_MODE = true;
                    soda.testEditor.aceEditors[type].setValue(jsonString);
                    $outElem.fadeOut(SodaSettings.FADEOUT_SPEED, function () {
                        $icon.removeClass("fa-toggle-off").addClass("fa-toggle-on");
                        $self.attr("data-active", "true").addClass("active");
                        $inElem.fadeIn(SodaSettings.FADEIN_SPEED);
                    });
                }
            }, true);
        }
    });
};
