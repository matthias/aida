/**
 * With layouts, you can define centralized layouts flip it around and have the common structure know where to insert changing content. This means
 * that the header and footer are only mentioned in one place, like this:
 * 
 *   // The header part of this layout
 *   <% yield %>
 *   // The footer part of this layout
 * 
 * And then you have content pages that look like this:
 * 
 *    hello world
 * 
 * At rendering time, the content page is computed and then inserted in the layout, like this:
 * 
 *   // The header part of this layout
 *   hello world
 *   // The footer part of this layout
 * 
 * NOTE: The old notation for rendering the view from a layout was to expose the magic <tt>@content_for_layout</tt> instance
 * variable. The preferred notation now is to use <tt>yield</tt>, as documented above.
 * 
 * == Accessing shared variables
 * 
 * Layouts have access to variables specified in the content pages and vice versa. This allows you to have layouts with
 * references that won't materialize before rendering time:
 * 
 *   <h1><%= @page_title %></h1>
 *   <%= yield %>
 * 
 * ...and content pages that fulfill these references _at_ rendering time:
 * 
 *    <% @page_title = "Welcome" %>
 *    Off-world colonies offers you a chance to start a new life
 * 
 * The result after rendering is:
 * 
 *   <h1>Welcome</h1>
 *   Off-world colonies offers you a chance to start a new life
 * 
 * == Automatic layout assignment
 * 
 * If there is a template in <tt>app/views/layouts/</tt> with the same name as the current controller then it will be automatically
 * set as that controller's layout unless explicitly told otherwise. Say you have a WeblogController, for example. If a template named
 * <tt>app/views/layouts/weblog.erb</tt> or <tt>app/views/layouts/weblog.builder</tt> exists then it will be automatically set as
 * the layout for your WeblogController. You can create a layout with the name <tt>application.erb</tt> or <tt>application.builder</tt>
 * and this will be set as the default controller if there is no layout with the same name as the current controller and there is
 * no layout explicitly assigned with the +layout+ method. Nested controllers use the same folder structure for automatic layout.
 * assignment. So an Admin::WeblogController will look for a template named <tt>app/views/layouts/admin/weblog.erb</tt>.
 * Setting a layout explicitly will always override the automatic behaviour for the controller where the layout is set.
 * Explicitly setting the layout in a parent class, though, will not override the child class's layout assignment if the child
 * class has a layout with the same name.
 * 
 * == Inheritance for layouts
 * 
 * Layouts are shared downwards in the inheritance hierarchy, but not upwards. Examples:
 * 
 *   class BankController < ActionController::Base
 *     layout "bank_standard"
 * 
 *   class InformationController < BankController
 * 
 *   class VaultController < BankController
 *     layout :access_level_layout
 * 
 *   class EmployeeController < BankController
 *     layout nil
 * 
 * The InformationController uses "bank_standard" inherited from the BankController, the VaultController overwrites
 * and picks the layout dynamically, and the EmployeeController doesn't want to use a layout at all.
 * 
 * == Types of layouts
 * 
 * Layouts are basically just regular templates, but the name of this template needs not be specified statically. Sometimes
 * you want to alternate layouts depending on runtime information, such as whether someone is logged in or not. This can
 * be done either by specifying a method reference as a symbol or using an inline method (as a proc).
 * 
 * The method reference is the preferred approach to variable layouts and is used like this:
 * 
 *   class WeblogController < ActionController::Base
 *     layout :writers_and_readers
 * 
 *     def index
 *       # fetching posts
 *     end
 * 
 *     private
 *       def writers_and_readers
 *         logged_in? ? "writer_layout" : "reader_layout"
 *       end
 * 
 * Now when a new request for the index action is processed, the layout will vary depending on whether the person accessing
 * is logged in or not.
 * 
 * If you want to use an inline method, such as a proc, do something like this:
 * 
 *   class WeblogController < ActionController::Base
 *     layout proc{ |controller| controller.logged_in? ? "writer_layout" : "reader_layout" }
 * 
 * Of course, the most common way of specifying a layout is still just as a plain template name:
 * 
 *   class WeblogController < ActionController::Base
 *     layout "weblog_standard"
 * 
 * If no directory is specified for the template name, the template will by default be looked for in <tt>app/views/layouts/</tt>.
 * Otherwise, it will be looked up relative to the template root.
 * 
 * == Conditional layouts
 * 
 * If you have a layout that by default is applied to all the actions of a controller, you still have the option of rendering
 * a given action or set of actions without a layout, or restricting a layout to only a single action or a set of actions. The
 * <tt>:only</tt> and <tt>:except</tt> options can be passed to the layout call. For example:
 * 
 *   class WeblogController < ActionController::Base
 *     layout "weblog_standard", :except => :rss
 * 
 *     # ...
 * 
 *   end
 * 
 * This will assign "weblog_standard" as the WeblogController's layout  except for the +rss+ action, which will not wrap a layout
 * around the rendered view.
 * 
 * Both the <tt>:only</tt> and <tt>:except</tt> condition can accept an arbitrary number of method references, so
 * #<tt>:except => [ :rss, :text_only ]</tt> is valid, as is <tt>:except => :rss</tt>.
 * 
 * == Using a different layout in the action render call
 * 
 * If most of your actions use the same layout, it makes perfect sense to define a controller-wide layout as described above.
 * Sometimes you'll have exceptions where one action wants to use a different layout than the rest of the controller.
 * You can do this by passing a <tt>:layout</tt> option to the <tt>render</tt> call. For example:
 * 
 *   class WeblogController < ActionController::Base
 *     layout "weblog_standard"
 * 
 *     def help
 *       render :action => "help", :layout => "help"
 *     end
 *   end
 * 
 * This will render the help action with the "help" layout instead of the controller-wide "weblog_standard" layout.
 */

