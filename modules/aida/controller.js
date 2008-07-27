
importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/development/log4j.properties').path);
var logger = logging.getLogger(__name__);

importModule('javascript.prototype');

importModule("controller.routing", "routing");
importFromModule("controller.filters", "*");
importFromModule("controller.helpers", "*");
importFromModule("controller.render", "*");
importFromModule("controller.actions", "*");
importFromModule("controller.layout", "*");

importFromModule("config.environments.development.development", "config");

this.context = {};

function getControllerInstance(name) {
   importModule("app.controllers." + name + "_controller");
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

function getClassNameFromName(name) {
   return name.capitalize() + "Controller";
}

/**
 * Tries to resolve the incoming request, and call the matching controllers action.
 * It will be called by the global handleRequest.
 *
 * @param {object} controller   Controller object
 * @param {object} req          Request object, passed by helma-ng
 * @param {object} res          Response object, passed by helma-ng
 * @param {object} session      Session object, passed by helma-ng
 */
function handleRequest(controllerName) {
   var routeSet = routing.loadRoutes(controllerName).routeSet;
   req.route = req.route || routeSet.recognizeRequest(req);   
   if (!req.route) return; // FIXME 404
   global.controller = getControllerInstance(req.route.controllerName);
   
   Object.extend(req.data, req.route.params);
   Object.extend(req.params, req.route.params);
   
   req.route.handler = controller.getAction(req.route);
   controller.actionName = req.route.action;
   
   controller.content = "";
   if (!controller.beforeFiltersPass()) return;
   controller.callAction(req.route.handler);
   controller.applyAfterFilters();
   controller.renderLayout();
}


/**
 * Returns an URL for this options.
 * 
 */
urlFor = function(options) {
   return this.routes.generate(options, req, this);
}


function getShortName() {
   var namePattern = /^(.*)Controller$/;
   return this.__name__.match(namePattern)[1].toLowerCase();
}


// ERROR Objects

function DoubleRenderError() {
   this.toString = function() {
      return "render() may just be called once."
   }
}
