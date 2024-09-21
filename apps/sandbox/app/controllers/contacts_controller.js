importFromModule("aida.controller", "*");

importModule("helma.http", "http");
importModule("javascript.prototype");

function ContactsController() {
   
   this.index_action = function() {
      importJar("httpclient-4.0-alpha4.jar");   
      
      // var client = new org.apache.http.impl.client.DefaultHttpClient.DefaultHttpClient();
      res.writeln("org.apache.http.client.params.ClientPNames:" + new org.apache.http.impl.client.DefaultHttpClient.DefaultHttpClient())
      
      render({layout:null});      
   }
   
   this.index2_action = function() {
      var login = "matthias.platzer@gmail.com";
      var password = "***";
      var URL = "https://mail.google.com/mail/";
      var LOGIN_URL = "https://www.google.com/accounts/ServiceLoginAuth";
      var LOGIN_REFERER_URL = "https://www.google.com/accounts/ServiceLogin?service=mail&passive=true&rm=false&continue=http%3A%2F%2Fmail.google.com%2Fmail%3Fui%3Dhtml%26zy%3Dl&ltmpl=yj_blanco&ltmplcache=2&hl=en";
      var CONTACT_LIST_URL = "https://mail.google.com/mail/contacts/data/contacts?thumb=true&show=ALL&enums=true&psort=Name&max=10000&out=js&rf=&jsx=true";
      var PROTOCOL_ERROR = "Gmail has changed its protocols, please upgrade this library first. If that does not work, contact lucas@rufy.com with this error";
      var CHECKCOOKIE_URL = "https://www.google.com/accounts/CheckCookie?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail&hl=en&ltmpl=yj_blanco&chtml=LoginDoneHtml";
      
      var time = new Date() - 0;
      var timePast = time - 8 - Math.random(12);
      var cookie = {
         name : "GMAIL_LOGIN",
         value : "T"+timePast+"/"+timePast+"/"+time
      }
            
      var client = new http.Client();
      client.setMethod("POST");
      client.setCookie({
         name : "GMAIL_LOGIN",
         value : "T"+timePast+"/"+timePast+"/"+time
      });
      client.setContent({
         "ltmpl" : "yj_blanco",
         "continue" : URL,
         "ltmplcache" : "2",
         "service" : "mail",
         "rm" : "false",
         "ltmpl" : "yj_blanco",
         "hl" : "en",
         "Email" : login,
         "Passwd" : password,
         "rmShown" : "1",
         "null" : "Sign+in"
      });
      client.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; de-AT; rv:1.9) Gecko/2008061004 Firefox/3.0");
      
      /*
      var client2 = new http.Client();
      client.setCookie({
         name : "GMAIL_LOGIN",
         value : "T"+timePast+"/"+timePast+"/"+time
      });
      client.setFollowRedirects(false);
      client.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; de-AT; rv:1.9) Gecko/2008061004 Firefox/3.0");
      */
      // var r = client.getUrl(CHECKCOOKIE_URL);
      var r = client.getUrl(LOGIN_URL);
      
      res.writeln(r.content)
      
      render({layout:null});
   };
   
}
