importFromModule("aida.controller", "*");

function TemplatingController() {
   
   this.index_action = function() {
      this.context.title = "Skin Example";
      res.writeln("How are you?");
   }
   
   foo_action = function() {
      res.write("some buffer");
      context.foo2 = "foooo 2";
      render();
   }
   
   this.customtemplate_action = function() {
      render({ controller : "say", action : "hello" });
   }
   
   this.write_action = function() {
      res.write("using res.write");
   }
   
   actions.foo3 = function() {
      render({ action : "foo" });
   }
      
}
