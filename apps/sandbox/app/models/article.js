importModule('app.orm.hibernate', 'db');

// importFromModule('helpers.validation', 'validatePresenceOf', 'validateFormatOf');


function Article(props) {
   return new db.Storable('Article', props);
}

function doCreate(data) {
   // this.validateCreate(data);
   var props = {
      createTime: new java.util.Date(),
      title: data.title,
      text: data.text
   };
   var article = new Article(props);
   db.save(article);
   return article;
}

function doUpdate(data) {
   var article = db.get('Article', data.id);
   article.text = data.text;
   article.updateTime = new java.util.Date();
   db.save(article);
   return article;
}

function doDelete(id) {
   var article = db.get('Article', id);
   db.remove(article);
   return article;
}
