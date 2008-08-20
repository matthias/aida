importFromModule("aida.controller", "*");

function RootController() {
      
   index_action = function() {
      this.context.hello = "Hello World!";
      // calls views/root/index.html
   }
   
}
