"use strict";

//System and File I/O modules
var _eventEmitter = require("events").EventEmitter;

//Engine modules

/**
  * The base component class, providing the core functionality for all
  * components
  * @constructor
  */
function Component(settings)
{
	this.name = "Base Component";
	this.type = "Component";

	//Save the settings as a read-only property of the object
	Object.defineProperty(this, "Settings",
		{
			value: settings
			, enumerable: true
			, configurable: false
			, writable: false
		});
}

/**
  * Sets the Entity that contains this component
  * @param {Object} entity An instance of an Entity to set or null if the
  * component is to be removed from its current entity
  */
Component.prototype.setEntity = function(entity)
{
	if(entity !== null 
		&& !(entity instanceof Object))
	{
		var err = new TypeError("Expected an Entity object or null");
		this.emit("error", {sender: this, error: err});
	}

	//Unbind any event listeners
	if(this.entity)
		this.unbindEvents();

	//Delete the entity reference
	delete this.entity;

	//Redefine the entity property
	if(entity)
	{
		Object.defineProperty(this, "entity", 
			{
				value: entity
				, enumerable: false
				, configurable: true
				, writable: false
			});
	
		//Bind the event listeners
		this.bindEvents();
	}
}

/**
  * Called when the component should unbind any event handlers
  */
Component.prototype.unbindEvents = function()
{
}

/**
  * Called when the component should bind to any events it is interested
  * in listening to.
  */
Component.prototype.bindEvents = function()
{
}

module.exports = Component;
