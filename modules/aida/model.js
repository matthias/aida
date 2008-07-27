// importModule('helma.minibase', 'db');

function update(data) {
/*   var prototypeName = this.__name__;
   var data = data || {};
   if (data[prototypeName.toLowerCase()]) data = data[prototypeName.toLowerCase()];
 
   var errors = Validations.perform(this, data);
   if (errors) return null;
   */
   
   for (var name in data) {
      this[name] = data[name];
   }
   this.updateTime = new Date();
   
   return this;  
}

function storable(ctor, object, data) {
   var obj = {}; // new db.Storable(ctor, {}, object);
   obj.createTime = new Date();
   // obj.update(data);
   return obj;
}
