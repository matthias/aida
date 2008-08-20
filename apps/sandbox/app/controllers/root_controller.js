importFromModule("aida.controller", "*");

function RootController() {
      
   this.index_action = function() {
      this.context.hello = "Hello World!";
      // calls views/root/index.html
   }

   this.ejs_action = function() {
      this.context.hello = "Hello World!";   
   }
   
}
