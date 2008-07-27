//
// Jala Project [http://opensvn.csie.org/traccgi/jala]
//
// Copyright 2004 ORF Online und Teletext GmbH
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision: 316 $
// $LastChangedBy: robert $
// $LastChangedDate: 2008-01-07 00:32:06 +0100 (Mon, 07 Jän 2008) $
// $HeadURL: http://dev.orf.at/source/jala/trunk/util/Test/code/Global/jala.Test.js $
//

/**
 * @fileoverview Fields and methods of the Test class.
 */

/**
 * HelmaLib dependencies
 */
importModule("core.string");
importModule("helma.http");
importFromModule("helma.file", "File");
importModule("helma.shell", "shell");
importModule("helma.rhino");
shell.writeln("------------")

// config
if (!global.config) global.config = {};
if (!global.config.aida) global.config.aida = {};
config.aida.testing = {
   directory : global.APP_DIR + "/test/foo"
}

/**
 * Jala dependencies
 */
// importModule("jala.database");

/**
 * Constructs a new Test instance.
 * @class Provides various methods for automated tests.
 * This is essentially a port of JSUnit (http://www.edwardh.com/jsunit/)
 * suitable for testing Helma applications.
 * @param {Number} capacity The capacity of the cache
 * @constructor
 */
Test = function() {
   
   /**
    * Contains the number of tests that were executed
    * @type Number
    */
   this.testsRun = 0;

   /**
    * Contains the number of tests that failed
    * @type Boolean
    */
   this.testsFailed = 0;

   /**
    * Contains the number of test functions that passed
    * @type Number
    */
   this.functionsPassed = 0;

   /**
    * Contains the number of test functions that failed
    * @type Number
    */
   this.functionsFailed = 0;

   /**
    * An Array containing the results of this Test instance.
    * @type Array
    */
   this.results = [];

   return this;
};



/*************************************************************
 ***** S T A T I C   F I E L D S   A N D   M E T H O D S *****
 *************************************************************/


/**
 * Constant indicating "passed" status
 * @type String
 * @final
 */
Test.PASSED = "passed";

/**
 * Constant indicating "failed" status
 * @type String
 * @final
 */
Test.FAILED = "failed";

/**
 * Helper method useable for displaying a value
 * @param {Object} The value to render
 * @returns The value rendered as string
 * @type String
 */
Test.valueToString = function(val) {
   res.push();
   if (val === null) {
      res.write("null");
   } else if (val === undefined) {
      res.write("undefined");
   } else {
      if (typeof(val) == "function") {
         // functions can be either JS methods or Java classes
         // the latter throws an exception when trying to access a property
         try {
            res.write(val.name || val);
         } catch (e) {
            res.write(val);
         }
      } else {
         if (val.constructor && val.constructor == String) {
            res.write('"' + encode(val.head(200)) + '"');
         } else {
            res.write(val.toString());
         }
         res.write(" (");
         if (val.constructor && val.constructor.name != null) {
            res.write(val.constructor.name);
         } else {
            res.write(typeof(val));
         }
         res.write(")");
      }
   }
   return res.pop();
};

/**
 * Returns the directory containing the test files.
 * The location of the directory is either defined by the
 * application property "jala.testDir" or expected to be one level
 * above the application directory (and named "tests")
 * @returns The directory containing the test files
 * @type File
 */
Test.getTestsDirectory = function() {
   var dir;
   if (true) {
       dir = new File(config.aida.testing.directory);
   } else
   if (getProperty("jala.testDir") != null) {
      dir = new File(getProperty("jala.testDir"));
   }
   if (!dir || !dir.exists()) {
      var appDir = new File(global.APP_DIR);
      dir = new File(appDir.getParent(), "tests");
      if (!dir.exists())
         return null;
   }
   return dir;
};

/**
 * Returns an array containing the test files located
 * in the directory.
 * @returns An array containing the names of all test files
 * @type Array
 */
Test.getTestFiles = function() {
   var dir;
   if ((dir = Test.getTestsDirectory()) != null) {
      return dir.list(/.*\.js/).sort();
   }
   return null;
};

/**
 * Returns the testfile with the given name
 * @param {String} fileName The name of the test file
 * @returns The test file
 * @type File
 */
Test.getTestFile = function(fileName) {
   var dir = Test.getTestsDirectory();
   if (dir != null) {
      return new File(dir, fileName);
   }
   return null;
};

/**
 * @param {Number} nr The number of arguments to be expected
 * @param {Object} args The arguments array.
 * @returns True in case the number of arguments matches
 * the expected amount, false otherwise.
 * @type Boolean
 */
Test.evalArguments = function(args, argsExpected) {
   if (!(args.length == argsExpected ||
             (args.length == argsExpected + 1 && typeof(args[0]) == "string"))) {
      throw new Test.ArgumentsException("Insufficient arguments passed to assertion function");
   }
   return;
};

/**
 * Returns true if the arguments array passed as argument
 * contains an additional comment.
 * @param {Array} args The arguments array to check for an existing comment.
 * @param {Number} argsExpected The number of arguments expected by the
 * assertion function.
 * @returns True if the arguments contain a comment, false otherwise.
 * @type Boolean
 */
