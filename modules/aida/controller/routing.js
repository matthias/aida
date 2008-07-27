importModule("helma.shell", "shell");
importModule("javascript.prototype");
importFromModule("formats", "Formats");

__shared__ = true;

/**
 * @fileOverview
 * This module provides rails-like routing for helma-ng.
 *
 * <p>The routing module provides URL rewriting in native JavaScript. It's a way to redirect incoming 
 * requests to controllers and actions. This replaces mod_rewrite rules and works with any web
 * server, as it is pure JavaScript.
 * <p>By default the first controller, that is called to resolve an incoming request path is the RootController's
 * routes defined in app/routes/root_routes.js. Consider the following route, installed by Aida when you 
 * generate your application in the file app/routes/root_routes.js:
 * <pre language=JavaScript>
 *  var RootController.routes.draw([
 *    {
 *       pattern : "/$controller/$action/$id"
 *    }
 *  ]);
 * </pre>
 * <p>This route states that it expects requests to consist of a $controller followed by an $action that 
 * in turn is fed some $id. Suppose you get an incoming request for /blog/edit/22, you‘ll end up with:
 * <pre language=JavaScript>
 * req.data.routes[0].params = {
 *   controller : 'blog',
 *   action     : 'edit',
 *   id         : '22'
 * }
 * </pre>
 * <b>Deﬁning Routes</b>
 * <p>Unlike in Rails routes don't exist in the global namespace, but are mounted at a controller. Routes
 * are defined in app/routes in files named <name>_route.js. For example routes defined in 
 * app/routes/say_routes.js will be mounted at the SayController defined in app/controllers/say_controller.js. 
 * You can access the routing methods via the "routing" property of the <tt>Controller</tt>. 
 * <p>In the above example we use the <tt>Controller.routes.draw([options])</tt> method to add an array of new routes. 
 * If you want to add just one route you could also use <tt>routing.connect(options)</tt>.
 * The <b>options object</b> accepts the following attribute to configure your routes:
 * <dl>
 * <dt><i>string</i> pattern</dt><dd>
 *  Patterns will be matched against the incoming req.path to determine which route should be used.
 *  <ul>
 *  <li> Components are separated by forward slash characters. 
 *  Each component in the pattern matches one or more components in the 
 *  URL. Components in the pattern match in order against the URL. 
 *  <li> A pattern component of the form $name sets the parameter name to whatever 
 *  value is in the corresponding position in the URL. 
 *  <li> A pattern component of the form *name accepts all remaining components 
 *  in the incoming URL. The parameter name will reference an array 
 *  containing their values. Because it swallows all remaining components 
 *  of the URL, *name must appear at the end of the pattern. 
 *  <li> Anything else as a pattern component matches exactly itself in the corresponding 
 *  position in the URL. For example, a routing pattern containing 
 *  store/$controller/buy/$id would map if the URL contains the text store at the 
 *  front and the text buy as the third component of the path.
 *  </ul>
 * </dd>
 * <dt><i>object</i> defaults</dt><dd>
 * Sets default values for the named parameters in the pattern. Trailing 
 * components in the pattern that have default values can be omitted in 
 * the incoming URL, and their default values will be used when setting 
 * the parameters. Parameters with a default of null will not be added to the 
 * params hash if they do not appear in the URL. If you don’t specify otherwise, 
 * routing will automatically supply the following defaults. 
 * <pre class=JavaScript>
 * defaults : { controller: controller, action : "index", id : null }
 * </pre>
 * <p>This explains the parsing of the default route, speciﬁed in app/routes/root_routes.js as 
 * <pre class=JavaScript>
 *  RootController.routes.draw([
 *    {pattern:'$controller/$action/$id'}
 *  ])</pre>
 * <p>Because the action defaults to "index" and the id may be omitted (because 
 * it defaults to nil), routing recognizes the following styles of incoming URL 
 * for the default Rails application. 
 * <pre class="JavaScript">
 * RootController.routes.recognizePath("/");
 * => {action:"index", controller:"root"}
 * RootController.routes.recognizePath("/store");
 * => {action:"index", controller:"store"}
 * RootController.routes.recognizePath("/store/show");
 * => {action:"show", controller:"store"} 
 * RootController.routes.recognizePath("/store/show/45");
 * => {action:"show", controller:"store", id:"45"} 
 * </pre>
 * </dd>
 * <dt><i>object</i> requirements</dt><dd>
 * Speciﬁes that the given components, if present in the URL, must each 
 * match the speciﬁed regular expressions in order for the map as a whole 
 * to match. In other words, if any component does not match, this map 
 * will not be used.
 * <pre class=JavaScript>
 *  RootController.routes.connect({
 *    pattern:'$controller/$action/$id',
 *    requirements : { id : /^\d+$/ }
 *  }])
 * </pre> 
 * In this example the id (if present) must match a number, without any additions.
 * </dd>
 * <dt><i>string</i> conditions</dt><dd>
 * Conditions allows you to specify that routes are matched 
 * only in certain circumstances. The set of conditions that may be tested 
 * may be extended by plugins—out of the box, routing supports a single 
 * condition. This allows you to write routes that are conditional on the 
 * HTTP verb used to submit the incoming request. 
 * <p>In the following example, Aida will invoke the display_checkout_form_action action 
 * when it receives a GET request to /store/checkout, but it will call the action 
 * save_checkout_form if it sees a POST request to that same URL. 
 * <em class=path>app/routes/root_routes.js</em>
 * <pre class=JavaScript> 
 * RootController.routes.draw([
 *   {
 *      pattern: 'store/checkout',
 *      conditions: { method: "get" },
 *      action: "display_checkout_form"
 *   },
 *   {
 *      pattern: 'store/checkout',
 *      conditions: { method: "post" },
 *      action: "save_checkout_form"    
 *   },
 * ]);
 * </pre>  
 * </dd>
 * </dl>
 */

