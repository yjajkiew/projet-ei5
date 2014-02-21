//
//  Response.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/3/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "Response.h"

@implementation Response

@synthesize erreur, etat, ip, json;

-(id)initWithJson:(NSDictionary*)receivedJson {
    
    NSLog(@"json: %@", receivedJson);
    
    if(receivedJson == nil) { //reponse non nulle
        erreur = -1;
        ip = @"";
        json = @"";
        etat = @"";
        return self;
    }
    
    if([receivedJson valueForKey:@"message"] != [NSNull null] && [[receivedJson valueForKey:@"message"] length]) { //message erreur ?
        erreur = 900;
        json = [receivedJson valueForKey:@"message"];
        ip = @"";
        etat = @"";
        return self;
    }

    if([receivedJson valueForKey:@"erreur"] != [NSNull null]) erreur = [[receivedJson valueForKey:@"erreur"] intValue]; else erreur = 1000;
    
    if([receivedJson valueForKey:@"id"] != [NSNull null]) ip = [[receivedJson valueForKey:@"id"] description]; else ip = @"";
    
    if([receivedJson valueForKey:@"json"] != [NSNull null]) json = [receivedJson valueForKey:@"json"];
    else json = @"";
    
    NSMutableArray *etatArray = [[NSMutableArray alloc] init];
    if([receivedJson valueForKey:@"etat"] != [NSNull null]) {
        NSDictionary *dict = [receivedJson valueForKey:@"etat"];
        [dict enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop)
         {
             //etat = [etat stringByAppendingString:[NSString stringWithFormat:@"%@ = %@;", key, obj]];
             [etatArray addObject:[NSString stringWithFormat:@"%@=%@;", key, obj]];
         }];
        dict = nil;
    }
    etat = [etatArray componentsJoinedByString:@""];
    
    return self;
}

-(NSString*)description {
    return [NSString stringWithFormat:@"erreur:%d - etat: %@ - id: %@ - json: %@", erreur, etat, ip, json];
}

@end
