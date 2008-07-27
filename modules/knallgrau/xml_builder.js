/*
 * Helma License Notice
 *
 * The contents of this file are subject to the Helma License
 * Version 2.0 (the "License"). You may not use this file except in
 * compliance with the License. A copy of the License is available at
 * http://adele.helma.org/download/helma/license.txt
 *
 * Copyright 1998-2008 Helma Software. All Rights Reserved.
 */

/**
 * @fileoverview
 * Module for creating xml. 
 * This module takes advantage of the __get__ function, so all (almost all) methods send
 * to the xml module will be translated to the equivalent xml markup.
 * The first argument is an optional object, containing the attributes for the node.
 * All other attributes may be strings or e4x objects, and will added as the content for the node.
 * 
 * <pre class="javascript">
 * importModule('aida.xml_builder', 'xml');
 * 
 * xml.em("emphasized").writeln()   // =&gt; &lt;em&gt;emphasized&lt;/em&gt;
 * xml.em("This is ", xml.b(("emph & bold").encodeXml()), " text.").writeln()
 *                                  // =&gt; &lt;em&gt;This is &lt;b&gt;emph &amp; bold&lt;/b&gt; text.&lt;/em&gt;
 * xml.a({"href":"http://helma.org"}, "A Link").writeln();
 *                                  // =&gt; &lt;a href="http://helma.org"&gt;A Link&lt;/a&gt;
 * xml.div(xml.br()).writeln()          // =&gt; &lt;div&gt;&lt;br /&gt;&lt;/div&gt;
 * xml.target({name:"compile", "option":"fast"}).writeln()
 *                                  // =&gt; &lt;target option="fast" name="compile" /&gt;
 *                                  // NOTE: order of attributes is not specified.
 * 
 * with (xml) { res.writeln(
 *    xmlDeclaration(),             // &lt;?xml version="1.0" encoding="UTF-8"?&gt;
 *    html(                         // &lt;html&gt;
 *       head(                      //   &lt;head&gt;
 *          title("History")        //     &lt;title&gt;History&lt;/title&gt;
 *       ),                         //   &lt;/head&gt;
 *       body (                     //   &lt;body&gt;
 *          comment("HI"),          //     &lt;!-- HI --&gt;
 *          h1("Header"),           //     &lt;h1&gt;Header&lt;/h1&gt;
 *          p(&lt;span class="red"&gt;
 *             even e4x works
 *          &lt;/span&gt;)                //     &lt;p&gt;&lt;span class="red"&gt;even e4x works&lt;/span&gt;&lt;/p&gt;
 *       )                          //   &lt;/body&gt;
 *    )                             // &lt;/html&gt;      
 * )}                               //
 * </pre>
 *
 * @author Matthias.Platzer AT aida.at
 * @version 0.1 
 */
 
importModule("core.string");
var __shared__ = true;

