Project : Node.JS REST server - Arduino
=======================================

1 - Objectives :
----------------
Code the Arduino to work as needed.

Build the REST server to interface with the Arduino board with Ethernet Shield, and the client server wich provide the client-facing UI.

It must implement defined interfaces for each sides : Client & Arduino.


2 - What it do :
----------------

1. The server Handle request from the client, from URL or POST data ;
2. It firstly check thoose request and build the appropriated JSON object ;
3. It secondly send thoose JSON object trought TCP to Arduino, and wait for the answer (JSON object) ;
4. It finally send back the answer to the client.


3 - How it Works :
------------------
**Work in progress**
 
We've choosen to separate the server's functionnality in 3 different 'Layers' :
 * 'web.js' : handle web request ;
 * 'metier.js' (formaly 'work.js') : build JSON from request ;
 * 'dao.js' : Arduino registration & communication ;

The interfaces :
 
1. Interface between REST Server / Arduino :
  * TO DO

2. Interface between REST Server / Client Server :
  * The REST server receive request by URL or POST, like this :
    * http://ip:port/server-restServer/arduinos (URL)
    * http://ip:port/server-restServer/arduinos/cmd_id/arduino_ip/ (POST, sending JSON table formated)
 

4 - Authors
-----------
Written by Baptiste Gauduchon and Yann Jajkiewicz, designed for a project in our last year of engineering school.

ISTIA Ei5 AGI 2013-2014
