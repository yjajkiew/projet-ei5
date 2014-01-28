#include <SPI.h>
#include <Ethernet.h>
#include <aJSON.h>
// ---------------------------------- CONFIGURATION DE L'ARDUINO DUEMILANOVE
// adresse MAC de l'Arduino DUEMILANOVE
byte macArduino[] = { 0x90, 0xA2, 0xDA, 0x00, 0x1D, 0xA7 };
String strMacArduino="90:A2:DA:00:1D:A7";
IPAddress ipArduino(192,168,2,3); // l'adresse IP de l'Arduino
String idArduino="192.168.2.3"; // son identifiant=IP
String descriptionArduino="Uno_Projet5"; // description de l'Arduino
int portArduino=102; // port du serveur Arduino // le serveur Arduino travaillera sur le port 102
EthernetServer server(portArduino);
IPAddress ipServeurEnregistrement(192,168,2,1); // IP du serveur d'enregistrement
int portServeurEnregistrement=100; // port du serveur d'enregistrement
EthernetClient clientArduino; // le client Arduino du serveur d'enregistrement

// initialisation
void setup() {
  // Le moniteur série permettra de suivre les échanges
  Serial.begin(9600);
  Ethernet.begin(macArduino,ipArduino); // démarrage de la connection Ethernet
  Serial.print(F("Memoire disponible : ")); // mémoire disponible
  Serial.println(freeRam());
}

// boucle infinie
void loop()
{
  boolean enregistrementFait=false;
  // tant que l'arduino ne s'est pas enregistré auprès du serveur, on ne peut rien faire
  while(!enregistrementFait){
    // on se connecte au serveur d'enregistrement
    Serial.println(F("Connexion au serveur d'enregistrement..."));
    if (connecte(&clientArduino,&ipServeurEnregistrement,&portServeurEnregistrement)) {
      // suivi
      Serial.println(F("Connecte..."));
      // on envoie l'adresse Mac de l'Arduino, une description de ses fonctionnalités, son port de service
      String msg="{\"id\":\""+idArduino+"\",\"desc\":\""+descriptionArduino+"\",\"mac\":\""+strMacArduino+"\",\"port\":"+portArduino+"}";
      clientArduino.println(msg);
      Serial.print(F("enregistrement : "));
      Serial.println(msg);
      enregistrementFait=true; // enregistrement fait 
      delay(1);
      clientArduino.stop(); // on ferme la connexion
      Serial.println(F("Enregistrement termine..."));
    }
    else {
      Serial.println(F("Echec de la connexion..."));
    }
  }

    // suivi
  Serial.print(F("Demarrage du serveur sur l'adresse IP "));
  Serial.print(Ethernet.localIP());
  Serial.print(F(" et le port "));
  Serial.println(portArduino);
  // on lance le serveur
  server.begin();
  // mémoire disponible
  Serial.print(F("Memoire disponible avant service : "));
  Serial.println(freeRam());
  // on attend indéfiniment les clients
  // on les traite un par un
  while(true){
    Serial.print(F("Memoire disponible avant service : ")); // mémoire disponible
    Serial.println(freeRam());
    // on attend un client
    EthernetClient client=server.available(); 
    while(!client ){
      delay(1);
      client=server.available();
    }
    // si et tant que ce client est connecté
    while(client.connected()){
      Serial.println(F("client connecte..."));
      // mémoire disponible
      Serial.print(F("Memoire disponible debut boucle : "));
      Serial.println(freeRam());
      // on lit la commande de ce client
      String commande=lireCommande(&client);
      // suivi
      Serial.print(F("commande : ["));
      Serial.print(commande);
      Serial.println(F("]"));
      // si la commande est vide, on ne la traite pas
      if(commande.length()==0) continue;
      // sinon on la traite
      traiterCommande(&client,&commande);
      // mémoire disponible
      Serial.print(F("Memoire disponible fin boucle : "));
      Serial.println(freeRam());
      // on passe à la commande suivante
      delay(1);
    }
    // on est déconnecté - on passe au client suivant
    Serial.println(F("client deconnecte..."));
    client.stop();
    // mémoire disponible
    Serial.print(F("Memoire disponible fin service : "));
    Serial.println(freeRam());
  }
  // on ne rebouclera jamais sur le loop (normalement)
  Serial.println(F("loop"));

}