DEFAULT_FORMAT = "html";


function loadRoutes(name) {
   importModule("app.routes." + name + "_routes");
   return app.routes[name + "_routes"];
}


/**
 * Tries to resolve the incoming request, for a given RouteSet.
 *
 * @param {Object} [RouteSet]     RoutSet, to be checked for matching routes.
 * @param {Object} req            Request object
 * @return {Object} Returns the result object from Route.match()
 */
function recognizeRequest(routeSet, req) {
   var routes = routeSet.routes;   
   var result;
   for (var i=0; i<routes.length; i++) {
      var result = routes[i].match(req);
      if (result) {
         if (result.forwardTo) {
            var routeSet = loadRoutes(result.forwardTo).routeSet;            
            return recognizeRequest(routeSet, req)
         } else {
            return result;            
         }
      }
   }
   return;
}


/**
 * Tries to resolve a path with optionals parameters, for a given RouteSet.
 *
 * @param {Object} [RouteSet]     RoutSet, to be checked for matching routes.
 * @param {String} path           Request path
 * @param {Object} params         Request params
 * @param {String} [params.method]  HTTP method (uppercase), defaults to "GET"
 * @return {Object} Returns the result object from Route.match()
 */
function recognizePath(routeSet, path, params) {
   var routes = routeSet.routes;   
   // detect HTTP method
   var methodMatch = path.match(/([A-Z]+) /);
   var method;
   if (methodMatch) {
      method = methodMatch[1];
      path = path.substr(methodMatch[0].length);
   } else {
      method = "GET";
   }
   var req = Object.extend({
      method : method,
      path : path
   }, params || {});
   return recognizeRequest(routeSet, req)
}


/**
 * Generates a URL for a route.
 *
 * @param {Object} [RouteSet]     RoutSet, to be checked for matching routes.
 * @param {Object} options           Request params
 * @param {String} [options.method]  HTTP method (uppercase), defaults to "GET"
 * @param {Request} req              Request object
 * @return {String} Returns the resulting path (URL)
 * @return {null} Returns null if no path could be generated.
 */
function generate(routeSet, options, req) {
   var result;
   var routes = routeSet.routes;
   for (var i=0; i<routes.length; i++) {
      var result = routes[i].getPath(options, req);
      if (result) return result;
   }
   return null;         
}


