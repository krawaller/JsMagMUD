"use strict";

//System and File I/O modules
var _util = require("util");
var _eventEmitter = require("events").EventEmitter;
var _path = require("path");
var _vm = require("vm");

//Game modules

/**
  * Provides a safe environment for script code to run in
  * @extends EventEmitter
  * @constructor
  */
function Compiler(settings)
{
	_eventEmitter.call(this);
	
	//Save the settings as a read-only property of the object
	Object.defineProperty(this, "Settings",
		{
			value: settings
			, enumerable: false
			, configurable: false
			, writable: false
		});
	
	//Load up the sandbox class
	var sandbox_ctor = require(settings.sandbox);
	var sandbox = new sandbox_ctor(settings.sandboxSettings);
	Object.defineProperty(this, "Sandbox",
		{
			value: sandbox
			, enumerable: true
			, configurable: false
			, writable: false
		});

}
Compiler.prototype = new _eventEmitter();

/**
  * Compiles and runs a piece of JavaScript code in the context of the sandbox
  * @param {String} scriptCode The JavaScript code to compile
  * @param {String} [fileName] The filename to use as the source of the script code.  If not specified
  * 'anonymous' is used
  * @returns Returns the 'exports' member of the sandbox.  If an error occured, then it returns 'undefined'.
  */
Compiler.prototype.executeScript = function(scriptCode, fileName)
{
	try
	{
		var script = this.compileScript(scriptCode, fileName);

		if(!script)
			throw new Error("Error compiling the script");

		//Create a sandbox instance and execute the code in that sandbox
		var sandbox = Object.create(this.Sandbox);
		script.runInNewContext(sandbox);

		return sandbox.exports;
	}
	catch(err)
	{
		//Emit that there was an execution error
		this.emit("executeError", err, scriptCode, fileName);
		return undefined;
	}
}

/**
  * Compiles, but does not run, a piece of JavaScript code in the context of this Compiler
  * @param {String} scriptCode The JavaScript code to compile
  * @param {String} [fileName] The filename to use as the source of the script code.  If not specified
  * 'anonymous' is used
  * @returns Returns an instance of the Node.js vm.Script object.  If an error occured, then it returns 'undefined'.
  */
Compiler.prototype.compileScript = function(scriptCode, fileName)
{
	try
	{
		//Modify the fileName so that it can be properly tracked in case there is an error
		if(!fileName)
			fileName = "[anonymous]";
		else
			fileName = "[game]" + fileName;
	
		//Create a Script object of the code.
		return _vm.createScript(scriptCode, fileName);
	} 
	catch(err)
	{
		//Emit that there was a compilation error
		this.emit("compileError", err, scriptCode, fileName);
		return undefined;
	}
}

module.exports = Compiler;
