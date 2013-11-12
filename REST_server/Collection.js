exports.collection = function()
{
	this.count=0;
	this.collection={};
	this.id=0;

	this.add=function(key,item)
	{
		if(this.collection[key]!=undefined) return undefined;
		this.collection[key]=item;
		return ++this.count;
	}
	
	this.remove=function(key)
	{
		if(this.collection[key]==undefined) return undefined;
		delete this.collection[key];
		return --this.count;
	}
	
	this.item=function(key)
	{
		return this.collection[key];
	}
 
	this.forEach=function(block)
	{
		for (key in this.collection) 
		{
			if(this.collection.hasOwnProperty(key)) block(this.collection[key]);
		}
	}
}
