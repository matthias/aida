importModule('helma.skin'); 
importModule("helma.logging", "logging");
 
(function () {
   var logger = logging.getLogger(__name__);

   render = function(templatePath, context) {
      logger.info("templatePath:"+templatePath+", context:"+context);
      helma.skin.render(templatePath, context);
   }
   
}).call(this); 
