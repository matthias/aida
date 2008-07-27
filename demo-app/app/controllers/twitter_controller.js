importFromModule("aida.controller", "*");

importModule("knallgrau.twitter", "twitter");

function TwitterController() {
   
   this.index_action = function() {};

   this.friends_action  = function () {
      if (!req.data.id) {
         res.redirect("/twitter");
      }   
      this.timeline = twitter.userTimeline({
         id : req.data.id
      });
   }
   
}
