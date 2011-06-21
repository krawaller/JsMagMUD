"use strict";

//System and File I/O modules
var _util = require("util");
var _path = require("path");
var _fileSystem = require("fs");
var _eventEmitter = require("events").EventEmitter;

//Module Level Variables and Functions

/**
 * Loads the namespace components into the sandbox
 * @param {Object[]} components An array of component settings to load into
 * the sandbox
 */
function loadNamespaceComponents(components)
{
	//Loop through the array of components and add them to the list
	if(!(components instanceof Array))
		return;

	var idx = 0;
	var settings, component, constructor;
	for(idx = 0; idx < components.length; idx++)
	{
		settings = components[idx];
		
		//Create the object
		constructor = require(settings.path);
		component = new constructor(settings);
		
		//Add the component to the Namespace object
		addNamespaceComponent(this.Namespace, settings.name, component);
	}
}

/**
  * Adds a component to a target
  * @param {Object} target The object to define the namespace in
  * @param {String} namespace The namespace path
  * @param {Object|Function} component The component to add to the namespace
  */
function addNamespaceComponent(target, namespace, component)
{
	var levels = namespace.split(".");
	var key = levels.shift();
	
	while(levels.length)
	{
		if(!(target[key] instanceof Object))
			target[key] = {};
		
		target = target[key];
		key = levels.shift();
	}

	target[key] = component;
}

/**
  * Returns the object matching the namespace passed
  * @param {Object} root The root object to start looking at.
  * @param {String[]} namespaceLevels The different levels of the namespace to query
  * @inner
  */
function resolveNamespace(root, namespaceLevels)
{
	var namespace = namespaceLevels.shift();
	
	while(namespaceLevels.length && root)
	{
		root = root[namespace];
		namespace = namespaceLevels.shift();
	}
	
	if(!root)
		return undefined;
	
	return root[namespace];
}

/**
  * Provides a safe environment for game code to run in
  * @param {String} componentsPath the path to load the sandbox components
  * from
  * @constructor
  * @extends EventEmitter
  */
function Sandbox(settings)
{
	_eventEmitter.call(this);
	Object.defineProperty(this, "exports",
		{
			value: {}
			, enumerable: true
			, configurable: true
			, writable: true
		});

	//Rebuild the namespace
	var namespace = {};
	Object.defineProperty(this, "Namespace",
		{
			value: namespace
			, enumerable: false
			, configurable: false
			, writable: false
		});

	//Load up the components for the sandbox
	loadNamespaceComponents.call(this, settings.components);
}
Sandbox.prototype = new _eventEmitter();

/**
  * Provides the ability to pull in other code modules into the current script
  * @param {string} moduleID The module identifier.
  */
Sandbox.prototype.require = function(moduleID)
{
	if(!moduleID || moduleID.length == 0)
		throw new TypeError("Expected a string value.");

	//Check to see if they specified a namespace.  Namespaces are 
	//defined by the pattern #NameSpace1.NameSpace2.NameSpaceN
	if(moduleID.charAt(0) === "#")
	{
		//Strip out the # and split the string based on .
		var namespace_levels = moduleID.substr(1).split(".");

		//Resolve the namespace and return the matching object.
		return resolveNamespace(this.Namespace, namespace_levels);
	}

	//Check to see if the script file exists using the sandboxed filesystem
	var fs = this.Namespace.System.FileSystem;	
	fs.pathExists(moduleID, function(exists)
	{
		if(!exists)
		{
			this.emit("error.sandbox.require", moduleID);
			return undefined;
		}
	
		//Load up the file script
		fs.read(moduleID, function(err, scriptCode)
		{
			if(err)
				throw err;

			//Compile and execute the code
			return Engine.Compiler.executeScript(scriptCode);
		});
	});
}

/**
  * Copies all the enumerable members of the source objects to the target object
  * @param {Object} target The object to copy the source objects' members to
  */
Sandbox.prototype.merge = function(target)
{
	var objs = [];
	var key = "";
	
	if(!target)
		target = {};
	
	//Get the additional optional parameters after 'target' and put them in an array
	var skip = true;
	for(key in arguments)
	{
		if(!skip)
			objs.push(arguments[key]);
		else
			skip = false;
	}

	var source;
	while(objs.length)
	{
		//Get the first object in the array
		source = objs.shift();

		//Copy all the members in source to the target
		for(key in source)
			target[key] = source[key];
	}
}


exports.createSandbox = function(settings){ return new Sandbox(settings); }
