importModule("aida.migrations");
this.__proto__ = aida.migrations;

/// DUMMY CODE____....

function up() {
   createTable("order_histories");
}

function up2() {
   createTable("order_histories", {
      orderId     : "integer",
      notes       : "text",
      timestamps  : "default"
   });
   changeColumn({
      table       : "orders",
      column      : "order_type", 
      type        : "string", 
      isNull      : false
   });
   var orders = table("orders");
   var orderType = orders.column("order_type");
   orderType.changeColumn({type:"string"});
   orderType.renameColumn({name:"e_mail"});
   
   orders.changeColumn({
      column      : "order_type", 
      type        : "string", 
      isNull      : false
   });
   orders.changeColumn({
      column      : "order_type", 
      type        : "string", 
      isNull      : false
   }, {
      column      : "order_id", 
      type        : "number"
   });   
}

function down() {
   dropTable("order_histories"); 
}


