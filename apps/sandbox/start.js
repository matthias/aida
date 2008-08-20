importModule('helma.app', 'app');
importFromModule('helma.simpleweb', 'handleRequest');
importFromModule('helma.skin', 'render');
importModule('helma.continuation');
importModule('helma.logging', 'logging');
importModule('aida.html', 'html');
importModule('aida.xml_builder', 'xml');
importModule('core.string');
logging.enableResponseLog();
var log = logging.getLogger(__name__);

importModule('webmodule', 'mount.point');

// the main action is invoked for http://localhost:8080/
function main_action() {
    render('skins/index.html', { title: 'Welcome to Helma NG' });
}


// the main action is invoked for http://localhost:8080/
function html_action() {
xml.p(
 "First Line", 
 xml.closedNode("br"),
 "Second Line" 
).writeln();
xml.closedNode("hr", {size:"2", noshade:"noshade"}).writeln();
   
   
xml.open("body", {bgcolor:"yellow"}).writeln();
xml.node("h1", (">>Hello World & Welcome!<<").encodeXml()).writeln();
xml.node("hr").writeln();   // => <hr />
xml.node("p", "This is ", xml.node("a", {href: "http://helma.org"}, "helma"), " speaking!").writeln();
xml.close("body").writeln();

   return;
   with (xml) { res.writeln(
      xmlDeclaration(),             // <?xml version="1.0" encoding="UTF-8"?>
      html(                         // <html>
         head(                      //   <head>
            title("History")        //     <title>History</title>
         ),                         //   </head>
         body (                     //   <body>
            comment("HI"),          //     <!-- HI -->
            h1("Header"),           //     <h1>Header</h1>
            p(<span class="red">
               even e4x works
            </span>)                //     <p><span class="red">even e4x works</span></p>
         )                          //   </body>
      )                             // </html>      
   )}                               //
   return;   
   with (html) { res.writeln(
      p("Zeile 1"),
      p(),
      p({"class":"red"}),
      p("Zeile 2", br(), "Zeile 3"),
      p(<span class="red">
         Even E4X works.
      </span>),
      p("Hello ", a({href:"http://www.helma.org"}, "Helma"), "!")
   )}   
   return;
   with (html) { 
      xmlDeclaration().writeln();
      doctype("xhtml").writeln();
      openTag("html", {lang:"en"}).writeln();
      openTag("body").writeln();
      comment("code written by http.js for helma-ng").writeln();
      h1("hello").writeln();
      div(
         p(
            "Das ist der erste ", em("Absatz"), " mit einem ", 
            a({href:"http://helma.org", "xml:lang":"en"}, "Link"), "!!!", br(),
            "Und einer zweiten Zeile.",
            tag("isbn:number", "876868-979")
         )
      ).writeln();
      p(<span style="color:red">This is a red <em>span</em></span>).writeln()
      p(<span style="color:yellow">This is a yellow span</span>).writeln()      
/*      script({type:"text/javascript"}, 
         'alert("hello!")'
      ).writeln(); */
      closeTag("body").writeln();
      closeTag("html").writeln();
   }
}


// demo for skins, macros, filters
function skins_action() {
    var context = {
        title: 'Skin Demo',
        name: 'Luisa',
        myname: { name: "Matthias" },
        names: ['Benni', 'Emma', 'Luca', 'Selma']
    };
    render('skins/skins.html', context);
}

// demo for log4j logging
function logging_action() {
    // make sure responselog is enabled
    var hasResponseLog = logging.responseLogEnabled();
    if (!hasResponseLog) {
        logging.enableResponseLog();
        log.debug("enabling response log");
    }
    if (req.data.info) {
        log.info("Hello world!");
    } else if (req.data.error) {
        try {
            foo.bar.moo;
        } catch (e) {
            log.error(e, e.rhinoException);
        }
    }
    render('skins/logging.html', { title: "Logging Demo" });
    if (!hasResponseLog) {
        log.debug("disabling response log");
        logging.disableResponseLog();
    }
    logging.flushResponseLog();
}

// demo for continuation support
function continuation_action() {
    if (req.params.helma_continuation == null) {
        // set query param so helma knows to switch rhino optimization level to -1
        res.redirect(req.path + "?helma_continuation=");
    }
    // render first page
    render('skins/continuation.html', {
        title: "Continuations Demo",
        skin: "step1",
        href: Continuation.nextUrl()
    });
    Continuation.nextPage();
    // render second page
    var message = req.data.message;
    render('skins/continuation.html', {
        title: "Continuations (Page 2 of 3)",
        skin: "step2",
        href: Continuation.nextUrl()
    });
    Continuation.nextPage();
    // render third page
    render('skins/continuation.html', {
        title: "Continuations (last Page)",
        skin: "step3",
        message: message
    });
}