Test.argsContainComment = function(args, argsExpected) {
   return !(args.length <= argsExpected
               || (args.length == argsExpected + 1 && typeof(args[0]) != "string"))
};

/**
 * Cuts out the comment from the arguments array passed
 * as argument and returns it. CAUTION: this actually modifies
 * the arguments array!
 * @param {Array} args The arguments array.
 * @returns The comment, if existing. Null otherwise.
 * @type String
 */
Test.getComment = function(args, argsExpected) {
   if (Test.argsContainComment(args, argsExpected))
      return args[0];
   return null;
};

/**
 * Returns the argument on the index position in the array
 * passed as arguments. This method respects an optional comment
 * at the beginning of the arguments array.
 * @param {Array} args The arguments to retrieve the non-comment
 * value from.
 * @param {Number} idx The index position on which the value to
 * retrieve is to be expected if <em>no</em> comment is existing.
 * @returns The non-comment value, or null.
 * @type Object
 */
Test.getValue = function(args, argsExpected, idx) {
   return Test.argsContainComment(args, argsExpected) ? args[idx+1] : args[idx];
};


/**
 * Creates a stack trace and parses it for display.
 * @param {java.lang.StackTraceElement} trace The trace to parse. If not given
 * a stacktrace will be generated
 * @returns The parsed stack trace
 * @type String
 */
Test.getStackTrace = function(trace) {
   /**
    * Private method for filtering out only JS parts of the stack trace
    * @param {Object} name
    */
   var accept = function(name) {
      return name.endsWith(".js") || name.endsWith(".hac") ||
             name.endsWith(".hsp");
   };

   // create exception and fill in stack trace
   if (!trace) {
      var ex = new Packages.org.mozilla.javascript.EvaluatorException("");
      ex.fillInStackTrace();
      trace = ex.getStackTrace();
   }
   var stack = [];
   var el, fileName, lineNumber;
   // parse the stack trace and keep only the js elements
   var inTrace = false;
   for (var i=trace.length; i>0; i--) {
      el = trace[i-1];
      fileName = el.getFileName();
      lineNumber = el.getLineNumber();
      if (fileName != null && lineNumber > -1 && accept(fileName)) {
         if (fileName.endsWith(res.currentTest)) {
            inTrace = true;
         }
         if (inTrace == true) {
            // ignore all trace lines that refer to Test
            if (fileName.endsWith("jala.Test.js")) {
               break;
            }
            stack.push("at " + fileName + ":" + lineNumber);
         }
      }
   }
   return stack.reverse().join("\n");
};

/**
 * Returns a custom JavaScript scope used for evaluating unit tests.
 * This method defines all assertion methods as global methods,
 * and creates a default instantiation of the Http client
 * for convenience.
 * @returns The newly created scope object
 * @type helma.scripting.rhino.GlobalObject
 * @private
 */
Test.getTestScope = function() {
   // create a new vanilla global object
   var engine = helma.rhino.getRhinoEngine();
   var scope = engine.createThreadScope(helma.rhino.getRhinoContext())
   // put the necessary global objects into the scope
   // scope.root = root;
   scope.session = session;
   scope.req = req;
   scope.res = res;
   // scope.path = path;
   // define global assertion functions
   for (var i in Test.prototype) {
      if (i.indexOf("assert") == 0) {
         scope[i] = Test.prototype[i];
      }
   }
   // add global include method
   scope.include = function(file) {
      Test.include(scope, file);
      return;
   };
   // instantiate a global HttpClient
   scope.httpClient = new Test.HttpClient();
   // instantiate the test database manager
   scope.testDatabases = new Test.DatabaseMgr();
   // instantiate the smtp server
   scope.smtpServer = new Test.SmtpServer();
   return scope;
};

/**
 * Evaluates a javascript file in the global test scope. This method can be used
 * to include generic testing code in test files. This method is available as
 * global method "include" for all test methods
 * @param {Object} scope The scope in which the file should be evaluated
 * @param {String} fileName The name of the file to include, including the path
 */
Test.include = function(scope, file) {
   var file = new File(file);
   var fileName = file.getName();
   if (file.canRead() && file.exists()) {
      var cx = Packages.org.mozilla.javascript.Context.enter();
      var code = new java.lang.String(file.readAll() || "");
      cx.evaluateString(scope, code, fileName, 1, null);
   }
   return;
};



/*******************************
 ***** E X C E P T I O N S *****
 *******************************/


/**
 * Creates a new Exception instance
 * @class Base exception class
 * @returns A newly created Exception instance
 * @constructor
 */
Test.Exception = function Exception() {
   return this;
};

/** @ignore */
Test.Exception.prototype.toString = function() {
   return "[Test.Exception: " + this.message + "]";
};

/**
 * Creates a new TestException instance
 * @class Instances of this exception are thrown whenever an
 * assertion function fails
 * @param {String} comment An optional comment
 * @param {String} message The failure message
 * @returns A newly created TestException instance
 * @constructor
 */
