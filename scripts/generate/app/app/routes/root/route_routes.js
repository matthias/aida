importFromModule("aida.controller.routing", "RouteSet");

var routeSet = new RouteSet("root").add([
   {
      pattern : "/blog->",
      forwardTo : "article"
   },    
   "/$controller/$action/$id"
]);
