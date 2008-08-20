importModule('helma.app', 'app');
importModule('helma.rhino', 'rhino');

importModule("helma.shell", "shell");
global.shell = shell;

importModule('helma.logging', 'logging');
logging.setConfig(getResource('config/environments/test/log4j.properties').name);
global.logger = logging.getLogger();

importFromModule("helma.file", "File");
// try to fix this with helma-ng 0.3
global.APP_DIR = new File(getResource(".").name);

// main method called to start application
function main() {
    app.start({ staticDir: 'static' });
    
    for (var i=0; i<arguments.length; i++) {
       shell.writeln(i+":"+arguments[i]);
    }

    var testDir = new File(APP_DIR, "app/test");
    var unitTestDir = new File(testDir, "unit");
    var testFilePattern = /^([a-z][a-z_\-0-9]*)_test.js$/i
    
    unitTestDir.list(testFilePattern).forEach( function(f) {
       var name = f.match(testFilePattern)[1];
       var moduleName = name + "_test";
       importModule("app.test.unit." + moduleName);
       app.test.unit[moduleName].run().write(shell);
    });   
    
    app.stop();
}