Test.TestException = function TestException(comment, message) {
   this.functionName = null;
   this.comment = comment;
   this.message = message;
   this.stackTrace = Test.getStackTrace();
   return this;
};
Test.TestException.prototype = new Test.Exception();

/** @ignore */
Test.TestException.prototype.toString = function() {
   return "[Test.TestException in " + this.functionName +
          ": " + this.message + "]";
};

/**
 * Creates a new ArgumentsException instance
 * @class Instances of this exception are thrown whenever an assertion
 * function is called with incorrect or insufficient arguments
 * @param {String} message The failure message
 * @returns A newly created ArgumentsException instance
 * @constructor
 */
Test.ArgumentsException = function ArgumentsException(message) {
   this.functionName = null;
   this.message = message;
   this.stackTrace = Test.getStackTrace();
   return this;
};
Test.ArgumentsException.prototype = new Test.Exception();

/** @ignore */
Test.ArgumentsException.prototype.toString = function() {
   return "[Test.ArgumentsException in " + this.functionName +
          ": " + this.message + "]";
};

/**
 * Creates a new EvaluatorException instance
 * @class Instances of this exception are thrown when attempt
 * to evaluate the test code fails.
 * @param {String} message The failure message, or an Error previously
 * thrown.
 * @param {String} exception An optional nested Error
 * @returns A newly created EvaluatorException instance
 * @constructor
 */
Test.EvaluatorException = function EvaluatorException(message, exception) {
   this.functionName = null;
   this.message = null;
   this.stackTrace = null;
   this.fileName = null;
   this.lineNumber = null;

   if (arguments.length == 1 && arguments[0] instanceof Error) {
      this.message = "";
      exception = arguments[0];
   } else {
      this.message = message;
   }

   if (exception != null) {
      this.name = exception.name;
      if (exception.rhinoException != null) {
         var e = exception.rhinoException;
         this.message += e.details();
         this.stackTrace = Test.getStackTrace(e.getStackTrace());
      } else if (exception instanceof Error) {
         this.message = exception.message;
      }
      if (!this.stackTrace) {
         // got no stack trace, so add at least filename and line number
         this.fileName = exception.fileName || null;
         this.lineNumber = exception.lineNumber || null;
      }
   }

   return this;
};
Test.EvaluatorException.prototype = new Test.Exception();

/** @ignore */
Test.EvaluatorException.prototype.toString = function() {
   return "[Test.EvaluatorException: " + this.message + "]";
};



/*************************************************
 ***** R E S U L T   C O N S T R U C T O R S *****
 *************************************************/


/**
 * Constructs a new TestResult instance
 * @class Instances of this class represent the result of the execution
 * of a single test file
 * @param {String} testFileName The name of the excecuted test file
 * @returns A new TestResult instance
 * @constructor
 */
Test.TestResult = function(testFileName) {
   this.name = testFileName;
   this.elapsed = 0;
   this.status = Test.PASSED;
   this.log = [];
   return this;
};

/**
 * Constructs a new TestFunctionResult instance
 * @class Instances of this class represent the result of the successful
 * execution of a single test function (failed executions will be represented
 * as Exceptions in the log of a test result).
 * @param {String} functionName The name of the excecuted test function
 * @param {Date} startTime A Date instance marking the begin of the test
 * @returns A new TestFunctionResult instance
 * @constructor
 */
Test.TestFunctionResult = function(functionName, startTime) {
   this.functionName = functionName;
   this.elapsed = (new Date()) - startTime;
   return this;
};



/*************************************************
 ***** P R O T O T Y P E   F U N C T I O N S *****
 *************************************************/


/**
 * Executes a single test file
 * @param {File} testFile The file containing the test to run
 */
