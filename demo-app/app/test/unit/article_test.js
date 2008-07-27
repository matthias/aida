importFromModule("testing.unittest", "*");
importModule('app.models.article', 'model');
importModule('app.orm.hibernate', 'db');

var testCase = new TestCase("unit.article");

testCase.testAssertTrue = function() {
   assertTrue(true);
   return;
};

testCase.testCreate = function() {
   var article = model.doCreate({
      title : "First Article",
      text : "with some text in it."
   });
   assertNotNull(article);
   assertNotNull(article.id);
   assertEqual(article.title, "First Article");
   return;
};
