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
 * Manages the creation of suites, module, and assets. Builds the project tree...
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 * @param {object} $project The AJAX loaded contents specific to this class
 */
window.SodaProjectManager = function (soda, $project) {

    var self    = this,
        aids    = 0,
        Parents = {},
        assets  = {};

    // Inherit from SodaEmitter
    window.SodaEmitter.call(self);

    /**
     * Expand all of the elements in the "parents" array
     * @param  {Array} parents An array of parent elements to expand
     * @return {Function} The generated callback
     */
    function expandParents (parents) {
        for(var i in parents) {
            if(parents.hasOwnProperty(i) && !$(parents[i]).parent().hasClass("expanded")) {
                $(parents[i]).parent().trigger("click");
            }
        }
    }

    $project.elementTemplate   = $project.self.find(".project-element").detach();
    $project.search            = $project.self.find("#soda-project-search");
    $project.hierarchy         = $project.self.find("#soda-project-hierarchy");
    $project.hierarchyWrapper  = $project.self.find("#soda-project-hierarchy-wrapper");
    $project.addSuiteButton    = $project.self.find("#project-add-suite");
    $project.testPathBox       = $project.self.find("#test-path-warning");
    $project.testResultsPathBox = $project.self.find("#test-results-path-warning");

    $project.addSuiteButton.click(function () {
        self.addSuite();
    });

    soda.framework.on("config update", function () {
        $project.testPathBox.html(soda.framework.config.testPath);
        $project.testResultsPathBox.html(soda.framework.config.testResultsPath);
    });

    /**
     * Close all "nodes" on the project hierarchy (the on-screen element tree)
     * @return {SodaProjectManager} The current SodaProjectManager instance
     */
    this.closeAllTreeNodes = function () {
        $(".project-element").each(function () {
            var $icon = $(this).children(".project-element-info").children("i.expandable-icon");

            if(!$icon.hasClass("fa-file-text")) {
                $icon.removeClass("fa-folder-open").addClass("fa-folder");
            }

            $(this)
                .removeClass("expanded")
                .children(".expandable-child")
                .hide();
        });
    };

    // After a "search" has been iniatiated, but before the elements are queried as to whether or not
    // they meet the search requirements...
    soda.delegates.on("project search before", function () {
        self.closeAllTreeNodes();
        $(".project-element").removeClass("search-positive");
    });

    // Show the elements after the search has completed
    soda.delegates.on("project search after", function () {
        var $res = $(".project-element.search-positive");
        $res.each(function () {
            var $el = $(this);
            setTimeout(function () {
                expandParents(Parents[$el.attr("data-aid")]);
                $el.show();
            }, 0);
        });

        setTimeout(function () {
            soda.$editor.toolboxWrapperRight.mCustomScrollbar("scrollTo", $res.first(), { scrollInertia: 0 });
        }, 0);
    });

    // On a project file search, determine the elements that will pass or fail the search
    soda.delegates.on("project search", function (searchTerms, $element) {
        if(searchTerms && searchTerms !== "") {
            var passed = new RegExp(searchTerms, "i").test($element.attr("data-base"));
            if(passed) $element.addClass("search-positive");
        }
        else {
            $(".project-element").removeClass("search-positive");
        }
    });

    var addItem = $(
        '<div id="save-directory-modal-wrapper">' +
            '<div id="save-directory-modal">' +
                '<div class="input-group">' +
                    '<span class="input-group-addon"><em id="save-directory-icon" class="fa fa-check-circle"></em></span>' +
                    '<input id="save-directory-filename" type="text" class="selector-input form-control" placeholder="Enter a directory name...">' +
                '</div>' +
                '<p class="selector-message directory-message">The chosen directory name is available.</p>' +
            '</div>' +
        '</div>'
    );

    var performProjectAction = function (actionType /*Delete*/, actionName /*module*/, name /*name to act on*/, command, params) {
        soda.screen.showLoading(true, function () {
            soda.editor.setStatus({
                which   : "left",
                icon    : "fa-warning",
                message : actionType + " " + actionName + " " + name + "<span class=\"dot-dot-dot\">...</span>"
            });

            var onModuleDeleted = function (err) {
                soda.screen.hideLoading();

                if(err) {
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-warning",
                        message : "There was an error trying to " + actionType + " " + actionName + name + "."
                    });
                    soda.editor.setContext(
                        {
                            header      : "Unable to " + actionType + " " + actionName + " " + name + "...",
                            body        : $("<p>Unable to " + actionType + " " + actionName + " " + name + ".<br>" + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
                else {
                    soda.editor.setStatus({
                        which   : "left",
                        message : actionType + " " + name + " deleted."
                    });
                    soda.editor.setContext(
                        {
                            header      : actionName + " " + name + " deleted.",
                            body        : $("<p>" + actionName + " " + name + " " + actionType + "d successfully.</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );

                    $("#soda-force-update-project-button").trigger("click");
                }
            };
            soda.send(command, params, onModuleDeleted);
        });
    }

    /**
     * Add a new module, context dialogs will be automatically shown
     * @param {string} named The name of the new suite
     * @return {SodaProjectManager} The current SodaProjectManager instance
     */
    this.addModule = function (suite) {
        soda.editor.setContext(
            {
                header      : "Add module to suite " + suite + "?",
                body        : addItem,
                okayText    : "Add Module",
                cancelText  : "Cancel",

                onInit: function () {
                    $("#save-directory-filename").val("").attr("value", "")
                        .attr("data-suite", suite)
                        .attr("data-type", "module")
                        .trigger("keyup");
                },

                onOkay: function () {
                    var module = $("#save-directory-filename").val();

                    soda.editor.setStatus({
                        which   : "left",
                        message : "Creating module " + module + "<span class=\"dot-dot-dot\">...</span>"
                    });

                    performProjectAction("create", "module", module, "make module", { suite: suite, module: module });
                }
            }
        );
    };

    /**
     * Add a new suite, context dialogs will be automatically shown
     * @return {SodaProjectManager} The current SodaProjectManager instance
     */
    this.addSuite = function () {
        soda.editor.setContext(
            {
                header      : "Add new suite?",
                body        : addItem,
                okayText    : "Add Suite",
                cancelText  : "Cancel",

                onInit: function () {
                    $("#save-directory-filename")
                        .attr("data-type", "suite")
                        .removeAttr("data-suite")
                        .val("")
                        .trigger("keyup");
                },

                onOkay: function () {
                    var suite = $("#save-directory-filename").val();

                    soda.editor.setStatus({
                        which   : "left",
                        message : "Creating suite" + suite + "<span class=\"dot-dot-dot\">...</span>"
                    });

                    performProjectAction("create", "suite", suite, "make suite", suite);
                }
            }
        );
    };

    function startNew (type, suite, module) {
        soda.editor.setContext(
            {
                header      : "Start a new " + type + "?",
                body        : $("<p>This will clear the current " + type + " list.<br><span class=\"bold\">Make sure all changes are saved before continuing!</span></p><p>Are you sure...?</p>"),
                okayText    : "Okay",
                cancelText  : "No, I need to save stuff first...",

                onOkay      : function () {
                    soda.editor.switchToToolbox("test-editor", function () {
                        soda.testEditor.switchToTab(type, function () {
                            $("#test-editor-" + type).empty();
                            $("#test-editor-" + type + "-wrapper .editor-name").val("");
                            $("#test-editor-" + type + "-wrapper .editor-id").val("");
                            $("#test-editor-" + type + "-wrapper .editor-description").val("");
                            $("#test-editor-" + type + "-wrapper .editor-suite").val(suite).trigger("change");
                            $("#test-editor-" + type + "-wrapper .editor-module").val(module).trigger("change");
                            soda.testEditor.aceEditors[type].setValue(JSON.stringify(window.SodaTemplates[type], null, '    '));
                        });
                    });
                }
            }
        );
    }

    /**
     * Creates the delete action on context and basename
     * @param {object} context 
     * @param {String} basename 
     */
    function setupDelete ($nInfo, context, basename) {
        if(context) context = JSON.parse(JSON.stringify(context));
            
        $nInfo.children(".f-delete").click(function () {
            soda.editor.setContext(
                {
                    header      : "Delete " + context.type + " " + basename + "?",
                    body        : $("<p>Are you sure you want to delete the asset <span class=\"bold\">" + basename + "</span> from suite <span class=\"bold\">" + context.suite + "</span> and module <span class=\"bold\">" + context.module + "</span>?</p>"),
                    okayText    : "Delete Asset",
                    cancelText  : "Cancel",

                    onOkay: function () {
                        performProjectAction("delete", "asset", basename, "delete asset", context);                    }
                }
            );
        });

        return ;
    }

    /**
     * Build the project file element given hierarchy element "n"
     * @param  {object}  parents The parents to the current element being created
     * @param  {object}  n The element in the hierarchy to create a project element for
     * @param  {object}  level The level in the hierarchy tree this element belongs to
     * @param  {object}  i The name of the current element "n"
     * @param  {object}  $parent The parent element to this element
     * @param  {object}  path The path to the asset
     * @param  {object}  platform The asset's platform
     * @param  {Boolean} isAsset Whether or not this element is an asset or suite, module, or platform (e.g. file or directory)
     * @return {jQuery} The newly created project file element
     */
    function buildN (parents, n, level, i, $parent, path, context, isAsset) {
        if(context) context = JSON.parse(JSON.stringify(context));

        var $n           = $project.elementTemplate.clone(),
            $nInfo       = $n.children(".project-element-info"),
            hasChildren  = typeof n === "object" && n && Object.keys(n).length > 0,
            aid          = aids++,
            baseName     = i + (isAsset ? (context.platform !== "generic" ? "." + context.platform : "") + ".json" : ""),
            ext          = isAsset ? (context.platform !== "generic" ? "." + context.platform : "") + ".json" : "";

        $n.attr("data-aid", aid);

        if(level === 0) {
            $n.addClass("root");
        }
        else if(hasChildren){
            $n.addClass("branch");
        }
        else {
            $n.addClass("leaf");
        }

        $n.addClass("level-" + level);
        var elName = $nInfo.children(".project-element-id");
        elName.text(baseName);

        if(!isAsset) {
            $nInfo.children(".f-edit").remove();
            if (baseName === "screens" || baseName === "actions" || baseName === "tests" || baseName === "menus" || baseName === "popups") {
                $nInfo.children(".f-delete").remove();
            }
            else {
                setupDelete($nInfo, context, baseName);
            }
            $nInfo.children(".f-run").remove();
            $nInfo.children(".f-add").remove();
            $nInfo.prepend('<em class="fa fa-plus f-new pull-right sticky-element" data-container="body" data-toggle="tooltip" data-placement="bottom" title=""></em>');

            $nInfo.children(".project-element-icon")
                .removeClass("fa-file-text")
                .addClass("fa-folder");

            if(!context.module) {
                if(context.suite !== "global") {
                    $nInfo.children(".f-new")
                        .attr("data-original-title", "Add module to suite " + context.suite)
                        .click(function () {
                            self.addModule(context.suite);
                        });
                }
                else {
                    $nInfo.children(".f-new").remove();
                }
            }
            else if(context.type) {
                $nInfo.children(".f-new")
                    .attr("data-original-title", "Start new " + context.type + " in module" + context.module)
                    .click(function () {
                        startNew(context.type, context.suite, context.module);
                    });
            }
            else {
                $nInfo.children(".f-new").remove();
            }
        }
        else {

            var loadThisAsset = function () { soda.testEditor.loadAssetIntoEditor(context); };
            $n.removeClass("expandable-parent");
            $nInfo.children(".f-edit").click(loadThisAsset);
            elName.click(loadThisAsset);

            if (context.type === "action" || context.type === "screen") {
              $nInfo.children(".f-add")
                .draggable({ appendTo: "#soda-editor", helper: "clone", zIndex: 993, cursor: "move", cursorAt: {left: -10, top: -10} })
                .attr("data-name", context.name)
                .attr("data-suite", context.suite)
                .attr("data-module", context.module)
                .attr("data-platform", context.platform)
                .attr("data-type", "draggable")
                .attr("draggable-type", context.type);
            }
            else {
              $nInfo.children(".f-add").remove();
            }

            if(context.module === "common") {
                $nInfo.children(".f-run")
                    .attr("data-path",  "/"  + context.suite + "/common/" + context.type + "s/" + baseName)
                    .attr("data-asset-name", context.name)
                    .attr("data-asset-suite", context.suite)
                    .attr("data-asset-module", "common")
                    .attr("data-asset-platform", context.platform)
                    .attr("data-asset-type", context.type);
            }
            else if(context.module === "global") {
                $nInfo.children(".f-run")
                    .attr("data-path", "/global/" + context.type + "s/" + baseName)
                    .attr("data-asset-name", context.name)
                    .attr("data-asset-suite", "global")
                    .attr("data-asset-module", "global")
                    .attr("data-asset-platform", context.platform)
                    .attr("data-asset-type", context.type);
            }
            else {
                $nInfo.children(".f-run")
                    .attr("data-path", "/" + context.suite + "/modules/" + context.module + "/" + context.type + "s/" + baseName)
                    .attr("data-asset-name", context.name)
                    .attr("data-asset-suite", context.suite)
                    .attr("data-asset-module", context.module)
                    .attr("data-asset-platform", context.platform)
                    .attr("data-asset-type", context.type);
            }

            setupDelete($nInfo, context, baseName);
        }

        assets[aid]  = n;
        Parents[aid] = parents;
        $n = $n.appendTo($parent);
        $n.attr("data-base", baseName);
        $n.attr("data-path", (path + ext).replace(/^\//, ''));

        return $n;
    }

    /**
     * Builds the project files
     * @param  {object} obj The project hierarchy, or a recursive sub-object of the hierarchy
     * @param  {object} contexts The "inner" element that is being recursed
     * @param  {jQuery} $parent For recursion only
     * @param  {object} parents For recursion only
     * @param  {number} level For recursion only
     * @param  {string} path For recursion only
     * @param  {object} testContext For recursion only
     * @return {undefined}
     */
    function buildProjectHierarchy (obj, contexts, $parent, parents, level, path, testContext) {

        $parent = $parent || $project.hierarchy;
        parents = parents || [];
        level   = ++level || 0;
        path    = path    || "";

        testContext = testContext ? JSON.parse(JSON.stringify(testContext)) : {};

        var context, c = [];
        for(var k = 0; k < contexts.length; k++) c.push(contexts[k]);
        context = c.shift();
        parents.push($parent);

        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                var n = obj[i], $n,
                    localPath = path + "/" + i;

                var parentsClone = [];
                for(var j = 0; j < parents.length;  j++) parentsClone.push(parents[j]);

                switch(context) {
                    case "suite":
                        testContext.suite = i;
                        self.emit("suite", i, n, testContext);
                        $n = buildN(parents, n, level, i, $parent, localPath, testContext);

                        buildProjectHierarchy(n, c, $n.children(".project-element-children"), parentsClone, level, localPath, testContext);
                        break;

                    case "module":
                        testContext.module = i;
                        self.emit("module", i, n, testContext);
                        $n = buildN(parents, n, level, i, $parent, localPath, testContext);

                        buildProjectHierarchy(n, c, $n.children(".project-element-children"), parentsClone, level, localPath, testContext);
                        break;

                    case "platform":
                        testContext.platform = i;
                        self.emit("platform", i, n, testContext);
                        if(i === "generic" || i === soda.framework.platform)
                            buildProjectHierarchy(n, c, $parent, parents, --level, localPath, testContext);
                        break;

                    case "type":
                        testContext.type = i.replace(/s$/, '');
                        var existingType = $parent.find(".project-element.type.type-" + i);
                        if(existingType.length === 1) {
                            $n = $(existingType);
                        }
                        else {
                            $n = buildN(parents, n, level, i, $parent, localPath, testContext);
                            $n.addClass("type").addClass("type-" + i);
                        }

                        self.emit("type", i, n);
                        buildProjectHierarchy(n, c, $n.children(".project-element-children"), parentsClone, level, localPath, testContext);
                        break;

                    case "asset":
                        testContext.name = i;
                        buildN(parents, n, level, i, $parent, localPath, testContext, true);
                        self.emit("asset", i, n, testContext);

                        if(testContext.type === "test") self.emit("test", i, n, testContext, { id: n.id, name: n.name, description: n.description, baseName: n.baseName });
                        if(n.widget === true || typeof n.widget === "object") self.emit("widget", i, n, testContext, { id: n.id, name: n.name, description: n.description, baseName: n.baseName, widget: n.widget, syntax: n.syntax });
                        break;

                    default:
                        break;
                }
            }
        }

        return $parent;
    }

    // Any time the project hierarchy is updated, rebuild the project manager files,
    // as well as the run menu (it subscribes to the following [inner] events as well)
    soda.framework.on("project hierarchy update", function (err, hierarchy) {
        if(err) return console.error(err);
        Parents = {}; 
        assets = {};

        soda.editor.setStatus({ which: "left", message: 'Loading project files<span class="dot-dot-dot">...</span>' });
        self.emit("build", hierarchy);

        $("#soda-project-search input").val('').attr("value", "").trigger("keyup");
        $project.hierarchy.empty();
        $project.hierarchy = buildProjectHierarchy(hierarchy, ["suite", "module", "platform", "type", "asset"]);

        self.emit("build complete");
        soda.editor.setStatus({ which: "left", message: 'Project files loaded successfully', duration: 3 });
    });

    /**
     * Sorts the menu in alphabetical order
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
    }

    // When we encounter a suite, add it to the dynamic suite dropdowns
    var dynamicModules = {}, dynamicSuites = [], dynamicAssets = {};

    /**
     * Build all suite and module dropdown menus dynamically
     * @return {SodaProjectManager} The current SodaProjectManager instance
     */
    this.buildDynamicHierarchy = function () {
        $(".dynamic-hierarchy").empty();

        $(".dynamic-suite").each(function () {
            for(var s in dynamicSuites) {
                if(dynamicSuites.hasOwnProperty(s)) {
                    var name = dynamicSuites[s];
                    $(this).append('<option data-sort="' + name + '" value="' + name + '">' + name + '</option>');
                }
            }

            $(this).change(function () {
                var val = $(this).val(),
                    $moduleSelector = $(this).siblings(".dynamic-module");

                if(dynamicModules && dynamicModules[val]) {
                    $moduleSelector.each(function () {
                        $(this).empty();
                        for(var i in dynamicModules[val]) {
                            if(dynamicModules[val].hasOwnProperty(i)) {
                                $(this).append('<option data-sort="' + dynamicModules[val][i] + '" value="' + dynamicModules[val][i] + '">' + dynamicModules[val][i] + '</option>');
                            }
                        }
                        sortMenu($(this));
                    });
                }
            });
            sortMenu($(this));

            if(dynamicSuites.indexOf(soda.framework.config.suite) > -1) {
                $(this).val(soda.framework.config.suite).trigger("change");
            }
            else {
                $(this).prop('selectedIndex', 0).trigger("change");
            }
        });
        return self;
    };

    // Clear the suite and module dynamic dropdowns
    self.on("build", function () {
        dynamicModules = {};
        dynamicSuites  = [];
        dynamicAssets  = {};
    });

    self.on("suite", function (name) {
        dynamicSuites.push(name);
    });

    // When we come across an asset push it into the assets array
    self.on("asset", function (name, group, context) {
        var typeSingular = context.type.replace(/s$/, '');
        if(!dynamicAssets[context.suite]) dynamicAssets[context.suite] = {};
        if(!dynamicAssets[context.suite][context.module]) dynamicAssets[context.suite][context.module] = {};
        if(!dynamicAssets[context.suite][context.module][typeSingular]) dynamicAssets[context.suite][context.module][typeSingular] = [];
        dynamicAssets[context.suite][context.module][typeSingular].push(name);
    });

    // When we encounter a module, add it to the dynamic module dropdowns
    self.on("module", function (name, obj, context) {
        if(!dynamicModules[context.suite]) dynamicModules[context.suite] = [];
        dynamicModules[context.suite].push(name);
    });

    /**
     * Get the list of current assets
     */
    this.getAssetList = function () {
        return dynamicAssets;
    };

    /**
     * Get the list of current modules
     */
    this.getModuleList = function () {
        return dynamicModules;
    };
};
