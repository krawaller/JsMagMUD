//System and File I/O modules
var _sys = require("../System");
var _eventEmitter = _sys.EventEmitter;

/** 
  * A client class using the HTTP protocol for communcation between the
  * game engine and the user
  * @constructor
  * @param {Object} server the Server that created this client
  * @param {Object} socket the Socket.IO client connection
  * @extends EventEmitter
  * @memberOf HTTPServer
  */
function Client(server, socket)
{
	//Call the base-class constructor
	_eventEmitter.call(this);

	Object.defineProperty(this, "Socket", 
		{
			value: socket
			, enumerable: false
			, configurable: false
			, writable: false
		});

	Object.defineProperty(this, "Server", 
		{
			value: server
			, enumerable: false
			, configurable: false
			, writable: false
		});

	Object.defineProperty(this, "ID", 
		{
			get: function(){ return socket.sessionId; }
			, enumerable: false
			, configurable: false
		});

	//Bind socket events
	var self = this;
	socket.on("message", function(message)
	{
		message.source = self;
		self.processMessage(message); 
	});
	
	socket.on("disconnect", function()
	{
	});
	
	//Send a message back to the client letting them know their session ID
	this.send({type: "sessionID", data: socket.sessionId});
}
Client.prototype = new _eventEmitter();

/**
  * Sends a message to the user
  * @param message The message to be sent to the user.  Can be an object
  * or a string
  */
Client.prototype.send = function(message)
{
	this.Socket.send(message);
}

/**
  * Closes the connection to the user
  */
Client.prototype.disconnect = function()
{
	this.Socket._onDisconnect();
	this.emit("disconnected", message);
}

/**
  * Handles a single message, usually sent by the user
  */
Client.prototype.processMessage = function(message)
{
	this.emit("message", message);
}

module.exports = Client;
