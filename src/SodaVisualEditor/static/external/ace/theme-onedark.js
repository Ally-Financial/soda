ace.define("ace/theme/onedark",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-onedark";
exports.cssText = ".ace-onedark .ace_gutter {\
background: rgba(0, 0, 0, .15);\
color: #393939\
}\
.ace-onedark .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-onedark {\
background-color: none;\
color: #8E8E8E\
}\
.ace-onedark .ace_cursor {\
color: rgb(80, 160, 255)\
}\
.ace-onedark .ace_marker-layer .ace_selection {\
background: rgba(255, 255, 255, .06)\
}\
.ace-onedark.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-onedark .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-onedark .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-onedark .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-onedark .ace_gutter-active-line {\
background-color: rgba(0, 0, 0, 0.26);\
}\
.ace-onedark .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-onedark .ace_invisible {\
color: #52524d\
}\
.ace-onedark .ace_entity.ace_name.ace_tag,\
.ace-onedark .ace_keyword,\
.ace-onedark .ace_meta.ace_tag,\
.ace-onedark .ace_storage {\
color: #F92672\
}\
.ace-onedark .ace_punctuation,\
.ace-onedark .ace_punctuation.ace_tag {\
color: #fff\
}\
.ace-onedark .ace_constant.ace_character,\
.ace-onedark .ace_constant.ace_language,\
.ace-onedark .ace_constant.ace_numeric,\
.ace-onedark .ace_constant.ace_other {\
color: rgb(191, 139, 79)\
}\
.ace-onedark .ace_constant.ace_boolean {\
color: rgb(85, 167, 182)\
}\
.ace-onedark .ace_paren {\
color: #8E8E8E\
}\
.ace-onedark .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-onedark .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-onedark .ace_support.ace_constant,\
.ace-onedark .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-onedark .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-onedark .ace_storage.ace_type,\
.ace-onedark .ace_support.ace_class,\
.ace-onedark .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-onedark .ace_entity.ace_name.ace_function,\
.ace-onedark .ace_entity.ace_other,\
.ace-onedark .ace_entity.ace_other.ace_attribute-name,\
.ace-onedark .ace_variable {\
color: rgb(205, 87, 97)\
}\
.ace-onedark .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-onedark .ace_string {\
color: rgb(138, 187, 96)\
}\
.ace-onedark .ace_comment {\
color: #75715E\
}\
.ace-onedark .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