// traitement d'une commande
void traiterCommande(EthernetClient *client, String *commande){
  // on décode la commande pour voir quelle action est demandée
  int l = (*commande).length();
  char cmd[l+1];
  (*commande).toCharArray(cmd, l+1);
  // on parse la commande JSON
  aJsonObject *json = aJson.parse(cmd);
  
  // pb ?
  if(json==NULL){
    sendReponse(client,reponse(NULL,"100",NULL));
    return;
  }

  // attribut id
  aJsonObject *id = aJson.getObjectItem(json, "id");
  if(id==NULL){
    // suppression json
    aJson.deleteItem(json);
    // on envoie la réponse
    sendReponse(client,reponse(NULL,"101",NULL));
    // retour
    return;
  }
  // on mémorise l'id
  //int index = String(id->valuestring).lastIndexOf('.');
  char *strId = id->valuestring;
  
  // attribut action
  aJsonObject *action = aJson.getObjectItem(json, "ac");
  if(action==NULL){
    // suppression json
    aJson.deleteItem(json);
    // on envoie la réponse
    sendReponse(client,reponse(NULL,"102",NULL));
    // retour
    return;
  }
  // on mémorise l'action
  char *strAction = action->valuestring; 
  
  // on récupère les parametres
  aJsonObject *parametres = aJson.getObjectItem(json, "pa");
  if(parametres==NULL){
    // suppression json
    aJson.deleteItem(json);
    // on envoie la réponse
    sendReponse(client,reponse(NULL,"103",NULL));
    // retour
  return;
  }
  
  // c'est bon - on traite l'action
  //echo
  if(strcmp("ec",strAction)==0){
    // traitement
    doEcho(client, strId);
    // suppression json
    aJson.deleteItem(json);
    // retour
    return;
  }
  
  // clignotement
  if(strcmp("cl",strAction)==0){
    // traitement
    doClignoter(client,strId,parametres);
    // suppression json
    aJson.deleteItem(json);
    // retour
    return;
  }
  
  // pinWrite
  if(strcmp("pw",strAction)==0){
    // traitement
    doPinWrite(client,strId,parametres);
    // suppression json
    aJson.deleteItem(json);
    // retour
    return;
  }
  
  // pinRead
  if(strcmp("pr",strAction)==0){
    // traitement
    doPinRead(client,strId,parametres);
    // suppression json
    aJson.deleteItem(json);
    // retour
    return;
  }
  
  // ici, l'action n'est pas reconnue
  // suppression json
  aJson.deleteItem(json);
  // réponse
  sendReponse(client, reponse(strId,"104",NULL));
  // retour
  return;
}
  
  // connexion au serveur
int connecte(EthernetClient *client, IPAddress *serveurIP, int *serveurPort) {
  delay(1000); // on se connecte au serveur après 1 seconde d'attente
  return client->connect(*serveurIP, *serveurPort);
}
  
// lecture d'une commande du serveur
String lireCommande(EthernetClient *client){
  String commande = "";
  while(client->available()) {
    char c = client->read();
    commande += c;
  }
  return commande; // on rend la commande
}

// formatage json de la réponse au client
String reponse(String id, String erreur, String etat){
  // chaîne json de la réponse au client
  // attribut id
  if(id==NULL) id="";
  // attribut erreur
  if(erreur==NULL) erreur="";
  // attribut etat - pour l'instant dictionnaire vide
  if(etat==NULL) etat="{}";
  
  // construction de la réponse
  String reponse="{\"id\":\""+id+"\",\"er\":\""+erreur+"\",\"et\":"+etat+"}";
  // résultat
  return reponse;
}

// echo
void doEcho(EthernetClient *client, char * strId){
  sendReponse(client, reponse(strId,"0",NULL)); // on fait l'écho
}

//clignoter
void doClignoter(EthernetClient *client,char * strId, aJsonObject* parametres){
  // exploitation des parametres
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    // réponse d'erreur 201
    sendReponse(client, reponse(strId,"201",NULL));
    return;
  }
  // valeur de la pin à eteindre
  int led = atoi(pin->valuestring);
  //paramètre pin non numérique ou hors des limites: erreur 202
  if(!isValidNumber(pin) || led < 0 || led > 13) {
    sendReponse(client, reponse(strId,"202",NULL));
    return;
  }
  Serial.print(F("clignoter led="));
  Serial.println(led);

  // il faut la durée d'un clignotement
  aJsonObject *dur = aJson.getObjectItem(parametres, "dur");
  if(dur==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"203",NULL));
    return;
  }
  // valeur de la durée
  int duree = atoi(dur->valuestring);
  //paramètre durée non numérique ou non supérieur à 0: erreur 204
  if(!isValidNumber(dur) || duree < 1) {
    sendReponse(client, reponse(strId,"204",NULL));
    return;
  }
  Serial.print(F("duree="));
  Serial.println(duree);

  // il faut le nombre de clignotements
  aJsonObject *nb = aJson.getObjectItem(parametres, "nb");
  if(nb==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"205",NULL));
    return;
  }
  // valeur du nombre de clignotements
  int nbClignotements = atoi(nb->valuestring);
  //paramètre nb non numérique ou non supérieur à 0: erreur 206
  if(!isValidNumber(nb) || nbClignotements < 1) {
    sendReponse(client, reponse(strId,"206",NULL));
    return;
  }
  Serial.print(F("nb="));
  Serial.println(nbClignotements);

  // on rend la réponse tout de suite
  sendReponse(client, reponse(strId,"0",NULL));
  // on opère le clignotement
  pinMode(led, OUTPUT);  
  for(int i=0; i < nbClignotements; ++i) {
    digitalWrite(led, HIGH);   
    delay(duree);               
    digitalWrite(led, LOW);  
    delay(duree);              
  }
}

