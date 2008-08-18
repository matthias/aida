importModule("helma.logging", "logging");
 
(function () {

   var logger = logging.getLogger(__name__);

   this.callAction = function(handler) {
      handler.call(this);
      try {
         if (!res.calledRender) {
            this.render();
         } else {
            res.write(this.content);
         }
      } catch(err) {
         if (err instanceof this.templating.NoTemplateFoundError && this.content != null) {
            res.write(this.content);
         } else {
            res.write(err);            
         }
      }
   
   }

   /**
    * Returns the handler function (action), that matches the given route.
    * This function will be called by routing.handleRequest.
    * <p>When a controller object processes a request, it looks for the corresponding instance method 
    * for the incoming action. The method can be defined as a property of the actions object within the 
    * controller, or as a method, which name ends with _action. It will look up the method in the following 
    * order.
    * <ol>
    *  <li>	actions.{format}.{method}.{action}
    *  <li>	actions.{format}.{action}
    *  <li>	actions.{action}
    *  <li>	{action}_{method}_{format}_action
    *  <li>	{action}_{action}_action
    *  <li>	{action}_{method}_action
    *  <li>	{action}_action
    * </ol>
    * <p>If it ﬁnds one, that method is invoked. If no method can be called, the controller looks for 
    * a template named after the current controller and action. If found, this template is rendered directly. 
    * If not, it will try to find a corresponding method for the action “notfound”, and that method is called. 
    * Because aida.controller, which is the parent of all Action Controllers defines a “notfound_action”, 
    * the controller always returns a result.
    * <p>In contrast to Rails, not all public methods in a controller may be invoked as an action method. 
    * Instead you have to add “_action” to the method name, or make it a property of the actions object within 
    * the controller. Because of this fact there is no need for a method “hide_action”.
    * <pre class=javascript>
    * importModule(“aida.controller”, “Controller”);
    * this.__proto__ = Controller;
    * 
    * // will handle /controller/index
    * function index_action() {
    * 	 render();
    * }
    * 
    * // will handle POST /controller/index
    * function index_post_action() {
    *   // handle post data
    *   res.redirect("/" + this.getShortName()); // back to index
    * }
    *
    * // will handle /controller/index.rss
    * function index_rss_action() {
    *   // print this content as rss
    * }
    * 
    * this.actions.json = {
    *    // will handle /controller/index.json
    *    index : function() {
    *      // index as json
    *    },
    *    // will handle POST /controller/index.json
    *    index.post : function() {
    *      // handle post data (submited as json)    
    *    }
    * }
    * 
    * </pre>
    * 
    *
    * @param {object} [route]    If route isn't passed to the function, we will fallback to req.route
    * @config {string} action      Action name, that should be called
    * @config {string} [format]    Format name, matching an incoming format (xml, html, json, ...)
    * @config {string} [method]    HTTP-Moethod (post, get, delete, ...)
    * @return {function}         Returns the matching handler function
    * @see routing.handleRequest
    */
   this.getAction = function(route) {
      var h;
      var route = route || req.route;
      var action = (route.action || "").toLowerCase().replace(".", "_").underscore();
      var method = (route.method || "").toLowerCase();
      var format = (route.format || "").toLowerCase();
   
      h = (
         this.actions && this.actions[format] && this.actions[format][method] && this.actions[format][method][action] ||
         this.actions && this.actions[format] && this.actions[format][action] ||
         this.actions && this.actions[action]
      )
      if (!h) h = (   
         this[action + "_" + method + "_" + format + "_action"] ||
         this[action + "_" + method + "_action"] ||         
         this[action + "_" + format + "_action"] ||
         this[action + "_action"]
      )
      if (!h && this.templating.determineTemplatePath({
         controller : this.getShortName(),
         action : action,
         format : format
      })) {
         h = new Function();
      }
   
      return h;
   }

}).call(this);