importModule("helma.logging", "logging");
importFromModule("render", "*");

(function () {
   
   var logger = logging.getLogger(__name__);
   this.layoutChain = [];

   /**
    * Define a layout for this controller.
    *
    * @param {String} layout     Name of template file, without extension.
    * @param {Function} layout   Functions which returns a template file name.
    * @param {Object} param      Configuration object.
    * @param {String} param.except   Name, or array of action names, where the layout should not apply.
    * @param {String} param.only     Name, or array of action names, where the layout should apply exclusivly.
    */
   this.layout = function(layout, param) {
      Array.prototype.push.apply(
         this.layoutChain, 
         [new Layout(this, layout, param)]
      );   
   }
   
   
   /**
    * Set a layout for this controller, and override all prvious layout settings.
    *
    * @param {String} layout     Name of template file, without extension.
    * @param {Function} layout   Functions which returns a template file name.
    */
   this.setLayout = function(layout) {
      this.layoutChain = [new Layout(this, layout)];
   }   

   this.renderLayout = function() {
      var name = getLayoutName.apply(this);
      if (name === null) {
         res.write(this.content);
         return;
      }
      helma.skin.render("app/views/layouts/" + name + ".skin", prepareContext());
   }


   // private functions
   
   /**
    * Constructor for filter object.
    * @ignore
    */
   function Layout(controller, layout, param) {
      this.controller = controller;
      this.name = (Object.isFunction(layout)) ? layout.apply(controller) : layout;
      this.param = param || {};
      if (this.param.only && !Object.isArray(this.param.only)) this.param.only = [this.param.only];
      if (this.param.except && !Object.isArray(this.param.except)) this.param.except = [this.param.except];
   }
   
   /** @ignore */
   function getLayoutName() {
      for (var i=0; i<this.layoutChain.length; i++) {
         var layout = this.layoutChain[i];
         if (layout.param.only && !layout.param.only.include(req.route.action)) continue;
         if (layout.param.except && layout.param.except.include(req.route.action)) continue;
         return layout.name;
      }   
      return null; // this.getShortName();
   }

}).call(this);