/**
 * Set constructor for holding a set of routes for a controller.
 * You don't need to create your the Route objects on your own. 
 * Just use .connect, .add and .draw to add new routes.
 * 
 * @param {Object} controllerName  Short name ("article" for "ArticleController") of the controller.
 */
var RouteSet = function(controllerName) {
   if (controllerName == null) controllerName = "root";   
      
   var routes = [];
   
   /**
    * Add route(s) by passing a route defintion object, or an array of route 
    * definition objects.
    * @param {Object} routeDefinitions    routeDefinitions
    * @param {Array}  options             Array of options
    * @see Route
    * @return Array of all routes
    */
   this.add = function(routeDefinitions) {
      if (!routeDefinitions instanceof Array) routeDefinitions = [routeDefinitions];
      for (var i=0; i<routeDefinitions.length; i++) {
         var rd = routeDefinitions[i];
         (typeof rd === "string") ?
            this.connect(rd) :
            this.connect(rd.pattern, rd);
      }
      return this;
   }
   
   /**
    * Rails like syntax for adding new routes, by providing a mapper. 
    * @param {Function} mapper   Function, within you can access this RouteSet via "this".
    * @return {RouteSet} Array of all routes
    */   
   this.draw = function(mapper) {
      mapper.apply(this);
      return this;
   }
  
   /**
    * Add a new route specified in pattern and options.
    * @param {Object} options   Options for the new route.
    * @see Route
    * @return {Route} Returns the new Route, that was just added to this RouteSet.
    */   
   this.connect = function(pattern, options) {
      return routes.push( 
         new Route( controllerName,
            Object.extend({
               pattern : pattern
            }, options || {})
         ) 
      );
      return this;
   }

   /**
    * Call routing.recognizeRequest for this controller.
    *
    * @param {Object} req            Request object
    * @return {Object} Returns the result object from Route.match()
    */   
   this.recognizeRequest = function(req) {
      return recognizeRequest(this, req);
   },
      
   /**
    * Call routing.recognizePath for this controller.
    *
    * @param {String} path           Request path
    * @param {Object} options        Request ooptions
    * @config {String} method        HTTP method
    * @return {Object} Returns the result object from Route.match()
    */   
   this.recognizePath = function(path, options) {
      return recognizePath(this, path, options);
   },

   /** @ignore */
   this.generate = function(options, req) {
      return generate(this, options, req);
   },

   /**
    * Return a single route at index.
    * @param {Number} index   Index starting at 0 (zero)
    * @return {Route} A single Route object.
    */
   this.get = function(index) {
      return routes[index];
   }
   
   /**
    * Clears all routes.
    */   
   this.clear = function() {
      routes = [];
   }
   
   this.toString = function() {
      return routes.invoke('toString').join("\n");
   }

   /**
    * Returns all routes.
    * @return {Array} Array of Route objects
    */
   this.__defineGetter__("routes", function() {
      return routes;
   })

   /**
    * Returns the short name of the controller.
    * @return {String}
    */
   this.__defineGetter__("controller", function() {
      return controllerName;
   })
   
   /**
    * Holds the number of routes. To be compatible with Arrays.
    * @return {Number}    
    */ 
   this.__defineGetter__("length", function() {
      return routes.length;
   })   

}

/**
 * Global RouteSet to be used for root. // ??
 * ?? That's the rails way, but i'm not sure if we should keep that, 
 * because routes are mounted at controllers.
 */
Routes = new RouteSet();


