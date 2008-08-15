
importModule("javascript.prototype");
importModule("routing");

importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/development/log4j.properties').path);
 
(function () {
   
   var logger = logging.getLogger(__name__);
   
   this.getControllerInstance = function(name) {
      try {
         importModule("app.controllers." + name + "_controller");      
      } catch(err) {
         logger.error("Couldn't find controller " + name + " in app/controllers");
         return;
      }
      var ctor = app.controllers[name + "_controller"][getClassNameFromName(name)];
      var proto = Object.clone(ctor.prototype);
      ctor.prototype = app.controllers[name + "_controller"];
      Object.extend(ctor.prototype, proto);
      ctor.prototype.__name__ = getClassNameFromName(name);
      var c = new ctor();
      c.importHelpers("application")
      c.importHelpers(name)
      return c;
   }

   this.getClassNameFromName = function(name) {
      return name.capitalize() + "Controller";
   }

   /**
    * Returns an URL for this options.
    * 
    */
   this.urlFor = function(options) {
      return this.routes.generate(options, req, this);
   }


   this.getShortName = function() {
      var namePattern = /^(.*)Controller$/;
      return this.__name__.match(namePattern)[1].toLowerCase();
   }

}).call(this);

