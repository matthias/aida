importModule("aida.controller");
importFromModule("helma.file", "File");

// try to fix this with helma-ng 0.3
global.APP_DIR = new File(getResource(".").name);

/**
 * Helma-NG handler function that connects to the Helma servlet. 
 *
 * @param {object} req     will be passed by helma-ng
 * @param {object} res     will be passed by helma-ng
 * @param {object} session will be passed by helma-ng
 */
handleRequest = function(req, res, session) {   
   global.req = req;
   global.res = res;
   global.session = session;
   aida.controller.handleRequest("root");
}