/**
 * Route constructor for new routes.
 * This constructor is used internaly by Routes.connect and Routes.draw. For more details on the
 * options go to the file overview.
 * 
 * @param {Object} options
 * @config {String} pattern         
 *   Pattern to match against the incoming request, starting with a leading slash.
 *   A variable is identified by a laeding $ (dollar-sign) for example '/$controller/$action'.
 * @config {String} [action]          Name of the action. Will be used as default if the pattern doesn't contain an '$action'
 * @config {String} [controller]      Controller object name as string, for example "BlogController". 
 * @config {Object} [controller]      Controller object, for example BlogController.
 * @config {String} [forwardTo]       
 *    Controller object name as string to which the route should forward, if the incoming request path
 *    does match the pattern, but is longer than the pattern.
 * @config {Object} [forwardTo]       Controller as obect to be used for forwardTo.
 * @config {Object} [defaults]        
 *    Object containing default values to be used, if the incoming request path doesn't provide the 
 *    information becuase it's to short.
 * @config {Object} [requirements]
 *    Contains regular expressions, that will be tested against the resulting routes named values.
 *    For example requirements.id will be tested against route.param.id when performing Route.match().
 * @config {Object} [conditions]
 *    Each condition will be called on Named object of functions that will be called to perform extra tests. The following attributes will be
 *    passed to the function call:
 *    <pre>  value ... The value from options.conditions.{name} will be passed as the first attribute
 *    req ... request object
 *    path ... path as string
 *    params ... object, containg all values from the matching route</pre>
 *    The function will be called with <tt>this</tt> referencing to this <tt>Route</tt>.
 * @see connect
 * @see draw 
 */
