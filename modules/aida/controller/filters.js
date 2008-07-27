
importModule("javascript.prototype");

importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/development/log4j.properties').path);
var logger = logging.getLogger(__name__);

/**
 * Filters enable controllers to run shared pre- and post-processing code for its actions. These filters can be used to do
 * authentication, caching, or auditing before the intended action is performed. Or to do localization or output
 * compression after the action has been performed. Filters have access to the request, response, and all the instance
 * variables set by other filters in the chain or by the action (in the case of after filters) by using "this".
 *
 * == Filter inheritance
 * FIXME: not yet
 * Controller inheritance hierarchies share filters downwards, but subclasses can also add or skip filters without
 * affecting the superclass. For example:
 *
 *   class BankController < ActionController::Base
 *     before_filter :audit
 *
 *     private
 *       def audit
 *         # record the action and parameters in an audit log
 *       end
 *   end
 * 
 *   class VaultController < BankController
 *     before_filter :verify_credentials
 * 
 *     private
 *       def verify_credentials
 *         # make sure the user is allowed into the vault
 *       end
 *   end
 * 
 * Now any actions performed on the BankController will have the audit method called before. On the VaultController,
 * first the audit method is called, then the verify_credentials method. If the audit method renders or redirects, then
 * verify_credentials and the intended action are never called.
 * 
 * == Filter types
 * 
 * A filter can take one of three forms: method reference, an object containing a filter method, an anonymous function. 
 * The first is the most common and works by referencing a private method in the controller by use of the function names. 
 * In the bank example above, both BankController and VaultController use this form.
 *
 *    function ProtectedController() {
 *       beforeFilter(authenticate);
 *
 *       // actions, etc...
 *
 *       // private methods
 *       function authenticate() {
 *          if (!session.user) {
 *             res.redirect("/account/login");
 *             return false;
 *          }
 *       }
 *    }
 *
 *
 * Using an object, instantiated from a constructor function makes for more easily reused generic filters, 
 * such as authentication. External filter constructors, are typically implemented by having a privileged +filter+ 
 * method and then calling the filter method on this controller, so you can access the controller within the filter
 * method by refering to "this". Another advanteg is, that you can pass arguments to the constructor, which can be accessed
 * within the filter. Example:
 * 
 *   function AuthenticationFilter(type) {
 *      this.filter = function() {
 *         if (type === "admin" && session.user.name !== "admin") return false; 
 *      }
 *   }
 * 
 *   function NewspaperController() {
 *      beforeFilter(new AuthenticationFilter("admin"));
 *   }
 * 
 * The filter method is called on the controller instance and is hence granted access to all aspects of the controller,
 * by using the "this" keyword, and can manipulate the controller instance as it sees fit.
 * 
 * The inline method (using a proc) can be used to quickly do something small that doesn't require a lot of explanation.
 * Or just as a quick test. It works like this:
 * 
 *    function ExportController() {
 *       beforeFilter(function() {
 *          res.contentType = "text/csv";
 *       })
 *    }
 * 
 * As you can see, the block expects to be passed the controller after it has assigned the request to the internal variables.
 * This means that the block has access to both the request and response objects complete with convenience methods for params,
 * session, template, and assigns. Note: The inline method doesn't strictly have to be a block; any object that responds to call
 * and returns 1 or -1 on arity will do (such as a Proc or an Method object).
 * 
 * Please note that around_filters function a little differently than the normal before and after filters with regard to filter
 * types. Please see the section dedicated to around_filters below.
 * 
 * == Filter chain ordering
 * 
 * Using <tt>before_filter</tt> and <tt>after_filter</tt> appends the specified filters to the existing chain. That's usually
 * just fine, but some times you care more about the order in which the filters are executed. When that's the case, you
 * can use <tt>prepend_before_filter</tt> and <tt>prepend_after_filter</tt>. Filters added by these methods will be put at the
 * beginning of their respective chain and executed before the rest. For example:
 * 
 *   class ShoppingController < ActionController::Base
 *     before_filter :verify_open_shop
 * 
 *   class CheckoutController < ShoppingController
 *     prepend_before_filter :ensure_items_in_cart, :ensure_items_in_stock
 * 
 * The filter chain for the CheckoutController is now <tt>:ensure_items_in_cart, :ensure_items_in_stock,</tt>
 * <tt>:verify_open_shop</tt>. So if either of the ensure filters renders or redirects, we'll never get around to see if the shop
 * is open or not.
 * 
 * You may pass multiple filter arguments of each type as well as a filter block.
 * If a block is given, it is treated as the last argument.
 * 
 * == Around filters
 * 
 * Around filters wrap an action, executing code both before and after.
 * They may be declared as method references, blocks, or objects responding
 * to +filter+ or to both +before+ and +after+.
 * 
 * To use a method as an +around_filter+, pass a symbol naming the Ruby method.
 * Yield (or <tt>block.call</tt>) within the method to run the action.
 * 
 *   around_filter :catch_exceptions
 * 
 *   private
 *     def catch_exceptions
 *       yield
 *     rescue => exception
 *       logger.debug "Caught exception! #{exception}"
 *       raise
 *     end
 * 
 * To use a block as an +around_filter+, pass a block taking as args both
 * the controller and the action block. You can't call yield directly from
 * an +around_filter+ block; explicitly call the action block instead:
 * 
 *   around_filter do |controller, action|
 *     logger.debug "before #{controller.action_name}"
 *     action.call
 *     logger.debug "after #{controller.action_name}"
 *   end
 * 
 * To use a filter object with +around_filter+, pass an object responding
 * to <tt>:filter</tt> or both <tt>:before</tt> and <tt>:after</tt>. With a
 * filter method, yield to the block as above:
 * 
 *   around_filter BenchmarkingFilter
 * 
 *   class BenchmarkingFilter
 *     def self.filter(controller, &block)
 *       Benchmark.measure(&block)
 *     end
 *   end
 * 
 * With +before+ and +after+ methods:
 * 
 *   around_filter Authorizer.new
 * 
 *   class Authorizer
 *     # This will run before the action. Redirecting aborts the action.
 *     def before(controller)
 *       unless user.authorized?
 *         redirect_to(login_url)
 *       end
 *     end
 * 
 *     # This will run after the action if and only if before did not render or redirect.
 *     def after(controller)
 *     end
 *   end
 * 
 * If the filter has +before+ and +after+ methods, the +before+ method will be
 * called before the action. If +before+ renders or redirects, the filter chain is
 * halted and +after+ will not be run. See Filter Chain Halting below for
 * an example.
 * 
 * == Filter chain skipping
 * 
 * Declaring a filter on a base class conveniently applies to its subclasses,
 * but sometimes a subclass should skip some of its superclass' filters:
 * 
 *   class ApplicationController < ActionController::Base
 *     before_filter :authenticate
 *     around_filter :catch_exceptions
 *   end
 * 
 *   class WeblogController < ApplicationController
 *     # Will run the :authenticate and :catch_exceptions filters.
 *   end
 * 
 *   class SignupController < ApplicationController
 *     # Skip :authenticate, run :catch_exceptions.
 *     skip_before_filter :authenticate
 *   end
 * 
 *   class ProjectsController < ApplicationController
 *     # Skip :catch_exceptions, run :authenticate.
 *     skip_filter :catch_exceptions
 *   end
 * 
 *   class ClientsController < ApplicationController
 *     # Skip :catch_exceptions and :authenticate unless action is index.
 *     skip_filter :catch_exceptions, :authenticate, :except => :index
 *   end
 * 
 * == Filter conditions
 * 
 * Filters may be limited to specific actions by declaring the actions to
 * include or exclude. Both options accept single actions
 * (<tt>:only => :index</tt>) or arrays of actions
 * (<tt>:except => [:foo, :bar]</tt>).
 * 
 *   class Journal < ActionController::Base
 *     # Require authentication for edit and delete.
 *     before_filter :authorize, :only => [:edit, :delete]
 * 
 *     # Passing options to a filter with a block.
 *     around_filter(:except => :index) do |controller, action_block|
 *       results = Profiler.run(&action_block)
 *       controller.response.sub! "</body>", "#{results}</body>"
 *     end
 * 
 *     private
 *       def authorize
 *         # Redirect to login unless authenticated.
 *       end
 *   end
 * 
 * == Filter Chain Halting
 * 
 * <tt>before_filter</tt> and <tt>around_filter</tt> may halt the request
 * before a controller action is run. This is useful, for example, to deny
 * access to unauthenticated users or to redirect from HTTP to HTTPS.
 * Simply call render or redirect. After filters will not be executed if the filter 
 * chain is halted.
 * 
 * Around filters halt the request unless the action block is called.
 * Given these filters
 *   after_filter :after
 *   around_filter :around
 *   before_filter :before
 * 
 * The filter chain will look like:
 * 
 *   ...
 *   . \
 *   .  #around (code before yield)
 *   .  .  \
 *   .  .  #before (actual filter code is run)
 *   .  .  .  \
 *   .  .  .  execute controller action
 *   .  .  .  /
 *   .  .  ...
 *   .  .  /
 *   .  #around (code after yield)
 *   . /
 *   #after (actual filter code is run, unless the around filter does not yield)
 * 
 * If +around+ returns before yielding, +after+ will still not be run. The +before+
 * filter and controller action will not be run. If +before+ renders or redirects,
 * the second half of +around+ and will still run but +after+ and the
 * action will not. If +around+ fails to yield, +after+ will not be run. * 
 *
 */
 
