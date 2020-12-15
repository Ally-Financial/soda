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
 * @module Engine/Syntaxes/Web/Syntax
 * @description The windows v1.0 Soda stynax callback library
 */
module.exports = {

    userVariable   : "_user_",
    variableFormat : /(\$\{\s*([_a-zA-Z0-9\-](?:\.?[_a-zA-Z0-9\-])*)\s*})/g,

    /**
     * Protects against trying to match against something that is undefined, returning null as a precaution
     * @function
     * @param vars The variables to match against
     * @param m The array of items to match
     * @param item The object to replace the values with
     * @returns {string}
     */
    variableOnMatch: function (vars, m, item) {
        if(m[1] && (m[2] || m[2] === 0) && (item || item === 0)) return item.toString().replace(m[1], (vars.get(m[2]) || vars.get(m[2]) === 0) ? vars.get(m[2]) : "(null)");
        return "(null)";
    },

    name            : "windows",
    version         : "1.0",

    actionPaths: [
        'screen/components/*/',
        'popup/components/*/',
        'menu/components/*/',
        'actions/*/'
    ]
};