// patch encodeXml
/** @ignore */
String.prototype.encodeXml = function() {
   return this.replace(/&/gm, "&amp;")
      .replace(/</gm, "&lt;")
      .replace(/>/gm, "&gt;")
      .replace(/"/gm, "&quot;");
};
 
/** @ignore */
function __get__(name) {
   if (this[name]) {
      return this[name];
   } else {
      return function(attributes) {
   	   var args = [name];
   	   for (var i=0; i<arguments.length; i++) args.push(arguments[i]);
   	   if (args.length === 1 || (typeof args[args.length-1] !== "string" && typeof args[args.length-1] !== "xml")) {
   	      // node has no content
   	      var closed = true;
   	   } else {
   	      var closed = false;   	      
   	   }
         return (closed) ? closedNode.apply(this, args) : node.apply(this, args);;
      }
   }
   return this[name];
}


/**
 * Returns an opening tag as string.
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.open("body", {background:"red"}).writeln();
 * xml.h1("Hello World!").writeln();
 * xml.close("body").writeln();
 * 
 * @param {string} nodeName      Tag name to be used.  
 * @param {object} [attributes]  Any properties of this object will be added as attributes to the opening tag.
 *                               Each property will be onverted to a string and xml encoded.
 * @return {string} Xml output.
 */
function open(nodeName, attributes) {
   var args = [];
   for (var i=1; i<arguments.length; i++) args.push(arguments[i]);

	res.push();
	res.write('<' + nodeName);
	if (attributes && typeof attributes == "object") {
		args.shift();
		for (var name in attributes) {
			res.write(' ' + name + '="' + (attributes[name]+"" || "").encodeXml() + '"');
		}
	}
	res.write('>');
	return res.pop();
}


/**
 * Returns a closing tag as string.
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.open("body", {background:"red"}).writeln();
 * xml.h1("Hello World!").writeln();
 * xml.close("body").writeln();
 * 
 * @param {string} nodeName      Tag name to be used.  
 * @return {string} Xml output.
 */
function close(nodeName) {
	return '</' + nodeName + '>';
}


/**
 * Returns a tag as string.
 * If the second argument is an object it will be used for generating the attributes of the
 * tag. Otherwise all arguments, except the first one, which is the tag name, will be printed
 * as the tags content. You have to take care of the xml encoding by yourself by calling 
 * <code class="javascript">("Me & You").encodeXml()</code>. If you don't provide any content
 * arguments, the tag will be rendered as a closed tag.
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.open("body", {background:"red"}).writeln();
 * xml.node("h1", ("&gt;&gt;Hello World & Welcome!&lt;&lt;").encodeXml()).writeln();
 *   // =&gt; &lt;h1&gt;&gt;&gt;Hello World &amp; Welcome!&lt;&lt;&lt;/h1&gt;
 * xml.node("hr");   // =&gt; &lt;hr /&gt;
 * xml.node("p", "This is ", xml.node("a", {href: "http://helma.org"}, "helma"), " speaking!").writeln();
 *   // =&gt; &lt;p&gt;This is &lt;a href="http://helma.org"&gt;helma&lt;/a&gt; speaking!&lt;/p&gt;
 * xml.close("body").writeln();
 * 
 * @param {string} nodeName      Tag name to be used.  
 * @param {object} [attributes]  Any properties of this object will be added as attributes to the opening tag.
 *                               Each property must be a string and will be xml encoded.
 * @return {string} Xml output.
 */
function node(nodeName, attributes) {
   var args = [];
   for (var i=1; i<arguments.length; i++) args.push(arguments[i]);
	if (attributes && typeof attributes == "object") {
		args.shift();
   }
   if (args.length == 0) return closedNode(nodeName, attributes);
   
	res.push();   
	open(nodeName, attributes).write();
	for (var i=0; i<args.length; i++) {
   	res.write( (typeof args[i] === "xml") ? args[i].toXMLString() : args[i] );
	}
	close(nodeName).write();			   
	return res.pop();
}


/**
 * Returns always a closed tag as string.
 * Alternativly you cann call <code class="javascript">node()</code> without providing any content arguments.
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.p(
 *  "First Line", 
 *  xml.closedNode("br"),
 *  "Second Line" 
 * ).writeln();
 * // =&gt; &lt;p&gt;First Line&lt;br /&gt;Second Line&lt;/p&gt;
 * xml.closedNode("hr", {size:"2", noshade:"noshade"}).writeln();
 * // =&gt;  &lt;hr noshade="noshade" size="2" /&gt;
 * 
 * @param {string} nodeName      Tag name to be used.  
 * @param {object} [attributes]  Any properties of this object will be added as attributes to the opening tag.
 *                               Each property will be onverted to a string and xml encoded.
 * @return {string} Xml output.
 */
function closedNode(nodeName, attributes) {
	res.push();
	res.write('<' + nodeName);
	if (attributes && typeof attributes == "object") {
		for (var name in attributes) {
			res.write(' ' + name + '="' + (attributes[name]+"" || "").encodeXml() + '"');
		}
	}
	res.write(' />');
	return res.pop();		
}


/**
 * Returns a xml <code>&lt;!-- comment --&gt;</code>
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.comment("&gt;&gt; This is a comment.").writeln();
 *  // =&gt; &lt;!-- &amp;gt;&amp;gt; This is a comment. --&lgt;
 * 
 * @param {string} comment       Comment text, will be converted to a string and xml encoded.
 * @return {string} Xml output.
 */
function comment(comment) {
	return('<!-- ' + (comment+"" || "").encodeXml() + ' -->');
}


/**
 * Returns a xml declaration. <code>&lt;? xml version="1.0" encoding="UTF-8" ?&gt;</code>
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.xmlDeclaration().writeln();
 *  // =&gt; &lt;? xml version="1.0" encoding="UTF-8" ?&gt;
 * xml.xmlDeclaration({encoding:"ISO-8859-1", version: "1.0"}).writeln();
 *  // =&gt; &lt;? xml version="1.0" encoding="ISO-8859-1" ?&gt;
 * 
 * @param {object} [attributes]       Overides the default attributes (version="1.0" encoding="UTF-8")
 * @return {string} Xml output.
 */
function xmlDeclaration(attributes) {
   attributes = attributes || {
     version : "1.0",
     encoding : "UTF-8"
   }
   return instruct("xml", attributes);
} 


/**
 * Returns a xml instruction. <code>&lt;? xml version="1.0" encoding="UTF-8" ?&gt;</code>
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.instruct("xml", {encoding:"ISO-8859-1", version: "1.0"}).writeln();
 *  // =&gt; &lt;? xml version="1.0" encoding="ISO-8859-1" ?&gt;
 * 
 * @param {string} directiveTag     Name of the instruction.
 * @param {object} [attributes]     Overides the default attributes (version="1.0" encoding="UTF-8")
 * @return {string} Xml output.
 */
function instruct(directiveTag, attributes) {
   var args = [];
   for (var i=1; i<arguments.length; i++) args.push(arguments[i]);
	if (attributes && typeof attributes != "string") {
		args.shift();
   }
	res.push();
	res.write('<?', directiveTag);
	for (var name in attributes) {
		res.write(' ' + name + '="' + (attributes[name]+"" || "").encodeXml() + '"');
	}
	res.write(' ?>');
	return res.pop();
}


/**
 * Returns a xml declaration. <code>&gt; &lt;! DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd" &gt;</code>
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.declare("DOCTYPE", ["html", "PUBLIC"], "-//W3C//DTD HTML 4.01//EN", "http://www.w3.org/TR/html4/strict.dtd").writeln();
 *  // =&gt; &lt;! DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd" &gt;
 * 
 * @param {string} inst             Name of the declaration. 
 * @param {array} attributes        Any properties of the attributes array will be added as plain text.
 * @param {string} [arguments]      Any other arguments will be added as xml encoded and quoted strings.
 * @return {string} Xml output.
 */
function declare(inst, attributes) {
   var args = [];
   for (var i=1; i<arguments.length; i++) args.push(arguments[i]);
	res.push();
	res.write('<!' + inst);
	if (attributes && typeof attributes != "string") {
   	for (var i=0; i<attributes.length; i++) {
   		res.write(' ' + (attributes[i]+"" || "").encodeXml());
   	}
		args.shift();
   }
	for (var i=0; i<args.length; i++) {
		res.write(' "' + (args[name]+"" || "").encodeXml() + '"');
	}
	res.write('>');
	return res.pop();
}


/**
 * Returns a xml <code>&lt;![CDATA[ cdata block ]]&gt;</code>
 * @example
 * importModule('aida.xml_builder', 'xml');
 * xml.cdata("some text").writeln();
 *  // =&gt; &lt;![CDATA[ some text ]]&gt;
 * 
 * @param {string} text       CDATA text.
 * @return {string} Xml output.
 */
function cdata(text) {
	res.push();
	res.writeln('<![CDATA[ ');
	res.writeln(text);
	res.writeln(' ]]>');
	return res.pop();  
}


/**
 * Writes this string to the response (res.write).
 */
String.prototype.write = function() {
	res.write(this);
}


/**
 * Writes this string to the response (res.writeln) with a trailing newline.
 */
String.prototype.writeln = function() {
	res.writeln(this);
}
