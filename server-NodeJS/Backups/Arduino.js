//***************//
// Arduino CLASS //
//***************//
//-> an arduino object, contaninig propeties and methodes


/////////////////
// CONSTRUCTOR //
/////////////////

function Arduino(ip, port, mac, id, desc) {
  // Initialize all properties (automagicaly instanciated by JS)
  this.ip = ip;
  this.port = port;
  this.mac = mac;
  this.id = id;
  this.desc = desc;
}


/////////////
// GETTERS //
/////////////

Arduino.prototype.getIp = function(){
  return this.ip;
};

Arduino.prototype.getPort = function(){
  return this.port;
};

Arduino.prototype.getMacAddress = function(){
  return this.mac;
};

Arduino.prototype.getId = function(){
  return this.id;
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

// the constructor
module.exports = Arduino;