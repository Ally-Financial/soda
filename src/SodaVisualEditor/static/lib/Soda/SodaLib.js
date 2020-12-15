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
* A jquery extension to select all the element text when clicking on a
* HTML Editable object
* @memberof jQuery
*/
$.fn.selectText = function () {
    var doc     = document,
    element = this[0],
    range;

    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    }
    else if(window.getSelection) {
        var selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

Object.defineProperties(String.prototype, {
    /**
     * Capitalizes the first letter of a string
     * @memberof String.prototype
     * @returns {string} The capitalized string
     */
    ucFirst: {
        configurable : true,
        enumerable   : false,
        get          : function () {
            return (this.charAt(0).toUpperCase() + this.slice(1));
        }
    },

    /**
     * Capitalizes the first letter of a word in a string
     * @memberof String.prototype
     * @returns {string} The tile cased string
     */
    titleCase: {
        configurable : true,
        enumerable   : false,
        get          : function () {
            var i, words = this.split(' ');
            for(i = 0; i < words.length; i++) words[i] = words[i].ucFirst;
            return words.join(' ');
        }
    },

    /**
     * Lowercase the first letter of a word in a string
     * @memberof String.prototype
     * @returns {string} The lower cased string
     */
    lowerFirst: {
        configurable : true,
        enumerable   : false,
        get          : function () {
            return this.charAt(0).toLowerCase() + this.substring(1, this.length);
        }
    },

    /**
     * Splices a string.
     * @param {number} i The index to splice the string at
     * @param {number=} rem The number of characters to remove from the string
     * @param {string=} s The string to insert into the original string
     * @type {Function}
     * @returns {string} a sliced string
     */
    splice: {
        configurable : false,
        enumerable   : false,
        writable     : false,
        value        : function (i, rem, s) {
            return (this.slice(0, i) + s + this.slice(i + Math.abs(rem)));
        }
    },
});
