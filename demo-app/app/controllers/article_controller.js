importFromModule("aida.controller", "*");

importHelpers("myglobal");
importHelpers("html", "html");

importModule('app.models.article', 'model');
importModule('app.orm.hibernate', 'db');

function ArticleController() {   

   this.actions = {
   
      index : function() {
         this.context.articles = db.find('from Article a order by a.createTime desc')
      },
   
      "new" : function() {},

      create : function() {
         model.doCreate(req.data);
         res.redirect('/blog');
      },

      show : function() {
         this.context.article = db.get('Article', req.data.id);
      },

      edit : function() {
         this.context.article = db.get('Article', req.data.id);      
      },

      update : function() {
         logger.info(uneval(req.data))
         model.doUpdate(req.data);
         res.redirect('/blog/');
         return;
         res.write("danke"); return;
         res.redirect('/blog/' + req.data.id);   
      },
   
      "delete" : function() {
         this.context.article = db.get('Article', req.data.id);
      },
   
      destroy : function() {
         model.doDelete(req.data.id);
         res.redirect('/blog');
      }
   }
   
}
