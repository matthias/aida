
Formats = function() {
   
   var DEFAULT_FORMAT = "html";
   
   var formats = {
      html : {
         mimeTypes : ["text/html", "application/xhtml+xml"],
         alternativeExtensions : ["htm", ""]
      },
      xml : {
         mimeTypes : ["text/xml", "application/xml"]
      },
      js : {
         mimeTypes : ["text/javascript"]
      },
      css : {
         mimeTypes : ["text/css"]
      },
      json : {
         mimeTypes : ["application/json"]
      },
      txt : {
         mimeTypes : ["text/plain"]
      },
      atom : {
         mimeTypes : ["application/atom+xml"]
      },
      rss : {
         mimeTypes : ["application/rss+xml"]
      }
   };
   
   return {
      getFormats : function() {
         var result = [];
         for (var format in formats) result.push(format);
         return result;
      },
      get : function(format) {
         return formats[format]; 
      },
      getMimeType : function(format) {
         return (formats[format] && formats[format].mimeTypes[0]);
      },
      setFormat : function(extension, options) {
         formats[extension] = options;
      },
      getFormat : function(extension) {
         if (extension && formats[extension]) return extension;
         if (req.data.format && formats[req.data.format]) return req.data.format;
         try {
            // FIXME... that could be a little bit less guessing
            var accepted = (req.headers.Accept || "text/html").split(";")[0].split(",");            
         } catch(e) {
            var accepted = [formats[DEFAULT_FORMAT].mimeTypes];
         }
         for (var i=0; i<accepted.length; i++) {
            for (var name in formats) {
               if (formats[name].mimeTypes.include(accepted[i])) {
                  return name;
               }
            }
         }
         return DEFAULT_FORMAT;
      },
      setDefault : function(extension) {
         if (!formats[extension]) throw new Exception("Couldn't set default format. Format not found.");
         DEFAULT_FORMAT = extension;
      },
      getDefault : function() {
         return DEFAULT_FORMAT;
      } 
   };
   
}();
