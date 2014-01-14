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
    erreur = [[receivedJson valueForKey:@"erreur"] intValue];
    ip = [[receivedJson valueForKey:@"id"] description];
    
    if([receivedJson valueForKey:@"json"] != [NSNull null]) json = [receivedJson valueForKey:@"json"];
    else json = @"";
    
    NSMutableArray *etatArray = [[NSMutableArray alloc] init];
    NSDictionary *dict = [receivedJson valueForKey:@"etat"];
    [dict enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop)
     {
         //etat = [etat stringByAppendingString:[NSString stringWithFormat:@"%@ = %@;", key, obj]];
         [etatArray addObject:[NSString stringWithFormat:@"%@ = %@;", key, obj]];
     }];
    dict = nil;
    etat = [etatArray componentsJoinedByString:@""];
    
    return self;
}

-(NSString*)description {
    return [NSString stringWithFormat:@"erreur:%d - etat: %@ - id: %@ - json: %@", erreur, etat, ip, json];
}

@end
