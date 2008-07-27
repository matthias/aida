importFromModule("aida.controller.routing", "RouteSet");

var routeSet = new RouteSet("say").add([
   {
      pattern : "say/$action",
   }, 
   {
      pattern : "foo",
   }      
]);
