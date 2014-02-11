//***************//
// Arduino CLASS //
//***************//
//-> an arduino object, contaninig propeties and methodes



/////////////////
// CONSTRUCTOR //
/////////////////

function Arduino(id, mac, port, desc) {
  // Initialize all instance properties
  this.id = id;
  this.mac = mac;
  this.port = port;
  this.desc = desc;
}


/////////////
// GETTERS //
/////////////

Arduino.prototype.getId = function(){
  return this.id;
};

Arduino.prototype.getMacAddress = function(){
  return this.mac;
};

Arduino.prototype.getPort = function(){
  return this.port;
};

Arduino.prototype.getDescription = function(){
  return this.desc;
};


//////////////
// METHODES //
//////////////

Arduino.prototype.toString = function() {
  var string = '{ id:' + this.id + ' mac:' + this.mac + ' port:' + this.port + ' desc:' + this.desc + ' }';
  return string;
};


////////////
// EXPORT //
////////////
module.exports = Arduino;