
function getRenderer(type) {
   importModule("templating." + type, "Renderer");
   return Renderer;
}

function NoRendererException(type) {
   var msg = "render() couldn't find renderer for templating type " + type + ".";
   return msg;
}
