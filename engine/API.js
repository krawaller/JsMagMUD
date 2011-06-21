/**
  * The system framework API in a single spot so that
  * the individual components do not need to require'ed
  * @namespace
  */
var API = 
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
	, FS: require("fs")
	
	/**
	  * Provides basic path functionality
	  */
	, Path: require("path")
}

module.exports = API;
