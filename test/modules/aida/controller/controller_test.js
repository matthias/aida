importFromModule("testing.unittest", "*");
importFromModule("aida.controller", "*");

var testCase = new TestCase("unit.article");

testCase.testAssertTrue = function() {
   assertTrue(true);
   return;
};


testCase.testGetControllerInstance = function() {
   var foo = getControllerInstance("foo");
   assertNotNull(foo);
   return;
};

