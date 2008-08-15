importFromModule("aida.controller", "*");

function TemplatingController() {
   
   this.index_action = function() {
      this.context.title = "Skin Example";
      res.writeln("How are you?");
   }
   
   this.foo_action = function() {
      
   }
   
   this.write_action = function() {
      res.write("using res.write");
   }
      
}
