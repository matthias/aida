importModule("javascript.prototype");
importModule("helma.http", "http");
importModule('helma.logging', 'logging');
logging.enableResponseLog();
var logger = logging.getLogger(__name__);

/**
 * @fileinfo
 * Twitter API for Rhino / Helma-NG
 *
 * @requires 
 * @version 0.2
 * @author Matthias Platzer AT aida.at
 * @see http://groups.google.com/group/twitter-development-talk/web/api-documentation
 */

var info = {
   name : "Twitter API for Rhino / Helma-NG",
   version : "0.2",
   status : "development"   
}

/** @ignore */
function TwitterApiException(result, options) {
   var msg = "TwitterApiException: " + result.code + " " + result.message;
   if (result.error) { msg += " (" + result.error + ")" };
   if (result.url || result.request) { msg += " : " + result.url || result.request };
   if (options) msg += " called with options " + uneval(options);
   logger.error(msg);
   
   this.code = result.code;
   this.message = result.message;
   this.url = result.url;
   this.content = result.content;
   this.msg = msg;
   this.toString = function() {
      return msg;
   };
}


/** @ignore */
function call(url, options) {
   if (!url.startsWith('http://twitter.com')) {
      throw new TwitterApiException({
         code : 400,
         message : 'Bad Request',
         url : url,
         content : 'API endpoint must start with http://twitter.com'
      }, options);
   }
   var param = Object.clone(options || {});
   var credentials = {
      username : param.username,
      password : param.password
   };
   var client = new http.Client();
   var method = (param.method || "GET").toUpperCase();
   client.setMethod(method);
   delete param.method;
   
   client.setCredentials(param.username, param.password);
   delete param.username;
   delete param.password;

   var postBody = param.postBody;
   delete param.postBody;
   
   if (method == 'GET') {
      var query = Object.toQueryString(param);
      if (query) url += (url.include('?') ? '&' : '?') + query;
   } else if (method == 'POST' || method == 'PUT') {
      logger.info("setContent to " + uneval(postBody || param));
      client.setContent(postBody || param);
   }
      
   try {
      var result = client.getUrl(url);
      if (options.since && result.code == 304) {
         return [];
      }
   } catch(e) {
      throw new TwitterApiException({}, options);
   }         
   if (result.code != 200) {
      throw new TwitterApiException(result, options);
   }      
   return result.content.evalJSON();
}


/**
* Status wrapper object.
* Status (and timeline) API calls return object(s) including information about the status and the user.
*
* @return {object} Returns a result object containing the following properties:
*   <ul>
*   <li><tt>id</tt> {Number} id of the status posting
*   <li><tt>text</tt> {String} status posting
*   <li><tt>source</tt> {String} txt|web|.. may also contain html markup (a link)
*   <li><tt>created_at</tt> <Date> 
*   <li><tt>user</tt> {User}
*   </ul>
*
* @see User
*/
function Status(status) {
   if (status.created_at) status.created_at = new Date(status.created_at);
   if (status.user && !status.user instanceof User) status.user = new User(status.user);
   Object.extend(this, status);
}


/**
* Status wrapper object.
* User (and friends) API calls return object(s) with information the user.
* Status objects also contain a user object.
*
* @return {object}
* <ul>
*   <li><tt>id</tt> {Number}
*   <li><tt>profile_image_url</tt> {Number}
*   <li><tt>screen_name</tt> {String}
*   <li><tt>url</tt> {String}
*   <li><tt>name</tt> {String}
*   <li><tt>description</tt> {String}
*   <li><tt>followers_count</tt> {Number}
*   <li><tt>location</tt> {String}
*   <li><tt>protected</tt> {Boolean}
* </ul>
*/
function User(user) {
   Object.extend(this, user);
} 


/**
* Favorite wrapper object.
* Favorite API calls return object(s) with information about the favorite.
*
* @return {object}
* <ul>
*   <li><tt>created_at</tt> {Date}
*   <li><tt>in_reply_to_status_id</tt> {Number}
*   <li><tt>in_reply_to_user_id</tt> {Number}
*   <li><tt>favorited</tt> {Boolean}
*   <li><tt>source</tt> {String}
*   <li><tt>id</tt> {Number}
*   <li><tt>user</tt> {User}
*   <li><tt>truncated</tt> {Boolean}
*   <li><tt>text</tt> {String}
* </ul>
*/
function Favorite(favorite) {
   if (favorite.created_at) favorite.created_at = new Date(favorite.created_at);
   if (favorite.user && !favorite.user instanceof User) favorite.user = new User(favorite.user);   
   Object.extend(this, favorite);
}     


