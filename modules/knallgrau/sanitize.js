/**
 * @fileoverview Sanitizes HTML.
 */

/**
 * Overwrites Helma's stripTags-method, since we dont
 * want to convert everything to a String.
 */
function stripTags(obj) {
   if (isNull(obj) || isUndefined(obj) || isDate(obj) || isBoolean(obj)) {
      return obj;
   } else if (isArray(obj)) {
      return obj.collect(function(item) { return stripTags(item); });
   } else {
      return (obj).stripTags();
   }
}


/**
 * sanitizes user input using HtmlParser Library from http://htmlparser.sourceforge.net/ licensed
 * via GNU Lesser General Public License available at http://www.opensource.org/licenses/lgpl-license.html
 *
 * @param obj the user input string
 * @param allowedElements an array of valid tags including allowed attributes,
 *                   say if you only like to allow links with href and title
 *                   attributes, and p tags the array would look like this:
 *                   [ "a[href|title]", "p" ]
 *                   Instead of give the elements directly you can use the Attribute Modules as specified in
 *                   http://www.w3.org/TR/xhtml-modularization/abstract_modules.html
 *                   eg: [ "p[common]" ] will allow p tags with common attributes (without events!) that are id, class, title, xml:lang and style
 *                   also you can use modules like the textmodule using standard attributes
 *                   eg: [ "textmodule" ] will allow abbr, br, p, h1, pre, code, var, div, ... and any other tag specified in the textmodule
 *                   at the above uri!
 *                   also you can define the possible values for an attribute, either the class like uri, length, cdata, etc. or concrete values
 *                   like left, right, center, etc.
 *                   eg: [ "td[common|abbr<text>|align<left|center|right|justify>]" ] will allow tds with xhtml common attributes as described above
 *                   an abbr attribute with a textvalue in it and an allign attribute with either left, center, right or justify as possible values
 *                   for modularisation purposes it is possible to define tags like &p[align<left|center|right|justify>]
 *                   which will add the align attribute (with the possible values) to the p tag but ONLY if it is allowed anyway in a earlier
 *                   module
 *                   It's also possible to allow any kind of attribute, by
 *                   specifying "b[.]". That way it is also possible to allow
 *                   macro syntax by adding "%[.]" to the list of allowed elements.
 * @return the sanitized string
 */