Test.prototype.executeTest = function(testFile) {
   var testFileName = testFile.getName();
   shell.writeln("executeTest(" + testFileName + ")");
   // store the name of the current test in res.currentTest
   // as this is needed in getStackTrace
   res.currentTest = testFileName;

   var cx = Packages.org.mozilla.javascript.Context.enter();
   var code = new java.lang.String(testFile.readAll() || "");
   var testResult = new Test.TestResult(testFileName);
   try {
      // instantiate a new test scope
      shell.writeln("scope:" + scope);
      var scope = Test.getTestScope(scope);
      shell.writeln("scope:" + scope);
      shell.writeln("code:" + code);
      shell.writeln("testFileName:" + testFileName);
      // evaluate the test file in the per-thread which is garbage
      // collected at the end of the test run and prevents the application
      // scope from being polluted
      cx.evaluateString(scope, code, testFileName, 1, null);
      shell.writeln("scope.tests:" + scope.tests);
      shell.writeln("scope.tests.constructor:" + scope.tests.constructor);
      shell.writeln("scope.tests.length:" + scope.tests.length);
      if (!scope.tests || scope.tests.constructor != Array || scope.tests.length == 0) {
         shell.writeln("Please define an Array named 'tests' containing the names of the test functions to run")
         throw "Please define an Array named 'tests' containing the names of the test functions to run";
      }
      var start = new Date();
      // run the test
      try {
         if (scope.setup != null && scope.setup instanceof Function) {
            // setup function exists, so call it
            testResult.log.push(this.executeTestFunction("setup", scope));
         }
         // run all test methods defined in the array "tests"
         var functionName;
         for (var i=0;i<scope.tests.length;i++) {
            try {
               functionName = scope.tests[i];
               if (!scope[functionName] || scope[functionName].constructor != Function) {
                  throw new Test.EvaluatorException("Test function '" +
                                            functionName + "' is not defined.");
               }
               testResult.log.push(this.executeTestFunction(functionName, scope));
            } catch (e) {
               this.testsFailed += 1;
               testResult.status = Test.FAILED;
               e.functionName = functionName;
               testResult.log.push(e);
            }
         }
      } catch (e) {
         this.testsFailed += 1;
         testResult.status = Test.FAILED;
         testResult.log.push(e);
      } finally {
         // call any existing "cleanup" method
         if (scope.cleanup != null && scope.cleanup instanceof Function) {
            testResult.log.push(this.executeTestFunction("cleanup", scope));
         }
      }
   } catch (e) {
      this.testsFailed += 1;
      testResult.status = Test.FAILED;
      testResult.log.push(new Test.EvaluatorException(e));
   } finally {
      // exit the js context created above
      cx.exit();
      // clear res.currentTest
      res.currentTest = null;
   }
   testResult.elapsed = (new Date()) - start;
   this.results.push(testResult);
   return;
};

/**
 * Executes a single test function
 * @param {String} functionName The name of the test function to execute
 * @param {helma.scripting.rhino.GlobalObject} scope The scope to execute
 * the test method in
 */
Test.prototype.executeTestFunction = function(functionName, scope) {
   // store the name of the current function in res.currentTestFunction
   res.currentTestFunction = functionName;
   var start = new Date();
   try {
      scope[functionName]();
      this.functionsPassed += 1;
      return new Test.TestFunctionResult(functionName, start);
   } catch (e) {
      if (!(e instanceof Test.Exception)) {
         e = new Test.EvaluatorException(e);
      }
      this.functionsFailed += 1;
      throw e;
   } finally {
      // clear res.currentFunction
      res.currentTestFunction = null;
   }
};

/**
 * Main test execution function
 * @param {String|Array} what Either the name of a single test file
 * or an array containing the names of several function files that should
 * be executed.
 */
Test.prototype.execute = function(what) {
   shell.writeln("-------");
   shell.writeln("execute("+what+")");
   var self = this;
   var executeTest = function(fileName) {
      var file = Test.getTestFile(fileName);
      shell.writeln("file:"+file);
      shell.writeln("file.exists():"+file.exists());
      if (file != null && file.exists()) {
         self.testsRun += 1;
         self.executeTest(file);
      }
   };

   if (what instanceof Array) {
      for (var i in what) {
         executeTest(what[i]);
      }
   } else {
      executeTest(what);
   }
   return;
};

/** @ignore */
Test.prototype.toString = function() {
   return "[Test]";
};

/**
 * Renders the results of all tests done by this test instance
 * to response.
 */
Test.prototype.renderResults = function() {
   if (this.results.length > 0) {
      for (var i=0;i<this.results.length;i++) {
         this.renderResult(this.results[i]);
      }
   }
   return;
};

/**
 * Renders the result of a single test
 * @param {Test.TestResult} The result to render
 */
Test.prototype.renderResult = function(result) {
   res.push();
   var logItem;
   for (var i=0;i<result.log.length;i++) {
      logItem = result.log[i];
      if (logItem instanceof Test.Exception) {
         renderSkin("jala.Test#logFailed", logItem);
      } else {
         renderSkin("jala.Test#logPassed", logItem);
      }
   }
   var param = {
      name: result.name,
      elapsed: result.elapsed,
      status: result.status,
      log: res.pop()
   }
   renderSkin("jala.Test#result", param);
   return;
};



/***********************
 ***** M A C R O S *****
 ***********************/


/**
 * Renders the list of available tests
 */
Test.prototype.list_macro = function() {
   var list = Test.getTestFiles();
   if (list && list.length > 0) {
      var fileName, skinParam;
      for (var i=0;i<list.length;i++) {
         fileName = list[i];
         skinParam = {name: fileName};
         if (req.data.test == fileName ||
                   (req.data.test_array && req.data.test_array.contains(fileName))) {
            skinParam.checked = "checked";
         }
         renderSkin("jala.Test#item", skinParam);
      }
   }
   return;
};

/**
 * Renders the test results
 */
Test.prototype.results_macro = function() {
   this.renderResults();
   return;
};

/**
 * Returns the absolute path to the directory containing the tests
 * @returns The path to the tests directory
 * @type String
 */
Test.prototype.directory_macro = function() {
   return Test.getTestsDirectory();
};



/***********************************************************************
 ***** A S S E R T I O N   A N D   H E L P E R   F U N C T I O N S *****
 ***********************************************************************/


