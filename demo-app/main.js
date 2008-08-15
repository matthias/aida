importModule('helma.app', 'app');
importModule('helma.rhino', 'rhino');
importJar('mysql-connector-java-5.1.6-bin.jar');

// this is just for convinience while developing/debugging aida - i will remove this in the future
importModule("helma.shell", "shell");
global.shell = shell;

// this is just for convinience while developing/debugging aida - i will remove this in the future
importModule('helma.logging', 'logging');

logging.setConfig(getResource('config/environments/development/log4j.properties').path);
global.logger = logging.getLogger();

importFromModule("helma.file", "File");
// try to fix this with helma-ng 0.3
global.APP_DIR = new File(getResource(".").name);

importModule("aida.controller");

// main method called to start application
function main() {
    app.start({ staticDir: 'static' });
}

/**
 * Helma-NG handler function that connects to the Helma servlet. 
 *
 * @param {object} req     will be passed by helma-ng
 * @param {object} res     will be passed by helma-ng
 * @param {object} session will be passed by helma-ng
 */
global.handleRequest = function(req, res, session) {   
   global.req = req;
   global.res = res;
   global.session = session;
   aida.controller.handleRequest("root");
}

/*
var rs = RootRoutes = new RouteSet("root").draw(function() {
   this.connect("/blog->", { forwardTo : "article" });
   this.connect("/$controller/$action/$id");   
});
rs.add(["/my/own/route"]);
res.writeln(rs.routes.join("\n"));
res.writeln(rs.recognizePath("POST /say/hello"));
// res.writeln(rs.generate({path:"/blog/hello"}));
res.writeln(rs.generate({controller:"foo", action:"hello", id:"11"}));
*/
