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
 * Manages the Console Toolbox
 * @constructor
 * @extends SodaEmitter
 * @param {Soda} soda The window.Soda instance
 */
window.SodaConsole = function (soda) {

    var self = this,
        initialized = false;

    // Inherit from SodaEmitter
    window.SodaEmitter.call(self);
    this.$console = {};

    /**
     * Initialzes the SodaConsole instance
     * @param  {Object} $console The console HTML contents
     * @return {SodaConsole} The current SodaConsole instance
     */
    this.init = function ($console) {
        self.$console = $console;
        self.$console.$submit   = self.$console.self.find("#soda-console-submit");
        self.$console.$clear    = self.$console.self.find("#soda-console-clear");
        self.$console.$input    = self.$console.self.find("#soda-console-input");
        self.$console.$messages = self.$console.self.find("#soda-console-messages-wrapper");
        self.initialized = true;

        // Add output from the server to the console
        soda.addOutputPipe(function (messages) {
            for(var i in messages) {
                if(messages.hasOwnProperty(i)) {
                    self.$console.$messages.children('li:gt(49)').remove();
                    self.$console.$messages.prepend('<li class="soda-console-message list-group-item">' + messages[i] + '</li>');
                }
            }
        });

        // Set the click handler for when a user submits a command
        self.$console.$submit.click(function () {
            var val     = self.$console.$input.val(),
                $submit = $(this);

            if(val !== "") {
                self.$console.$submit.prop({ disabled: true });
                self.$console.$input.val("");
                self.executeCommand(val, function () {
                    $submit.prop({ disabled: false });
                });
            }
        });

        // Setup the clear console button
        self.$console.$clear.click(function () { self.$console.$messages.empty(); });
        return self;
    };

    /**
     * Execute a command
     * @param  {string} command The command to send to the server to execute
     * @param  {Function} done A callback for completion
     * @return {SodaConsole} The current SodaConsole instance
     */
    this.executeCommand = function (command, done) {
        soda.send("execute command", command, done);
        return self;
    };
};