function sanitize(obj, allowedElements) {

   /****
               Configuration
                                          ****/

   //attribute modules as specified in http://www.w3.org/TR/xhtml-modularization/abstract_modules.html
   //common is core + i18N + style, but you can't access other properties in the Hash Array definition, so the string is copied
   var attributeModules = {
      core : "class<nmtokens>|id<id>|title<cdata>",
      i18N : "xml:lang<nmtoken>",
      style : "style<cdata>",
      safestyle: "style<safestyle>",
      common : "class<nmtokens>|id<id>|title<cdata>|xml:lang<nmtoken>|style<safestyle>"
   };

   //usable xhtmlmodules as specified in http://www.w3.org/TR/xhtml-modularization/abstract_modules.html
   var xhtmlModules = {
       textmodule :  [  "abbr[common]", "acronym[common]", "address[common]", "blockquote[common|cite<uri>]", "br[common]", "cite[common]",
                        "code[common]", "dfn[common]", "div[common]", "em[common]", "h1[common]", "h2[common]", "h3[common]", "h4[common]",
                        "h5[common]", "h6[common]", "kbd[common]", "p[common]", "pre[common|xml:space<preserve>]", "q[common|cite<uri>]", "samp[common]",
                        "span[common]", "strong[common]", "var[common]" ],
       hypertextmodule: [ "a[common|accesskey<character>|charset<charset>|href<safeuri>|hreflang<languagecode>|rel<linktypes>|rev<linktypes>|tabindex<number>|type<contenttype>]" ],
       listmodule: [ "dl", "dt[common]", "dd[common]", "ol[common]", "ul[common]", "li[common]"],
       appletmodule: [  "applet[core|alt<text>|archive<cdata>|code<cdata>|codebase<safeuri>|height<length>|object<cdata>|width<length>",
                        "param[id<id>|name<cdata>|type<contenttype>|value<cdata>|valuetype<data|ref|object>]" ],
       presentationmodule: [ "b[common]","big[common]","hr[common]","i[common]","small[common]","sub[common]","sup[common]","tt[common]"],
       editmodule: [ "del[common|cite<safeuri>|datetime<datetime>]", "ins[common|cite<safeuri>|datetime<datetime>" ],
       bidirectionaltextmodule: [ "bdo[core|dir<ltr|rtl>]" ],
       formsmodule:  [  "form[common|accept<contenttypes>|accept-charset<charset>|action<safeuri>|method<get|post>|enctype<contenttype>]",
                        "input[common|accept<contenttypes>|accesskey<character>|alt<text>|checked<checked>|disabled<disabled>|maxlength<number>|name<cdata>|readonly<readonly>|size<number>|src<safeuri>|tabindex<number>|type<text|password|checkbox|radio|submit|reset|file|hidden|image>|value<cdata>]",
                        "label[common|accesskey<character>|for<idref>", "select[common|disabled<disabled>|multiple<multiple>|name<cdata>|size<number>|tabindex<number>]",
                        "option[common|selected<selected>|disabled<disabled<|value<cdata>]",
                        "textarea[common|accesskey<character>|cols<number>|disabled<disabled>|name<cdata>|readonly<readonly>|rows<number>|tabindex<number>]",
                        "button[common|accesskey<character>|disabled<disabled>|name<cdata>|tabindex<number>|type<button|submit|reset>|value<cdata>]",
                        "fieldset[common]", "legend[common|accesskey<character>]", "optgroup[common|disabled<disabled>|label<text>" ],
       tablemodule: [ "table[common|border<pixels>|cellpadding<length>|cellspacing<length>|datapagesize<cdata>|frame<void|above|below|hsides|lhs|rhs|vsides|box|border>|rules<none|groups|rows|cols|all>|summary<text>|width<length>]",
                        "td[common|abbr<text>|align<left|center|right|justify|char>|axis<cdata>|char<character>|charoff<length>|colspan<number>|headers<idrefs>|rowspan<number>|scope<row|col|rowgroup|colgroup>|valign<top|middle|bottom|baseline>]",
                        "th[common|abbr<text>|align<left|center|right|justify|char>|axis<cdata>|char<character>|charoff<length>|colspan<number>|headers<idrefs>|rowspan<number>|scope<row|col|rowgroup|colgroup>|valign<top|middle|bottom|baseline>]",
                        "tr[common|align<left|center|right|justify|char>|char<character>|charoff<length>|valign<top|middle|bottom|baseline>]",
                        "col[common|align<left|center|right|justify|char>|char<character>|charoff<length>|span<number>|valign<top|middle|bottom|baseline>|width<multilength>",
                        "colgroup[common|align<left|center|right|justify|char>|char<character>|charoff<length>|span<number>|valign<top|middle|bottom|baseline>|width<multilength>",
                        "tbody[common|align<left|center|right|justify|char>|char<character>|charoff<length>|span<number>|valign<top|middle|bottom|baseline>]",
                        "thead[common|align<left|center|right|justify|char>|char<character>|charoff<length>|span<number>|valign<top|middle|bottom|baseline>]",
                         "tfoot[common|align<left|center|right|justify|char>|char<character>|charoff<length>|span<number>|valign<top|middle|bottom|baseline>]"  ],
       imagemodule: [ "img[common|alt<text>|height<length>|longdesc<safeuri>|src<safeuri>|width<length>]" ],
       objectmodule: [ "object[common|archive<safeuri>|classid<safeuri>|codebase<safeuri>|codetype<contenttype>|data<safeuri>|declare<declare>|height<length>|name<cdata>|standby<text>|tabindex<number>|type<contenttype>|width<length>]",
                        "param[id<id>|name<cdata>|type<contenttype>|value<cdata>|valuetype<data|ref|object>]" ],
       imagemapmodule: [   "&a[coords<cdata>|shape<rect|circle|poly|default>]",
                           "area[common|acceskey<character>|alt<text>|coords<cdata>|href<safeuri>|nohref<nohref>|shape<rect|circle|poly|default>|tabindex<number>",
                           "&img[usemap<idref>|ismap<ismap>]", "&input[usemap<idref>|ismap<ismap>]", "map[i18n|class<nmtoken>|id<id>|title<cdata>]",
                           "&object[usemap<idref>]" ],
       framesmodule: [  "frameset[core|cols<multilength>|rows<multilength>]",
                        "frame[core|frameborder<1|0>|longdesc<safeuri>|marginheight<pixels>|marginwidth<pixels>|noresize<noresize>|scrolling<yes|no|auto>|src<safeuri>]",
                        "noframe[common]" ],
       targetmodule: [  "&a[target<cdata>]", "&area[target<cdata>]", "&form[target<cdata>]" ],
       iframemodule: [  "iframe[core|frameborder<1|0>|height<length>|longdesc<safeuri>|marginheight<pixels>|marginwidth<pixels>|scrolling<xes|no|auto>|src<safeuri>|width<length>]" ],
       metainformationmodule: [ "meta[i18n|content<cdata>|http-equiv<nmtoken>|name<nmtoken>|scheme<cdata>]" ],
       stylesheetmodule: [ "style[i18n|media<mediadesc>|title<text>|type<contenttype>|xml:space<preserve>]" ],
       linkmodule: [ "link[common|charset<charset>|href<safeuri>|hreflang<languagecode>|media<mediadesc>|rel<linktypes>|rev<linktypes>|type<contenttype>]"],
       basemodule: [ "base[href<safeuri>]" ],
       nameidentificationmodule: [  "&a[name<cdata>]", "&applet[name<cdata>]", "&form[name<cdata>]", "&frame[name<cdata>]", "&iframe[name<cdata>]",
                                    "&img[name<cdata>]", "&map[name<cdata>]" ],
       legacymodule: [  "center[common]", "dir[common|compact<compact>]", "font[core|i18N|color<color>|face<cdata>|size<cdata>]",
                        "isindex[core|i18N|prompt<text>]", "menu[common|compact<compact>]", "s[common]", "strike[common]", "u[common]",
                        "&br[clear<left|all|right|none>]", "&caption[align<top|bottom|left|right>]", "&div[align<left|center|right|justify>]",
                        "&dl[compact<compact>|type<cdata>]", "&h1[align<left|center|right|justify>]", "&h2[align<left|center|right|justify>]",
                        "&h3[align<left|center|right|justify>]", "&h4[align<left|center|right|justify>]", "&h5[align<left|center|right|justify>]",
                        "&h6[align<left|center|right|justify>]", "&hr[align<left|center|right|justify>|noshade<noshade>|size<pixels>|width<length>]",
                        "&img[align<left|center|right|justify>|border<pixels>|hspace<pixels>|vspace<pixels>]",
                        "&input[align<left|center|right|justify>]", "&li[type<cdata>|value<number>]", "&ol[compact<compact>|start<number>|type<cdata>]",
                        "&p[align<left|center|right|justify>]", "&pre[width<number>]", "&table[align<left|center|right|justify>|bgcolor<color>]",
                        "&tr[bgcolor<color>]", "&th[bgcolor<color>|height<pixels>|nowrap<nowrap>|width<length>]",
                        "&td[bgcolor<color>|height<pixels>|nowrap<nowrap>|width<length>]", "&ul[compact<compact>|type<cdata>]"
                     ],
       custommodule: ["embed[.]","wbr[.]"]
   };

   //valid color name used in color="" attributes
   var xhtmlColorNames = [ "black", "white", "grey", "silver", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua" ];

   //empty xml tags that need to be closed to validate
   var emptyXhtmlTags = [ "br", "img", "hr", "input", "col", "area", /* "param", */ "frame", "meta", "link", "isindex" ];

   var defaultAlowedElements = [ "textmodule", "hypertextmodule", "presentationmodule",  "nameidentificationmodule", "imagemodule" ];

   /****
            End of Configuration
                                          ****/

   if (allowedElements && isString(allowedElements))
      allowedElements = allowedElements.split(",");
   if (isNull(obj) || isUndefined(obj) || isDate(obj) || isBoolean(obj))
      return obj;
   if (isArray(obj))
      return obj.collect(function(item) { return sanitize(item, allowedElements); });

   var str = obj.toString();

   // use given valid Elements or default if not given or of wrong type
   if (allowedElements == null || !(allowedElements instanceof Array)) {
      allowedElements = defaultAlowedElements;
   }

   // trim spaces
   for (var i=0; i<allowedElements.length; i++) {
      allowedElements[i] = allowedElements[i].trim();
   }

   //if a module is used in the arg substitute it with the tags defined above
   var tmp = [];
   for (var i = 0; i < allowedElements.length; i++) {
      var module = xhtmlModules[allowedElements[i]];
      if (module == null) {
         tmp.push( allowedElements[i] );
      } else {
         for (var j = 0; j < module.length; j++) {
            tmp.push (module[j] );
         }
      }
   }
   allowedElements = tmp;
   this.parseAttribute = function (attrString, Node) {
      var foo = attrString.replace(/\>/g,"");
      if (foo.search(/\</) !=-1) {
         var attr = foo.split("<");
      } else {
         var attr = foo.split(" ");
      }

      if (attr instanceof Array) {
         //set attribute so that only given attribute values are allowed
         try {
            var allowedValues = attr[1].split("#").join(" ");
         } catch (e) {
            var allowedValues = "";
         }
         Node.setAttribute(attr[0], allowedValues, "\"");
      } else {
         Node.setAttribute(attr, "", "\"");
      }
   }

   // parse the configuration array with the allowed stuff and create a NodeList out of it to compare with the input
   var allowedTags = new Packages.org.htmlparser.util.NodeList();
   for (var i=0; i < allowedElements.length; i++ ) {
      allowedElements[i] = allowedElements[i].trim();
      allowedElements[i] = allowedElements[i].replace(/\]/,"").replace(/\[/,"|");
      allowedElements[i] = allowedElements[i].replace(/\<(.*?)\>/g,"#$1#");
      var foo = allowedElements[i].split("#");
      for( var j = 1; j < foo.length; j++) {
         if (foo[j].charAt(0) != "|") {
            foo[j] = foo[j].replace(/\|/g,"#");
         }
      }
      allowedElements[i] = foo.join(" ");

      var parsedValidItem = allowedElements[i].split("|");
      if (parsedValidItem instanceof String) {
         var tmp = parsedValidItem;
         parsedValidItem = [];
         parsedValidItem[0] = tmp;
      }

      //check if node yet exists in nodelist, for modules that add attributes to existing tags
      if (parsedValidItem[0].charAt(0) == "&") {
         var Node = allowedTags.extractAllNodesThatMatch( new Packages.org.htmlparser.filters.TagNameFilter( parsedValidItem[0].substr(1,(parsedValidItem[0].length-1)) ));
         if (Node.size() != 0) {
            Node = Node.elementAt(0);
            //remove the current tag of the NodeListto append the updatet tag lateron
            allowedTags.keepAllNodesThatMatch( new Packages.org.htmlparser.filters.NotFilter ( new Packages.org.htmlparser.filters.TagNameFilter (parsedValidItem[0])));
         } else {
            continue;
         }
      } else {
         Node = new Packages.org.htmlparser.nodes.TagNode();
         Node.setTagName(parsedValidItem[0]);
      }

      for (var j=1; j < parsedValidItem.length; j++) {
         //check if the parameter is a module name, if so add all according attributes, elseways only create the single attribute
         if ((module = attributeModules[parsedValidItem[j]]) != null) {
            var moduleAttributes = module.split("|");
            if (moduleAttributes instanceof String) {
               this.parseAttribute(moduleAttributes,Node);
            } else {
               for (var k = 0; k < moduleAttributes.length; k++) {
                  this.parseAttribute(moduleAttributes[k],Node);
               }
            }
         } else {
            this.parseAttribute(parsedValidItem[j],Node);
         }
      }
      allowedTags.add(Node);
   }

   //now parse the input / create a NodeList out of it also
   var parser = new Packages.org.htmlparser.Parser();

   //make the inpustream usable
   str = str.replace(/\/\>/g,">");
   parser.setInputHTML(str);
   //check if attribute is allowed at all and holds the right value, if defined
   this.isSaneAttribute = function ( attr, allowedTag ) {
      if ((allowed = allowedTag.getAttribute(attr.getName())) == null || attr.getName() == "/") {
         return false;
      }

      //if attribute is sane check if the value is sane also, if there is no Value defined return true because any value is allowed
      allowedValues = allowed.split(" ");
      if (allowedValues instanceof String) {
         tmp = allowedValues;
         allowedValues = [];
         allowedValues.push ( tmp );
      }

      //one of the possible values must match
      var isAllowed = false;
      for (var i = 0; i < allowedValues.length; i++) {
         //@@implement the checks according to w3's definition
         switch ( allowedValues[i].toLowerCase() ) {
            case "cdata"   :
            case "id"      :
            case "text"    :
            case "nmtoken" :
            case "nmtokens":
            case "linktypes":
            case "idref"   :
            case "idrefs"  :
            case "mediadesc":
                              //@@check evil
                              isAllowed = true;
                              break;
            case "color"   :  //check if given param is a color name (as specified in
                              //http://www.w3.org/TR/xhtml-modularization/abstraction.html#dt_Color or rather in xhtmlColorNames
                              //in the configuration section) or a valid rgb value
                              for (var i = 0; i < xhtmlColorNames.length; i++) {
                                 if (xhtmlColorNames[i] == attr.getValue().toLowerCase()) {
                                    isAllowed = true;
                                    break;
                                 }
                              }
                              if (attr.getValue().search(/^(#){1}([a-fA-F0-9]){3,6}$/) != -1) {
                                 isAllowed = true;
                              }
                              break;

                              isAllowed = true;
                              break;
            case "uri"     :
                              isAllowed = true;
                              break;
            case "safeuri" :  // no javascript allowed
                              if (attr.getValue().search(/^(http|https|ftp)\:\/\/(localhost)|#|([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4})(\:[0-9]+)?(\/[a-zA-Z0-9\.\,\?!\'\\\/\+\(\))(:;&%\$#\=~_\-@]*)*$/) != -1) {
                                 isAllowed = true;
                              }
                              break;
            case "safestyle": //check if background-url is used, and if only allow safeuri
                              var attrValue = attr.getValue();
                              var url = attrValue.match(/\s?url\s?\(/);
                              if (url != null) {
                                 var url = attrValue.match(/\s?url\s?\(\s?\'(.+)\'\s?\)/);
                                 if (url && url[1].search(/^(http|https|ftp)\:\/\/(localhost)|#|([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4})(\:[0-9]+)?(\/[a-zA-Z0-9\.\,\?!\'\\\/\+\(\))(:;&%\$#\=~_\-@]*)*$/) != -1) {
                                    isAllowed = true;
                                 }
                              } else {
                                 isAllowed = true;
                              }
                              break;
            case "character": if (attr.getValue().length < 2) { //@@check if proper char
                                 isAllowed = true;
                              }
                              break;
            case "charset"  : if (attr.getValue().search(/^([a-z0-9\-]+)/) != -1 ) {
                                 isAllowed = true;
                              }
                              break;
            case "languagecode":
                              if (attr.getValue().search(/^([a-z]){2}$/) != -1) {
                                 isAllowed = true;
                              }
                              break;

            case "pixels"  :
            case "number"  :  if (!isNaN(attr.getValue())) {
                                 isAllowed = true;
                              }
                              break;
            case "contenttype":
                              if (attr.getValue().search(/^([a-z]+)\/([a-z\-]+)(\+([a-z\-]+))?(; *?charset=""?([a-z0-9\-]+)""?)?$/) != -1) {
                                 isAllowed = true;
                              }
                              break;
            case "multilength":  //@@ write an own check for multilength
            case "length"  :  if (attr.getValue().search(/^[0-9]+(px)?(%)?$/) != -1) {
                                 isAllowed = true;
                              }
                              break;

            default:          //if no other check is defined than compare if the value == the allowed value (eg. for align)
                              if (allowedValues[i].toLowerCase() == attr.getValue().toLowerCase() ) {
                                 isAllowed = true;
                              }
         }
      }
      return isAllowed;
   }

   // recursive subfunction parseTags made private, here the main stuff is happening, say comparison of the allowed tags/attributes with the user input
   this.parseTags = function (inputNodes, allowedTags) {
      var cleanString = "";
      if (inputNodes != null) {
         for (var i = 0; i < inputNodes.size(); i++) {
            var tag = inputNodes.elementAt(i);
            // only process if tag isnt to nasty
            if (tag != null) {
               // return textnodes untouched
               if (tag.getClass() == Packages.org.htmlparser.nodes.RemarkNode) {
                  ; // dont add
               } else if (tag.getClass() == Packages.org.htmlparser.nodes.TextNode) {
                  cleanString += tag.toHtml();
               } else {
                  var allowedTag = allowedTags.extractAllNodesThatMatch(new Packages.org.htmlparser.filters.TagNameFilter( tag.getTagName().toLowerCase()));
                  // if the tag is not in the list of the allowedTags then remove it, but keep its children and/or textbody
                  if (allowedTag.size() == 0) {
                     //recursively check the subnodes of this tag, if any
                     cleanString += this.parseTags (tag.getChildren(),allowedTags);
                  } else {
                     allowedTag = allowedTag.elementAt(0);
                     //remove insane attributes, that are attributes left out in the configuration array
                     var attr = tag.getAttributesEx();
                     if (allowedTag.getAttribute(".") == null) {
                        for (var j = 1; j < attr.size(); j++) {
                           //set quotes for each element
                           if (attr.elementAt(j).getName() != null) {
                              if (!this.isSaneAttribute(attr.elementAt(j), allowedTag)) {
                                 attr.remove(j);
                              } else {
                                 //set quotes for each surviving element, if they haven't got one yet
                                 attr.elementAt(j).setQuote("\"");
                              }
                           }
                        }
                     }

                     tag.setAttributesEx(attr);
                     //recursively check the subnodes of this tag, if any
                     var parser = new Packages.org.htmlparser.Parser();
                     parser.setInputHTML(this.parseTags(tag.getChildren(), allowedTags));
                     tag.setChildren(parser.parse(null));
                     //xhtmlitize empty xhtmlattributes
                     for(var j=0; j < emptyXhtmlTags.length; j++) {
                        if (tag.getTagName().toLowerCase() == emptyXhtmlTags[j]) {
                           tag.setEmptyXmlTag(true);
                        }
                     }
                     cleanString += tag.toHtml();
                  }
               }
            }
         }
      }
      return cleanString;
   }

   // call of parseTags function
   try {
      return parseTags(parser.parse(null), allowedTags);
   } catch (err) {
      return "";
   }
}
