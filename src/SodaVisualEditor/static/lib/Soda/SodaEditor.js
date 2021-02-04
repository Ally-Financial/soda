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

var tids = 0;

/**
 * Manages the Soda VisualEditor core functionality
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 * @param {object} $editor The AJAX loaded contents specific to this class
 */
window.SodaEditor = function (soda, $editor) {

    var self      = this,
        toolboxes = {},

        /**
         * @associates SodaSettings
         * @type {SodaSettings}
         */
        SodaSettings = window.SodaSettings;

    $editor.toolboxWrapper      = $editor.self.find("#soda-toolboxes");
    $editor.toolboxWrapperRight = $editor.toolboxWrapper.find("#soda-toolbox-wrapper-right");
    $editor.toolboxWrapperLeft  = $editor.toolboxWrapper.find("#soda-toolbox-wrapper-left");
    $editor.toolboxes           = $editor.toolboxWrapper.find(".soda-toolbox");
    $editor.toolboxMenus        = $editor.toolboxWrapper.find(".soda-toolbox-menu");
    $editor.toolboxRightMenu    = $editor.toolboxWrapperRight.find(".soda-toolbox-menu-icons");
    $editor.toolboxLeftMenu     = $editor.toolboxWrapperLeft.find(".soda-toolbox-menu-icons");
    $editor.toolboxesRight      = $editor.toolboxWrapper.find(".soda-toolbox.right");
    $editor.toolboxesLeft       = $editor.toolboxWrapper.find(".soda-toolbox.left");

    $editor.nav            = $editor.self.find("#soda-navbar");
    $editor.refresh        = $editor.nav.find("#soda-refresh-button");
    $editor.stopFramework  = $editor.nav.find("#soda-shutdown-framework-button");
    $editor.shutdown       = $editor.nav.find("#soda-shutdown-button");
    $editor.downloadTree   = $editor.nav.find("#soda-download-tree-button");
    $editor.downloadScripts   = $editor.nav.find("#soda-download-scripts-button");
    $editor.downloadScreen = $editor.nav.find("#soda-download-screen-button");
    $editor.forceUpdate    = $editor.nav.find("#soda-force-update-project-button");

    $editor.contextMenu      = $editor.self.find("#soda-editor-context");
    $editor.contextHeader    = $editor.contextMenu.find("#soda-editor-context-header span");
    $editor.contextBody      = $editor.contextMenu.find("#soda-editor-context-body-content");
    $editor.contextBtnCancel = $editor.contextMenu.find("#soda-editor-context-button-cancel");
    $editor.contextBtnOkay   = $editor.contextMenu.find("#soda-editor-context-button-okay");

    // Ask the user if they really want to shutdown the server on click
    $editor.shutdown.click(function () {
        soda.editor.setContext({
            header      : "Kill the server?",
            body        : $("<p>Are you sure?</p><p style=\"font-size:12px;\">If you kill the server, the Soda VisualEditor will no longer be available until the process is restarted.<br><span class=\"bold\" style=\"color: #BF2828;\">If this isn't a local instance... don't even think about it.</span></p>"),
            okayText    : "Yes",
            cancelText  : "Cancel",
            onOkay      : function () {
                soda.editor.setContext({
                    header      : "Kill the server?",
                    body        : $("<p>Are you absolutely positive?</p>"),
                    okayText    : "Yes, do it!",
                    cancelText  : "Cancel",
                    onOkay      : soda.kill
                });
            }
        });
    });

    // Refresh the DOM on button click
    $editor.refresh.click(soda.refreshDOM);

    // Ask the user if they really want to stop the framework on click
    $editor.stopFramework.click(function () {
        soda.editor.setContext({
            header      : "Shutdown " + soda.framework.name.ucFirst + "?",
            body        : $("<p>Are you sure?</p>"),
            okayText    : "Yes",
            cancelText  : "Cancel",
            onOkay      : soda.stopFramework
        });
    });

    $editor.forceUpdate.click(function () {
        soda.screen.showLoading(true, function () {
            soda.editor.setStatus({
                which   : "left",
                icon    : "fa-warning",
                message : "Force updating project files<span class=\"dot-dot-dot\">...</span>"
            });

            soda.framework.getHierarchy(function () {
                soda.screen.hideLoading();
            });
        });
    });

    $editor.$saveFileModal = $(
        '<div id="save-file-modal-wrapper">' +
            '<div id="save-file-modal">' +
                '<div id="save-custom-text"></div>' +
                '<div class="input-group">' +
                    '<span class="input-group-addon"><em id="save-exists-icon" class="fa fa-check-circle"></em></span>' +
                    '<input id="save-file-filename" type="text" class="selector-input form-control" placeholder="Enter a filename...">' +
                    '<span class="input-group-addon soda-right-addon">.json</span>' +
                '</div>' +
                '<p class="selector-message filename-message">The chosen filename is available</p>' +
            '</div>' +
        '</div>'
    );

    // Hide the context when the user clicks the cancel button
    $editor.contextBtnCancel.click(function () {
        self.hideContext();
    });

    /**
     * True if the toolx is currently being resized, false otherwise
     * @type {Boolean}
     */
    this.toolboxIsBeingResized = false;

    // Download Tree Action
    $editor.downloadTree.click(function () {
        if(soda.framework.latestTree) {
            try {
                var file = "data:text/json;charset=utf-8," + encodeURIComponent(
                    JSON.stringify(
                        soda.framework.latestTree.contents,
                        function (key, value) {
                            if(/^__soda_/.test(key)) return undefined;
                            return value;
                        },
                        '    '
                    )
                );

                $(this).attr('href', file);
                $(this).attr('download', "tree.json");
                $(this).attr('target', "_blank");
            }
            catch(e) {
                console.error(e);
                soda.editor.setContext(
                    {
                        header      : "Something went wrong...",
                        body        : $("<p>Unable to download DOM tree.</p><p>Error: " + e.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
    });

    // Download Tree Action
    $editor.downloadScripts.click(function () {
      var data = {
          directory     : soda.framework.testPath
      };

      soda.send("zip scripts", data, function (err, res) {
        console.log(res);
          try {
            var file = "data:application/zip;charset=utf-8;base64," + encodeURIComponent(
                  res
              );

              window.location.href = file;
          }
          catch(e) {
              soda.editor.setContext(
                  {
                      header      : "Something went wrong...",
                      body        : $("<p>Unable to download screen image.</p><p>Error: " + e.message + "</p>"),
                      okayText    : "Okay",
                      omitCancel  : true
                  }
              );
          }
      });
    });

    // Download Screen Action
    $editor.downloadScreen.click(function () {
        if(soda.framework.latestScreen) {
            try {
                $(this).attr('href', "data:image/png;base64," + encodeURIComponent(soda.framework.latestScreen.base64));
                $(this).attr('download', "screenshot.png");
                $(this).attr('target', "_blank");
            }
            catch(e) {
                soda.editor.setContext(
                    {
                        header      : "Something went wrong...",
                        body        : $("<p>Unable to download screen image.</p><p>Error: " + e.message + "</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    }
                );
            }
        }
    });

    /**
     * Write an action
     * @param  {Object} asset The asset to write
     * @param  {Function} done A callback for completion
     * @return {undefined}
     */
    function writeAsset (asset, userFilepath, done) {
        soda.screen.showLoading(true, function () {
            soda.send("write asset", asset, function (err) {
                soda.screen.hideLoading();
                if(err) {
                    soda.editor.setContext({
                        header      : "Something went wrong...",
                        body        : $("<p>There was a problem with the server while trying to save the asset; try again later.</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    });
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-save",
                        message : "Error: unable to save " + userFilepath
                    });
                    if(done instanceof Function) done.call(self, err, false);
                }
                else {
                    soda.editor.setContext({
                        header      : "Asset Saved...",
                        body        : $("<p>Asset " + asset.name + " saved successfully!</p>"),
                        okayText    : "Okay",
                        omitCancel  : true
                    });
                    soda.editor.setStatus({
                        which   : "left",
                        icon    : "fa-save",
                        message : "Asset " + userFilepath + " saved successfully!"
                    });
    
                    setTimeout(function() {
                      $editor.self.find(".editor-suite").val(asset.suite);
                      $editor.self.find(".editor-module").val(asset.module);
                    }, 3000);
    
                    $("#soda-force-update-project-button").trigger("click");
    
                    if(done instanceof Function) done.call(self, err, true);
                }
            });
        });
    }

    /**
     * Converts an asset resolution object to its repsective file system path
     * @param {Object} a The asset to get the path for
     */
    function assetToPath (a) {
        var isGlobal = a.suite === "global",
            isCommon = a.module === "common",
            join;

        switch(true) {
            case isGlobal:
                join = [soda.framework.testPath, "global", a.type];
                break;

            case isCommon:
                join = [soda.framework.testPath, a.suite, "common", a.type];
                break;

            default:
                join = [soda.framework.testPath, a.suite, "modules", a.module, a.type];
        }
        return join.join("/") + "/";
    }

    /**
     * Save a file, dialogs will automatically be displayed (the test path will be pre-pended by the server to prevent weird/dangers file saves)
     * @param  {Object} asset The asset to write
     * @param  {string} customMsg A custom message to display on save, which will overwrite the default message
     * @param  {Function} done A callback for completion
     * @return {undefined}
     */
    this.writeAsset = function (asset, customMsg, done) {

        if(!done && customMsg instanceof Function) {
            done      = customMsg;
            customMsg = undefined;
        }

        if(typeof asset          === "object" &&
           typeof asset.suite    === "string" &&
           typeof asset.module   === "string" &&
           typeof asset.name     === "string" &&
           typeof asset.platform === "string" &&
           asset.contents
        ) {
            var path     = assetToPath(asset),
                basename = asset.name.replace(/^[^a-zA-Z0-9_.\-]/, '_');

            if(customMsg) {
                $editor.$saveFileModal.find("#save-custom-text").html(customMsg).show();
            }
            else {
                $editor.$saveFileModal.find("#save-custom-text").html("").hide();
            }

            soda.editor.setContext(
                {
                    header      : "Save Asset?",
                    body        : $editor.$saveFileModal,
                    okayText    : "Save",
                    cancelText  : "Cancel",

                    onInit: function () {
                        $("#save-file-filename").val(asset.name + (asset.platform === "generic" ? "" : "." + asset.platform))
                            .attr("data-asset-name", basename)
                            .attr("data-asset-suite", asset.suite)
                            .attr("data-asset-module", asset.module)
                            .attr("data-asset-platform", asset.platform)
                            .attr("data-asset-type", asset.type).trigger("keyup");
                    },
                    onCancel: function () {
                        soda.editor.setStatus({
                            which   : "left",
                            icon    : "fa-save",
                            message : "Save of " + path + basename + ".json cancelled"
                        });
                        if(done instanceof Function) done.call(self, null, false);
                    },
                    onOkay: function () {
                        var $saveFileFilename = $("#save-file-filename"),
                            userFilepath, filepath;

                        var $saveFn = $("#save-file-filename");
                        asset = {
                            name     : $saveFn.attr("data-asset-name"),
                            suite    : $saveFn.attr("data-asset-suite"),
                            module   : $saveFn.attr("data-asset-module"),
                            platform : $saveFn.attr("data-asset-platform"),
                            type     : $saveFn.attr("data-asset-type"),
                            contents : asset.contents
                        };


                        basename     = $saveFileFilename.val().replace(/^[^a-zA-Z0-9_.\-]/, '_');
                        filepath     = path + basename + ".json";
                        userFilepath = filepath.replace(/^\//, '');

                        soda.editor.setStatus({
                            which   : "left",
                            icon    : "fa-save",
                            message : "Saving asset " + userFilepath + '<span class="dot-dot-dot">...</span>'
                        });

                        soda.send("asset exists", asset, function (err, exists) {
                            if(exists) {
                                soda.editor.setContext(
                                    {
                                        header      : "Asset Already Exists",
                                        body        : $("<p>Asset " + userFilepath + " already exists. Overwrite?</p>"),
                                        okayText    : "Yes, Overwrite",
                                        cancelText  : "Cancel",
                                        onOkay      : function () {
                                            writeAsset(asset, userFilepath, done);
                                        },
                                        onCancel    : function () {
                                            soda.editor.setStatus({
                                                which   : "left",
                                                icon    : "fa-save",
                                                message : "Save of " + userFilepath + " cancelled"
                                            });
                                            if(done instanceof Function) done.call(self, null, false);
                                        }
                                    }
                                );
                            }
                            else {
                                writeAsset(asset, userFilepath, done);
                            }
                        });
                    }
                }
            );
        }
        else {
            soda.editor.setContext({
                header      : "Something went wrong...",
                body        : $("<p>There was an error tring to save the asset; try again later.</p>"),
                okayText    : "Okay",
                omitCancel  : true
            });
        }
    };

    /**
     * Hide the context menu
     * @param  {Function} done A callback for completion
     * @return {SodaEditor} The current SodaEditor instance
     */
    this.hideContext = function (done) {
        $editor.contextMenu.slideUp({
            duration : SodaSettings.SLIDEUP_FAST_SPEED,
            easing   : "easeOutBounce",
            always   : function () {
                if(done instanceof Function) done.call(self);
            }
        });
        return self;
    };

    /**
     * Show the context menu
     * @param  {Function} done A callback for completion
     * @return {SodaEditor} The current SodaEditor instance
     */
    this.showContext = function (done) {
        $editor.contextMenu.slideDown({
            duration : SodaSettings.SLIDEOPEN_SPEED,
            easing   : "easeOutBounce",
            always   : function () {
                if(done instanceof Function) done.call(self);
            }
        });
        return self;
    };

    /**
     * Hide the context menu (when the user clicks the "accept/okay" button)
     * @param  {Function} done A callback for completion
     * @return {SodaEditor} The current SodaEditor instance
     */
    this.acceptContext = function (done) {
        $editor.contextMenu.slideUp({
            duration : SodaSettings.FADEOUT_SPEED,
            easing   : "easeInOutExpo",
            always   : function () {
                if(done instanceof Function) done.call(self);
            }
        });
        return self;
    };

    /**
     * Set the context menu's content and display it
     * @param {object} options An object with the keys necessary to build the context menu: header, body, onOkay, onCancel, onInit, okayText, cancelText, omitCancel...
     * @param  {Function} done A callback for completion
     * @return {SodaEditor} The current SodaEditor instance
     */
    this.setContext = function (options, done) {
        if($editor.contextMenu.is(":visible")) {
            $("#soda-editor-context-wrapper").effect("shake", { direction: "left", distance: 40 }, 600);
            if(typeof options === "object" && options.onCancel instanceof Function) options.onCancel.call(self, $(this), $editor.contextMenu);
            return;
        }

        if(typeof options !== "object") return self;
        $editor.contextHeader.html(options.header || "Message");
        $editor.contextBody.html(options.body || "Are you sure you want to do this?");

        $("#soda-editor-context-form #soda-editor-context-button-okay").removeAttr("disabled");
        if(options.onInit instanceof Function) options.onInit.call(self, $editor.contextMenu);

        $editor.contextBtnOkay.text(options.okayText || "Okay");
        $editor.contextBtnCancel.text(options.cancelText || "Cancel");

        $editor.contextBtnOkay.unbind("click").click(function () {
            self.acceptContext(function () {
                if(options.onOkay instanceof Function)
                    options.onOkay.call(self, $(this), $editor.contextMenu);
            });
        });

        $editor.contextBtnCancel.unbind("click").click(function () {
            self.hideContext(function () {
                if(options.onCancel instanceof Function)
                    options.onCancel.call(self, $(this), $editor.contextMenu);
            });
        });

        if(options.omitCancel) {
            $editor.contextBtnCancel.hide();
        }
        else {
            $editor.contextBtnCancel.show();
        }
        if(options.dontShow !== true) self.showContext(done);
        return self;
    };

    /**
     * Initalize the SodaEditor
     * @return {SodaEditor} The current SodaEditor instance
     */
    this.init = function () {
        self.emit("init");
        return self;
    };

    /**
     * On resize set SodaEditor.toolboxIsBeingResized
     */
    $editor.toolboxWrapperLeft.resizable({
        handles  : "e",
        maxWidth : 1000,
        minWidth : 300,

        start: function () {
            self.toolboxIsBeingResized = true;
        },
        stop: function () {
            self.toolboxIsBeingResized = false;

            // Resize ace editors on panel resize
            for(var i in soda.testEditor.aceEditors) {
                if(soda.testEditor.aceEditors.hasOwnProperty(i) && soda.testEditor.aceEditors[i].resize) {
                    soda.testEditor.aceEditors[i].resize();
                }
            }
        }
    });

    /**
     * On resize set SodaEditor.toolboxIsBeingResized
     */
    $editor.toolboxWrapperRight.resizable({
        handles  : "e",
        maxWidth : 1000,
        minWidth : 300,

        start: function () {
            self.toolboxIsBeingResized = true;
        },
        stop: function () {
            self.toolboxIsBeingResized = false;
        }
    });

    /**
     * On window resize, fix the toolbox's height
     */
    $(window).on("resize", function () {
        var h = $(window).height() - $("#soda-status-bar").height() - $("#soda-navbar").height() - 75;
        $editor.toolboxWrapperRight.height(h);
        $editor.toolboxWrapperLeft.height(h);
    });

    /**
     * Set the $editor.status object to each status element and stauts element icon
     * @memberof window.SodaEditor
     * @type {Object}
     */
    $editor.status = {
        right: {
            icon   : $editor.self.find("#soda-status-right i"),
            status : $editor.self.find("#soda-status-right .status")
        },
        left: {
            icon   : $editor.self.find("#soda-status-left i"),
            status : $editor.self.find("#soda-status-left .status")
        },
        center: {
            icon   : $editor.self.find("#soda-status-center i"),
            status : $editor.self.find("#soda-status-center .status")
        }
    };

    // When the editor is show
    var scrollbarsAdded = false;
    soda.on("editor shown", function () {
        if(!scrollbarsAdded) {
            scrollbarsAdded = true;
            $editor.toolboxWrapperRight.mCustomScrollbar(SodaSettings.SCROLL_OPTIONS);
            $editor.toolboxWrapperLeft.mCustomScrollbar(SodaSettings.SCROLL_OPTIONS);
        }
        else {
            $editor.toolboxWrapperRight.mCustomScrollbar("update");
            $editor.toolboxWrapperLeft.mCustomScrollbar("update");
        }

        soda.editor
            .disableToolbox("test-monitor")
            .enableToolbox("test-runner");
    });

    // When the framework is stopped
    soda.on("framework stopped", function () { self.resetStatuses(); });

    /**
     * Reset the status bar messages and icons
     */
    this.resetStatuses = function () {
        self
            .setStatus({
                which   : "left",
                icon    : "none",
                message : ""
            })
            .setStatus({
                which   : "center",
                icon    : "none",
                message : ""
            })
            .setStatus({
                which   : "right",
                icon    : "none",
                message : ""
            });
        return self;
    };

    var statusTimeout = null;
    /**
     * Set a status message
     * @param {object} options An object with the keys "which", "icon", and "message"
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.setStatus = function (options) {
        if(typeof options === "object" && typeof options.message === "string") {
            if(statusTimeout) clearTimeout(statusTimeout);
            var which = "left";

            switch(options.which) {
                case "right":
                    which = "right";
                    break;

                case "middle":
                case "center":
                    which = "center";
                    break;
                
                default:
                    break;
            }

            $editor.status[which].icon
                .removeClass()
                .addClass("fa")
                .addClass(typeof options.icon === "string" ? (options.icon === "none" ? "" : options.icon) : "fa-info-circle");

            if(typeof options.iconColor === "string") {
                $editor.status[which].icon.css("color", options.iconColor);
            }
            else {
                $editor.status[which].icon.css("color", "rgb(51, 51, 51)");
            }

            $editor.status[which].status.html(options.message).show();

            if(typeof options.duration === "number") {
                statusTimeout = setTimeout(function () {
                    $editor.status[which].status.fadeOut(SodaSettings.FADEOUT_SLOW_SPEED, function () {
                        self.setStatus({
                            which   : which,
                            message : "",
                            icon    : "none"
                        });
                        $editor.status[which].status.show();
                    });
                }, options.duration * 1000);
            }
        }
        return self;
    };

    /**
     * Clear a status message
     * @param {string} which Which status to clear
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.clearStatus = function (Which) {
        var which = "left";

        switch(Which) {
            case "right":
                which = "right";
                break;

            case "middle":
            case "center":
                which = "center";
                break;
            default:
                break;
        }

        $editor.status[which].icon.removeClass();
        $editor.status[which].status.html("");
        return self;
    };

    /**
     * Switch to a toolbox (make it visible and hide all others on the same side)
     * @param  {string} named The name of the toolbox
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.switchToToolbox = function (named, done) {
        if(toolboxes[named] && toolboxes[named].disabled === false)
            self.showToolbox(toolboxes[named].toolbox, toolboxes[named].icon, done);
        return self;
    };

    /**
     * Disable a toolbox
     * @param  {string} named The name of the toolbox
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.disableToolbox = function (named) {
        if(toolboxes[named] && toolboxes[named].disabled === false) {
            self.hideToolbox(toolboxes[named].toolbox, toolboxes[named].icon);
            toolboxes[named].icon.addClass("disabled");
            toolboxes[named].disabled = true;
        }
        return self;
    };

    /**
     * Enable a toolbox
     * @param  {string} named The name of the toolbox
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.enableToolbox = function (named) {
        if(toolboxes[named]) {
            toolboxes[named].icon.removeClass("disabled");
            toolboxes[named].disabled = false;
        }
        return self;
    };

    /**
     * Show a toolbox, given the toolbox object and its icon
     * @param {jQuery} toolbox The toolbox object
     * @param {jQuery} icon The toolbox icon
     * @param {function=} done A callback for completion
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.showToolbox = function (toolbox, icon, done) {
        if($(toolbox).is(":visible")) {
            if(done instanceof Function) done.call(self, null);
        }
        else {
            var direction = "left";
            if($(toolbox).hasClass("right")) direction = "right";

            if (direction === "right") {
                $(".soda-toolbox.right").hide();
                $("#soda-toolbox-menu-right .soda-toolbox-menu-icons i").removeClass("active");
            }
            else {
                $(".soda-toolbox.left").hide();
                $("#soda-toolbox-menu-left .soda-toolbox-menu-icons i").removeClass("active");
            }

            $(icon).addClass("active");
            $(toolbox).fadeIn(SodaSettings.FADEIN_SPEED, function () {
                if(done instanceof Function) done.call(self, null);
            });
        }
        return self;
    };

    /**
     * Hide a toolbox, given the toolbox object and its icon
     * @param {jQuery} toolbox The toolbox object
     * @param {jQuery} icon The toolbox icon
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.hideToolbox = function (toolbox, icon) {
        $(icon).removeClass("active");
        $(toolbox).fadeOut(SodaSettings.FADEOUT_SLOW_SPEED);
        return self;
    };

    /**
     * Add a toolbox to the visual editor
     * @return {object<SodaEditor>} The current SodaEditor instance
     */
    this.addToolbox = function (options) {
        if(typeof options === "object" && options.name && options.content) {

            var tid      = tids++,
                $icon    = $('<em class="toolbox-icon fa ' + (options.icon || + 'fa-bolt') + '" data-toolbox-id="' + tid + '" data-toolbox-name="' + options.title + '" data-container="body" data-toggle="tooltip" data-placement="' + (options.side === "left" ? 'left' : 'right') + ' auto" title="' + options.title + '"></em>'),
                $content = $('<div id="toolbox-' + tid + '" data-id="' + tid + '" data-name="' + options.name + '" class="soda-toolbox"></div>'),
                toAppend = $(options.content).wrap('<div>').parent(),
                $appendedContent;

            $content.append('<div class="toolbox-container"><h1 class="toolbox-title inline"><em class="inline fa ' + (options.icon || + 'fa-bolt') + '"></em>' + (options.title || options.name) + '</h1></div>');
            $appendedContent = $('<div class="toolbox-content">' + toAppend.html() + "</div>").appendTo($content.children(".toolbox-container"));

            if (options.side === "right") {
                $content.addClass("right");
                $content = $content.appendTo($editor.toolboxWrapperRight);
                $icon    = $icon.appendTo($editor.toolboxRightMenu);

                $editor.toolboxRightMenu = $editor.toolboxWrapperRight.find(".soda-toolbox-menu-icons");
                $editor.toolboxesRight   = $editor.toolboxWrapper.find(".soda-toolbox.right");
            }
            else {
                $content.addClass("left");
                $content = $content.appendTo($editor.toolboxWrapperLeft);
                $icon    = $icon.appendTo($editor.toolboxLeftMenu);

                $editor.toolboxLeftMenu = $editor.toolboxWrapperLeft.find(".soda-toolbox-menu-icons");
                $editor.toolboxesLeft   = $editor.toolboxWrapper.find(".soda-toolbox.left");
            }

            $editor.toolboxMenus = $editor.toolboxWrapper.find(".soda-toolbox-menu");
            $editor.toolboxes    = $editor.toolboxWrapper.find(".soda-toolbox");

            $icon.click(function () {
                if(toolboxes[options.name].disabled === false && $content.is(":hidden")) {
                    self.showToolbox($content, $icon);
                }
            });

            toolboxes[options.name] = { toolbox: $content, icon: $icon, disabled: false };
            if(options.show === true) self.showToolbox($content, $icon);
            return $appendedContent.children();
        }
    };

    soda.on("framework initialized", function () {
        $('.toolbox-icon').remove();
        $(".soda-toolbox").remove();
    });
};
