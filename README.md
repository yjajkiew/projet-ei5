Node.JS REST server - Arduino
=======================================

1 - Objectives :
----------------
* Code the Arduino to work as needed.
* Build the REST server to interface with the Arduino board with Ethernet Shield.
* It must implement defined interfaces for each sides : Client & Arduino.
* Create client (iOS & JQuery) to work with the server


2 - What it does :
----------------

1. The server handles requests from the client, from URL or POST data ;
2. It firstly checks those requests and builds the appropriate JSON object ;
3. It secondly sends those JSON objects trought TCP to Arduino, and waits for the answer (JSON object) ;
4. It finally sends back the answer to the client.

=> The client use the provided API to interact with the Arduino

3 - How it Works :
------------------
 
We've choosen to separate the server's functionnalities in 3 different 'Layers' :
 * _web.js_ : handle web request ;
 * _metier.js_ (formaly 'service.js') : build JSON from request ;
 * _dao.js_ : Arduino registration & communication ;

The interfaces :
 
1. Interface between REST Server / Arduino :
>   * _To Document_

2. Interface between REST Server / Client Server (public API):
  * The REST server receive request by URL or POST, like this:
    * ‘http://ip:port/server-restServer/arduinos‘
    * ‘http://ip:port/server-restServer/arduinos/cmd_id/arduino_ip/‘ (POST, sending JSON in body)

4 - Authors
-----------
Written by Baptiste Gauduchon and Yann Jajkiewicz, designed for a project in our last year of engineering school.

ISTIA Ei5 AGI 2013-2014
