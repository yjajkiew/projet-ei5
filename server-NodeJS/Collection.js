exports.collection = function()
{
	// properties
	this.count=0;
	this.collection=[];

	// methodes
	this.add = function(key,item) {
		if( this.collection[key] != undefined ) return undefined;
		this.collection[key] = item;
		return ++this.count;
	}
	
	this.remove = function(key) {
		if( this.collection[key] == undefined ) return undefined;
		delete this.collection[key];
		return --this.count;
	}
	
	this.item = function(key)	{
		if( this.collection[key] == undefined ) return undefined;
		return this.collection[key];
	}
 
	this.forEach = function(block) {
		for ( key in this.collection ) 
		{
			if(this.collection.hasOwnProperty(key)) block(this.collection[key]);
		}
	}
}
