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
 * Manages the Test Editor Toolbox
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 */
window.SodaTestEditor = function (soda) {
    var self          = this,
        aids          = 0,

        /**
         * @associates SodaTemplates
         * @type {SodaTemplates}
         */
        SodaTemplates = window.SodaTemplates;

    // Inherit from the SodaEmitter class
    window.SodaEmitter.call(self);
    this.$testEditor    = {};
    this.$currentList   = null;

    this.aceEditors = {};
    var lockDraggable = false;    

    /**
     * A callback for when an action drop is cancelled on a screen element
     * @param  {object} event jQuery event object
     * @param  {object} ui jQuery ui object
     * @return {undefined}
     */
    function onDraggableReset () {
        $(this).removeClass("droppable-over");         // jshint ignore:line
        $(this).removeClass("droppable-over-invalid"); // jshint ignore:line
        lockDraggable = false;
        soda.editor.hideContext();
        soda.editor.clearStatus("center");
    }

    function onActionDroppedRaw (event, ui) {
        $(this).removeClass("droppable-over");         // jshint ignore:line
        $(this).removeClass("droppable-over-invalid"); // jshint ignore:line
        soda.editor.clearStatus("center");

        if(!lockDraggable) {
            var rawType  = ui.draggable.attr("data-type"),
                listType = $(this).parent().attr("data-type"),
                currentJson;

            if(self.$currentList.attr("data-type") === rawType || (rawType === "widget" && (listType === "test" || listType === "action"))) {
                lockDraggable = true;

                var keys  = ui.draggable.attr("data-keys").split(":"),
                    arr   = null, o = {};

                try {
                    currentJson = JSON.parse(self.aceEditors[listType].getValue().trim());
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
                        self.aceEditors[listType].setValue(JSON.stringify(currentJson, null, '    '));
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
                    var prefillArr = ui.draggable.attr("data-prefill") ? ui.draggable.attr("data-prefill").split(":") : null;

                    keys.forEach(function (k) {
                        var v = "[value]";

                        // Set some key defaults
                        if(k === "exists"      ) v = true;
                        if(k === "back"        ) v = true;
                        if(k === "homeScreen"  ) v = true;
                        if(k === "deviceSwipeLeft"  ) v = true;
                        if(k === "deviceSwipeRight"  ) v = true;
                        if(k === "deviceSwipeUp"  ) v = true;
                        if(k === "deviceSwipeDown"  ) v = true;
                        if(k === "using"       ) v = "name";
                        if(k === "refresh"     ) v = false;
                        if(k === "wait"        ) v = 3;
                        if(k === "retries"     ) v = 10;
                        if(k === "hideAppFor"  ) v = 30;
                        if(k === "resetAppData") v = true;
                        if(k === "rotateDevice") v = "landscape";
                        if(k === "direction"   ) v = "up";
                        if(k === "tapXY"       ) v = [0, 0];

                        o[k] = v;
                    });

                    if(prefillArr instanceof Array) {
                        prefillArr.forEach(function (item, key) {
                            if(keys[key]) o[keys[key]] = item;
                        });
                    }

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

                switch(listType) {
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
                                    body        : "<span class=\"bold\">Your " + listType + " is missing the \"actions\" array!</span><br>Would you like to autocorrect this problem?",
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
                        if(typeof currentJson === "object" && typeof currentJson[listType] === "object" && currentJson[listType].components instanceof Array) {
                            arr = currentJson[listType].components;
                            addAction();
                        }
                        else {
                            soda.editor.setContext(
                                {
                                    header      : "Asset Syntax Error",
                                    body        : "<span class=\"bold\">Your " + listType + " structure is malformed!</span><br>Would you like to autocorrect this problem?",
                                    okayText    : "Okay",
                                    cancelText  : "No, nevermind",
                                    onOkay      : function () {
                                        if(typeof currentJson !== "object") currentJson = {};
                                        if(typeof currentJson[listType] !== "object") currentJson[listType] = {};
                                        currentJson[listType].components = [];
                                        arr = currentJson[listType].components;
                                        addAction();
                                    }
                                }
                            );
                            return;
                        }
                }
            }
        }
    }

    /**
     * A callback for when an action is dropped on a screen element
     * @param  {object} event jQuery event object
     * @param  {object} ui jQuery ui object
     * @return {undefined}
     */
    function onActionDropped (event, ui) {
        $(this).removeClass("droppable-over");         // jshint ignore:line
        $(this).removeClass("droppable-over-invalid"); // jshint ignore:line
        soda.editor.clearStatus("center");

        if(!lockDraggable) {
            var group = null;

            var rawType  = ui.draggable.attr("data-type"),
                listType = self.$currentList.attr("data-type"),
                realListType = ui.draggable.attr("draggable-type"),
                prefill  = {};

            if(listType === rawType || (rawType === "widget" && (listType === "test" || listType === "action"))) {
                lockDraggable = true;

                var keys  = ui.draggable.attr("data-keys").split(":");
                
                group = ui.draggable.attr("data-group");

                var prefillArr = ui.draggable.attr("data-prefill") ? ui.draggable.attr("data-prefill").split(":") : null;
                if(prefillArr instanceof Array) {
                    prefillArr.forEach(function (item, key) {
                        if(keys[key]) prefill[keys[key]] = item;
                    });
                }

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
                                    self.addAction(rawType === "widget" ? listType : rawType, "store", null, null, ["store", "as"], false, { as: $(this).attr("data-var"), store: $(this).val() });
                                });
                                self.addAction(rawType === "widget" ? listType : rawType, group, null, null, keys, false, prefill);
                            }
                        });
                    }
                    else {
                        self.addAction(rawType === "widget" ? listType : rawType, group, null, null, keys, false, prefill);
                    }
                }
                else {
                    self.addAction(rawType === "widget" ? listType : rawType, group, null, null, keys, false, prefill);
                }
            }

            else if (rawType === "draggable" && (listType === "test" || listType === "action") && (realListType === "action" || realListType === "screen")) {
              lockDraggable = true;

              if (realListType === "action") {
                keys  = ["execute"];
                prefill = { 'execute': ui.draggable.attr("data-name")};
              }
              else if (realListType === "screen") {
                keys  = ["validate"];
                prefill = { 'validate': ui.draggable.attr("data-name")};
              }

              self.addAction(listType, group, null, null, keys, false, prefill);
            }
        }
    }

    /**
     * A callback for when an action drop is hovering
     * @param  {object} event jQuery event object
     * @param  {object} ui jQuery ui object
     * @return {undefined}
     */
    function onDropOver (event, ui) {
        var rawType  = ui.draggable.attr("data-type"),
            listType = self.$currentList.attr("data-type"),
            realListType = ui.draggable.attr("draggable-type");

            console.log(event,ui);

        if(listType === rawType || (rawType === "widget" && (listType === "test" || listType === "action"))) {
            $(this).addClass("droppable-over"); // jshint ignore:line
        }
        else if (rawType === "draggable" && (listType === "test" || listType === "action") && (realListType === "action" || realListType === "screen")) {
            $(this).addClass("droppable-over"); // jshint ignore:line
        }
        else {
            $(this).addClass("droppable-over-invalid"); // jshint ignore:line
            soda.editor.setStatus({
                which     : "center",
                message   : '<span style="color: #A90909; font-weight: bold">Incompatible Tab!</span> Switch to the same editor tab type to add action.',
                icon      : "fa-warning",
                iconColor : "#A90909",
                duration  : 3
            });
        }
    }

    /**
     * A callback for when an action drop is hovering
     * @param  {object} event jQuery event object
     * @param  {object} ui jQuery ui object
     * @return {undefined}
     */
    function onDropOverRaw (event, ui) {
        var rawType  = ui.draggable.attr("data-type"),
            listType = $(this).parent().attr("data-type"),
            realListType = ui.draggable.attr("draggable-type");

            console.log(event,ui);

        if(listType === rawType || (rawType === "widget" && (listType === "test" || listType === "action"))) {
            $(this).addClass("droppable-over"); // jshint ignore:line
        }
        else if (rawType === "draggable" && (listType === "test" || listType === "action") && (realListType === "action" || realListType === "screen")) {
            $(this).addClass("droppable-over"); // jshint ignore:line
        }
        else {
            $(this).addClass("droppable-over-invalid"); // jshint ignore:line
            soda.editor.setStatus({
                which     : "center",
                message   : '<span style="color: #A90909; font-weight: bold">Incompatible Tab!</span> Switch to the same editor tab type to add action.',
                icon      : "fa-warning",
                iconColor : "#A90909",
                duration  : 3
            });
        }
    }

    /**
     * Initalize the SodaTestEditor object
     * @param  {object} $testEditor  An object containing the Test Editor HTML elements
     * @return {SodaRunner} The current SodaRunner instance
     */
    this.init = function ($testEditor) {
        self.$testEditor = $testEditor;
        self.$testTab    = $testEditor.self.find(".test-tab");
        self.$actionTab  = $testEditor.self.find(".action-tab");
        self.$screenTab  = $testEditor.self.find(".screen-tab");
        self.$menuTab    = $testEditor.self.find(".menu-tab");
        self.$popupTab   = $testEditor.self.find(".popup-tab");

        self.$testList    = $testEditor.self.find("#test-editor-test-wrapper");
        self.$actionList  = $testEditor.self.find("#test-editor-action-wrapper");
        self.$menuList    = $testEditor.self.find("#test-editor-menu-wrapper");
        self.$screenList  = $testEditor.self.find("#test-editor-screen-wrapper");
        self.$popupList   = $testEditor.self.find("#test-editor-popup-wrapper");

        self.$testListActions    = $testEditor.self.find("#test-editor-test-wrapper .editor-list-sortable");
        self.$actionListActions  = $testEditor.self.find("#test-editor-action-wrapper .editor-list-sortable");
        self.$menuListActions    = $testEditor.self.find("#test-editor-menu-wrapper .editor-list-sortable");
        self.$screenListActions  = $testEditor.self.find("#test-editor-screen-wrapper .editor-list-sortable");
        self.$popupListActions   = $testEditor.self.find("#test-editor-popup-wrapper .editor-list-sortable");

        self.$testListRaw    = $testEditor.self.find("#test-editor-test-wrapper .raw-editor-wrapper");
        self.$actionListRaw  = $testEditor.self.find("#test-editor-action-wrapper .raw-editor-wrapper");
        self.$menuListRaw    = $testEditor.self.find("#test-editor-menu-wrapper .raw-editor-wrapper");
        self.$screenListRaw  = $testEditor.self.find("#test-editor-screen-wrapper .raw-editor-wrapper");
        self.$popupListRaw   = $testEditor.self.find("#test-editor-popup-wrapper .raw-editor-wrapper");

        self.$generateScreenForm     = $testEditor.self.find("#generate-screen-form").detach();
        self.$generateScreenFormForm = self.$generateScreenForm.find("form");

        self.$testListActions.droppable({
            greedy  : true,
            drop    : onActionDropped,
            out     : onDraggableReset,
            over    : onDropOver,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$actionListActions.droppable({
            greedy  : true,
            drop    : onActionDropped,
            out     : onDraggableReset,
            over    : onDropOver,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$menuListActions.droppable({
            greedy  : true,
            drop    : onActionDropped,
            out     : onDraggableReset,
            over    : onDropOver,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$screenListActions.droppable({
            greedy  : true,
            drop    : onActionDropped,
            over    : onDropOver,
            out     : onDraggableReset,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$popupListActions.droppable({
            greedy  : true,
            drop    : onActionDropped,
            out     : onDraggableReset,
            over    : onDropOver,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$testListRaw.droppable({
            greedy  : true,
            drop    : onActionDroppedRaw,
            out     : onDraggableReset,
            over    : onDropOverRaw,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$popupListRaw.droppable({
            greedy  : true,
            drop    : onActionDroppedRaw,
            out     : onDraggableReset,
            over    : onDropOverRaw,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$actionListRaw.droppable({
            greedy  : true,
            drop    : onActionDroppedRaw,
            out     : onDraggableReset,
            over    : onDropOverRaw,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$screenListRaw.droppable({
            greedy  : true,
            drop    : onActionDroppedRaw,
            out     : onDraggableReset,
            over    : onDropOverRaw,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$menuListRaw.droppable({
            greedy  : true,
            drop    : onActionDroppedRaw,
            out     : onDraggableReset,
            over    : onDropOverRaw,
            reset   : onDraggableReset,
            activate: onDraggableReset,
            tolerance: "pointer"
        });

        self.$actionTemplate = $testEditor.self.find("#test-editor-action-template");
        return self;
    };

    /**
     * Load (read) an asset
     * @param  {Function} fn The filename to read
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.loadAsset = function (context, done) {
        if(done instanceof Function) {
            soda.send("read asset", context, function (err, contents) {
                done.call(self, err, contents);
            });
        }
        return self;
    };

    /**
     * Loads all asset
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.loadAllAssets = function (done) {
        if(done instanceof Function) {
            soda.send("load all assets", function (err, contents) {
                done.call(self, err, contents);
            });
        }
        return self;
    };

    /**
     * Load an asset into its respective action editor
     * @param {object} context An object containing key/value pairs for the action's suite, module, type, platform
     * @param {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.loadAssetIntoEditor = function (context, done) {
        if(typeof context === "object" && context.suite && context.module && context.platform && context.type && context.name) {
            soda.editor.setStatus({
                which   : "left",
                message : "Retrieving asset <span class=\"bold\">" + context.name + "</span>"
            });

            self.loadAsset(context, function (err, contents) {
                if(err) {
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-warning",
                        message : "Asset <span class=\"bold\">" + context.name + "</span> failed to load!"
                    });
                    soda.editor.setContext(
                        {
                            header      : "Asset failed to load...",
                            body        : $("<p>Unable to load asset <span class=\"emphasis\">" + context.name + "</span></p><p>" + err.message + ".</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                    if(done instanceof Function) done.call(self, err, contents);
                }
                else {
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-warning",
                        message : "Asset <span class=\"bold\">" + context.name + "</span> loaded! Parsing asset<span class=\"dot-dot-dot\">...</span>"
                    });

                    if($(".editor-toggle." + context.type).attr("data-active") === "true") {
                        try {
                            contents = JSON.stringify(contents, null, '    ');
                        }
                        catch (e) {
                            soda.editor.setContext(
                                {
                                    header      : "Asset failed to load...",
                                    body        : $("<p>Unable to load asset <span class=\"emphasis\">" + context.name + "</span></p><p>" + err.message + ".</p>"),
                                    okayText    : "Okay",
                                    omitCancel  : true
                                }
                            );
                            return;
                        }

                        soda.testEditor.aceEditors[context.type].setValue(contents);
                        soda.editor.switchToToolbox("test-editor", function () {
                            self.switchToTab(context.type, function () {
                                var $parent = self.$currentList.parent().parent();
                                if($parent) {
                                    $parent.find(".editor-suite").val(context.suite).trigger("change");
                                    setTimeout(function () {
                                        $parent.find(".editor-module").val(context.module).trigger("change");
                                    }, 100);
                                    if(done instanceof Function) done.call(self, err);

                                    soda.editor.setStatus({
                                        which   : "left",
                                        icon    : "fa-info",
                                        message : "Asset <span class=\"bold\">" + context.name + "</span> imported successfully!</span>",
                                        duration: 3
                                    });
                                }
                            });
                        });
                    }
                    else {
                        self.convertAssetToActions(context, contents, function (err) {
                            if(err) {
                                soda.editor.setContext(
                                    {
                                        header      : "Asset failed to load...",
                                        body        : $("<p>Unable to load asset <span class=\"emphasis\">" + context.name + "</span></p><p>" + err.message + ".</p>"),
                                        okayText    : "Okay",
                                        omitCancel  : true
                                    }
                                );
                            }
                            else {
                                soda.editor.setStatus({
                                    which   : "left",
                                    icon    : "fa-info",
                                    message : "Asset <span class=\"bold\">" + context.name + "</span> imported successfully!</span>",
                                    duration: 3
                                });
                            }
                            if(done instanceof Function) done.call(self, err);
                        });
                    }
                }
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Invalid arugments sent to SodaTestEditor.loadAssetIntoEditor"));
        }
        return self;
    };

    var actionQueue = [];
    function checkSelectorAndAddAction (actionItem) {
        var action     = actionItem.action,
            primaryKey = actionItem.primaryKey,
            selector   = actionItem.selector,
            keySet     = actionItem.keySet,
            type       = actionItem.type;

        if(typeof actionItem.selector === "string" && /^[\^*<>.@#]/.test(actionItem.selector.trim())) {
            soda.framework.queryTree("selector", actionItem.selector, function (err, matchedSet) {
                if(err) console.error(err);

                if(matchedSet instanceof Array && matchedSet.length > 0) {
                    var e = soda.tree.getElementWithId(matchedSet[0]);
                    self.addAction(type, primaryKey, e, selector, keySet, true, action, true);
                }
                else {
                    self.addAction(type, primaryKey, null, selector, keySet, false, action, true);
                }
                var next = actionQueue.shift();
                if(next) checkSelectorAndAddAction(next);
            });
        }
        else {
            self.addAction(type, primaryKey, null, selector, keySet, false, action, true);
            setTimeout(function () {
                var next = actionQueue.shift();
                if(next) checkSelectorAndAddAction(next);
            }, 0);
        }
    }

    /**
     * Convert a JSON action into a draggable UI action
     * @param {object} context An object containing key/value pairs for the action's suite, module, type, platform
     * @param {object} contents The action's contents
     * @param {Boolean=} noPrompt Don't verify with the user to load the asset
     * @param {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.convertAssetToActions = function (context, contents, noPrompt, done) {
        if(!done && noPrompt instanceof Function) {
            done     = noPrompt;
            noPrompt = undefined;
        }

        if(typeof context === "object" && contents) {
            var obj = contents;

            if(typeof obj === "string") {
                try {
                    obj = JSON.parse(contents);
                }
                catch(e) {
                    if(done instanceof Function) done.call(self, e);
                    return;
                }
            }

            if(typeof obj !== "object") {
                if(done instanceof Function) done.call(self, new Error("Asset syntax is malformed; unable to continue."));
            }
            else {
                var meta    = obj.meta,
                    actions = obj.actions;

                switch(context.type) {
                    case "screen":
                    case "screens":
                        actions = (typeof obj.screen === "object" ? obj.screen.components : null);
                        break;

                    case "menu":
                    case "menus":
                        actions = (typeof obj.menu === "object" ? obj.menu.components : null);
                        break;

                    case "popup":
                    case "popups":
                        actions = (typeof obj.popup === "object" ? obj.popup.components : null);
                        break;
                    
                    default:
                        break;
                }

                if(!actions && !(actions instanceof Array)) return done.call(self, new Error("Asset syntax is malformed; unable to continue."));
                var typeSingular = context.type.replace(/s$/, '');

                var loadAsset = function () {
                    var syntaxType = typeSingular;
                    if(syntaxType === "test") syntaxType = "action";
                    var syntax = soda.framework.latestSyntax[syntaxType];
                    for(var i in actions) {
                        if(actions.hasOwnProperty(i) && actions[i] !== null && actions[i] !== undefined) {
                            var action     = actions[i],
                                primaryKey = null,
                                selector   = null,
                                keySet;

                            for(var n in syntax) {
                                if(syntax.hasOwnProperty(n) && action[n.lowerFirst]) {
                                        primaryKey = n.lowerFirst;
                                        selector   = action[primaryKey];
                                        break;
                                }
                            }
                            keySet = Object.keys(action);
                            actionQueue.push({ selector: selector, primaryKey: primaryKey, action: action, keySet: keySet, type: typeSingular });
                        }
                    }

                    self.clearList(typeSingular);

                    soda.editor.switchToToolbox("test-editor", function () {
                        self.switchToTab(typeSingular, function () {
                            if(actionQueue.length > 0) checkSelectorAndAddAction(actionQueue.shift());
                            var $parent = self.$currentList.parent().parent();

                            if($(".editor-toggle." + typeSingular).attr("data-active") === "true") {
                                $parent = $(".editor-toggle." + typeSingular).parent();
                            }

                            if($parent) {
                                if(meta.widget) {
                                    try {
                                        $parent.attr("data-add-widget", JSON.stringify(meta.widget));
                                    }
                                    catch (e) { /* No Op */ }
                                }

                                if(typeof context.suite === "string") $parent.find(".editor-suite").val(context.suite).trigger("change");
                                if(typeof context.module === "string") $parent.find(".editor-module").val(context.module);

                                $parent.find(".editor-list-info.editor-name").val(context.name + (context.platform === "generic" ? "" : "." +
                                    context.platform)).attr("value", context.name + (context.platform === "generic" ? "" : "." + context.platform)).trigger("keyup");

                                $parent.find(".editor-list-info.editor-id").val(meta.id).attr("value", meta.id).trigger("keyup");
                                $parent.find(".editor-list-info.editor-description").val(meta.description).attr("value", meta.description).trigger("keyup");

                                if(typeof meta === "object") {
                                    if(typeof meta.syntax.name === "string")
                                        $parent.find(".editor-list-info.editor-syntax-name").val(meta.syntax.name).attr("value", meta.syntax.name).trigger("keyup");

                                    if(typeof meta.syntax.version === "string")
                                        $parent.find(".editor-list-info.editor-syntax-version").val(meta.syntax.version).attr("value", meta.syntax.version).trigger("keyup");

                                    if(done instanceof Function) done.call(self, null);
                                }
                            }
                        });
                    });
                };

                if(noPrompt) {
                    loadAsset();
                }
                else if($("#test-editor-" + typeSingular).children().length > 0) {
                    soda.editor.setContext(
                        {
                            header      : "Are you sure you want to load this asset?",
                            body        : $("<p>" + typeSingular.ucFirst + " list contains actions.<br><span class=\"bold\">If you haven't saved them, they will be overwritten.</span> Proceed?</p>"),
                            okayText    : "Yes, load asset",
                            cancelText  : "Cancel",
                            onOkay      : loadAsset
                        }
                    );
                }
                else {
                    loadAsset();
                }
            }
        }
        else {
            console.error("Invalid arugments passed to SodaTestEditor.convertAssetToActions");
        }
        return self;
    };

    /**
     * Generate a screen/menu/popup
     * @param  {string} type The type (screen, menu, or popup)
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.generateScreen = function (type, done) {
        var omit, prefer, omitBySelector, attributes, cardnality;

        try {
            omit = JSON.parse(self.$generateScreenFormForm.find("#generate-omit").attr("data-value"));
        }
        catch (err) {
            omit = {};
        }

        omitBySelector = self.$generateScreenFormForm.find("#generate-ignore").val() || "";
        omitBySelector = omitBySelector.split(/\n+/g);

        var omitBySelectorNoComments = [];
        for(var i in omitBySelector) {
            if(omitBySelector.hasOwnProperty(i)) {
                omitBySelector[i] = omitBySelector[i].trim();
                if(omitBySelector[i] && omitBySelector[i] !== "" && !(/^\s*\/\//.test(omitBySelector[i]))) {
                    omitBySelectorNoComments.push(omitBySelector[i]);
                }
            }
        }

        prefer     = self.$generateScreenFormForm.find("#generate-prefer").attr("data-value");
        attributes = self.$generateScreenFormForm.find("#generate-attributes").attr("data-value");
        cardnality = self.$generateScreenFormForm.find("#generate-cardnality").attr("data-value");

        try {
            attributes = JSON.parse(attributes);
        }
        catch (err) {
            attributes = {};
        }

        soda.framework.queryTree("selector", omitBySelectorNoComments, function (err, res) {
            if(err) console.error(err);

            var ignoreSet     = res.flat,
                elements      = soda.tree.getElements(),
                totalElements = Object.keys(elements).length,
                is, property, onElement = 0;

            if(totalElements === 0) {
                if(done instanceof Function) done.call(self);
                return self;
            }

            var contents, rawObj;
            if($(".editor-toggle." + type).attr("data-active") === "true") {
                contents = self.aceEditors[type].getValue();
                try {
                    contents = JSON.parse(contents);
                }
                catch (e) {
                    soda.editor.setContext(
                        {
                            header      : "JSON Syntax Error...",
                            body        : $("<p><span class=\"bold\">Unable to generate " + type + " because your JSON is invalid.</span> Fix your syntax and try again</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                    return;
                }

                if(typeof contents === "object") {
                    if(typeof contents[type] === "object") {
                        if(!(contents[type].components instanceof Array)) {
                            contents[type].components = [];
                        }
                    }
                    else {
                        contents[type] = { components: [] };
                    }
                }
                else {
                    contents = {};
                    contents[type] = { components: [] };
                }
                rawObj = contents[type].components;
            }

            for(var k in elements) {
                if(elements.hasOwnProperty(k) && ignoreSet.indexOf(elements[k].id) === -1) {
                    var e           = elements[k],
                        selectors   = soda.tree.generateSelectorsForElement(e, omit),
                        eAttributes = "";

                    for(var a in attributes) {
                        if(attributes.hasOwnProperty(a) && attributes[a]) {
                            var attr = e[a] === true || e[a] === false || e[a] === null ? e[a] : "'" + e[a] + "'";
                            eAttributes += "[" + a + "=" + attr + "]";
                        }
                    }

                    for(var s in selectors)
                        if(selectors.hasOwnProperty(s)) selectors[s] += eAttributes;

                    soda.framework.queryTree("selector", selectors, function (err, res) {
                        var e                    = this.e,
                            selectors            = this.selectors,
                            choose               = selectors.length - 1,
                            chooseWithCardnality = null,
                            mostSpecific         = 999999,
                            nth                  = null,
                            bySet;

                        switch(prefer) {
                            case "value":
                                if(e.value !== null && e.value !== undefined  && e.value !== "") {
                                    is = e.value;
                                    property = "value";
                                }
                                else if (e.name !== null && e.name !== undefined  && e.name !== "") {
                                    is = e.name;
                                    property = "name";
                                }
                                else {
                                    is = e.label;
                                    property = "label";
                                }
                                break;

                            case "name":
                                if(e.name !== null && e.name !== undefined  && e.name !== "") {
                                    is = e.name;
                                    property = "name";
                                }
                                else if (e.label !== null && e.label !== undefined && e.label !== "") {
                                    is = e.label;
                                    property = "label";
                                }
                                else {
                                    is = e.value;
                                    property = "value";
                                }
                                break;

                            case "label":
                                if(e.label !== null && e.label !== undefined  && e.label !== "") {
                                    is = e.label;
                                    property = "label";
                                }
                                else if (e.name !== null && e.name !== undefined  && e.name !== "") {
                                    is = e.name;
                                    property = "name";
                                }
                                else {
                                    is = e.value;
                                    property = "value";
                                }
                                break;

                            default:
                                break;
                        }

                        if(selectors.length > 0) {
                            if(err) {
                                self.addAction(type, "assert", e, selectors[choose], ["assert", "is", "property"], true, { property: property, is: is });
                            }
                            else {
                                bySet = res.bySet;
                                for(var i in bySet) {
                                    if(bySet.hasOwnProperty(i) && bySet[i].indexOf(e.id) > -1) {
                                        var selectorCardnality = selectors[i].match(/((?:(?:[.#^@](?:(?:\{.*?})|[\w:]+)|\*|>)(?:(?:\[\S+(?:\s*=\s*|\s*~\s*|\s*>\s*|\s*<\s*|\s*>=\s*|\s*<=\s*|\s*!=\s*)(?:'.*?'|".*?"|(?:-*\d+(?:\.\d+)?)|true|false|null)])*)))/g).length;

                                        if(bySet[i].length === 1 && selectorCardnality >= cardnality) {
                                            chooseWithCardnality = i;
                                            nth    = null;
                                            break;
                                        }
                                        else if(selectorCardnality >= cardnality) {
                                            chooseWithCardnality = i;
                                            nth                  = bySet[i].indexOf(e.id);
                                        }
                                        else if(bySet[i].length <= mostSpecific) {
                                            mostSpecific = bySet[i].length;
                                            choose       = i;
                                            nth          = bySet[i].indexOf(e.id);
                                        }
                                    }
                                }

                                if($(".editor-toggle." + type).attr("data-active") === "true") {
                                    rawObj.push({ assert: selectors[chooseWithCardnality || choose] + ((nth || nth === 0) ? "[nth=" + nth + "]" : ""), is: is, property: property });
                                    if(onElement === totalElements - 1) {
                                        self.aceEditors[type].setValue(JSON.stringify(contents, null, '    '));
                                    }
                                }
                                else {
                                    self.addAction(type, "assert", e, selectors[chooseWithCardnality || choose] + ((nth || nth === 0) ? "[nth=" + nth + "]" : ""), ["assert", "is", "property"], true, { is: is, property: property });
                                }
                            }
                        }
                        onElement++;

                        if(done instanceof Function && (onElement === totalElements - 1)) done.call(self);
                    }.bind({ e: e, selectors: selectors })); // jshint ignore:line
                }
                else {
                    onElement++;
                    if(done instanceof Function && (onElement === totalElements - 1)) done.call(self);
                }
            }
        });
        return self;
    };

    /**
     * Generate an action object from an object
     * @param  {string} type The type of action (screen, menu, popup, action, or test)
     * @param  {object} actionObject The action object to generate
     * @param  {object} meta The meta information for this action
     * @return {object} The generated action object
     */
    this.generateActionObject = function (type, actionObject, meta) {
        type = type.toLowerCase();
        if(SodaTemplates[type] && typeof actionObject === "object") {
            var template = JSON.parse(JSON.stringify(SodaTemplates[type]));

            switch(type) {
                case "screen" :
                case "menu"   :
                case "popup"  :
                    if(actionObject instanceof Array) {
                        template[type].components = actionObject;
                    }
                    else {
                        template[type].components.push(actionObject);
                    }
                    break;

                default:
                    if(actionObject instanceof Array) {
                        template.actions = actionObject;
                    }
                    else {
                        template.actions.push(actionObject);
                    }
            }

            if(typeof meta === "object") {
                if(typeof meta.syntax === "object" && typeof template.meta.syntax.name    === "string") template.meta.syntax.name    = meta.syntax.name;
                if(typeof meta.syntax === "object" && typeof template.meta.syntax.version === "string") template.meta.syntax.version = meta.syntax.version;

                if(typeof meta.name        === "string") template.meta.name        = meta.name;
                if(typeof meta.id          === "string") template.meta.id          = meta.id;
                if(typeof meta.description === "string") template.meta.description = meta.description;
                if(meta.widget) template.meta.widget = meta.widget;
            }
            return template;
        }
        return null;
    };

    /**
     * Prepare, then download an action
     * @param  {string} type The type of action (screen, menu, popup, action, or test)
     * @param  {object} actionObject The action object to generate
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.downloadAction = function (type, actionObject, done, isList) {
        type = type || "action";

        var actionJson = null, filename = type, file, Error = null;
        if(typeof actionObject === "object") {
            filename = typeof actionObject.meta === "object" && typeof actionObject.meta.name === "string" ? actionObject.meta.name : filename;
            soda.editor.setStatus({
                which   : "left",
                icon    : "fa-bolt",
                message : "Downloading " + type.ucFirst + (isList === true ? " list" : "") + "<span class=\"dot-dot-dot\">...</span>"
            });

            try {
                actionJson = JSON.stringify(actionObject, null, '    ');
            }
            catch (err) {
                soda.editor.setContext(
                    {
                        header      : type.ucFirst + (isList === true ? " list " : " ") + "Something went wrong...",
                        body        : $("<p>Unable to download " + type + (isList === true ? "list " : "") + ".</p><p>Error: " + err.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
                Error = err;
            }

            try {
                file = "data:text/json;charset=utf-8," + encodeURIComponent(actionJson);
            }
            catch(err) {
                soda.editor.setContext(
                    {
                        header      : type.ucFirst + (isList === true ? " list " : " ") + "Something went wrong...",
                        body        : $("<p>Unable to download " + type + (isList === true ? "list " : "") + ".</p><p>Error: " + err.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
                Error = err;
            }
            soda.editor.setStatus({
                which   : "left",
                icon    : "fa-bolt",
                message : type.ucFirst + (isList === true ? " list" : "") + " downloaded!"
            });

            if(done instanceof Function) done.call(self, Error, filename, file, actionJson);
        }
        return self;
    };

    /**
     * Execute an action
     * @param  {string} type The type of action (screen, menu, popup, action, or test)
     * @param  {object} actionObject The action object to generate
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.executeAction = function (type, actionObject, done, isList) {
        type = type || "action";

        if(typeof actionObject === "object") {
            soda.editor.setStatus({
                which   : "left",
                icon    : "fa-bolt",
                message : "Executing " + type.ucFirst + (isList === true ? " list" : "") + "<span class=\"dot-dot-dot\">...</span>"
            });

            soda.send("execute", actionObject, function (err, results) {
                var res, classes;

                if(err) {
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-bolt",
                        message : "Error executing " + type + (isList === true ? "list " : "") + ": " + err.message
                    });
                    soda.editor.setContext(
                        {
                            header      : type.ucFirst + (isList === true ? " list " : " ") + "Execution Results",
                            body        : $("<p>Error executing " + type + (isList === true ? "list " : "") + ": " + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
                else {
                    $("#soda-refresh-button").trigger("click");

                    res     = results.result === true ? "Pass" : "Fail";
                    classes = results.result === true ? "soda-stdout pass" : "soda-stdout fail";
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-bolt",
                        message : type.ucFirst + " " + (isList === true ? "list " : " ") + "execution complete! Results: " + res
                    });
                    soda.editor.setContext(
                        {
                            header      : type.ucFirst + (isList === true ? " List " : " ") + "Execution Results",
                            body        : $("<h4 style=\"border-bottom:none; padding-bottom: 0\">" + type.ucFirst + (isList === true ? " list " : " ") + "execution complete!</h4><p class=\"bold\">Results: <span class=\"" + classes + "\">" + res + "</span></p><p class=\"" + classes + "\">" + results.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
                if(done instanceof Function) done.call(self, err, results);
            });
        }
        else {
            if(done instanceof Function) done.call(self, new Error("Expected argument for parameter `actionObject` to be an object, but got: " + typeof actionObject), null);
        }
    };

    /**
     * Add an action to a test-editor tab list
     * @param {string} type The type of action (e.g. action, test, screen, etc.)
     * @param {string} primaryKey The primary key of the action (the one which will be tied to the element selector)
     * @param {object=} e The element to tie the action to, if one is present
     * @param {string=} selector The selector to tie the element to
     * @param {Array} keySet The key set of the action (the action's keys)
     * @param {boolean} elemental Whether or not this element should be attempted to be attached to a screen element
     * @param {object} prefill An object with key/value pairs to prefill the key set with
     * @param {boolean} dontTrigger Whether or not to close all other elements and "open" this new one
     */
    this.addAction = function (type, primaryKey, e, selector, keySet, elemental, prefill, dontTrigger) {
        type = type.toLowerCase();
        var parent = $("#test-editor-" + type + "-wrapper .editor-list-sortable"), aid;

        if(parent.length > 0) {
            aid = aids++;
            var template = $(
                    '<div class="action-' + aid + ' action-item-object expandable-parent">'                                                 +
                        '<div class="action-item-header element-info">'                                                                     +
                            '<em class="fa fa-times-circle pull-right remove-el" data-remove=".action-' + aid + '.action-item-object"></em>'  +
                            '<em class="add-key-value fa fa-plus-circle pull-right" style="vertical-align:middle"></em>'                      +
                            '<em class="execute-action-item fa fa-play-circle pull-right" style="vertical-align:middle"></em>'                +
                            '<em class="action-item-icon fa inline expandable-icon"></em>'                                                    +
                            '<div class="action-item-id inline">' + (primaryKey ? primaryKey.lowerFirst : "generic action")                 +
                                (selector && e ? (' #' + e.id) : "") + '</div>'                                                             +
                        '</div>'                                                                                                            +
                        '<div class="action-item-children expandable-child"></div>'                                                         +
                    '</div>'
                ),

                templateIcon     = template.find(".expandable-icon"),
                addIcon          = template.find("i.add-key-value"),
                playIcon         = template.find("i.execute-action-item"),
                templateChildren = template.find(".expandable-child"),
                action = {}, actionItem;

            parent = $(parent.get(0));
            templateIcon.addClass(type === "action" || type === "test" ? "fa-bolt" : "fa-bullseye");
            template = template.appendTo(parent);

            playIcon.click(function () {
                var contents, action;

                try {
                    contents = JSON.parse(template.attr("data-json"));
                    action = self.generateActionObject(
                        type,
                        contents,
                        {
                            name        : "Soda VisualEditor Action",
                            id          : "N/A",
                            description : "Soda VisualEditor action execution with keyset: " + keySet.join(", ").titleCase,
                            syntax: {
                                name    : soda.actionManager.currentSyntax.name    || soda.framework.config.defaultSyntaxName,
                                version : soda.actionManager.currentSyntax.version || soda.framework.config.defaultSyntaxVersion
                            }
                        }
                    );

                    if(action) {
                        soda.editor.switchToToolbox("console");
                        self.executeAction("action", action);
                    }
                    else {
                        soda.editor.setContext(
                            {
                                header      : "Something went wrong...",
                                body        : $("<p>Unable to execute action because its contents are empty!</p>"),
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
                            body        : $("<p>This action item has become corrupt. Try removing it, then adding it again.</p><p>Error: " + err.message + "</p>"),
                            okayText    : "Okay",
                            omitCancel  : true
                        }
                    );
                }
            });

            addIcon.click(function () {
                var newActionItem = $('<div class="action-attribute attribute-info expandable-item"><div class="attribute-key inline" contenteditable="true">[key]</div><div class="attribute-value inline" contenteditable="true">[value]</div></div>');
                newActionItem = newActionItem.appendTo(templateChildren);

                var aKey, aValue, lastValue = null;
                aValue = newActionItem.find(".attribute-value").on("blur", function () {
                    var key = $(this).siblings(".attribute-key").text();
                    action[key] = $(this).text();
                    template.attr("data-json", JSON.stringify(action));
                });

                newActionItem.find(".attribute-key").on("click", function () {
                    lastValue = $(this).text();
                });

                newActionItem.find(".attribute-key").on("focus", function () {
                    lastValue = $(this).text();
                });

                aKey = newActionItem.find(".attribute-key").on("blur", function () {
                    action = JSON.parse(template.attr("data-json"));
                    if($(this).text() === "" || !$(this).text()) {
                        action[lastValue] = undefined;
                        delete action[lastValue];
                        $(this).parent().remove();
                    }
                    else {
                        try {
                            action[$(this).text()] = JSON.parse(JSON.stringify(action[lastValue]));
                        }
                        catch (e) {
                            action[$(this).text()] = action[lastValue];
                        }
                        action[lastValue] = undefined;
                        delete action[lastValue];
                    }
                    template.attr("data-json", JSON.stringify(action));
                });

                aKey.trigger("blur");
                aValue.trigger("blur");
                var $header = templateChildren.siblings(".action-item-header");
                if(!templateChildren.is(":visible")) $header.trigger("click");
            });

            for(var i in keySet) {
                if(keySet.hasOwnProperty(i)) {
                    if(keySet[i] === primaryKey && selector && e) {
                        var selectorValue = selector.val instanceof Function ? selector.val() : selector;
                        action[keySet[i]] = selectorValue;
                        var selectorChecker = $('<em class="selector-validator fa fa-minus-circle inline"></em>');

                        template
                            .addClass("hover-to-element")
                            .attr("data-hover-to-element", e.wid);

                        actionItem = $('<div class="action-attribute attribute-info expandable-item"><div class="attribute-key inline">' + keySet[i] + '</div><div class="attribute-value inline" contenteditable="true">' + selectorValue + '</div></div>');
                        selectorChecker = selectorChecker.prependTo(actionItem.find(".attribute-key"));
                        actionItem = actionItem.appendTo(templateChildren);

                        (function (i) {
                            var actionValue = actionItem.find(".attribute-value");
                            actionValue.on("blur", function () {
                                var $testIcon = selectorChecker,
                                    val       = $(this).text();

                                soda.framework.queryTree("selector", val, function (err, matchedElementIds) {
                                    if(matchedElementIds instanceof Array && matchedElementIds.indexOf(e.id) > -1) {
                                        if(matchedElementIds.length > 1) {
                                            $testIcon.removeClass("fa-check-circle").removeClass("fa-times-circle").addClass("fa-minus-circle");
                                        }
                                        else {
                                            $testIcon.removeClass("fa-times-circle").removeClass("fa-minus-circle").addClass("fa-check-circle");
                                        }
                                    }
                                    else if(err) {
                                        $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                                    }
                                    else {
                                        $testIcon.removeClass("fa-check-circle").removeClass("fa-minus-circle").addClass("fa-times-circle");
                                    }
                                });

                                try {
                                    action[keySet[i]] = JSON.parse($(this).text());
                                }
                                catch (e) {
                                    action[keySet[i]] = $(this).text();
                                }
                                template.attr("data-json", JSON.stringify(action));
                            });
                            actionValue.trigger("blur");
                        }(i)); // jshint ignore:line
                    }
                    else {
                        var prefillI;
                        if(prefill && typeof prefill === "object" && prefill[keySet[i]] !== undefined) prefillI = prefill[keySet[i]];
                        action[keySet[i]] = prefillI === undefined ? "[value]" : prefillI;

                        // Set some key defaults
                        if(keySet[i] === "exists"     && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "back"       && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "homeScreen" && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "deviceSwipeLeft" && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "deviceSwipeRight" && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "deviceSwipeUp" && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "deviceSwipeDown" && prefillI === undefined) action[keySet[i]] = true;
                        if(keySet[i] === "using"      && prefillI === undefined) action[keySet[i]] = "name";
                        if(keySet[i] === "refresh"    && prefillI === undefined) action[keySet[i]] = false;
                        if(keySet[i] === "wait"       && prefillI === undefined) action[keySet[i]] = 3;
                        if(keySet[i] === "retries"    && prefillI === undefined) action[keySet[i]] = 10;
                        if(keySet[i] === "hideAppFor" && prefillI === undefined) action[keySet[i]] = 30;
                        if(keySet[i] === "execute" && prefillI === undefined) action[keySet[i]] = "action";
                        if(keySet[i] === "validate" && prefillI === undefined) action[keySet[i]] = "screen";

                        var presented = (typeof action[keySet[i]] === "object") ? JSON.stringify(action[keySet[i]]) : action[keySet[i]];
                        actionItem = $('<div class="action-attribute attribute-info expandable-item"><div class="attribute-key inline" contenteditable="true">' + keySet[i] + '</div><div class="attribute-value inline" contenteditable="true">' + presented + '</div></div>').appendTo(templateChildren);

                        (function (i) {
                            var last = keySet[i];
                            actionItem.find(".attribute-value").on("blur", function () {
                                try {
                                    action[last] = JSON.parse($(this).text());
                                }
                                catch (e) {
                                    action[last] = $(this).text();
                                }
                                template.attr("data-json", JSON.stringify(action));
                            });

                            actionItem.find(".attribute-key").on("click", function () {
                                last = $(this).text();
                            });

                            actionItem.find(".attribute-key").on("focus", function () {
                                last = $(this).text();
                            });

                            actionItem.find(".attribute-key").on("blur", function () {
                                if($(this).text() === "" || !$(this).text()) {
                                    action[last] = undefined;
                                    delete action[last];
                                    $(this).parent().remove();
                                }
                                else {
                                    try {
                                        action[$(this).text()] = JSON.parse(JSON.stringify(action[last]));
                                    }
                                    catch (e) {
                                        action[$(this).text()] = action[last];
                                    }
                                    action[last] = null;
                                    delete action[last];
                                    last = $(this).text();
                                }
                                template.attr("data-json", JSON.stringify(action));
                            });
                        }(i)); // jshint ignore:line
                    }
                }
            }

            if(!dontTrigger) {
                self.closeAllActions();
                template.trigger("click");
            }
            template.attr("data-json", JSON.stringify(action));
        }
        else {
            throw new Error("No parent in SodaTestEditor.addAction!");
        }
        return self;
    };

    /**
     * Close all actions (un-expand) for all elements in the current list
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.closeAllActions = function () {
        self.$currentList.find(".action-item-object").each(function () {
            if($(this).hasClass("expanded")) $(this).trigger("click");
        });
        return self;
    };

    /**
     * Retrieve the meta-data information from the currently active list
     * @return {object} An object representing the list's meta data
     */
    this.getInfoFromCurrentList = function () {
        var type = soda.testEditor.$currentList.attr("data-type") || "action",
            list;

        switch(type.toLowerCase()) {
            case "test":
                list = self.$testList;
                break;

            case "screen":
                list = self.$screenList;
                break;

            case "menu":
                list = self.$menuList;
                break;

            case "popup":
                list = self.$popupList;
                break;

            default:
                list = self.$actionList;
                break;
        }
        return {
            name        : list.find(".editor-list-info.editor-name").val(),
            id          : list.find(".editor-list-info.editor-id").val(),
            description : list.find(".editor-list-info.editor-description").val(),

            syntax      : {
                name    : list.find(".editor-list-info.editor-syntax-name").val(),
                version : list.find(".editor-list-info.editor-syntax-version").val()
            },

            suite  : list.find(".editor-list-info.editor-suite").val(),
            module : list.find(".editor-list-info.editor-module").val()
        };
    };

    /**
     * Retrieve the meta-data information from the currently active list
     * @return {object} An object representing the list's meta data
     */
    this.getInfoFromList = function (type) {
        type = type.toLowerCase();
        var list;

        switch(type.toLowerCase()) {
            case "test":
                list = self.$testList;
                break;

            case "screen":
                list = self.$screenList;
                break;

            case "menu":
                list = self.$menuList;
                break;

            case "popup":
                list = self.$popupList;
                break;

            default:
                list = self.$actionList;
                break;
        }
        return {
            name        : list.find(".editor-list-info.editor-name").val(),
            id          : list.find(".editor-list-info.editor-id").val(),
            description : list.find(".editor-list-info.editor-description").val(),

            syntax      : {
                name    : list.find(".editor-list-info.editor-syntax-name").val(),
                version : list.find(".editor-list-info.editor-syntax-version").val()
            },

            suite  : list.find(".editor-list-info.editor-suite").val(),
            module : list.find(".editor-list-info.editor-module").val()
        };
    };

    /**
     * Generate an object from the active list's elements
     * @return {object} The action object created from the jQuery/HTML object list
     */
    this.getActionObjectFromCurrentList = function () {
        var contents = [];
        soda.testEditor.$currentList.children().each(function () {
            var json = $(this).attr("data-json");
            if(json) {
                try {
                    var obj = JSON.parse(json);
                    if(obj["[key]"] !== undefined) {
                        obj["[key]"] = undefined;
                        delete obj["[key]"];
                    }
                    if(obj[""] !== undefined) {
                        obj[""] = undefined;
                        delete obj[""];
                    }
                    contents.push(obj);
                }
                catch(e) {
                    /* No Op */
                }
            }
        });
        return contents;
    };

    /**
     * Generate an object from the active list's elements
     * @return {object} The action object created from the jQuery/HTML object list
     */
    this.getActionObjectFromList = function (list) {
        var contents = [],
            $list    = self["$" + list.toLowerCase() + "ListActions"];


        $list.children().each(function () {
            var json = $(this).attr("data-json");
            if(json) {
                try {
                    var obj = JSON.parse(json);
                    if(obj["[key]"] !== undefined) {
                        obj["[key]"] = undefined;
                        delete obj["[key]"];
                    }
                    if(obj[""] !== undefined) {
                        obj[""] = undefined;
                        delete obj[""];
                    }
                    contents.push(obj);
                }
                catch(e) {
                    /* No Op */
                }
            }
        });
        return contents;
    };

    /**
     * Clan an action list (no dialog presented)
     * @param  {string} which The string name of the list to clear
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.clearList = function (which) {
        switch(which) {
            case "test":
                self.$testListActions.empty();
                self.$testList.removeAttr("data-add-widget");
                break;

            case "action":
                self.$actionListActions.empty();
                self.$actionList.removeAttr("data-add-widget");
                break;

            case "screen":
                self.$screenListActions.empty();
                self.$screenList.removeAttr("data-add-widget");
                break;

            case "menu":
                self.$menuListActions.empty();
                self.$menuList.removeAttr("data-add-widget");
                break;

            case "popup":
                self.$popupListActions.empty();
                self.$popupList.removeAttr("data-add-widget");
                break;

            case "all":
                self.$testListActions.empty();
                self.$actionListActions.empty();
                self.$screenListActions.empty();
                self.$menuListActions.empty();
                self.$popupListActions.empty();

                self.$testList.removeAttr("data-add-widget");
                self.$actionList.removeAttr("data-add-widget");
                self.$screenList.removeAttr("data-add-widget");
                self.$menuList.removeAttr("data-add-widget");
                self.$popupList.removeAttr("data-add-widget");
                break;
            
            default:
                break;
        }
        return self;
    };

    /**
     * Switch to a test editor tab
     * @param  {string} type The name of the tab to switch to
     * @param  {Function} done A callback for completion
     * @return {SodaTestEditor} The current SodaTestEditor instance
     */
    this.switchToTab = function (type, done) {
        switch(type) {
            case "action":
                self.$currentList = self.$actionListActions;
                if(self.$actionList.is(":hidden")) self.$actionTab.trigger("click");
                break;

            case "screen":
                self.$currentList = self.$screenListActions;
                if(self.$screenList.is(":hidden")) self.$screenTab.trigger("click");
                break;

            case "menu":
                self.$currentList = self.$menuListActions;
                if(self.$menuList.is(":hidden")) self.$menuTab.trigger("click");
                break;

            case "popup":
                self.$currentList = self.$popupListActions;
                if(self.$popupList.is(":hidden")) self.$popupTab.trigger("click");
                break;

            default:
                self.$currentList = self.$testListActions;
                if(self.$testList.is(":hidden")) self.$testTab.trigger("click");
                break;
        }
        if(done instanceof Function) done.call(self);
        return self;
    };

    soda.delegates.on("post show #test-editor-editor-wrapper", function (show) {
        var dSuite  = $(show).find(".dynamic-suite"),
            dModule = $(show).find(".dynamic-module");

        if(dSuite.children("*[value='" + soda.framework.config.suite + "']").length > 0) {
            dSuite.find(".dynamic-suite").val(soda.framework.config.suite).trigger("change");
        }
        else {
            dSuite.prop('selectedIndex', 0).trigger("change");
        }

        if(dModule.children("*[value='" + soda.framework.config.module + "']").length > 0) {
            dModule.val(soda.framework.config.module).trigger("change");
        }
        else {
            dModule.prop('selectedIndex', 0).trigger("change");
        }
    });

    soda.on("editor shown", function () {
        $(".editor-list-sortable").sortable();
        self.$currentList = self.$testListActions;
        self.$testTab.trigger("click");
        soda.projectManager.buildDynamicHierarchy();
    });

    soda.projectManager.on("build complete", function () {
        soda.projectManager.buildDynamicHierarchy();
    });

    soda.delegates.on("post show #test-editor-editor-wrapper", function (item) {
        try {
            self.$currentList = $(item).find(".editor-list-sortable");
            var $toggle = $(item).find(".editor-toggle");
            if(soda.RAW_MODE.toString() != $toggle.attr("data-active")) $toggle.trigger("click");
        }
        catch (e) { /* No Op */ }
    });
};
