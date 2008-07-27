
importFromModule("aida.testing", "*")

function ArticleTest() {
   
   fixtures("articles");
   
   this.testTruth = function() {
      assertTrue(true);
      return;
   }

   this.testInvalidWithEmptyAttributes = function() {
      var product = new Product();
      assertFalse(product.errors.isValid()); 
      assertTrue(product.errors.isInvalid("title")); 
      assertTrue(product.errors.isInvalid("description")); 
      assertTrue(product.errors.isInvalid("price")); 
      assertTrue(product.errors.isInvalid("image_url")); 
   }

}
