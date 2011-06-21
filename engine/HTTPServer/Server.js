"use strict";

//System and File I/O modules
var _sys = require("../System");
var _util = _sys.Util;
var _fileSystem = _sys.FileSystem;
var _path = _sys.Path;
var _eventEmitter = _sys.EventEmitter;

//Networking modules
var _url = _sys.URL;
var _http = _sys.HTTP;
var _socketIO = _sys.SocketIO;

//Game Engine Modules
var Client = require("./Client");

//Module Level Variables
var _defaultOptions = 		//Default server variables
{
	port: 80
	, basePath: ""
	, defaultFile: ""
	, log: _util.print
}
var _httpMethods = ["GET", "POST"];

//Load in known mime-types
var _mimeTypes = {};
_fileSystem.readFile(_path.resolve(__dirname, "mime-types.json"), function(err, data)
{
	if(err)
		throw err;
		
	_mimeTypes = JSON.parse(data);
});

//Module Level Functions
//These funtions are hidden from any external objects
/**
  * Sends a resource to the requesting client
  * @private
  */
function sendResource(resourcePath, response)
{
	//Read in the file and send back the data
	_fileSystem.readFile(resourcePath, function(err, data)
	{
		//Uh-oh, something went wrong and we don't know what it was
		if(err)
		{
			response.writeHead(500, "Server encountered an error");
			response.write(err.toString());
			response.end();
			return;
		}

		//Get the mime type
		var mime_type = _mimeTypes[_path.extname(resourcePath)];
		if(mime_type !== undefined)
			response.setHeader("Content-Type", mime_type);

		response.writeHead(200, "OK");
		response.write(data);
		response.end();
	});
}

/**
  * Handles a single HTTP request
  *	@param {Object} request The HTTP request object
  *	@param {Object} response The HTTP response object 
  * @inner
  */
function onHTTPRequest(request, response)
{
	//If the HTTP method isn't an HTTP method supported
	//then return the standard 405 error with methods
	//supported
	if(_httpMethods.indexOf(request.method.toUpperCase()) == -1)
	{
		response.setHeader("Allow", _httpMethods.join(","));
		response.writeHead(405, "Method not allowed");
		return;
	}
	

	//Get the path name of the file requested
	var path = _url.parse(request.url).pathname;

	//If the path is the root directory, default to the 
	//default resource specified in the options
	if(path == "/")
		path = this.Settings.defaultFile;
	
	//Resolve the path to be relative to this executing file
	path = _path.join(this.Settings.basePath, path);

	//Check to see if the file being requested exists
	_path.exists(path, function(fileExists)
	{
		//The file doesn't exist, send back a standard 404 error.
		if(!fileExists)
		{
			response.writeHead(404, "File not found");
			response.end();
			return;
		}
		
		//Everything looks ok, send the resource to the client
		sendResource(path, response);
	});
}

/**
  * Callback function that handles when a client connects to the server
  * @inner
  */
function onClientConnect(socket)
{	
	//Create a new client
	var client = new Client(this, socket);
	this.addClient(client);

	//Create a new Client object
	this.emit("clientConnected", client);
}

/**
  * Game Server that uses the HTTP protocol for communications
  * @constructor
  * @extends EventEmitter
  * @memberOf HTTPServer
  */
function Server(settings)
{
	//Call the base constructor
	_eventEmitter.call(this);

	//Set the default variables
	var options = Object.create(_defaultOptions);

	//Update the server options
	if(settings != null)
	{
		var key = "";
		for(key in settings)
			options[key] = settings[key];
	}
	
	//Save the settings as a read-only property of the object
	Object.defineProperty(this, "Settings",
		{
			value: options
			, enumerable: true
			, configurable: false
			, writable: false
		});
	
	Object.defineProperty(this, "Clients",
		{
			value: {}
			, enumerable: false
			, configurable: false
			, writable: false
		});
}

//Define the prototype to be the _eventEmitter class
Server.prototype = new _eventEmitter();

/**
  * Starts listening on a port for incoming connections
  * @param {Object} options
  * Settings for the server
  */
Server.prototype.start = function()
{
	var self = this;

	//Create the actual HTTP server with a callback to 
	//the onHTTPRequest function
	var server = _http.createServer();
	server.on("request", function(request, response) { onHTTPRequest.call(self, request, response); });

	//Create the Socket.IO object and assign it to the HTTP server
	//with a callback to the onClientConnect function
	var socketio = _socketIO.listen(server, {log: function(message){self.log(message);} });
	socketio.on("clientConnect", function(client) { onClientConnect.call(self, client); });

	//Remeber the objects
	Object.defineProperty(this, "HTTPServer", {value: server, enumerable: false});
	Object.defineProperty(this, "SocketIO", {value: socketio, enumerable: false});

	self.log("Listening on port " + this.Settings.port);
	//Start listening for connections
	server.listen(this.Settings.port);
}

/**
  * Writes a message to a log
  * @param {String} message The message to write to the log file
  * @private
  */
Server.prototype.log = function(message)
{
	this.emit("log", message);
}

/**
  * Returns a client object based on a unique ID
  * @param {string} clientID The using Client ID
  */
Server.prototype.getClient = function(clientID)
{
	var client = this.Clients[clientID];
	
	if(!client)
		return null;

	return client;
}

/**
  * Adds a client to the list of clients managed by this server
  * @param {Object} client The client object to remove
  */
Server.prototype.addClient = function(client)
{
	if(client == null)
		throw new TypeError();

	//First make sure this client isn't already in the list
	if(this.getClient(client.ID) != null)
		return;

	this.Clients[client.ID] = client;
}

/**
  * Removes a client to the list of clients managed by this server
  * @param {Object} client The client object to remove
  */
Server.prototype.removeClient = function(client)
{
	if(!client || !client.ID)
		return;

	var client_id = client.ID;
	delete this.Clients[client_id]
}

/**
  * Sends a message to all clients
  * @param {String} message The message to send to all the clients
  */
Server.prototype.broadcast = function(message)
{
	var client_id = "";
	var client;

	for(client_id in this.Clients)
	{
		client = this.Clients[client_id];
		client.send(message);
	}
}

module.exports = Server;
