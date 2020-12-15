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
 * @module SodaCore/Platform
 */

/**
 * A Soda platform
 * @param  {Suite} suite The suite that this platform will belong to
 * @param  {string} name The name of the platform
 * @constructor
 */
function Platform (suite, module, name) {
    var self    = this,
        tests   = {},
        actions = {},
        screens = {},
        menus   = {},
        popups  = {};

    /**
     * The platforms's name
     * @type {string}
     */
    this.name  = name  || "No name";

    /**
     * The suite to which this platform belongs
     * @type {Suite}
     * @associates Suite
     */
    this.suite = suite;

    /**
     * The module to which this platform belongs
     * @type {Module}
     * @associates Module
     */
    this.module = module;

    /**
     * Add a test to the platform
     * @param {Test} test The test to add to the platform
     * @composes Test
     */
    this.addTest = function (test) {
        tests[test.name] = test;
        return self;
    };

    /**
     * Add an Action to the platform
     * @param {Action} action The action to add to the platform
     * @composes Action
     */
    this.addAction = function (action) {
        actions[action.name] = action;
        return self;
    };

    /**
     * Add a Screen to the platform
     * @param {Screen} screen The screen to add to the platform
     * @composes Screen
     */
    this.addScreen = function (screen) {
        screens[screen.name] = screen;
        return self;
    };

    /**
     * Add an Menu to the platform
     * @param {Menu} menu The menu to add to the platform
     * @composes Menu
     */
    this.addMenu = function (menu) {
        menus[menu.name] = menu;
        return self;
    };

    /**
     * Add a Popup to the platform
     * @param {Action} popup The popup to add to the platform
     * @composes Popup
     */
    this.addPopup = function (popup) {
        popups[popup.name] = popup;
        return self;
    };

    /**
     * Get this platform's tests
     * @return {object<Test>} This platform's tests
     */
    this.getTests = function () {
        return tests;
    };

    /**
     * Get a specific test from this platform
     * @return {Test} A test object
     */
    this.getTest = function (named) {
        return tests[named] || null;
    };

    /**
     * Get this platform's actions
     * @return {object<Action>} This platform's actions
     */
    this.getActions = function () {
        return actions;
    };

    /**
     * Get a specific action from this platform
     * @return {Action} An action object
     */
    this.getAction = function (named) {
        return actions[named] || null;
    };

    /**
     * Get this platform's screens
     * @return {object<Screen>} This platform's screens
     */
    this.getScreens = function () {
        return screens;
    };

    /**
     * Get a specific screen from this platform
     * @return {Screen} A screen object
     */
    this.getScreen = function (named) {
        return screens[named] || null;
    };

    /**
     * Get this platform's menus
     * @return {object<Menu>} This platform's menus
     */
    this.getMenus = function () {
        return menus;
    };

    /**
     * Get a specific menu from this platform
     * @return {Menu} A menu object
     */
    this.getMenu = function (named) {
        return menus[named] || null;
    };

    /**
     * Get this platform's popups
     * @return {object<Popup>} This platform's popups
     */
    this.getPopups = function () {
        return popups;
    };

    /**
     * Get a specific popup from this platform
     * @return {Popup} A popup object
     */
    this.getPopup = function (named) {
        return popups[named] || null;
    };

    /**
     * Remove an action
     * @param  {string} named The name of the action to remove
     * @return {Platform} The current Platform instance
     */
    this.removeAction = function (named) {
        if(actions[named]) {
            actions[named] = null;
            delete actions[named];
        }
        return self;
    };

    /**
     * Remove a test
     * @param  {string} named The name of the test to remove
     * @return {Platform} The current Platform instance
     */
    this.removeTest = function (named) {
        if(tests[named]) {
            tests[named] = null;
            delete tests[named];
        }
        return self;
    };

    /**
     * Remove a screen
     * @param  {string} named The name of the screen to remove
     * @return {Platform} The current Platform instance
     */
    this.removeScreen= function (named) {
        if(screens[named]) {
            screens[named] = null;
            delete screens[named];
        }
        return self;
    };

    /**
     * Remove a menu
     * @param  {string} named The name of the menu to remove
     * @return {Platform} The current Platform instance
     */
    this.removeMenu = function (named) {
        if(menus[named]) {
            menus[named] = null;
            delete menus[named];
        }
        return self;
    };

    /**
     * Remove a popup
     * @param  {string} named The name of the popup to remove
     * @return {Platform} The current Platform instance
     */
    this.removePopup = function (named) {
        if(popups[named]) {
            popups[named] = null;
            delete popups[named];
        }
        return self;
    };
}

module.exports = Platform;
