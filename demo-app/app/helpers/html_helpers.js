
importModule("knallgrau.html", "html");

function __get__(name) {
   if (name.endsWith("_macro")) {
      return function(macrotag, skin, context) {
   	   var args = [macrotag.name.split(".").pop()];
   	   if (macrotag.parameterNames.length > 0) {
      	   var attributes = {};
      	   for (var i=0; i<macrotag.parameterNames.length; i++) {
      	      attributes[macrotag.parameterNames[i]] = macrotag.getParameter(macrotag.parameterNames[i]);
   	      }
   	      args.push(attributes);
   	   }
   	   for (var i=0; i<macrotag.parameters.length; i++) args.push(macrotag.parameters[i]);
         logger.info("args:" + args)
         return html.node.apply(this, args);
      }
   } else return this[name];
}
