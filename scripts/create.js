load("scripts/lib/file.js");

// create new app
var appName = arguments[0];
var appPath = "apps/" + appName;
var appDir = new File(appPath);
var templateDirectory = new File("scripts/generate/app");


function copyDirectory(dir, dest) {
   var arr = dir.list(/.*/);
   var dest = new File(dest);
   if (dest.exists()) {
      print("exists " + dest);
   } else {
      print("create " + dest);
      dest.makeDirectory();
   }
   if (!dest.isDirectory()) throw Error("Can't copy " + dir + " to " + dest + " - it's not a directory.");
   
   for (var i=0; i<arr.length; i++) {
      var f = new File(dir, arr[i]);
      var d = new File(dest, arr[i]); // destination
      if (f.isDirectory()) {
         copyDirectory(f, d);
      } else {
         if (d.exists()) {
            print("exists " + d);          
         } else {         
            print("create " + d);
            f.hardCopy(d);
         }
      }
   }
}

print("....")
copyDirectory(templateDirectory, appDir);



/*
var arr = templateDirectory.list();
for (var i=0; i<arr.length; i++) {
   var f = new File(templateDirectory, arr[i]);
   if (f.isDirectory())
      f.removeDirectory();
   else
      f.remove();
}
file["delete"]();



quit();

var DIRECTORY_STRUCTURE = [
   "app",
   "app/controllers",
   "app/helpers",
   "app/models",
   "app/routes",
   "app/test",
   "app/views",
   "app/views/layouts",
   "config",
   "db",
   "db/migrate",
   "doc",
   "lib",
   "static"
]

// check if application already exists
if (appDir.exists()) {
   print("Error: Application " + appDir.getAbsoluteFile() + " already exists.");
   quit();
}

// create app dir
appDir.mkdir();
if (appDir.exists()) {
   print("Created application " + appName + " at " + appDir.getAbsoluteFile());
} else {
   print("Error: creating application " + appName + " at " + appDir.getAbsoluteFile());
   quit();
}

/*
for (var i=0; i<DIRECTORY_STRUCTURE.length; i++) {
   var dir = new File(appDir, DIRECTORY_STRUCTURE[i]).getAbsoluteFile();
   if (!dir.exists()) {
      dir.mkdir();
      print("create " + DIRECTORY_STRUCTURE[i]);
   }   
}
*/

quit();