/**
 * Constructor for filter object.
 */
function Filter(filter, type, param) {
   this.filter = filter.filter ? filter.filter : filter;
   this.param = param || {};
   if (this.param.only && !Object.isArray(this.param.only)) this.param.only = [this.param.only];
   if (this.param.except && !Object.isArray(this.param.except)) this.param.except = [this.param.except];
   this.type = type;
}

Filter.before = "before";
Filter.after  = "after";


/**
 * Calls all before filters and returns true, if all filters return true,
 * or if there are no before filters.
 * @return {Boolean}
 */
function beforeFiltersPass() {
   for (var i=0; i<this.beforeFilters.length; i++) {
      var f = this.beforeFilters[i];
      if (f.param.only && !f.param.only.include(req.route.action)) continue;
      if (f.param.except && f.param.except.include(req.route.action)) continue;
      if (f.filter.apply(this) === false) return false;
   }   
   return true;
}


/**
 * Calls all after filters and returns the manipulated content.
 * @return {String}
 */
function applyAfterFilters() {
   for (var i=0; i<this.afterFilters.length; i++) {
      var f = this.afterFilters[i];
      if (f.param.only && !f.param.only.include(req.route.action)) continue;
      if (f.param.except && f.param.except.include(req.route.action)) continue;
      f.filter.call(this);
   }   
}


