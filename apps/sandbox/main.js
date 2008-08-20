importModule("helma.app", "app");
importFromModule("aida.main", "handleRequest");

// main method called to start application
function main() {
    app.start({ staticDir: 'static' });
}