/*** Status Methods ***/

/**
* Returns the 20 most recent statuses from non-protected users who have set a custom user icon.  
* Does not require authentication.
*
* @param {object} [options]
* @param {String} [since_id]  Returns only public statuses with an ID greater than (that is, more recent than) the specified ID. 
* @return {[Status]} Returns an array of twitter Status objects
* @throws TwitterApiException
*/
function publicTimeline(options) {
   return call(
      'http://twitter.com/statuses/public_timeline.json',
      options || {}
   );
}


/**
* Returns the 20 most recent statuses posted in the last 24 hours from the authenticating user and that user's friends.  
* It's also possible to request another user's friends_timeline via the id parameter below.
*
* @param {object} options 
* @param {Number} [options.id]       Specifies the ID of the user for whom to return the friends_timeline.
* @param {String} [options.id]       Specifies the screen name of the user for whom to return the friends_timeline.
* @param {Date} [options.since]      Narrows the returned results to just those statuses created after the specified date. 
*   Notes:  Only works in conjunction with username / password. 
*           Using the page parameter will result in ignoring the since parameter.
* @param {Number} [options.page]     Gets the 20 next most recent statuses from the authenticating user and that user's friends.
* @param {String} [options.username] Screenname or email of user for authentication.
* @param {String} [options.password] plain text password of user for authentication      
*
* @return {[Status]} Returns an array of twitter Status objects
* @throws TwitterApiException
*/
function friendsTimeline(options) {
   return call(
      'http://twitter.com/statuses/friends_timeline' + ((options.id) ? '/' + encodeURIComponent(options.id) : '')  + '.json',
      options.rejectKeys(/^id$/)
   ).map(function(status) {
     return new Status(status);
   });
}


/**
* Returns the 20 most recent statuses posted in the last 24 hours from the authenticating user.  
* It's also possible to request another user's timeline via the id parameter below.
*
* @param {object} options
* @param {Number} [options.id]       Specifies the ID or screen name of the user for whom to return the timeline.
*                             Alternatively you may specify username + password to authenticate a user.
* @param {Date} [options.since]      Narrows the returned results to just those statuses created after the specified date.
* @param {Number} [options.count]    Specifies the number of statuses to retrieve.  May not be greater than 20 for performance purposes.
* @param {String} [options.username] Screenname or email of user for authentication.
* @param {String} [options.password] plain text password of user for authentication      
*
* @return {[Status]} Returns an array of twitter Status objects
* @throws TwitterApiException
*/
function userTimeline(options) {
   return call(
      'http://twitter.com/statuses/user_timeline' + ((options.id) ? '/' + encodeURIComponent(options.id) : '')  + '.json',
      options.rejectKeys(/^id$/)
   ).map(function(status) {
     return new Status(status);
   });
}


