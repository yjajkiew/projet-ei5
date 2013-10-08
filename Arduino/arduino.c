#include <SPI.h>
#include <Ethernet.h>
#include <String.h>
#include <aJSON.h>
// ---------------------------------- CONFIGURATION DE L'ARDUINO DUEMILANOVE
// adresse MAC de l'Arduino DUEMILANOVE
byte macArduino[] = { 0x90, 0xA2, 0xDA, 0x00, 0x1D, 0xA7 };
String strMacArduino="90:A2:DA:00:1D:A7";
IPAddress ipArduino(192,168,2,3); // l'adresse IP de l'Arduino
String idArduino="192.168.2.3"; // son identifiant=IP
String descriptionArduino="duemilanove"; // description de l'Arduino
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
  while(! enregistrementFait){
    // on se connecte au serveur d'enregistrement
    Serial.println(F("Connexion au serveur d'enregistrement..."));
    if (connecte(&clientArduino,ipServeurEnregistrement,portServeurEnregistrement)) {
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
    while(! client ){
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
      traiterCommande(&client,commande);
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
void traiterCommande(EthernetClient *client, String commande){
  // on décode la commande pour voir quelle action est demandée
  int l = commande.length();
  char cmd[l+1];
  commande.toCharArray(cmd, l+1);
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
  char strId[sizeof(id->valuestring)];
  String(id->valuestring).toCharArray(strId, sizeof(strId));
  
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
  //String strAction = action->valuestring;
  char strAction[sizeof(action->valuestring)];
  String(action->valuestring).toCharArray(strAction, sizeof(strAction));

  
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
  // echo
  
  
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
int connecte(EthernetClient *client, IPAddress serveurIP, int serveurPort) {
  // on se connecte au serveur après 1 seconde d'attente
  delay(1000);
  return client->connect(serveurIP, serveurPort);
}
  
  
// lecture d'une commande du serveur
String lireCommande(EthernetClient *client){
  String commande="";
  while((*client).available()) {
    commande += (*client).read();
  }
  // on rend la commande
  return commande;
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
  // on fait l'écho
  sendReponse(client, reponse(strId,"0",NULL));
}

//clignoter
void doClignoter(EthernetClient *client,char * strId, aJsonObject* parametres){
  // exploitation des parametres
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"202",NULL));
    return;
  }
  // valeur de la pin à eteindre
  int led = pin->valueint;
  Serial.print(F("clignoter led="));
  Serial.println(led);
  
  // il faut la durée d'un clignotement
  aJsonObject *dur = aJson.getObjectItem(parametres, "dur");
  if(dur==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"211",NULL));
    return;
  }
  // valeur de la durée
  int duree = dur->valueint;
  Serial.print(F("duree="));
  Serial.println(duree);
  
  // il faut le nombre de clignotements
  aJsonObject *nb = aJson.getObjectItem(parametres, "nb");
  if(nb==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"212",NULL));
    return;
  }
  // valeur du nombre de clignotements
  int nbClignotements = nb->valueint;
  Serial.print(F("nb="));
  Serial.println(nbClignotements);
  
  // on rend la réponse tout de suite
  sendReponse(client, reponse(strId,"0",NULL));
  // on opère le clignotement
  int i = 0;
  pinMode(led, OUTPUT);  
  while(i < nbClignotements) {
    digitalWrite(led, HIGH);   
    delay(duree);               
    digitalWrite(led, LOW);  
    delay(duree);              
    ++i;
  }
}

// pinWrite
void doPinWrite(EthernetClient *client, char * strId, aJsonObject* parametres){
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"201",NULL));
    return;
  }
  // numéro de la pin à écrire
  int pin2 = pin->valueint;
  // suivi
  Serial.print(F("pw pin="));
  Serial.println(pin2);
  // il faut une valeur
  aJsonObject *val = aJson.getObjectItem(parametres, "val");
  if(val==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"202",NULL));
    return;
  }
  // valeur à écrire
  int val2 = val->valueint;
  // suivi
  Serial.print(F("pw val="));
  Serial.println(val2);
  // il faut un mode d'écriture
  aJsonObject *mod = aJson.getObjectItem(parametres, "mod");
  if(mod==NULL){
      // réponse d'erreur
      sendReponse(client, reponse(strId,"203",NULL));
      return;
  }
  
  char mod2[sizeof(mod->valuestring)];
  String(mod->valuestring).toCharArray(mod2, sizeof(mod2));
  
  // ce doit être a (analogique) ou b (binaire)
  if(strcmp(mod2,"b")!=0 && strcmp(mod2,"a")!=0){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"204",NULL));
    return;
  }
  // c'est bon pas d'erreur
  sendReponse(client,reponse(strId,"0",NULL));
  // suivi
  Serial.print(F("pw mod="));
  Serial.println(mod2);
  // on écrit sur la pin
  pinMode(pin2, OUTPUT);
  if(strcmp(mod2, "b")==0) digitalWrite(pin2, val2);
  else analogWrite(pin2, val2);
}
    
    //pinRead
void doPinRead(EthernetClient *client,char * strId, aJsonObject* parametres){
  // exploitation des parametres
  // il faut une pin
  aJsonObject *pin = aJson.getObjectItem(parametres, "pin");
  if(pin==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"302",NULL));
    return;
  }
  // numéro de la pin à lire
  int pin2 = pin->valueint;
  // suivi
  Serial.print(F("pr pin="));
  Serial.println(pin2);
  // il faut un mode d'écriture
  aJsonObject *mod = aJson.getObjectItem(parametres, "mod");
  if(mod==NULL){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"303",NULL));
    return;
  }
  char mod2[sizeof(mod->valuestring)];
  String(mod->valuestring).toCharArray(mod2, sizeof(mod2));
  
  // ce doit être a (analogique) ou b (binaire)
  if(strcmp(mod2,"a")!=0 && strcmp(mod2,"b")!=0){
    // réponse d'erreur
    sendReponse(client, reponse(strId,"304",NULL));
    return;
  }
  // c'est bon pas d'erreur
  // suivi
  Serial.print(F("pw mod="));
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

// envoi réponse
void sendReponse(EthernetClient *client, String message){
  // envoi de la réponse
  (*client).println(message);
  // suivi
  Serial.print(F("reponse="));
  Serial.println(message);
}


// mémoire libre
int freeRam ()
{
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
}