/**
 * Checks if the value passed as argument is boolean true.
 * @param {Object} val The value that should be boolean true.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertTrue = function assertTrue(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (typeof(value) != "boolean") {
      throw new Test.ArgumentsException("Invalid argument to assertTrue(boolean): " +
                      Test.valueToString(value));
   } else if (value !== true) {
      throw new Test.TestException(comment,
                      "assertTrue(boolean) called with argument " +
                      Test.valueToString(value));
   }
   return;
};

/**
 * Checks if the value passed as argument is boolean false.
 * @param {Object} val The value that should be boolean false.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertFalse = function assertFalse(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (typeof(value) != "boolean") {
      throw new Test.ArgumentsException("Invalid argument to assertFalse(boolean): " +
                      Test.valueToString(value));
   } else if (value === true) {
      throw new Test.TestException(comment,
                      "assertFalse(boolean) called with argument " +
                      Test.valueToString(value));
   }
   return;
};

/**
 * Checks if the values passed as arguments are equal.
 * @param {Object} val1 The value that should be compared to the second argument.
 * @param {Object} val2 The value that should be compared to the first argument.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertEqual = function assertEqual(val1, val2) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value1 = Test.getValue(arguments, argsExpected, 0);
   var value2 = Test.getValue(arguments, argsExpected, 1);
   if (value1 !== value2) {
      throw new Test.TestException(comment,
                      "Expected " + Test.valueToString(value1) +
                      " to be equal to " + Test.valueToString(value2));
   }
   return;
};

/**
 * Checks if the value passed as argument equals the content of a file on disk.
 * @param {Object} val The value that should be compared with the content of
 * the file on disk.
 * @param {String|File} file Either a file name (including a path), or
 * an instance of File representing the file to use for comparison.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertEqualFile = function assertEqualFile(val, file) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value1 = Test.getValue(arguments, argsExpected, 0);
   var file = new File(Test.getValue(arguments, argsExpected, 1));
   var equals;
   if (value1.getClass && value1.getClass().isArray() &&
          value1.getClass().getComponentType() === java.lang.Byte.TYPE) {
      equals = java.util.Arrays.equals(value1, file.toByteArray());
   } else {
      // remove the last linefeed in value1, since readAll() removes
      // the last linefeed in a file too
      var str = value1.replace(/\r?\n$/g, "");
      equals = str === file.readAll();
   }      
   if (!equals) {
      throw new Test.TestException(comment,
                      "Expected " + Test.valueToString(value1) +
                      " to be equal to the contents of the file " +
                      file.getAbsolutePath());
   }
   return;
};

/**
 * Checks if the values passed as arguments are not equal.
 * @param {Object} val1 The value that should be compared to the second argument.
 * @param {Object} val2 The value that should be compared to the first argument.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNotEqual = function assertNotEqual(val1, val2) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var value1 = Test.getValue(arguments, argsExpected, 0);
   var value2 = Test.getValue(arguments, argsExpected, 1);
   var comment = Test.getComment(arguments, argsExpected);
   if (value1 === value2) {
      throw new Test.TestException(comment,
                      "Expected " + Test.valueToString(value1) +
                      " to be not equal to " + Test.valueToString(value2));
   }
   return;
};

/**
 * Checks if the value passed as argument is null.
 * @param {Object} val The value that should be null.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNull = function assertNull(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (value !== null) {
      throw new Test.TestException(comment,
                           "Expected " + Test.valueToString(value) +
                           " to be null");
   }
   return;
};

/**
 * Checks if the value passed as argument is not null.
 * @param {Object} val The value that should be not null.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNotNull = function assertNotNull(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (value === null) {
      throw new Test.TestException(comment,
                           "Expected " + Test.valueToString(value) +
                           " to be not null");
   }
   return;
};

/**
 * Checks if the value passed as argument is undefined.
 * @param {Object} val The value that should be undefined.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertUndefined = function assertUndefined(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (value !== undefined) {
      throw new Test.TestException(comment,
                           "Expected " + Test.valueToString(value) +
                           " to be undefined");
   }
   return;
};

/**
 * Checks if the value passed as argument is not undefined.
 * @param {Object} val The value that should be not undefined.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNotUndefined = function assertNotUndefined(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (value === undefined) {
      throw new Test.TestException(comment,
                           "Expected argument to be not undefined");
   }
   return;
};

/**
 * Checks if the value passed as argument is NaN.
 * @param {Object} val The value that should be NaN.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNaN = function assertNaN(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (!isNaN(value)) {
      throw new Test.TestException(comment,
                           "Expected " + Test.valueToString(value) +
                           " to be NaN");
   }
   return;
};

/**
 * Checks if the value passed as argument is not NaN.
 * @param {Object} val The value that should be not NaN.
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertNotNaN = function assertNotNaN(val) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   if (isNaN(value)) {
      throw new Test.TestException(comment,
                           "Expected " + Test.valueToString(value) +
                           " to be a number");
   }
   return;
};

/**
 * Checks if the value passed as argument contains the pattern specified.
 * @param {String} val The string that should contain the pattern
 * @param {String} str The string that should be contained
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertStringContains = function assertStringContains(val, str) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   var pattern = Test.getValue(arguments, argsExpected, 1);
   if (pattern.constructor == String) {
      if (value.indexOf(pattern) < 0) {
         throw new Test.TestException(comment,
                              "Expected string " + Test.valueToString(pattern) +
                              " to be found in " + Test.valueToString(value));
      }
   } else {
      throw new Test.ArgumentsException("Invalid argument to assertStringContains(string, string): " +
                      Test.valueToString(pattern));
   }
   return;
};

/**
 * Checks if the regular expression matches the string.
 * @param {String} val The string that should contain the regular expression pattern
 * @param {RegExp} rxp The regular expression that should match the value
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertMatch = function assertMatch(val, rxp) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   Test.evalArguments(arguments, argsExpected);
   var comment = Test.getComment(arguments, argsExpected);
   var value = Test.getValue(arguments, argsExpected, 0);
   var exp = Test.getValue(arguments, argsExpected, 1);
   if (exp.constructor == RegExp) {
      if (exp.test(value) == false) {
         throw new Test.TestException(comment,
                              "Expected pattern " + Test.valueToString(exp) +
                              " to match " + Test.valueToString(value));
      }
   } else {
      throw new Test.ArgumentsException("Invalid argument to assertMatch(string, regexp): " +
                      Test.valueToString(pattern));
   }
   return;
};

/**
 * Checks if the function passed as argument throws a defined exception.
 * @param {Object} func The function to call
 * @param {Object} exception Optional object expected to be thrown when executing
 * the function
 * @throws Test.ArgumentsException
 * @throws Test.TestException
 */
