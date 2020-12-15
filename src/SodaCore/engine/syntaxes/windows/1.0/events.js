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
 * @module Engine/Syntaxes/Web
 * @description The windows v1.0 Soda stynax
 */


// *** EVENT KEYS MUST BE IN ALPHABETICAL ORDER!!! *** //

module.exports = function (action, $) {

    var path  = require("path"),
        windowsV1 = require(path.join(__dirname, "function"));

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

    action.on("actions/*/:clickAll:options:refresh:using"           , windowsV1.clickAllUsingOptions  , "action", "clickAll", "Click all elements in the returned set, one after another, using the provided options object and using a name, id, label, value, or selector. If the value of refresh evaluates to false, the DOM will not be refreshed");
    action.on("actions/*/:clickAll:options:using"                   , windowsV1.clickAllUsingOptions  , "action", "clickAll", "Click all elements in the returned set, one after another, using the provided options object and using a name, id, label, value, or selector"                                                                           );
    action.on("actions/*/:clickAll:using"                           , windowsV1.clickAllUsing         , "action", "clickAll", "Click all elements in the returned set, one after another, using a name, id, label, value, or selector"                                                                                                                 );
    action.on("actions/*/:clickAll:options"                         , windowsV1.clickAllOptions       , "action", "clickAll", "Click all elements in the returned set, one after another, using the provided options object"                                                                                                                           );
    action.on("actions/*/:clickAll"                                 , windowsV1.clickAll              , "action", "clickAll", "Click all elements in the returned set, one after another"                                                                                                                                                              );

    action.on("actions/*/:click:options:refresh:using"              , windowsV1.clickUsingOptions     , "action", "click", "Click an element, using the provided options object and using a name, id, label, value, or selector. If the value of refresh evaluates to false, the DOM will not be refreshed");
    action.on("actions/*/:click:options:using"                      , windowsV1.clickUsingOptions     , "action", "click", "Click an element, using the provided options object and using a name, id, label, value, or selector");
    action.on("actions/*/:click:using"                              , windowsV1.clickUsing            , "action", "click", "Click an element, using a name, id, label, value, or selector");
    action.on("actions/*/:click:options:refresh"                    , windowsV1.clickOptions          , "action", "click", "Click an element, using the provided options. If the value of refresh evaluates to false, the DOM will not be refreshed");
    action.on("actions/*/:click:options"                            , windowsV1.clickOptions          , "action", "click", "Click an element, using the provided options");
    action.on("actions/*/:click:refresh"                            , windowsV1.click                 , "action", "click", "Click an element. If the value of refresh evaluates to false, the DOM will not be refreshed");
    action.on("actions/*/:click"                                    , windowsV1.click                 , "action", "click", "Click an element, using the default options");

    action.on("actions/*/:clickIfExists"                            , windowsV1.clickIfExists         , "action", "click", "Click an element using the default options, if it exists.");

    action.on("actions/*/:debug"                                    , $.core.debug                , "action", "debug"   , "Print values to the stdout for debuggin purposes"                                               , true);
    action.on("actions/*/:refresh"                                  , $.core.refresh              , "action", "refresh" , "Perform a manual refresh of the screen if the value of the given key does not evaluate to false", true);

    action.on("actions/*/:execute:module:type"                      , $.core.executeType          , "action", "execute", "Execute an action of the given type, from the specified module"               , true);
    action.on("actions/*/:execute:type"                             , $.core.executeType          , "action", "execute", "Execute an action of the given type"                                          , true);
    action.on("actions/*/:execute:repeat:type"                      , $.core.executeAndRepeatType , "action", "execute", "Repeat an action, screen, menu or popup for each element in the returned set" , true);
    action.on("actions/*/:execute:repeat"                           , $.core.executeAndRepeat     , "action", "execute", "Repeat an action for each element in the returned set"                        , true);
    action.on("actions/*/:execute:module"                           , $.core.execute              , "action", "execute", "Execute an action from the provided module"                                   , true);
    action.on("actions/*/:execute"                                  , $.core.execute              , "action", "execute", "Execute an action"                                                            , true);

    action.on("actions/*/:execute:over:type"                        , $.core.executeOverType      , "action", "execute", "Repeat an action, screen, menu or popup for each element in the array specified by the over key. The current item in the array will be stored in the `temp` variable" , true);
    action.on("actions/*/:execute:over"                             , $.core.executeOver          , "action", "execute", "Repeat an action for each element in the array specified by the over key. The current item in the array will be stored in the `temp` variable" , true);
    action.on("actions/*/:execute:overVariable"                     , $.core.executeOverVariable  , "action", "execute", "Repeat an action for each element in the array specified by value of the variable named in the overVariable key. The current item in the array will be stored in the `temp` variable" , true);

    action.on("actions/*/:executeWidget:module:type"                , $.core.executeWidget        , "hide");

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

    action.on("actions/*/:set:to:using"                             , $.core.setToUsing           , "action", "set", "Set an element's value, using a name, value, id, label, or selector");
    action.on("actions/*/:set:to"                                   , $.core.setTo                , "action", "set", "Set an element's value"                                             );
    action.on("actions/*/:mask:set:to"                              , $.core.setTo                  , "action", "set", "Set an element's value"                                             );

    action.on("actions/*/:scrollToVisible:using"                    , $.core.scrollToVisibleUsing , "action", "scrollToVisible", "Scroll an element into view, using a name, value, id, label, or selector");
    action.on("actions/*/:scrollToVisible"                          , $.core.scrollToVisible      , "action", "scrollToVisible", "Scroll an element into view");

    action.on("actions/*/:amount:direction:refresh:scroll:using"    , $.core.scrollDirectionUsing , "action", "scroll", "Scroll an element the amount provided, in the direction provided, using a name, value, id, label, or selector" );
    action.on("actions/*/:amount:direction:scroll:using"            , $.core.scrollDirectionUsing , "action", "scroll", "Scroll an element the amount provided, in the direction provided, using a name, value, id, label, or selector" );
    action.on("actions/*/:direction:scroll:using"                   , $.core.scrollDirectionUsing , "action", "scroll", "Scroll an element in the direction provided, using a name, value, id, label, or selector"                      );
    action.on("actions/*/:amount:direction:scroll"                  , $.core.scrollDirection      , "action", "scroll", "Scroll an element the amount provided, in the direction provided"                                              );
    action.on("actions/*/:direction:scroll"                         , $.core.scrollDirection      , "action", "scroll", "Scroll an element in the direction provided"                                                                   );
    action.on("actions/*/:amount:scroll"                            , $.core.scroll               , "action", "scroll", "Scroll an element the amount provided"                                                                         );
    action.on("actions/*/:scroll"                                   , $.core.scroll               , "action", "scroll", "Scroll an element"                                                                                             );

    action.on("actions/*/:typeIn:using:value"                        , $.core.typeInUsing           , "action", "typeIn", "Type a value in an element, using a name, value, id, label, or selector");
    action.on("actions/*/:typeIn:value"                              , $.core.typeIn                , "action", "typeIn", "Type a value in an element"                                              );
    action.on("actions/*/:sendKeys:using:value"                      , $.core.sendKeysUsing         , "action", "sendKeys", "Send keys to an element, using a name, value, id, label, or selector");
    action.on("actions/*/:sendKeys:value"                            , $.core.sendKeys              , "action", "sendKeys", "Send keys to an element"                                             );
    action.on("actions/*/:args:startApp"                             , windowsV1.startApp           , "action", "start",    "Start an application"                                             , true);
    action.on("actions/*/:args:startAppAndWait"                      , windowsV1.startAppAndWait    , "action", "startAndWait", "Start application and wait for completion"                     , true);
    action.on("actions/*/:input:savetofile"     					           , $.core.saveToFile            , "action", "saveToFile", "Save contents to file.<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);

    /////////////////////////////////////////////////////// MISC ///////////////////////////////////////////////////////

    action.on("actions/*/:delete"                          , $.core.deleteVar                     , "action", "delete", "Delete a testing variable");

    action.on("actions/*/:retries"                         , $.core.retries                       , "action", "retries"     , "Set the number of find element retries to the integer provided", true);
    action.on("actions/*/:setConfig:to"                    , $.core.setConfigTo                   , "action", "setConfig"   , "Set a configuration variable to the value provided"            , true);

    action.on("actions/*/:args:osexec:saveResultsAs"       , $.core.osexec                        , "action", "osexec"      , "Execute a shell command with the given arguments. Results will be saved in the variable defined by \"saveResultsAs\" as an object with keys \"stdout\" and \"stderr\".<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:args:osexec"                     , $.core.osexec                        , "action", "osexec"      , "Execute a shell command with the given arguments<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:osexec"                          , $.core.osexec                        , "action", "osexec"      , "Execute a shell command <br><br><span class=\"bold\">Use at your own risk!</span>"  , true);
    action.on("actions/*/:osexec:saveResultsAs"            , $.core.osexec                        , "action", "osexec"      , "Execute a shell command. Results will be saved in the variable defined by \"saveResultsAs\" as an object with keys \"stdout\" and \"stderr\".<br><br><span class=\"bold\">Use at your own risk!</span>"  , true);

    action.on("actions/*/:as:getConfig"                    , $.core.getConfigAs                   , "action", "getConfig"   , "Get a configuration variable and store it as a test variable"  , true);
    action.on("actions/*/:as:saveObject"                   , $.core.saveObjectAs                , "action", "saveObject", "Save an object as a variable", true);
    action.on("actions/*/:as:persist:saveObject"           , $.core.saveObjectAs                , "action", "saveObject", "Save an object as a variable, which will persists for the life of the process", true);
};
