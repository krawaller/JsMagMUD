"use strict";

//System and File I/O modules
var _util = require("util");
var _fs = require("fs");
var _path = require("path");

//Game engine modules

//Module Level Functions and Variables
var _settings = {};

/**
  * Manages all file system calls and resolves all paths to a base directory
  * @extends EventEmitter
  * @constructor
  */
function LocalFS(settings)
{
	//Save the settings as a read-only property of the object
	_settings = settings;
}


/**
  * Resolves a game-specific path to an absolute path
  * @param {String} localPath The game specific path
  * @private
  */
function resolveToAbsolute(localPath)
{
	//First resolve the local path to prevent anyone from trying to access resources
	//outside of the base path.
	localPath = this.resolve("/", localPath);

	//Return the base path + the new local path
	return _path.join(_settings.basePath, localPath);
}

/**
  * Gets the information about a specific path
  * @param {String} path The game-specific path to read
  * @param {Function} callback The function to call when the information about the path is available.
  */
LocalFS.prototype.getFileInfo = function(path, callback)
{
	path = resolveToAbsolute(path);
	_fs.stat(path, callback);
}

/**
  * Determines if a path exists
  * @param {String} path The game-specific path to check
  * @param {Function} callback The function to call with the results
  */
LocalFS.prototype.pathExists = function(path, callback)
{
	path = resolveToAbsolute(path);
	_path.exists(path, callback);
}

/**
  * Reads the contents of a directory
  * @param {String} filePath The game-specific path of the directory to read
  * @param {Function} callback The function to call when reading the directory is complete.
  */
LocalFS.prototype.readDirectory = function(directoryPath, callback)
{
	directoryPath = resolveToAbsolute(directoryPath);
	_fs.readdir(directoryPath, callback);
}

/**
  * Reads a file
  * @param {String} filePath The game-specific path of the file to read
  * @param {Function} callback The function to call when reading the file is completed.  
  */
LocalFS.prototype.read = function(filePath, callback)
{
	filePath = resolveToAbsolute(filePath);
	_fs.readFile(filePath, callback);
}

/**
  * Writes a file
  * @param {String} filePath The game-specific path of the file to write
  * @param {Function} callback The function to call when writing the file is completed.  
  */
LocalFS.prototype.write = function(filePath, data, callback)
{
	filePath = resolveToAbsolute(filePath);
	_fs.writeFile(filePath, data, callback);
}

/**
  * Resolves the parameters into a single path
  */
LocalFS.prototype.resolve = function()
{
	//Convert the 'arguments' object into an array
	var paths = [];
	var key = "";
	
	for(key in arguments)
		paths.push(arguments[key]);

	return _path.resolve.apply(_path, paths);
}

module.exports = LocalFS;
