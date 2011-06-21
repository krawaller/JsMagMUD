"use strict";

/**
  * Communications Server that uses the HTTP protocol
  * @namespace HTTPServer
  */
var HTTPServer = 
{
};

/**
  * Creates an instance of a communications server that uses the
  * HTTP protocol
  * @param {Object} settings The settings to initialize the server with
  */
HTTPServer.createServer = function(settings)
{
	return new this.Server(settings);
};

/**
  * The constructor for the HTTP Game Server
  * @function
  */
HTTPServer.Server = require("./HTTPServer/Server");

/**
  * The constructor for the HTTP Game Server client
  * @function
  */
HTTPServer.Client = require("./HTTPServer/Server");

module.exports = HTTPServer;