Test.prototype.assertThrows = function assertThrows(func, exception) {
   var functionName = arguments.callee.name;
   var argsExpected = arguments.callee.length;
   if (!func || !(func instanceof Function)) {
      throw new Test.ArgumentsException("Insufficient arguments passed to assertion function");
   }
   var comment = Test.getComment(arguments, argsExpected);
   var func = Test.getValue(arguments, argsExpected, 0);
   var expected = Test.getValue(arguments, argsExpected, 1);

   try {
      func();
   } catch (e) {
      var isExpected = false;
      var thrown = e;
      if (expected == null) {
         // didn't expect an exception, so accept everything
         isExpected = true;
      } else if (expected != null && e != null) {
         // check if exception is the one expected
         switch (typeof(expected)) {
            case "string":
               isExpected = (e.name === expected || e === expected);
               break;
            case "function":
               // this is true for all JS constructors and Java classes!
               isExpected = (e instanceof expected ||
                             (thrown = e.rhinoException) instanceof expected ||
                             (thrown = e.javaException) instanceof expected);
               break;
            case "number":
            case "boolean":
            default:
               isExpected = (e === expected);
               break;
         }
      }
      if (!isExpected) {
         throw new Test.TestException(comment, "Expected " + Test.valueToString(expected) +
                                   " being thrown, but got '" + Test.valueToString(thrown) + "' instead");
      }
      return;
   }
   throw new Test.TestException(comment, "Expected exception " +
                             Test.valueToString(expected) + " being thrown");
   return;
};



/*********************************
 ***** H T T P   C L I E N T *****
 *********************************/


/**
 * Constructs a new HttpClient instance
 * @class Instances of this class represent a http client useable for
 * testing, as any session cookies received by the tested application
 * are stored and used for subsequent requests, allowing simple "walkthrough"
 * tests.
 * @returns A newly constructed HttpClient
 * @constructor
 */
Test.HttpClient = function() {
   var client = new helma.http.Client();
   var cookies = null;

   /**
    * Returns the http client used
    * @return The http client used
    * @type helma.Http
    */
   this.getClient = function() {
      return client;
   };
   
   /**
    * Sets the cookie to use for subsequent requests using this client
    * @param {Array} arr The cookie object as received from helma.Http.getUrl
    */
   this.setCookies = function(arr) {
      cookies = arr;
      return;
   };

   /**
    * Returns the cookies set for this http client
    * @returns The cookies to use for subsequent requests
    * @type Array
    */
   this.getCookies = function() {
      return cookies;
   };

   return this;
};

/**
 * Sends a HTTP request to the Url passed as argument
 * @param {String} method The HTTP method to use
 * @param {String} url The url to request
 * @param {Object} param A parameter object to use with this request
 * @return An object containing response values
 * @see helma.Http.prototype.getUrl
 */
Test.HttpClient.prototype.executeRequest = function(method, url, param) {
   var client = this.getClient();
   client.setMethod(method);
   client.setCookies(this.getCookies());
   // prevent any caching at the remote server or any intermediate proxy
   client.setHeader("Cache-control", "no-cache,max-age=0");
   client.setContent(param);
   // disable following redirects, since cookies would get lost
   // instead, handle a resulting redirect manually
   client.setFollowRedirects(false);
   var result = client.getUrl(url);
   if (result.cookies != null) {
      this.setCookies(result.cookies);
   }
   if (result.location != null) {
      // received a redirect location, so follow it
      result = this.executeRequest("GET", result.location);
   }
   return result;
};

