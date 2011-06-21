/**
  * The base system framework API in a single spot so that
  * the individual components do not need to require'ed.
  * This also abstracts the actual libraries used in case
  * the core system changes
  * @namespace
  */
var System = 
{
	/**
	  * Provides general utility functionality like console printing
	  * and object inspection.
	  */
	Util: require("util")
	
	/**
	  * Constructor for the Event Emitter object
	  */
	, EventEmitter: require("events").EventEmitter
	
	/**
	  * Provides file system functionality
	  */
	, FileSystem: require("fs")
	
	/**
	  * Provides basic path functionality
	  */
	, Path: require("path")
	
	/**
	  * Provides HTTP Server functionality
	  */
	, HTTP: require("http")
	
	/**
	  * Provides URL parsing/processing functionality
	  */
	, URL: require("url")
	
	/**
	  * Provides real-time/bi-directional HTTP functionality
	  */
	, SocketIO: require("socket.io")
}

module.exports = System;
