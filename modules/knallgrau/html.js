importModule("knallgrau.xml_builder", "xml");
this.__proto__ = xml;

function __get__(name) {
   if ([
      "area", "base", "basefont", "br", "col", "frame", "hr", "img", "input", "isindex", "link",
      "meta", "param"
   ].indexOf(name) != -1) {
      return function(attributes) {
   	   var args = [name];
   	   for (var i=0; i<arguments.length; i++) args.push(arguments[i]);
   	   return closedNode.apply(this, args);
      }      
   } else {
      return this[name];
   }
}


function doctype(attributes) {
   var doctypes = {
      "html:strict" : ["-//W3C//DTD HTML 4.01//EN", "http://www.w3.org/TR/html4/strict.dtd"],
      "html:transitional" : ["-//W3C//DTD HTML 4.01 Transitional//EN", "http://www.w3.org/TR/html4/loose.dtd"],
      "html:frameset" : ["-//W3C//DTD HTML 4.01 Frameset//EN", "http://www.w3.org/TR/html4/frameset.dtd"],
      "xhtml:strict" : ["-//W3C//DTD XHTML 1.0 Strict//EN", "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"],
      "xhtml:transitional" : ["-//W3C//DTD XHTML 1.0 Transitional//EN", "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"],
      "xhtml:frameset": ["-//W3C//DTD XHTML 1.0 Frameset//EN", "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd"]
   }
   doctypes["html"] = doctypes["html:loose"] = doctypes["html:transitional"];
   doctypes["xhtml"] = doctypes["xhtml:transitional"];
   var i=0;
   
   var args = ["DOCTYPE"];
	if (attributes == null || typeof attributes === "string") {
		args.push(["html", "PUBLIC"]);
   }
   if (typeof attributes === "string" && doctypes[attributes] != null) {
      args = args.concat(doctypes[attributes]);
      i++;
   }
   for (; i<arguments.length; i++) args.push(arguments[i]);
   return declare.apply(this, args);
}