/**
 * Convenience method for requesting the url passed as argument
 * using method GET
 * @param {String} url The url to request
 * @param {Object} param A parameter object to use with this request
 * @return An object containing response values
 * @see helma.Http.prototype.getUrl
 */
Test.HttpClient.prototype.getUrl = function(url, param) {
   return this.executeRequest("GET", url, param);
};

/**
 * Convenience method for submitting a form.
 * @param {String} url The url to request
 * @param {Object} param A parameter object to use with this request
 * @return An object containing response values
 * @see helma.Http.prototype.getUrl
 */
Test.HttpClient.prototype.submitForm = function(url, param) {
   return this.executeRequest("POST", url, param);
};

/** @ignore */
Test.HttpClient.prototype.toString = function() {
   return "[Test.HttpClient]";
};




/*****************************************************
 ***** T E S T   D A T A B A S E   M A N A G E R *****
 *****************************************************/


/**
 * Returns a newly created DatabaseMgr instance
 * @class Instances of this class allow managing test databases
 * and switching a running application to an in-memory test
 * database to use within a unit test.
 * @returns A newly created instance of DatabaseMgr
 * @constructor
 */
Test.DatabaseMgr = function() {
   /**
    * Map containing all test databases
    */
   this.databases = {};

   /**
    * Map containing the original datasource
    * properties that were temporarily deactivated
    * by activating a test database
    */
   this.dbSourceProperties = {};

   return this;
};

Test.DatabaseMgr.prototype.toString = function() {
   return "[Test DatabaseMgr]";
};

/**
 * Switches the application datasource with the given name
 * to a newly created in-memory database. In addition this method
 * also clears the application cache and invalidates the root
 * object to ensure that everything is re-retrieved from the
 * test database.
 * This method can be called with a second boolean argument indicating
 * that tables used by the application should be created in the in-memory
 * database (excluding any data).
 * @param {String} dbSourceName The name of the application database
 * source as defined in db.properties
 * @param {Boolean} copyTables If true this method also copies all
 * tables in the source database to the test database (excluding
 * indexes).
 * @param {Array} tables An optional array containing table names that
 * should be created in the test database. If not specified this method
 * collects all tables that are mapped in the application.
 * @returns The test database
 * @type db.RamDatabase
 */
Test.DatabaseMgr.prototype.startDatabase = function(dbSourceName, copyTables, tables) {
   try {
      var testDb = new db.RamDatabase(dbSourceName);
      // switch the datasource to the test database
      var dbSource = app.getDbSource(dbSourceName);
      if (copyTables === true) {
         if (tables === null || tables === undefined) {
            // collect the table names of all relational prototypes
            tables = [];
            var protos = app.getPrototypes();
            for each (var proto in protos) {
               var dbMap = proto.getDbMapping();
               if (dbMap.isRelational()) {
                  tables.push(dbMap.getTableName());
               }
            }
         }
         testDb.copyTables(dbSource, tables);
      }
      var oldProps = dbSource.switchProperties(testDb.getProperties());
      // store the test database in this manager for use in stopAll()
      this.databases[dbSourceName] = testDb;
      this.dbSourceProperties[dbSourceName] = oldProps;
      // clear the application cache and invalidate root
      app.clearCache();
      root.invalidate();
      return testDb;
   } catch (e) {
      throw new Test.EvaluatorException("Unable to switch to test database because of ", e);
   }
};

/**
 * Stops all registered test databases and and reverts the application
 * to its original datasource(s) as defined in db.properties file.
 * In addition this method commits all pending changes within the request,
 * cleares the application cache and invalidates the root object
 * to ensure no traces of the test database are left behind.
 */
Test.DatabaseMgr.prototype.stopAll = function() {
   // commit all pending changes
   res.commit();
   try {
      // loop over all registered databases and revert the appropriate
      // datasource back to the original database
      var testDb, dbSource;
      for (var dbSourceName in this.databases) {
         testDb = this.databases[dbSourceName];
         dbSource = app.getDbSource(dbSourceName);
         dbSource.switchProperties(this.dbSourceProperties[dbSourceName]);
         testDb.shutdown();
      }
      // clear the application cache and invalidate root
      app.clearCache();
      root.invalidate();
   } catch (e) {
      throw new Test.EvaluatorException("Unable to stop test databases because of ", e);
   }
   return;
};



/*********************************
 ***** S M T P   S E R V E R *****
 *********************************/


/**
 * Creates a new SmtpServer instance
 * @class Instances of this class represent an SMTP server listening on
 * localhost. By default Test will create a global variable called
 * "smtpServer" that contains an instance of this class. To use the server call
 * {@link #start} in a test method (eg. in the basic setup method) and
 * {@link #stop} in the cleanup method.
 * @param {Number} port Optional port to listen on (defaults to 25)
 * @returns A newly created SmtpServer instance
 * @constructor
 */
