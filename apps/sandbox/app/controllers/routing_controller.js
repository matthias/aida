importFromModule("aida.controller", "*");

function RoutingController() {   

   this.actions = {
      
      index : function() {
         res.writeln("routing");
      }
      
   }
   
}