/**
 * @ignore
 */
function createFilterObjects(args, type) {
   var filters = $A(args);
   var param = {};
   var last = filters[filters.length-1];
   if (!last.filter &&  !Object.isFunction(last)) {
      param = filters.pop();
   }
   filters = filters.collect(function(f) {
      return new Filter(f, type, param)
   });
   return filters;
}
 

/**
 * Array of before-filter functions for this controller.
 */
this.beforeFilters = [];


/**
 * Alias for appendBeforeFilter
 * @see appendBeforeFilter
 */
var beforeFilter = appendBeforeFilter;


/**
 * The passed filters will be appended to the array of filters that 
 * run before actions on this controller are performed.
 * @param {Function} filter*  A filter function which returns true, if the filter passed.
 * @see beforeFilter
 */
function appendBeforeFilter() {
   Array.prototype.push.apply(
      this.beforeFilters, 
      createFilterObjects(arguments, Filter.before)
   );
}


/**
 * The passed filters will be prepended to the array of filters that 
 * run before actions on this controller are performed.
 * @param {Function} filter  A filter function which returns true, if the filter passed.
 * @see beforeFilter
 */
function prependBeforeFilter() {
   Array.prototype.unshift.apply(
      this.beforeFilters, 
      createFilterObjects(arguments, Filter.before)
   );
}


/**
 * Array of before-filter functions for this controller.
 */
this.afterFilters = [];


/**
 * Alias for appendAfterFilter
 * @see appendAfterFilter
 */
var afterFilter = appendAfterFilter;


/**
 * The passed filters will be appended to the array of filters that 
 * run after actions on this controller are performed.
 * @param {Function} filter
 *    A filter function which returns the filtered output string. 
 *    output, req, res, session will be passed as arguments to the filter function.
 * @see afterFilter
 */
function appendAfterFilter() {
   Array.prototype.push.apply(
      this.afterFilters, 
      createFilterObjects(arguments, Filter.after)
   );
}


/**
 * The passed filters will be prepended to the array of filters that 
 * run after actions on this controller are performed.
 * @param {Function} filter*  
 *    A filter function which returns the filtered output string. 
 *    output, req, res, session will be passed as arguments to the filter function.
 * @see afterFilter
 */
function prependAfterFilter() {
   Array.prototype.unshift.apply(
      this.afterFilters, 
      createFilterObjects(arguments, Filter.after)
   );
}
