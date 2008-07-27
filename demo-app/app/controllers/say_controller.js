importFromModule("aida.controller", "*");

var foo1 = "Foo 1";

function foo2_action() {
   // -> /say/foo2
   // can't access res!!
   // throws an error
   res.write(foo1)
}

function SayController() {
   
   function OutputCompressionFilter() {
      this.filter = function() {
         logger.info("###########");
      }
   }
   
   layout("foo", { only : "index2" });
   layout(function() { return "foo2" }, { except : "index" });
   layout(determineLayout);
   
   function determineLayout() {
      return "main";
   }
   
   beforeFilter(authenticate, auth2, { except : ["index2", "foo", "indexx"] });
   beforeFilter(new OutputCompressionFilter())
   afterFilter(afterFilter1);
   afterFilter(afterFilter2);
   
   this.bla = "bla";
   
   function hidden() {
      res.writeln("oops");
   }
   
   this.skin_action = function() {
      // render("hello");
   }
   
   this.index_action = function() {
      res.write("xx")
      render({layout:null});
      /*
      res.writeln("---" + getShortName())
      res.writeln("---" + this.foo1)
      res.writeln("---" + this.foo2)
      */
   }
   
   this.actions = {
      goodBye : function() {
         render({
            inline : '<div> \
               <h2>Good Bye <% name %>!</h2> \
               <p>and have a nice day.</p> \
            </div>',
            locals : {
               name : "Matthias"
            }
         });
      },
      index2 : function() {
         render(req, res, session);
      }
   }

   this.actions.html = {
      hello3 : function() {

      },
      hello2 : function() {
         res.writeln("xx")
      }
   }

   this.hello_action = function() {
      hidden();
      res.writeln("Hello World!" + __name__ + ":" + bar + ":" + getShortName());
   }   

   // filters
   
   function authenticate() {
      logger.info("---------xxxxx--------" + this.bla)
      return true; // (req.data.action === "index");
   }

   function auth2() {
      logger.info("---------x22xxxx--------")
      return true;
   }

   
   function afterFilter1() {
      // logger.info("do some logging after request:" + req.route)
   }
   
   function afterFilter2(content) {
      return this.content +=  ("!!!!!!!!");
   }   
   
   
}

