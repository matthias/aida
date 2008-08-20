importFromModule("aida.controller", "*");

importModule("helma.shell", "shell");
importModule("testing.selftest");

function TestingController() {
   
   this.index_action = function () {
      res.contentType = "text/plain";
      var tr = testing.selftest.run()
      tr.write(res);
      render("testing:" + tr);
   }
   
}

TestingController.prototype.foo_action = function() {
  render("Hello, this is TestingController");
}
