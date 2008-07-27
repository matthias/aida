importModule('helma.app', 'app');
importModule('helma.rhino', 'rhino');
importModule("helma.shell", "shell");

importFromModule("helma.file", "File");
global.APP_DIR = new File(getResource("../demo-app/app").name);


// main method called to start application
function main() {
    app.start({ staticDir: 'static' });

    importModule("modules.aida.controller.controller_test");
    modules.aida.controller.controller_test.run().write(shell);
    
    app.stop();
}
