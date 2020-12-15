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
 * Manages the creation of actions
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 */
window.SodaActionManager = function (soda) {
    var self = this;

    // Inherit from the SodaEmitter class
    window.SodaEmitter.call(self);

    /**
     * Same as SodaVisualEditor.actionManager
     * @type {Object}
     */
    this.actionManager  = {};

    /**
     * The current syntax, with the keys {string} name and {string} version
     * @type {Object}
     */
    this.currentSyntax  = {};

    /**
     * Sorts the test menus in alphabetical order
     * @param  {jQuery} m The jQuery menu item to sort
     * @return {undefined}
     */
    function sortMenu (m) {
        var sorted = m.children();
        sorted.sort(function (a, b) {
            var aN = $(a).attr("data-sort"),
                bN = $(b).attr("data-sort");
            return aN < bN ? -1 : aN > bN ? 1 : 0;
        });
        sorted.appendTo(m);
        return m;
    }

    // Before an action is processed in an action search
    soda.delegates.on("action search before", function () {
        self.actionManager.typeWrapper.find(".action-list-group").show();
    });

    // After an action is processed in an action search
    soda.delegates.on("action search after", function () {
        var $groups = self.actionManager.typeWrapper.children(":visible");
        $groups.each(function () {
            var $group = $(this).find(".action-list-group");
            $group.each(function () {
                var visibleChildren = $(this).find(".action-item:visible");
                return visibleChildren.length > 0 ? $(this).show() : $(this).hide();
            });
        });
    });

    /**
     * Initalized the SodaRunner object
     * @param  {object} $runner  An object containing the Run Menu HTML elements
     * @param  {object} $monitor An object containing the test monitor HTML elements
     * @return {SodaActions} The current SodaActions instance
     */
    this.init = function ($actionManager) {
        self.actionManager = $actionManager;
        self.actionManager.syntaxOptions       = self.actionManager.self.find("#action-select-language");
        self.actionManager.typeWrapper         = self.actionManager.self.find("#action-list-wrapper");
        self.actionManager.actionWrapper       = self.actionManager.self.find("#action-list-action-wrapper");
        self.actionManager.testWrapper         = self.actionManager.self.find("#action-list-test-wrapper");
        self.actionManager.screenWrapper       = self.actionManager.self.find("#action-list-screen-wrapper");
        self.actionManager.menuWrapper         = self.actionManager.self.find("#action-list-menu-wrapper");
        self.actionManager.popupWrapper        = self.actionManager.self.find("#action-list-popup-wrapper");
        self.actionManager.widgetWrapper       = self.actionManager.self.find("#action-list-widget-wrapper");
        self.actionManager.actionTemplate      = self.actionManager.self.find(".action-item").detach();
        self.actionManager.actionGroupTemplate = self.actionManager.self.find(".action-list-group").detach();

        // Change the syntax when the option is chosen
        self.actionManager.syntaxOptions.change(function () {
            var $sel = $($(this).find(":selected"));
            soda.framework.getSyntax($sel.attr("data-name"), $sel.attr("data-version"), function (err, syntaxObject) {
                if(err) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong..",
                            body        : $("<p>Unable to update action syntax.</p><p>Error:" + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                    return console.error(err);
                }
                self.currentSyntax = { name: $sel.attr("data-name"), version: $sel.attr("data-version") };
                self.buildActionMenu(syntaxObject);
                $("#soda-force-update-project-button").trigger("click");
                $(".editor-syntax-name").val(self.currentSyntax.name);
                $(".editor-syntax-version").val(self.currentSyntax.version);
            });
        });

        var groups = {};

        soda.projectManager.on("build", function () {
            groups = {};
            self.actionManager.widgetWrapper.find(".action-type-widget").remove();
            self.actionManager.widgetWrapper.empty();
        });

        soda.projectManager.on("build complete", function () {
            sortMenu(self.actionManager.widgetWrapper);
        });

        soda.projectManager.on("widget", function (type, obj, context, meta) {
            if(meta.syntax.name === self.currentSyntax.name && meta.syntax.version === self.currentSyntax.version) {

                var $action         = self.actionManager.actionTemplate.clone(),
                    widgetIsObject  = typeof meta.widget === "object",
                    g               = typeof meta.widget.group === "string" ? meta.widget.group : "widget",
                    $group          = groups[g.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase()],
                    $groupContainer;

                if(!$group) {
                    $group = self.actionManager.actionGroupTemplate.clone();
                    $group.addClass(g.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase());
                    $groupContainer = $group.children(".action-list-group-actions");

                    $group.attr("data-type", "widget");
                    $group.children("h4").html(g.ucFirst);
                    $group.attr("data-sort", "widget");
                    groups[g.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase()] = $group;
                }
                else {
                    $groupContainer = $group.children(".action-list-group-actions");
                }

                $action.addClass("action-type-widget");
                $action.attr("data-type", "widget");
                $action.attr("data-group", g);
                $action.attr("data-widget-name", meta.name.toString());
                $action.attr("data-keys", "executeWidget:module:type");
                $action.attr("data-sort", "executeWidget:module:type");
                $action.attr("data-prefill", meta.name + ":" + context.module + ":" + context.type.toString().replace(/s$/, ''));

                if(widgetIsObject && meta.widget.vars instanceof Array)
                    $action.attr("data-vars", meta.widget.vars.join(":VAR:"));

                if(widgetIsObject && meta.widget.varDefaults instanceof Array) {
                    try {
                        $action.attr("data-def", JSON.stringify(meta.widget.varDefaults));
                    }
                    catch (e) {
                        console.error(e);
                    }
                }

                if(widgetIsObject && meta.widget.varDescriptions instanceof Array)
                    $action.attr("data-var-desc", meta.widget.varDescriptions.join(":DESC:"));

                $action.attr("data-for-syntax-name", meta.syntax.name);
                $action.attr("data-for-syntax-version", meta.syntax.version);

                $action.find(".a-icon").addClass("fa-puzzle-piece");
                $action.find(".a-key-signature").html(widgetIsObject ? meta.widget.name || meta.name : meta.name);
                $action.find(".a-description").html(widgetIsObject ? (meta.widget.description || (meta.description ? meta.description.ucFirst : "")) : meta.description ? meta.description.ucFirst : "");

                $action = $action.appendTo($groupContainer);
                $action.draggable({ appendTo: "#soda-editor", helper: "clone", zIndex: 993, cursor: "move", cursorAt: {left: 0, top: 0}, refreshPositions: true });

                $groupContainer = sortMenu($groupContainer);
                $group = $group.appendTo(self.actionManager.widgetWrapper);
            }
        });

        return self;
    };

    /**
     * Builds the action menu for the given syntax
     * @param  {object} syntax The syntax to build the action menu with
     * @return {undefined}
     */
    function buildActionMenu (syntax) {
        self.actionManager.actionWrapper.empty();
        self.actionManager.testWrapper.empty();
        self.actionManager.screenWrapper.empty();
        self.actionManager.menuWrapper.empty();
        self.actionManager.popupWrapper.empty();

        var $group, $testGroup;

        for(var i in syntax) { // Type
            if(syntax.hasOwnProperty(i)) {
                var typeChild = syntax[i];

                for(var n in typeChild) {
                    if(typeChild.hasOwnProperty(n)) {

                        var $group = self.actionManager.typeWrapper.find("#action-list-" + i + "-wrapper").find("div[data-type='" + n + "']"),
                            $groupContainer;

                        if($group.length > 0) {
                            $group = $($group.get(0));
                        }
                        else {
                            $group = self.actionManager.actionGroupTemplate.clone();
                            $group.attr("data-type", n);
                            $group.children("h4").html(n.titleCase);
                            $group.attr("data-sort", n);
                        }

                        $groupContainer = $group.children(".action-list-group-actions");

                        for(var k in typeChild[n]) {
                            if(typeChild[n].hasOwnProperty(k)) {
                                var action  = typeChild[n][k],
                                    $action = self.actionManager.actionTemplate.clone();

                                if (i === "action") {
                                    $action.find(".a-icon").addClass("fa-bolt");
                                }
                                else {
                                    $action.find(".a-icon").addClass("fa-bullseye");
                                }                         

                                $action.addClass("action-type-" + i.toLowerCase());
                                $action.attr("data-type", i);
                                $action.attr("data-group", n);
                                $action.attr("data-elemental", !action.nonElemental);
                                $action.attr("data-keys", action.keys.join(":"));
                                $action.attr("data-sort", action.keys.join(":"));
                                $action.find(".a-key-signature").html(action.keys.join(", ").titleCase);
                                $action.find(".a-description").html(action.description ? action.description.ucFirst : "");

                                $action = $action.appendTo($groupContainer);
                                $action.draggable({ appendTo: "#soda-editor", helper: "clone", zIndex: 993, cursor: "move", cursorAt: {left: 0, top: 0}, refreshPositions: true });
                            }
                        }

                        switch(i) {
                            case "action":
                                $group.appendTo(self.actionManager.actionWrapper);

                                $testGroup = $group.clone().appendTo(self.actionManager.testWrapper);
                                $testGroup.find(".action-item")
                                    .attr("data-type", "test")
                                    .draggable({ appendTo: "#soda-editor", helper: "clone", zIndex: 993, cursor: "move", cursorAt: {left: -10, top: -10} });
                                break;

                            case "screen":
                                $group.appendTo(self.actionManager.screenWrapper);
                                break;

                            case "menu":
                                $group.appendTo(self.actionManager.menuWrapper);
                                break;

                            case "popup":
                                $group.appendTo(self.actionManager.popupWrapper);
                                break;
                            
                            default:
                                break;
                        }
                    }
                }
            }
        }

        // Sort all action menus
        sortMenu(self.actionManager.actionWrapper);
        sortMenu(self.actionManager.testWrapper);
        sortMenu(self.actionManager.screenWrapper);
        sortMenu(self.actionManager.menuWrapper);
        sortMenu(self.actionManager.popupWrapper);
    }

    /**
     * Build the action menus
     * @param  {object} actionList The syntax, as provided by the server
     * @param  {Function} done A callback for completion
     * @return {SodaActions} The current SodaActions instance
     */
    this.buildActionMenu = function (actionList, done) {
        if(!done && actionList instanceof Function) {
            done       = actionList;
            actionList = undefined;
        }

        if(!actionList) {
            soda.framework.getSyntax(self.currentSyntax.name || soda.framework.defaultSyntax.name || "web", self.currentSyntax.version || soda.framework.defaultSyntax.version || "1.0", function (err, syntax) {
                if(err) {
                    soda.editor.setContext(
                        {
                            header      : "Something went wrong..",
                            body        : $("<p>Unable to retrive syntax from server.</p><p>Error:" + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                    return console.error(err);
                }
                buildActionMenu(syntax);
            });
        }
        else {
            buildActionMenu(actionList);
        }
        return self;
    };

    // Re-build the actions when the user changes the syntax
    soda.framework.on("syntax update", function (err, syntax) {
        if(err) return console.error(err);
        self.buildActionMenu(syntax);
    });

    // When the editor is shown, trigger an initial syntax selection
    soda.on("editor shown", function () {
        self.actionManager.self.find(".test-tab").trigger("click");
        self.currentSyntax = { name: soda.framework.defaultSyntax.name || "web", version: soda.framework.defaultSyntax.version || "1.0" };
        $(".editor-syntax-name").val(self.currentSyntax.name);
        $(".editor-syntax-version").val(self.currentSyntax.version);
        $("#action-select-language").val(self.currentSyntax.name.toLowerCase() + "-" + self.currentSyntax.version.toLowerCase().replace(".", "-"));
    });
};