var Route = function(controllerName, options) {

   var VARIABLE_IDENTIFIER = "$";
   var COMPONENT_SEPARATOR = "/";
   var EXTENSION_SEPARATOR = ".";
   var FORWARD = "->";
   var route = this;

   this.controllerName = controllerName || "root";
   this.options = options;
   this.originalOptions = Object.clone(options);
   delete this.originalOptions.pattern;
   this.pattern = options.pattern;
   this.action = options.action;

   // detect HTTP method
   var methodMatch = this.pattern.match(/([A-Z]+) /);
   if (methodMatch) {
      this.method = methodMatch[1];
      this.pattern = this.pattern.substr(methodMatch[0].length);
   } else {
      this.method = "ANY";
   }

   // detect forward rule
   this.doForward = this.pattern.endsWith(FORWARD);
   if (this.doForward) {
      this.forwardTo = options.forwardTo;
      this.pattern = this.pattern.substr(0, this.pattern.length - FORWARD.length);
   }

   this.components = this.pattern.split(COMPONENT_SEPARATOR);
   var lastComponent = this.components.pop();
   this.components = this.components.concat(lastComponent.split(EXTENSION_SEPARATOR));

   this.options = options || {};
   this.defaults = Object.extend({
      action : options.action || "index",
      id : null
   }, this.options.defaults || {});

   this.conditions = {

      /**
       * 
       */
      method : function(method, req, path, result) {
         // this.method, req, path, this.defaults
         if (method == "ANY") return true;
         if (method != (req.data.method ? req.data.method.toUpperCase() : req.method)) return false;
         return true;
      },
      actionExists : function(perform, path, req, result) {
         if (!perform) return true;
         var actionName = (typeof perform == "object" && perform.actionName) ? perform.actionName : "action";
         if (result[actionName] == "ANY") return true;
         if (method != (req || {})["method"]) return false;
         return true;
      } 
   };

   var getNameFromPatternComponent = function(idx) {
      return route.components[idx].substr(VARIABLE_IDENTIFIER.length);
   };

   /**
    * Matches an incoming request path, against this route and returns a result object with all 
    * relevant informations about this matching route.
    * The resulting object is a clone of this Route augumented with the following attributes:
    * <dl>
    * <dt><i>object</i> route</dt> 
    *   <dd>A reference to the original route, which is this</dd> 
    * <dt><i>object</i> params</dt> 
    *   <dd>Object filled with values for each variable for this route pattern. 
    *       For example an incoming request with the path "/say/hello" matching against a route 
    *       with the pattern "/$controller/$action/$id" will result in a params object 
    *       -> {controller:"say", action: "hello", id: null}</dd>
    * <dt><i>string</i> method</dt>     
    *   <dd>HTTP-Method of the tested request.</dd>
    * <dt><i>boolean</i> doForward</dt>
    *   <dd>Is true if the route pattern ends with an arrow '-&gt;' and the tested path is longer than the pattern.</dd>
    * <dt><i>string</i> extension</dt>
    *   <dd>File extension of the tested path, which is the part behind the last dot in the path, if the path doesn't end with an arrow '-&gt;'</dd>
    * <dt><i>string</i> format</dt>
    *   <dd>Format that matches the extension. If it can't match a format it will be equal to the extension, if there is no extension it will default to 'html'. For more details refer to Formats.</dd>
    * <dt><i>string</i> path</dt>
    *   <dd>The tested path.</dd>
    * <dt><i>object</i> request</dt>
    *   <dd>The passed request object.</dd>
    * <dt><i>string</i> action</dt>
    *   <dd>The matching part from the path for $action. Otherwise it will default to 'index'</dd>
    * <dt><i>string</i> controller</dt>
    *   <dd>The matching part from the path for $controller. Otherwise it will default to 'root'</dd>    
    * @param {String} [req]      Request object, or something that is similar to a request object.
    * @config {Object} data      Hash containing request parameters with their values.
    * @config {String} method    HTTP-Method in uppercase letters. May also be ANY.
    * @param {String} path       Relative path of the incoming request, starting with a leading slash (/path/to/something).
    * @return {Object}
    *  The result object is a clone of this route augmented by the following properties: 
    *  params, method, doForward, extension, format, path, request, action, controller.
    *  For more details refer to the description of this function.
    */
   this.match = function(req) {
      var path = req.remainingPath || req.path;
      var pathComponents = path.split(COMPONENT_SEPARATOR);
      var lastComponent = pathComponents.pop().split(EXTENSION_SEPARATOR);
      var extension = (lastComponent.length > 1) ? lastComponent.pop() : DEFAULT_FORMAT;
      pathComponents.push(lastComponent.join(EXTENSION_SEPARATOR));
      // var req = req || Object.extend({ method : 'GET', data : {}}, request || {});
      var result = Object.clone(this);
      result.params = Object.clone(this.defaults);
      
      if (this.method && !this.conditions.method(this.method, req, path, this.defaults)) return;
      result.method = req.method;

      // loop through the path and check against the pattern components
      for (var i=0; i<pathComponents.length; i++) {
         if (i > this.components.length - 1) {
            return;               
         }

         if (this.components[i].startsWith(VARIABLE_IDENTIFIER)) {
            var componentName = getNameFromPatternComponent(i);
            if (pathComponents[i]) result.params[componentName] = pathComponents[i];
            continue; // $variable
         }

         if (this.components[i].startsWith("*")) {
            var componentName = this.components[i].substr(1);
            result.params[componentName] = pathComponents.slice(i, pathComponents.length);
            i = pathComponents.length;
            break;
         }

         if (pathComponents[i] != this.components[i]) return;

         if (i >= this.components.length-1 && this.doForward) {
            result.doForward = true;
            result.remainingPath = "/" + pathComponents.slice(i+1).join("/") + "." + extension;
            i++;
            break;
         }                  
      }    

      // check if there are pattern components left, and if they are mandatory (have no default)
      for (; i<this.components.length; i++) {
         if (typeof this.defaults[getNameFromPatternComponent(i)] == "undefined") return;
      }      

      // test for requirements
      for (var name in this.options.requirements || {}) {
         if (!result.params[name] || !result.params[name].match(this.options.requirements[name])) {
            return;
         }
      }

      // test for conditions
      for (var name in this.conditions) {
         if (this.options.conditions && this.options.conditions[name]) {
            var condition = this.conditions[name].bind(this);
            if (!condition(this.options.conditions[name], path, req, result.pathParams)) return;
         }
      }

      // return resulting values from path, defined in the route pattern
      result.extension = extension;
      result.format = Formats.getFormat(result.extension);
      result.path = req.path;
      result.request = req;
      result.action = result.params["action"] || "index";
      result.controllerName = result.params["controller"] || this.controllerName;
      result.route = this;
      for (var name in result.params) {
         if (result.params[name] == null || typeof result.params[name] == "undefined") {
            delete result.params[name];
         }
      }
      req.remainingPath = result.remainingPath;
      result.toString = function() {
         return uneval(this.params);
      }

      /**
       * Result object from the method Route.match()
       * @see Route.match
       * @param {Object} params Object filled with values for each variable for this route pattern. For example an incoming request with the path "/say/hello" matching against a route with the pattern "/$controller/$action/$id" will result in a params object -> {controller:"say", action: "hello", id: null}
       * @param {string) method HTTP-Method in uppercase letters. May also be ANY.
       */
      return result;
   };

   this.getPath = function(options, req) {
      logger.debug("this.getPath("+uneval(options)+","+uneval(req)+") for " + this.toString())
      var result = "";
      var req = Object.extend({
         method : "GET",
         path : "/",
         data : {}
      }, req || {});
      var path = (options.path || req.path);
      var pathComponents = path.split(COMPONENT_SEPARATOR);
            
      var controller = options.controller || (req && req.data && req.data.controller) || "root";
      var options = Object.clone(options);
      var useRequestData = false;
      var trailingSlash = options.trailingSlash;
      delete options.trailingSlash;

      for (var name in options) {
         if (this.components.include(VARIABLE_IDENTIFIER + name)) {
            if ( 
               (this[name] || this.options[name]) && 
               (options[name] != (this[name] || this.options[name])) 
            ) return;               
         }
      }
      
      for (var i=this.components.length-1; i>=0; i--) {
         if (this.components[i].startsWith(VARIABLE_IDENTIFIER)) {
            var name = getNameFromPatternComponent(i);
            var value = options[name];
            
            if (value && value[name]) value = value[name];
            if (typeof value === "undefined") value = this.defaults[name];
            if (value == null && !useRequestData) {
               continue;
            } else {
               useRequestData = true;
            }
            if (value == null) value = req.data[name];
            if (value == null) {
               result = ""; // discard path so far
               continue;
            }
            if (this.options.requirements && options[name] && !options[name].match(this.options.requirements[name])) return;
            result = "/" + value + result;
            useRequestData = true
         } else if (pathComponents[i] != null && pathComponents[i] == this.components[i]) {
            result = "/" + this.components[i] + result;            
         } else {
            return;
         }
      }

      if (trailingSlash === true && result != "/") result += "/";
      if (result.length > 0) result = result.substr(1);
      if ((options.format||options.extension)!=null && ((options.format||options.extension)!=DEFAULT_FORMAT)) {
         result += "." + (options.format||options.extension);
      }
      return result;
   };
  
   /** @ignore */
   this.toString = function() {
      var r = "";
      r += (this.controller || "root").toString() + ": ";
      r += this.method;
      r += "\t"  + this.pattern; // + ((this.forwardTo) ? FORWARD + this.forwardTo.toString() : '');
      r += "\t"  + Object.toJSON(this.originalOptions);
      return r;
   };
   this.dontEnum("toString");

};


