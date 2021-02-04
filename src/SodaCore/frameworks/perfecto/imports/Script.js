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

return (function () {
    window.alert          = function () { return true;      };
    window.confirm        = function () { return true;      };
    window.onbeforeunload = function () { return undefined; };
    window.open           = function () { return undefined; };

    window.$soda_uids       = window.$soda_uids            || 0;
    window.$soda_iterations = window.$soda_iterations      || 0;

    var dupedIds = 0;

    function isElementInViewport (el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top    >= 0 &&
            rect.left   >= 0 &&
            rect.bottom <= (window.innerHeight * window.devicePixelRatio || document.documentElement.clientHeight * window.devicePixelRatio) &&
            rect.right  <= (window.innerWidth * window.devicePixelRatio  || document.documentElement.clientWidth * window.devicePixelRatio)
        );
    }

    function getUniqueId () { return "soda-uid-" + (window.$soda_uids++); }

    function buildDOMTree (e, p, tree) {
        tree = tree || {};

        for(var i = 0; i < e.length; i++) {
            window.$soda_iterations++;

            var el  = e[i],
                tag = el.tagName.toLowerCase(), id, sodaid = null,
                devicePixelRatio = window.devicePixelRatio,
                barHeight = 60;

            if(window.$soda_iterations === 1) {  // root id must always be soda-uid-0
                sodaid = "soda-uid-root";

                if (!el.id) {
                  el.id = "soda-uid-root";
                }


                var yOffset = window.pageYOffset,
                    xOffset = window.pageXOffset,
                    innerHeight = window.innerHeight,
                    innerWidth = window.innerWidth;

                el.setAttribute('yoffset', yOffset);
                el.setAttribute('xoffset', xOffset);
                el.setAttribute('innerheight', innerHeight);
                el.setAttribute('innerwidth', innerWidth);
                el.setAttribute('devicePixelRatio', devicePixelRatio);
            }

            if(tag !== "script" && tag !== "style" && tag !== "noscript") {
                if(el && !el.id) el.setAttribute('id', getUniqueId());

                if(el && tree[el.id]) {
                    id = el.id + "-" + (dupedIds++);
                    el.setAttribute('id', id);
                }
                else if(el && el.id === 'each') {
                    id = '_each';
                    el.setAttribute('id', id);
                }
                else {
                    id = el.id;
                }

                var textNodes = el.childNodes,
                    rect     = el.getBoundingClientRect(),
                    textNode = '';

                for(var t in textNodes) {
                    if(textNodes.hasOwnProperty(t) && typeof textNodes[t].nodeType === 'number' && textNodes[t].nodeType === 3) {
                        textNode += textNodes[t].data.trim();
                    }
                }

                tree[sodaid ? sodaid: id] = {
                    id      : id,
                    type    : tag,
                    name    : typeof el.attributes.class === 'object' && typeof el.attributes.class.value === 'string' ? el.attributes.class.value.split(/ +/g) : null,
                    label   : typeof el.attributes.name  === 'object' && typeof el.attributes.name.value  === 'string' ? el.attributes.name.value.replace(/[^a-zA-Z0-9_\- ]/g, '') : null,
                    value   : textNode || el.value || null,
                    web     : true,

                    rect : {
                        origin: {
                            x: rect.left  * devicePixelRatio,
                            y: (rect.top + barHeight) * devicePixelRatio
                        },
                        size: {
                            width  : rect.width * devicePixelRatio,
                            height : rect.height * devicePixelRatio
                        }
                    },

                    enabled          : !el.attributes.disabled ? true  : false,
                    visible          : (rect.height * devicePixelRatio) > 0 && (rect.width * devicePixelRatio) > 0 && isElementInViewport(el),
                    hasKeyboardFocus : document.activeElement === el,
                    attributes       : {},

                    valid    : true,
                    children : {},
                    index    : i,
                    parent   : {}
                };

                tree[sodaid ? sodaid: id].hitpoint = {
                    x: (tree[sodaid ? sodaid: id].rect.origin.x * devicePixelRatio + (tree[sodaid ? sodaid: id].rect.size.width * devicePixelRatio  / 2)),
                    y: (tree[sodaid ? sodaid: id].rect.origin.y * devicePixelRatio + (tree[sodaid ? sodaid: id].rect.size.height * devicePixelRatio / 2))
                };

                if(typeof tree[sodaid ? sodaid: id].value === "string") tree[sodaid ? sodaid: id].value = tree[sodaid ? sodaid: id].value.replace(/\s+/g, ' ').trim();

                if(typeof p === "object") {
                    tree[sodaid ? sodaid: id].parent = {
                        id    : p.id,
                        name  : p.name,
                        label : p.label,
                        value : p.value,
                        web   : true
                    };
                }

                for(var a in el.attributes) {
                    if(el.attributes.hasOwnProperty(a)) {
                        tree[sodaid ? sodaid: id].attributes[el.attributes[a].name] = el.attributes[a].value;
                    }
                }

                var children;
                if(tree[sodaid ? sodaid: id].type === "iframe" || tree[sodaid ? sodaid: id].type === "frame") { // Handle iFrames
                    try {
                        children = el.contentDocument || el.contentWindow.document;
                        children = children.getElementsByTagName('body')[0];

                        buildDOMTree(children, tree[sodaid ? sodaid: id], tree[sodaid ? sodaid: id].children);
                    }
                    catch (e) {
                        // No operation. Cross origin policy most likely is enabled...no iFrame child elements
                    }
                }
                else {
                    buildDOMTree(el.children, tree[sodaid ? sodaid: id], tree[sodaid ? sodaid: id].children);
                }
            }
        }

        return tree;
    }

    var element = document.getElementsByTagName("sodadom")[0];

    if (element && element != undefined) {
        element.parentNode.removeChild(element);
    }

    //var originalBody = document.body.parentNode.innerHTML;

    var resultString = JSON.stringify(buildDOMTree(document.getElementsByTagName('body')));

    var sodaDOM = document.createElement('sodadom');
    sodaDOM.textContent = resultString;
    sodaDOM.style.cssText = 'visibility:hidden;';
    //document.body.parentNode.innerHTML = originalBody;
    document.body.appendChild(sodaDOM);

    return resultString;
}());
