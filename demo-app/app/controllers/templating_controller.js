importFromModule("aida.controller", "*");

function TemplatingController() {
   
   this.foo_action = function() {
      
   }
   
   actions2 = {
      index : function () {
         res.write("demo");
      },
      
      empty : function () {
         res.write("empty")
      },
      
      empty_action : function () {},
      
      template_missing_action : function () {},
      
      
   }
      
}
