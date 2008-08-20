
/**
 * list macro for articles
 */
function list(macrotag, skin, context) {
   for (var i in context.articles) {
      var article = context.articles[i];
      context = Object.extend(context, article)
      context = Object.extend(context, {
         href : '/blog/' + article.id,
      })
      skin.renderSubskin('listItem', context);
   }
}

