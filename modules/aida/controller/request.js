
importModule("javascript.prototype");
importFromModule("controller", "*");
importModule("routing");

importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/development/log4j.properties').path);
 
(function () {
   
   var logger = logging.getLogger(__name__);
   
   /**
    * Tries to resolve the incoming request, and call the matching controllers action.
    * It will be called by the global handleRequest.
    *
    * @param {object} controller   Controller object
    * @param {object} req          Request object, passed by helma-ng
    * @param {object} res          Response object, passed by helma-ng
    * @param {object} session      Session object, passed by helma-ng
    */
   this.handleRequest = function(controllerName) {
      var routeSet = routing.loadRoutes(controllerName).routeSet;
      req.route = req.route || routeSet.recognizeRequest(req);   
      if (!req.route) return handle404(); // FIXME 404
      Object.extend(req.data, req.route.params);
      Object.extend(req.params, req.route.params);

      global.controller = getControllerInstance(req.route.controllerName);
      if (!controller) return handle404(); // FIXME 404

      req.route.handler = controller.getAction(req.route);
      if (!req.route.handler) {
         return handle404(); // FIXME 404
      }
      
      controller.actionName = req.route.action;

      controller.content = "";
      if (!controller.beforeFiltersPass()) return;
      controller.callAction(req.route.handler);
      controller.applyAfterFilters();
      // controller.renderLayout();
   }
   
   /**
    * ...
    */
   function handle404() {
      res.status = "404";
      res.write("404 Couldn't find " + req.path);
      return;
   }   

}).call(this);