/**
 * A definition to achieve restful routes, to be easily used within your routes definitions.
 * <pre>
 * method   path        action   get_url
 * ------------------------------------------------------
 * GET      /           index    
 * POST     /           create   
 * GET      /new        new      
 * GET      /1          show     
 * PUT      /1          update   
 * GET      /1/edit     edit     
 * GET      /1/delete   destroy  
 * DELETE   /1          destroy  
 * </pre>
 * @example
 * var Routes = new RouteSet("mycontroller").add( aida.routing.RESTFUL_ROUTES );
*/

RESTFUL_ROUTES = [
      
   // object   
   // GET /$id/update
   { 
      pattern : "GET /$id/edit", 
      action : "edit"
   },      
   
   // GET /$id/delete
   { 
      pattern : "GET /$id/delete",   
      action : "delete"
   },   

   // DELETE /$id
   { 
      pattern : "DELETE /$id", 
      action : "destroy"
   },
   
   // PUT /$id
   { 
      pattern : "PUT /$id", 
      action : "update"
   },   

   // GET /$id
   { 
      pattern : "GET /$id", 
      action : "show",
      requirements : {
         id : /^\d+$/
      }
   },   
      
   // GET /create
   { 
      pattern : "GET /new", 
      action : "new"
   },
   
   // POST /
   { 
      pattern : "POST /", 
      action : "create"
   },   
   
   // GET /
   { 
      pattern : "GET /", 
      action : "index"
   },
   
   // ANY /action  => all other actions
   {
      pattern : "/$action/$id"
   }   
   
];
