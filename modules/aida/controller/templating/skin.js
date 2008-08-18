
importModule('helma.skin');

function render(templatePath, context) {
   logger.info("templatePath:"+templatePath+", context:"+context);
   helma.skin.render(templatePath, context);
}
