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
 * @module SodaCore/AssetTypes
 */

var path  = require("path"),
    Asset = require(path.join(__dirname, "Asset"));

/**
 * A representation of a test
 * @param {Module} module The module that this test will belong to
 * @param {string} name The name of the test
 * @param {string} filepath The path to the test
 * @constructor
 * @augments Asset
 */
exports.Test = function (soda, suite, module, platform, name, filepath) {
    Asset.call(this, soda, suite, module, platform, name, filepath);
    this.type = "test";
};

/**
 * A representation of an action
 * @param {Module} module The module that this action will belong to
 * @param {string} name The name of the action
 * @param {string} filepath The path to the action
 * @augments Asset
 * @constructor
 */
exports.Action = function (soda, suite, module, platform, name, filepath) {
    Asset.call(this, soda, suite, module, platform, name, filepath);
    this.type = "action";
};

/**
 * A representation of a screen
 * @param {Module} module The module that this screen will belong to
 * @param {string} name The name of the screen
 * @param {string} filepath The path to the screen
 * @augments Asset
 * @constructor
 */
exports.Screen = function (soda, suite, module, platform, name, filepath) {
    Asset.call(this, soda, suite, module, platform, name, filepath);
    this.type = "screen";
};

/**
 * A representation of a popup
 * @param {Module} module The module that this popup will belong to
 * @param {string} name The name of the popup
 * @param {string} filepath The path to the popup
 * @augments Asset
 * @constructor
 */
exports.Popup = function (soda, suite, module, platform, name, filepath) {
    Asset.call(this, soda, suite, module, platform, name, filepath);
    this.type = "popup";
};

/**
 * A representation of a menu
 * @param {Module} module The module that this menu will belong to
 * @param {string} name The name of the menu
 * @param {string} filepath The path to the menu
 * @augments Asset
 * @constructor
 */
exports.Menu = function (soda, suite, module, platform, name, filepath) {
    Asset.call(this, soda, suite, module, platform, name, filepath);
    this.type = "menu";
};
