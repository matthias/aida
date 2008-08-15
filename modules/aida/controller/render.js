
/**
 * Writes content to the response.
 * 
 * <p>Depending on the options you pass to the function it will do the following
 *
 * <dl> 
 * <dt>render()</dt><dd>
 *  With no parameter, the render method renders the default template 
 *  for the current controller and action. The following code will render the 
 *  template <span class=path>app/views/blog/index.skin</span>
 *  <pre class=javascript>
 * importModule(“aida.controller”, “Controller”);
 * this.__proto__ = Controller;
 * 
 * function index() {
 * 	render();
 * }
 *  </pre>
 *
 *  <p>render() may just be called once per request. If you don't call render() in your
 *  action method, Controller, or to be more specific - handleRequest, will
 *  perform it without any parameters.
 *  <p>If you don't specify a handler method for the action, Action Controller will try
 *  to find the corresponding template (skin) and call it. If it can't find a method nor 
 *  a template for the matching route (controller/action) it will call the action "notfound"
 *  for the controller.
 * </dd> 
 * 
 * <dt>render({text:<string>})</dt><dd>
 *  <p>Sends the given string to the response. 
 *  No template interpretation or HTML escaping is performed.
 *  <pre class=javascript>
 * function index_action() {
 *	    render({text: "Hello there!"});
 * }
 *  </pre>
 * </dd>
 *
 * <dt>render({template:<string>, type:<skin|extension>, context:<object>})</dt><dd>
 *  <p>Interprets string as the source to a template of the given type, rendering the 
 *  results back to the client. If the :locals hash is given, the contents are used 
 *  to set the values of local variables in the template. 
 *  <p>The following code adds method_missing to a controller if the application is 
 *  running in development mode. If the controller is called with an invalid action, 
 *  this renders an inline template to display the action’s name and a formatted version 
 *  of the request parameters.
 *  <code class=javascript>
 * function welcome_action() {
 *	  render({
 *     template: 
 *       '&lt;h2&gt;Hello &lt;% name %>!&lt;/h2&gt; \
 *        &lt;p&gt;Welcome, and have a nice day!&lt;/p&gt;',
 *     context : { name : "Matthias" }
 *   });
 * }
 *  </code> 
 *  <p>Note: You have to end each line of the multi line string with a backslash,
 *  otherwise you will get an “unterminated string literal” error from Rhino.
 * </dd>
 *
 * <dt>render({action:<string>})</dt><dd>
 *  <p>Renders the template for a given action in this controller.
 *  <pre class=javascript>
 * function display_cart_action() {
 *	  if (cart.isEmpty()) { 
 *     render({action:"index"});
 *   } else {
 *     // ...
 *   }
 * }
 *  </pre>
 *  Note that calling render({action:...}) does not call the action method; 
 *  it simply displays the template. If the template needs instance variables, 
 *  these must be set up by the method that calls the render.
 * </dd>
 * </dl>
 * 
 * @param {object} options Options for defining the output. See description.
*/

importFromModule("formats", "Formats");
importFromModule("config.environments.development.development", "config");
importModule("templating");
 
importModule("helma.logging", "logging");
 
(function () {

   var logger = logging.getLogger(__name__);
   this.layoutChain = [];
   
   this.render = function(options) {
      if (!res.contentType) res.contentType = Formats.getMimeType(req.route.format);
      if (!options) options = {};
      if (res.calledRender) throw new DoubleRenderError();
      res.calledRender = true;
      var action = options.action || req.route.action;
      var context = prepareContext.call(controller, options.context);
      delete options.context;
      if (options.layout !== undefined) controller.setLayout(options.layout);
      delete options.layout;

      if (typeof options === "string" && options !== "") {
         logger.debug("called function render() with a string: " + options.clip(20));
         res.writeln(options);
      } else if (options && options.inline) {
         logger.debug("called function render() with an inline template (" + options.type + "): " + options.inline.clip(20));
         var options = Object.extend({
            type : "skin",
            locals : {}
         }, options);
         if (options.type === "skin") {
            /*
            var skin = [];
            helma.skin.parseSkin(options.inline, function(part) {
               skin.push(part);
            });
            FIXME: can't create inline skin on the fly
            */
            var skin = new helma.skin.Skin(options.inline);
            skin.render(options.locals);
         }
      } else {
         logger.debug("called function render() without specifying a template or content.");
         
         templating.render({
            controller : this.getShortName(),
            action : action,
            format : req.route.format
         }, context);            
         
      }
   }   

   // private functions

   function prepareContext(context) {
      var result = {};
      for (var name in this.helpers) {
         if (this.helpers[name]._namespace) {
            result[this.helpers[name]._namespace] = this.helpers[name];
         } else {
            result = Object.extend(result, this.helpers[name]);         
         }
      }
      result = Object.extend(
         result,
         {
            request : req.data,
            controller : controller,
            "this" : controller,
            flash : req.flash,
            headers : req.headers, 
            logger : logger, 
            params : req.data, 
            request : req, 
            response : res,
            session : session 
         },
         this.context || {}
      );
      result = Object.extend(result, context || {});
      return result;
   }
      
   // ERROR Objects

   function DoubleRenderError() {
      this.toString = function() {
         return "render() may just be called once."
      }
   }   

}).call(this); 
