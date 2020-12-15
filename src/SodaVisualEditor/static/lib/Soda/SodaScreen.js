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
 * Manages the screen, and hoverable screen elements.
 * @constructor
 * @param {Soda} soda The window.Soda instance
 * @param {object} $project The AJAX loaded contents specific to this class
 */
window.SodaScreen = function (soda, $screen) {

    var self           = this,

        /**
         * @associates SodaSettings
         * @type {SodaSettings}
         */
        SodaSettings = window.SodaSettings,
        resizeTimeout;

    /**
     * If an element is "pinned" in place true, false otherwise
     * @type {Boolean}
     */
    this.hoverBoxTacked = false;

    /**
     * The current screen image dimensions and other information, such as the ratio to the
     * actual image size to the displayed image size, and the image denisty in relation to
     * elements positions
     * @type {Object}
     */
    this.screenDimensions = {
        original: {
            height : 0,
            width  : 0,
            scale  : 1,
            ratio  : 1,
            density: 2
        },
        actual: {
            height : 0,
            width  : 0,
            scale  : 1,
            ratio  : 1
        }
    };

    /**
     * The current screen mouse position with properties x and y
     * @type {Object}
     */
    this.currentMousePos = { x: 0, y: 0 };

    $screen.self     = $screen.self.prependTo(soda.$editor.self);
    $screen.wrapper  = $screen.self.children("#soda-screen-wrapper");
    $screen.elements = $screen.wrapper.children("#screen-elements");
    $screen.hoverBox = $screen.wrapper.children("#element-hover-box");
    $screen.loading  = $screen.wrapper.children("#screen-loading");

    /**
     * When the window is resized, adjust the screen image size to fit within
     * the toolboxes and center it on screen
     */
    $(window).on("resize", function () {
        if(soda.framework.started && soda.framework.name) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                $screen.hoverBox.width(0).height(0);
                self.adjustScreenWidth(function () {
                    $(".screen-element").each(function () {
                        var dim = self.getScreenElementDimensionsForElement($(this).attr("data-id"));
                        if(dim) {
                            $(this)
                                .css("width"  , dim.w)
                                .css("height" , dim.h)
                                .css("left"   , dim.x)
                                .css("top"    , dim.y);
                        }
                    });
                });
            }, 300);
        }
    });

    /**
     * Update the mouse coordinates when the mouse is moved.
     * Also update the on screen coordinates status.
     */
    $(document).mousemove(function(e) {
        self.currentMousePos.x = e.pageX;
        self.currentMousePos.y = e.pageY;

        if($("#soda-screen-wrapper:hover").length > 0) {
            var pos = $screen.wrapper.offset(),
                x = (self.currentMousePos.x - pos.left) * self.screenDimensions.original.width  / self.screenDimensions.actual.width,
                y = (self.currentMousePos.y - pos.top)  * self.screenDimensions.original.height / self.screenDimensions.actual.height;
            $("#xy-coords").text("[" + parseInt(x, 10) + ", " + parseInt(y, 10) + "]");
        }
    });

    /**
     * If "outline" mode is enable, true. False otherwise.
     * @type {Boolean}
     */
    this.outlineModeEnabled = true;

    /**
     * Sets the outline for the specified screen element
     * @param {jQuery} $e The screen element to outline
     * @param {Boolean} outline True will set the element outline, false will remove it
     * @return {SodaScreen} The current SodaScreen instance
     */
    this.setOutlineForElement = function ($e, outline) {
        if(outline) {
            $e.css("border-radius", "5px").css("border", "1px dashed #252525");
        }
        else {
            $e.css("border-radius", "0").css("border", "none");
        }
        return self;
    };

    /**
     * Toggles outline mode on and off
     * @return {SodaScreen} The current SodaScreen instance
     */
    this.toggleOutlineMode = function () {
        return self.setOutlineModeForAllElements(!self.outlineModeEnabled);
    };

    /**
     * Sets the outline mode for all elements
     * @param {Boolean} outline True will set all elements to outline mode, false will turn off outline mode
     * @return {SodaScreen} The current SodaScreen instance
     */
    this.setOutlineModeForAllElements = function (outline) {
        if(outline) {
            soda.editor.setStatus({
                which: "left",
                message: "Outline mode <span class=\"bold\">enabled</span>"
            });

            self.outlineModeEnabled = true;
            $(".screen-element").each(function () {
                self.setOutlineForElement($(this), true);
            });
            soda.delegates.stashed.forEach(function (e) {
                self.setOutlineForElement($(e), true);
            });
        }
        else {
            soda.editor.setStatus({
                which: "left",
                message: "Outline mode <span class=\"bold\">disabled</span>"
            });

            $(".screen-element").each(function () {
                self.setOutlineForElement($(this), false);
            });
            soda.delegates.stashed.forEach(function (e) {
                self.setOutlineForElement($(e), false);
            });
            self.outlineModeEnabled = false;
        }
        return self;
    };

    /**
     * Show the screen loading blackout
     * @return {SodaScreen} The current SodaScreen instance
     */
    this.showLoading = function (dontEmpty, done) {

        if(!done && dontEmpty instanceof Function) {
            done      = dontEmpty;
            dontEmpty = undefined;
        }

        if(!dontEmpty) $screen.elements.empty();
        $screen.hoverBox
            .width(0)
            .height(0)
            .css("left", 0)
            .css("top", 0);

        self.hoverBoxTacked = false;
        $screen.loading.fadeIn(SodaSettings.FADEIN_SPEED, function () {
            if(done instanceof Function) done.call(self);
        });

        return self;
    };

    /**
     * Hide the screen loading blackout
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.hideLoading = function () {
        $screen.loading.fadeOut(SodaSettings.FADEOUT_SLOW_SPEED);
    };

    /**
     * Return a "color scheme" object given element "e" based on the element's type
     * @param  {object} e The element to get the color for
     * @return {object} An object containing CSS colors
     */
    this.getColorSchemeForElement = function (e) {
        var bkgColor, borderColor, dark, darkBorder;
        switch (e.type) {
            case "button":
                bkgColor    = "rgba(175, 0, 0, .4)";
                borderColor = "rgba(175, 0, 0, .5)";
                dark        = "rgba(175, 0, 0, .6)";
                darkBorder  = "rgba(175, 0, 0, .8)";
                break;

            case "statictext":
            case "textview":
            case "span":
            case "div":
                bkgColor    = "rgba(0, 175, 0, .4)";
                borderColor = "rgba(0, 175, 0, .5)";
                dark        = "rgba(0, 175, 0, .6)";
                darkBorder  = "rgba(0, 175, 0, .8)";
                break;

            case "image":
            case "imageview":
            case "img":
                bkgColor    = "rgba(0, 0, 175, .4)";
                borderColor = "rgba(0, 0, 175, .5)";
                dark        = "rgba(0, 0, 175, .6)";
                darkBorder  = "rgba(0, 0, 175, .8)";
                break;

            case "textfield":
            case "securetextfield":
            case "edittext":
            case "input":
                bkgColor    = "rgba(175, 0, 175, .4)";
                borderColor = "rgba(175, 0, 175, .5)";
                dark        = "rgba(175, 0, 175, .6)";
                darkBorder  = "rgba(175, 0, 175, .8)";
                break;

            case "tableviewcell":
            case "td":
                bkgColor    = "rgba(0, 175, 175, .4)";
                borderColor = "rgba(0, 175, 175, .5)";
                dark        = "rgba(0, 175, 175, .6)";
                darkBorder  = "rgba(0, 175, 175, .8)";
                break;

            case "tableview":
            case "linearlayout":
            case "table":
            case "tr":
                bkgColor    = "rgba(175, 175, 0, .4)";
                borderColor = "rgba(175, 175, 0, .5)";
                dark        = "rgba(175, 175, 0, .6)";
                darkBorder  = "rgba(175, 175, 0, .8)";
                break;

            case "a":
                bkgColor    = "rgba(255, 87, 0, .4)";
                borderColor = "rgba(255, 87, 0, .5)";
                dark        = "rgba(255, 87, 0, .6)";
                darkBorder  = "rgba(255, 87, 0, .8)";
                break;

            default:
                bkgColor    = "rgba(0, 0, 0, .4)";
                borderColor = "rgba(0, 0, 0, .5)";
                dark        = "rgba(0, 0, 0, .6)";
                darkBorder  = "rgba(0, 0, 0, .8)";
                break;
        }
        return { bkg: bkgColor, border: borderColor, dark: dark, darkBorder: darkBorder  };
    };

    /**
     * Adjust the screen's width based on the window size and width of the left and right toolboxes
     * @param  {Function} done A callback for completion
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.adjustScreenWidth = function (done) {
        var adjustedLeft  = 0,
            maxWidth      =
                ($(window).width()                       -
                soda.$editor.toolboxWrapperLeft.width()  -
                soda.$editor.toolboxWrapperRight.width() -
                140),

            wrapperHeight = $screen.self.height(),
            wrapperWidth  = maxWidth;

            self.screenDimensions.actual.scale = (self.screenDimensions.original.ratio < 1) ? // Ratio < 1 === Height > Width
                self.screenDimensions.actual.scale = wrapperHeight / self.screenDimensions.original.height :
                self.screenDimensions.actual.scale = wrapperWidth  / self.screenDimensions.original.width  ;

            if (soda.framework.platform.toLowerCase() === "iphoneweb" || soda.framework.platform.toLowerCase() === "ipadweb" || soda.framework.platform.toLowerCase() === "androidweb" || soda.framework.platform.toLowerCase() === "androidtabweb") {
                console.log("Finding dimensions:", width, height, parseFloat(height / width).toFixed(2).toString());

                self.screenDimensions.original.density = 1;
            }
            else if(soda.framework.name.toLowerCase() === "perfecto" || soda.framework.name.toLowerCase() === "instruments" || soda.framework.platform.toLowerCase() === "android" || soda.framework.platform.toLowerCase() === "androidtab") {
                var width  = self.screenDimensions.original.width,
                    height = self.screenDimensions.original.height;

                console.log("Finding dimensions:", width, height, parseFloat(height / width).toFixed(2).toString());

                // Apple takes the screen shot at actual size, but the element positions are all relative to 1024x768
                // so we need the density of the image to calculate the actual screen element positions
                switch(parseFloat(height / width).toFixed(2).toString()) {
                    case "0.53":
                        self.screenDimensions.original.density = height > width ? height / 1930 : width / 1930;
                        break;
                    case "1.60":
                    case "0.62":
                    case "1.33":
                    case "0.75":
                         self.screenDimensions.original.density = height > width ? height / 1024 : width / 1024;
                        break;

                    case "0.56":
                    case "1.78":
                    case "1.77":
                        if(height.toString() === "1334" || width.toString() === "1334") {
                             self.screenDimensions.original.density = height > width ? height / 667 : width / 667;
                        }
                        else if(height.toString() === "1920" || width.toString() === "1080") {
                             self.screenDimensions.original.density = height > width ? height / 1920 : width / 1920;
                        }
                        else if(height.toString() === "1136" || width.toString() === "1136") {
                             self.screenDimensions.original.density = height > width ? height / 568 : width / 568;
                        }
                        else if(height.toString() === "2208" || width.toString() === "1242") {
                             self.screenDimensions.original.density = height > width ? height / 2208 : width / 2208;
                        }
                        else {
                             self.screenDimensions.original.density = height > width ? height / 736 : width / 736;
                        }
                        break;

                    default:
                         self.screenDimensions.original.density = 1;

                }
            }
            else {
                if (soda.framework.device.toLowerCase() === "mozilla firefox" || soda.framework.device.toLowerCase() === "firefox" || soda.framework.platform.toLowerCase() === "android") {
                    self.screenDimensions.original.density = 1;
                }
                else {
                    switch(window.devicePixelRatio) {
                        case 2:
                        case 2.5:
                             self.screenDimensions.original.density = 2;
                            break;

                        default:
                             self.screenDimensions.original.density = 1;

                    }
                }
            }

        self.screenDimensions.actual.height = self.screenDimensions.original.height * self.screenDimensions.actual.scale;
        self.screenDimensions.actual.width  = self.screenDimensions.original.width  * self.screenDimensions.actual.scale;

        if(self.screenDimensions.actual.width > maxWidth) {
            self.screenDimensions.actual.height *= maxWidth / self.screenDimensions.actual.width;
            self.screenDimensions.actual.width   = maxWidth;
        }

        self.screenDimensions.actual.scale = (self.screenDimensions.original.ratio < 1) ? // Ratio < 1 === Height > Width
            self.screenDimensions.actual.scale = self.screenDimensions.actual.height / self.screenDimensions.original.height :
            self.screenDimensions.actual.scale = self.screenDimensions.actual.width  / self.screenDimensions.original.width  ;

        adjustedLeft = soda.$editor.toolboxWrapperLeft.width()  + 70 + ((maxWidth - self.screenDimensions.actual.width) / 2);
        self.screenDimensions.actual.ratio = self.screenDimensions.actual.height / self.screenDimensions.original.height;

        $screen.wrapper.animate(
            {
                width  : self.screenDimensions.actual.width,
                height : self.screenDimensions.actual.height,
                left   : adjustedLeft
            },
            {
                easing : "easeInOutExpo",
                always : function () {
                    if(done instanceof Function) done.call(self);
                }
            }
        );

        console.log("Setting actual screen dimensions to:", self.screenDimensions.actual, "and left", adjustedLeft);
        return self;
    };

    /**
     * Move the element highlight box to position of element "e"
     * @param  {object} e The element to move the highlight box over
     * @param  {object} options The element's positional information, as provided by SodaScreen.getScreenElementDimensionsForElement
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.animateHoverBoxUsingElement = function (e, options) {
        var w, h, x, y, color;
        if(!options) {
            w = (e.rect.size.width  * self.screenDimensions.original.density * self.screenDimensions.actual.scale) + 10;
            h = (e.rect.size.height * self.screenDimensions.original.density * self.screenDimensions.actual.scale) + 10;
            x = (e.rect.origin.x    * self.screenDimensions.original.density * self.screenDimensions.actual.scale) - 5;
            y = (e.rect.origin.y    * self.screenDimensions.original.density * self.screenDimensions.actual.scale) - 5;
            color = self.getColorSchemeForElement(e);
        }

        $screen.hoverBox.stop(false, false).animate({
            width               : options ? options.width        : w,
            height              : options ? options.height       : h,
            top                 : options ? options.top          : y,
            left                : options ? options.left         : x,
            "background-color"  : options ? options.color.bkg    : color.bkg,
            "border-color"      : options ? options.color.border : color.border
        }, 50);
        return self;
    };

    /**
     * Retrieves the screen dimenstions for the given element, as it appears on the screen (actual dimenstions)
     * @param  {object} e The element to move the highlight box over
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.getScreenElementDimensionsForElement = function (e) {
        if(typeof e === "number" || typeof e === "string") e = soda.tree.getElementWithWid(e);
        if(e && typeof e === "object") {
            var w = (e.rect.size.width  * self.screenDimensions.original.density * self.screenDimensions.actual.scale) + 10,
                h = (e.rect.size.height * self.screenDimensions.original.density * self.screenDimensions.actual.scale) + 10,
                x = (e.rect.origin.x    * self.screenDimensions.original.density * self.screenDimensions.actual.scale) - 5,
                y = (e.rect.origin.y    * self.screenDimensions.original.density * self.screenDimensions.actual.scale) - 5;
            return { w: w, h: h, x: x, y: y };
        }
        return null;
    };

    /**
     * Creates an HTML "screen element" for element "e"
     * @param  {object} e The element to move the highlight box over
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.createElementBoxForElement = function (e) {
        var eBox  = $('<div class="screen-element" data-id="' + e.wid + '"></div>').appendTo($screen.elements),
            dim   = self.getScreenElementDimensionsForElement(e),
            color = self.getColorSchemeForElement(e);

        eBox.hover(function (event) {
            if(!soda.editor.toolboxIsBeingResized && !self.hoverBoxTacked) {
                event.stopPropagation();
                var dim = self.getScreenElementDimensionsForElement(e);
                self.animateHoverBoxUsingElement(e, { width: dim.w, height: dim.h, left: dim.x, top: dim.y, color: color });
            }
        });

        eBox
            .css("width"  , dim.w)
            .css("height" , dim.h)
            .css("left"   , dim.x)
            .css("top"    , dim.y)
            .css("z-index", e.level);

        self.setOutlineForElement(eBox, self.outlineModeEnabled);
        return eBox;
    };

    /**
     * Set the screen image
     * @param {object} screenObject The screen's information as provided by the server
     * @param {Function} done A callback for completion
     * @return {SodaScreen} The current Soda Screen instance
     */
    this.set = function (screenObject, done) {
        $screen.wrapper.hide();
        var i = document.createElement('img');

        i.addEventListener('load', function() {
            self.screenDimensions.original.width  = i.width;
            self.screenDimensions.original.height = i.height;
            self.screenDimensions.original.ratio  = i.width / i.height;
            $screen.wrapper.fadeIn(SodaSettings.FADEIN_SPEED);
            self.adjustScreenWidth();
            console.log("DOM image loaded with dimensions:", self.screenDimensions);
            if(done instanceof Function) done.call(self);
        });

        i.src = "data:image/png;base64," + screenObject.base64;
        $screen.wrapper.css("background-image", "url(data:image/png;base64," + screenObject.base64 + ")");
        return self;
    };
};