// pinWrite
void doPinWrite(EthernetClient *client, char * strId, aJsonObject* parametres){
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    sendReponse(client, reponse(strId,"301",NULL)); // réponse d'erreur
    return;
  }
  // numéro de la pin à écrire
  int pin2 = atoi(pin->valuestring);
  // suivi
  Serial.print(F("pw pin="));
  Serial.println(pin2);
  // il faut une valeur
  aJsonObject *val = aJson.getObjectItem(parametres, "val");
  if(val==NULL){
    sendReponse(client, reponse(strId,"302",NULL)); // réponse d'erreur
    return;
  }
  // valeur à écrire
  int val2 = atoi(val->valuestring);

  // suivi
  Serial.print(F("pw val="));
  Serial.println(val2);
  // il faut un mode d'écriture
  aJsonObject *mod = aJson.getObjectItem(parametres, "mod");
  if(mod==NULL){
      sendReponse(client, reponse(strId,"303",NULL)); // réponse d'erreur
      return;
  }
  
  char* mod2 = mod->valuestring;
  
  // le mod doit être a (analogique) ou b (binaire)
  if(strcmp(mod2,"b")!=0 && strcmp(mod2,"a")!=0){
    sendReponse(client, reponse(strId,"304",NULL)); // réponse d'erreur
    return;
  }
  //paramètre pin non numérique ou pas dans les bornes (selon mode binaire ou analogique): erreur 305
  if(!isValidNumber(pin) || (strcmp(mod2, "b")==0 && (pin2 < 0 || pin2 > 13)) || (strcmp(mod2, "a")==0 && (pin2 < 0 || pin2 > 5)) ) {
    sendReponse(client, reponse(strId,"305",NULL)); // réponse d'erreur
    return;
  }
  //paramètre val non numérique ou pas dans les bornes (selon mode binaire ou analogique): erreur 306
  if(!isValidNumber(val) || (strcmp(mod2, "b")==0 && (val2 < 0 || val2 > 1)) || (strcmp(mod2, "a")==0 && (val2 < 0 || val2 > 255)) ) {
    sendReponse(client, reponse(strId,"306",NULL)); // réponse d'erreur
    return;
  }
  
  // c'est bon pas d'erreur
  sendReponse(client,reponse(strId,"0",NULL));
  // suivi
  Serial.print(F("pw mod="));
  Serial.println(mod2);
  // on écrit sur la pin
  pinMode(pin2, OUTPUT);
  if(strcmp(mod2, "b")==0) {
    if(val2) digitalWrite(pin2, HIGH);
    else digitalWrite(pin2, LOW);
  }
  else analogWrite(pin2, val2);
}
    
//pinRead
void doPinRead(EthernetClient *client,char * strId, aJsonObject* parametres){
  // exploitation des parametres
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"401",NULL));
    return;
  }
  // numéro de la pin à lire
  int pin2 = atoi(pin->valuestring);
  // suivi
  Serial.print(F("pr pin="));
  Serial.println(pin2);
  // il faut un mode d'écriture
  aJsonObject *mod = aJson.getObjectItem(parametres, "mod");
  if(mod==NULL){
    sendReponse(client, reponse(strId,"402",NULL)); // réponse d'erreur
    return;
  }
  char* mod2 = mod->valuestring;
  
  // ce doit être a (analogique) ou b (binaire)
  if(strcmp(mod2,"a")!=0 && strcmp(mod2,"b")!=0){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"403",NULL));
    return;
  }
  
  //paramètre pin non numérique ou hors des limites: erreur 404
  if(!isValidNumber(pin) || (strcmp(mod2, "b")==0 && (pin2 < 0 || pin2 > 13)) || (strcmp(mod2, "a")==0 && (pin2 < 0 || pin2 > 5)) ) {
    sendReponse(client, reponse(strId,"404",NULL)); // réponse d'erreur
    return;
  }
  // c'est bon pas d'erreur
  // suivi
  Serial.print(F("pr mod="));
  Serial.println(mod2);
  // on lit la pin
  pinMode(pin2, INPUT); 
  int valeur;
  if(strcmp(mod2,"b") == 0) valeur = digitalRead(pin2);
  else valeur = analogRead(pin2);
  // on rend le résultat
  String json="{\"pin"+String(pin2)+"\":\""+valeur+"\"}";
  sendReponse(client, reponse(strId,"0",json));
}

// envoi réponse au client
void sendReponse(EthernetClient *client, String message){
  //Serial.print(F("Memoire disponible : ")); // mémoire disponible
  //Serial.println(freeRam());
  // envoi de la réponse
  client->println(message);
  // suivi
  Serial.print(F("reponse="));
  Serial.println(message);
}

//vérifie que la valeur json en paramètre est numérique
boolean isValidNumber(aJsonObject *json) {
   boolean isNum = false;
   for(byte i=0; i < String(json->valuestring).length(); ++i) {
     isNum = isDigit(String(json->valuestring).charAt(i));
     if(!isNum) return false;
   }
   return isNum; 
}

// mémoire libre
int freeRam ()
{
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}