/**
* Returns a single status, specified by the id parameter below.  
* The status's author will be returned inline.
*
* @param {object} options 
* @param {Number} id            The numerical ID of the status you're trying to retrieve.
* @param {String} [options.username]    Screenname or email of user for authentication.
* @param {String} [options.password]    Plain text password of user for authentication.
*
* @return {Status}
* @throws TwitterApiException
*/
function showStatus(options) {
   return new Status( call(
      'http://twitter.com/statuses/show/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/**
* Updates the authenticating user's status.  
* Requires user credentials and the status parameter specified below.
*
* @param {object} options 
* @param {String} options.username  Screenname or email of user for authentication.
* @param {String} options.password  Plain text password of user for authentication.
* @param {String} options.status  
*                             The text of your status update.  
*                             Be sure to URL encode as necessary.  
*                             Must not be more than 160 characters and 
*                             should not be more than 140 characters to ensure optimal display.
*
* @return {Status} Returns the updated status object.
* @throws TwitterApiException
*/
function updateStatus(options) {
   return new Status( call(
      'http://twitter.com/statuses/show/' + encodeURIComponent(options.id)  + '.json',
      Object.extend(options.rejectKeys(/^id|status$/), {
         method : "POST",
         postBody : {
            status : options.status
         }         
      })
   ));
}


/**
* Returns the 20 most recent replies (status updates prefixed with @username 
* posted by users who are friends with the user being replied to) to the authenticating user.  
* Replies are only available to the authenticating user; 
* you can not request a list of replies to another user whether public or protected.
*
* @param {object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
* @param {Number} [options.page]     Retrieves the 20 next most recent replies.
*
* @return {[status]}
* @throws TwitterApiException
*/
function replies(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/statuses/replies.json',
      options
   ).map(function(status) {
     return new Status(status);
   });
}
      

/**
* Destroys the status specified by the required ID parameter.
* The authenticating user must be the author of the specified status.
* Returns the data of the destroyed object.
*   
* @param {object} options 
* @param {String} options.id The ID of the status to destroy.
* @param {String} options.username  Screenname or email of user for authentication.
* @param {String} options.password  Plain text password of user for authentication.
*
* @return {status}
* @throws TwitterApiException
*/
function destroyStatus(options) {
   return new Status( call(
      'http://twitter.com/statuses/destroy/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/*** User Methods ***/            

/**
* Returns up to 100 of the authenticating user's friends who have 
* most recently updated, each with current status inline.  
* It's also possible to request another user's recent friends list via the id parameter below.
*   
* @param {object} options 
* @param {Number} [options.id]    The ID or screen name of the user for whom to request a list of friends.
*                          If no id is present the friends list of the authenticating user will be returned
* @param {String} [options.username]    Screenname or email of user for authentication.
* @param {String} [options.password]    Plain text password of user for authentication.
*
* @return {User}
* @throws TwitterApiException
*/
function friends(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/statuses/friends' + ((options.id) ? '/' + encodeURIComponent(options.id) : '')  + '.json',
      options.rejectKeys(/^id$/)
   ).map(function(user) {
     return new User(user);
   });   
}


/**
* Returns the authenticating user's followers, each with current status inline.
*   
* @param {object} options 
* @param {String} options.username  Screenname or email of user for authentication.
* @param {String} options.password  Plain text password of user for authentication.
*
* @return {User}
* @throws TwitterApiException
*/
function followers(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/statuses/followers.json',
      options
   ).map(function(user) {
     return new User(user);
   });
}


/**
* Returns a list of the users currently featured on the site with their current statuses inline.
*
* @return {User}
* @throws TwitterApiException
*/
function featured(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/statuses/featured.json',
      options
   ).map(function(user) {
     return new User(user);
   });
}   


/**
* Returns extended information of a given user, specified by ID or screen name as per the required id parameter below.  
* This information includes design settings, so third party developers 
* can theme their widgets according to a given user's preferences.
* <p>Notes: If you are trying to fetch data for a user who is only giving updates to friends, 
* the returned text will be "You are not authorized to see this user."
*   
* @param {object} options 
* @param {Number} [options.id]    The ID or screen name of a user.
*
* @return {UserSettings}
* @throws TwitterApiException
*/
function showUser(options) {
   return new User( call(
      'http://twitter.com/users/show/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/*** Direct Message Methods ***/            

/**
* Returns a list of the 20 most recent direct messages sent to the authenticating user.  
* The result includes detailed information about the sending and recipient users.
*
* @param {object} options 
* @param {Number} [since_id] Returns only direct messages with an ID greater than (that is, more recent than) the specified ID.
* @param {Date} [options.since]      Narrows the resulting list of direct messages to just those sent after the specified
* @param {Number} [options.page]     Retrieves the 20 next most recent direct messages.
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
*
* @return {[DirectMessage]}
* @throws TwitterApiException
*/
function directMessages(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/direct_messages.json',
      options
   ).map(function(data) {
     return new DirectMessage(data);
   });
}


/**
* Returns a list of the 20 most recent direct messages sent by the authenticating user.  
* The result includes detailed information about the sending and recipient users.
*
* @param {object} options 
* @param {Number} [since_id] Returns only direct messages with an ID greater than (that is, more recent than) the specified ID.
* @param {Date} [options.since]      Narrows the resulting list of direct messages to just those sent after the specified
* @param {Number} [options.page]     Retrieves the 20 next most recent direct messages.
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
*
* @return {[DirectMessage]}
* @throws TwitterApiException
*/
function sentDirectMessages(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/direct_messages/sent.json',
      options
   ).map(function(data) {
     return new DirectMessage(data);
   });
}


/**
* Sends a new direct message to the specified user from the authenticating user.  
* Requires both the user and text parameters below.
* Returns the sent message when successful.
*
* @param {object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
* @param {String} user       The ID or screen name of the recipient user.
* @param {String} text       The text of your direct message.  Keep it under 140 characters.
*
* @return {DirectMessage}
* @throws TwitterApiException
*/
function newDirectMessage(options) {
   return new DirectMessage(call(
      'http://twitter.com/direct_messages/new.json',
      Object.extend(options.rejectKeys(/^id|user|text$/), {
         method : "POST",
         postBody : {
            user : options.user,
            text : options.text
         }         
      })
   ));   
}


/**
* Destroys the direct message specified in the required ID parameter.  
* The authenticating user must be the recipient of the specified direct message.
*   
* @param {object} options 
* @param {String} options.id         The ID of the direct message to destroy.
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
*
* @return {DirectMessage}
* @throws TwitterApiException
*/
function destroyDirectMessage(options) {
   return new DirectMessage( call(
      'http://twitter.com/direct_messages/destroy/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/*** Friendship Methods ***/            

/**
* Befriends the user specified in the ID parameter as the authenticating user.  
* Returns the befriended user when successful.  
* ?? Returns a string describing the failure condition when unsuccessful.
*
* @param {object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
* @param {String} options.id         The ID or screen name of the user to befriend.
*
* @return {User}
* @throws TwitterApiException
*/
function createFriendship(options) {
   return new Friendship( call(
      'http://twitter.com/friendships/create/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/**
* Discontinues friendship with the user specified in the ID parameter as the authenticating user.  
* Returns the un-friended user when successful.  
* ?? Returns a string describing the failure condition when unsuccessful.
*   
* @param {object} options 
* @param {String} options.id The ID or screen name of the user with whom to discontinue friendship.
* @param {String} options.username  Screenname or email of user for authentication.
* @param {String} options.password  Plain text password of user for authentication.
*
* @return {User}
* @throws TwitterApiException
*/
function destroyFriendship(options) {
   return new Friendship( call(
      'http://twitter.com/friendships/destroy/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}      


/*** Account Methods ***/            

/**
* Returns OK and a response if authentication was successful.  
* Use this method to test if supplied user credentials are valid with minimal overhead.
*   
* @param {object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
*
* @return {String}
* @throws TwitterApiException
*/
function verifyCredentials(options) {
   return call(
      'http://twitter.com/account/verify_credentials.json',
      options
   );
   return true;
} 


/**
* Ends the session of the authenticating user, returning a null cookie.  
* Use this method to sign users out of client-facing applications like widgets.
*   
* @param {Object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
*
* @return {Boolean}
* @throws TwitterApiException
*/
function endSession(options) {
   call(
      'http://twitter.com/account/end_session',
      options
   );
   return true;
}


/*** Favorite Methods ***/            

/**
* Returns the 20 most recent favorite statuses for the authenticating user 
* or user specified by the ID parameter in the requested format.
*
* @param {object} options 
* @param {Number} [options.id]       The ID or screen name of the user for whom to request a list of favorite statuses.
* @param {Number} [options.page]     Retrieves the 20 next most recent favorite statuses.
* @param {String} [options.username] Screenname or email of user for authentication.
* @param {String} [options.password] Plain text password of user for authentication      
*
* @return {[Status]} Array of Status objects
* @throws TwitterApiException
*/
function favorites(options) {
   if (!options) options = {};
   return call(
      'http://twitter.com/statuses/favorites' + ((options.id) ? '/' + encodeURIComponent(options.id) : '')  + '.json',
      options.rejectKeys(/^id$/)
   ).map(function(data) {
     return new Favorit(data);
   });
}


/**
* Favorites the status specified in the ID parameter as the authenticating user.  
* Returns the favorite status when successful.
*
* @param {object} options 
* @param {String} options.username   Screenname or email of user for authentication.
* @param {String} options.password   Plain text password of user for authentication.
* @param {String} options.id         The ID of the status to favorite.
*
* @return {status}
* @throws TwitterApiException
*/
function createFavorit(options) {
   return new Favorit( call(
      'http://twitter.com/favorites/create/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}


/**
* Un-favorites the status specified in the ID parameter as the authenticating user.  
* Returns the un-favorited status when successful.
*   
* @param {object} options 
* @param {String} options.id         The ID of the status to un-favorite.
* @param {String} options.username   Screenname or email of user for authentication
* @param {String} options.password   Plain text password of user for authentication      
*
* @return {status}
* @throws TwitterApiException
*/
function destroyFavorit(options) {
   return new Favorit( call(
      'http://twitter.com/favorites/destroy/' + encodeURIComponent(options.id)  + '.json',
      options.rejectKeys(/^id$/)
   ));
}
