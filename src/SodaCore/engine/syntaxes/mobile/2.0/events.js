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
 * @module Engine/Syntaxes/Mobile
 * @description The mobile v2.0 Soda stynax
 */

// *** EVENT KEYS MUST BE IN ALPHABETICAL ORDER!!! *** //

module.exports = function (action, $) {

    var path     = require("path"),
        mobileV2 = require(path.join(__dirname, "function"));

    ///////////////////////////////////////////////////// SCREENS //////////////////////////////////////////////////////

    action.on("screen/components/*/:assert:exists:using"            , $.core.assertExistsUsing            , "screen", "assert", "Assert that an element (or set of elements) exists or does not exist, using an element's name, id, label, value, or selector"                                   );
    action.on("screen/components/*/:assert:exists"                  , $.core.assertExists                 , "screen", "assert", "Assert that an element (or set of elements) exists or does not exist. If the value of the exists key is true it will assert existence, otherwise non-existence" );
    action.on("screen/components/*/:assert:matches:property"        , $.core.assertMatchesProperty        , "screen", "assert", "Assert that the matched set of elements match a regular expression for the specified property, using a name, id, label, value, or selector"                     );
    action.on("screen/components/*/:assert:matches:property:using"  , $.core.assertMatchesUsingProperty   , "screen", "assert", "Assert that the matched set of elements match a regular expression for the specified property"                                                                  );
    action.on("screen/components/*/:assert:matches:using"           , $.core.assertMatchesUsing           , "screen", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions, using a name, id, label, value, or selector"                    );
    action.on("screen/components/*/:assert:matches"                 , $.core.assertMatches                , "screen", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions"                                                                 );
    action.on("screen/components/*/:assert:is:property"             , $.core.assertIsProperty             , "screen", "assert", "Assert that the specified property of the returned elements have the provided value"                                                                            );
    action.on("screen/components/*/:assert:is:property:using"       , $.core.assertIsUsingProperty        , "screen", "assert", "Assert that the specified property of the returned elements have the provided value, using an element's name, id, label, value, or selector"                    );
    action.on("screen/components/*/:assert:is:using"                , $.core.assertIsUsing                , "screen", "assert", "Assert that an element (or set of elements) has the provided value, using a name, id, label, value, or selector"                                                );
    action.on("screen/components/*/:assert:is"                      , $.core.assertIs                     , "screen", "assert", "Assert that an element (or set of elements) has the provided value"                                                                                             );
    action.on("screen/components/*/:assert:hasCount:using"          , $.core.assertHasCountUsing          , "screen", "assert", "Assert that the given selector, name, id, or value returns the provided number of elements"                                                                     );
    action.on("screen/components/*/:assert:hasCount"                , $.core.assertHasCount               , "screen", "assert", "Assert that the given selector returns the provided number of elements"                                                                                         );

    ////////////////////////////////////////////////////// MENUS ///////////////////////////////////////////////////////

    action.on("menu/components/*/:assert:exists:using"            , $.core.assertExistsUsing            , "menu", "assert", "Assert that an element (or set of elements) exists or does not exist, using an element's name, id, label, value, or selector"                                   );
    action.on("menu/components/*/:assert:exists"                  , $.core.assertExists                 , "menu", "assert", "Assert that an element (or set of elements) exists or does not exist. If the value of the exists key is true it will assert existence, otherwise non-existence" );
    action.on("menu/components/*/:assert:matches:property"        , $.core.assertMatchesProperty        , "menu", "assert", "Assert that the matched set of elements match a regular expression for the specified property, using a name, id, label, value, or selector"                     );
    action.on("menu/components/*/:assert:matches:property:using"  , $.core.assertMatchesUsingProperty   , "menu", "assert", "Assert that the matched set of elements match a regular expression for the specified property"                                                                  );
    action.on("menu/components/*/:assert:matches:using"           , $.core.assertMatchesUsing           , "menu", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions, using a name, id, label, value, or selector"                    );
    action.on("menu/components/*/:assert:matches"                 , $.core.assertMatches                , "menu", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions"                                                                 );
    action.on("menu/components/*/:assert:is:property"             , $.core.assertIsProperty             , "menu", "assert", "Assert that the specified property of the returned elements have the provided value"                                                                            );
    action.on("menu/components/*/:assert:is:property:using"       , $.core.assertIsUsingProperty        , "menu", "assert", "Assert that the specified property of the returned elements have the provided value, using an element's name, id, label, value, or selector"                    );
    action.on("menu/components/*/:assert:is:using"                , $.core.assertIsUsing                , "menu", "assert", "Assert that an element (or set of elements) has the provided value, using a name, id, label, value, or selector"                                                );
    action.on("menu/components/*/:assert:is"                      , $.core.assertIs                     , "menu", "assert", "Assert that an element (or set of elements) has the provided value"                                                                                             );
    action.on("menu/components/*/:assert:hasCount:using"          , $.core.assertHasCountUsing          , "menu", "assert", "Assert that the given selector, name, id, or value returns the provided number of elements"                                                                     );
    action.on("menu/components/*/:assert:hasCount"                , $.core.assertHasCount               , "menu", "assert", "Assert that the given selector returns the provided number of elements"                                                                                         );

    ///////////////////////////////////////////////////// POPUPS ///////////////////////////////////////////////////////

    action.on("popup/components/*/:assert:exists:using"            , $.core.assertExistsUsing            , "popup", "assert", "Assert that an element (or set of elements) exists or does not exist, using an element's name, id, label, value, or selector"                                   );
    action.on("popup/components/*/:assert:exists"                  , $.core.assertExists                 , "popup", "assert", "Assert that an element (or set of elements) exists or does not exist. If the value of the exists key is true it will assert existence, otherwise non-existence" );
    action.on("popup/components/*/:assert:matches:property"        , $.core.assertMatchesProperty        , "popup", "assert", "Assert that the matched set of elements match a regular expression for the specified property, using a name, id, label, value, or selector"                     );
    action.on("popup/components/*/:assert:matches:property:using"  , $.core.assertMatchesUsingProperty   , "popup", "assert", "Assert that the matched set of elements match a regular expression for the specified property"                                                                  );
    action.on("popup/components/*/:assert:matches:using"           , $.core.assertMatchesUsing           , "popup", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions, using a name, id, label, value, or selector"                    );
    action.on("popup/components/*/:assert:matches"                 , $.core.assertMatches                , "popup", "assert", "Assert that the matched set of elements have a value that passes the given regular expressions"                                                                 );
    action.on("popup/components/*/:assert:is:property"             , $.core.assertIsProperty             , "popup", "assert", "Assert that the specified property of the returned elements have the provided value"                                                                            );
    action.on("popup/components/*/:assert:is:property:using"       , $.core.assertIsUsingProperty        , "popup", "assert", "Assert that the specified property of the returned elements have the provided value, using an element's name, id, label, value, or selector"                    );
    action.on("popup/components/*/:assert:is:using"                , $.core.assertIsUsing                , "popup", "assert", "Assert that an element (or set of elements) has the provided value, using a name, id, label, value, or selector"                                                );
    action.on("popup/components/*/:assert:is"                      , $.core.assertIs                     , "popup", "assert", "Assert that an element (or set of elements) has the provided value"                                                                                             );
    action.on("popup/components/*/:assert:hasCount:using"          , $.core.assertHasCountUsing          , "popup", "assert", "Assert that the given selector, name, id, or value returns the provided number of elements"                                                                     );
    action.on("popup/components/*/:assert:hasCount"                , $.core.assertHasCount               , "popup", "assert", "Assert that the given selector returns the provided number of elements"                                                                                         );

    ///////////////////////////////////////////////////// ACTIONS //////////////////////////////////////////////////////

    action.on("actions/*/:options:swipe:refresh:using"              , mobileV2.swipeUsingOptions  , "action", "swipe", "Swipe an element, with the provided options. If the value of refresh is false, the DOM will not be reloaded");
    action.on("actions/*/:options:swipe:using"                      , mobileV2.swipeUsingOptions  , "action", "swipe", "Swipe an element, with the provided options, using a name, label, id, value, or selector"                   );
    action.on("actions/*/:swipe:using"                              , mobileV2.swipeUsing         , "action", "swipe", "Swipe an element, using a name, label, id, value, or selector"                                              );
    action.on("actions/*/:options:refresh:swipe"                    , mobileV2.swipeOptions       , "action", "swipe", "Swipe an element, with the provided options. If the value of refresh is false, the DOM will not be reloaded");
    action.on("actions/*/:options:swipe"                            , mobileV2.swipeOptions       , "action", "swipe", "Swipe an element, with the provided options"                                                                );
    action.on("actions/*/:refresh:swipe"                            , mobileV2.swipe              , "action", "swipe", "Swipe an element, If the value of refresh is false, the DOM will not be reloaded"                           );
    action.on("actions/*/:swipe"                                    , mobileV2.swipe              , "action", "swipe", "Swipe an element, using the default options"                                                                );

    action.on("actions/*/:hideAppFor"                               , mobileV2.hideAppFor         , "action", "hideAppFor"   , "Hide the application for the duration specified", true);

    action.on("actions/*/:monkey"                                   , mobileV2.monkey             , "action", "monkey"       , "Tap n random elements", true);
    action.on("actions/*/:monkey:selector"                          , mobileV2.monkey             , "action", "monkey"       , "Tap n random elements, filtering with the given selector", true);
    action.on("actions/*/:monkey:randomTouchEffects"                , mobileV2.monkey             , "action", "monkey"       , "Tap n random elements and using a random number of touches and a random touch duration", true);
    action.on("actions/*/:monkey:randomTouchEffects:selector"       , mobileV2.monkey             , "action", "monkey"       , "Tap n random elements, filtering with the given selector and using a random number of touches and a random touch duration", true);

    action.on("actions/*/:monkey:randomRotation:"                            , mobileV2.monkey    , "action", "monkey"       , "Tap n random elements, with occasional random device rotation", true);
    action.on("actions/*/:monkey:randomRotation:selector"                    , mobileV2.monkey    , "action", "monkey"       , "Tap n random elements, filtering with the given selector and occasional random device rotation", true);
    action.on("actions/*/:monkey:randomRotation:randomTouchEffects"          , mobileV2.monkey    , "action", "monkey"       , "Tap n random elements and using a random number of touches, a random touch duration, and occasional random device rotation", true);
    action.on("actions/*/:monkey:randomRotation:randomTouchEffects:selector" , mobileV2.monkey    , "action", "monkey"       , "Tap n random elements, filtering with the given selector, using a random number of touches and a random touch duration, and occasional random device rotation", true);

    action.on("actions/*/:superMonkey"                              , mobileV2.superMonkey        , "action", "superMonkey"  , "Tap n random screen points", true);
    action.on("actions/*/:ultraMonkey"                              , mobileV2.ultraMonkey        , "action", "ultraMonkey"  , "Tap n random screen points", true);

    action.on("actions/*/:options:using:refresh:tap"                , mobileV2.tapUsingOptions    , "action", "tap", "Tap an element, using the provided options"                                                   );
    action.on("actions/*/:options:tap:using"                        , mobileV2.tapUsingOptions    , "action", "tap", "Tap an element, using the provided options and using a name, label, id, value, or selector"   );
    action.on("actions/*/:tap:using:refresh"                        , mobileV2.tapUsing           , "action", "tap", "Tap an element. If the value of refresh is false, the DOM will not be reloaded"               );
    action.on("actions/*/:tap:using"                                , mobileV2.tapUsing           , "action", "tap", "Tap an element, using a name, label, id, value, or selector"                                  );
    action.on("actions/*/:options:tap"                              , mobileV2.tapOptions         , "action", "tap", "Tap an element, using the provided options"                                                   );
    action.on("actions/*/:refresh:tap"                              , mobileV2.tap                , "action", "tap", "Tap an element, setting refresh to false will prevent the DOM from reloading"                 );
    action.on("actions/*/:tap"                                      , mobileV2.tap                , "action", "tap", "Tap an element, using the default options"                                                    );

    action.on("actions/*/:tapAll:options:refresh:using"              , mobileV2.tapAllUsingOptions  , "action", "tapAll", "Tap all elements in the returned set, one after another, using the provided options object and using a name, id, label, value, or selector. If the value of refresh evaluates to false, the DOM will not be refreshed");
    action.on("actions/*/:tapAll:options:using"                      , mobileV2.tapAllUsingOptions  , "action", "tapAll", "Tap all elements in the returned set, one after another, using the provided options object and using a name, id, label, value, or selector"                                                                           );
    action.on("actions/*/:tapAll:using"                              , mobileV2.tapAllUsing         , "action", "tapAll", "Tap all elements in the returned set, one after another, using a name, id, label, value, or selector"                                                                                                                 );
    action.on("actions/*/:tapAll:options"                            , mobileV2.tapAllOptions       , "action", "tapAll", "Tap all elements in the returned set, one after another, using the provided options object"                                                                                                                           );
    action.on("actions/*/:tapAll"                                    , mobileV2.tapAll              , "action", "tapAll", "Tap all elements in the returned set, one after another"                                                                                                                                                              );

    action.on("actions/*/:tapIfExists"                              , mobileV2.tapIfExists         , "action", "tapIfExists", "Tap an element using the default options, if it exists.");

    action.on("actions/*/:tapXY"                                    , mobileV2.tapXY              , "action", "tapXY", "Tap the specifed screen coordinates. Expects an array (e.g. [x, y])"                                                                );
    action.on("actions/*/:refresh:tapXY"                            , mobileV2.tapXY              , "action", "tapXY", "Tap the specifed screen coordinates. Expects an array (e.g. [x, y]). If the value of refresh is false, the DOM will not be reloaded");

    action.on("actions/*/:relativeTo:tapXY"                         , mobileV2.tapXYRelativeTo    , "action", "tapXY", "Tap the specifed screen coordinates, relative to the specified element's position. Expects an array (e.g. [x, y])"                                                                );
    action.on("actions/*/:refresh:relativeTo:tapXY"                 , mobileV2.tapXYRelativeTo    , "action", "tapXY", "Tap the specifed screen coordinates, relative to the specified element's position. Expects an array (e.g. [x, y]). If the value of refresh is false, the DOM will not be reloaded");

    action.on("actions/*/:typeOnKeyboard"                           , mobileV2.typeOnKeyboard     , "action", "typeOnKeyboard" , "Type on the device's keyboard"                , true);
    action.on("actions/*/:resetAppData"                             , mobileV2.resetAppData       , "action", "resetAppData"   , "Reset the simulator/emulator application data", true);
    action.on("actions/*/:back"                                     , mobileV2.back               , "action", "back"           , "Click the hardware back button (Android only)", true);

    action.on("actions/*/:debug"                                    , $.core.debug                , "action", "debug"   , "Print values to the stdout for debuggin purposes"                                               , true);
    action.on("actions/*/:refresh"                                  , $.core.refresh              , "action", "refresh" , "Perform a manual refresh of the screen if the value of the given key does not evaluate to false", true);

    action.on("actions/*/:executeWidget:module:type"                , $.core.executeWidget        , "hide");

    action.on("actions/*/:execute:module:type"                      , $.core.executeType          , "action", "execute", "Execute an action of the given type, from the specified module"               , true);
    action.on("actions/*/:execute:type"                             , $.core.executeType          , "action", "execute", "Execute an action of the given type"                                          , true);
    action.on("actions/*/:execute:repeat:type"                      , $.core.executeAndRepeatType , "action", "execute", "Repeat an action, screen, menu or popup for each element in the returned set" , true);
    action.on("actions/*/:execute:repeat"                           , $.core.executeAndRepeat     , "action", "execute", "Repeat an action for each element in the returned set"                        , true);
    action.on("actions/*/:execute:module"                           , $.core.execute              , "action", "execute", "Execute an action from the provided module"                                   , true);
    action.on("actions/*/:execute"                                  , $.core.execute              , "action", "execute", "Execute an action"                                                            , true);

    action.on("actions/*/:execute:over:type"                        , $.core.executeOverType      , "action", "execute", "Repeat an action, screen, menu or popup for each element in the array specified by the over key. The current item in the array will be stored in the `temp` variable" , true);
    action.on("actions/*/:execute:over"                             , $.core.executeOver          , "action", "execute", "Repeat an action for each element in the array specified by the over key. The current item in the array will be stored in the `temp` variable" , true);
    action.on("actions/*/:execute:overVariable"                     , $.core.executeOverVariable  , "action", "execute", "Repeat an action for each element in the array specified by value of the variable named in the overVariable key. The current item in the array will be stored in the `temp` variable" , true);

    action.on("actions/*/:type:validate"                            , $.core.validateType         , "action", "validate", "Validate a screen, menu, or popup specified by 'type'", true);
    action.on("actions/*/:validate"                                 , $.core.validate             , "action", "validate", "Validate a screen"                                    , true);

    action.on("actions/*/:using:waitFor"                            , $.core.waitForUsing         , "action", "waitFor", "Wait for an element to appear, using a name, value, id, label, or selector");
    action.on("actions/*/:waitFor"                                  , $.core.waitFor              , "action", "waitFor", "Wait for an element to appear"                                             );

    action.on("actions/*/:wait"                                     , $.core.wait                 , "action", "wait"   , "Wait for the specified number of seconds", true);

    action.on("actions/*/:as:capture:index:store"                   , $.core.storeAs              , "action", "store", "Store a variable, capturing a regular expression from the provided value and saving only the value at the provided index", true);
    action.on("actions/*/:as:capture:store"                         , $.core.storeAs              , "action", "store", "Store a variable, capturing a regular expression from the provided value"                                                , true);
    action.on("actions/*/:as:store"                                 , $.core.storeAs              , "action", "store", "Store a variable"                                                                                                              );
    action.on("actions/*/:as:persistent:store"                      , $.core.storeAs              , "action", "store", "Store a variable that will persist even after testing is finished"                                                             );

    action.on("actions/*/:as:property:save:using"                   , $.core.saveAsPropertyUsing  , "action", "save", "Save an element's specific property as a variable, using a name, value, id, label, or selector"                                                                        );
    action.on("actions/*/:as:capture:index:property:save:using"     , $.core.saveAsPropertyUsing  , "action", "save", "Save an element's property as a variable capturing a regular expression, and storing only the value at the index provided, using a name, value, id, label, or selector");
    action.on("actions/*/:as:capture:index:property:save"           , $.core.saveAsProperty       , "action", "save", "Save an element's property as a variable capturing a regular expression, and storing only the value at the index provided"                                             );
    action.on("actions/*/:as:capture:property:save:using"           , $.core.saveAsPropertyUsing  , "action", "save", "Save an element's property as a variable capturing a regular expression, using a name, value, id, label, or selector"                                                  );
    action.on("actions/*/:as:capture:property:save"                 , $.core.saveAsProperty       , "action", "save", "Save an element's property as a variable capturing a regular expression"                                                                                               );
    action.on("actions/*/:as:property:save"                         , $.core.saveAsProperty       , "action", "save", "Save an element's specific property as a variable"                                                                                                                     );
    action.on("actions/*/:as:save:using"                            , $.core.saveAsUsing          , "action", "save", "Save an element as a variable, using a name, value, id, label, or selector"                                                                                            );
    action.on("actions/*/:as:save"                                  , $.core.saveAs               , "action", "save", "Save an element as a variable"                                                                                                                                         );

    action.on("actions/*/:as:property:saveAll:using"                , $.core.saveAllAsPropertyUsing  , "action", "saveAll", "Save all elements in the retrieved set");
    action.on("actions/*/:as:capture:index:property:saveAll:using"  , $.core.saveAllAsPropertyUsing  , "action", "saveAll", "Save all elements in the retrieved set capturing a regular expression from a property and storing only the provided index from the results");
    action.on("actions/*/:as:capture:index:property:saveAll"        , $.core.saveAllAsProperty       , "action", "saveAll", "Save all elements in the retrieved set capturing a regular expression from a property and storing only the provided index from the results");
    action.on("actions/*/:as:capture:property:saveAll:using"        , $.core.saveAllAsPropertyUsing  , "action", "saveAll", "Save all elements in the retrieved set capturing a regular expression from a property");
    action.on("actions/*/:as:capture:property:saveAll"              , $.core.saveAllAsProperty       , "action", "saveAll", "Save all elements in the retrieved set capturing a regular expression from a property");
    action.on("actions/*/:as:property:saveAll"                      , $.core.saveAllAsProperty       , "action", "saveAll", "Save all elements in the retrieved set");
    action.on("actions/*/:as:save:using"                            , $.core.saveAllAsUsing          , "action", "saveAll", "Save all elements in the retrieved set");
    action.on("actions/*/:as:saveAll"                               , $.core.saveAllAs               , "action", "saveAll", "Save all elements in the retrieved set");

    action.on("actions/*/:set:to:using"                             , $.core.setToUsing             , "action", "set", "Set an element's value, using a name, value, id, label, or selector");
    action.on("actions/*/:set:to"                                   , $.core.setTo                  , "action", "set", "Set an element's value"                                             );
    action.on("actions/*/:mask:set:to"                              , $.core.setTo                  , "action", "set", "Set an element's value"                                             );

    action.on("actions/*/:scrollToVisible:using"                     , $.core.scrollToVisibleUsing  , "action", "scrollToVisible", "Scroll an element into view, using a name, value, id, label, or selector");
    action.on("actions/*/:scrollToVisible"                           , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view");
    action.on("actions/*/:scrollToVisibleText"                       , mobileV2.scrollToVisibleText , "action", "scrollToVisibleText", "Scroll an element by text into view");
    action.on("actions/*/:direction:scrollToVisible"                 , $.core.scrollToVisibleWithDirection     , "action", "scrollToVisible", "Scroll an element into view, using a direction");
    action.on("actions/*/:maxAttempts:scrollToVisible"               , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, setting the maxiumum number of scroll attempts (Android Only)"                                );
    action.on("actions/*/:parent:scrollToVisible"                    , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, setting the maxiumum number of scroll attempts (Android Only)"                                );
    action.on("actions/*/:amount:maxAttempts:parent:scrollToVisible" , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, setting the maxiumum number of scroll attempts and the specified scroll amount (Android Only)");
    action.on("actions/*/:amount:maxAttempts:scrollToVisible"        , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, setting the maxiumum number of scroll attempts and the specified scroll amount (Android Only)");
    action.on("actions/*/:amount:scrollToVisible"                    , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, using the specified scroll amount (Android Only)"                                             );
    action.on("actions/*/:amount:parent:scrollToVisible"             , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, using the specified parent and the specified scroll amount (Android Only)"                    );
    action.on("actions/*/:maxAttempts:parent:scrollToVisible"        , mobileV2.scrollToVisible     , "action", "scrollToVisible", "Scroll an element into view, using the specified parent, setting the maxiumum number of scroll attempts (Android Only)"    );

    action.on("actions/*/:amount:direction:refresh:scroll:using"    , $.core.scrollDirectionUsing   , "action", "scroll", "Scroll an element the amount provided, in the direction provided, using a name, value, id, label, or selector" );
    action.on("actions/*/:amount:direction:scroll:using"            , $.core.scrollDirectionUsing   , "action", "scroll", "Scroll an element the amount provided, in the direction provided, using a name, value, id, label, or selector" );
    action.on("actions/*/:direction:scroll:using"                   , $.core.scrollDirectionUsing   , "action", "scroll", "Scroll an element in the direction provided, using a name, value, id, label, or selector"                      );
    action.on("actions/*/:amount:direction:scroll"                  , $.core.scrollDirection        , "action", "scroll", "Scroll an element the amount provided, in the direction provided"                                              );
    action.on("actions/*/:direction:scroll"                         , $.core.scrollDirection        , "action", "scroll", "Scroll an element in the direction provided"                                                                   );
    action.on("actions/*/:amount:scroll"                            , $.core.scroll                 , "action", "scroll", "Scroll an element the amount provided"                                                                         );
    action.on("actions/*/:scroll"                                   , $.core.scroll                 , "action", "scroll", "Scroll an element"                                                                                             );

    action.on("actions/*/:scrollToTop:type:validate"                , mobileV2.scrollToTop          , "action", "scrollToTop", "Scroll an element up all the way and validate a file of type 'type' on each scroll (Android Only)");
    action.on("actions/*/:scrollToTop:validate"                     , mobileV2.scrollToTop          , "action", "scrollToTop", "Scroll an element up all the way and validate a screen on each scroll (Android Only)");
    action.on("actions/*/:execute:scrollToTop"                      , mobileV2.scrollToTop          , "action", "scrollToTop", "Scroll an element up all the way and execute a file on each scroll (Android Only)");
    action.on("actions/*/:scrollToTop"                              , mobileV2.scrollToTop          , "action", "scrollToTop", "Scroll an element up all the way (Android Only)");

    action.on("actions/*/:scrollToBottom:type:validate"             , mobileV2.scrollToBottom       , "action", "scrollToBottom", "Scroll an element down all the way and validate a file of type 'type' on each scroll (Android Only)");
    action.on("actions/*/:scrollToBottom:validate"                  , mobileV2.scrollToBottom       , "action", "scrollToBottom", "Scroll an element down all the way and validate a screen on each scroll (Android Only)");
    action.on("actions/*/:execute:scrollToBottom"                   , mobileV2.scrollToBottom       , "action", "scrollToBottom", "Scroll an element down all the way and execute a file on each scroll (Android Only)");
    action.on("actions/*/:scrollToBottom"                           , mobileV2.scrollToBottom       , "action", "scrollToBottom", "Scroll an element down all the way (Android Only)");

	  action.on("actions/*/:input:savetofile"     					          , $.core.saveToFile           , "action", "saveToFile" , "Save contents to file.<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:args:stopApp"                              , mobileV2.stopApp             , "action", "stop",    "Stop an application"                                             , true);
    action.on("actions/*/:openApp"                                   , mobileV2.openApp            , "action", "open",    "Open an application"                                             , true);
    action.on("actions/*/:closeApp"                                  , mobileV2.closeApp            , "action", "close",    "Closes an application"                                             , true);
    action.on("actions/*/:homeScreen"                                , mobileV2.homeScreen          , "action", "homeScreen",    "To home screen"                                             , true);
    action.on("actions/*/:deviceSwipe"                               , mobileV2.deviceSwipe          , "action", "deviceSwipe", "Swipe on the device"                                                                , true);
    action.on("actions/*/:deviceSwipeLeft"                           , mobileV2.deviceSwipeLeft     , "action", "deviceSwipe", "Swipe left on the device"                                                                , true);
    action.on("actions/*/:deviceSwipeRight"                          , mobileV2.deviceSwipeRight    , "action", "deviceSwipe", "Swipe right on the device"                                                                , true);
    action.on("actions/*/:deviceSwipeUp"                             , mobileV2.deviceSwipeUp     , "action", "deviceSwipe", "Swipe up on the device"                                                                , true);
    action.on("actions/*/:deviceSwipeDown"                           , mobileV2.deviceSwipeDown    , "action", "deviceSwipe", "Swipe down on the device"                                                              , true);
    action.on("actions/*/:lockScreen"                                , mobileV2.lockScreen         , "action", "lockScreen", "Locks the scren for number of seconds indicated"   , true);
    action.on("actions/*/:sendKeyCommand"                            , mobileV2.sendKeyCommand     , "action", "sendKeyCommand",    "Sends a key command to the device"                                             , true);

    /////////////////////////////////////////////////////// MISC ///////////////////////////////////////////////////////

    action.on("actions/*/:retries"                         , $.core.retries                       , "action", "retries" , "Set the number of find element retries to the integer provided", true);
    action.on("actions/*/:delete"                          , $.core.deleteVar                     , "action", "delete"  , "Delete a testing variable");

    action.on("actions/*/:args:osexec:saveResultsAs"       , $.core.osexec                        , "action", "osexec"      , "Execute a shell command with the given arguments. Results will be saved in the variable defined by \"saveResultsAs\" as an object with keys \"stdout\" and \"stderr\".<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:args:osexec"                     , $.core.osexec                        , "action", "osexec"      , "Execute a shell command with the given arguments<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:osexec"                          , $.core.osexec                        , "action", "osexec"      , "Execute a shell command <br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:osexec:saveResultsAs"            , $.core.osexec                        , "action", "osexec"      , "Execute a shell command. Results will be saved in the variable defined by \"saveResultsAs\" as an object with keys \"stdout\" and \"stderr\".<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);

    action.on("actions/*/:as:getConfig"                    , $.core.getConfigAs                   , "action", "getConfig"   , "Get a configuration variable and store it as a test variable"  , true);
    action.on("actions/*/:setConfig:to"                    , $.core.setConfigTo                   , "action", "setConfig"   , "Set a configuration variable to the value provided"            , true);
    action.on("actions/*/:rotateDevice"                    , mobileV2.rotateDevice                , "action", "rotateDevice", "Rotate the device"                                             , true);

    action.on("actions/*/:as:saveObject"                   , $.core.saveObjectAs                , "action", "saveObject", "Save an object as a variable", true);
    action.on("actions/*/:as:persist:saveObject"           , $.core.saveObjectAs                , "action", "saveObject", "Save an object as a variable, which will persists for the life of the process", true);
};