Test.SmtpServer = function(port) {
   var server = null;
   
   var oldSmtpServer = null;

   /**
    * Starts the SMTP server. Note that this method switches the SMTP server as
    * defined in app.properties of the tested application or server.properties
    * to "localhost" to ensure that all mails sent during tests are received
    * by this server. The SMTP server definition is switched back to the
    * original when {@link #stop} is called.
    */
   this.start = function() {
      server = new Packages.org.subethamail.wiser.Wiser()
      // listen only on localhost
      server.setHostname("localhost");
      if (port != null && !isNaN(port)) {
         server.setPort(port);
      }
      // switch smtp property of tested application
      oldSmtpServer = getProperty("smtp");
      app.__app__.getProperties().put("smtp", "localhost");
      server.start();
      return;
   };

   /**
    * Stops the SMTP server and switches the "smtp" property of the tested
    * application back to the value defined in app or server.properties
    */
   this.stop = function() {
      server.stop();
      server = null;
      // switch back to original SMTP server address
      var props = app.__app__.getProperties();
      if (oldSmtpServer != null) {
         props.put("smtp", oldSmtpServer);
      } else {
         props.remove("smtp");
      }
      return;
   };

   /**
    * Returns an array containing all mails received by the server,
    * where each one is an instance of {@link Test.SmtpServer.Message}
    * @returns An array with all messages
    * @type Array
    */
   this.getMessages = function() {
      var it = server.getMessages().listIterator();
      var result = [];
      while (it.hasNext()) {
         result.push(new Test.SmtpServer.Message(it.next()));
      }
      return result;
   };

   return this;
};

/** @ignore */
Test.SmtpServer.prototype.toString = function() {
   return "[Jala Test SmtpServer]";
};

/**
 * Creates a new Mail instance
 * @class Instances of this class represent a mail message received
 * by the SMTP server
 * @param {org.subethamail.wiser.WiserMessage} message The message
 * as received by the SMTP server
 * @returns A newly created Mail instance
 * @constructor
 */
Test.SmtpServer.Message = function(message) {
   /**
    * The wrapped message as MimeMessage instance
    * @type javax.mail.internet.MimeMessage
    * @private
    */
   var mimeMessage = message.getMimeMessage();

   /**
    * Returns the wrapped message
    * @type org.subethamail.wiser.WiserMessage
    */
   this.getMessage = function() {
      return message;
   };

   /**
    * Returns the wrapped message as MimeMessage
    * @type javax.mail.internet.MimeMessage
    */
   this.getMimeMessage = function() {
      return mimeMessage;
   };

   return this;
};

/** @ignore */
Test.SmtpServer.Message.prototype.toString = function() {
   return "[Jala Test Mail]";
};

/**
 * Returns an array containing all senders of this mail
 * @returns An array with all senders of this mail
 * @type Array
 */
Test.SmtpServer.Message.prototype.getFrom = function() {
   var result = [];
   this.getMimeMessage().getFrom().forEach(function(addr) {
      result.push(addr.toString())
   });
   return result;
};

/**
 * Returns an array containing all recipients of this mail
 * @returns An array with all recipients of this mail
 * @type Array
 */
Test.SmtpServer.Message.prototype.getTo = function() {
   var type = Packages.javax.mail.internet.MimeMessage.RecipientType.TO;
   var result = [];
   this.getMimeMessage().getRecipients(type).forEach(function(addr) {
      result.push(addr.toString())
   });
   return result;
};

/**
 * Returns an array containing all CC recipients of this mail
 * @returns An array with all CC recipients of this mail
 * @type Array
 */
Test.SmtpServer.Message.prototype.getCc = function() {
   var type = Packages.javax.mail.internet.MimeMessage.RecipientType.CC;
   var result = [];
   this.getMimeMessage().getRecipients(type).forEach(function(addr) {
      result.push(addr.toString())
   });
   return result;
};

/**
 * Returns an array with all reply-to addresses of this mail
 * @returns An array with all reply-to addresses of this mail
 * @type Array
 */
Test.SmtpServer.Message.prototype.getReplyTo = function() {
   var result = [];
   this.getMimeMessage().getReplyTo().forEach(function(addr) {
      result.push(addr.toString())
   });
   return result;
};

/**
 * Returns the encoding of this mail as defined in the "Content-Transfer-Encoding"
 * header field
 * @returns The encoding of this mail
 * @type String
 */
Test.SmtpServer.Message.prototype.getEncoding = function() {
   return this.getMimeMessage().getEncoding();
};

/**
 * Returns the subject of this mail
 * @returns The subject of this mail
 * @type String
 */
Test.SmtpServer.Message.prototype.getSubject = function() {
   return this.getMimeMessage().getSubject();
};

/**
 * Returns the content of this mail
 * @returns The content of this mail
 */
Test.SmtpServer.Message.prototype.getContent = function() {
   return this.getMimeMessage().getContent();
};

/**
 * Returns the content type of this mail as defined in the "Content-Type"
 * header field
 * @returns The content type of this mail
 * @type String
 */
Test.SmtpServer.Message.prototype.getContentType = function() {
   return this.getMimeMessage().getContentType();
};
